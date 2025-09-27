import {
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["student", "admin"]);
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const residencyStatusEnum = pgEnum("residency_status", ["active", "inactive", "suspended", "graduated", "withdrawn"]);
export const accessLevelEnum = pgEnum("access_level", ["regular", "super", "support"]);

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
}));
