import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffOrderDetail from "@/components/features/staff/orders/staff-order-detail";

interface PageProps {
  params: { id: string };
}


export default async function StaffOrderDetailPage({ params }: PageProps) {
  const { id } = params;

  return (
    <StaffPageLayout>
      <div className="h-full">
        <StaffOrderDetail orderId={id} />
      </div>
    </StaffPageLayout>
  );
}

