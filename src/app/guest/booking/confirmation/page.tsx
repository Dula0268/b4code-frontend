"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CalendarCheck, Home, ArrowRight, ShieldCheck } from "lucide-react";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [hydrated, setHydrated] = useState(false);
    const [finalParams, setFinalParams] = useState<URLSearchParams | null>(null);

    useEffect(() => {
        const pendingStr = sessionStorage.getItem("pendingBookingParams") || "";
        const pending = new URLSearchParams(pendingStr);
        
        // Merge pending params with search params (searchParams take precedence)
        const merged = new URLSearchParams();
        pending.forEach((val, key) => merged.set(key, val));
        searchParams?.forEach((val, key) => merged.set(key, val));
        
        setFinalParams(merged);
        setHydrated(true);
    }, [searchParams]);

    const total = finalParams?.get("total") || "0";
    // For modification payments, show the new full booking total; `total` is just the diff paid
    const displayTotal = finalParams?.get("modifyTotalAmount") || total;
    const propertyId = finalParams?.get("propertyId") || "";
    const returnUrl = finalParams?.get("returnUrl") || "";
    const orderId = finalParams?.get("order_id") || finalParams?.get("orderId") || "";
    const confirmationCode =
        finalParams?.get("confirmationCode") ||
        (orderId ? orderId : `B4C-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);

    const formattedTotal = Number(displayTotal).toLocaleString("en-US", { minimumFractionDigits: 2 });

    // If a returnUrl is present (e.g. /guest/property/1), bounce back there
    // with paymentSuccess=true so the inline confirmation panel appears
    useEffect(() => {
        if (hydrated && returnUrl) {
            const targetParams = new URLSearchParams(finalParams?.toString() || "");
            targetParams.set("paymentSuccess", "true");
            targetParams.set("confirmationCode", confirmationCode);

            const separator = returnUrl.includes("?") ? "&" : "?";
            router.replace(`${returnUrl}${separator}${targetParams.toString()}`);
            
            // Clean up once we're safely redirecting
            sessionStorage.removeItem("pendingBookingParams");
        }
    }, [hydrated, returnUrl, confirmationCode, finalParams, router]);

    // While hydrating or redirecting, show a brief loading state
    if (!hydrated || returnUrl) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
                <p className="text-[14px] text-[#828282] font-medium">Confirming your booking...</p>
            </div>
        );
    }

    // Fallback: show confirmation UI when there is no returnUrl
    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-16">
            <div className="w-full max-w-[500px] bg-white rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-[#e8e8e8] overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {/* Green success header */}
                <div className="bg-gradient-to-br from-[#1a5c1a] to-[#2d8a2d] px-8 pt-10 pb-8 flex flex-col items-center text-white text-center">
                    <div className="relative mb-5">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-30" />
                            <CheckCircle2 size={44} className="text-white relative z-10" />
                        </div>
                    </div>
                    <h1 className="text-[28px] font-black tracking-tight mb-1">Payment Successful!</h1>
                    <p className="text-white/80 text-[14px]">Your booking has been confirmed and secured.</p>
                </div>

                {/* Booking details */}
                <div className="px-8 py-6 flex flex-col gap-5">
                    <div className="bg-[#f8f8f8] border border-[#ebebeb] rounded-2xl p-5 text-center">
                        <p className="text-[11px] font-bold text-[#828282] uppercase tracking-[0.18em] mb-1">
                            Booking Reference
                        </p>
                        <p className="text-[24px] font-mono font-black text-[#9a3300] tracking-wider">
                            {confirmationCode}
                        </p>
                    </div>

                    {Number(total) > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-[#f0faf0] border border-[#c8e6c9] rounded-xl">
                            <span className="text-[13px] font-semibold text-[#2e7d32]">Amount Paid</span>
                            <span className="text-[16px] font-black text-[#2e7d32]">LKR {formattedTotal}</span>
                        </div>
                    )}

                    <div className="flex items-start gap-3 p-4 border border-[#e8e8e8] rounded-xl bg-white">
                        <div className="w-9 h-9 bg-[#fff4eb] rounded-xl flex items-center justify-center flex-shrink-0">
                            <CalendarCheck size={18} className="text-[#9a3300]" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-[#1d1d1d] mb-0.5">What&apos;s next?</p>
                            <p className="text-[12px] text-[#828282] leading-relaxed">
                                A confirmation email has been sent. Check your bookings for full details.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#aaa] font-medium">
                        <ShieldCheck size={13} className="text-[#4caf50]" />
                        <span>Secured by PayHere · SSL Encrypted</span>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href="/guest/booking"
                            className="w-full bg-[#9a3300] hover:bg-[#7a2800] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-[14px]"
                        >
                            <CalendarCheck size={16} />
                            View My Bookings
                        </Link>

                        {propertyId && (
                            <Link
                                href={`/guest/property/${propertyId}`}
                                className="w-full bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#1d1d1d] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-[14px]"
                            >
                                <Home size={16} />
                                Back to Property
                                <ArrowRight size={14} className="text-[#828282]" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}
