// ─── Auth Domain Models ───────────────────────────────────────────────────────

export type Role = "guest" | "owner" | "admin" | "staff";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  nationalIdUrl?: string;
};

export type AuthUser = {
  email: string;
  role: Role;
  userId?: number;
  propertyId?: number;
  roomId?: number;
  profile?: UserProfile;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isRestoring: boolean;
  error: string | null;
};
