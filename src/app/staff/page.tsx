import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffHeader from "@/components/features/staff/layout/staff-header";
import StaffDashboard from "@/components/features/staff/dashboard/staff-dashboard";

export default function StaffPage() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <StaffPageLayout>
      <StaffHeader
        title="Staff Dashboard"
        subtitle={`Operational Overview • ${today}`}
        searchPlaceholder="Search order #, room, or item..."
      />
      <main className="mt-[72px] flex-1">
        //staff dashboard 
        <StaffDashboard />
      </main>
    </StaffPageLayout>
  );
}
