const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Store token in localStorage
export const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
    localStorage.setItem("auth_token", token);
};

export const removeToken = (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
};

export const staffApi = {
    getAllProperties: async () => {
        const response = await apiFetch("/api/staff/all-properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        return response.json();
    },


    getMyProperties: async (staffId: number) => {
        const response = await apiFetch(`/api/staff/properties/${staffId}`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        return response.json();
    },
};
// Base fetch with auth header
export const apiFetch = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return response;
};

// Auth APIs
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Invalid email or password.");
        }
        return response.json();
    },

    register: async (
        email: string,
        password: string,
        role: string,
        firstName: string,
        lastName: string,
        phone?: string
    ) => {
        const response = await apiFetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, role: role.toUpperCase(), firstName, lastName, phone }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Registration failed.");
        }
        return response.json();
    },
};

// User Management APIs
export const userApi = {
    getAllUsers: async () => {
        const response = await apiFetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
    },

    getUserById: async (id: number) => {
        const response = await apiFetch(`/api/users/${id}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        return response.json();
    },

    updateUserRole: async (id: number, role: string) => {
        const response = await apiFetch(`/api/users/${id}/role`, {
            method: "PATCH",
            body: JSON.stringify({ role: role.toUpperCase() }),
        });
        if (!response.ok) throw new Error("Failed to update role");
        return response.json();
    },

    deleteUser: async (id: number) => {
        const response = await apiFetch(`/api/users/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
    },

    getCurrentUser: async () => {
        try {
            const response = await apiFetch("/api/users/me");
            if (!response.ok) return null;
            return response.json();
        } catch {
            return null;
        }
    },

    updateProfile: async (profileData: { firstName?: string; lastName?: string; phone?: string }) => {
        const response = await apiFetch("/api/users/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Profile update failed with status ${response.status}: ${errorText}`);
            throw new Error(`Failed to update profile (${response.status})`);
        }
        return response.json();
    },

    changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
        const response = await apiFetch("/api/users/password", {
            method: "PATCH",
            body: JSON.stringify(passwordData),
        });
        if (!response.ok) {
            try {
                const error = await response.json();
                throw new Error(error.message || "Failed to change password");
            } catch {
                throw new Error("Failed to change password. Please check your current password.");
            }
        }
    },
};

// Payment APIs
export const paymentApi = {
    initiatePayment: async (paymentData: {
        amount: number;
        currency?: string;
        paymentMethod: string;
        cardHolderName?: string;
        cardNumber?: string;
        cardExpiry?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
    }) => {
        try {
            const response = await apiFetch("/api/payments", {
                method: "POST",
                body: JSON.stringify(paymentData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Payment failed at server");
            }
            return response.json();
        } catch (error) {
            console.error("Initiate payment error:", error);
            throw error;
        }
    },

    getMyPayments: async () => {
        const response = await apiFetch("/api/payments/my");
        if (!response.ok) throw new Error("Failed to fetch payments");
        return response.json();
    },

    getAllPayments: async () => {
        const response = await apiFetch("/api/payments");
        if (!response.ok) throw new Error("Failed to fetch payments");
        return response.json();
    },

};