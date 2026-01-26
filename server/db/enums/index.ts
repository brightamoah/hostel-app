import { pgEnum } from "drizzle-orm/pg-core";

export const academicPeriodEnum = pgEnum("academic_period", [
  "first semester",
  "second semester",
  "entire year",
  "vacation period",
]);
