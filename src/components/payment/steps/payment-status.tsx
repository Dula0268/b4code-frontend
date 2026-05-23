"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, CalendarCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PaymentStatusProps {
    step: "processing" | "success" | "failed";
    onRetry?: () => void;
    onChangeMethod?: () => void;
}

export default function PaymentStatus({ step, onRetry, onChangeMethod }: PaymentStatusProps) {
    const router = useRouter();

    useEffect(() => {
        if (step === "success") {
            const timer = setTimeout(() => {
                // Get existing search params to preserve booking info
                const params = new URLSearchParams(window.location.search);
                
                // IMPORTANT: Ensure we mark it as paid
                params.set("paidInFull", "1");
                
                // If we don't have a code in the URL, only then generate one
                // (This helps if the user arrived here without a pre-generated code)
                if (!params.has("confirmationCode")) {
                    params.set("confirmationCode", "B4C-" + Math.random().toString(36).substring(2, 9).toUpperCase());
                }
                
                const finalUrl = `/guest/booking/confirmation?${params.toString()}`;
                router.push(finalUrl);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, router]);

    if (step === "processing") {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-neutral-100 rounded-full" />
                    <div className="absolute inset-0 w-20 h-20 border-4 border-t-[#9a3300] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={32} className="text-[#9a3300] opacity-20" />
                    </div>
                </div>
                <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Authorizing Payment</h2>
                <p className="text-[13px] text-neutral-400 max-w-[240px] leading-relaxed">
                    Please do not refresh the page. We are securing your transaction with the bank.
                </p>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-[#4caf50]/10 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-[#4caf50]/20 rounded-full animate-ping opacity-40" />
                    <CheckCircle2 size={48} className="text-[#4caf50] relative z-10" />
                </div>
                
                <h2 className="text-[24px] font-black text-[#1a1a1a] mb-2 tracking-tight">Payment Successful!</h2>
                <p className="text-[14px] text-neutral-500 mb-8 max-w-[280px] leading-relaxed">
                    Your luxury stay is now secured. Redirecting you to your booking details...
                </p>

                <div className="w-full bg-[#f8f9fa] rounded-2xl p-4 flex items-center gap-4 border border-neutral-100 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9a3300] shadow-sm">
                        <CalendarCheck size={20} />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Next Step</p>
                        <p className="text-[13px] font-bold text-[#1a1a1a]">View Confirmation</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-neutral-300 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-[20px] font-bold text-[#1a1a1a] mb-2">Payment Failed</h2>
            <p className="text-[13px] text-neutral-400 mb-8 max-w-[240px] leading-relaxed">
                Something went wrong with your transaction. Please check your card details and try again.
            </p>

            {/* Simulated Credit Card Image */}
            <div className="w-[180px] h-[110px] rounded-xl bg-gradient-to-br from-[#0a2327] to-[#121415] mb-6 shadow-md relative overflow-hidden flex flex-col justify-end p-3">
                <div className="absolute top-3 left-3 text-[5px] text-white/50 tracking-widen">CREDIT CARD</div>
                <div className="w-6 h-4 border border-white/20 rounded-sm mb-2 opacity-60"></div>
                <div className="text-white/90 text-[10px] tracking-widest font-mono mb-2">1234 5645 5641 5362</div>
                <div className="flex justify-between items-end">
                    <span className="text-white/60 text-[5px] uppercase">Cardholder Name</span>
                    <div className="flex items-center -space-x-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 mix-blend-screen opacity-80" />
                        <div className="w-3 h-3 rounded-full bg-red-500 mix-blend-screen opacity-80" />
                    </div>
                </div>
            </div>

            <div className="w-full space-y-3 px-4 mb-6">
                <Button
                    onClick={onRetry}
                    className="w-full h-[46px] rounded-md bg-[#9a3300] hover:bg-[#7a2800] text-white font-medium text-[14px] transition-all"
                >
                    Retry Payment
                </Button>

                <Button
                    onClick={onChangeMethod}
                    variant="ghost"
                    className="w-full h-[46px] rounded-md bg-[#fff4eb] hover:bg-[#ffe8d6] text-[#9a3300] font-bold text-[14px] transition-all"
                >
                    Change Payment Method
                </Button>
            </div>

            <div className="text-[11px] text-[#555]">
                Need help? <a href="#" className="text-[#9a3300] hover:underline underline-offset-2">Contact Support</a>
            </div>

            <div className="mt-8 flex flex-col items-center opacity-40">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    SECURED BY <span className="bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded-sm lowercase font-black text-[10px] tracking-normal">PayHere</span>
                </div>
                <div className="text-[8px] text-neutral-400 font-bold uppercase tracking-tighter">SSL Encrypted Transaction</div>
            </div>
        </div>
    );
}
