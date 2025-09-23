import type { DropdownMenuItem } from "@nuxt/ui";
import type { User } from "#auth-utils";
import type { useDB } from "~~/server/utils/db";
import type { randomUUID } from "uncrypto";
import type { RouteLocationRaw } from "vue-router";

type FormFieldType = "select" | "checkbox" | "password" | "otp" | "email" | "text";

export type AuthFormField = {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  autocomplete?: string;
  required?: boolean;
};

export type NavItem = {
  label: string;
  to: RouteLocationRaw;
  icon: string;
};

export type DB = ReturnType<typeof useDB>["db"];

export type UserMenuItem = DropdownMenuItem & {
  to?: RouteLocationRaw;
};

export type VerificationToken = ReturnType<typeof randomUUID>;

export type AuthError = {
  errorCode: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  icon?: string;
};

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
  start: Date;
  end: Date;
}

export interface Notification {
  id: number | string;
  unread?: boolean;
  sender: User;
  body: string;
  date: string;
}

export interface Stat {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
  formatter?: (value: number) => string;
  color?: string;
}

export interface StatsCard {
  id: number | string;
  title: string;
  icon: string;
  color: "primary" | "error" | "warning" | "info" | "success" | "neutral";
  value: number;
  percentage?: number;
  period?: Period;
  to?: RouteLocationRaw;
}
