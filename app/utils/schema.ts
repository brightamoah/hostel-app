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

export { confirmPasswordSchema, emailSchema, nameSchema, passwordSchema, rememberMeSchema, roleSchema };
