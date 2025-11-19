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

export const maintenancePriorityColorMap: Record<MaintenanceType["priority"], ColorType> = {
  low: "success",
  medium: "info",
  high: "warning",
  emergency: "error",
};

export const maintenanceStatusColorMap: Record<MaintenanceType["status"], ColorType> = {
  "in-progress": "secondary",
  "assigned": "info",
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
