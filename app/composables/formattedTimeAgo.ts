import type { UseTimeAgoMessages } from "@vueuse/core";

import { useTimeAgo } from "@vueuse/core";

export function useFormattedTimeAgo(
  time: MaybeRefOrGetter<Date | number | string>,
  isMobile: MaybeRefOrGetter<boolean>,
) {
  const mobile = unref(isMobile);

  const mobileMessages: UseTimeAgoMessages = {
    justNow: "now",

    past: n => n.replace(/\s.+$/, ""),
    future: n => n.replace(/\s.+$/, ""),

    month: n => `${n}mo`,
    year: n => `${n}y`,
    day: n => `${n}d`,
    week: n => `${n}w`,
    hour: n => `${n}h`,
    minute: n => `${n}m`,
    second: n => `${n}s`,

    invalid: "",
  };

  const fullMessages: UseTimeAgoMessages = {
    justNow: "just now",

    past: n => (/\d/.test(n) ? `${n} ago` : n),
    future: n => (/\d/.test(n) ? `in ${n}` : n),

    month: (n, past) =>
      n === 1 ? (past ? "last month" : "next month") : `${n} months`,

    year: (n, past) =>
      n === 1 ? (past ? "last year" : "next year") : `${n} years`,

    day: (n, past) =>
      n === 1 ? (past ? "yesterday" : "tomorrow") : `${n} days`,

    week: (n, past) =>
      n === 1 ? (past ? "last week" : "next week") : `${n} weeks`,

    hour: n => `${n} hour${n > 1 ? "s" : ""}`,
    minute: n => `${n} minute${n > 1 ? "s" : ""}`,
    second: n => `${n} second${n > 1 ? "s" : ""}`,

    invalid: "",
  };

  const timeAgo = useTimeAgo(time, {
    messages: mobile ? mobileMessages : fullMessages,
  });

  return timeAgo;
}
