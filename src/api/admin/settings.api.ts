import axios from 'axios';

const API_URL = "http://localhost:8080/api/admin/settings/permissions";

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
  getRolePermissions: async (role: string): Promise<RolePermissionsDto> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${role}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateRolePermissions: async (role: string, updates: Record<string, boolean>): Promise<RolePermissionsDto> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${role}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};
