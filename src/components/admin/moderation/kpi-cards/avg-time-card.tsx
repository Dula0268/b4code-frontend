import { Clock } from "lucide-react";

export default function AvgTimeCard() {
  return (
    <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">
          Avg Time
        </h3>
        <div className="p-2.5 bg-[#F3F4F6] rounded-xl self-start group-hover:scale-110 transition-transform">
          <Clock size={18} className="text-[#6B7280]" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
          -
        </p>
      </div>
    </div>
  );
}
