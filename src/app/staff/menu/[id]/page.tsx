"use client";

import { useParams, useSearchParams } from "next/navigation";
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffMenuEdit from "@/components/features/staff/menu/staff-menu-edit";
import StaffMenuForm from "@/components/features/staff/menu/staff-menu-form";

export default function MenuDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const menuId = params.id as string;
  const isEditDetails = searchParams.get("edit") === "true";

  return (
    <StaffPageLayout>
      {isEditDetails ? <StaffMenuForm menuId={menuId} /> : <StaffMenuEdit menuId={menuId} />}
    </StaffPageLayout>
  );
}
