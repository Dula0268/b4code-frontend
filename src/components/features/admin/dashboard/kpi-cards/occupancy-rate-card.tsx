import { Home } from "lucide-react";
import KpiCard from "../kpi-card";

interface OccupancyRateCardProps {
  value: string;
  change: string;
  positive: boolean;
}

export default function OccupancyRateCard({
  value,
  change,
  positive,
}: OccupancyRateCardProps) {
  return (
    <KpiCard
      label="Occupancy Rate"
      value={value}
      change={change}
      positive={positive}
      icon={<Home size={20} color="#2f80ed" />}
      iconBg="rgba(47,128,237,0.1)"
    />
  );
}
