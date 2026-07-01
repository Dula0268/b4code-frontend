import api from '@/lib/axios';

export const menuApi = {
  // ── Menus ──────────────────────────────────────────────────────────────────
  getMenusByProperty: async (propertyId: number) => {
    const response = await api.get(`/owner/menu/property/${propertyId}/menus`);
    return response.data;
  },

  createMenu: async (data: { propertyId: number; name: string; description?: string; status?: string }) => {
    const response = await api.post('/owner/menu/menus', data);
    return response.data;
  },

  updateMenu: async (id: number, data: { name?: string; description?: string; status?: string }) => {
    const response = await api.put(`/owner/menu/menus/${id}`, data);
    return response.data;
  },

  deleteMenu: async (id: number) => {
    await api.delete(`/owner/menu/menus/${id}`);
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  getCategoriesByProperty: async (propertyId: number) => {
    const response = await api.get(`/owner/menu/property/${propertyId}/categories`);
    return response.data;
  },

  createCategory: async (data: { propertyId: number; name: string }) => {
    const response = await api.post('/owner/menu/categories', data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/owner/menu/categories/${id}`);
  },

  // ── Menu Items ─────────────────────────────────────────────────────────────
  getItemsByProperty: async (propertyId: number) => {
    const response = await api.get(`/owner/menu/property/${propertyId}/items`);
    return response.data;
  },

  createItem: async (data: Record<string, unknown>) => {
    const response = await api.post('/owner/menu/items', data);
    return response.data;
  },

  updateItem: async (id: number, data: Record<string, unknown>) => {
    const response = await api.put(`/owner/menu/items/${id}`, data);
    return response.data;
  },

  toggleItemAvailability: async (id: number) => {
    const response = await api.patch(`/owner/menu/items/${id}/toggle`);
    return response.data;
  },

  deleteItem: async (id: number) => {
    await api.delete(`/owner/menu/items/${id}`);
  },
};
