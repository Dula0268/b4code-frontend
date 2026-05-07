import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffOrderQueue from "@/components/features/staff/orders/staff-order-queue";

export default function StaffOrdersPage() {
  return (
    <StaffPageLayout>
      <main className="flex-1 flex flex-col">
        <StaffOrderQueue />
      </main>
    </StaffPageLayout>
  );
}
