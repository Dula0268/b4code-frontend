"use client";

import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  userRole?: string;
  requiredRole: string;
}

export default function AccessDenied({ userRole, requiredRole }: AccessDeniedProps) {
  const router = useRouter();

  const getDashboardPath = () => {
    switch (userRole?.toLowerCase()) {
      case "staff": return "/staff";
      case "admin": return "/admin";
      case "owner": return "/owner";
      case "guest": return "/guest/booking/my-bookings";
      default: return "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf9] p-6">
      <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#f3f0ee] text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-[#953002]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[#953002]">
          <Lock size={40} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-black text-[#1c1917] mb-4">Access Restricted</h1>
        
        <p className="text-[#78716c] mb-10 leading-relaxed text-[15px]">
          You are currently signed in as <span className="font-bold text-[#953002] uppercase">{userRole || "unknown"}</span>. 
          This section is reserved exclusively for <span className="font-bold text-[#1c1917] uppercase">{requiredRole}</span> accounts.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push(getDashboardPath())}
            className="h-14 rounded-full bg-[#953002] hover:bg-[#7a2702] text-white font-bold text-base shadow-lg shadow-[#953002]/20 transition-all"
          >
            <LayoutDashboard className="mr-2" size={20} />
            Go to My Dashboard
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => router.back()}
            className="h-14 rounded-full text-[#78716c] font-bold hover:bg-[#fcfaf9]"
          >
            <ArrowLeft className="mr-2" size={18} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
