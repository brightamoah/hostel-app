import type { Admin, MaintenanceStatus } from "~~/shared/types";

import { and, count, countDistinct, desc, eq, sql } from "drizzle-orm";

import { maintenanceRequest, maintenanceResponse } from "../schema";

const maintenanceWithRelations = {
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
      orderBy: desc(maintenanceResponse.responseDate),
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

  const findMaintenanceRequestById = async (id: number) => {
    return db.query.maintenanceRequest.findFirst({
      where: eq(maintenanceRequest.id, id),
    });
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

  const updateStatusAndAddResponse = async (
    maintenanceId: number,
    adminId: number,
    status: MaintenanceStatus,
    responseText: string,
    hostelId?: number,
  ) => {
    return db
      .transaction(async (tx) => {
        const whereClause = hostelId
          ? and(eq(maintenanceRequest.id, maintenanceId), eq(maintenanceRequest.hostelId, hostelId))
          : eq(maintenanceRequest.id, maintenanceId);

        const [updatedRequest] = await tx
          .update(maintenanceRequest)
          .set({
            status,
            resolutionDate: status === "completed" ? new Date() : null,
          })
          .where(whereClause)
          .returning();

        const [newResponse] = await tx
          .insert(maintenanceResponse)
          .values({
            maintenanceRequestId: maintenanceId,
            responderId: adminId,
            responseText,
          })
          .returning();

        return { updatedRequest, newResponse };
      });
  };

  const addMaintenanceResponse = async (
    maintenanceId: number,
    responderId: number,
    responseText: string,
  ) => {
    const [newResponse] = await db
      .insert(maintenanceResponse)
      .values({
        maintenanceRequestId: maintenanceId,
        responderId,
        responseText,
      })
      .returning();

    return newResponse;
  };

  return {
    getAllMaintenanceRequests,
    getMaintenanceById,
    getMaintenanceStatusCount,
    updateStatusAndAddResponse,
    addMaintenanceResponse,
    findMaintenanceRequestById,
  };
}

type MaintenanceWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof maintenanceQueries>>["getMaintenanceById"]>>;
export type Maintenance = NonNullable<MaintenanceWithRelations>;
