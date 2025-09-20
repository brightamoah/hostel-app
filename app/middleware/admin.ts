import type { RouteLocationRaw } from "vue-router";

export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession();

  if (loggedIn && user.value && user.value.role !== "admin") {
    const toast = useToast();

    toast.add({
      title: "Access Denied",
      description: "You don't have permission to access admin pages.",
      color: "error",
      icon: "i-lucide-shield-alert",
      duration: 8000,
    });

    // Redirect to appropriate dashboard based on role
    const dashboardRoute: RouteLocationRaw = user.value.role === "student"
      ? { name: "student-dashboard" }
      : { name: "index" };

    return navigateTo(dashboardRoute);
  }
});
