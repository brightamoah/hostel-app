import type { Admin, ComplaintActionTaken, ComplaintStatus } from "~~/shared/types";

import { useDB } from "~~/server/utils/db";
import { and, countDistinct, desc, eq, sql } from "drizzle-orm";

import { complaint, complaintResponse } from "../schema";

const complaintWithRelations = {
  with: {
    student: {
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    },
    room: true,
    hostel: true,
    responses: {
      orderBy: desc(complaintResponse.responseDate),
      with: {
        responder: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    },
  },
} as const;

export async function complaintQueries() {
  const { db } = useDB();

  const getAllComplaints = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db
        .query
        .complaint
        .findMany({
          ...complaintWithRelations,
          orderBy: desc(complaint.createdAt),
        });
    }

    if (!admin.hostelId) return [];

    return await db
      .query
      .complaint
      .findMany({
        ...complaintWithRelations,
        where: eq(complaint.hostelId, admin.hostelId),
        orderBy: desc(complaint.createdAt),
      });
  };

  const getComplaintById = async (complaintId: number, admin: Admin) => {
    const whereConditions = [eq(complaint.id, complaintId)];

    if (admin.accessLevel !== "super") whereConditions.push(eq(complaint.hostelId, admin.hostelId!));

    const complaintRecord = await db.query.complaint.findFirst({
      ...complaintWithRelations,
      where: and(...whereConditions),
    });

    return complaintRecord;
  };

  const getComplaintStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) return { pending: 0, inProgress: 0, resolved: 0 };

      whereConditions.push(eq(complaint.hostelId, admin.hostelId));
    }

    const [result] = await db
      .select({
        totalComplaints: countDistinct(complaint.id),
        pending: countDistinct(sql`CASE WHEN ${complaint.status} = 'pending' THEN ${complaint.id} END`),
        inProgress: countDistinct(sql`CASE WHEN ${complaint.status} = 'in-progress' THEN ${complaint.id} END`),
        resolved: countDistinct(sql`CASE WHEN ${complaint.status} = 'resolved' THEN ${complaint.id} END`),

      })
      .from(complaint)
      .where(and(...whereConditions));

    return {
      totalComplaints: result?.totalComplaints,
      totalPending: result?.pending,
      totalInProgress: result?.inProgress,
      totalResolved: result?.resolved,
    };
  };

  const actionTakenMap: Record<ComplaintStatus, ComplaintActionTaken> = {
    "pending": "updated",
    "in-progress": "updated",
    "resolved": "resolved",
    "rejected": "rejected",
  };

  const updateStatusAndAddResponse = async (
    complaintId: number,
    adminId: number,
    status: ComplaintStatus,
    responseText: string,
    hostelId?: number,
  ) => {
    return db.transaction(async (tx) => {
      const whereClause = hostelId
        ? and(eq(complaint.id, complaintId), eq(complaint.hostelId, hostelId))
        : eq(complaint.id, complaintId);

      const [updatedComplaint] = await tx
        .update(complaint)
        .set({
          status,
          resolvedAt: status === "resolved" ? new Date() : null,
          resolvedBy: status === "resolved" ? adminId : null,
        })
        .where(whereClause)
        .returning();

      const [newResponse] = await tx
        .insert(complaintResponse)
        .values({
          complaintId,
          responderId: adminId,
          response: responseText,
          actionTaken: actionTakenMap[status],
        })
        .returning();

      return { updatedComplaint, newResponse };
    });
  };

  const addComplaintResponse = async (
    complaintId: number,
    responderId: number,
    response: string,
  ) => {
    const [newResponse] = await db
      .insert(complaintResponse)
      .values({
        complaintId,
        responderId,
        response,
        actionTaken: "updated",
      })
      .returning();
    return newResponse;
  };

  const getComplaintByIdNoScope = async (complaintId: number) => {
    return await db.query.complaint.findFirst({
      where: eq(complaint.id, complaintId),
    });
  };

  const getStudentComplaints = async (studentId: number) => {
    const complaints = await db
      .query
      .complaint
      .findMany({
        ...complaintWithRelations,
        where: eq(complaint.studentId, studentId),
        orderBy: desc(complaint.createdAt),
      });

    const [count] = await db
      .select({
        totalComplaints: countDistinct(complaint.id),
        pending: countDistinct(sql`CASE WHEN ${complaint.status} = 'pending' THEN ${complaint.id} END`),
        inProgress: countDistinct(sql`CASE WHEN ${complaint.status} = 'in-progress' THEN ${complaint.id} END`),
        resolved: countDistinct(sql`CASE WHEN ${complaint.status} = 'resolved' THEN ${complaint.id} END`),
      })
      .from(complaint)
      .where(eq(complaint.studentId, studentId));

    return {
      complaints,
      totalComplaints: count?.totalComplaints,
      totalPending: count?.pending,
      totalInProgress: count?.inProgress,
      totalResolved: count?.resolved,
    };
  };

  return {
    getAllComplaints,
    getComplaintById,
    getComplaintStatusCount,
    updateStatusAndAddResponse,
    addComplaintResponse,
    getComplaintByIdNoScope,
    getStudentComplaints,
  };
}

type ComplaintWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof complaintQueries>>["getComplaintById"]>>;

export type ComplaintType = NonNullable<ComplaintWithRelations>;
