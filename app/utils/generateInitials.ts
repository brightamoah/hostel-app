import type { User } from "#auth-utils";

export function generateInitials(name: User["name"]) {
  const namesArray = name.trim().split(" ").filter(n => n.length > 0);
  if (namesArray.length === 0)
    return "";

  if (namesArray.length === 1) {
    const singleName = namesArray[0];
    if (singleName && singleName.length >= 2) {
      return singleName.charAt(0).toUpperCase() + singleName.charAt(1).toUpperCase();
    }
    return singleName ? singleName.charAt(0).toUpperCase() : "";
  }

  const firstInitial = namesArray[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = namesArray[namesArray.length - 1]?.charAt(0).toUpperCase() || "";
  return firstInitial + lastInitial;
}
