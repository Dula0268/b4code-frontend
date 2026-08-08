/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { staffApi } from "@/api/owner/staff.api";
import { propertiesApi } from "@/api/owner/properties.api";
import {
    Bell, Users, Plus, CheckCircle2, XCircle, Loader2, Mail,
    Building2, UserPlus, X, Clock,
} from "lucide-react";

interface StaffMember {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    propertyName?: string;
    status: string;
    createdAt?: string;
}

interface Property {
    id: number;
    name: string;
}

export default function StaffPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

    // Invite form
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "", phone: "", propertyId: "" });
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviting, setInviting] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [staffData, propData] = await Promise.all([
                staffApi.getAll(),
                propertiesApi.listProperties(ownerId, 1, 100),
            ]);
            setAllStaff(Array.isArray(staffData) ? staffData : []);
            const list = Array.isArray(propData?.content) ? propData.content
                : Array.isArray(propData) ? propData : [];
            setProperties(list.map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })));
            setError(null);
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? "Failed to load staff data.");
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const pending = allStaff.filter((s) => s.status === "PENDING");
    const active  = allStaff.filter((s) => s.status === "APPROVED");

    async function handleAction(id: number, action: "approve" | "reject") {
        setActionLoading((prev) => ({ ...prev, [id]: action }));
        try {
            if (action === "approve") await staffApi.approve(id);
            else await staffApi.reject(id);
            await fetchAll();
        } catch (err: unknown) {
            alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Action failed.");
        } finally {
            setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
        }
    }

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
            setInviteError("Valid email is required."); return;
        }
        if (!inviteForm.firstName.trim()) { setInviteError("First name is required."); return; }
        if (!inviteForm.propertyId) { setInviteError("Please select a property."); return; }
        setInviteError(null);
        setInviting(true);
        try {
            await staffApi.invite({
                email: inviteForm.email.trim(),
                firstName: inviteForm.firstName.trim(),
                lastName: inviteForm.lastName.trim(),
                phone: inviteForm.phone.trim() || undefined,
                propertyId: Number(inviteForm.propertyId),
            });
            setInviteForm({ firstName: "", lastName: "", email: "", phone: "", propertyId: "" });
            setShowInvite(false);
            await fetchAll();
        } catch (err: unknown) {
            setInviteError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Invite failed.");
        } finally {
            setInviting(false);
        }
    }

    function formatDate(d?: string) {
        if (!d) return "—";
        try { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
        catch { return d; }
    }

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            <OwnerSidebar />

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

                {/* Page Header */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-[22px] font-extrabold text-[#1d1d1d] m-0">Staff Management</h1>
                        <p className="text-[12px] text-[#828282] mt-0.5 m-0">Invite and manage staff members across all your properties.</p>
                    </div>
                    <button
                        onClick={() => setShowInvite((v) => !v)}
                        className="flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors"
                    >
                        {showInvite ? <X size={14} /> : <UserPlus size={14} />}
                        {showInvite ? "Cancel" : "Invite Staff"}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-4 pr-1 flex flex-col gap-3">

                    {/* Invite Form */}
                    {showInvite && (
                        <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <UserPlus size={16} color="#953002" />
                                <span className="text-[14px] font-bold text-[#1d1d1d]">Invite a Staff Member</span>
                            </div>
                            <form onSubmit={handleInvite} className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">First Name <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="text" placeholder="e.g. John"
                                        value={inviteForm.firstName}
                                        onChange={(e) => setInviteForm((p) => ({ ...p, firstName: e.target.value }))}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[12px] outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Last Name</label>
                                    <input
                                        type="text" placeholder="e.g. Doe"
                                        value={inviteForm.lastName}
                                        onChange={(e) => setInviteForm((p) => ({ ...p, lastName: e.target.value }))}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[12px] outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Email <span className="text-[#e74c3c]">*</span></label>
                                    <input
                                        type="email" placeholder="staff@email.com"
                                        value={inviteForm.email}
                                        onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[12px] outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Phone</label>
                                    <input
                                        type="tel" placeholder="+94 77 000 0000"
                                        value={inviteForm.phone}
                                        onChange={(e) => setInviteForm((p) => ({ ...p, phone: e.target.value }))}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[12px] outline-none bg-white"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Assign to Property <span className="text-[#e74c3c]">*</span></label>
                                    <select
                                        value={inviteForm.propertyId}
                                        onChange={(e) => setInviteForm((p) => ({ ...p, propertyId: e.target.value }))}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[12px] outline-none bg-white"
                                    >
                                        <option value="">Select a property…</option>
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {inviteError && (
                                    <div className="col-span-2 text-[11px] text-[#e74c3c] bg-[#fdecea] rounded-lg px-3 py-2">{inviteError}</div>
                                )}
                                <div className="col-span-2 flex justify-end gap-2">
                                    <button
                                        type="button" onClick={() => setShowInvite(false)}
                                        className="py-2 px-4 border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer bg-white hover:bg-[#f5f5f5]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit" disabled={inviting}
                                        className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] disabled:opacity-60"
                                    >
                                        {inviting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                                        Send Invite
                                    </button>
                                </div>
                            </form>
                            <p className="text-[11px] text-[#b0b0b0] mt-3">
                                The staff member will appear in Pending Approvals. Share their login credentials with them so they can access the system.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex items-center justify-center py-20">
                            <Loader2 size={28} color="#953002" className="animate-spin" />
                        </div>
                    )}
                    {error && !loading && (
                        <div className="py-10 text-center text-[13px] text-[#e74c3c]">{error}</div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* Pending Approvals */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
                                    <Clock size={15} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Pending Approvals</span>
                                    {pending.length > 0 && (
                                        <span className="ml-1 text-[10px] font-bold px-2 py-0.5 bg-[#953002] text-white rounded-full">{pending.length}</span>
                                    )}
                                </div>
                                {pending.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <CheckCircle2 size={32} color="#c0a898" className="mb-2" />
                                        <p className="text-[13px] text-[#828282]">No pending approvals. All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#f5f5f5]">
                                        {pending.map((staff) => {
                                            const isActing = actionLoading[staff.id];
                                            return (
                                                <div key={staff.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#fef5ef] transition-colors">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-full bg-[#fef5ef] border border-[#f0cdb4] flex items-center justify-center shrink-0">
                                                            <img
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.email}`}
                                                                alt={staff.firstName}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-bold text-[#1d1d1d]">{staff.firstName} {staff.lastName}</div>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Mail size={11} color="#828282" />
                                                                <span className="text-[11px] text-[#828282]">{staff.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {staff.propertyName && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#953002] bg-[#fef5ef] px-2 py-0.5 rounded-full border border-[#f0cdb4]">
                                                                        <Building2 size={10} /> {staff.propertyName}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-[#b0b0b0]">Invited {formatDate(staff.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleAction(staff.id, "approve")}
                                                            disabled={!!isActing}
                                                            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-[#dcfce7] text-[#15803d] border border-[#86efac] rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#bbf7d0] disabled:opacity-50"
                                                        >
                                                            {isActing === "approve" ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle2 size={12} /> Approve</>}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(staff.id, "reject")}
                                                            disabled={!!isActing}
                                                            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-white text-[#b91c1c] border border-[#fca5a5] rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#fde8e8] disabled:opacity-50"
                                                        >
                                                            {isActing === "reject" ? <Loader2 size={12} className="animate-spin" /> : <><XCircle size={12} /> Reject</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Active Staff */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
                                    <Users size={15} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Active Staff</span>
                                    {active.length > 0 && (
                                        <span className="ml-1 text-[10px] font-bold px-2 py-0.5 bg-[#eafaf1] text-[#27ae60] rounded-full border border-[#a9dfbf]">{active.length}</span>
                                    )}
                                </div>
                                {active.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <Users size={32} color="#c0a898" className="mb-2" />
                                        <p className="text-[13px] text-[#828282]">No active staff yet. Invite someone to get started.</p>
                                        <button
                                            onClick={() => setShowInvite(true)}
                                            className="mt-3 flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]"
                                        >
                                            <UserPlus size={13} /> Invite Staff
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#f5f5f5]">
                                        {active.map((staff) => (
                                            <div key={staff.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#fafafa] transition-colors">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-full bg-[#eafaf1] border border-[#a9dfbf] flex items-center justify-center shrink-0">
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.email}`}
                                                            alt={staff.firstName}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] font-bold text-[#1d1d1d]">{staff.firstName} {staff.lastName}</div>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Mail size={11} color="#828282" />
                                                            <span className="text-[11px] text-[#828282]">{staff.email}</span>
                                                        </div>
                                                        {staff.propertyName && (
                                                            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#953002] bg-[#fef5ef] px-2 py-0.5 rounded-full border border-[#f0cdb4] mt-1 w-fit">
                                                                <Building2 size={10} /> {staff.propertyName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-[#eafaf1] text-[#27ae60] rounded-full border border-[#a9dfbf]">Active</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
