import StaffSidebar from "@/components/features/staff/layout/staff-sidebar";

interface StaffPageLayoutProps {
  children: React.ReactNode;
}

export default function StaffPageLayout({ children }: StaffPageLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f6f5]">
      {/* Fixed Sidebar */}
      <StaffSidebar />

      {/* Right side: header + page content */}
      <div className="ml-[260px] flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
