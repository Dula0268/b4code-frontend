import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffHeader from "@/components/features/staff/layout/staff-header";
import ProfileLayout from "@/components/features/staff/profile/profile-layout";

export default function StaffProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffPageLayout>
      <StaffHeader
        title="Settings"
        subtitle="Manage your profile and security preferences."
        searchPlaceholder="Search settings..."
      />
      <main className="mt-[72px] flex-1 p-8 overflow-y-auto w-full h-full bg-[#f8f6f5]">
        <ProfileLayout>{children}</ProfileLayout>
      </main>
    </StaffPageLayout>
  );
}
