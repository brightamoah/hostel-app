import type { FormErrorEvent } from "@nuxt/ui";

export function useHandleFormError(event: FormErrorEvent) {
  const toast = useToast();

  const messages = event.errors.map(e => e.message).join(", ");
  toast.add({
    title: "Form Validation Error",
    description: messages,
    color: "error",
    icon: "i-lucide-circle-alert",
  });
}
