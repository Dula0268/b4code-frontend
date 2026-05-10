"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth/auth.store";

export default function LogoutSuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleLogout = () => {
      setIsOpen(true);
    };

    window.addEventListener("trigger-staff-logout", handleLogout);
    return () => window.removeEventListener("trigger-staff-logout", handleLogout);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 text-green-500">
          <CheckCircle2 size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-[#1c1917] mb-2">
          Logged Out Successfully
        </h2>
        
        <p className="text-[#78716c] mb-8 leading-relaxed">
          You have been successfully logged out of the staff portal. Have a great day!
        </p>
        
        <Button 
          className="w-full h-12 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-[15px] transition-colors"
          onClick={() => {
            logout();
            setIsOpen(false);
            window.location.href = "/";
          }}
        >
          Go to Home Page
        </Button>
      </div>
    </div>
  );
}
