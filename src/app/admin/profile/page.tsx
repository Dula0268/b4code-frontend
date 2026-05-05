"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "Alex",
    lastName: "Moore",
    email: "admin@primestay.com",
    phone: "+94 77 123 4567",
    department: "System Operations",
    employeeId: "ADM-99321",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const emailToUse = user?.email || "admin@primestay.com";
      const newName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile(emailToUse, { name: newName });
      
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1c1917] mb-2">Personal Details</h1>
        <p className="text-[#78716c]">Update your personal information and contact details.</p>
      </div>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="text-green-500" size={20} />
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">First Name</label>
            <Input 
              name="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">Last Name</label>
            <Input 
              name="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Email Address</label>
          <div className="relative">
            <Input 
              name="email" 
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="h-11 bg-[#fdfaf8] border-[#e7e5e4] pr-20 focus-visible:ring-[#953002]/20" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 size={12} /> Verified
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Phone Number</label>
          <Input 
            name="phone" 
            value={formData.phone}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 max-w-md" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">Department</label>
            <Input 
              name="department" 
              value={formData.department}
              disabled
              className="h-11 bg-[#f5f5f4] border-[#e7e5e4] text-[#78716c] cursor-not-allowed" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">Employee / Admin ID</label>
            <Input 
              name="employeeId" 
              value={formData.employeeId}
              disabled
              className="h-11 bg-[#f5f5f4] border-[#e7e5e4] text-[#78716c] cursor-not-allowed" 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[#f3f4f6] flex justify-end">
          <Button 
            type="submit" 
            className="bg-[#953002] hover:bg-[#7a2702] text-white px-8 transition-colors h-11"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
