import type { RouteLocationRaw } from "vue-router";
import type { RouteNamedMap } from "vue-router/auto-routes";

// Helper type for role-specific routes
type RoleRoute = RouteLocationRaw & { name: keyof RouteNamedMap };

// Helper function to define and type-check routes
function defineRoleRoutes<T extends Record<string, RoleRoute>>(routes: T) {
  return routes;
}

// Define route mappings with type enforcement
const routesByRole = {
  admin: defineRoleRoutes({
    profile: { name: "admin-profile" },
    visitors: { name: "admin-visitors" },
    settings: { name: "admin-settings" },
    dashboard: { name: "admin-dashboard" },
    users: { name: "admin-users" },
  }),
  student: defineRoleRoutes({
    profile: { name: "student-profile" },
    visitors: { name: "student-visitors" },
    settings: { name: "student-settings" },
    dashboard: { name: "student-dashboard" },
    users: { name: "student-users" },
  }),
} as const; // 'as const' for literal key inference

export function useRoleBasedRoute() {
  const { loggedIn, user } = useUserSession();

  // Infer keys from the admin routes (assuming symmetric structure)
  type RouteKeys = keyof typeof routesByRole.admin;

  // Return type infers keys and ensures route types
  type Routes = Record<RouteKeys, RoleRoute> | null;

  // Compute the role-based routes
  return computed((): Routes => {
    if (!loggedIn.value || !user.value) {
      return null;
    }
    return routesByRole[user.value.role as keyof typeof routesByRole] || routesByRole.student;
  });
}
