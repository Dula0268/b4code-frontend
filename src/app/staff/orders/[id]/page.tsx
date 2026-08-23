import StaffOrderDetail from "@/components/staff/orders/staff-order-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}


export default async function StaffOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
      <div className="flex-1 min-h-0 flex flex-col">
        <StaffOrderDetail orderId={id} />
      </div>
  );
}

