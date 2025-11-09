<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: ["auth-redirect"],
});

const altAuthStore = useAltAuth();
const { resendVerificationEmail } = altAuthStore;
const {
  isLoading,
  coolDownTime,
  canResend,
  fields,
} = storeToRefs(altAuthStore);
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
      @submit="resendVerificationEmail!"
    >
      <template #footer>
        <div class="text-muted text-sm text-center">
          Already verified your email?
          <ULink
            :to="{ name: 'auth-login' }"
            class="font-medium text-primary"
          >
            Login.
          </ULink>
        </div>

        <div class="bg-muted/50 mt-3 p-3 rounded-md text-muted text-xs">
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
