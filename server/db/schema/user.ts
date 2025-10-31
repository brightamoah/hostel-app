import { relations, sql } from "drizzle-orm";
import {
  check,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";

import { announcement, announcementReads } from "./announcement";
import { billing, payment } from "./billing";
import { complaint, complaintResponse } from "./complaint";
import { maintenanceRequest, maintenanceResponse } from "./maintenance";
import { allocation, hostel } from "./room";
import { visitor } from "./visitor";

export const rolesEnum = pgEnum("roles", [
  "student",
  "admin",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
]);

export const residencyStatusEnum = pgEnum("residency_status", [
  "active",
  "inactive",
  "suspended",
  "graduated",
  "withdrawn",
]);

export const accessLevelEnum = pgEnum("access_level", [
  "regular",
  "super",
  "support",
]);

export const adminStatusEnum = pgEnum("admin_status", [
  "active",
  "inactive",
]);

export const user = pgTable("user", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.varchar({ length: 255 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  password: t.varchar({ length: 255 }).notNull(),
  role: rolesEnum().default("student").notNull(),
  image: t.text(),
  emailVerified: t.boolean().default(false).notNull(),
  verificationToken: t.text(),
  verificationTokenExpiresAt: t.timestamp(),
  resetToken: t.text(),
  resetTokenExpiresAt: t.timestamp(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastLogin: t.timestamp(),
}));

export const student = pgTable("student", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer().notNull().references(() => user.id, { onDelete: "cascade" }),
  gender: genderEnum().notNull(),
  dateOfBirth: t.date().notNull(),
  phoneNumber: t.varchar({ length: 20 }).notNull(),
  address: t.text().notNull(),
  emergencyContactName: t.text().notNull(),
  emergencyContactPhoneNumber: t.varchar({ length: 20 }).notNull(),
  healthConditions: t.text(),
  enrollmentDate: t.date(),
  residencyStatus: residencyStatusEnum().default("inactive").notNull(),
}));

export const admin = pgTable("admin", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer().notNull().references(() => user.id, { onDelete: "cascade" }),
  phoneNumber: t.varchar({ length: 20 }).notNull(),
  department: t.text().notNull(),
  accessLevel: accessLevelEnum().default("regular").notNull(),
  hostelId: t.integer().references(() => hostel.id, { onDelete: "set null" }),
  status: adminStatusEnum().default("active").notNull(),
}), () => [
  check("chk_hostel_for_regular_support", sql`
    (access_level IN ('regular', 'support') AND hostel_id IS NOT NULL)
    OR (access_level = 'super' AND hostel_id IS NULL)
  `),
]);

export const userRelations = relations(user, ({ one, many }) => ({
  student: one(student, {
    fields: [user.id],
    references: [student.userId],
  }),
  admin: one(admin, {
    fields: [user.id],
    references: [admin.userId],
  }),
  announcementReads: many(announcementReads),
  complaintResponses: many(complaintResponse),
  maintenanceResponses: many(maintenanceResponse),
}));

export const studentRelations = relations(student, ({ one, many }) => ({
  user: one(user, {
    fields: [student.userId],
    references: [user.id],
  }),
  billings: many(billing),
  payments: many(payment),
  complaints: many(complaint),
  maintenanceRequests: many(maintenanceRequest),
  allocations: many(allocation),
  visitors: many(visitor),
}));

export const adminRelations = relations(admin, ({ one, many }) => ({
  user: one(user, {
    fields: [admin.userId],
    references: [user.id],
  }),
  hostel: one(hostel, {
    fields: [admin.hostelId],
    references: [hostel.id],
  }),
  announcementsPosted: many(announcement), // Admin as poster
}));

export type UserWithRelations = typeof user & {
  student?: typeof student;
  admin?: typeof admin;
};

// to be run manually in the database to set the starting value of the sequences
// ALTER SEQUENCE user_id_seq INCREMENT BY 1 MINVALUE 10000000 MAXVALUE 99999999 START WITH 10000000 CYCLE RESTART WITH 10000000

// ALTER SEQUENCE student_id_seq INCREMENT BY 1 MINVALUE 10000000 MAXVALUE 99999999 START WITH 10000000 CYCLE RESTART WITH 10000000

// ALTER SEQUENCE admin_id_seq INCREMENT BY 1 MINVALUE 10000000 MAXVALUE 99999999 START WITH 10000000 CYCLE RESTART WITH 10000000
