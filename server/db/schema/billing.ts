import { sql } from "drizzle-orm";
import { check, pgEnum, pgTable } from "drizzle-orm/pg-core";

import { allocation, hostel } from "./room";
import { student } from "./user";

export const billingStatus = pgEnum("billing_status", [
  "unpaid",
  "fully paid",
  "partially paid",
  "overdue",
  "cancelled",
]);

export const paymentMethod = pgEnum("payment_method", [
  "card",
  "mobile money",
  "bank transfer",
  "cash",
]);

export const paymentStatus = pgEnum("payment_status", [
  "completed",
  "failed",
  "pending",
  "refunded",
]);

export const billing = pgTable("billing", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  allocationId: t.integer().notNull().references(() => allocation.id, { onDelete: "set null" }),
  hostelId: t.integer().notNull().references(() => hostel.id, { onDelete: "set null" }),
  amount: t.numeric({ precision: 10, scale: 2 }).notNull(),
  description: t.text().notNull(),
  dateIssued: t.timestamp().defaultNow().notNull(),
  dueDate: t.date().notNull(),
  status: billingStatus().default("unpaid").notNull(),
  lateFee: t.numeric({ precision: 10, scale: 2 }).default("0.00"),
  paidAmount: t.numeric({ precision: 10, scale: 2 }).default("0.00"),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}), () => [
  check("chk_paid_amount", sql`paid_amount >= 0 AND paid_amount <= amount`),
]);

export const payment = pgTable("payment", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  billingId: t.integer().notNull().references(() => billing.id, { onDelete: "cascade" }),
  amount: t.numeric({ precision: 10, scale: 2 }).notNull(),
  paymentDate: t.timestamp().defaultNow().notNull(),
  transactionReference: t.text().notNull().unique(),
  paymentMethod: paymentMethod().notNull(),
  status: paymentStatus().default("pending").notNull(),
}));
