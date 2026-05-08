"use client";

import { CreditCard, Wallet, Landmark, ChevronRight } from "lucide-react";

interface PaymentSelectionProps {
    onSelectMethod: (method: string) => void;
    onCancel: () => void;
}

export default function PaymentSelection({ onSelectMethod, onCancel }: PaymentSelectionProps) {
    const methods = [
        { id: "card", name: "Credit / Debit Card", icon: CreditCard, subtitle: "Visa, Mastercard, Amex", primary: true },
        { id: "genie", name: "Mobile Wallets", icon: Wallet, subtitle: "Genie, FriMi, eZCash", primary: false },
        { id: "boc", name: "Internet Banking", icon: Landmark, subtitle: "BOC, HNB, Sampath", primary: false },
    ];

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[14px] font-bold text-[#1a1a1a] mb-5 px-1">Select Payment Method</h2>
            
            <div className="space-y-3">
                {methods.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => onSelectMethod(m.id)}
                        className={`w-full group p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                            m.primary 
                            ? "bg-neutral-50 border-neutral-100 hover:border-[#9a3300]/30 hover:bg-white hover:shadow-lg hover:shadow-[#9a3300]/5" 
                            : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                m.primary ? "bg-white text-[#9a3300] shadow-sm" : "bg-neutral-100 text-neutral-500"
                            } group-hover:bg-[#9a3300] group-hover:text-white`}>
                                <m.icon size={22} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[15px] font-bold text-[#1a1a1a]">{m.name}</span>
                                <span className="text-[11px] font-medium text-neutral-400">{m.subtitle}</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-neutral-300 group-hover:text-[#9a3300] group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-full border border-neutral-100">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-neutral-300 animate-pulse" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Trusted by 10k+ Travelers</span>
                </div>
            </div>
        </div>
    );
}
