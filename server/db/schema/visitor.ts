import { relations, sql } from "drizzle-orm";
import { check, pgEnum, pgTable } from "drizzle-orm/pg-core";

import { hostel } from "./room";
import { admin, student } from "./user";

export const visitorStatusEnum = pgEnum("visitor_status", [
  "checked-in",
  "checked-out",
  "pending",
  "cancelled",
  "denied",
  "approved",
]);

export const visitorLogActionEnum = pgEnum("visitor_log_action", [
  "check_in",
  "check_out",
]);

export const visitor = pgTable("visitor", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  hostelId: t.integer().notNull().references(() => hostel.id, { onDelete: "cascade" }),
  adminId: t.integer().references(() => admin.id, { onDelete: "set null" }),
  name: t.text().notNull(),
  email: t.text().notNull(),
  phoneNumber: t.text().notNull(),
  visitDate: t.date().notNull(),
  relationship: t.text().notNull(),
  purpose: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  status: visitorStatusEnum().default("pending").notNull(),
}), () => [
  check("chk_visit_date", sql`"visit_date" >= CURRENT_DATE`),
]);

export const visitorLogs = pgTable("visitor_logs", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  visitorId: t.integer().notNull().references(() => visitor.id, { onDelete: "cascade" }),
  adminId: t.integer().notNull().references(() => admin.id, { onDelete: "set null" }),
  action: visitorLogActionEnum().notNull(),
  timestamp: t.timestamp().defaultNow().notNull(),
}));

export const visitorRelations = relations(visitor, ({ one, many }) => ({
  student: one(student, {
    fields: [visitor.studentId],
    references: [student.id],
  }),
  hostel: one(hostel, {
    fields: [visitor.hostelId],
    references: [hostel.id],
  }),
  admin: one(admin, {
    fields: [visitor.adminId],
    references: [admin.id],
  }),
  visitorLogs: many(visitorLogs),
}));

export const visitorLogsRelations = relations(visitorLogs, ({ one }) => ({
  visitor: one(visitor, {
    fields: [visitorLogs.visitorId],
    references: [visitor.id],
  }),
  admin: one(admin, {
    fields: [visitorLogs.adminId],
    references: [admin.id],
  }),
}));
