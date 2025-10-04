<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const altAuthStore = useAltAuth();

const {
  isLoading,
  coolDownTime,
  canResend,
  fields,
} = storeToRefs(altAuthStore);
const { requestPasswordReset } = altAuthStore;
</script>

<template>
  <UAuthForm
    description="Enter your email to receive a reset link"
    title="Reset Password"
    icon="i-lucide-lock-keyhole-open"
    :fields
    :schema="verifyEmailSchema"
    :loading="isLoading"
    :submit="{
      label: isLoading ? '' : canResend ? 'Reset Password' : `Wait ${coolDownTime}s`,
      icon: 'i-lucide-lock-keyhole-open',
      loading: isLoading,
      disabled: !canResend,
      class: 'cursor-pointer',
    }"
    @submit="requestPasswordReset!"
  >
    <template #footer>
      <div class="text-muted text-sm text-center">
        Remembered your password?
        <ULink
          :to="{ name: 'auth-login' }"
          class="font-medium text-primary"
        >
          Login.
        </ULink>
      </div>
    </template>
  </UAuthForm>
</template>

<style scoped>

</style>
