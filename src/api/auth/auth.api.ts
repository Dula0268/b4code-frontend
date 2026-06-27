import api from "@/lib/axios";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  register: (
    email: string,
    password: string,
    role: string,
    firstName: string,
    lastName: string,
    phone?: string,
    propertyId?: number
  ) =>
    api.post("/auth/register", {
      email,
      password,
      role: role.toUpperCase(),
      firstName,
      lastName,
      phone,
      propertyId,
    }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }).then((r) => r.data),

  verifyEmail: (email: string, otp: string) =>
    api.post("/auth/verify-email", { email, otp }).then((r) => r.data),

  roomLogin: (lastName: string, roomNumber: string, propertyId: number) =>
    api.post("/auth/room-login", { lastName, roomNumber, propertyId }).then((r) => r.data),
};
