import { create } from "zustand";

type Role = "guest" | "owner" | "admin" | "staff";

type AuthUser = {
  email: string;
  role: Role;
};

// Initial mock data
const INITIAL_MOCK_USERS: Record<string, { password: string; role: Role }> = {
  "guest@primestay.com": { password: "guest123", role: "guest" },
  "owner@primestay.com": { password: "owner123", role: "owner" },
  "staff@primestay.com": { password: "staff123", role: "staff" },
  "admin@primestay.com": { password: "admin123", role: "admin" },
};

const getMockUsers = (): Record<string, { password: string; role: Role }> => {
  if (typeof window === "undefined") return INITIAL_MOCK_USERS;
  try {
    const stored = localStorage.getItem("MOCK_USERS_DB");
    return stored ? { ...INITIAL_MOCK_USERS, ...JSON.parse(stored) } : INITIAL_MOCK_USERS;
  } catch {
    return INITIAL_MOCK_USERS;
  }
};

const REDIRECT_MAP: Record<Role, string> = {
  guest: "/guest",
  owner: "/owner",
  staff: "/staff",
  admin: "/admin",
};

//State & actions
type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<string>;
  register: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });

    await new Promise((r) => setTimeout(r, 600));

    const users = getMockUsers();
    const match = users[email.toLowerCase()];
    if (!match || match.password !== password) {
      set({ loading: false, error: "Invalid email or password." });
      throw new Error("Invalid credentials");
    }

    set({ loading: false, user: { email, role: match.role } });
    return REDIRECT_MAP[match.role];
  },

  register: async (email, password, role) => {
    set({ loading: true, error: null });

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const lowerEmail = email.toLowerCase();
    const users = getMockUsers();
    if (users[lowerEmail]) {
      set({ loading: false, error: "An account with this email already exists." });
      throw new Error("Email exists");
    }

    // Add to our mock database
    users[lowerEmail] = { password, role };
    if (typeof window !== "undefined") {
      localStorage.setItem("MOCK_USERS_DB", JSON.stringify(users));
    }
    set({ loading: false });
  },

  logout: () => set({ user: null, error: null }),
  setError: (message) => set({ error: message }),
  reset: () => set({ user: null, loading: false, error: null }),
}));

