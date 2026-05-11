import { apiFetch } from "@/lib/api";

interface MenuItem {
  propertyId?: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  isAvailable?: boolean;
  imageUrls?: string[];
  tag?: string;
  calories?: number;
}

interface MenuItemDetails {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  isAvailable?: boolean;
  imageUrls?: string[];
  tag?: string;
  calories?: number;
}

export const staffMenuApi = {
  /**
   * List all menu items for a specific property.
   */
  getMenuItems: async (propertyId: number) => {
    const response = await apiFetch(`/api/menu-items/property/${propertyId}`);
    if (!response.ok) throw new Error("Failed to fetch menu items");
    return response.json();
  },

  /**
   * Create a new menu item.
   */
  createMenuItem: async (menuItem: MenuItem) => {
    const response = await apiFetch("/api/menu-items", {
      method: "POST",
      body: JSON.stringify(menuItem),
    });
    if (!response.ok) throw new Error("Failed to create menu item");
    return response.json();
  },

  /**
   * Update details of an existing menu item.
   */
  updateMenuItem: async (id: number, details: MenuItemDetails) => {
    const response = await apiFetch(`/api/menu-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(details),
    });
    if (!response.ok) throw new Error("Failed to update menu item");
    return response.json();
  },

  /**
   * Toggle the availability status of a menu item.
   */
  toggleAvailability: async (id: number) => {
    const response = await apiFetch(`/api/menu-items/${id}/toggle`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to toggle availability");
    return response.json();
  },

  /**
   * Delete a specific menu item.
   */
  deleteMenuItem: async (id: number) => {
    const response = await apiFetch(`/api/menu-items/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete menu item");
    return response;
  },

  /**
   * Delete all menu items in a specific category for a property.
   */
  deleteMenuItemByCategory: async (propertyId: number, category: string) => {
    const response = await apiFetch(`/api/menu-items/property/${propertyId}/category/${encodeURIComponent(category)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
    return response;
  },
};
