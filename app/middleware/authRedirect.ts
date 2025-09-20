import type { RouteLocationRaw } from "vue-router";

export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession();

  if (loggedIn.value && user.value) {
    // Determine dashboard route based on user role
    const dashboardRoute: RouteLocationRaw = user.value.role === "admin"
      ? { name: "admin-dashboard" }
      : { name: "student-dashboard" };

    return navigateTo(dashboardRoute);
  }
});
