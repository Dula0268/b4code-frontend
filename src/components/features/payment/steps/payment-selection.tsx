"use client";

interface PaymentSelectionProps {
    onSelectMethod: (method: string) => void;
    onCancel: () => void;
}

export default function PaymentSelection({ onSelectMethod, onCancel }: PaymentSelectionProps) {
    return (
        <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-[11px] font-semibold text-[#828282] uppercase tracking-[0.05em] mb-4">
                Select a payment method
            </h2>

            {/* Credit/Debit Card */}
            <div className="mb-6">
                <h3 className="text-[12px] font-bold text-[#1d1d1d] mb-3">Credit/Debit Card</h3>
                <div className="flex flex-wrap gap-2">
                    {/* VISA */}
                    <button onClick={() => onSelectMethod("card")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#1976d2] transition-colors cursor-pointer shadow-sm">
                        <span className="text-[#1a1f71] font-bold italic text-[14px] tracking-tight">VISA</span>
                    </button>
                    {/* Mastercard */}
                    <button onClick={() => onSelectMethod("card")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#eb001b] transition-colors cursor-pointer shadow-sm relative overflow-hidden">
                        <div className="w-4 h-4 rounded-full bg-[#eb001b] absolute left-3 opacity-90 mix-blend-multiply"></div>
                        <div className="w-4 h-4 rounded-full bg-[#f79e1b] absolute right-3 opacity-90 mix-blend-multiply"></div>
                    </button>
                    {/* AMEX */}
                    <button onClick={() => onSelectMethod("card")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#002663] transition-colors cursor-pointer shadow-sm">
                        <div className="bg-[#002663] px-1 py-0.5 rounded-sm">
                            <span className="text-white font-bold text-[8px] tracking-wider block leading-none">AMERICAN<br/>EXPRESS</span>
                        </div>
                    </button>
                    {/* Discover */}
                    <button onClick={() => onSelectMethod("card")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#f9a021] transition-colors cursor-pointer shadow-sm">
                        <span className="text-[#333] font-bold text-[10px] tracking-tighter">DISC<span className="text-[#f9a021]">O</span>VER</span>
                    </button>
                    {/* Diners Club */}
                    <button onClick={() => onSelectMethod("card")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex flex-col items-center justify-center rounded-lg hover:border-[#00529b] transition-colors cursor-pointer shadow-sm">
                        <div className="w-3 h-3 border-2 border-[#00529b] rounded-full mb-0.5" />
                        <span className="text-[#00529b] font-bold text-[6px] tracking-wider leading-none">Diners Club</span>
                    </button>
                </div>
            </div>

            {/* Mobile Wallet */}
            <div className="mb-6">
                <h3 className="text-[12px] font-bold text-[#1d1d1d] mb-3">Mobile Wallet</h3>
                <div className="flex flex-wrap gap-2">
                    {/* Genie */}
                    <button onClick={() => onSelectMethod("genie")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex flex-col items-center justify-center rounded-lg hover:border-[#e9275b] transition-colors cursor-pointer shadow-sm">
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#fba121] -rotate-90 ml-1 mb-0.5" />
                        <span className="text-[#e9275b] font-bold text-[10px] tracking-tight leading-none">genie</span>
                    </button>
                    {/* FriMi */}
                    <button onClick={() => onSelectMethod("frimi")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#ed4224] transition-colors cursor-pointer shadow-sm">
                        <div className="bg-[#ed4224] w-10 h-[18px] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold italic text-[9px] tracking-tight">FriMi</span>
                        </div>
                    </button>
                    {/* ezCash */}
                    <button onClick={() => onSelectMethod("ezcash")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#f8b415] transition-colors cursor-pointer shadow-sm">
                        <span className="text-[#72bc44] font-bold text-[9px] italic tracking-tight">eZ</span>
                        <span className="text-[#ed1c24] font-bold text-[9px] tracking-tight">Cash</span>
                    </button>
                    {/* mCash */}
                    <button onClick={() => onSelectMethod("mcash")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center gap-0.5 rounded-lg hover:border-[#0092d0] transition-colors cursor-pointer shadow-sm">
                        <span className="text-[#4caf50] font-extrabold text-[12px]">m</span>
                        <span className="text-[#0092d0] font-bold text-[8px] bg-sky-100 px-0.5 rounded-sm">Cash</span>
                    </button>
                    {/* Sampath PayApp */}
                    <button onClick={() => onSelectMethod("sampath")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex flex-col items-center justify-center rounded-lg hover:border-[#f37021] transition-colors cursor-pointer shadow-sm">
                        <span className="text-[#003b70] font-bold text-[6px]">Sampath</span>
                        <div className="bg-[#f37021] text-white text-[7px] font-bold px-1 rounded-sm mt-0.5">PayApp</div>
                    </button>
                </div>
            </div>

            {/* Internet Banking */}
            <div className="mb-8">
                <h3 className="text-[12px] font-bold text-[#1d1d1d] mb-3">Internet Banking</h3>
                <div className="flex flex-wrap gap-2">
                    {/* BOC */}
                    <button onClick={() => onSelectMethod("boc")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#fdb913] transition-colors cursor-pointer shadow-sm">
                        <div className="bg-[#fdb913] text-black font-bold text-[10px] px-1 rounded-sm">BOC</div>
                    </button>
                    {/* HNB */}
                    <button onClick={() => onSelectMethod("hnb")} className="w-[56px] h-[38px] bg-[#f8f9fa] border border-[#e0e0e0] flex items-center justify-center rounded-lg hover:border-[#003c71] transition-colors cursor-pointer shadow-sm">
                        <div className="bg-[#003c71] text-[#fdb913] font-bold text-[10px] px-1 rounded-sm">HNB</div>
                    </button>
                </div>
            </div>
            
        </div>
    );
}
