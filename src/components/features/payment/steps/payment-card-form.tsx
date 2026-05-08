"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paymentApi } from "@/lib/api";

interface PaymentCardFormProps {
    onBack: () => void;
    onSubmit: (isSuccess: boolean) => void;
    amount: string;
}

export default function PaymentCardForm({ onBack, onSubmit, amount }: PaymentCardFormProps) {
    const [name, setName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // ─── Test Conditions ──────────────────────────────────────────────
            // If you enter "FAIL" in the name, we simulate a decline for testing
            if (name.toUpperCase().includes("FAIL")) {
                throw new Error("Card Declined (Test Mode)");
            }

            await paymentApi.initiatePayment({
                amount: parseFloat(amount.replace(/,/g, '')),
                currency: "LKR",
                paymentMethod: "card",
                cardHolderName: name,
                cardNumber: cardNumber,
                cardExpiry: expiry
            });

            setTimeout(() => {
                setIsProcessing(false);
                onSubmit(true);
            }, 1500);
        } catch {
            setIsProcessing(false);
            onSubmit(false);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-bold text-neutral-400 hover:text-[#9a3300] transition-colors mb-6 group cursor-pointer w-fit">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to methods
            </button>

            {/* Visual Card Preview */}
            <div className="relative w-full aspect-[1.58/1] rounded-[22px] bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] p-6 text-white shadow-2xl mb-8 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-white/10" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-9 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md opacity-80" />
                        <CreditCard size={28} className="text-white/40" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="text-[20px] font-medium tracking-[0.15em] text-white/90 drop-shadow-md">
                            {cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Card Holder</span>
                                <span className="text-[13px] font-bold uppercase tracking-wide truncate max-w-[180px]">
                                    {name || "YOUR NAME"}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Expires</span>
                                <span className="text-[13px] font-bold tracking-wider">{expiry || "MM/YY"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <div>
                        <Input
                            placeholder="Full Name on Card"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 bg-neutral-50 border-neutral-100 rounded-xl focus-visible:ring-[#9a3300] text-[14px]"
                            required
                        />
                    </div>

                    <div>
                        <Input
                            placeholder="Card Number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                            maxLength={19}
                            className="h-12 bg-neutral-50 border-neutral-100 rounded-xl focus-visible:ring-[#9a3300] text-[14px] tracking-wider"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value.replace(/[^0-9/]/g, '').replace(/^(\d{2})(\d)/, '$1/$2'))}
                            maxLength={5}
                            className="h-12 bg-neutral-50 border-neutral-100 rounded-xl focus-visible:ring-[#9a3300] text-[14px]"
                            required
                        />
                        <Input
                            placeholder="CVV"
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            maxLength={3}
                            className="h-12 bg-neutral-50 border-neutral-100 rounded-xl focus-visible:ring-[#9a3300] text-[14px]"
                            required
                        />
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={isProcessing || !name || cardNumber.length < 15}
                    className="w-full h-14 bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-[#9a3300]/20 transition-all mt-4"
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        `Pay LKR ${amount}`
                    )}
                </Button>
                
                <div className="flex items-center justify-center gap-1.5 text-neutral-400">
                    <Lock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Encrypted Connection</span>
                </div>
            </form>
        </div>
    );
}
