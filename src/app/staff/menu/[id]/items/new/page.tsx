"use client";

import { useParams } from "next/navigation";
import StaffMenuItemForm from "@/components/staff/menu/staff-menu-item-form";

export default function NewItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsResolved = useParams();
  const menuId = paramsResolved.id as string;

  return (
      <StaffMenuItemForm menuId={menuId} />
  );
}
