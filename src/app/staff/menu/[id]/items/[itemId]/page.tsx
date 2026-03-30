"use client";

import { useParams } from "next/navigation";
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffMenuItemForm from "@/components/features/staff/menu/staff-menu-item-form";

export default function EditItemPage() {
  const params = useParams();
  const menuId = params.id as string;
  const itemId = params.itemId as string;

  return (
    <StaffPageLayout>
      <StaffMenuItemForm menuId={menuId} itemId={itemId} />
    </StaffPageLayout>
  );
}
