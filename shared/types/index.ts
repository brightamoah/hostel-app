/// <reference lib="dom" />

import type { CalendarDate, DateValue } from "@internationalized/date";
import type { DropdownMenuItem } from "@nuxt/ui";
import type { Table } from "@tanstack/vue-table";
import type { useEditor } from "@tiptap/vue-3";
import type { User } from "#auth-utils";
import type { AnnouncementType } from "~~/server/db/queries/announcement";
import type { ComplaintType } from "~~/server/db/queries/complaint";
import type { Maintenance } from "~~/server/db/queries/maintenance";
import type { Room as RoomType } from "~~/server/db/queries/room";
import type { StudentDashboard } from "~~/server/db/queries/user";
import type { Visitor } from "~~/server/db/queries/visitor";
import type { admin, allocation, announcement, complaintActionTakenEnum, complaintStatusEnum, hostel, loginAttempts, maintenanceRequest, maintenanceStatusEnum, room, student, user, visitor, visitorLogs } from "~~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import type { randomUUID } from "node:crypto";
import type { ComputedOptions, ConcreteComponent, MethodOptions, Ref, ShallowRef, ShallowUnwrapRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

import type { ComplaintStatusResponseSchema, MaintenanceStatusResponseSchema, RegisterVisitorSchema } from "../utils/schema";

export type DateRange = {
  start: DateValue;
  end: DateValue;
};

export type DateModel = DateValue | DateRange | null;

export type CreateVisitor = Omit<RegisterVisitorSchema, "status" | "hostelId" | "studentId" | "visitDate"> & {
  visitDate: CalendarDate | undefined;
};

export type EditVisitor = {
  visitorId: number;
  data: Partial<CreateVisitor>;
};

export interface FontFamily {
  name: string;
  label: string;
  value: string;
}

export interface ButtonOption {
  name: string;
  label: string;
  icon: string;
  tooltip?: string;
  keyboard?: string[];
  action: () => void;
  isActive?: () => boolean | undefined;
  isDisabled?: () => boolean;
  value?: FontFamily["value"];
}

export interface Button {
  name: string;
  icon: string;
  tooltip: string;
  keyboard?: string[];
  action?: () => void;
  isActive?: () => boolean | undefined;
  isDisabled?: () => boolean;
  isDropdown?: boolean;
  options?: (ButtonOption | Button)[];
}

export interface ButtonGroup {
  name: string;
  buttons: Button[];
}

export type TiptapEditorType = ReturnType<typeof useEditor>;

type AsyncDataRequestStatus = "idle" | "pending" | "success" | "error";

interface AsyncDataExecuteOptions {
  dedupe?: "cancel" | "defer";
  timeout?: number;
  signal?: AbortSignal;
}

export type Refresh = (opts?: AsyncDataExecuteOptions) => Promise<void>;
export type Status = AsyncDataRequestStatus;

export type FormFieldType = "select" | "checkbox" | "password" | "otp" | "email" | "text";

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

export type Allocation = typeof allocation.$inferSelect;
export type VisitorLog = typeof visitorLogs.$inferSelect;

// export type DB = ReturnType<typeof useDB>["db"];

export type UserMenuItem = DropdownMenuItem & {
  to?: RouteLocationRaw;
};

// eslint-disable-next-line ts/no-empty-object-type
export type ComponentType = string | ConcreteComponent<{}, any, any, ComputedOptions, MethodOptions, {}, any>;

export type VerificationToken = ReturnType<typeof randomUUID>;

export type AuthError = {
  errorCode: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  icon?: string;
};

export type Period = "daily" | "weekly" | "monthly";

export type RangeType = {
  start: Date;
  end: Date;
};

export type Notification = {
  id: number | string;
  unread?: boolean;
  sender: User;
  body: string;
  date: string;
};

export type Stat = {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
  formatter?: (value: number) => string;
  color?: string;
};

export type ColorType = "primary" | "error" | "warning" | "info" | "success" | "neutral" | "secondary";
export type VariantType = "outline" | "soft" | "subtle" | "ghost" | "none";

export type StatsCard = {
  id: number | string;
  title: string;
  icon: string;
  color: ColorType;
  value: number | string;
  percentage?: number;
  period?: Period;
  to?: RouteLocationRaw;
};

export type Room = RoomType;

export type RoomInsert = typeof room.$inferInsert;

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
  totalFullyOccupiedRooms: number;
  totalVacantRooms: number;
  totalPartiallyOccupiedRooms: number;
  totalReservedRooms: number;
  hostels: Hostel[];
};

export type StudentRoomData = Pick<RoomDataResponse, "rooms" | "hostels" | "totalRooms">;

export type UserDataResponse = {
  users: UserWithRelations[];
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  activeStudents: number;
};

export type VisitorDataResponse = {
  visitors: Visitor[];
  approved: number;
  checkedIn: number;
  pending: number;
  totalVisitors: number;
};

export type RoomDetailResponse = {
  room: Room;
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

export type TableType<T> = Readonly<ShallowRef<ShallowUnwrapRef<{
  tableRef: Ref<HTMLTableElement | null, HTMLTableElement | null>;
  tableApi: Table<T>;
}> | null>>;

export type FilterOption = {
  label: string;
  value: string | number;
};

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

export type DashboardStudent = {
  student: StudentDashboard["studentRecord"];
  totalBilled: StudentDashboard["totalBilled"];
  totalPaid: StudentDashboard["totalPaid"];
  balance: StudentDashboard["outstandingBalance"];
  totalVisitors: StudentDashboard["totalVisitors"];
  pendingMaintenance: StudentDashboard["pendingMaintenanceCount"];
};

export type Roommate = DashboardStudent["student"]["allocation"]["room"]["allocations"][number]["student"];

export type StudentRoom = DashboardStudent["student"]["allocation"]["room"];

export type StudentVisitor = DashboardStudent["student"]["visitors"][number];

export type Admin = {
  id: number;
  phoneNumber: string;
  department: string;
  accessLevel: "regular" | "super" | "support";
  hostelId: number | null;
  status: "active" | "inactive";
};

// export type UserType = {
//   student: Student | null;
//   admin?: Admin | null;
//   isEmailVerified: boolean;
//   hostelName?: string | null;
// } & Omit<User, "emailVerified">;

export type AdminUser = {
  name: string;
  email: string;
  role: "admin";
  phoneNumber: string;
  accessLevel: "regular" | "super" | "support" | "";
  department: string;
};

export type FailedAttempts = (typeof loginAttempts)["_"]["columns"][keyof (typeof loginAttempts)["_"]["columns"]];

export type VisitorType = Visitor;
export type VisitorStatus = Visitor["status"];
export type AllowedStatusesForCheckIn = Extract<VisitorStatus, "approved" | "checked-out">;

export type VisitorCreate = typeof visitor.$inferInsert;
export type InsertEditVisitor = Omit<EditVisitor["data"], "visitDate"> & { visitDate?: string };

export type MaintenanceCreate = typeof maintenanceRequest.$inferInsert;
export type MaintenanceType = Maintenance;
export type MaintenanceDataResponse = {
  maintenanceRequests: MaintenanceType[];
  totalMaintenance: number;
  assigned: number;
  inProgress: number;
  pending: number;
  completed: number;
  rejected: number;
};

export type MaintenanceStatus = typeof maintenanceStatusEnum["enumValues"][number];

export type MaintenanceAction = "change-status" | "add-response";

export type StatusResponseForm = Omit<MaintenanceStatusResponseSchema, "maintenanceId">;

export type DataType<T> = Ref<T, T>;

export type Complaint = ComplaintType;

export type ComplaintDataResponse = {
  complaints: Complaint[];
  totalComplaints: number;
  totalInProgress: number;
  totalPending: number;
  totalResolved: number;
};

export type ComplaintAction = MaintenanceAction;

export type ComplaintStatusForm = Omit<ComplaintStatusResponseSchema, "complaintId">;
export type ComplaintStatus = typeof complaintStatusEnum["enumValues"][number];
export type ComplaintActionTaken = typeof complaintActionTakenEnum["enumValues"][number];

export type AnnouncementInsert = typeof announcement.$inferInsert;
export type Announcement = AnnouncementType;
export type AnnouncementResponse = {
  announcements: Announcement[];
};

type BaseUser = Omit<InferSelectModel<typeof user>, "password"
  | "verificationToken"
  | "verificationTokenExpiresAt"
  | "resetToken"
  | "resetTokenExpiresAt"
  | "lastLogin">;
type BaseStudent = InferSelectModel<typeof student>;
type BaseAdmin = InferSelectModel<typeof admin>;
type BaseAllocation = InferSelectModel<typeof allocation>;
type BaseRoom = InferSelectModel<typeof room>;
type BaseHostel = InferSelectModel<typeof hostel>;

type HostelData = BaseHostel;

type RoomWithHostel = BaseRoom & {
  hostel: HostelData | null;
};

type AllocationWithDetails = BaseAllocation & {
  room: RoomWithHostel | null;
};

type StudentWithDetails = BaseStudent & {
  allocation?: AllocationWithDetails | null;
};

type AdminWithDetails = BaseAdmin & {
  hostel: HostelData | null;
};

export type UserWithRelations = BaseUser & {
  student?: StudentWithDetails | null;
  admin?: AdminWithDetails | null;
};
