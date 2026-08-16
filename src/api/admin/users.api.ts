import api from '@/lib/axios';

// ─── Types (matching Spring Boot UserDto) ─────────────────────────────────────
// Backend enums: OWNER, STAFF, ADMIN, GUEST  (uppercase)
// Backend statuses: ACTIVE, PENDING, APPROVED, REJECTED, SUSPENDED        (uppercase)
export type UserRole = 'OWNER' | 'STAFF' | 'ADMIN' | 'GUEST';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;   // ISO datetime string from backend
  createdAt: string | null;
}

export interface UserPage {
  content: User[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

// ─── API Functions ────────────────────────────────────────────────────────────
export const UsersApi = {
  // GET /api/admin/users?search=&role=&status=&page=0&size=6
  getAll: (
    search?: string,
    role?: string,
    status?: string,
    page = 0,
    size = 6
  ): Promise<UserPage> =>
    api
      .get('/admin/users', {
        params: {
          search: search || undefined,
          role: role || undefined,
          status: status || undefined,
          page,
          size,
        },
      })
      .then((r) => r.data),

  // GET /api/admin/users/{id}
  getById: (id: number): Promise<User> =>
    api.get(`/admin/users/${id}`).then((r) => r.data),

  // POST /api/admin/users
  create: (payload: CreateUserPayload): Promise<User> =>
    api.post('/admin/users', payload).then((r) => r.data),

  // PUT /api/admin/users/{id}
  update: (id: number, payload: UpdateUserPayload): Promise<User> =>
    api.put(`/admin/users/${id}`, payload).then((r) => r.data),

  // PUT /api/admin/users/{id}/status   body: { status: "ACTIVE" | "SUSPENDED" }
  updateStatus: (id: number, status: UserStatus): Promise<User> =>
    api.put(`/admin/users/${id}/status`, { status }).then((r) => r.data),

  // GET /api/admin/users/{id}/activity
  getActivityLogs: (id: number, limit = 10): Promise<any[]> =>
    api.get(`/admin/users/${id}/activity`, { params: { limit } }).then((r) => r.data),

  // DELETE /api/admin/users/{id}
  delete: (id: number): Promise<void> =>
    api.delete(`/admin/users/${id}`).then(() => undefined),

  // POST /api/admin/users/{id}/send-reset-password
  sendResetPasswordLink: (id: number): Promise<void> =>
    api.post(`/admin/users/${id}/send-reset-password`).then(() => undefined),
};
