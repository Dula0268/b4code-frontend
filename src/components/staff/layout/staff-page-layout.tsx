import StaffSidebar from "@/components/staff/layout/staff-sidebar";
import RoleGuard from "@/components/shared/auth/role-guard";

interface StaffPageLayoutProps {
  children: React.ReactNode;
}

export default function StaffPageLayout({ children }: StaffPageLayoutProps) {
  return (
    <RoleGuard allowedRoles={["staff", "admin", "owner"]}>
      <div className="flex h-screen overflow-hidden bg-[#f8f6f5]">
        {/* Fixed Sidebar */}
        <StaffSidebar />

        {/* Right side: header + page content */}
        <div className="ml-[260px] flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
