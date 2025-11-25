import type { Admin } from "~~/shared/types";

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

    if (!admin.hostelId)
      return [];

    return await db
      .query
      .complaint
      .findMany({
        ...complaintWithRelations,
        where: eq(complaint.hostelId, admin.hostelId),
        orderBy: desc(complaint.createdAt),
      });
  };

  const getComplaintsById = async (complaintId: number, admin: Admin) => {
    const whereConditions = [eq(complaint.id, complaintId)];

    if (admin.accessLevel !== "super") {
      whereConditions.push(eq(complaint.hostelId, admin.hostelId!));
    }

    const complaintRecord = await db.query.complaint.findFirst({
      ...complaintWithRelations,
      where: and(...whereConditions),
    });

    return complaintRecord;
  };

  const getComplaintStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) {
        return { pending: 0, inProgress: 0, resolved: 0 };
      }
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

  return {
    getAllComplaints,
    getComplaintsById,
    getComplaintStatusCount,
  };
}

type ComplaintWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof complaintQueries>>["getComplaintsById"]>>;

export type ComplaintType = NonNullable<ComplaintWithRelations>;
