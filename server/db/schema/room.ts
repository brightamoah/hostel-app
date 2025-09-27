import { pgEnum, pgTable } from "drizzle-orm/pg-core";

import { student } from "./user";

export const roomTypeEnum = pgEnum("room_type", ["single", "double", "triple", "quad"]);
export const roomStatusEnum = pgEnum("room_status", [
  "vacant",
  "fully occupied",
  "partially occupied",
  "under maintenance",
  "reserved",
]);

export const hostelStatusEnum = pgEnum("hostel_status", ["active", "inactive", "under renovation"]);

export const allocationStatusEnum = pgEnum("allocation_status", ["active", "expired", "pending", "cancelled"]);

export const room = pgTable("room", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  roomNumber: t.varchar({ length: 10 }).notNull().unique(),
  building: t.varchar({ length: 100 }).notNull().unique(),
  floor: t.integer().notNull(),
  capacity: t.integer().notNull(),
  roomType: roomTypeEnum().notNull(),
  currentOccupancy: t.integer().default(0).notNull(),
  features: t.text(),
  amountPerYear: t.numeric({ precision: 10, scale: 2 }).notNull(),
  status: roomStatusEnum().default("vacant").notNull(),
}
));

export const hostel = pgTable("hostel", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.text().notNull(),
  code: t.varchar({ length: 50 }).notNull().unique(),
  address: t.text().notNull(),
  contactNumber: t.varchar({ length: 20 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  status: hostelStatusEnum().default("active").notNull(),
}));

export const allocation = pgTable("allocation", t => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: t.integer().notNull().references(() => student.id, { onDelete: "cascade" }),
  roomId: t.integer().notNull().references(() => room.id, { onDelete: "cascade" }),
  allocationDate: t.date().notNull(),
  endDate: t.date(),
  status: allocationStatusEnum().default("pending").notNull(),
}));
