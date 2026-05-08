import { create } from "zustand";
import axios from "axios";

type Role = "guest" | "owner" | "admin" | "staff";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
};

type AuthUser = {
  email: string;
  role: Role;
  userId?: number;
  profile?: UserProfile;
};

// ─── Mock users (kept for guest / owner / staff flows) ────────────────────────
type MockUserRecord = {
  password: string;
  role: Role;
  profile?: UserProfile;
};

const INITIAL_MOCK_USERS: Record<string, MockUserRecord> = {
  "guest@primestay.com": {
    password: "guest123",
    role: "guest",
    profile: { firstName: "John", lastName: "Doe", phone: "+94 77 123 4567" },
  },
  "owner@primestay.com": { password: "owner123", role: "owner" },
  "staff@primestay.com": { password: "staff123", role: "staff" },
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
  guest: "/guest",
  owner: "/owner",
  staff: "/staff",
  admin: "/admin",
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Hydrate from localStorage on load ───────────────────────────────────────
function hydrateUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
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
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<string>;
  loginForCheckout: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: Role) => Promise<void>;
  registerFromCheckout: (
    email: string,
    password: string,
    profile: UserProfile
  ) => Promise<void>;
  checkEmailExists: (email: string) => boolean;
  logout: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: hydrateUser(),
  loading: false,
  error: null,

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ loading: true, error: null });

    // ── Admin: call real backend ──
    if (email.toLowerCase() === "admin@primestay.com" ||
        email.toLowerCase().endsWith("@primestay.com")) {
      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
          email: email.toLowerCase(),
          password,
        });

        const role = (data.role?.toLowerCase() ?? "guest") as Role;

        // Only store token for admin — other roles fall through to mock
        if (role === "admin" || role === "staff") {
          localStorage.setItem("accessToken", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("authEmail", data.email);
          localStorage.setItem("authRole", role);
          localStorage.setItem("authUserId", String(data.userId));

          const user: AuthUser = { email: data.email, role, userId: data.userId };
          set({ loading: false, user });
          return REDIRECT_MAP[role];
        }
      } catch (err: unknown) {
        const msg =
          axios.isAxiosError(err) && err.response?.status === 401
            ? "Invalid email or password."
            : "Unable to reach the server. Please try again.";
        set({ loading: false, error: msg });
        throw new Error(msg);
      }
    }

    // ── Other roles: mock ──
    await new Promise((r) => setTimeout(r, 600));
    const users = getMockUsers();
    const match = users[email.toLowerCase()];
    if (!match || match.password !== password) {
      set({ loading: false, error: "Invalid email or password." });
      throw new Error("Invalid credentials");
    }
    set({
      loading: false,
      user: { email, role: match.role, profile: match.profile },
    });
    return REDIRECT_MAP[match.role];
  },

  // ── Login for Checkout ────────────────────────────────────────────────────
  loginForCheckout: async (email, password) => {
    set({ loading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    const users = getMockUsers();
    const match = users[email.toLowerCase()];
    if (!match || match.password !== password) {
      set({ loading: false, error: "Invalid email or password." });
      throw new Error("Invalid credentials");
    }
    set({
      loading: false,
      error: null,
      user: { email, role: match.role, profile: match.profile },
    });
  },

  // ── Register ──────────────────────────────────────────────────────────────
  register: async (email, password, role) => {
    set({ loading: true, error: null });
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
  },

  // ── Register from Checkout ────────────────────────────────────────────────
  registerFromCheckout: async (email, password, profile) => {
    set({ loading: true, error: null });
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
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  checkEmailExists: (email) => {
    const users = getMockUsers();
    return !!users[email.toLowerCase()];
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authEmail");
      localStorage.removeItem("authRole");
      localStorage.removeItem("authUserId");
    }
    set({ user: null, error: null });
  },

  setError: (message) => set({ error: message }),
  reset: () => set({ user: null, loading: false, error: null }),
}));
