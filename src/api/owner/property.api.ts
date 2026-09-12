import api from "@/lib/axios";
import { OnboardingData } from "@/store/owner/onboarding.store";

export const ownerPropertyApi = {
  createProperty: (data: OnboardingData): Promise<any> =>
    api.post("/owner/properties", data).then((res) => res.data),
};
