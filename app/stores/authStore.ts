import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";
import z from "zod";

import type { AuthFormField } from "~/types";

export const useAuthStore = defineStore("authStore", () => {
  const isLoading = ref<boolean>(false);

  const signupFields = ref<AuthFormField[]>([
    {
      name: "name",
      type: "text" as const,
      label: "Name",
      placeholder: "Enter your name",
      required: true,
    },
    {
      name: "email",
      type: "text" as const,
      label: "Email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "Enter your password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password" as const,
      placeholder: "Confirm your password",
      required: true,
    },
  ]);

  const signupSchema = z
    .object({
      name: nameSchema,
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
    })
    .refine(data => data.password === data.confirmPassword, {
      error: "Passwords don't match",
      path: ["confirmPassword"],
    });

  type SignupSchema = z.output<typeof signupSchema>;

  const signup = async (payload: FormSubmitEvent<SignupSchema>) => {
    // console.log(payload);
    return {
      success: true,
      message: "Signup successful",
      payload,
    };
  };

  const loginFields = ref<AuthFormField[]>([
    {
      name: "email",
      type: "text" as const,
      label: "Email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      placeholder: "Enter your password",
      required: true,
    },
    {
      name: "rememberMe",
      label: "Remember me",
      type: "checkbox" as const,
    },
  ]);

  const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: rememberMeSchema,
  });

  type LoginSchema = z.output<typeof loginSchema>;

  const login = async (payload: FormSubmitEvent<LoginSchema>) => {
    // console.log(payload);
    return {
      success: true,
      message: "Login successful",
      payload,
    };
  };

  return {
    isLoading,
    signupFields,
    loginFields,
    loginSchema,
    signupSchema,
    login,
    signup,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
