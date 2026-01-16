import type { Admin, AnnouncementInsert } from "~~/shared/types";
import type { sql } from "drizzle-orm";

import { useDB } from "~~/server/utils/db";
import { and, desc, eq, or } from "drizzle-orm";

import { announcement, announcementReads } from "../schema";

const announcementWithRelations = {
  orderBy: desc(announcement.postedAt),
  with: {
    postedByAdmin: {
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    },
    targetHostel: true,
    targetRoom: true,
    targetUser: {
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    },
  },
} as const;

type SQl = typeof sql;
type AnnouncementColumns = typeof announcement._.columns;

export async function announcementQueries() {
  const { db } = useDB();

  const createAnnouncement = async (data: AnnouncementInsert) => {
    const [newAnnouncement] = await db
      .insert(announcement)
      .values(data)
      .returning();
    return newAnnouncement;
  };

  const editAnnouncement = async (
    announcementId: number,
    admin: Admin,
    data: Partial<AnnouncementInsert>,
    resetReadStatus = false,
  ) => {
    const valuesToUpdate = {
      ...data,
      updatedAt: new Date(),
    };

    const whereClause = admin.accessLevel === "super"
      ? eq(announcement.id, announcementId)
      : and(
          eq(announcement.id, announcementId),
          eq(announcement.postedBy, admin.id),
        );

    const [updatedAnnouncement] = await db
      .update(announcement)
      .set(valuesToUpdate)
      .where(whereClause)
      .returning();

    if (updatedAnnouncement && resetReadStatus) {
      await db
        .delete(announcementReads)
        .where(eq(announcementReads.announcementId, announcementId));
    }

    return updatedAnnouncement;
  };

  const getAllAnnouncementsForAdmin = async (admin: Admin, userId: number) => {
    const queryOptions = {
      ...announcementWithRelations,
      orderBy: desc(announcement.postedAt),
      extras: (table: AnnouncementColumns, { sql }: { sql: SQl }) => ({
        isRead: sql<boolean>`EXISTS (
        SELECT 1 FROM ${announcementReads} ar
        WHERE ar.announcement_id = ${table.id}
        AND ar.user_id = ${userId}
      )`.as("is_read"),
      }),
    };

    if (admin.accessLevel === "super") {
      return await db
        .query
        .announcement
        .findMany(queryOptions);
    }

    if (!admin.hostelId) return [];

    return await db
      .query
      .announcement
      .findMany({
        ...queryOptions,
        where: eq(announcement.postedBy, admin.id),
      });
  };

  const getAnnouncementById = async (announcementId: number, userId: number) => {
    return await db
      .query
      .announcement
      .findFirst({
        ...announcementWithRelations,
        where: eq(announcement.id, announcementId),
        extras: (table, { sql }) => ({
          isRead: sql<boolean>`EXISTS (
        SELECT 1 FROM ${announcementReads} ar
        WHERE ar.announcement_id = ${table.id}
        AND ar.user_id = ${userId}
      )`.as("is_read"),
        }),
      });
  };

  const updateAnnouncementReadStatus = async (
    announcementId: number,
    userId: number,
    isRead: boolean,
  ) => {
    if (isRead) {
      await db
        .insert(announcementReads)
        .values({
          announcementId,
          userId,
        })
        .onConflictDoNothing();
    }
    else {
      await db
        .delete(announcementReads)
        .where(and(
          eq(announcementReads.announcementId, announcementId),
          eq(announcementReads.userId, userId),
        ));
    }
  };

  const getAllAnnouncementForStudent = async (
    userId: number,
    hostelId: number | null | undefined,
    roomId: number | null | undefined,
  ) => {
    const audienceFilters = [
      eq(announcement.targetAudience, "all"),
      eq(announcement.targetAudience, "students"),
      and(eq(announcement.targetAudience, "user"), eq(announcement.targetUserId, userId)),
    ];

    if (hostelId) {
      audienceFilters.push(
        and(eq(announcement.targetAudience, "hostel"), eq(announcement.targetHostelId, hostelId)),
      );
    }

    if (roomId) {
      audienceFilters.push(
        and(eq(announcement.targetAudience, "room"), eq(announcement.targetRoomId, roomId)),
      );
    }

    const result = await db.query.announcement.findMany({
      ...announcementWithRelations,
      where: or(...audienceFilters),
      orderBy: desc(announcement.postedAt),
      extras: (table, { sql }) => ({
        isRead: sql<boolean>`EXISTS (
        SELECT 1 FROM ${announcementReads} ar
        WHERE ar.announcement_id = ${table.id}
        AND ar.user_id = ${userId}
      )`.as("is_read"),
      }),
    });

    return result;
  };

  return {
    createAnnouncement,
    getAllAnnouncementsForAdmin,
    getAnnouncementById,
    updateAnnouncementReadStatus,
    editAnnouncement,
    getAllAnnouncementForStudent,
  };
}

type AnnouncementWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof announcementQueries>>["getAnnouncementById"]>>;

export type AnnouncementType = NonNullable<AnnouncementWithRelations>;
