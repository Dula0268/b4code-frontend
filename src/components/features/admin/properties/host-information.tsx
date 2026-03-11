"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Phone, Mail, Calendar, Globe } from "lucide-react";

// ─── Host Information Component ───────────────────────────────────────────────
export default function HostInformation() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <h3 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-4">
        Host Information
      </h3>

      <div className="bg-white border border-[#E8DDD8] rounded-xl p-5">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden shrink-0 border-[3px] border-[#3B82F6]">
            <Image
              src="/images/properties/host-avatar.png"
              alt="Host Avatar"
              fill
              className="object-cover"
            />
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[16px] text-[#1A1A1A]">
                Sarah Jenkins
              </span>
              <CheckCircle2 size={16} className="text-[#3B82F6]" />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#9E7B6A] mb-0.5">
              <Calendar size={12} />
              <span>Member since 2021</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#9E7B6A]">
              <Mail size={12} />
              <span>sarah.j@example.com</span>
            </div>
          </div>

          {/* Contact & listings */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
              <Phone size={12} />
              <span>+1 (555) 019-2834</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
              <Globe size={12} />
              <span>3 Previous Listings (All Approved)</span>
            </div>
          </div>

          {/* View Profile Button */}
          <button
            onClick={() => router.push("/admin/users/1")}
            className="px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#E8DDD8] bg-white text-[13px] font-semibold text-[#1A1A1A] cursor-pointer hover:border-[#C05621] hover:text-[#C05621] transition-colors shrink-0"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
