"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, User, Building, Clock, ArrowLeft, Phone, Briefcase, Calendar } from "lucide-react";
import { ownerApi } from "@/api/owner/owner.api";
import { Button } from "@/components/ui/button";

interface StaffMember {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    propertyName: string;
    status: string;
    role?: string;
    registeredAt?: string;
}

export default function OwnerStaffPage() {
    const router = useRouter();
    const [pendingStaff, setPendingStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await ownerApi.getPendingStaff();
            setPendingStaff(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load staff requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await ownerApi.approveStaff(id);
            setPendingStaff(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Approval failed");
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject this staff registration?")) return;
        try {
            await ownerApi.rejectStaff(id);
            setPendingStaff(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Rejection failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8F7] p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button 
                            onClick={() => router.push("/owner")}
                            className="flex items-center gap-2 text-[#953002] font-bold text-sm mb-2 hover:underline"
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 className="text-[32px] font-black text-[#282828] tracking-tight">Staff Management</h1>
                        <p className="text-[#666] font-medium">Verify and approve staff members for your properties.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[32px] border border-neutral-200 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 bg-[#fcfaf9]">
                        <h2 className="text-[18px] font-bold text-[#953002] flex items-center gap-2">
                            <Clock size={20} /> Pending Approvals
                            {pendingStaff.length > 0 && (
                                <span className="bg-[#953002] text-white text-[11px] px-2 py-0.5 rounded-full ml-1">
                                    {pendingStaff.length}
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="divide-y divide-neutral-100">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin h-8 w-8 border-4 border-[#953002] border-t-transparent rounded-full mx-auto mb-4" />
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[11px]">Loading requests...</p>
                            </div>
                        ) : error ? (
                            <div className="p-20 text-center text-red-500 font-medium">
                                {error}
                                <Button onClick={fetchStaff} variant="outline" className="mt-4 mx-auto block">Try Again</Button>
                            </div>
                        ) : pendingStaff.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={32} className="text-neutral-300" />
                                </div>
                                <h3 className="text-[18px] font-bold text-neutral-400">No pending requests</h3>
                                <p className="text-neutral-400 text-sm">You&apos;re all caught up! All staff members have been processed.</p>
                            </div>
                        ) : (
                            pendingStaff.map(staff => (
                                <div key={staff.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 bg-[#f0e8e4] rounded-2xl flex items-center justify-center text-[#953002] font-black text-xl">
                                            {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-[17px] font-black text-[#282828]">{staff.firstName} {staff.lastName}</h4>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <p className="text-[13px] text-neutral-500 font-medium flex items-center gap-1.5">
                                                    <User size={14} className="text-[#953002]/60" /> {staff.email}
                                                </p>
                                                <p className="text-[13px] text-neutral-500 font-medium flex items-center gap-1.5">
                                                    <Phone size={14} className="text-[#953002]/60" /> {staff.phone || "Not provided"}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full border border-neutral-200 flex items-center gap-1.5">
                                                    <Building size={12} /> {staff.propertyName}
                                                </span>
                                                <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 flex items-center gap-1.5">
                                                    <Briefcase size={12} /> {staff.role?.replace(/_/g, " ") || "N/A"}
                                                </span>
                                                <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-1.5">
                                                    <Calendar size={12} /> {staff.registeredAt ? new Date(staff.registeredAt).toLocaleDateString() : "Unknown date"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleReject(staff.id)}
                                            className="flex-1 md:flex-none h-11 px-6 rounded-xl border border-red-200 text-red-600 font-extrabold text-[13px] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(staff.id)}
                                            className="flex-1 md:flex-none h-11 px-8 rounded-xl bg-[#953002] text-white font-extrabold text-[13px] hover:bg-[#7a2600] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#953002]/20"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center text-neutral-400 text-[11px] font-bold uppercase tracking-widest opacity-50">
                    Prime Stay &copy; 2024 • Owner Verification Portal
                </div>
            </div>
        </div>
    );
}
