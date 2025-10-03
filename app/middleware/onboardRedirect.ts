import type { RouteNamedMap } from "vue-router/auto-routes";

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user, session } = useUserSession();
  const roleRoutes = useRoleBasedRoute();

  // Avoid redirecting if already on auth routes
  const authRoutes: (keyof RouteNamedMap)[] = ["auth-login", "auth-verifyEmail", "auth-signup"];

  if (authRoutes.includes(to.name)) {
    return;
  }

  if (!loggedIn.value || !user.value) {
    return navigateTo({
      name: "auth-login",
      query: { redirect: to.fullPath }, // Save intended destination
    });
  }

  if (user.value && user.value.role === "student" && !session.value!.onboarded) {
    if (to.name !== "auth-onboarding") {
      return navigateTo({ name: "auth-onboarding" });
    }
    return;
  }

  const target = roleRoutes.value!.dashboard;
  if (to.name !== target.name) {
    return navigateTo(target);
  }
});
