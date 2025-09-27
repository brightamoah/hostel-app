export function getColorClass(color: string, type: "text" | "border" | "bg" | "ring" | "border-b" | "border-t", opacity?: number): string {
  const colorMap: Record<string, string> = {
    primary: "primary",
    error: "error",
    warning: "warning",
    info: "info",
    success: "success",
    neutral: "neutral",
  };
  const baseColor = colorMap[color] || "gray-500";

  switch (type) {
    case "text":
      return opacity ? `text-${baseColor}/${opacity}` : `text-${baseColor}`;
    case "border":
      return `border-${baseColor}`;
    case "bg":
      return opacity ? `bg-${baseColor}/${opacity}` : `bg-${baseColor}`;
    case "ring":
      return `ring-${baseColor}`;
    case "border-b":
      return `border-b-${baseColor}`;
    case "border-t":
      return `border-t-${baseColor}`;
    default:
      return "";
  }
}
