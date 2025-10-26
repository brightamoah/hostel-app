import type { DropdownMenuItem } from "@nuxt/ui";
import type { Table } from "@tanstack/table-core";
import type { User } from "#auth-utils";
import type { useDB } from "~~/server/utils/db";
import type { randomUUID } from "uncrypto";
import type { ComputedOptions, ConcreteComponent, MethodOptions, Ref, ShallowRef, ShallowUnwrapRef } from "vue";
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

// eslint-disable-next-line ts/no-empty-object-type
export type Component = string | ConcreteComponent<{}, any, any, ComputedOptions, MethodOptions, {}, any>;

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

export type ColorType = "primary" | "error" | "warning" | "info" | "success" | "neutral";

export interface StatsCard {
  id: number | string;
  title: string;
  icon: string;
  color: ColorType;
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

export type Hostel = {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "inactive" | "under renovation";
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
  hostels: Hostel[];
};

export interface UserDataResponse {
  users: UserType[];
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  activeStudents: number;
};

export interface RoomDetailResponse {
  room: Room;
}

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

export type RoomTableType = Readonly<ShallowRef<ShallowUnwrapRef<{
  tableRef: Ref<HTMLTableElement | null, HTMLTableElement | null>;
  tableApi: Table<Room>;
}> | null>>;

export type UserTableType = Readonly<ShallowRef<ShallowUnwrapRef<{
  tableRef: Ref<HTMLTableElement | null, HTMLTableElement | null>;
  tableApi: Table<UserType>;
}> | null>>;

export interface FilterOption {
  label: string;
  value: string | number;
}

export type Student = {
  id: number;
  gender: "male" | "female";
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  healthConditions: string;
  enrollmentDate: Date;
  roomNumber: string;
  residencyStatus: "N/A" | "active" | "inactive" | "suspended" | "graduated" | "withdrawn";
};

export type Admin = {
  id: number;
  phoneNumber: string;
  department: string;
  accessLevel: "regular" | "super" | "support";
  hostelId: number | null;
};

export interface UserType extends Omit<User, "emailVerified"> {
  student: Student | null;
  admin?: Admin | null;
  isEmailVerified: boolean;
  hostelName?: string | null;
}

export interface AdminUser {
  name: string;
  email: string;
  role: "admin";
  phoneNumber: string;
  accessLevel: "regular" | "super" | "support" | "";
  department: string;
}
