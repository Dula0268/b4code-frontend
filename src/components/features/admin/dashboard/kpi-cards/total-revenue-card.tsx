import { DollarSign } from "lucide-react";
import KpiCard from "../kpi-card";

interface TotalRevenueCardProps {
  value: string;
  change: string;
  positive: boolean;
}

export default function TotalRevenueCard({
  value,
  change,
  positive,
}: TotalRevenueCardProps) {
  return (
    <KpiCard
      label="Total Revenue"
      value={value}
      change={change}
      positive={positive}
      icon={<DollarSign size={20} color="var(--brand-primary)" />}
      iconBg="rgba(149,48,2,0.1)"
    />
  );
}
