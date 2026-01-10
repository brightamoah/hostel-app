import type { RouteNamedMap } from "vue-router/auto-routes";

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user, session } = useUserSession();
  // const roleRoutes = useRoleBasedRoute();

  // Avoid redirecting if already on auth routes
  const authRoutes: (keyof RouteNamedMap)[] = [
    "auth-login",
    "auth-verifyEmail",
    "auth-signup",
    "auth-forgotPassword",
    "auth-resetPassword",
    "auth-resendVerification",
    "auth-logout",
    "index",
    "about",
    "contact",
    "faq",
  ];

  if (authRoutes.includes(to.name)) return;

  if (!loggedIn.value || !user.value) {
    return navigateTo({
      name: "auth-login",
      query: { redirect: to.fullPath }, // Save intended destination
    });
  }

  if (session.value?.onboarded && to.name === "auth-onboarding") {
    const dashboard = user.value.role === "admin" ? "admin-dashboard" : "student-dashboard";
    return navigateTo({ name: dashboard });
  }

  if (
    user.value
    && user.value.role === "student"
    && session.value
    && !session.value.onboarded
    && to.name !== "auth-onboarding"
  ) {
    return navigateTo({ name: "auth-onboarding" });
  }
});
