import api from './axios';

/**
 * Common API services for the staff portal.
 */
export const staffApi = {
  /**
   * Fetches properties assigned to a specific staff user.
   * @param staffId The unique ID of the staff user.
   */
  getMyProperties: async (staffId: number) => {
    try {
      const response = await api.get(`/staff/properties/${staffId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch properties for staff ${staffId}:`, error);
      return []; // Return empty array on failure to prevent dashboard crashes
    }
  },
  
  /**
   * Checks the assignment status of a staff member for a specific property.
   */
  checkStatus: async (staffId: number, propertyId: number) => {
    const response = await api.get('/staff/status', {
      params: { staffId, propertyId }
    });
    return response.data;
  },

  /**
   * Sends a request to select/join a property.
   */
  selectProperty: async (staffId: number, propertyId: number) => {
    const response = await api.post('/staff/select-property', null, {
      params: { staffId, propertyId }
    });
    return response.data;
  }
};

export default {
  staffApi
};
