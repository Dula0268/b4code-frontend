"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOwnerGuard } from "@/hooks/use-owner-guard";
import AccessDenied from "@/components/shared/auth/access-denied";
import { useAuthStore } from "@/store/auth/auth.store";
import { useRBACStore } from "@/store/auth/rbac.store";
import { usePermission } from "@/hooks/use-permission";

export default function OwnerPage() {
  const { ready, status, userRole } = useOwnerGuard();
  const router = useRouter();

  // Load permissions for Owner role
  const { user } = useAuthStore();
  const { permissionsData, loading, fetchMyPermissions } = useRBACStore();

  useEffect(() => {
    if (!user?.role || loading) return;
    const role = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
    if (!permissionsData[role]) {
      fetchMyPermissions(role);
    }
  }, [user, permissionsData, loading, fetchMyPermissions]);

  const canViewPayouts = usePermission("view_payouts");
  const canManageStaff = usePermission("manage_staff");
  const canManageListings = usePermission("manage_listings");
  const canManageAvailability = usePermission("manage_availability");

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Owner" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F6F8F7]">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-[28px] font-bold text-[#282828]">Owner Portal</h1>
        <p className="text-sm text-[#666]">Manage your properties, availability and payouts.</p>
        <div className="flex gap-3 justify-center mt-2 flex-wrap">
          {canManageListings && (
            <button
              onClick={() => router.push("/owner/listings")}
              className="px-5 py-2.5 rounded-full bg-[#953002] text-white text-sm font-semibold hover:bg-[#7a2600]"
            >
              My Listings
            </button>
          )}
          {canManageAvailability && (
            <button
              onClick={() => router.push("/owner/availability")}
              className="px-5 py-2.5 rounded-full border border-[#953002] text-[#953002] text-sm font-semibold hover:bg-[rgba(149,48,2,0.08)]"
            >
              Availability
            </button>
          )}
          {canViewPayouts && (
            <button
              onClick={() => router.push("/owner/payouts")}
              className="px-5 py-2.5 rounded-full border border-[#953002] text-[#953002] text-sm font-semibold hover:bg-[rgba(149,48,2,0.08)]"
            >
              Payouts
            </button>
          )}
          {canManageStaff && (
            <button
              onClick={() => router.push("/owner/staff")}
              className="px-5 py-2.5 rounded-full border border-[#953002] text-[#953002] text-sm font-semibold hover:bg-[rgba(149,48,2,0.08)]"
            >
              Staff Management
            </button>
          )}
        </div>
      </div>
    </div>
  );
}