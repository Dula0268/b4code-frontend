import api from '@/lib/axios';

const ADMIN_ENDPOINT = "/admin/settings/permissions";
const SELF_ENDPOINT = "/settings/permissions/me";

export interface Permission {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface RolePermissionsDto {
  permissions: {
    user?: Permission[];
    financial?: Permission[];
    system?: Permission[];
  };
}

export const SettingsApi = {
  // Admin-only: fetch permissions for any role
  getRolePermissions: (role: string): Promise<RolePermissionsDto> =>
    api.get(`${ADMIN_ENDPOINT}/${role}`).then((res) => res.data),

  // Admin-only: update permissions for a role
  updateRolePermissions: (role: string, updates: Record<string, boolean>): Promise<RolePermissionsDto> =>
    api.put(`${ADMIN_ENDPOINT}/${role}`, updates).then((res) => res.data),

  // Self-service: any authenticated user fetches their own role's permissions
  getMyPermissions: (): Promise<RolePermissionsDto> =>
    api.get(SELF_ENDPOINT).then((res) => res.data),
};
