import StaffSidebar from "@/components/features/staff/staff-sidebar";
import StaffHeader from "@/components/features/staff/staff-header";

interface StaffPageLayoutProps {
  children: React.ReactNode;
  staffName?: string;
  avatarSrc?: string;
}

export default function StaffPageLayout({
  children,
  staffName = "Staff Member",
  avatarSrc,
}: StaffPageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F6F8F7]">
      <StaffSidebar />

      <div className="ml-65 flex-1 flex flex-col">
        <StaffHeader staffName={staffName} avatarSrc={avatarSrc} />

        <main className="mt-17 p-7 flex-1">{children}</main>
      </div>
    </div>
  );
}
