/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import {
    Bell,
        User,
    Home,
    BellRing,
    CreditCard,
    Puzzle,
    Mail,
    MessageSquare,
    Smartphone,
    Save,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * NotificationPreferencesPage Component
 *
 * Allows owners to configure notification channels (email, SMS, push)
 * and toggle individual event triggers for bookings, payments, and reviews.
 */
export default function NotificationPreferencesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [newBookings, setNewBookings] = useState(true);
    const [cancellations, setCancellations] = useState(true);
    const [guestMessages, setGuestMessages] = useState(true);
    const [maintenance, setMaintenance] = useState(false);
    const [dailyReports, setDailyReports] = useState(true);
    const [emailChannel, setEmailChannel] = useState(true);
    const [smsChannel, setSmsChannel] = useState(false);
    const [pushChannel, setPushChannel] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await ownerSettingsApi.updateNotifications(ownerId, {
                emailNotifications: emailChannel,
                smsAlerts: smsChannel,
                pushNotifications: pushChannel,
                bookingConfirmations: newBookings,
                monthlyReports: dailyReports,
                maintenanceAlerts: maintenance,
            });
            router.push("/owner");
        } catch {
            // silently fail — preferences are non-critical
        } finally {
            setSaving(false);
        }
    };



    const settingsTabs = [
        { label: "Account Settings", icon: <User size={16} />, href: "/owner/setting/accountSetting" },
        { label: "Property Settings", icon: <Home size={16} />, href: "/owner/setting/propertySetting" },
        { label: "Notification Preferences", icon: <BellRing size={16} />, active: true, href: "/owner/setting/notificationPreferences" },
        { label: "Billing & Payouts", icon: <CreditCard size={16} />, href: "/owner/setting/billing&Payout" },
        { label: "Integrations", icon: <Puzzle size={16} />, href: "/owner/setting/integration" },
    ];

    const Toggle = ({ value, onChange }: { value: boolean, onChange: (val: boolean) => void }) => (
        <button onClick={() => onChange(!value)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 shrink-0 ${value ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
            <span className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
        </button>
    );

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-1">
                        <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#4f4f4f] no-underline">Settings</a>
                        <span className="text-[#b0b0b0] mx-1">/</span>
                        <span className="text-[12px] font-semibold text-[var(--brand-primary)]">Notification Preferences</span>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1">Notification Preferences</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-5">Control how and when you receive alerts.</p>

                    {/* Content Area */}
                    <div className="flex gap-6 items-start">
                        {/* Settings Tabs */}
                        <div className="w-[200px] shrink-0 flex flex-col gap-1">
                            {settingsTabs.map((tab) => (
                                <a
                                    key={tab.label}
                                    href={tab.href || "#"}
                                    className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 no-underline ${
                                        tab.active
                                            ? "bg-[var(--brand-primary)] text-white font-bold"
                                            : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </a>
                            ))}
                        </div>

                        {/* Main Panel */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            {/* ─── General Notifications ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">General Notifications</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Updates about your bookings and messages.</p>

                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">New Bookings</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">Get notified when a new guest reserves a property.</div>
                                    </div>
                                    <Toggle value={newBookings} onChange={setNewBookings} />
                                </div>

                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Cancellations</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">Receive alerts when a booking is cancelled.</div>
                                    </div>
                                    <Toggle value={cancellations} onChange={setCancellations} />
                                </div>

                                <div className="flex justify-between items-center py-3.5">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Guest Messages</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">Stay informed when guests send inquiries or questions.</div>
                                    </div>
                                    <Toggle value={guestMessages} onChange={setGuestMessages} />
                                </div>
                            </div>

                            {/* ─── System Alerts ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">System Alerts</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Critical alerts and automated summaries.</p>

                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Maintenance Requests</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">Immediate alerts for reported property issues.</div>
                                    </div>
                                    <Toggle value={maintenance} onChange={setMaintenance} />
                                </div>

                                <div className="flex justify-between items-center py-3.5">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Daily Reports</div>
                                        <div className="text-[11px] text-[#828282] mt-0.5">A summary of activity and revenue every morning.</div>
                                    </div>
                                    <Toggle value={dailyReports} onChange={setDailyReports} />
                                </div>
                            </div>

                            {/* ─── Delivery Channels ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Delivery Channels</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Opt-in to the communication platforms you prefer.</p>

                                <div className="flex justify-between items-center bg-[#fafafa] rounded-[10px] py-3.5 px-4.5 mb-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fef0e7] flex items-center justify-center">
                                            <Mail size={18} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">Email</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5">Detailed alerts sent to your inbox.</div>
                                        </div>
                                    </div>
                                    <Toggle value={emailChannel} onChange={setEmailChannel} />
                                </div>

                                <div className="flex justify-between items-center bg-[#fafafa] rounded-[10px] py-3.5 px-4.5 mb-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fef0e7] flex items-center justify-center">
                                            <MessageSquare size={18} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">SMS</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5">Brief, urgent text message notifications.</div>
                                        </div>
                                    </div>
                                    <Toggle value={smsChannel} onChange={setSmsChannel} />
                                </div>

                                <div className="flex justify-between items-center bg-[#fafafa] rounded-[10px] py-3.5 px-4.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fef0e7] flex items-center justify-center">
                                            <Smartphone size={18} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">Push Notifications</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5">Real-time alerts directly on your device.</div>
                                        </div>
                                    </div>
                                    <Toggle value={pushChannel} onChange={setPushChannel} />
                                </div>
                            </div>

                            {/* ─── Bottom Actions ─── */}
                            <div className="flex justify-end gap-3 mt-1 pt-4">
                                <a href="/owner" className="no-underline">
                                    <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Cancel</button>
                                </a>
                                <a href="/owner" className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors">
                                        <Save size={14} /> Save Changes
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
    );
}
