import { create } from "zustand";

type Role = "guest" | "owner" | "admin" | "staff";

type AuthUser = {
  email: string;
  role: Role;
};

// Mock credentials

const MOCK_USERS: Record<string, { password: string; role: Role }> = {
  "guest@primestay.com": { password: "guest123", role: "guest" },
  "owner@primestay.com": { password: "owner123", role: "owner" },
  "staff@primestay.com": { password: "staff123", role: "staff" },
  "admin@primestay.com": { password: "admin123", role: "admin" },
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

    const match = MOCK_USERS[email.toLowerCase()];
    if (!match || match.password !== password) {
      set({ loading: false, error: "Invalid email or password." });
      throw new Error("Invalid credentials");
    }

    set({ loading: false, user: { email, role: match.role } });
    return REDIRECT_MAP[match.role];
  },

  logout: () => set({ user: null, error: null }),
  setError: (message) => set({ error: message }),
  reset: () => set({ user: null, loading: false, error: null }),
}));
