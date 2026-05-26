import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import StaffOrderDetail from "@/components/staff/orders/staff-order-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}


export default async function StaffOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <StaffPageLayout>
      <div className="h-full">
        <StaffOrderDetail orderId={id} />
      </div>
    </StaffPageLayout>
  );
}

