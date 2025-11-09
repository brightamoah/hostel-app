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

    if (visitorToUpdate && visitorToUpdate.status !== "pending") {
      throw createError({
        statusCode: 400,
        message: `This visit has already been ${visitorToUpdate.status}.`,
      });
    }

    const [updatedVisitor] = await db
      .update(visitor)
      .set({ status, adminId: admin.id })
      .where(eq(visitor.id, visitorId))
      .returning();
    return updatedVisitor;
  };

  const createVisitorLog = async (visitorId: number, action: VisitorLog["action"], admin: Admin) => {
    const visitor = await getVisitorById(visitorId, admin);

    if (!visitor) {
      throw createError({
        statusCode: 404,
        message: "Visitor not found.",
      });
    }

    if (action === "check_in") {
      if (visitor.status !== "approved") {
        throw createError({
          statusCode: 400,
          message: "This visitor has not been approved.",
        });
      }

      const today = new Date().toISOString().split("T")[0];
      if (visitor.visitDate !== today) {
        throw createError({
          statusCode: 400,
          message: `This visitor is only scheduled for ${visitor.visitDate}.`,
        });
      }

      const lastLog = visitor.visitorLogs[0];
      if (lastLog && lastLog.action === "check_in") {
        throw createError({
          statusCode: 400,
          message: "This visitor is already checked in.",
        });
      }
    }
    else {
      const lastLog = visitor.visitorLogs[0];
      if (!lastLog || lastLog.action === "check_out") {
        throw createError({
          statusCode: 400,
          message: "This visitor is not currently checked in.",
        });
      }
    };

    const [newLog] = await db
      .insert(visitorLogs)
      .values({
        visitorId,
        adminId: admin.id,
        action,
      })
      .returning();

    return newLog;
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
