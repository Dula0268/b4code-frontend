"use client";

import { useState } from "react";
import Image from "next/image";
import { Building, X } from "lucide-react";

import PaymentSelection from "./steps/payment-selection";
import PaymentCardForm from "./steps/payment-card-form";
import PaymentStatus from "./steps/payment-status";

export type PaymentStep = "selection" | "card" | "processing" | "success" | "failed";

export default function PaymentFlow() {
    const [step, setStep] = useState<PaymentStep>("selection");
    const amount = "1,990.00";

    const handleMethodSelect = (method: string) => {
        if (method === "card") {
            setStep("card");
        } else {
            // For wallets / banking: bypass the card form and simulate an external gateway redirect
            setStep("processing");
            setTimeout(() => {
                setStep("success");
            }, 2000);
        }
    };

    return (
        <div className="w-full max-w-[420px] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans animate-in fade-in zoom-in-95 duration-300 relative">
            {/* Common Header */}
            <div className="bg-[#2e2b2a] py-5 px-6 flex flex-col items-center justify-center relative">
                <button
                    onClick={() => window.history.back()}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-1 text-white">
                    <Building size={24} className="text-[#d84418]" />
                    <span className="font-extrabold text-[22px] tracking-tight">PRIME STAY</span>
                </div>
                <div className="text-[14px] font-medium text-white/90">
                    Rs. {amount}
                </div>
            </div>

            {/* Dynamic Step Content */}
            <div className="p-6 md:p-8 bg-[#f9f9f9] flex-1">
                {step === "selection" && (
                    <PaymentSelection
                        onSelectMethod={handleMethodSelect}
                        onCancel={() => window.history.back()}
                    />
                )}
                {step === "card" && (
                    <PaymentCardForm
                        onBack={() => setStep("selection")}
                        onSubmit={(isSuccess: boolean) => setStep(isSuccess ? "success" : "failed")}
                        amount={amount}
                    />
                )}
                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500 text-center">
                        <div className="w-10 h-10 border-[3px] border-[#e8e8e8] border-t-[#d84418] rounded-full animate-spin mb-6"></div>
                        <h2 className="text-[16px] font-bold text-[#1d1d1d] mb-2 tracking-tight">Connecting to Gateway</h2>
                        <p className="text-[12px] text-[#828282] max-w-[200px] leading-relaxed">
                            Please wait while we redirect you to your secure payment provider...
                        </p>
                    </div>
                )}
                {step === "success" && (
                    <PaymentStatus
                        status="success"
                        amount={amount}
                    />
                )}
                {step === "failed" && (
                    <PaymentStatus
                        status="failed"
                        onRetry={() => setStep("selection")}
                    />
                )}
            </div>

            {/* PayHere Footer */}
            {step !== "failed" && (
                <div className="bg-[#fafafa] py-4 border-t border-[#f0f0f0] flex flex-col items-center justify-center text-center mt-auto">
                    <div className="text-[11px] font-medium text-[#828282] mb-0.5">
                        Secured by <span className="text-[#1976d2] font-semibold tracking-wide">PayHere</span>
                    </div>
                    <div className="text-[9px] text-[#aaa]">
                        Merchant ID: 1214013 | Secured SSL Checkout
                    </div>
                </div>
            )}
        </div>
    );
}
