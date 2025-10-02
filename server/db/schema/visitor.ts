import { pgEnum, pgTable } from "drizzle-orm/pg-core";

import { student } from "./user";

export const visitorStatusEnum = pgEnum("visitor_status", [
  "checked-in",
  "checked-out",
  "pending",
  "cancelled",
  "denied",
  "approved",
]);

export const visitor = pgTable("visitor", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  name: t.text().notNull(),
  email: t.text().notNull(),
  phoneNumber: t.text().notNull(),
  visitDate: t.date().notNull(),
  relationship: t.text().notNull(),
  purpose: t.text().notNull(),
  checkInTime: t.timestamp(),
  checkOutTime: t.timestamp(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  status: visitorStatusEnum().default("pending").notNull(),
}));

export const visitorLogs = pgTable("visitor_logs", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  visitorId: t.integer().notNull().references(() => visitor.id, { onDelete: "cascade" }),
  checkInTime: t.timestamp().notNull(),
  checkOutTime: t.timestamp(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}));
