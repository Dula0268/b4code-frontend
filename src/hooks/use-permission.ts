import { useRBACStore } from "@/store/auth/rbac.store";
import { useAuthStore } from "@/store/auth/auth.store";

/**
 * Returns true if the given permission key is enabled for the current user's role.
 * Falls back to `true` while the permissions are still loading (fail-open by default).
 * Pass `failOpen = false` to hide features until permissions are confirmed.
 */
export function usePermission(permissionKey: string, failOpen = true): boolean {
  const { user } = useAuthStore();
  const { permissionsData, loading } = useRBACStore();

  if (!user?.role) return failOpen;

  // Capitalise first letter to match seeded role names: "staff" -> "Staff"
  const role = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
  const roleData = permissionsData[role];

  // While loading for the first time, respect the failOpen default
  if (!roleData) return failOpen;

  // Search across all sections for the key
  const allPermissions = [
    ...(roleData.permissions?.user ?? []),
    ...(roleData.permissions?.financial ?? []),
    ...(roleData.permissions?.system ?? []),
  ];

  const match = allPermissions.find((p) => p.key === permissionKey);
  // If key not found in DB (new feature), default to enabled
  return match ? match.enabled : true;
}

/**
 * Convenience hook that fetches permissions for the current user role if not yet loaded.
 * Call this once in a layout/guard component.
 */
export function useEnsurePermissions() {
  const { user } = useAuthStore();
  const { permissionsData, loading, fetchMyPermissions } = useRBACStore();

  if (!user?.role || loading) return;

  const role = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
  if (!permissionsData[role]) {
    fetchMyPermissions(role);
  }
}
