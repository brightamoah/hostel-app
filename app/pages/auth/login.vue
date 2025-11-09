<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: ["auth-redirect"],
});

const route = useRoute();

const authStore = useAuthStore();
const { isLoading, errorMessage } = storeToRefs(authStore);
const { loginFields, login, clearStateAndErrors } = authStore;

onMounted(() => {
  clearStateAndErrors();
});
</script>

<template>
  <div>
    <UAuthForm
      :fields="loginFields"
      :schema="loginSchema"
      :loading="isLoading"
      :submit="{
        label: isLoading ? '' : 'Sign in',
        icon: 'i-lucide-log-in',
        loading: isLoading,
        disabled: isLoading,
        class: 'cursor-pointer',
      }"
      title="Welcome back"
      icon="i-lucide-lock"
      @submit="login!"
    >
      <template #description>
        Don't have an account?
        <ULink
          :to="{ name: 'auth-signup' }"
          class="font-medium text-primary"
        >
          Sign up.
        </ULink>

        <UAlert
          v-if="errorMessage"
          color="error"
          :title="errorMessage"
          class="mt-4"
          variant="subtle"
        />
      </template>

      <template #password-hint>
        <ULink
          :to="{ name: 'auth-forgotPassword' }"
          class="font-medium text-primary"
          tabindex="-1"
        >
          Forgot password?
        </ULink>
      </template>

      <template #footer>
        <div class="space-y-3">
          <UAlert
            v-if="route.query.error === 'token_expired' || route.query.error === 'invalid_token'"
            color="neutral"
            title="Having trouble with email verification?"
            class="mt-4"
            variant="subtle"
          >
            <template #description>
              <UButton
                variant="outline"
                size="sm"
                class="p-1.5 h-auto font-medium cursor-pointer"
                :to="{ name: 'auth-resendVerification' }"
              >
                Resend verification email
              </UButton>
            </template>
          </UAlert>

          <p class="text-muted text-sm text-center">
            By signing in, you agree to our
            <ULink
              :to="{ name: 'index' } "
              class="font-medium text-primary"
            >
              Terms of Service
            </ULink>
            .
          </p>
        </div>
      </template>
    </UAuthForm>
  </div>
</template>

<style scoped></style>
