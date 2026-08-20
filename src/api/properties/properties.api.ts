import api from "@/lib/axios";

export const propertiesApi = {
  getPublicList: (): Promise<Array<{ id: number; name: string }>> =>
    api.get("/properties/public/list").then((r) => r.data),
};
