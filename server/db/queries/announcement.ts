import { desc, eq } from "drizzle-orm";

import { announcement } from "../schema";

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

  const getAllAnnouncementsForAdmin = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db
        .query
        .announcement
        .findMany(announcementWithRelations);
    }

    if (!admin.hostelId)
      return [];

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

  return {
    createAnnouncement,
    getAllAnnouncementsForAdmin,
    getAnnouncementById,
    updateAnnouncementReadStatus,
  };
}

type AnnouncementWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof announcementQueries>>["getAnnouncementById"]>>;

export type AnnouncementType = NonNullable<AnnouncementWithRelations>;
