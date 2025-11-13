import { useDateFormat } from "@vueuse/core";

export function checkInCheckOutChecks(visitor: VisitorType, action: "check_in" | "check_out"): boolean {
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];
  const lastLog = visitor.visitorLogs?.[0];
  const allowedStatusesForCheckIn: AllowedStatusesForCheckIn[] = ["approved", "checked-out"];

  const showWarningToast = (description: string) => {
    toast.add({
      title: "Action Denied",
      description,
      color: "warning",
      icon: "i-lucide-triangle-alert",
      duration: 8000,
    });
  };

  if (action === "check_in") {
    if (!allowedStatusesForCheckIn.includes(visitor.status as AllowedStatusesForCheckIn)) {
      showWarningToast(`Cannot check in. Visitor status is currently '${visitor.status}'.`);
      return false;
    }
    if (visitor.visitDate !== today) {
      showWarningToast(`This visitor is scheduled for ${useDateFormat(visitor.visitDate, "dddd DD-MMM-YYYY").value}, not today.`);
      return false;
    }
    if (lastLog?.action === "check_in") {
      showWarningToast("This visitor is already checked in.");
      return false;
    }
  }
  else { // check_out
    if (visitor.status !== "checked-in") {
      showWarningToast("This visitor is not currently checked in.");
      return false;
    }
    if (lastLog?.action !== "check_in") {
      showWarningToast("Cannot check out a visitor who is not checked in.");
      return false;
    }
  }

  return true;
}
