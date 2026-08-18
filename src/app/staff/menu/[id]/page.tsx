"use client";

import { useParams, useSearchParams } from "next/navigation";
import StaffMenuEdit from "@/components/staff/menu/staff-menu-edit";
import StaffMenuForm from "@/components/staff/menu/staff-menu-form";

export default function MenuDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const paramsResolved = useParams();
  const searchParamsResolved = useSearchParams();
  const menuId = paramsResolved.id as string;
  const isEditDetails = searchParamsResolved.get("edit") === "true";

  return (
    <>
      {isEditDetails ? <StaffMenuForm menuId={menuId} /> : <StaffMenuEdit menuId={menuId} />}
    </>
  );
}
