"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);
            const willFail = name.toLowerCase().includes("fail");
            onSubmit(!willFail);
        }, 1500);
    };

    return (
        <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
            {/* Top Indicator */}
            <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-[#828282] uppercase tracking-[0.1em]">
                <div className="w-4 border-t border-[#ccc]"></div>
                <span>Credit / Debit Card</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name on Card */}
                <div>
                    <Input
                        type="text"
                        placeholder="Name on the card"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-[46px] w-full rounded-md bg-[#fafafa] border-[#e8e8e8] text-[13px] placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#b2481b] shadow-sm"
                        required
                        disabled={isProcessing}
                    />
                </div>

                {/* Card Number */}
                <div>
                    <Input
                        type="text"
                        placeholder="Card Number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                        maxLength={19}
                        className="h-[46px] w-full rounded-md bg-[#fafafa] border-[#e8e8e8] text-[13px] placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#b2481b] shadow-sm tracking-wide"
                        required
                        disabled={isProcessing}
                    />
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Input
                            type="text"
                            placeholder="Expiry (MM/YY)"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value.replace(/[^0-9/]/g, '').replace(/^(\d{2})(\d)/, '$1/$2'))}
                            maxLength={5}
                            className="h-[46px] w-full rounded-md bg-[#fafafa] border-[#e8e8e8] text-[13px] placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#b2481b] shadow-sm"
                            required
                            disabled={isProcessing}
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="CVC"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            maxLength={4}
                            className="h-[46px] w-full rounded-md bg-[#fafafa] border-[#e8e8e8] text-[13px] placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#b2481b] shadow-sm tracking-widest placeholder:tracking-normal"
                            required
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        disabled={isProcessing || !name || cardNumber.length < 15 || expiry.length < 5 || cvv.length < 3} 
                        className="w-full h-[46px] rounded-md bg-[#9a3300] hover:bg-[#7a2800] text-white font-medium text-[14px] transition-all"
                    >
                        {isProcessing ? "Processing..." : `Pay ${amount}`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
