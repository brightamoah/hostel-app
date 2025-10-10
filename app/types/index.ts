import type { DropdownMenuItem } from "@nuxt/ui";
import type { Table } from "@tanstack/table-core";
import type { User } from "#auth-utils";
import type { useDB } from "~~/server/utils/db";
import type { randomUUID } from "uncrypto";
import type { ShallowRef, ShallowUnwrapRef } from "vue";
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

export type Room = {
  id: number;
  roomNumber: string;
  building: string;
  floor: number;
  roomType: "single" | "double" | "triple" | "quad";
  capacity: number;
  currentOccupancy: number;
  features: string[];
  amountPerYear: number;
  status: "vacant" | "fully occupied" | "partially occupied" | "under maintenance" | "reserved";
};

export type RoomDataResponse = {
  rooms: Room[];
  totalRooms: number;
  totalOccupiedRooms: number;
  totalAvailableRooms: number;
  totalUnderMaintenance: number;
  buildings: {
    building: string;
  }[];
};

export type StatusFilterOptions = {
  label: string;
  value: string;
}[];

export type StatusFilter = string | string;

export type BuildingFilter = string | string;
export type BuildingFilterOptions = {
  label: string;
  value: string;
}[];

export type FloorFilter = string | number;

export type FloorFilterOptions = ({
  label: string;
  value: number;
} | { label: string; value: string })[];

export type TableType = Readonly<ShallowRef<ShallowUnwrapRef<{
  tableRef: Ref<HTMLTableElement | null, HTMLTableElement | null>;
  tableApi: Table<Room>;
}> | null>>;

export interface FilterOption {
  label: string;
  value: string | number;
}
