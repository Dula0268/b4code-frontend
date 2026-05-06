import { create } from 'zustand';
import {
  UsersApi,
  type User,
  type UserStatus,
  type UserRole,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/api/admin/users.api';

type AdminUsersState = {
  users: User[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  actionLoading: boolean;  
  error: string | null;
};

type AdminUsersActions = {
  fetchUsers: (search?: string, role?: string, status?: string, page?: number) => Promise<void>;
  createUser: (payload: CreateUserPayload) => Promise<User>;
  updateUser: (id: number, payload: UpdateUserPayload) => Promise<User>;
  updateUserStatus: (id: number, status: UserStatus) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  reset: () => void;
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAdminUsersStore = create<AdminUsersState & AdminUsersActions>((set, get) => ({
  users: [],
  totalPages: 1,
  totalElements: 0,
  currentPage: 0,
  loading: false,
  actionLoading: false,
  error: null,

  // ── Fetch paginated users list ──────────────────────────────────────────
  fetchUsers: async (search, role, status, page = 0) => {
    set({ loading: true, error: null });
    try {
      const data = await UsersApi.getAll(search, role, status, page);
      set({
        users: data.content,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        currentPage: page,
        loading: false,
      });
    } catch (err) {
      console.error('fetchUsers error:', err);
      set({
        error: 'Failed to load users. Make sure the backend is running on port 8080.',
        loading: false,
      });
    }
  },

  // ── Create new user ────────────────────────────────────────────────────
  createUser: async (payload) => {
    set({ actionLoading: true, error: null });
    try {
      const created = await UsersApi.create(payload);
      // Re-fetch current page to get updated list
      const { currentPage } = get();
      await get().fetchUsers(undefined, undefined, undefined, currentPage);
      set({ actionLoading: false });
      return created;
    } catch (err) {
      console.error('createUser error:', err);
      set({ actionLoading: false, error: 'Failed to create user.' });
      throw err;
    }
  },

  // ── Update user details ────────────────────────────────────────────────
  updateUser: async (id, payload) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await UsersApi.update(id, payload);
      // Update in-place in the local list
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        actionLoading: false,
      }));
      return updated;
    } catch (err) {
      console.error('updateUser error:', err);
      set({ actionLoading: false, error: 'Failed to update user.' });
      throw err;
    }
  },

  // ── Toggle Active / Suspended ──────────────────────────────────────────
  updateUserStatus: async (id, status) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await UsersApi.updateStatus(id, status);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        actionLoading: false,
      }));
    } catch (err) {
      console.error('updateUserStatus error:', err);
      set({ actionLoading: false, error: 'Failed to update user status.' });
      throw err;
    }
  },

  // ── Delete user ────────────────────────────────────────────────────────
  deleteUser: async (id) => {
    set({ actionLoading: true, error: null });
    try {
      await UsersApi.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        totalElements: state.totalElements - 1,
        actionLoading: false,
      }));
    } catch (err) {
      console.error('deleteUser error:', err);
      set({ actionLoading: false, error: 'Failed to delete user.' });
      throw err;
    }
  },

  reset: () =>
    set({
      users: [],
      totalPages: 1,
      totalElements: 0,
      currentPage: 0,
      loading: false,
      actionLoading: false,
      error: null,
    }),
}));

export type { User, UserStatus, UserRole, CreateUserPayload, UpdateUserPayload };
