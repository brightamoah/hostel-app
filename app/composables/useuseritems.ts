import { generateInitials } from "~/utils/generateInitials";

export function useUseUserItems() {
  const { user } = useUserSession();

  const userInitials = computed(() => {
    if (!user.value?.name) return "KH";
    return generateInitials(user.value.name);
  });

  const avatarBgColor = computed(() => {
    if (!user.value || !user.value.id) return "gray";

    const color = generateUserColor(user.value?.id);
    return color;
  });

  const userBadgeColor = computed(() => {
    if (!user.value) return "neutral";
    return user.value?.role === "admin" ? "success" : "primary";
  });

  return { userInitials, avatarBgColor, userBadgeColor };
}
