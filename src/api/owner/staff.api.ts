import api from "@/lib/axios";

export interface PendingStaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  propertyName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  role: string;
  registeredAt: string;
}

export const ownerStaffApi = {
  getPendingStaff: async (): Promise<PendingStaffMember[]> => {
    const res = await api.get<PendingStaffMember[]>("/owner/staff/pending");
    return res.data;
  },

  approveStaff: async (id: number): Promise<void> => {
    await api.put(`/owner/staff/${id}/approve`);
  },

  rejectStaff: async (id: number): Promise<void> => {
    await api.put(`/owner/staff/${id}/reject`);
  },
};
