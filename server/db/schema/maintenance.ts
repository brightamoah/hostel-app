import { sql } from "drizzle-orm";
import { check, pgEnum, pgTable } from "drizzle-orm/pg-core";

import { hostel, room } from "./room";
import { student, user } from "./user";

export const maintenanceIssueTypeEnum = pgEnum("maintenance_issue_type", [
  "plumbing",
  "electrical",
  "furniture",
  "cleaning",
  "appliance",
  "structural",
  "pest control",
  "internet/Wi-Fi",
  "other",
]);

export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
  "low",
  "medium",
  "high",
  "emergency",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "pending",
  "assigned",
  "in-progress",
  "completed",
  "rejected",
]);

export const maintenanceRequest = pgTable("maintenance_request", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  roomId: t.integer().notNull().references(() => room.id, { onDelete: "cascade" }),
  hostelId: t.integer().notNull().references(() => hostel.id, { onDelete: "restrict" }),
  issueType: maintenanceIssueTypeEnum().notNull(),
  description: t.text().notNull(),
  requestDate: t.timestamp().defaultNow().notNull(),
  priority: maintenancePriorityEnum().default("medium").notNull(),
  status: maintenanceStatusEnum().default("pending").notNull(),
  assignedTo: t.integer(),
  resolutionDate: t.timestamp(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));

export const maintenanceResponse = pgTable("maintenance_response", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  maintenanceRequestId: t.integer().notNull().references(() => maintenanceRequest.id, { onDelete: "cascade" }),
  responderId: t.integer().notNull().references(() => user.id, { onDelete: "cascade" }),
  responseText: t.text().notNull(),
  responseDate: t.timestamp().defaultNow().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}), () => [
  check("chk_response_text", sql`char_length(response_text) > 0`),
]);
