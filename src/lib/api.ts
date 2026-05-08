const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const DEFAULT_PROPERTY_IMAGE = "/images/properties/property-1.jpg";
const DEFAULT_ROOM_IMAGE = "/images/rooms/room-ocean-king.jpg";

const toNumber = (value: unknown, fallback = 0) => {
    const numericValue = typeof value === "string" ? Number(value) : Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeList = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) {
        return value.split(",").map(part => part.trim()).filter(Boolean);
    }
    return [];
};

interface RoomData {
    id?: unknown; roomId?: unknown; name?: unknown; roomName?: unknown;
    maxGuests?: unknown; maxOccupancy?: unknown; sqft?: unknown;
    pricePerNight?: unknown; originalPrice?: unknown; features?: unknown;
    amenities?: unknown; imageSrc?: unknown; imageUrl?: unknown;
    [key: string]: unknown;
}

interface PropertyData {
    id?: unknown; propertyId?: unknown; title?: unknown; name?: unknown;
    location?: unknown; city?: unknown; propertyType?: unknown;
    pricePerNight?: unknown; lowestPricePerNight?: unknown;
    maxGuests?: unknown; availableRooms?: RoomData[];
    baseGuests?: unknown; extraGuestFee?: unknown; rating?: unknown;
    averageRating?: unknown; reviewCount?: unknown; badge?: unknown;
    imageSrc?: unknown; imageUrl?: unknown; fullAddress?: unknown; address?: unknown;
    galleryImages?: unknown; hostName?: unknown; ownerName?: unknown;
    hostBio?: unknown; hostYears?: unknown; hostSuperhost?: unknown;
    description?: unknown; reviewBreakdown?: unknown; reviews?: unknown;
    rooms?: RoomData[]; lat?: unknown; lng?: unknown; amenities?: unknown;
    [key: string]: unknown;
}

const normalizeRoom = (room: RoomData) => ({
    ...room,
    id: String(room?.id ?? room?.roomId ?? ""),
    name: room?.name ?? room?.roomName ?? "Room",
    maxGuests: toNumber(room?.maxGuests ?? room?.maxOccupancy),
    sqft: toNumber(room?.sqft),
    pricePerNight: toNumber(room?.pricePerNight),
    originalPrice: room?.originalPrice == null ? undefined : toNumber(room.originalPrice),
    features: normalizeList(room?.features ?? room?.amenities),
    imageSrc: room?.imageSrc || room?.imageUrl || DEFAULT_ROOM_IMAGE,
});

const normalizePropertyListing = (property: PropertyData) => ({
    ...property,
    id: String(property?.id ?? property?.propertyId ?? ""),
    title: property?.title ?? property?.name ?? "Untitled property",
    location: property?.location ?? property?.city ?? "Sri Lanka",
    propertyType: property?.propertyType ?? "Property",
    pricePerNight: toNumber(property?.pricePerNight ?? property?.lowestPricePerNight),
    maxGuests: toNumber(property?.maxGuests ?? property?.availableRooms?.[0]?.maxOccupancy, 2),
    baseGuests: toNumber(property?.baseGuests, 2),
    extraGuestFee: toNumber(property?.extraGuestFee),
    rating: toNumber(property?.rating ?? property?.averageRating),
    reviewCount: toNumber(property?.reviewCount),
    badge: property?.badge ?? undefined,
    imageSrc: property?.imageSrc || property?.imageUrl || DEFAULT_PROPERTY_IMAGE,
});

const normalizePropertyDetail = (property: PropertyData) => ({
    ...property,
    id: String(property?.id ?? property?.propertyId ?? ""),
    title: property?.title ?? property?.name ?? "Untitled property",
    location: property?.location ?? property?.city ?? "Sri Lanka",
    fullAddress: property?.fullAddress ?? property?.address ?? property?.location ?? property?.city ?? "Sri Lanka",
    propertyType: property?.propertyType ?? "Property",
    pricePerNight: toNumber(property?.pricePerNight ?? property?.lowestPricePerNight),
    rating: toNumber(property?.rating ?? property?.averageRating),
    reviewCount: toNumber(property?.reviewCount),
    badge: property?.badge ?? undefined,
    imageSrc: property?.imageSrc || property?.imageUrl || DEFAULT_PROPERTY_IMAGE,
    galleryImages: normalizeList(property?.galleryImages),
    hostName: property?.hostName ?? property?.ownerName ?? "",
    hostBio: property?.hostBio ?? "",
    hostYears: property?.hostYears == null ? undefined : toNumber(property.hostYears),
    hostSuperhost: Boolean(property?.hostSuperhost),
    description: property?.description ?? "",
    amenities: Array.isArray(property?.amenities) ? property.amenities : [],
    reviewBreakdown: Array.isArray(property?.reviewBreakdown) ? property.reviewBreakdown : [],
    reviews: Array.isArray(property?.reviews) ? property.reviews : [],
    rooms: Array.isArray(property?.rooms) ? property.rooms.map(normalizeRoom) : Array.isArray(property?.availableRooms) ? property.availableRooms.map(normalizeRoom) : [],
    lat: property?.lat == null ? undefined : toNumber(property.lat),
    lng: property?.lng == null ? undefined : toNumber(property.lng),
});

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
type UserProfileUpdate = {
    firstName?: string;
    lastName?: string;
    phone?: string;
};

type ChangePasswordPayload = {
    currentPassword: string;
    newPassword: string;
};

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
        const response = await apiFetch("/api/users/me");
        if (!response.ok) throw new Error("Failed to fetch current user");
        return response.json();
    },

    updateProfile: async (updates: UserProfileUpdate) => {
        const response = await apiFetch("/api/users/me/profile", {
            method: "PATCH",
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error("Failed to update profile");
        return response.json();
    },

    changePassword: async (payload: ChangePasswordPayload) => {
        const response = await apiFetch("/api/users/me/password", {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update password");
        return response.json();
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
        const data = await response.json();
        // Handle paginated response (new format) or plain array (legacy)
        const items = Array.isArray(data) ? data : (data.content ?? []);
        return items.map(normalizePropertyListing);
    },

    getPropertyDetail: async (propertyId: number | string) => {
        const response = await apiFetch(`/api/guest/properties/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch property details");
        const data = await response.json();
        return normalizePropertyDetail(data);
    },

    // Booking Methods
    getGuestBookings: async (email: string) => {
        const response = await apiFetch(`/api/guest/bookings/guest?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error("Failed to fetch bookings");
        return response.json();
    },

    createBooking: async (bookingData: {
        roomId: number;
        guestName: string;
        guestEmail: string;
        guestPhone: string;
        checkIn: string;
        checkOut: string;
        guestCount: number;
        promoCode?: string;
        paymentMethod: "online" | "property";
    }) => {
        const response = await apiFetch("/api/guest/bookings", {
            method: "POST",
            body: JSON.stringify({
                roomId: bookingData.roomId,
                guestName: bookingData.guestName,
                guestEmail: bookingData.guestEmail,
                guestPhone: bookingData.guestPhone,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guestCount: bookingData.guestCount,
                promoCode: bookingData.promoCode,
                paymentMethod: bookingData.paymentMethod === "online" ? "ONLINE_CARD" : "PAY_AT_PROPERTY",
            }),
        });
        if (!response.ok) throw new Error("Failed to create booking");
        return response.json();
    },

    // Review Methods
    getPropertyReviews: async (propertyId: number) => {
        const response = await apiFetch(`/api/guest/reviews/property/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch reviews");
        return response.json();
    },

    createReview: async (reviewData: {
        bookingId: number;
        overallRating: number;
        cleanlinessRating?: number;
        accuracyRating?: number;
        communicationRating?: number;
        locationRating?: number;
        valueRating?: number;
        comment?: string;
        photoUrls?: string[];
    }) => {
        const response = await apiFetch("/api/guest/reviews", {
            method: "POST",
            body: JSON.stringify(reviewData),
        });
        if (!response.ok) throw new Error("Failed to create review");
        return response.json();
    },

    // Message Methods
    getConversation: async (bookingId: number) => {
        const response = await apiFetch(`/api/guest/messages/conversation/${bookingId}`);
        if (!response.ok) throw new Error("Failed to fetch conversation");
        return response.json();
    },

    sendMessage: async (messageData: {
        bookingId: number;
        senderType: "GUEST" | "PROPERTY";
        senderName: string;
        content: string;
        attachmentUrl?: string;
    }) => {
        const response = await apiFetch("/api/guest/messages", {
            method: "POST",
            body: JSON.stringify(messageData),
        });
        if (!response.ok) throw new Error("Failed to send message");
        return response.json();
    },
};