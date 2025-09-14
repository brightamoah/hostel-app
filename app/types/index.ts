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

// export type User = typeof auth.$Infer.Session.user;
// export type Session = typeof auth.$Infer.Session;

export type AuthError = {
  errorCode: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  icon?: string;
};
