import {
  BackendPropertyStatus,
  PROPERTY_STATUS_COLORS,
  PROPERTY_STATUS_LABELS,
} from "@/models/owner";

interface PropertyStatusBadgeProps {
  status: BackendPropertyStatus | string;
  size?: "sm" | "md";
}

export default function PropertyStatusBadge({ status, size = "md" }: PropertyStatusBadgeProps) {
  const s = status as BackendPropertyStatus;
  const colors = PROPERTY_STATUS_COLORS[s] ?? PROPERTY_STATUS_COLORS.PENDING;
  const label = PROPERTY_STATUS_LABELS[s] ?? status;
  const sizeClasses = size === "sm" ? "text-[11px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${colors.text} ${colors.bg} ${colors.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
      {label}
    </span>
  );
}
