import { CalendarCheck } from "lucide-react";
import KpiCard from "../kpi-card";

interface ActiveBookingsCardProps {
  value: string;
  change: string;
  positive: boolean;
}

export default function ActiveBookingsCard({
  value,
  change,
  positive,
}: ActiveBookingsCardProps) {
  return (
    <KpiCard
      label="Active Bookings"
      value={value}
      change={change}
      positive={positive}
      icon={<CalendarCheck size={20} color="#27ae60" />}
      iconBg="rgba(39,174,96,0.1)"
    />
  );
}
