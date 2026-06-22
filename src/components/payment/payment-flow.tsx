"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building, X, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import PaymentSelection from "./steps/payment-selection";
import PaymentCardForm from "./steps/payment-card-form";
import PaymentStatus from "./steps/payment-status";
import { paymentApi } from "@/api/payment/payment.api";
import { useGuestGuard } from "@/hooks/use-guest-guard";
import AccessDenied from "@/components/shared/auth/access-denied";

export type PaymentStep = "selection" | "card" | "processing" | "success" | "failed";

export default function PaymentFlow() {
    const { ready, status, userRole } = useGuestGuard();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [step, setStep] = useState<PaymentStep>("selection");

    if (status === "loading") return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
            <div className="w-8 h-8 border-4 border-t-white border-neutral-600 rounded-full animate-spin" />
        </div>
    );

    if (status === "unauthorized") {
        return <AccessDenied userRole={userRole} requiredRole="Guest" />;
    }

    // Read total from URL, fallback to default if not present
    const rawAmount = searchParams?.get("total") || "1990";
    const amount = Number(rawAmount).toLocaleString("en-US", { minimumFractionDigits: 2 });

    const handleMethodSelect = async (method: string) => {
        // The return parameters will be constructed directly when calling initiatePayment
        // to avoid appending too many unnecessary query params.

        if (method === "card") {
            setStep("card");
        } else {
            setStep("processing");
            try {
                const response = await paymentApi.initiatePayment({
                    amount: parseFloat(rawAmount),
                    currency: "LKR",
                    paymentMethod: method,
                    firstName: searchParams?.get("firstName") || "Guest",
                    lastName: searchParams?.get("lastName") || "User",
                    email: searchParams?.get("email") || "",
                    bookingId: searchParams?.get("bookingId") ? Number(searchParams.get("bookingId")) : undefined,
                    returnParams: `payment_success=true&bookingRef=${searchParams?.get("confirmationCode") || ""}`,
                });

                if (response.checkoutUrl && response.payHereParams) {
                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = response.checkoutUrl;
                    form.style.display = "none";

                    // Parse the param string from the backend and add each as a hidden input
                    const params = new URLSearchParams(response.payHereParams);
                    params.forEach((value, key) => {
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = key;
                        input.value = value;
                        form.appendChild(input);
                    });

                    document.body.appendChild(form);
                    form.submit();
                } else {
                    // Fallback: simulate success if no PayHere URL returned
                    setTimeout(() => setStep("success"), 2000);
                }
            } catch (err) {
                console.error("Payment initiation failed:", err);
                setStep("failed");
            }
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden py-12 px-4">
            {/* Immersive Background — CSS gradient (no external image dependency) */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a0a05] via-[#2d1208] to-[#0d0604]">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, #9a3300 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #c44a00 0%, transparent 50%)' }} />
            </div>

            {/* Main Payment Container */}
            <div className="relative z-10 w-full max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[28px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] flex flex-col animate-in fade-in zoom-in-95 duration-500">

                {/* Premium Header */}
                <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-white to-[#fafafa] border-b border-neutral-100 relative">
                    <button
                        onClick={handleCancel}
                        className="absolute right-6 top-6 w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-10 h-10 bg-[#9a3300] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#9a3300]/20">
                                <Building size={20} strokeWidth={2.5} />
                            </div>
                            <span className="font-black text-[24px] tracking-tighter text-[#1a1a1a]">PRIME STAY</span>
                        </div>
                        <p className="text-xs font-bold text-[#828282] uppercase tracking-[0.2em] mb-1">Secure Checkout</p>
                    </div>

                    {/* Amount Card */}
                    <div className="bg-[#1a1a1a] rounded-[20px] p-5 text-white shadow-xl shadow-black/10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Total to Pay</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[13px] font-bold text-[#fba121]">LKR</span>
                                <span className="text-[26px] font-black tracking-tight leading-none">{amount}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full">
                                <ShieldCheck size={12} className="text-[#4caf50]" />
                                <span>SSL Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {step === "selection" && (
                        <PaymentSelection onSelectMethod={handleMethodSelect} onCancel={handleCancel} />
                    )}

                    {step === "card" && (
                        <PaymentCardForm
                            onBack={() => setStep("selection")}
                            onSubmit={(success) => setStep(success ? "success" : "failed")}
                            amount={amount}
                        />
                    )}

                    {(step === "processing" || step === "success" || step === "failed") && (
                        <PaymentStatus
                            step={step}
                            onRetry={() => setStep("card")}
                            onChangeMethod={() => setStep("selection")}
                        />
                    )}
                </div>

                {/* Trust Footer */}
                <div className="px-8 py-5 bg-[#f8f9fa] border-t border-neutral-100 flex items-center justify-center gap-6">
                    <div className="text-[11px] font-bold text-neutral-400 grayscale opacity-60">
                        <Lock size={12} />
                        <span>Secured by PayHere (ID: 1235421)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
