import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

export default function KpiCard({
  label,
  value,
  change,
  positive,
  icon,
  iconBg,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
      {/* Top row */}
      <div className="flex justify-between items-start">
        <span className="text-[13px] text-[var(--gray-3)] font-medium">
          {label}
        </span>
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
      </div>
      {/* Value */}
      <p className="text-[26px] font-bold text-[var(--black-2)] m-0 leading-none">
        {value}
      </p>
      {/* Change */}
      <div className="flex items-center gap-1.5">
        {positive ? (
          <TrendingUp size={14} color="#27ae60" />
        ) : (
          <TrendingDown size={14} color="#eb5757" />
        )}
        <span
          className="text-[13px] font-semibold"
          style={{ color: positive ? "#27ae60" : "#eb5757" }}
        >
          {change}
        </span>
        <span className="text-[13px] text-[var(--gray-4)]">vs last month</span>
      </div>
    </div>
  );
}
