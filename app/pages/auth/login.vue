<script setup lang="ts">
import { useAuthStore } from "~/stores/authStore";

definePageMeta({
  layout: "auth",
});

const authStore = useAuthStore;
const { isLoading } = storeToRefs(authStore);
const { loginSchema, loginFields, login } = authStore;

const route = useRoute();
</script>

<template>
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
        Sign up
      </ULink>
      .
    </template>

    <template #password-hint>
      <ULink
        :to="{ name: 'auth-login' }"
        class="font-medium text-primary"
        tabindex="-1"
      >
        Forgot password?
      </ULink>
    </template>

    <template #footer>
      <div class="space-y-3">
        <!-- Show resend verification link if there's a token error -->
        <div
          v-if="route.query.error === 'token_expired' || route.query.error === 'invalid_token'"
          class="text-center"
        >
          <p class="mb-2 text-muted text-sm">
            Need a new verification link?
            <UButton
              variant="link"
              size="sm"
              class="p-0 h-auto font-medium cursor-pointer"
              @click="navigateTo({ name: 'auth-verifyEmail' })"
            >
              Click Here
            </UButton>
          </p>
        </div>

        <p class="text-gray-500 dark:text-gray-400 text-sm text-center">
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
</template>

<style scoped></style>
