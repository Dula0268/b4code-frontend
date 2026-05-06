"use client";

import { Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PaymentStatusProps {
    status: "success" | "failed";
    amount?: string;
    onRetry?: () => void;
}

export default function PaymentStatus({ status, amount, onRetry }: PaymentStatusProps) {
    const router = useRouter();

    useEffect(() => {
        if (status === "success") {
            const timer = setTimeout(() => {
                router.push("/guest/booking/confirmation");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    const handleRedirect = () => {
        router.push("/guest/booking/confirmation");
    };

    if (status === "success") {
        return (
            <div className="flex flex-col animate-in zoom-in-95 duration-500">
                <div className="text-[12px] font-medium text-[#828282] uppercase tracking-wide mb-8">
                    THANK YOU!
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full border-[3px] border-[#4caf50] flex items-center justify-center mb-4 text-[#4caf50]">
                        <Check strokeWidth={3} className="w-8 h-8" />
                    </div>

                    <h2 className="text-[16px] font-medium text-[#1d1d1d] mb-6">Payment Approved</h2>
                </div>

                <div className="bg-[#e5e5e5] -mx-6 md:-mx-8 py-5 text-center mb-6">
                    <div className="text-[18px] text-[#1d1d1d] tracking-wide">
                        Payment ID #1215221555
                    </div>
                </div>

                <p className="text-[10px] text-[#828282] text-center px-4">
                    You will receive an Email Receipt with this payment ID for future reference
                </p>

                {/* Simulated full height filler if needed so footer sticks to bottom, but we have global footer */}
            </div>
        );
    }

    // Failed State
    return (
        <div className="flex flex-col animate-in zoom-in-95 duration-500 text-center items-center justify-center pt-2 pb-6">

            <div className="w-14 h-14 rounded-full border-[2px] border-[#e9275b] flex items-center justify-center mb-4 text-[#e9275b]">
                <AlertCircle strokeWidth={2} className="w-8 h-8" />
            </div>

            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-2 tracking-tight">Payment Failed</h2>
            <p className="text-[12px] text-[#555] font-medium max-w-[260px] mb-6 leading-relaxed">
                We couldn&apos;t process your payment. Please check your card details or try a different method.
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
                    onClick={onRetry}
                    variant="ghost"
                    className="w-full h-[46px] rounded-md bg-[#fff4eb] hover:bg-[#ffe8d6] text-[#9a3300] font-bold text-[14px] transition-all"
                >
                    Change Payment Method
                </Button>
            </div>

            <div className="text-[11px] text-[#555]">
                Need help? <a href="#" className="text-[#e9275b] hover:underline underline-offset-2">Contact Support</a>
            </div>

            <div className="mt-4 flex flex-col items-center">
                <div className="text-[9px] text-[#828282] uppercase tracking-wider mb-1 flex items-center gap-1">
                    POWERED BY <span className="bg-[#1976d2] text-white px-2 py-0.5 rounded-sm lowercase font-bold text-[10px] tracking-normal">PayHere</span>
                </div>
                <div className="text-[8px] text-[#aaa]">Secure Payment Gateway for Sri Lanka</div>
            </div>
        </div>
    );
}
