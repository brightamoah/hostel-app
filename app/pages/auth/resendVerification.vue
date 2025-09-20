<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

import type { AuthFormField } from "~/types";

definePageMeta({
  layout: "auth",
  middleware: ["auth-redirect"],
});
const toast = useToast();
const isLoading = ref<boolean>(false);
const coolDownTime = ref<number>(0);
const errorMessage = ref<string | null>(null);

const canResend = computed(() => coolDownTime.value === 0 && !isLoading.value);

const fields = ref<AuthFormField[]>([
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
]);

function startCoolDown(seconds: number) {
  coolDownTime.value = seconds;
  const timer = setInterval(() => {
    coolDownTime.value--;
    if (coolDownTime.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

async function onSubmit(event: FormSubmitEvent<VerifyEmailSchema>) {
  if (!canResend.value)
    return;

  isLoading.value = true;

  try {
    const response = await $fetch("/api/auth/resendVerificationEmail", {
      method: "POST",
      body: { email: event.data.email },
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
</script>

<template>
  <div>
    <UAuthForm
      :fields="fields"
      :schema="verifyEmailSchema"
      :loading="isLoading"
      title="Resend Verification Email"
      description="Enter your email to receive a new verification link"
      icon=""
      :submit="{
        label: isLoading ? '' : canResend ? 'Resend Verification Email' : `Wait ${coolDownTime}s`,
        icon: 'i-lucide-mail',
        loading: isLoading,
        disabled: !canResend,
        class: 'cursor-pointer',
      }"
      @submit="onSubmit!"
    >
      <template #footer>
        <div class="text-muted-foreground text-sm text-center">
          Already verified your email?
          <ULink
            :to="{ name: 'auth-login' }"
            class="font-medium text-primary"
          >
            Login.
          </ULink>
        </div>

        <div class="bg-muted/50 mt-3 p-3 rounded-md text-muted-foreground text-xs">
          <UIcon
            name="i-lucide-info"
            class="inline mr-1 size-3"
          />
          Check your spam folder if you don't see the email
        </div>
      </template>
    </UAuthForm>
  </div>
</template>

<style scoped>

</style>
