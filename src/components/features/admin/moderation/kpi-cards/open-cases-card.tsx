import { FolderOpen } from "lucide-react";

export default function OpenCasesCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#9E7B6A] font-normal leading-none m-0">
          Open Cases
        </p>
        <div className="w-10 h-10 rounded-xl bg-[#FDEADE] flex items-center justify-center">
          <FolderOpen size={18} className="text-[#C05621]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        14
      </p>
      <p className="text-[12px] text-[#9E7B6A] m-0">
        Active disputes requiring attention
      </p>
    </div>
  );
}
