import { CalendarDate } from "@internationalized/date";
import * as z from "zod";

const linkSchema = z.object({
  link: z.url("Invalid URL").nonempty("Link is required"),
  isOpen: z.boolean().default(false),
});

export type LinkSchema = z.output<typeof linkSchema>;

const passwordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Must be at least 8 characters")
  .max(20, "Must be at most 20 characters")
  .refine(val => /[A-Z]/.test(val), "Must include an uppercase letter")
  .refine(val => /[a-z]/.test(val), "Must include a lowercase letter")
  .refine(val => /\d/.test(val), "Must include a number")
  .refine(
    val => /[^A-Z0-9]/i.test(val),
    "Must include a special character",
  );

const nameSchema = z
  .string({ error: "Name is required" })
  .min(5, "Name must be at least 5 characters long")
  .max(50, "Name must be at most 50 characters long")
  .refine(
    val => /^[a-z\s]+$/i.test(val),
    "Full name can only contain letters and spaces",
  );

const roleSchema = z.enum(["student", "admin"], {
  error: "Role must be either 'student' or 'admin'",
});

const rememberMeSchema = z.boolean().optional().default(false);

const emailSchema = z.email({
  error: issue =>
    issue.input === undefined || issue.input === ""
      ? "Email is required"
      : "Invalid email address",
});

const confirmPasswordSchema = z.string({ error: "Confirm Password is required" });

const baseSignupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const signupSchema = baseSignupSchema.extend({
  confirmPassword: confirmPasswordSchema,
}).refine(data => data.password === data.confirmPassword, {
  error: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupSchema = z.output<typeof signupSchema>;

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: rememberMeSchema,
});

export type LoginSchema = z.output<typeof loginSchema>;

const verifyEmailSchema = z.object({
  email: emailSchema,
});
export type VerifyEmailSchema = z.output<typeof verifyEmailSchema>;

const phoneNumberSchema = z.string({ error: "Phone Number is required" })
  .regex(/^(?:\d{10}|\+\d{12})$/, "Phone number must be 10 digits (e.g., 0234567890) or 13 digits starting with + (e.g., +233234567890)")
  .min(1, "Phone Number is required")
  .refine(
    val => /^(?:\+233\d{9}|0\d{9})$/.test(val),
    "Phone number must be in the format +233XXXXXXXXX or 0XXXXXXXXXX",
  );

const genderSchema = z.union([
  z.enum(["male", "female"], {
    error: "Gender is required",
  }),
  z.literal(""),
]).refine(val => val !== "", "Gender is required");

const addressSchema = z.string().min(1, "Address is required").min(5, "Address is too short");

const idSchema = z.int().min(10000000, "Invalid id: less than required length").max(99999999, "Invalid id: exceeds maximum length");

export type IDSchema = z.output<typeof idSchema>;

const personalDetailsSchema = z.object({
  gender: genderSchema,
  dateOfBirth: z.date({ error: "Date of Birth is required" }).nullable(),
  phoneNumber: phoneNumberSchema,
  address: addressSchema,
  emergencyContactName: nameSchema,
  emergencyContactPhoneNumber: phoneNumberSchema,
  emergencyContactEmail: emailSchema,
  healthConditions: z.string().optional(),
});

export type PersonalDetailsSchema = z.output<typeof personalDetailsSchema>;

const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine(data => data.newPassword === data.confirmPassword, {
  error: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordSchema = z.output<typeof resetPasswordSchema>;

const passwordResetSchema = z.object({
  id: idSchema,
  token: z.string({ error: "Token is required" }),
  newPassword: passwordSchema,
});

const emailVerificationSchema = z.object({
  id: idSchema,
  token: z.uuidv4({ error: "Valid token is required" }),
});

const roomTypeSchema = z.union([
  z.enum(["single", "double", "triple", "quad"], {
    error: "Room Type is required",
  }),
  z.literal(""),
]).refine(val => val !== "", "Room Type is required");

const roomStatusSchema = z.union([
  z.enum(["vacant", "fully occupied", "partially occupied", "under maintenance", "reserved"], {
    error: "Status is required",
  }),
  z.literal(""),
]).refine(val => val !== "", "Status is required");

const roomNumberSchema = z
  .string()
  .nonempty("Room number is required")
  .min(4, "Room number must be at least 4 characters long (e.g., A100)")
  .max(10, "Room number cannot exceed 10 characters")
  .regex(/^[A-Z]\d+$/, "Room number must start with a single uppercase letter followed by numbers (e.g., V103).")
  .refine((val) => {
    const numberPart = Number.parseInt(val.substring(1), 10);
    return numberPart >= 100;
  }, "The number part of the room number must be 100 or greater.");

const roomFeatureSchema = z.union([
  z.string("Features is required")
    .nonempty("Features is required")
    .refine(s => s.split(",").map(item => item.trim()).filter(Boolean).length > 0, "Features is required")
    .transform(s => s.split(",").map(item => item.trim()).filter(Boolean)),
  z.array(z.string("Features is required").nonempty("Features is required")),
]).refine(arr => arr.length > 0, { message: "Features is required" });

export const addRoomSchema = z.object({
  roomNumber: roomNumberSchema,
  hostelId: z.number("Hostel ID is required").int().positive().min(1, "Invalid Maintenance ID"),
  floor: z.number("Floor is required").min(1, "Floor cannot be negative"),
  capacity: z.number("Capacity is required").min(1, "Capacity must be at least 1").max(4, "Capacity cannot exceed 4"),
  roomType: roomTypeSchema,
  features: roomFeatureSchema,
  amountPerYear: z.number("Amount per Year is required").min(1, "Amount per Year cannot be negative"),
  status: roomStatusSchema,
  currentOccupancy: z.number("Current Occupancy is required").min(0, "Current Occupancy cannot be negative").max(4, "Current Occupancy cannot exceed 4"),
});

const editRoomData = addRoomSchema.partial().omit({ roomType: true, status: true });

const editRoomSchema = z.object({
  roomId: z.number().min(1, "Invalid room ID"),
  data: editRoomData.extend({
    status: z.enum(["vacant", "fully occupied", "partially occupied", "under maintenance", "reserved"], "Status is required").optional(),
    roomType: z.enum(["single", "double", "triple", "quad"], "Room Type is required").optional(),
  }),
});

export type AddRoomSchema = z.output<typeof addRoomSchema>;
export type AddRoomSchemaInput = z.input<typeof addRoomSchema>;
export type RoomFormState = Omit<AddRoomSchemaInput, "features"> & {
  features: string;
};
export type EditRoomDataSchema = z.output<typeof editRoomData>;
export type EditRoomSchema = z.output<typeof editRoomSchema>;

const deleteItemSchema = z.object({
  ids: z.array(z.number().min(1, "Invalid room ID")).min(1, "At least one room ID is required"),
});

export type DeleteItemSchema = z.output<typeof deleteItemSchema>;

const accessLevelSchema
  = z.enum(["regular", "super", "support"], "Access Level is required");

const hostelIdSchema = z.number("Hostel ID is required").min(1, "Hostel ID must be at least 1").positive().nullable().optional();

const departmentSchema = z.string("Department is required")
  .min(2, "Department must be at least 2 characters long")
  .max(100, "Department must be at most 100 characters long");

const addAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phoneNumber: phoneNumberSchema,
  role: z.literal("admin", "Role must be 'admin'"),
  department: departmentSchema,
  accessLevel: accessLevelSchema,
  hostelId: hostelIdSchema,
});

export type AddAdminSchema = z.output<typeof addAdminSchema>;

const promoteDemoteSchema = z.object({
  userId: idSchema,
  action: z.enum(["promote", "demote"], "Action must be either 'promote' or 'demote'"),
  accessLevel: accessLevelSchema.optional(),
  phoneNumber: phoneNumberSchema.optional(),
  department: departmentSchema.optional(),
  hostelId: hostelIdSchema.nullable(),
});

export type PromoteDemoteSchema = z.output<typeof promoteDemoteSchema>;

const approveDenySchema = z.object({
  visitorId: z.number().int().positive().min(1, "Invalid Visitor ID"),
  status: z.enum(["approved", "denied"], "Status must be either 'approved' or 'denied'"),
});

export type ApproveDenySchema = z.output<typeof approveDenySchema>;

const logActionSchema = z.object({
  visitorId: z.number().int().positive().min(1, "Invalid Visitor ID"),
  action: z.enum(["check_in", "check_out"], "Action must be either 'check_in' or 'check_out'"),
});
export type LogActionSchema = z.output<typeof logActionSchema>;

const relationshipSchema = z.string("Relationship is required")
  .nonempty("Relationship is required")
  .trim()
  .min(2, "Relationship must be at least 2 characters long")
  .max(50, "Relationship must be at most 50 characters long");

const purposeOfVisitSchema = z.string("Purpose of Visit is required")
  .nonempty("Purpose of Visit is required")
  .trim()
  .min(2, "Purpose of Visit must be at least 2 characters long")
  .max(50, "Purpose of Visit must be at most 50 characters long");

const visitorStatusSchema = z.enum(
  ["pending", "approved", "denied", "checked-in", "checked-out", "cancelled"],
  {
    error: "Status is required",
  },
).optional().default("pending");

const dateOfVisitSchema = z.custom<CalendarDate>(val => val instanceof CalendarDate, {
  error: "Date of Visit must be a valid CalendarDate",
}).refine(val => val !== null, "Date of Visit is required");

const registerVisitorSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phoneNumber: phoneNumberSchema,
  dateOfVisit: dateOfVisitSchema,
  relationship: relationshipSchema,
  purposeOfVisit: purposeOfVisitSchema,
  hostelId: z.number("Hostel ID is required").int().positive().min(1, "Invalid Hostel ID"),
  studentId: z.number("Student ID is required").int().positive().min(1, "Invalid Student ID"),
  status: visitorStatusSchema,
});

export type RegisterVisitorSchema = z.output<typeof registerVisitorSchema>;

const maintenanceStatusSchema = z.union([
  z.enum([
    "pending",
    "assigned",
    "in-progress",
    "completed",
    "rejected",
  ], {
    error: "Status must be one of 'pending', 'assigned', 'in-progress', 'completed', 'rejected'",
  }),
  z.literal(""),
]).refine(val => val !== "", "Status is required");

const responseText = z
  .string()
  .trim()
  .nonempty("Response Text is required")
  .min(10, "Response is too short")
  .max(1000, "Response Text cannot exceed 1000 characters");

const maintenanceStatusResponseSchema = z.object({
  maintenanceId: z.number().int().positive().min(1, "Invalid Maintenance ID"),
  status: maintenanceStatusSchema,
  responseText,
});

export type MaintenanceStatusResponseSchema = z.output<typeof maintenanceStatusResponseSchema>;

const complaintStatusSchema = z.union([
  z.enum([
    "pending",
    "in-progress",
    "resolved",
    "rejected",
  ], {
    error: "Status must be one of 'pending', 'in-progress', 'resolved', 'rejected'",
  }),
  z.literal(""),
]).refine(val => val !== "", "Status is required");

const complaintStatusResponseSchema = z.object({
  complaintId: z.number().int().positive().min(1, "Invalid Complaint ID"),
  status: complaintStatusSchema,
  responseText,
});

export type ComplaintStatusResponseSchema = z.output<typeof complaintStatusResponseSchema>;

export const announcementPrioritySchema = z.union([
  z.enum([
    "low",
    "medium",
    "high",
    "emergency",
  ]),
  z.literal(""),
]).refine(val => val !== "", "Priority is required");
export const targetAudienceSchema = z.union([
  z.enum([
    "all",
    "students",
    "admins",
    "hostel",
    "room",
    "user",
  ]),
  z.literal(""),
]).refine(val => val !== "", "Target Audience is required");

export const createAnnouncementSchema = z.object({
  title: z.string()
    .nonempty("Title is required")
    .min(5, "Title must be at least 5 characters long")
    .max(200, "Title cannot exceed 200 characters"),
  content: z.string()
    .nonempty("Content is required")
    .min(10, "Content must be at least 10 characters long")
    .max(5000, "Content cannot exceed 5000 characters"),
  priority: announcementPrioritySchema,
  targetAudience: targetAudienceSchema,
  targetHostelId: z.number().optional(),
  targetRoomId: z.number().optional(),
  targetUserId: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.targetAudience === "hostel" && !data.targetHostelId) {
    ctx.addIssue({
      code: "custom",
      message: "Target Hostel ID is required when target audience is 'hostel'",
      path: ["targetHostelId"],
    });
  }

  if (data.targetAudience === "room" && !data.targetRoomId) {
    ctx.addIssue({
      code: "custom",
      message: "Target Room ID is required when target audience is 'room'",
      path: ["targetRoomId"],
    });
  }

  if (data.targetAudience === "user" && !data.targetUserId) {
    ctx.addIssue({
      code: "custom",
      message: "Target User ID is required when target audience is 'user'",
      path: ["targetUserId"],
    });
  }
});

export type CreateAnnouncementSchema = z.output<typeof createAnnouncementSchema>;

const readStatusSchema = z.object({
  action: z.enum(["read", "unread"], "Action must be either 'read' or 'unread'"),
});

export type ReadStatusSchema = z.output<typeof readStatusSchema>;

const editAnnouncementData = createAnnouncementSchema.partial().omit({ priority: true, targetAudience: true });

const editAnnouncementSchema = z.object({
  announcementId: z.number().min(1, "Invalid Announcement ID"),
  data: editAnnouncementData.extend({
    priority: z.enum([
      "low",
      "medium",
      "high",
      "emergency",
    ], "Priority is required").optional(),

    targetAudience: z.enum([
      "all",
      "students",
      "admins",
      "hostel",
      "room",
      "user",
    ], "Target Audience is required").optional(),
  }),
  resetReadStatus: z.boolean().optional().default(false),
});

export type EditAnnouncementSchema = z.output<typeof editAnnouncementSchema>;

const bookRoomSchema = z.object({
  roomId: z.number().int().positive().min(1, "Invalid Room ID"),
  userId: z.number().int().positive().min(1, "Invalid Student ID"),
  endDate: z.date().optional(),
});

export type BookRoomSchema = z.output<typeof bookRoomSchema>;

export {
  addAdminSchema,
  approveDenySchema,
  baseSignupSchema,
  bookRoomSchema,
  complaintStatusResponseSchema,
  confirmPasswordSchema,
  deleteItemSchema,
  editAnnouncementSchema,
  editRoomSchema,
  emailSchema,
  emailVerificationSchema,
  linkSchema,
  logActionSchema,
  loginSchema,
  maintenanceStatusResponseSchema,
  nameSchema,
  passwordResetSchema,
  passwordSchema,
  personalDetailsSchema,
  promoteDemoteSchema,
  readStatusSchema,
  registerVisitorSchema,
  rememberMeSchema,
  resetPasswordSchema,
  roleSchema,
  roomFeatureSchema,
  signupSchema,
  verifyEmailSchema,
};
