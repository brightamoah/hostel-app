<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const token = route.query.token as string;
const id = Number(route.query.id);

const altAuthStore = useAltAuth();
const { resetPasswordFields, isLoading } = storeToRefs(altAuthStore);
const { resetPassword } = altAuthStore;

onMounted(async () => {
  if (!token) {
    toast.add({
      title: "Invalid Token",
      description: "No token provided.",
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 8000,
    });
    await router.push({ name: "auth-forgotPassword" });
  }
});
</script>

<template>
  <UAuthForm
    title="Reset Password"
    description="Enter A New Password To Continue"
    icon="i-lucide-lock-keyhole-open"
    :fields="resetPasswordFields"
    :schema="resetPasswordSchema"
    :loading="isLoading"
    :submit="{
      label: isLoading ? '' : 'Reset Password',
      icon: 'i-lucide-lock-keyhole-open',
      class: 'cursor-pointer',
      loading: isLoading,
      disabled: isLoading,
    }"
    @submit="resetPassword($event, token, id)"
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

      <USeparator
        class="my-2"
        label="OR"
      />

      <div class="text-muted text-sm text-center">
        Request a new reset link
        <ULink
          :to="{ name: 'auth-forgotPassword' }"
          class="font-medium text-primary"
        >
          Here.
        </ULink>
      </div>
    </template>
  </UAuthForm>
</template>

<style scoped>

</style>
