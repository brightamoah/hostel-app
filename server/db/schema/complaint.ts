import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";

import { hostel, room } from "./room";
import { student, user } from "./user";

export const complaintTypeEnum = pgEnum("complaint_type", [
  "room condition",
  "staff behavior",
  "amenities",
  "noise",
  "security",
  "billing issue",
  "other",
]);

export const complaintStatusEnum = pgEnum("complaint_status", [
  "pending",
  "in-progress",
  "resolved",
  "rejected",
]);

export const complaintPriorityEnum = pgEnum("complaint_priority", ["low", "medium", "high", "emergency"]);

export const complaintActionTakenEnum = pgEnum("complaint_action_taken", ["assigned", "updated", "resolved", "rejected"]);

export const complaint = pgTable("complaint", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  roomId: t.integer().notNull().references(() => room.id, { onDelete: "cascade" }),
  hostelId: t.integer().notNull().references(() => hostel.id, { onDelete: "cascade" }),
  description: t.text().notNull(),
  type: complaintTypeEnum().notNull(),
  priority: complaintPriorityEnum().default("medium").notNull(),
  status: complaintStatusEnum().default("pending").notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  resolvedAt: t.timestamp(),
  resolvedBy: t.integer(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const complaintResponse = pgTable("complaint_response", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  complaintId: t.integer().notNull().references(() => complaint.id, { onDelete: "cascade" }),
  responderId: t.integer().notNull().references(() => user.id, { onDelete: "cascade" }),
  response: t.text().notNull(),
  actionTaken: complaintActionTakenEnum().notNull(),
  responseDate: t.timestamp().defaultNow().notNull(),
}));

export const complaintRelations = relations(complaint, ({ one, many }) => ({
  student: one(student, {
    fields: [complaint.studentId],
    references: [student.id],
  }),
  room: one(room, {
    fields: [complaint.roomId],
    references: [room.id],
  }),
  hostel: one(hostel, {
    fields: [complaint.hostelId],
    references: [hostel.id],
  }),
  responses: many(complaintResponse),
}));

export const complaintResponseRelations = relations(complaintResponse, ({ one }) => ({
  complaint: one(complaint, {
    fields: [complaintResponse.complaintId],
    references: [complaint.id],
  }),
  responder: one(user, { // The user (admin/staff) who responded
    fields: [complaintResponse.responderId],
    references: [user.id],
  }),
}));
