import { create } from "zustand";
import { authApi, setToken, removeToken } from "@/lib/api";

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

const saveMockUsers = (users: Record<string, MockUserRecord>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("MOCK_USERS_DB", JSON.stringify(users));
  }
};

const REDIRECT_MAP: Record<Role, string> = {
  guest: "/guest/search",
  owner: "/owner",
  staff: "/staff",
  admin: "/admin",
};

// ─── State & Actions ──────────────────────────────────────────────────────────
type AuthState = {
  user: AuthUser | null;
  loading: boolean;
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
  updateProfile: (email: string, updates: { name: string }) => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  loading: false,
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

    } catch {
      // Fallback to mock data if backend is unavailable
      try {
        await new Promise((r) => setTimeout(r, 600));
        const users = getMockUsers();
        const match = users[email.toLowerCase()];
        if (!match || match.password !== password) {
          set({ loading: false, error: "Invalid email or password." });
          throw new Error("Invalid credentials");
        }
        set({ loading: false, user: { email, role: match.role, profile: match.profile } });
        return REDIRECT_MAP[match.role];
      } catch {
        set({ loading: false, error: "Invalid email or password." });
        throw new Error("Invalid credentials");
      }
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
    } catch {
      await new Promise((r) => setTimeout(r, 600));
      const users = getMockUsers();
      const match = users[email.toLowerCase()];
      if (!match || match.password !== password) {
        set({ loading: false, error: "Invalid email or password." });
        throw new Error("Invalid credentials");
      }
      set({ loading: false, error: null, user: { email, role: match.role, profile: match.profile } });
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
    } catch {
      // Fallback to mock
      await new Promise((r) => setTimeout(r, 800));
      const lowerEmail = email.toLowerCase();
      const users = getMockUsers();
      if (users[lowerEmail]) {
        set({ loading: false, error: "An account with this email already exists." });
        throw new Error("Email exists");
      }
      users[lowerEmail] = { password, role };
      saveMockUsers(users);
      set({ loading: false });
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
    } catch {
      await new Promise((r) => setTimeout(r, 800));
      const lowerEmail = email.toLowerCase();
      const users = getMockUsers();
      if (users[lowerEmail]) {
        set({ loading: false, error: "An account with this email already exists." });
        throw new Error("Email exists");
      }
      users[lowerEmail] = { password, role: "guest", profile };
      saveMockUsers(users);
      set({ loading: false, error: null, user: { email: lowerEmail, role: "guest", profile } });
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

  // ─── Update Password ──────────────────────────────────────────────────────
  updatePassword: async (email, currentPassword, newPassword) => {
    set({ loading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    const users = getMockUsers();
    const lowerEmail = email.toLowerCase();
    const match = users[lowerEmail];
    if (!match || match.password !== currentPassword) {
      set({ loading: false, error: "Incorrect current password." });
      throw new Error("Incorrect current password.");
    }
    users[lowerEmail] = { ...match, password: newPassword };
    if (typeof window !== "undefined") {
      localStorage.setItem("MOCK_USERS_DB", JSON.stringify(users));
    }
    set({ loading: false });
  },

  // ─── Update Profile ───────────────────────────────────────────────────────
  updateProfile: async (email, updates) => {
    set({ loading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    const users = getMockUsers();
    const lowerEmail = email.toLowerCase();
    const match = users[lowerEmail];
    if (!match) {
      set({ loading: false, error: "User not found." });
      throw new Error("User not found.");
    }
    users[lowerEmail] = { ...match, ...updates };
    if (typeof window !== "undefined") {
      localStorage.setItem("MOCK_USERS_DB", JSON.stringify(users));
    }
    set((state) => {
      if (!state.user || state.user.email.toLowerCase() === lowerEmail) {
        return { loading: false, user: { email: lowerEmail, ...match, ...updates } };
      }
      return { loading: false };
    });
  },
}));