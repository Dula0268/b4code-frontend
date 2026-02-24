import AdminSidebar from "@/components/features/admin/admin-sidebar";
import AdminHeader from "@/components/features/admin/admin-header";

interface AdminPageLayoutProps {
  children: React.ReactNode;
  adminName?: string;
  avatarSrc?: string;
}

export default function AdminPageLayout({
  children,
  adminName = "Admin",
  avatarSrc,
}: AdminPageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F6F8F7]">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Right side: header + page content */}
      <div className="ml-[260px] flex-1 flex flex-col">
        {/* Fixed Header */}
        <AdminHeader adminName={adminName} avatarSrc={avatarSrc} />

        {/* Page Content — padded down below the fixed header */}
        <main className="mt-[68px] p-7 flex-1">{children}</main>
      </div>
    </div>
  );
}
