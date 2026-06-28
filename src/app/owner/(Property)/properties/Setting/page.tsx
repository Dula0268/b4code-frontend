/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    Settings as SettingsIcon,
    Shield,
    CreditCard,
    Save,
    CheckCircle2,
    AlertCircle,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

function SettingContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isActive, setIsActive] = useState(false);
    const [cancellationPolicy, setCancellationPolicy] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [togglingStatus, setTogglingStatus] = useState(false);

    useEffect(() => {
        if (!propertyId) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }
        Promise.all([
            propertiesApi.getProperty(Number(propertyId), ownerId),
            ownerSettingsApi.getBankAccounts(ownerId),
        ])
            .then(([prop, billing]) => {
                setProperty(prop);
                setIsActive(prop?.status === "active");
                setCancellationPolicy(prop?.cancellationPolicy ?? "");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const accounts: any[] = billing?.bankAccounts ?? billing ?? [];
                setBankAccounts(Array.isArray(accounts) ? accounts : []);
            })
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load settings.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    async function handleToggleStatus() {
        if (!propertyId) return;
        setTogglingStatus(true);
        try {
            const updated = await propertiesApi.toggleStatus(Number(propertyId), ownerId);
            setProperty(updated);
            setIsActive(updated?.status === "active");
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((err as any)?.response?.data?.message ?? "Failed to toggle status.");
        } finally {
            setTogglingStatus(false);
        }
    }

    async function handleSave() {
        if (!propertyId) return;
        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);
        try {
            const updated = await propertiesApi.updateProperty(Number(propertyId), ownerId, {
                cancellationPolicy,
            });
            setProperty(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSaveError((err as any)?.response?.data?.message ?? "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-[160px] bg-white border-r border-[#e0e0e0] py-3 shrink-0 flex flex-col">
                <div className="px-3.5">
                    <Logo width={120} height={36} />
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center py-1.5">
                    <div />
                    <div className="flex items-center gap-3">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">{property?.name ?? "Settings"}</span>
                </div>

                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={28} color="#953002" className="animate-spin" />
                    </div>
                )}
                {error && !loading && (
                    <div className="flex-1 flex items-center justify-center text-[13px] text-[#e74c3c]">{error}</div>
                )}

                {!loading && !error && property && (
                    <div className="flex-1 overflow-y-auto pb-4 pr-1">
                        {/* Property Header Card */}
                        <div className="bg-white border border-[#e8e8e8] rounded-[14px] py-3.5 px-5 flex items-center justify-between mb-0">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-[#953002] bg-[#f0ebe5] flex items-center justify-center">
                                    {property.image ? (
                                        <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={28} color="#c0a898" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-[20px] font-extrabold m-0 text-[#1d1d1d]">{property.name}</h2>
                                        <span
                                            className="text-[9px] font-bold text-white rounded w-max px-[7px] py-[2px] tracking-widest"
                                            style={{ backgroundColor: statusColor }}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="text-[12px] text-[#828282] mt-0.5 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {[property.address, property.city, property.country].filter(Boolean).join(", ")}
                                    </div>
                                    <div className="text-[12px] text-[#4f4f4f] mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-[3px]"><Bed size={12} /> {property.roomCount ?? 0} Rooms</span>
                                        <span className="flex items-center gap-[3px]"><Calendar size={12} /> {property.rate ?? "—"}/night</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#e8e8e8] mb-3 mt-2">
                            {tabs.map((t) => {
                                const isActive = t === "Settings";
                                return (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                            else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${propertyId}`;
                                            else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${propertyId}`;
                                            else if (t === "Rates") window.location.href = `/owner/properties/Rate?id=${propertyId}`;
                                            else if (t === "Reservations") window.location.href = `/owner/properties/Reservation?id=${propertyId}`;
                                            else if (t === "Media") window.location.href = `/owner/properties/Media?id=${propertyId}`;
                                            else if (t === "Staff") window.location.href = `/owner/properties/Staff?id=${propertyId}`;
                                            else if (t === "Settings") return;
                                        }}
                                        className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative border-b-2 ${
                                            isActive
                                                ? "text-[#953002] font-bold border-[#953002]"
                                                : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f]"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Two-column layout */}
                        <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
                            {/* Left column */}
                            <div className="flex flex-col gap-4">

                                {/* Property Status */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <SettingsIcon size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Property Status</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border border-[#f0f0f0] rounded-xl px-4">
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#1d1d1d]">
                                                Property is currently <span style={{ color: statusColor }} className="font-bold">{statusLabel}</span>
                                            </div>
                                            <div className="text-[11px] text-[#828282] mt-0.5">
                                                {isActive
                                                    ? "Your property is visible to guests and accepting bookings."
                                                    : "Your property is hidden from guests and not accepting new bookings."}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleToggleStatus}
                                            disabled={togglingStatus}
                                            className="flex items-center gap-2 py-2 px-4 border rounded-lg text-[12px] font-semibold cursor-pointer transition-colors disabled:opacity-50"
                                            style={{
                                                backgroundColor: isActive ? "#fde8e8" : "#dcfce7",
                                                color: isActive ? "#b91c1c" : "#15803d",
                                                borderColor: isActive ? "#fca5a5" : "#86efac",
                                            }}
                                        >
                                            {togglingStatus
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : isActive
                                                    ? <><ToggleRight size={16} /> Deactivate</>
                                                    : <><ToggleLeft size={16} /> Activate</>
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Cancellation Policy */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Cancellation Policy</span>
                                    </div>

                                    {saveSuccess && (
                                        <div className="flex items-center gap-2 mb-3 p-3 bg-[#dcfce7] border border-[#86efac] rounded-lg text-[13px] text-[#15803d]">
                                            <CheckCircle2 size={15} /> Settings saved successfully.
                                        </div>
                                    )}
                                    {saveError && (
                                        <div className="flex items-center gap-2 mb-3 p-3 bg-[#fde8e8] border border-[#fca5a5] rounded-lg text-[13px] text-[#b91c1c]">
                                            <AlertCircle size={15} /> {saveError}
                                        </div>
                                    )}

                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1.5">
                                        Cancellation Policy
                                    </label>
                                    <textarea
                                        value={cancellationPolicy}
                                        onChange={(e) => setCancellationPolicy(e.target.value)}
                                        placeholder="Describe your cancellation policy, e.g. Full refund if cancelled 48 hours before check-in..."
                                        rows={5}
                                        className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border outline-none focus:border-[#953002] resize-none leading-relaxed"
                                    />

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] disabled:opacity-60 transition-colors"
                                        >
                                            {saving
                                                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                                                : <><Save size={14} /> Save Settings</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="flex flex-col gap-4">
                                {/* Billing */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CreditCard size={16} color="#953002" />
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">Billing & Payouts</span>
                                    </div>

                                    {bankAccounts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-[#e0e0e0] rounded-xl bg-[#faf9f7]">
                                            <CreditCard size={28} color="#c0a898" className="mb-2" />
                                            <p className="text-[12px] text-[#828282]">No bank accounts added.</p>
                                            <a href="/owner/settings/billing" className="no-underline mt-2">
                                                <button className="py-1.5 px-3.5 bg-[#953002] text-white border-none rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                                    Add Bank Account
                                                </button>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {bankAccounts.map((account: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 border border-[#e8e8e8] rounded-lg bg-[#faf9f7]">
                                                    <div className="w-9 h-9 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0">
                                                        <CreditCard size={16} color="#953002" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[13px] font-semibold text-[#1d1d1d] truncate">
                                                            {account.bankName ?? account.accountName ?? "Bank Account"}
                                                        </div>
                                                        <div className="text-[11px] text-[#828282]">
                                                            {account.accountNumber
                                                                ? `****${String(account.accountNumber).slice(-4)}`
                                                                : account.accountType ?? "—"}
                                                        </div>
                                                    </div>
                                                    {account.isPrimary && (
                                                        <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full shrink-0">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            <a href="/owner/settings/billing" className="no-underline mt-1">
                                                <button className="w-full py-2 bg-white text-[#953002] border border-[#953002] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#fef5ef] transition-colors">
                                                    Manage Payout Methods
                                                </button>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Quick links */}
                                <div className="bg-[#fffbf5] border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="text-[13px] font-bold text-[#953002] mb-3">Quick Settings</div>
                                    <div className="flex flex-col gap-1.5">
                                        <a href={`/owner/properties/editPropertyDetails?id=${propertyId}`} className="no-underline">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer transition-colors">
                                                Edit Property Details
                                            </button>
                                        </a>
                                        <a href={`/owner/properties/propertyRoomInventry?id=${propertyId}`} className="no-underline">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer transition-colors">
                                                Manage Rooms
                                            </button>
                                        </a>
                                        <a href={`/owner/properties/Rate?id=${propertyId}`} className="no-underline">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer transition-colors">
                                                Configure Rates
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SettingPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <SettingContent />
        </Suspense>
    );
}
