"use client";

import { useParams } from "next/navigation";
import StaffMenuItemForm from "@/components/staff/menu/staff-menu-item-form";

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const paramsResolved = useParams();
  const menuId = paramsResolved.id as string;
  const itemId = paramsResolved.itemId as string;

  return (
      <StaffMenuItemForm menuId={menuId} itemId={itemId} />
  );
}
