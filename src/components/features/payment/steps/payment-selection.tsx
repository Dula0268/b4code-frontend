"use client";

import { ExternalLink } from "lucide-react";

interface PaymentSelectionProps {
    onSelectMethod: (method: string) => void;
    onCancel: () => void;
}

export default function PaymentSelection({ onSelectMethod }: PaymentSelectionProps) {
    const methods = [
        {
            id: "payhere",
            name: "Secure Checkout",
            icon: ExternalLink,
            subtitle: "Credit / Debit Card, Mobile Wallet, or Internet Banking",
            primary: true,
            badge: "Powered by PayHere",
        }
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
                            ? "bg-gradient-to-r from-[#9a3300]/5 to-[#c44a00]/5 border-[#9a3300]/30 hover:border-[#9a3300] hover:shadow-lg hover:shadow-[#9a3300]/10"
                            : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                m.primary ? "bg-[#9a3300] text-white shadow-md shadow-[#9a3300]/30" : "bg-neutral-100 text-neutral-500 group-hover:bg-[#9a3300] group-hover:text-white"
                            }`}>
                                <m.icon size={22} />
                            </div>
                            <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[15px] font-bold ${m.primary ? "text-[#9a3300]" : "text-[#1a1a1a]"}`}>{m.name}</span>
                                    {m.badge && (
                                        <span className="text-[9px] font-black text-white bg-[#9a3300] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                            {m.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-medium text-neutral-400">{m.subtitle}</span>
                            </div>
                        </div>
                        <div className={`text-[11px] font-bold rounded-full px-2 py-1 ${m.primary ? "text-[#9a3300] bg-[#9a3300]/10" : "text-neutral-300"}`}>
                            {m.primary ? "→" : "›"}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-full border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">🔒 Trusted by 10k+ Travelers</span>
                </div>
            </div>
        </div>
    );
}
