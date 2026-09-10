"use client";

import OwnerSidebar from "@/components/owner/layout/owner-sidebar";
import RoleGuard from "@/components/shared/auth/role-guard";

interface OwnerPageLayoutProps {
  children: React.ReactNode;
}

export default function OwnerPageLayout({ children }: OwnerPageLayoutProps) {
  return (
    <RoleGuard allowedRoles={["owner", "admin"]}>
      <div className="flex h-screen overflow-hidden bg-[#FAFBFC]">
        {/* Fixed Sidebar */}
        <OwnerSidebar />

        {/* Right side: header + page content */}
        <div className="ml-0 lg:ml-[260px] flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#F5F6F8]">
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
