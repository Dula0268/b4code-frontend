import { create } from "zustand";
import { authApi, userApi, setToken, removeToken } from "@/lib/api";

type Role = "guest" | "owner" | "admin" | "staff";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
};

type AuthUser = {
  email: string;
  role: Role;
  profile?: UserProfile;
};

type MockUserRecord = {
  password: string;
  role: Role;
  profile?: UserProfile;
};

// ─── Mock Data (fallback when backend is unavailable) ─────────────────────────
const INITIAL_MOCK_USERS: Record<string, MockUserRecord> = {
  "guest@primestay.com": {
    password: "guest123",
    role: "guest",
    profile: { firstName: "John", lastName: "Doe", phone: "+94 77 123 4567" },
  },
  "owner@primestay.com": { password: "owner123", role: "owner" },
  "staff@primestay.com": { password: "staff123", role: "staff" },
  "admin@primestay.com": { password: "admin123", role: "admin" },
};

const getMockUsers = (): Record<string, MockUserRecord> => {
  if (typeof window === "undefined") return INITIAL_MOCK_USERS;
  try {
    const stored = localStorage.getItem("MOCK_USERS_DB");
    return stored
      ? { ...INITIAL_MOCK_USERS, ...JSON.parse(stored) }
      : INITIAL_MOCK_USERS;
  } catch {
    return INITIAL_MOCK_USERS;
  }
};


const REDIRECT_MAP: Record<Role, string> = {
  guest: "/guest/search",
  owner: "/owner",
  staff: "/staff/select-property",
  admin: "/admin",
};

// ─── State & Actions ──────────────────────────────────────────────────────────
type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  isRestoring: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<string>;
  loginForCheckout: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: Role) => Promise<void>;
  registerFromCheckout: (email: string, password: string, profile: UserProfile) => Promise<void>;
  checkEmailExists: (email: string) => boolean;
  logout: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
  updatePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (email: string, updates: Partial<UserProfile>) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  restoreSession: (user: AuthUser) => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  loading: false,
  isRestoring: false,
  error: null,

  // ─── Login ────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // Try real backend first
      const data = await authApi.login(email, password);
      const role = data.role.toLowerCase() as Role;

      // Store JWT token
      setToken(data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify({
          email: data.email,
          role,
          userId: data.userId,
        }));
      }

      set({ loading: false, user: { email: data.email, role } });
      return REDIRECT_MAP[role];

    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Login failed." });
      throw err;
    }
  },

  // ─── Login For Checkout ───────────────────────────────────────────────────
  loginForCheckout: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.login(email, password);
      const role = data.role.toLowerCase() as Role;
      setToken(data.token);
      set({ loading: false, error: null, user: { email: data.email, role } });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Login failed." });
      throw err;
    }
  },

  // ─── Register ─────────────────────────────────────────────────────────────
  register: async (email, password, role) => {
    set({ loading: true, error: null });
    try {
      // Try real backend first
      const nameParts = email.split("@")[0].split(".");
      const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || "User";
      const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || "";

      await authApi.register(email, password, role, firstName, lastName);
      set({ loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Registration failed." });
      throw err;
    }
  },

  // ─── Register From Checkout ───────────────────────────────────────────────
  registerFromCheckout: async (email, password, profile) => {
    set({ loading: true, error: null });
    try {
      await authApi.register(
        email, password, "guest",
        profile.firstName, profile.lastName, profile.phone
      );
      setToken("");
      set({ loading: false, error: null, user: { email: email.toLowerCase(), role: "guest", profile } });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Registration failed." });
      throw err;
    }
  },

  // ─── Check Email Exists ───────────────────────────────────────────────────
  checkEmailExists: (email) => {
    const users = getMockUsers();
    return !!users[email.toLowerCase()];
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  logout: () => {
    removeToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
    }
    set({ user: null, error: null });
  },

  setError: (message) => set({ error: message }),
  reset: () => set({ user: null, loading: false, error: null }),

  // ─── Restore Session ──────────────────────────────────────────────────────
  restoreSession: (user) => set({ user, loading: false, isRestoring: true, error: null }),

  // ─── Update Password ──────────────────────────────────────────────────────
  updatePassword: async (email, currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      set({ loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to update password" });
      throw err;
    }
  },

  // ─── Update Profile ───────────────────────────────────────────────────────
  updateProfile: async (email, updates) => {
    set({ loading: true, error: null });
    try {
      // Try real backend
      const data = await userApi.updateProfile(updates);
      const profile: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      set((state) => {
        if (!state.user) return { loading: false };
        const updatedUser = { ...state.user, profile };
        // Sync to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        }
        return { loading: false, user: updatedUser };
      });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to update profile." });
      throw err;
    }
  },

  fetchCurrentUser: async () => {
    try {
      const data = await userApi.getCurrentUser();
      
      // Safety check: if backend is unreachable or session invalid, data will be null
      if (!data) {
        set({ loading: false, isRestoring: false });
        return;
      }

      const role = data.role.toLowerCase() as Role;
      const profile: UserProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };
      const user: AuthUser = { email: data.email, role, profile };

      set({ user, loading: false, isRestoring: false });
    } catch (err) {
      console.error("Failed to fetch current user profile:", err);
      set({ isRestoring: false });
    }
  },
}));