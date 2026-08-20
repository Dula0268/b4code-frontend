import AdminPageLayout from "@/components/admin/admin-page-layout";
import AdminProfileLayout from "@/components/admin/profile/admin-profile-layout";

export default function AdminProfileRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPageLayout adminName="Admin Profile">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <AdminProfileLayout>{children}</AdminProfileLayout>
      </div>
    </AdminPageLayout>
  );
}
