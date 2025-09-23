import { generateInitials } from "~/utils/generateInitials";

export function useUseUserItems() {
  const { user } = useUserSession();

  const userInitials = computed(() => {
    if (!user.value?.name)
      return "KH";
    return generateInitials(user.value.name);
  });

  const avatarBgColor = computed(() =>
    generateUserColor(user.value?.id ?? "default"),
  );
  const userBadgeColor = computed(() => {
    if (!user.value)
      return "neutral";
    return user.value?.role === "admin" ? "success" : "primary";
  });

  return { userInitials, avatarBgColor, userBadgeColor };
}
