<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: ["auth-redirect"],
});

const { $apiFetch } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = route.query.token as string;
const id = Number(route.query.id);

onMounted(async () => {
  if (!token) {
    toast.add({
      title: "Verification Failed",
      description: "No verification token provided. Please check your email for the link.",
      color: "error",
      duration: 8000,
    });
    await router.push({
      name: "auth-login",
      query: { error: "invalid_token" },
    });
    return;
  }

  try {
    const response = await $apiFetch("/api/auth/verifyEmail", {
      method: "POST",
      body: { token, id },
    });
    toast.add({
      title: "Email Verified Successfully",
      description: response.message,
      color: "success",
      icon: "i-lucide-check-circle",
    });
    return router.push({ name: "auth-login" });
  }
  catch (error: any) {
    const message = error?.data?.message || "Verification failed. The link may be expired or invalid.";
    toast.add({
      title: "Verification Failed",
      description: message,
      color: "error",
      duration: 8000,
    });
    await router.push({
      name: "auth-login",
      query: { error: "token_expired" },
    });
  }
});
</script>

<template>
  <div class="flex flex-col justify-center items-center space-y-6 rounded-4xl min-h-[45vh] text-center">
    <div class="flex justify-center items-center bg-primary/10 rounded-full size-16">
      <UIcon
        name="i-lucide-mail-check"
        class="size-8 text-primary"
      />
    </div>

    <div class="space-y-2">
      <h1 class="font-bold text-highlighted text-2xl">
        Verifying Your Email
      </h1>

      <p class="max-w-md text-toned text-sm">
        Please wait while we verify your email address. This may take a few moments.
      </p>
    </div>

    <div class="flex justify-center items-center space-x-2">
      <UIcon
        name="i-lucide-loader"
        class="size-5 text-primary animate-spin"
      />

      <span class="text-toned text-sm">
        Processing verification...
      </span>
    </div>

    <div class="pt-4 text-muted text-xs">
      You will be redirected automatically once verification is complete.
    </div>
  </div>
</template>

<style scoped>

</style>
