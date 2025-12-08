export const maintenanceTypeIconMap: Record<MaintenanceType["issueType"], string> = {
  "plumbing": "i-lucide-shower-head",
  "electrical": "i-lucide-plug-zap",
  "furniture": "i-lucide-sofa",
  "cleaning": "i-lucide-brush-cleaning",
  "appliance": "i-lucide-air-vent",
  "structural": "i-lucide-house",
  "pest control": "i-lucide-bug",
  "internet/Wi-Fi": "i-lucide-wifi",
  "other": "i-lucide-wrench",
};

export const priorityColorMap: Record<MaintenanceType["priority"], ColorType> = {
  low: "success",
  medium: "info",
  high: "warning",
  emergency: "error",
};

export const maintenanceStatusColorMap: Record<MaintenanceType["status"], ColorType> = {
  "in-progress": "secondary",
  "assigned": "neutral",
  "completed": "success",
  "pending": "warning",
  "rejected": "error",
};

export const visitorStatusColorMap: Record<VisitorType["status"], ColorType> = {
  "pending": "warning",
  "approved": "info",
  "checked-in": "success",
  "checked-out": "neutral",
  "cancelled": "error",
  "denied": "error",
};

export const complaintTypeIconMap: Record<Complaint["type"], string> = {
  "amenities": "i-lucide-plug-zap",
  "noise": "i-lucide-volume-2",
  "security": "i-lucide-door-closed-locked",
  "billing issue": "i-lucide-banknote",
  "room condition": "i-lucide-door-open",
  "staff behavior": "i-lucide-users",
  "other": "i-lucide-panel-bottom-dashed",
};

export const complaintStatusColorMap: Record<Complaint["status"], ColorType> = {
  "in-progress": "info",
  "pending": "warning",
  "resolved": "success",
  "rejected": "error",
};

type CharStatus = "normal" | "warning" | "error";

interface CharCountInfo {
  description: ColorType | "muted";
  progress: ColorType;
}

export const charCountMap: Record<CharStatus, CharCountInfo> = {
  normal: {
    description: "muted",
    progress: "success",
  },
  warning: {
    description: "warning",
    progress: "warning",
  },
  error: {
    description: "error",
    progress: "error",
  },
};
