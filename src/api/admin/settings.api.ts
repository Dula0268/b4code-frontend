import api from '@/lib/axios';

const API_ENDPOINT = "/admin/settings/permissions";

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
  getRolePermissions: (role: string): Promise<RolePermissionsDto> =>
    api.get(`${API_ENDPOINT}/${role}`).then((res) => res.data),

  updateRolePermissions: (role: string, updates: Record<string, boolean>): Promise<RolePermissionsDto> =>
    api.put(`${API_ENDPOINT}/${role}`, updates).then((res) => res.data),
};
