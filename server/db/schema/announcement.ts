import { relations } from "drizzle-orm";
import { pgEnum, pgTable, unique } from "drizzle-orm/pg-core";

import { hostel, room } from "./room";
import { admin, user } from "./user";

export const announcementPriorityEnum = pgEnum("announcement_priority", [
  "low",
  "medium",
  "high",
  "emergency",
]);

export const targetAudienceEnum = pgEnum("target_audience", [
  "all",
  "students",
  "admins",
  "hostel",
  "room",
  "user",
]);

export const announcement = pgTable("announcement", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  postedBy: t.integer().notNull().references(() => admin.id, { onDelete: "cascade" }),
  title: t.varchar({ length: 150 }).notNull(),
  content: t.text().notNull(),
  postedAt: t.timestamp().defaultNow().notNull(),
  priority: announcementPriorityEnum().default("medium").notNull(),
  targetAudience: targetAudienceEnum().default("all").notNull(),
  targetHostelId: t.integer().references(() => hostel.id, { onDelete: "cascade" }),
  targetRoomId: t.integer().references(() => room.id, { onDelete: "cascade" }),
  targetUserId: t.integer().references(() => user.id, { onDelete: "cascade" }),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const announcementReads = pgTable("announcement_reads", t => ({
  readId: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  announcementId: t.integer().notNull().references(() => announcement.id, { onDelete: "cascade" }),
  userId: t.integer().notNull().references(() => user.id, { onDelete: "cascade" }),
  readDate: t.timestamp().defaultNow().notNull(),
}), table => [
  unique("unique_announcement_student").on(table.announcementId, table.userId),
]);

export const announcementRelations = relations(announcement, ({ one, many }) => ({
  postedByAdmin: one(admin, {
    fields: [announcement.postedBy],
    references: [admin.id],
  }),
  targetHostel: one(hostel, {
    fields: [announcement.targetHostelId],
    references: [hostel.id],
  }),
  targetRoom: one(room, {
    fields: [announcement.targetRoomId],
    references: [room.id],
  }),
  targetUser: one(user, {
    fields: [announcement.targetUserId],
    references: [user.id],
  }),
  reads: many(announcementReads),
}));

export const announcementReadsRelations = relations(announcementReads, ({ one }) => ({
  announcement: one(announcement, {
    fields: [announcementReads.announcementId],
    references: [announcement.id],
  }),
  user: one(user, {
    fields: [announcementReads.userId],
    references: [user.id],
  }),
}));
