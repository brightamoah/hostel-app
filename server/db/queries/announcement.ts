import type { Admin, AnnouncementInsert } from "~~/shared/types";

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

export async function announcementQueries() {
  const { db } = useDB();

  const createAnnouncement = async (data: AnnouncementInsert) => {
    const [newAnnouncement] = await db
      .insert(announcement)
      .values(data)
      .returning();
    return newAnnouncement;
  };

  const editAnnouncement = async (announcementId: number, admin: Admin, data: Partial<AnnouncementInsert>, resetReadStatus = false) => {
    const valuesToUpdate = {
      ...data,
      updatedAt: new Date(),
    };

    if (resetReadStatus) valuesToUpdate.isRead = false;

    if (admin.accessLevel === "super") {
      const [updatedAnnouncement] = await db
        .update(announcement)
        .set(valuesToUpdate)
        .where(eq(announcement.id, announcementId))
        .returning();
      return updatedAnnouncement;
    }

    const [updatedAnnouncement] = await db
      .update(announcement)
      .set(valuesToUpdate)
      .where(and(
        eq(announcement.id, announcementId),
        eq(announcement.postedBy, admin.id),
      ))
      .returning();
    return updatedAnnouncement;
  };

  const getAllAnnouncementsForAdmin = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db
        .query
        .announcement
        .findMany(announcementWithRelations);
    }

    if (!admin.hostelId) return [];

    return await db
      .query
      .announcement
      .findMany({
        ...announcementWithRelations,
        where: eq(announcement.postedBy, admin.id),
      });
  };

  const getAnnouncementById = async (announcementId: number) => {
    return await db
      .query
      .announcement
      .findFirst({
        ...announcementWithRelations,
        where: eq(announcement.id, announcementId),
      });
  };

  const updateAnnouncementReadStatus = async (announcementId: number, isRead: boolean) => {
    return await db
      .update(announcement)
      .set({
        isRead,
        updatedAt: new Date(),
      })
      .where(eq(announcement.id, announcementId))
      .returning();
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
      with: {
        ...announcementWithRelations.with,
        reads: {
          where: eq(announcementReads.userId, userId),
          limit: 1,
          columns: { readId: true },
        },
      },
      where: or(...audienceFilters),
      orderBy: desc(announcement.postedAt),
    });

    return result.map(announcement => ({
      ...announcement,
      isRead: announcement.reads.length > 0,
    }));
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
