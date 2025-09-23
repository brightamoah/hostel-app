import { createSharedComposable } from "@vueuse/core";

import { useRoleBasedRoute } from "./useRoleBasedRoutes";

function _useDashboard() {
  const route = useRoute();
  const router = useRouter();
  const isNotificationsSlideoverOpen = ref(false);

  const roleBasedRoutes = useRoleBasedRoute();

  defineShortcuts({
    "g-h": () =>
      router.push(roleBasedRoutes.value!.dashboard),
    "g-u": () => router.push(roleBasedRoutes.value!.users),
    "g-v": () => router.push(roleBasedRoutes.value!.visitors),
    "g-s": () => router.push("/settings"),
    "n": () => isNotificationsSlideoverOpen.value = !isNotificationsSlideoverOpen.value,
  });

  watch(() => route.fullPath, () => {
    isNotificationsSlideoverOpen.value = false;
  });

  return {
    isNotificationsSlideoverOpen,
  };
}

export const useDashboard = createSharedComposable(_useDashboard);
