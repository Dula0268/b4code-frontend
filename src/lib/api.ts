export { getToken, setToken, removeToken } from "./token";
export { authApi } from "@/api/auth/auth.api";
export { guestApi } from "@/api/guest/guest.api";
export { ownerApi } from "@/api/owner/owner.api";
export { staffApi } from "@/api/staff/staff.api";
export { paymentApi } from "@/api/payment/payment.api";
export { propertiesApi } from "@/api/properties/properties.api";
export { imageApi } from "@/api/image/image.api";
export { userApi } from "@/api/user/user.api";

export {
  normalizeRoom,
  normalizePropertyListing,
  normalizePropertyDetail,
} from "./normalize";
export type { RoomData, PropertyData } from "./normalize";