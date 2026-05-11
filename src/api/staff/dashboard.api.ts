import { apiFetch } from "@/lib/api";

export const staffDashboardApi = {
  /**
   * Get properties assigned to a specific staff member.
   */
  getStaffProperties: async (staffId: number) => {
    const response = await apiFetch(`/api/staff/properties/${staffId}`);
    if (!response.ok) throw new Error("Failed to fetch staff properties");
    return response.json();
  },

  /**
   * Check staff session status at a specific property (e.g., ACTIVE, PENDING).
   */
  checkStatus: async (staffId: number, propertyId: number) => {
    const response = await apiFetch(`/api/staff/status?staffId=${staffId}&propertyId=${propertyId}`);
    if (!response.ok) throw new Error("Failed to check status");
    return response.text(); // Returns a string like "NOT_SELECTED", "PENDING", or "ACTIVE"
  },

  /**
   * Request to start a session at a specific property.
   */
  selectProperty: async (staffId: number, propertyId: number) => {
    const response = await apiFetch(`/api/staff/select-property?staffId=${staffId}&propertyId=${propertyId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to select property");
    return response.text();
  },
};
