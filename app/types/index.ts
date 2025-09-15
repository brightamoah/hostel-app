import type db from "~~/server/db/index";
import type { RouteLocationRaw } from "vue-router";
// import type { FormSubmitEvent } from "@nuxt/ui";

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

export type DB = typeof db;

// export type Signup = FormSubmitEvent<SignupSchema>

// export type User = typeof auth.$Infer.Session.user;
// export type Session = typeof auth.$Infer.Session;

export type AuthError = {
  errorCode: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  icon?: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  image: string | null;
  role: string;
  lastLogin?: Date;
};
