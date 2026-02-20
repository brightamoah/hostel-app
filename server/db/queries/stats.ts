import type { Admin } from "~~/shared/types";

import { and, count, eq, gte, sql } from "drizzle-orm";

import {
  allocation,
  billing,
  complaint,
  maintenanceRequest,
  payment,
  room,
  student,
  visitor,
} from "../schema";

export async function statsQueries() {
  const { db } = useDB();

  const getCardStats = async (hostelId?: number | null) => {
    const roomCondition = hostelId ? eq(room.hostelId, hostelId) : undefined;
    const paymentHostelCondition = hostelId ? eq(billing.hostelId, hostelId) : undefined;

    // 1. Revenue (Current Month vs Last Month)
    const [revenue] = await db.select({
      currentMonth: sql<number>`COALESCE(SUM(CASE WHEN DATE_TRUNC('month', ${payment.paymentDate}) = DATE_TRUNC('month', CURRENT_DATE) THEN ${payment.amount} ELSE 0 END), 0)::float`,
      lastMonth: sql<number>`COALESCE(SUM(CASE WHEN DATE_TRUNC('month', ${payment.paymentDate}) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN ${payment.amount} ELSE 0 END), 0)::float`,
    })
      .from(payment)
      .leftJoin(billing, eq(payment.billingId, billing.id))
      .where(and(eq(payment.status, "completed"), paymentHostelCondition));

    // 2. Capacity & Rooms (Current State)
    const [capacity] = await db.select({
      totalCapacity: sql<number>`COALESCE(SUM(${room.capacity}), 0)::int`,
      currentOccupied: sql<number>`COALESCE(SUM(${room.currentOccupancy}), 0)::int`,
    })
      .from(room)
      .where(roomCondition);

    // 3. Allocations (Historical Residents for last month's comparison)
    const prevMonthDate = sql`CURRENT_DATE - INTERVAL '1 month'`;
    const [allocations] = await db.select({
      lastMonthActive: sql<number>`COALESCE(SUM(CASE WHEN ${allocation.allocationDate} <= ${prevMonthDate} AND (${allocation.endDate} IS NULL OR ${allocation.endDate} >= ${prevMonthDate}) THEN 1 ELSE 0 END), 0)::int`,
    })
      .from(allocation)
      .leftJoin(room, eq(allocation.roomId, room.id))
      .where(roomCondition);

    // Helper to calculate percentage safely
    const calcPercent = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const currentResidents = capacity?.currentOccupied;
    const previousResidents = allocations?.lastMonthActive;

    const currentAvailable = (capacity?.totalCapacity || 0) - (capacity?.currentOccupied || 0);
    const previousAvailable = (capacity?.totalCapacity || 0) - (previousResidents || 0);

    const currentOccupancyRate = capacity?.totalCapacity ? (capacity?.currentOccupied / capacity?.totalCapacity) * 100 : 0;
    const previousOccupancyRate = capacity?.totalCapacity ? ((previousResidents || 0) / capacity?.totalCapacity) * 100 : 0;

    return {
      totalResidents: {
        value: currentResidents,
        percentage: calcPercent((currentResidents || 0), (previousResidents || 0)),
      },
      occupancyRate: {
        value: Number(currentOccupancyRate.toFixed(1)),
        percentage: calcPercent(currentOccupancyRate, previousOccupancyRate),
        totalCapacity: capacity?.totalCapacity || 0,
        totalOccupied: capacity?.currentOccupied || 0,
      },
      availableBeds: {
        value: currentAvailable,
        percentage: calcPercent(currentAvailable, previousAvailable),
        totalCapacity: capacity?.totalCapacity || 0,
      },
      monthlyRevenue: {
        value: revenue?.currentMonth,
        percentage: calcPercent((revenue?.currentMonth || 0), (revenue?.lastMonth || 0)),
      },
    };
  };

  const getScopedDashboardStats = async (hostelId?: number | null) => {
    // Prepare conditions
    const hostelCondition = hostelId ? eq(room.hostelId, hostelId) : undefined;
    const billingHostelCondition = hostelId ? eq(billing.hostelId, hostelId) : undefined;
    const complaintHostelCondition = hostelId ? eq(complaint.hostelId, hostelId) : undefined;
    const maintenanceHostelCondition = hostelId ? eq(maintenanceRequest.hostelId, hostelId) : undefined;

    // Prepare date for trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Execute all queries in parallel
    const [
      occupancyData,
      financialData,
      outstandingData,
      issueData,
      maintenanceData,
      revenueTrend,
    ] = await Promise.all([
      // 1. Occupancy Stats
      db.select({
        totalCapacity: sql<number>`COALESCE(SUM(${room.capacity}), 0)::int`,
        currentOccupancy: sql<number>`COALESCE(SUM(${room.currentOccupancy}), 0)::int`,
        totalRooms: sql<number>`COUNT(*)::int`,
        vacantRooms: sql<number>`SUM(CASE WHEN ${room.status} = 'vacant' THEN 1 ELSE 0 END)::int`,
      })
        .from(room)
        .where(hostelCondition),

      // 2. Financial Stats - Revenue
      db.select({
        totalRevenue: sql<number>`COALESCE(SUM(${payment.amount}), 0)::float`,
      })
        .from(payment)
        .leftJoin(billing, eq(payment.billingId, billing.id))
        .where(and(
          eq(payment.status, "completed"),
          billingHostelCondition,
        )),

      // 3. Financial Stats - Outstanding
      db.select({
        totalOutstanding: sql<number>`COALESCE(SUM(${billing.amount} - ${billing.paidAmount}), 0)::float`,
        overdueAmount: sql<number>`COALESCE(SUM(CASE WHEN ${billing.status} = 'overdue' THEN (${billing.amount} - ${billing.paidAmount} + COALESCE(${billing.lateFee}, 0)) ELSE 0 END), 0)::float`,
      })
        .from(billing)
        .where(and(
          sql`${billing.status} IN ('unpaid', 'partially paid', 'overdue')`,
          billingHostelCondition,
        )),

      // 4. Operational Issues - Complaints
      db.select({
        pendingComplaints: sql<number>`SUM(CASE WHEN ${complaint.status} = 'pending' THEN 1 ELSE 0 END)::int`,
      })
        .from(complaint)
        .where(complaintHostelCondition),

      // 5. Operational Issues - Maintenance
      db.select({
        pendingMaintenance: sql<number>`SUM(CASE WHEN ${maintenanceRequest.status} = 'pending' THEN 1 ELSE 0 END)::int`,
      })
        .from(maintenanceRequest)
        .where(maintenanceHostelCondition),

      // 6. Revenue Trend
      db.select({
        month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${payment.paymentDate}), 'Mon YYYY')`,
        amount: sql<number>`COALESCE(SUM(${payment.amount}), 0)::float`,
        sortDate: sql<Date>`DATE_TRUNC('month', ${payment.paymentDate})`,
      })
        .from(payment)
        .leftJoin(billing, eq(payment.billingId, billing.id))
        .where(and(
          eq(payment.status, "completed"),
          gte(payment.paymentDate, sixMonthsAgo),
          billingHostelCondition,
        ))
        .groupBy(sql`DATE_TRUNC('month', ${payment.paymentDate})`)
        .orderBy(sql`DATE_TRUNC('month', ${payment.paymentDate})`),
    ]);

    return {
      occupancy: occupancyData[0],
      financial: { ...financialData[0], ...outstandingData[0] },
      operations: { ...issueData[0], ...maintenanceData[0] },
      revenueTrend: revenueTrend.map(t => ({ month: t.month, amount: t.amount })),
    };
  };

  const getDashboardStats = async (admin: Admin) => {
    // Define scope based on admin access level
    const hostelFilter = (table: any) =>
      admin.accessLevel === "super" ? undefined : eq(table.hostelId, admin.hostelId!);

    const [
      roomStats,
      studentStats,
      financialStats,
      [issueStats],
      visitorStats,
    ] = await Promise.all([
      // Room Occupancy
      db.select({
        total: count(room.id),
        occupied: count(sql`CASE WHEN ${room.currentOccupancy} > 0 THEN 1 END`),
        vacant: count(sql`CASE WHEN ${room.status} = 'vacant' THEN 1 END`),
        maintenance: count(sql`CASE WHEN ${room.status} = 'under maintenance' THEN 1 END`),
        capacity: sql<number>`sum(${room.capacity})`,
        currentOccupancy: sql<number>`sum(${room.currentOccupancy})`,
      })
        .from(room)
        .where(hostelFilter(room)),

      // Student Demographics
      db.select({
        total: count(student.id),
        active: count(sql`CASE WHEN ${student.residencyStatus} = 'active' THEN 1 END`),
        males: count(sql`CASE WHEN ${student.gender} = 'male' THEN 1 END`),
        females: count(sql`CASE WHEN ${student.gender} = 'female' THEN 1 END`),
      })
        .from(student), // Note: Student table might not have hostelId directly, usually linked via allocation
      // For simplicity in this example assuming global or joining with allocation if strict scoping needed

      // Financial (Revenue)
      db.select({
        totalExpected: sql<number>`sum(${billing.amount})`,
        totalCollected: sql<number>`sum(${billing.paidAmount})`,
        pending: sql<number>`sum(${billing.amount} - ${billing.paidAmount})`,
      })
        .from(billing)
        .where(and(
          hostelFilter(billing),
          eq(billing.status, "unpaid"), // or logic for pending
        )),

      // Maintenance & Complaints
      db.select({
        openMaintenance: count(sql`CASE WHEN ${maintenanceRequest.status} IN ('pending', 'in-progress', 'assigned') THEN 1 END`),
        openComplaints: count(sql`CASE WHEN ${complaint.status} IN ('pending', 'in-progress') THEN 1 END`),
        criticalMaintenance: count(sql`CASE WHEN ${maintenanceRequest.priority} = 'emergency' AND ${maintenanceRequest.status} != 'completed' THEN 1 END`),
      })
        .from(maintenanceRequest)
        .leftJoin(complaint, eq(maintenanceRequest.hostelId, complaint.hostelId)), // Approximate join for single query, better to split if huge            // actually better to run separate simple counts or promise.all them

      // Visitors (Today)
      db.select({
        active: count(sql`CASE WHEN ${visitor.status} = 'checked-in' THEN 1 END`),
        pending: count(sql`CASE WHEN ${visitor.status} = 'pending' THEN 1 END`),
      })
        .from(visitor)
        .where(hostelFilter(visitor)),
    ]);

    // Re-query maintenance/complaints cleanly if the join above is messy
    const maintenanceCount = await db
      .select({ count: count() })
      .from(maintenanceRequest)
      .where(and(hostelFilter(maintenanceRequest), sql`${maintenanceRequest.status} != 'completed'`));

    const complaintCount = await db
      .select({ count: count() })
      .from(complaint)
      .where(and(hostelFilter(complaint), sql`${complaint.status} != 'resolved'`));

    return {
      occupancy: {
        total: Number(roomStats[0]?.total || 0),
        occupied: Number(roomStats[0]?.occupied || 0),
        vacant: Number(roomStats[0]?.vacant || 0),
        rate: roomStats[0]?.capacity ? (Number(roomStats[0].currentOccupancy) / Number(roomStats[0].capacity)) * 100 : 0,
      },
      students: studentStats[0],
      finance: {
        expected: Number(financialStats[0]?.totalExpected || 0),
        collected: Number(financialStats[0]?.totalCollected || 0),
        pending: Number(financialStats[0]?.pending || 0),
      },
      tasks: {
        maintenance: maintenanceCount[0]?.count || 0,
        complaints: complaintCount[0]?.count || 0,
      },
      visitors: visitorStats[0],
      issues: issueStats,
    };
  };

  return {
    getDashboardStats,
    getScopedDashboardStats,
    getCardStats,
  };
}
