import { create } from "zustand";

type Role = "guest" | "owner" | "admin" | "staff";

type AuthUser = {
  email: string;
  role: Role;
  name?: string;
};

// Initial mock data
const INITIAL_MOCK_USERS: Record<string, { password: string; role: Role; name?: string }> = {
  "guest@primestay.com": { password: "guest123", role: "guest", name: "Alex Moore" },
  "owner@primestay.com": { password: "owner123", role: "owner", name: "Alex Moore" },
  "staff@primestay.com": { password: "staff123", role: "staff", name: "Alex Moore" },
  "admin@primestay.com": { password: "admin123", role: "admin", name: "Admin" },
};

const getMockUsers = (): Record<string, { password: string; role: Role; name?: string }> => {
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
  updatePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (email: string, updates: { name: string }) => Promise<void>;
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

    set({ loading: false, user: { email, role: match.role, name: match.name } });
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

  updatePassword: async (email, currentPassword, newPassword) => {
    set({ loading: true, error: null });
    await new Promise((r) => setTimeout(r, 600)); // Simulate delay

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
    
    // Also update the active user if it's the current one (or if there's no active user in dev mode)
    set((state) => {
      if (!state.user || state.user.email.toLowerCase() === lowerEmail) {
        return { loading: false, user: { email: lowerEmail, ...match, ...updates } };
      }
      return { loading: false };
    });
  },
}));

