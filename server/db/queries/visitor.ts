import { and, count, desc, eq, sql } from "drizzle-orm";

import { allocation, visitor, visitorLogs } from "../schema";

const visitorWithRelations = {
  with: {
    student: {
      columns: {
        phoneNumber: true,
      },
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            image: true,
          },
        },
        allocations: {
          where: eq(allocation.status, "active"),
          with: {
            room: {
              columns: {
                roomNumber: true,
                building: true,
                roomType: true,
              },
              with: {
                hostel: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    hostel: {
      columns: {
        name: true,
      },
    },
    visitorLogs: {
      orderBy: desc(visitorLogs.timestamp),
      with: {
        admin: {
          columns: {},
          with: {
            user: {
              columns: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    },
    admin: {
      columns: {},
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    },
  },
} as const;

export async function visitorQueries() {
  const { db } = useDB();

  const getScopedVisitors = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db.query.visitor.findMany({
        ...visitorWithRelations,
        orderBy: desc(visitor.visitDate),
      });
    }

    if (!admin.hostelId)
      return [];

    return await db.query.visitor.findMany({
      ...visitorWithRelations,
      where: eq(visitor.hostelId, admin.hostelId),
      orderBy: desc(visitor.visitDate),
    });
  };

  const getVisitorById = async (visitorId: number, admin: Admin) => {
    const whereConditions = [eq(visitor.id, visitorId)];

    if (admin.accessLevel !== "super") {
      whereConditions.push(eq(visitor.hostelId, admin.hostelId!));
    }

    const visitorRecord = await db.query.visitor.findFirst({
      ...visitorWithRelations,
      where: and(...whereConditions),
    });

    return visitorRecord;
  };

  const updateVisitorStatus = async (visitorId: number, status: "approved" | "denied", admin: Admin) => {
    const visitorToUpdate = await getVisitorById(visitorId, admin);

    if (!visitorToUpdate) {
      throw createError({
        statusCode: 404,
        message: "Visitor not found or you do not have permission to access it.",
      });
    }

    if (visitorToUpdate.status !== "pending") {
      throw createError({
        statusCode: 400,
        message: `This visit cannot be modified as it is already '${visitorToUpdate.status}'`,
      });
    }

    const [updatedVisitor] = await db
      .update(visitor)
      .set({ status, adminId: admin.id })
      .where(eq(visitor.id, visitorId))
      .returning();

    if (!updatedVisitor) {
      throw createError({
        statusCode: 500,
        message: "Failed to update visitor status.",
      });
    }

    return updatedVisitor;
  };

  const createVisitorLog = async (visitorId: number, action: VisitorLog["action"], admin: Admin) => {
    return await db.transaction(async (tx) => {
      const visitorRecord = await getVisitorById(visitorId, admin);

      if (!visitorRecord) {
        throw createError({
          statusCode: 404,
          message: "Visitor not found.",
        });
      }

      if (admin.accessLevel !== "super" && visitorRecord.hostelId !== admin.hostelId) {
        throw createError({
          statusCode: 403,
          message: "You do not have permission to modify visitors for this hostel.",
        });
      }

      const lastLog = visitorRecord.visitorLogs[0];

      if (action === "check_in") {
        if (!["approved", "checked-out"].includes(visitorRecord.status)) {
          throw createError({
            statusCode: 400,
            message: `Cannot check in. Visitor status is currently '${visitorRecord.status}'.`,
          });
        }

        const today = new Date().toISOString().split("T")[0];
        if (visitorRecord.visitDate !== today) {
          throw createError({
            statusCode: 400,
            message: `This visitor is only scheduled for ${visitorRecord.visitDate}, not today.`,
          });
        }

        if (lastLog && lastLog.action === "check_in") {
          throw createError({
            statusCode: 409,
            message: "This visitor is already checked in.",
          });
        }

        await tx
          .update(visitor)
          .set({ status: "checked-in" })
          .where(eq(visitor.id, visitorId));
      }
      else {
        if (visitorRecord.status !== "checked-in") {
          throw createError({
            statusCode: 400,
            message: "This visitor is not currently checked in.",
          });
        }

        if (!lastLog || lastLog.action === "check_out") {
          throw createError({
            statusCode: 409,
            message: "Cannot check out a visitor who is not checked in.",
          });
        }

        await tx
          .update(visitor)
          .set({ status: "checked-out" })
          .where(eq(visitor.id, visitorId));
      };

      const [newLog] = await tx
        .insert(visitorLogs)
        .values({
          visitorId,
          adminId: admin.id,
          action,
        })
        .returning();

      return newLog;
    });
  };

  const getVisitorStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) {
        return { approved: 0, checkedIn: 0, pending: 0 };
      }
      whereConditions.push(eq(visitor.hostelId, admin.hostelId));
    }

    const [result] = await db
      .select({
        totalVisitors: count(visitor.id),
        approved: count(sql`CASE WHEN ${visitor.status} = 'approved' THEN 1 END`),
        checkedIn: count(sql`CASE WHEN ${visitor.status} = 'checked-in' THEN 1 END`),
        pending: count(sql`CASE WHEN ${visitor.status} = 'pending' THEN 1 END`),
      })
      .from(visitor)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return {
      totalVisitors: result?.totalVisitors,
      approved: result?.approved,
      checkedIn: result?.checkedIn,
      pending: result?.pending,
    };
  };

  return {
    getScopedVisitors,
    getVisitorById,
    updateVisitorStatus,
    createVisitorLog,
    getVisitorStatusCount,
  };
}

// export type Visitor = NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof visitorQueries>>["getVisitorById"]>>>;

type VisitorWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof visitorQueries>>["getVisitorById"]>>;
export type Visitor = NonNullable<VisitorWithRelations>;
