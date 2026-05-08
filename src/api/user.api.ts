import api from "@/lib/axios";

export const userApi = {
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post("/users/change-password", payload),

  updateProfile: (updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => api.patch("/users/profile", updates).then((r) => r.data),

  getCurrentUser: () => api.get("/users/me").then((r) => r.data),
};
