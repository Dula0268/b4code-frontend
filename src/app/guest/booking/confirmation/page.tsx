"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { guestApi } from "@/api/guest/guest.api";

export default function BookingConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const processBooking = async () => {
            const pendingParamsStr = sessionStorage.getItem("pendingBookingParams");
            if (!pendingParamsStr) {
                // If there's no pending booking data, maybe it was already processed
                // Check if PayHere redirected with a payment status
                setStatus("failed");
                setErrorMsg("No pending booking data found. Please try booking again.");
                return;
            }

            const params = new URLSearchParams(pendingParamsStr);
            
            try {
                // Parse params
                const roomId = Number(params.get("roomId"));
                const propertyId = Number(params.get("propertyId"));
                const roomQuantity = Number(params.get("roomQuantity") || "1");
                const checkIn = params.get("checkIn") || "";
                const checkOut = params.get("checkOut") || "";
                const guestName = `${params.get("firstName") || ""} ${params.get("lastName") || ""}`.trim();
                const guestEmail = params.get("email") || "";
                const adults = Number(params.get("adults") || "1");
                const children = Number(params.get("children") || "0");
                const promoCode = params.get("promoCode") || undefined;
                
                // Create the booking
                const bookingResponse = await guestApi.createBooking({
                    roomId,
                    propertyId,
                    roomQuantity,
                    guestName,
                    guestEmail,
                    checkIn,
                    checkOut,
                    adults,
                    children,
                    promoCode,
                    paymentMethod: "online",
                });

                // Clear session storage so we don't duplicate on refresh
                sessionStorage.removeItem("pendingBookingParams");

                setStatus("success");

                // Redirect to bookings page after a delay
                setTimeout(() => {
                    router.push("/guest/booking");
                }, 3000);

            } catch (error) {
                console.error("Failed to create booking after payment:", error);
                setStatus("failed");
                setErrorMsg("Payment was successful but we encountered an error creating your booking. Please contact support.");
            }
        };

        processBooking();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {status === "processing" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin mb-6" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Finalizing Booking...</h2>
                        <p className="text-gray-500">Please wait while we secure your room.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-6">Your payment was successful and your room is booked.</p>
                        <p className="text-sm text-gray-400">Redirecting to your bookings...</p>
                    </div>
                )}

                {status === "failed" && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-8">{errorMsg}</p>
                        <button
                            onClick={() => router.push("/guest/booking")}
                            className="bg-[#9a3300] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#802a00] transition-colors"
                        >
                            View My Bookings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
