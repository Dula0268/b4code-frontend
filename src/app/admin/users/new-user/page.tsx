"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ActiveUser from "@/components/admin/users/new-user/active-user";
import UserForm from "@/components/admin/users/new-user/user-form";

const mockUser = {
  name: "Alex Doe",
  role: "Property Owner",
  avatarColor: "#4f9cf9",
  avatarInitial: "A",
  isActive: true,
  memberSince: "Nov 2023",
  lastLogin: "2 hours ago",
};

const mockFormData = {
  fullName: "Alex Doe",
  email: "alex.doe@primestay.com",
  phone: "+1 (555) 000-1234",
  role: "Property Owner",
  timezone: "Pacific Time (US & Canada)",
};

export default function NewUserPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      {/* Centered container */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-6 text-sm">
          <Link
            href="/admin/users"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            User Management
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-(--brand-primary) font-semibold">
            Assign Role
          </span>
        </nav>

        {/* Outer card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left — Active User card */}
            <div className="w-full lg:w-55 shrink-0">
              <ActiveUser user={mockUser} />
            </div>

            {/* Right — General Information form */}
            <div className="flex-1 min-w-0">
              <UserForm
                initialData={mockFormData}
                onCancel={() => window.history.back()}
                onSave={(data) => {
                  console.log("Saved:", data);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
