import {
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["student", "admin"]);

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
