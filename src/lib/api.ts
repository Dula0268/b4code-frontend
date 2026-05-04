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
        const response = await apiFetch("/api/payments", {
            method: "POST",
            body: JSON.stringify(paymentData),
        });
        if (!response.ok) throw new Error("Payment failed");
        return response.json();
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

// Guest APIs
export const guestApi = {
    // Property Methods
    getAllProperties: async () => {
        const response = await apiFetch("/api/guest/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        return response.json();
    },

    getPropertyDetail: async (propertyId: number) => {
        const response = await apiFetch(`/api/guest/properties/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch property details");
        return response.json();
    },

    // Booking Methods
    getGuestBookings: async (guestId: number) => {
        const response = await apiFetch(`/api/guest/bookings/${guestId}`);
        if (!response.ok) throw new Error("Failed to fetch bookings");
        return response.json();
    },

    getPropertyBookings: async (propertyId: number) => {
        const response = await apiFetch(`/api/guest/properties/${propertyId}/bookings`);
        if (!response.ok) throw new Error("Failed to fetch property bookings");
        return response.json();
    },

    createBooking: async (bookingData: {
        propertyId: number;
        guestId: number;
        checkInDate: string;
        checkOutDate: string;
        status: string;
        totalPrice: number;
    }) => {
        const response = await apiFetch("/api/guest/bookings", {
            method: "POST",
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) throw new Error("Failed to create booking");
        return response.json();
    },

    // Review Methods
    getPropertyReviews: async (propertyId: number) => {
        const response = await apiFetch(`/api/guest/properties/${propertyId}/reviews`);
        if (!response.ok) throw new Error("Failed to fetch reviews");
        return response.json();
    },

    getGuestReviews: async (guestId: number) => {
        const response = await apiFetch(`/api/guest/reviews/${guestId}`);
        if (!response.ok) throw new Error("Failed to fetch guest reviews");
        return response.json();
    },

    createReview: async (reviewData: {
        propertyId: number;
        guestId: number;
        guestName: string;
        reviewText: string;
        rating: number;
    }) => {
        const response = await apiFetch("/api/guest/reviews", {
            method: "POST",
            body: JSON.stringify(reviewData),
        });
        if (!response.ok) throw new Error("Failed to create review");
        return response.json();
    },

    // Message Methods
    getPropertyMessages: async (propertyId: number) => {
        const response = await apiFetch(`/api/guest/properties/${propertyId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        return response.json();
    },

    getReceivedMessages: async (receiverId: number) => {
        const response = await apiFetch(`/api/guest/messages?receiverId=${receiverId}`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        return response.json();
    },

    getConversation: async (userId1: number, userId2: number) => {
        const response = await apiFetch(`/api/guest/messages/conversation?userId1=${userId1}&userId2=${userId2}`);
        if (!response.ok) throw new Error("Failed to fetch conversation");
        return response.json();
    },

    sendMessage: async (messageData: {
        senderId: number;
        receiverId: number;
        propertyId: number;
        content: string;
    }) => {
        const response = await apiFetch("/api/guest/messages", {
            method: "POST",
            body: JSON.stringify(messageData),
        });
        if (!response.ok) throw new Error("Failed to send message");
        return response.json();
    },
};