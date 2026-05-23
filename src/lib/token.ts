export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken") || sessionStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("accessToken", token);
  sessionStorage.setItem("auth_token", token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("auth_user");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("authEmail");
  sessionStorage.removeItem("authRole");
  sessionStorage.removeItem("authUserId");
};
