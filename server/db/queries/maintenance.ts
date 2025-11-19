import type { Admin } from "~~/shared/types";

import { and, count, countDistinct, desc, eq, sql } from "drizzle-orm";

import { maintenanceRequest, maintenanceResponse } from "../schema";

const maintenanceWithRelations = {
  with: {
    student: {
      with: {
        user: {
          columns:{
            name: true,
            email: true
          }
        },
      },
    },
    room: true,
    hostel: true,
    responses: {
      orderBy: desc(maintenanceResponse.responseDate),
    },
  },
} as const;

export async function maintenanceQueries() {
  const { db } = useDB();

  const getAllMaintenanceRequests = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db.query.maintenanceRequest.findMany({
        ...maintenanceWithRelations,
        orderBy: desc(maintenanceRequest.requestDate),
      });
    }

    if (!admin.hostelId)
      return [];

    return await db.query.maintenanceRequest.findMany({
      ...maintenanceWithRelations,
      where: eq(maintenanceRequest.hostelId, admin.hostelId),
      orderBy: desc(maintenanceRequest.requestDate),
    });
  };

  const getMaintenanceById = async (id: number, admin: Admin) => {
    const whereConditions = [eq(maintenanceRequest.id, id)];

    if (admin.accessLevel !== "super") {
      whereConditions.push(eq(maintenanceRequest.hostelId, admin.hostelId!));
    }

    const maintenanceRecord = await db.query.maintenanceRequest.findFirst({
      ...maintenanceWithRelations,
      where: and(...whereConditions),
    });

    return maintenanceRecord;
  };

  const getMaintenanceStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) {
        return {
          assigned: 0,
          inProgress: 0,
          pending: 0,
          completed: 0,
          rejected: 0,
        };
      }
      whereConditions.push(eq(maintenanceRequest.hostelId, admin.hostelId));
    }

    const [result] = await db
      .select({
        totalMaintenance: countDistinct(maintenanceRequest.id),
        inProgress: count(sql`CASE WHEN ${maintenanceRequest.status} = 'in-progress' THEN 1 END`),
        assigned: count(sql`CASE WHEN ${maintenanceRequest.status} = 'assigned' THEN 1 END`),
        pending: count(sql`CASE WHEN ${maintenanceRequest.status} = 'pending' THEN 1 END`),
        completed: count(sql`CASE WHEN ${maintenanceRequest.status} = 'completed' THEN 1 END`),
        rejected: count(sql`CASE WHEN ${maintenanceRequest.status} = 'rejected' THEN 1 END`),
      })
      .from(maintenanceRequest)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return {
      totalMaintenance: result?.totalMaintenance,
      inProgress: result?.inProgress,
      assigned: result?.assigned,
      pending: result?.pending,
      completed: result?.completed,
      rejected: result?.rejected,
    };
  };

  return {
    getAllMaintenanceRequests,
    getMaintenanceById,
    getMaintenanceStatusCount,
  };
}

type MaintenanceWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof maintenanceQueries>>["getMaintenanceById"]>>;
export type Maintenance = NonNullable<MaintenanceWithRelations>;
