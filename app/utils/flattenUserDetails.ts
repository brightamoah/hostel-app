import { useDateFormat } from "@vueuse/core";

import type { UserType } from "~/types";

type UserDetailValue = string | number | boolean | Date | null | undefined;

interface UserDetail {
  key: string;
  value: UserDetailValue;
}

/**
 * Formats a camelCase string into a human-readable, title-cased string.
 *
 * This function inserts a space before each uppercase letter and then
 * capitalizes the first letter of the resulting string.
 *
 * @param key The camelCase string to format (e.g., 'firstName').
 * @returns A formatted, title-cased string (e.g., 'First Name').
 *
 * @example
 * ```ts
 * formatDetailKey('firstName'); // returns 'First Name'
 * formatDetailKey('addressLine1'); // returns 'Address Line1'
 * ```
 */
function formatDetailKey(key: string): string {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function formatDetailValue(value: UserDetailValue): string {
  if (value instanceof Date) {
    return useDateFormat(value, "Do MMMM, YYYY").value;
  }

  const stringValue = String(value);

  // Skip capitalization for numbers or numeric strings
  if (typeof value === "number" || !Number.isNaN(Number(stringValue))) {
    return stringValue;
  }

  // Capitalize the first letter for other strings
  if (stringValue.length > 0) {
    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
  }

  return stringValue;
}

export function flattenUserDetails(user: UserType): UserDetail[] {
  const dataToProcess = {
    ...user,
    ...(user.role === "student" && user.student),
    ...(user.role === "admin" && user.admin),
  };

  const excludeKeys = new Set([
    "id",
    "student",
    "admin",
    "isEmailVerified",
    "createdAt",
    "updatedAt",
    "emergencyContactName",
    "allocation",
    "emergencyContactPhoneNumber",
  ]);

  const formatters: Record<string, (value: any) => UserDetailValue> = {
    dateOfBirth: value => useDateFormat(value, "Do MMMM, YYYY").value,
    enrollmentDate: value => useDateFormat(value, "Do MMMM, YYYY").value,
  };

  const details = Object.entries(dataToProcess)
    .filter(([key, value]) => value !== null && typeof value !== "boolean" && !excludeKeys.has(key))
    .map(([key, value]): UserDetail => ({
      key: formatDetailKey(key),
      value: formatters[key] ? formatters[key](value) : formatDetailValue(value as UserDetailValue),
    }));

  if (user.role === "student" && user.student) {
    const { emergencyContactName, emergencyContactPhoneNumber } = user.student;

    details.push({
      key: "Emergency Contact",
      value: (emergencyContactName && emergencyContactPhoneNumber) ? `${emergencyContactName} (${emergencyContactPhoneNumber})` : "N/A",
    });

    details.push({
      key: "Room",
      value: (user.hostelName && user.student.roomNumber) ? `${user.hostelName} - ${user.student.roomNumber}` : "N/A",
    });
  }

  details.push({
    key: "Email Verified",
    value: user.isEmailVerified ? "Yes" : "No",
  });

  details.push({
    key: "Hostel Name",
    value: user.hostelName ?? "N/A",
  });

  return details;
}
