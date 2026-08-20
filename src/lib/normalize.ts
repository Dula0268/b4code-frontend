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

export interface RoomData {
    id?: unknown; roomId?: unknown; name?: unknown; roomName?: unknown;
    maxGuests?: unknown; maxOccupancy?: unknown; sqft?: unknown;
    pricePerNight?: unknown; originalPrice?: unknown; features?: unknown;
    amenities?: unknown; imageSrc?: unknown; imageUrl?: unknown;
    [key: string]: unknown;
}

export interface PropertyData {
    id?: unknown; propertyId?: unknown; title?: unknown; name?: unknown;
    location?: unknown; city?: unknown; propertyType?: unknown;
    pricePerNight?: unknown; lowestPricePerNight?: unknown; highestPricePerNight?: unknown;
    maxGuests?: unknown; availableRooms?: RoomData[];
    baseGuests?: unknown; extraGuestFee?: unknown; rating?: unknown;
    averageRating?: unknown; reviewCount?: unknown; badge?: unknown;
    imageSrc?: unknown; imageUrl?: unknown; fullAddress?: unknown; address?: unknown;
    galleryImages?: unknown; hostName?: unknown; ownerName?: unknown;
    hostBio?: unknown; hostYears?: unknown; hostSuperhost?: unknown;
    description?: unknown; reviewBreakdown?: unknown; reviews?: unknown;
    rooms?: RoomData[]; lat?: unknown; lng?: unknown; amenities?: unknown;
    checkInTime?: unknown; checkOutTime?: unknown;
    cancellationPolicy?: unknown; childPolicy?: unknown; houseRules?: unknown;
    [key: string]: unknown;
}

export const normalizeRoom = (room: RoomData) => ({
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

export const normalizePropertyListing = (property: PropertyData) => ({
    ...property,
    id: String(property?.id ?? property?.propertyId ?? ""),
    title: property?.title ?? property?.name ?? "Untitled property",
    location: property?.location ?? property?.city ?? "Sri Lanka",
    propertyType: property?.propertyType ?? "Property",
    pricePerNight: toNumber(property?.pricePerNight ?? property?.lowestPricePerNight),
    highestPricePerNight: property?.highestPricePerNight != null ? toNumber(property.highestPricePerNight) : undefined,
    maxGuests: toNumber(property?.maxGuests ?? property?.availableRooms?.[0]?.maxOccupancy, 2),
    baseGuests: toNumber(property?.baseGuests, 2),
    extraGuestFee: toNumber(property?.extraGuestFee),
    rating: toNumber(property?.rating ?? property?.averageRating),
    reviewCount: toNumber(property?.reviewCount),
    badge: property?.badge ?? undefined,
    imageSrc: property?.imageSrc || property?.imageUrl || DEFAULT_PROPERTY_IMAGE,
});

export const normalizePropertyDetail = (property: PropertyData) => ({
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
    reviews: Array.isArray(property?.reviews) ? property.reviews.map((rev: any) => ({
        ...rev,
        cleanlinessRating: rev?.cleanlinessRating != null ? toNumber(rev.cleanlinessRating) : undefined,
        accuracyRating: rev?.accuracyRating != null ? toNumber(rev.accuracyRating) : undefined,
        communicationRating: rev?.communicationRating != null ? toNumber(rev.communicationRating) : undefined,
        locationRating: rev?.locationRating != null ? toNumber(rev.locationRating) : undefined,
        valueRating: rev?.valueRating != null ? toNumber(rev.valueRating) : undefined,
    })) : [],
    rooms: Array.isArray(property?.roomTypes) ? property.roomTypes.map(normalizeRoom) : Array.isArray(property?.availableRooms) ? property.availableRooms.map(normalizeRoom) : [],
    lat: property?.lat == null ? undefined : toNumber(property.lat),
    lng: property?.lng == null ? undefined : toNumber(property.lng),
    checkInTime: property?.checkInTime ?? "14:00",
    checkOutTime: property?.checkOutTime ?? "11:00",
    cancellationPolicy: property?.cancellationPolicy ?? "Free cancellation until 48 hours before.\n50% refund within 48 hours.\nNo-shows will be charged full amount.",
    childPolicy: property?.childPolicy ?? "Children of any age are welcome.\nNo age restriction for check-in.\nExtra beds available upon request.",
    houseRules: property?.houseRules ?? "No smoking indoors.\nNo pets allowed.\nNo parties or events.",
});
