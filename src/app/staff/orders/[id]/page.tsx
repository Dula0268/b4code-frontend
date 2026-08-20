import StaffOrderDetail from "@/components/staff/orders/staff-order-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}


export default async function StaffOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
      <div className="h-full">
        <StaffOrderDetail orderId={id} />
      </div>
  );
}

