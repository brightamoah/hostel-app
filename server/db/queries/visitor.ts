import type { Admin, VisitorCreate } from "~~/shared/types";

import { useDB } from "~~/server/utils/db";
import { and, count, desc, eq, inArray, or, sql } from "drizzle-orm";

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
        allocation: {
          where: or(eq(allocation.status, "active"), eq(allocation.status, "pending")),
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

  const getVisitorsForSuperAdmin = async () => {
    return await db.query.visitor.findMany({
      ...visitorWithRelations,
      orderBy: desc(visitor.visitDate),
    });
  };

  const getVisitorsForRegularAdmin = async (admin: Admin) => {
    if (!admin.hostelId) return [];

    return await db.query.visitor.findMany({
      ...visitorWithRelations,
      where: eq(visitor.hostelId, admin.hostelId),
      orderBy: desc(visitor.visitDate),
    });
  };

  const getScopedVisitors = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db.query.visitor.findMany({
        ...visitorWithRelations,
        orderBy: desc(visitor.visitDate),
      });
    }

    if (!admin.hostelId) return [];

    return await db.query.visitor.findMany({
      ...visitorWithRelations,
      where: eq(visitor.hostelId, admin.hostelId),
      orderBy: desc(visitor.visitDate),
    });
  };

  const getVisitorById = async (visitorId: number, admin: Admin) => {
    const whereConditions = [eq(visitor.id, visitorId)];

    if (admin.accessLevel !== "super") whereConditions.push(eq(visitor.hostelId, admin.hostelId!));

    const visitorRecord = await db.query.visitor.findFirst({
      ...visitorWithRelations,
      where: and(...whereConditions),
    });

    return visitorRecord;
  };

  const getVisitorStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) return { approved: 0, checkedIn: 0, pending: 0 };

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

  const getVisitorByIds = async (visitorIds: number[]) => {
    const visitors = await db
      .query
      .visitor
      .findMany({
        where: inArray(visitor.id, visitorIds),
        ...visitorWithRelations,
      });
    return visitors;
  };

  const deleteVisitorsByIds = async (visitorIds: number[]) => {
    if (visitorIds.length === 0) return [];

    const deleteResult = await db
      .delete(visitor)
      .where(inArray(visitor.id, visitorIds))
      .returning();
    return deleteResult;
  };

  const getVisitorsForStudent = async (studentId: number) => {
    return await db.query.visitor.findMany({
      where: eq(visitor.studentId, studentId),
      ...visitorWithRelations,
      orderBy: desc(visitor.visitDate),
    });
  };

  const getVisitorStatusCountForStudent = async (studentId: number) => {
    const [result] = await db
      .select({
        totalVisitors: count(visitor.id),
        approved: count(sql`CASE WHEN ${visitor.status} = 'approved' THEN 1 END`),
        checkedIn: count(sql`CASE WHEN ${visitor.status} = 'checked-in' THEN 1 END`),
        pending: count(sql`CASE WHEN ${visitor.status} = 'pending' THEN 1 END`),
      })
      .from(visitor)
      .where(eq(visitor.studentId, studentId));

    return {
      totalVisitors: result?.totalVisitors,
      approved: result?.approved,
      checkedIn: result?.checkedIn,
      pending: result?.pending,
    };
  };

  const getVisitorForStudentById = (visitorId: number) => {
    return db.query.visitor.findFirst({
      ...visitorWithRelations,
      where: eq(visitor.id, visitorId),
    });
  };

  const createVisitor = async (data: VisitorCreate) => {
    const [newVisitor] = await db
      .insert(visitor)
      .values(data)
      .returning();
    return newVisitor;
  };

  const updateVisitor = async (visitorId: number, data: InsertEditVisitor) => {
    const [updatedVisitor] = await db
      .update(visitor)
      .set(data)
      .where(eq(visitor.id, visitorId))
      .returning();
    return updatedVisitor;
  };

  return {
    getScopedVisitors,
    getVisitorById,
    getVisitorByIds,
    getVisitorStatusCount,
    getVisitorsForSuperAdmin,
    getVisitorsForRegularAdmin,
    deleteVisitorsByIds,
    getVisitorsForStudent,
    getVisitorStatusCountForStudent,
    getVisitorForStudentById,
    createVisitor,
    updateVisitor,
  };
}

// export type Visitor = NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof visitorQueries>>["getVisitorById"]>>>;

type VisitorWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof visitorQueries>>["getVisitorById"]>>;
export type Visitor = NonNullable<VisitorWithRelations>;
