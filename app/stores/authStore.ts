import type { FormSubmitEvent } from "@nuxt/ui";
import type { RouteLocationRaw } from "vue-router";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useAuthStore = defineStore("authStore", () => {
  const toast = useToast();
  const route = useRoute();

  const { $apiFetch } = useNuxtApp();

  const { exists, studentData } = useStudentData();

  const isLoading = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);
  const isOnboarded = computed(() => !!exists.value);

  const { user, loggedIn: isLoggedIn, session, fetch: refreshSession, clear: clearUserSession } = useUserSession();

  const refreshSessionWithFreshData = async () => {
    try {
      await $apiFetch("/api/auth/refreshSession", { method: "POST" });
      await refreshSession();
    }
    catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

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

  const signup = async (payload: FormSubmitEvent<SignupSchema>) => {
    isLoading.value = true;
    try {
      const response = await $apiFetch("/api/auth/signup", {
        method: "POST",
        body: {
          name: payload.data.name,
          email: payload.data.email,
          password: payload.data.password,
        },
      });
      toast.add({
        title: "Signup Successful",
        description: response.message || "Please check your email for a verification link to complete registration.",
        color: "success",
        icon: "i-lucide-circle-check-big",
      });

      await navigateTo({ name: "auth-login" });
    }
    catch (error: any) {
      const message = error?.data?.message || "Signup failed. Please try again.";
      errorMessage.value = message;
      toast.add({
        title: "Signup Failed",
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
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

  const login = async ({
    data: {
      email,
      password,
      rememberMe,
    },
  }: FormSubmitEvent<LoginSchema>) => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const { message } = await $apiFetch("/api/auth/login", { method: "POST", body: { email, password, rememberMe } });

      await refreshSession();

      if (user.value!.role === "student") {
        const studentDetails = await $apiFetch("/api/auth/checkStudentDetails", {
          method: "GET",
        });
        if (!studentDetails.exists) {
          await navigateTo({ name: "auth-onboarding" });
          return;
        }
      }

      toast.add({
        title: "Login Successful",
        description: message || "Welcome back! Redirecting to your dashboard.",
        color: "success",
        icon: "i-lucide-circle-check-big",
      });

      let role = user.value?.role;

      if (!role) role = "student";

      const dashboard = { name: role === "admin" ? "admin-dashboard" : "student-dashboard" } as RouteLocationRaw;
      const redirectPath = route.query.redirect as string | undefined;

      const target = redirectPath && !(redirectPath.startsWith("/admin") && role !== "admin")
        ? redirectPath
        : dashboard;

      await navigateTo(target);
    }
    catch (error: any) {
      const message = error?.data?.message || "Login failed. Please check your credentials.";
      errorMessage.value = message;
      toast.add({
        title: "Login Failed",
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally { isLoading.value = false; }
  };

  const clearStateAndErrors = () => {
    errorMessage.value = null;
    isLoading.value = false;
  };

  const signout = async () => {
    await clearUserSession();
    clearStateAndErrors();
    clearNuxtData();
    return navigateTo({ name: "auth-login" });
  };

  return {
    isLoading,
    signupFields,
    loginFields,
    user,
    isLoggedIn,
    session,
    errorMessage,
    isOnboarded,
    studentData,
    login,
    signup,
    signout,
    clearStateAndErrors,
    refreshSession,
    refreshSessionWithFreshData,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
