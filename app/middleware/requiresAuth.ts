export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, fetch: fetchUserSession } = useUserSession();

  await fetchUserSession();

  if (!loggedIn.value || !user.value) {
    const toast = useToast();

    toast.add({
      title: "Authentication Required",
      description: "Please log in to access this page.",
      color: "error",
      icon: "i-lucide-lock",
      duration: 5000,
    });

    return navigateTo({
      name: "auth-login",
      query: { redirect: to.fullPath }, // Save intended destination
    });
  }

  if (!user.value.emailVerified) {
    const toast = useToast();

    toast.add({
      title: "Email Verification Required",
      description: "Please verify your email before accessing this page.",
      color: "warning",
      icon: "i-lucide-mail-x",
      duration: 8000,
    });

    return navigateTo({
      name: "auth-resendVerification",
    });
  }
});
