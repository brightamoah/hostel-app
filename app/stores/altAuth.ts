import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

import type { AuthFormField } from "~/types";

export const useAltAuth = defineStore("altAuth", () => {
  const isLoading = ref<boolean>(false);
  const toast = useToast();
  const coolDownTime = ref<number>(0);
  const errorMessage = ref<string | null>(null);

  const canResend = computed(() => coolDownTime.value === 0 && !isLoading.value);

  function startCoolDown(seconds: number) {
    coolDownTime.value = seconds;
    const timer = setInterval(() => {
      coolDownTime.value--;
      if (coolDownTime.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  const fields = ref<AuthFormField[]>([
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      required: true,
    },
  ]);

  const resetPasswordFields = ref<AuthFormField[]>([
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter Your Email",
      required: true,
    },
    {
      name: "newPassword",
      type: "password",
      label: "New Password",
      placeholder: "Enter your new password",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirm Password",
      placeholder: "Re-enter your new password",
      required: true,
    },
  ]);

  async function requestPasswordReset(payload: FormSubmitEvent<VerifyEmailSchema>) {
    if (!canResend.value)
      return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/auth/forgotPassword", {
        method: "POST",
        body: { email: payload.data.email },
      });

      toast.add({
        title: "Reset Email Sent",
        description: response.message,
        color: "success",
        icon: "i-lucide-mail-check",
      });
      startCoolDown(120);
      errorMessage.value = null;
    }
    catch (error: any) {
      const message = error?.data?.message || "Failed to send email reset email. Please try again.";
      errorMessage.value = message;
      toast.add({
        title: "Failed to Send",
        description: message,
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 8000,
      });

      if (error?.status === 429 && message.includes("wait")) {
        const minutes = message.match(/(\d+) minutes/)?.[1];
        if (minutes) {
          startCoolDown(Number.parseInt(minutes) * 60);
        }
      }
    }
    finally {
      isLoading.value = false;
    }
  }

  async function resendVerificationEmail(payload: FormSubmitEvent<VerifyEmailSchema>) {
    payload.preventDefault();
    if (!canResend.value)
      return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/auth/resendVerificationEmail", {
        method: "POST",
        body: { email: payload.data.email },
      });

      toast.add({
        title: "Email Sent",
        description: response.message,
        color: "success",
        icon: "i-lucide-mail-check",
      });

      startCoolDown(120);

      errorMessage.value = null;
      return navigateTo({ name: "auth-login" });
    }
    catch (error: any) {
      const message = error?.data?.message || "Failed to send verification email. Please try again.";
      errorMessage.value = message;

      toast.add({
        title: "Failed to Send",
        description: message,
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 8000,
      });

      if (error?.status === 429 && message.includes("wait")) {
        const minutes = message.match(/(\d+) minutes/)?.[1];
        if (minutes) {
          startCoolDown(Number.parseInt(minutes) * 60);
        }
      }
    }
    finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(payload: FormSubmitEvent<ResetPasswordSchema>, token: string) {
    isLoading.value = true;
    try {
      const response = await $fetch("/api/auth/resetPassword", {
        method: "POST",
        body: {
          token,
          email: payload.data.email,
          newPassword: payload.data.newPassword,
        },
      });

      toast.add({
        title: "Password Reset Successful",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      errorMessage.value = null;
      return navigateTo({ name: "auth-login" });
    }
    catch (error: any) {
      console.error("Reset password error:", error);

      const message = error?.data?.message || "Failed to reset password. Please try again.";
      errorMessage.value = message;
      toast.add({
        title: "Failed to Reset",
        description: message,
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 8000,
      });
      handleAuthError(error);
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    coolDownTime,
    errorMessage,
    canResend,
    fields,
    resetPasswordFields,
    startCoolDown,
    requestPasswordReset,
    resendVerificationEmail,
    resetPassword,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAltAuth, import.meta.hot));
}
