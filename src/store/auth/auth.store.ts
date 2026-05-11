import { create } from "zustand";
import { authApi, setToken, removeToken } from "@/lib/api";
import { userApi } from "@/api/user.api";

type Role = "guest" | "owner" | "admin" | "staff";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  nationalIdUrl?: string;
};

type AuthUser = {
  email: string;
  role: Role;
  userId?: number;
  propertyId?: number;
  roomId?: number;
  profile?: UserProfile;
};

const REDIRECT_MAP: Record<Role, string> = {
  guest: "/guest/search",
  owner: "/owner",
  staff: "/staff",
  admin: "/admin",
};

// ─── Hydrate from localStorage on load ───────────────────────────────────────
function hydrateUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      return JSON.parse(stored);
    }

    // Legacy support
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("authEmail");
    const role = localStorage.getItem("authRole") as Role | null;
    const userId = localStorage.getItem("authUserId");
    if (token && email && role) {
      return { email, role, userId: userId ? Number(userId) : undefined };
    }
  } catch {
    /* ignore */
  }
  return null;
}

// ─── State & Actions ──────────────────────────────────────────────────────────
type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isRestoring: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<string>;
  loginForCheckout: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: Role, propertyId?: number) => Promise<void>;
  registerFromCheckout: (
    email: string,
    password: string,
    profile: UserProfile
  ) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  checkEmailExists: () => boolean;
  logout: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
  updatePassword: (
    email: string,
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  updateProfile: (
    email: string,
    updates: Partial<UserProfile>
  ) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  restoreSession: (user: AuthUser) => void;
  assignStay: (propertyId: number, roomId: number) => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => {
  const initialUser = hydrateUser();
  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    loading: false,
    isRestoring: false,
    error: null,

  // ─── LOGIN ─────────────────────────────────────────────
  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const data = await authApi.login(email, password);
      const role = data.role.toLowerCase() as Role;

      setToken(data.token);

      const userData: AuthUser = {
        email: data.email,
        role,
        userId: data.userId,
        propertyId: data.propertyId,
        roomId: data.roomId,
        profile: data.profile,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(userData));
        // Also keep legacy keys for compatibility
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("authEmail", data.email);
        localStorage.setItem("authRole", role);
        localStorage.setItem("authUserId", String(data.userId));
      }

      set({
        loading: false,
        user: userData,
        isAuthenticated: true,
      });

      return REDIRECT_MAP[role];
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Unexpected error occurred");

      console.log("LOGIN ERROR:", message);

      set({ loading: false, error: message });

      throw new Error(message);
    }
  },

  // ─── LOGIN FOR CHECKOUT ─────────────────────────────
  loginForCheckout: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const data = await authApi.login(email, password);
      const role = data.role.toLowerCase() as Role;

      setToken(data.token);

      const userData: AuthUser = {
        email: data.email,
        role,
        userId: data.userId,
        propertyId: data.propertyId,
        roomId: data.roomId,
        profile: data.profile
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(userData));
      }

      set({
        loading: false,
        user: userData,
        isAuthenticated: true,
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err instanceof Error ? err.message : "Login failed");

      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  // ─── REGISTER ─────────────────────────────────────────
  register: async (email, password, role, propertyId) => {
    set({ loading: true, error: null });

    try {
      const nameParts = email.split("@")[0].split(".");
      const firstName =
        nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) ||
        "User";
      const lastName =
        nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || "";

      await authApi.register(email, password, role, firstName, lastName, undefined, propertyId);

      set({ loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";

      set({ loading: false, error: message });

      throw new Error(message);
    }
  },

  // ─── REGISTER FROM CHECKOUT ─────────────────────────
  registerFromCheckout: async (email, password, profile) => {
    set({ loading: true, error: null });

    try {
      await authApi.register(
        email,
        password,
        "guest",
        profile.firstName,
        profile.lastName,
        profile.phone
      );

      setToken("");

      set({
        loading: false,
        isAuthenticated: true,
        user: {
          email: email.toLowerCase(),
          role: "guest",
          profile,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";

      set({ loading: false, error: message });

      throw new Error(message);
    }
  },

  // ─── VERIFY EMAIL (OTP) ─────────────────────────────
  verifyEmail: async (email, otp) => {
    set({ loading: true, error: null });

    try {
      await authApi.verifyEmail(email, otp);
      set({ loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  checkEmailExists: () => {
    // We don't have a real endpoint for this in authApi yet, so we return false
    // or we could implement it if needed. For now, keep it simple.
    return false;
  },

  logout: () => {
    removeToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authEmail");
      localStorage.removeItem("authRole");
      localStorage.removeItem("authUserId");
      localStorage.removeItem("auth_user");
    }

    set({ user: null, isAuthenticated: false, error: null });
  },

  setError: (message) => set({ error: message }),

  reset: () => set({ user: null, isAuthenticated: false, loading: false, error: null }),

  restoreSession: (user) =>
    set({ user, isAuthenticated: true, loading: false, isRestoring: true, error: null }),

  // ─── UPDATE PASSWORD ───────────────────────────────
  updatePassword: async (email, currentPassword, newPassword) => {
    set({ loading: true, error: null });

    try {
      await userApi.changePassword({ currentPassword, newPassword });
      set({ loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password";

      set({ loading: false, error: message });

      throw new Error(message);
    }
  },

  // ─── UPDATE PROFILE ────────────────────────────────
  updateProfile: async (email, updates) => {
    set({ loading: true, error: null });

    try {
      const data = await userApi.updateProfile(updates);

      const profile: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        nationalIdUrl: data.nationalIdUrl,
      };

      set((state) => {
        if (!state.user) return { loading: false };

        const updatedUser = { ...state.user, profile };

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        }

        return {
          loading: false,
          user: updatedUser,
        };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";

      set({ loading: false, error: message });

      throw new Error(message);
    }
  },

  assignStay: (propertyId, roomId) =>
    set((state) => {
      if (!state.user) return state;

      const updatedUser = { ...state.user, propertyId, roomId };

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      }

      console.log("📍 Stay Assigned to Session:", { propertyId, roomId });

      return { user: updatedUser };
    }),

  // ─── FETCH CURRENT USER ────────────────────────────
  fetchCurrentUser: async () => {
    try {
      const data = await userApi.getCurrentUser();

      if (!data) {
        set({ loading: false, isRestoring: false });
        return;
      }

      const role = data.role.toLowerCase() as Role;

      const profile: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        nationalIdUrl: data.nationalIdUrl,
      };

      set({
        user: {
          email: data.email,
          role,
          userId: data.userId,
          propertyId: data.propertyId,
          profile,
        },
        isAuthenticated: true,
        loading: false,
        isRestoring: false,
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number } };
      if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
        // Token is invalid/expired — quietly clear state
        set({ user: null, isAuthenticated: false, isRestoring: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      } else {
        console.error("Failed to fetch user:", err);
        set({ isRestoring: false });
      }
    }
  }
};
});