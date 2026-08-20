import StaffHeader from "@/components/staff/layout/staff-header";
import ProfileLayout from "@/components/staff/profile/profile-layout";

export default function StaffProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StaffHeader
        title="Settings"
        subtitle="Manage your profile and security preferences."
        searchPlaceholder="Search settings..."
      />
      <main className="mt-[64px] flex-1 p-5 overflow-y-auto w-full h-full bg-[#F5F6F8]">
        <ProfileLayout>{children}</ProfileLayout>
      </main>
    </>
  );
}
