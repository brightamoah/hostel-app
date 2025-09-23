<script setup lang="ts">
import { useAuthStore } from "~/stores/authStore";
import { signupSchema } from "~/utils/schema";

definePageMeta({
  layout: "auth",
  middleware: ["auth-redirect"],
});

const authStore = useAuthStore();
const { isLoading, errorMessage } = storeToRefs(authStore);
const { signup, signupFields, clearStateAndErrors } = authStore;

onMounted(() => {
  clearStateAndErrors();
});
</script>

<template>
  <UAuthForm
    :fields="signupFields"
    :schema="signupSchema"
    icon="i-lucide-user-plus"
    title="Create an account"
    :loading="isLoading"
    :submit="{
      label: isLoading ? '' : 'Create account',
      icon: 'i-lucide-user-plus',
      loading: isLoading,
      disabled: isLoading,
      class: 'cursor-pointer',
    }"
    @submit="signup!"
  >
    <template #description>
      Already have an account?
      <ULink
        :to="{ name: 'auth-login' }"
        class="font-medium text-primary"
      >
        Login
      </ULink>

      <UAlert
        v-if="errorMessage"
        color="error"
        :title="errorMessage"
        class="mt-4"
        variant="subtle"
      />
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink
        :to="{ name: 'index' }"
        class="font-medium text-primary"
      >
        Terms of Service
      </ULink>
      .
    </template>
  </UAuthForm>
</template>

<style scoped></style>
