"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Lock, User, Phone, Building2, CheckCircle2, ShieldCheck, UploadCloud, Loader2 } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/auth/auth.api";
import { imageApi } from "@/api/image/image.api";
import { validateUploadFile } from "@/lib/file-validator";
import { formatApiError } from "@/lib/error-formatter";

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AcceptInviteForm />
        </Suspense>
    );
}

function AcceptInviteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");
    const [password, setPassword] = useState("");
    
    // File upload
    const [ownerIdUrl, setOwnerIdUrl] = useState("");
    const [isUploadingId, setIsUploadingId] = useState(false);
    const [idUploadError, setIdUploadError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!token) {
            setLocalError("Invalid or missing invitation token.");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\[\]{}|\\:;"'<>,.?/~`])[A-Za-z\d@$!%*?&#^()_+=\[\]{}|\\:;"'<>,.?/~`]{8,}$/;

        if (!passwordRegex.test(password)) {
            setLocalError(
                "Password must be at least 8 characters and include uppercase, lowercase, number and a special character."
            );
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setLocalError("Phone number must be exactly 10 digits (e.g. 0777646946).");
            return;
        }

        if (!ownerIdUrl) {
            setLocalError("Please upload your National ID (NIC) or Business Registration document to complete registration.");
            return;
        }

        setLoading(true);
        try {
            await authApi.acceptInvite({
                token,
                password,
                firstName,
                lastName,
                phone,
                propertyName,
                propertyAddress,
                nationalId: ownerIdUrl
            });
            
            setSuccessMessage("Your account has been successfully set up! Redirecting you to login...");
            setTimeout(() => {
                router.push("/auth/login?role=owner");
            }, 2000);
        } catch (err) {
            setLocalError(formatApiError(err, "Failed to accept invite. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md text-center border border-red-200">
                    <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
                    <p className="text-sm">The invitation link you clicked is missing a required token. Please make sure you copied the full link from your email.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white relative flex flex-col p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-[600px] my-auto">
                <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-[#fcfaf9] shadow-2xl px-6 py-8 sm:px-10 flex flex-col items-center">
                    
                    <div className="text-center mb-6 w-full">
                        <h2 className="text-[28px] font-extrabold text-[#953002] md:text-[32px] leading-tight">
                            Complete Your Profile
                        </h2>
                        <p className="mt-2 text-[14px] text-[#953002]/80 font-medium">
                            Welcome! Please provide your details to finish setting up your Owner account.
                        </p>
                    </div>

                    {successMessage ? (
                        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center border border-emerald-200 w-full animate-in fade-in duration-300">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                            <p className="font-bold">{successMessage}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="pl-1 text-[13px] font-bold text-[#282828]">First Name</Label>
                                    <div className="relative">
                                        <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                            <Input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                required
                                            />
                                            <User className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="pl-1 text-[13px] font-bold text-[#282828]">Last Name</Label>
                                    <div className="relative">
                                        <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                            <Input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                required
                                            />
                                            <User className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">Phone Number</Label>
                                <div className="relative">
                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                        <Input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                            required
                                        />
                                        <Phone className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">Company / Property Name</Label>
                                <div className="relative">
                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                        <Input
                                            type="text"
                                            value={propertyName}
                                            onChange={(e) => setPropertyName(e.target.value)}
                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                            required
                                        />
                                        <Building2 className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">New Password</Label>
                                <div className="relative">
                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-[48px] w-full rounded-full bg-transparent pl-[40px] pr-[12px] text-[14px] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                            required
                                        />
                                        <Lock className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Owner Identity Verification */}
                            <div className="space-y-2 p-3.5 rounded-2xl bg-[#fbf6f3] border border-[#f0ded5]">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-[#953002]" />
                                    <Label className="text-[13px] font-bold text-[#282828]">National ID / Business Document</Label>
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Required *</span>
                                </div>
                                
                                {ownerIdUrl ? (
                                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="text-[12px] font-semibold text-emerald-800 truncate">Document uploaded</span>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setOwnerIdUrl("")} className="h-7 text-[11px] text-red-600 font-bold">
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="owner-id-doc"
                                            accept="image/*,application/pdf"
                                            disabled={isUploadingId}
                                            className="sr-only"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setIdUploadError(null);
                                                const validation = validateUploadFile(file, { maxSizeMB: 8, allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"] });
                                                if (!validation.valid) {
                                                    setIdUploadError(validation.error || "Invalid file");
                                                    return;
                                                }
                                                setIsUploadingId(true);
                                                try {
                                                    const result = await imageApi.upload(file, "identity");
                                                    if (result && result.url) setOwnerIdUrl(result.url);
                                                } catch (err) {
                                                    setIdUploadError("Failed to upload document.");
                                                } finally {
                                                    setIsUploadingId(false);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="owner-id-doc"
                                            className={clsx(
                                                "flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#953002]/40 bg-white/80 hover:bg-white text-center cursor-pointer transition-all hover:border-[#953002]",
                                                isUploadingId && "opacity-50 pointer-events-none"
                                            )}
                                        >
                                            {isUploadingId ? (
                                                <><Loader2 className="h-4 w-4 animate-spin text-[#953002]" /><span className="text-[12px] font-bold">Uploading…</span></>
                                            ) : (
                                                <><UploadCloud className="h-4 w-4 text-[#953002]" /><span className="text-[12px] font-bold text-[#953002]">Upload NIC or Business PDF</span></>
                                            )}
                                        </label>
                                        {idUploadError && <p className="text-[11px] text-red-600 font-medium mt-1">{idUploadError}</p>}
                                    </div>
                                )}
                            </div>

                            {localError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {localError}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} size="lg" className="w-full h-[52px] text-[15px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] mt-4 transition-all">
                                {loading ? "Saving…" : "Complete Registration →"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
