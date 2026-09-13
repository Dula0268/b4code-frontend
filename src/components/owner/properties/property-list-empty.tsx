"use client";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PropertyListEmptyProps {
  filtered?: boolean;
}

export default function PropertyListEmpty({ filtered }: PropertyListEmptyProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#FEF3C7] flex items-center justify-center mb-5 shadow-sm">
        <Building2 size={36} className="text-[#D97706]" />
      </div>
      <p className="text-[18px] font-bold text-[#1A1A1A] mb-2">
        {filtered ? "No properties match your filter" : "No properties yet"}
      </p>
      <p className="text-[14px] text-[#9E7B6A] max-w-xs mb-6">
        {filtered
          ? "Try changing the filter tabs or clearing the search to see more properties."
          : "Create your first property listing and start accepting bookings."}
      </p>
      {!filtered && (
        <button
          onClick={() => router.push("/owner/properties/new")}
          className="px-6 py-3 rounded-xl bg-[#953002] text-white text-[14px] font-bold hover:opacity-90 transition-all shadow-sm hover:-translate-y-0.5"
        >
          + Add Your First Property
        </button>
      )}
    </div>
  );
}
