"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogoutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleLogout = () => {
      setIsOpen(true);
    };

    window.addEventListener("trigger-admin-logout", handleLogout);
    return () => window.removeEventListener("trigger-admin-logout", handleLogout);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 text-green-500">
          <CheckCircle2 size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-[#1c1917] mb-2">
          Logged Out Successfully
        </h2>
        
        <p className="text-[#78716c] mb-8 leading-relaxed">
          You have successfully logged out of the admin portal. Thank you for using our platform!
        </p>
        
        <Button 
          className="w-full h-12 rounded-full bg-[#953002] hover:bg-[#7a2702] text-white font-medium text-[15px] transition-colors"
          onClick={() => {
            logout();
            setIsOpen(false);
            window.location.href = "/";
          }}
        >
          Back to Home Page
        </Button>
      </div>
    </div>
  );
}
