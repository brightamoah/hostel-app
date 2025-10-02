import z from "zod";

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

export {
  baseSignupSchema,
  confirmPasswordSchema,
  emailSchema,
  loginSchema,
  nameSchema,
  passwordSchema,
  personalDetailsSchema,
  rememberMeSchema,
  roleSchema,
  signupSchema,
  verifyEmailSchema,
};
