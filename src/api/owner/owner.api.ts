import api from "@/lib/axios";

export const ownerApi = {
  getPendingStaff: () =>
    api.get("/owner/staff/pending").then((r) => r.data),

  approveStaff: (staffId: number) =>
    api.put(`/owner/staff/${staffId}/approve`).then((r) => r.data),

  rejectStaff: (staffId: number) =>
    api.put(`/owner/staff/${staffId}/reject`).then((r) => r.data),
};
