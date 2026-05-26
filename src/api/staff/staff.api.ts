import api from "@/lib/axios";

export const staffApi = {
  getAllProperties: () =>
    api.get("/staff/all-properties").then((r) => r.data),

  getMyProperties: (staffId: number) =>
    api.get(`/staff/properties/${staffId}`).then((r) => r.data),
};
