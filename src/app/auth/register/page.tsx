"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Mail, Lock, CheckCircle2, Phone, User, Home, MapPin, Building2, Briefcase, Building, RefreshCw } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth/auth.store";
import { propertiesApi } from "@/api/properties/properties.api";
import { authApi } from "@/api/auth/auth.api";
import { formatApiError } from "@/lib/error-formatter";

type Role = "guest" | "owner" | "staff";

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register, loading, error: authError, setError } = useAuthStore();

    const [role, setRole] = useState<Role>("guest");

    // Clear any previous global auth errors on mount
    useEffect(() => {
        setError(null);
    }, [setError]);

    // Initialize role from query params
    useEffect(() => {
        const roleParam = searchParams.get("role") as Role;
        if (roleParam && ["guest", "owner", "staff"].includes(roleParam)) {
            setRole(roleParam);
        }
    }, [searchParams]);

    // Common Fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Owner Fields
    const [propertyName, setPropertyName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");
    const [nationalId, setNationalId] = useState("");

    // Staff Fields
    const [staffRole, setStaffRole] = useState("");
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | "">("");
    const [properties, setProperties] = useState<Array<{ id: number; name: string }>>([]);

    const [localError, setLocalError] = useState<string | null>(null);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    const displayError = localError || authError;

    // Fetch properties for staff dropdown
    useEffect(() => {
        if (role === "staff") {
            propertiesApi.getPublicList()
                .then(setProperties)
                .catch(err => console.error("Failed to load properties:", err));
        }
    }, [role]);

    // Password strength calculation
    const getPasswordStrength = () => {
        if (!password) return { label: "", color: "bg-transparent", width: "0%" };
        if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
        if (password.length < 10) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    };

    const strength = getPasswordStrength();



    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLocalError(null);

        if (!agreedToTerms) {
            setLocalError("You must agree to the Terms of Service and Privacy Policy.");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match.");
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

        if (role === "owner") {
            if (nationalId.length !== 10 && nationalId.length !== 12) {
                setLocalError("National ID must be exactly 10 or 12 characters long.");
                return;
            }
        }

        if (role === "staff") {
            if (!selectedPropertyId) {
                setLocalError("Please select a property to register for.");
                return;
            }
            if (!staffRole) {
                setLocalError("Please select a staff role.");
                return;
            }
        }

        try {
            const nameParts = fullName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            await register(
                email,
                password,
                role,
                firstName,
                lastName,
                phone,
                role === "staff" ? Number(selectedPropertyId) : undefined,
                role === "staff" ? staffRole : undefined
            );
            // Instead of showing success modal immediately, switch to OTP input
            setShowOtpInput(true);
        } catch {
            // Error handled by store
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLocalError(null);

        if (otp.length !== 6) {
            setLocalError("Please enter a valid 6-digit code.");
            return;
        }

        try {
            const { verifyEmail } = useAuthStore.getState();
            await verifyEmail(email, otp);
            setShowSuccessModal(true);
        } catch (err) {
            setLocalError(formatApiError(err, "Verification failed. Please check the code and try again."));
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showSuccessModal && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (showSuccessModal && countdown === 0) {
            const redirectParam = searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect") as string)}` : "";
            router.push(`/auth/login?role=${role}${redirectParam}`);
        }
        return () => clearTimeout(timer);
    }, [showSuccessModal, countdown, router, searchParams]);

    // Resend cooldown countdown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setResendStatus("sending");
        try {
            await authApi.resendOtp(email);
            setResendStatus("sent");
            setResendCooldown(60); // 60-second cooldown
            setTimeout(() => setResendStatus("idle"), 5000);
        } catch {
            setResendStatus("error");
            setTimeout(() => setResendStatus("idle"), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-white relative flex flex-col p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-[1000px] my-auto">

                {/* CARD */}
                <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl md:grid md:[grid-template-columns:1fr_520px]">

                    {/* LEFT IMAGE PANEL */}
                    <div className="relative h-52 md:h-auto md:block">
                        <div className="absolute inset-0 bg-[#1a0a05]" />
                        <Image
                            src="/images/auth/login-cover.jpg"
                            alt="PrimeStay registration cover"
                            fill
                            className="object-cover opacity-100"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                        <div className="relative z-10 flex h-full flex-col justify-center p-6 md:p-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Building className="h-8 w-8 text-white" />
                                <p className="text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg md:text-[36px]">
                                    PrimeStay
                                </p>
                            </div>
                            <div className="mb-0 hidden md:mb-16 md:block">
                                <h2 className="text-[32px] font-bold leading-[40px] text-white drop-shadow-md">
                                    Experience the art of<br />modern hospitality.
                                </h2>
                                <p className="mt-4 max-w-sm text-[15px] leading-[24px] text-white/80">
                                    Join our exclusive network of guests, property owners, and
                                    hospitality professionals worldwide.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM AREA */}
                    <div className="bg-[#fcfaf9] px-6 py-8 sm:px-10 md:px-12 md:py-10 flex flex-col items-center">
                        <div className="w-full max-w-[420px]">

                            <div className="text-center mb-8">
                                <h2 className="text-[28px] font-extrabold text-[#953002] md:text-[32px] leading-tight">
                                    Create your account
                                </h2>
                                <p className="mt-2 text-[14px] text-[#953002]/80 font-medium">
                                    Join our hospitality community today.
                                </p>
                            </div>

                            {/* ROLE DISPLAY (HIDDEN TOGGLE) */}
                            {showOtpInput && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-[12px] font-extrabold text-[#282828] uppercase tracking-wider block">
                                            SECURITY CHECK
                                        </Label>
                                    </div>
                                    <div className="flex p-3 bg-[#f0e8e4] rounded-2xl items-center justify-center">
                                        <span className="text-[#953002] text-lg font-black uppercase tracking-widest">
                                            Verify Email
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!showOtpInput ? (

                                <form onSubmit={handleRegister} className="space-y-4">
                                    {/* Common Fields */}
                                    <div className="space-y-1.5">
                                        <Label className="pl-1 text-[13px] font-bold text-[#282828]">Full Name</Label>
                                        <div className="relative">
                                            <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                <Input
                                                    type="text"
                                                    name="fullName"
                                                    autoComplete="name"
                                                    placeholder="John Doe"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                    required
                                                />
                                                <User className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="pl-1 text-[13px] font-bold text-[#282828]">Email Address</Label>
                                        <div className="relative">
                                            <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    autoComplete="email"
                                                    placeholder="john@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                    required
                                                />
                                                <Mail className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="pl-1 text-[13px] font-bold text-[#282828]">Phone Number</Label>
                                        <div className="relative">
                                            <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                <Input
                                                    type="tel"
                                                    name="phone"
                                                    autoComplete="tel"
                                                    placeholder="0777646946"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                    required
                                                />
                                                <Phone className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="pl-1 text-[13px] font-bold text-[#282828]">Password</Label>
                                            <div className="relative">
                                                <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                    <Input
                                                        type="password"
                                                        name="password"
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="h-[48px] w-full rounded-full bg-transparent pl-[40px] pr-[12px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                        required
                                                    />
                                                    <Lock className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="pl-1 text-[13px] font-bold text-[#282828]">Confirm</Label>
                                            <div className="relative">
                                                <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                    <Input
                                                        type="password"
                                                        name="confirmPassword"
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="h-[48px] w-full rounded-full bg-transparent pl-[40px] pr-[12px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                        required
                                                    />
                                                    <svg className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Strength Meter */}
                                    <div className="flex items-center justify-between pt-1 pb-2">
                                        <span className="text-[11px] font-bold text-[#953002]">Password Strength</span>
                                        <div className="flex-1 mx-3 h-1 bg-neutral-200 rounded-full overflow-hidden">
                                            <div className={clsx("h-full transition-all duration-300", strength.color)} style={{ width: strength.width }} />
                                        </div>
                                        <span className={clsx("text-[11px] font-bold w-12 text-right", strength.color.replace("bg-", "text-").replace("500", "600"))}>{strength.label}</span>
                                    </div>

                                    {/* Extra Owner Fields */}
                                    {role === "owner" && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-1.5">
                                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">Property Name</Label>
                                                <div className="relative">
                                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                        <Input
                                                            type="text"
                                                            placeholder="Sunset Villa"
                                                            value={propertyName}
                                                            onChange={(e) => setPropertyName(e.target.value)}
                                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                            required={role === "owner"}
                                                        />
                                                        <Home className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">Property Address</Label>
                                                <div className="relative">
                                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                        <Input
                                                            type="text"
                                                            placeholder="street address, city, province."
                                                            value={propertyAddress}
                                                            onChange={(e) => setPropertyAddress(e.target.value)}
                                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                            required={role === "owner"}
                                                        />
                                                        <MapPin className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">National ID / Business Registration No.</Label>
                                                <div className="relative">
                                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter your official identification number"
                                                            value={nationalId}
                                                            onChange={(e) => setNationalId(e.target.value)}
                                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                            required={role === "owner"}
                                                        />
                                                        <Building2 className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Extra Staff Fields */}
                                    {role === "staff" && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-1.5">
                                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">Staff Role</Label>
                                                <div className="relative">
                                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center relative">
                                                        <select
                                                            name="staffRole"
                                                            value={staffRole}
                                                            onChange={(e) => setStaffRole(e.target.value)}
                                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] text-[#282828] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30 appearance-none outline-none"
                                                            required={role === "staff"}
                                                        >
                                                            <option value="" disabled>Select a role</option>
                                                            <option value="Kitchen Staff">Kitchen Staff</option>
                                                            <option value="Property Staff">Property Staff</option>
                                                            <option value="Staff Admin">Staff Admin</option>
                                                        </select>
                                                        <Briefcase className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                        <div className="absolute right-4 pointer-events-none text-[#953002]/70">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="pl-1 text-[13px] font-bold text-[#282828]">Assigned Property</Label>
                                                <div className="relative">
                                                    <div className="bg-[#f0e8e4] rounded-full w-full flex items-center relative">
                                                        <select
                                                            name="assignedProperty"
                                                            value={selectedPropertyId}
                                                            onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                                                            className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] text-[#282828] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30 appearance-none outline-none"
                                                            required={role === "staff"}
                                                        >
                                                            <option value="" disabled>Select a property</option>
                                                            {properties.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <Home className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                        <div className="absolute right-4 pointer-events-none text-[#953002]/70">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms Checkbox */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setAgreedToTerms(!agreedToTerms)}
                                            className={clsx(
                                                "h-4 w-4 rounded-full border border-neutral-300 flex items-center justify-center transition-colors",
                                                agreedToTerms ? "bg-[#953002] border-[#953002]" : "bg-white"
                                            )}
                                        >
                                            {agreedToTerms && <div className="h-2 w-2 rounded-full bg-white" />}
                                        </button>
                                        <p className="text-[12px] text-neutral-500 font-medium">
                                            I agree to the <span className="text-[#953002] font-bold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#953002] font-bold cursor-pointer hover:underline">Privacy Policy</span>.
                                        </p>
                                    </div>

                                    {displayError && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in duration-300">
                                            {displayError}
                                        </div>
                                    )}

                                    <Button type="submit" disabled={loading} size="lg" className="w-full h-[52px] text-[15px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] mt-2 transition-all">
                                        {loading ? "Registering…" : "Register Account →"}
                                    </Button>

                                    <div className="mt-4 text-center text-[13px] font-medium text-neutral-600 pb-2">
                                        Already have an account?{" "}
                                        <Link
                                            href={(() => {
                                                const redirectParam = searchParams.get("redirect");
                                                const roleSuffix = `?role=${role}`;
                                                return redirectParam
                                                    ? `/auth/login${roleSuffix}&redirect=${encodeURIComponent(redirectParam)}`
                                                    : `/auth/login${roleSuffix}`;
                                            })()}
                                            className="font-extrabold text-[#953002] hover:underline"
                                        >
                                            Log in
                                        </Link>
                                    </div>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-neutral-300"></div>
                                        <span className="flex-shrink-0 mx-4 text-neutral-400 text-[10px] font-extrabold tracking-widest uppercase">Or register with</span>
                                        <div className="flex-grow border-t border-neutral-300"></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <Button type="button" variant="outline" className="rounded-full h-[46px] font-bold text-neutral-600 border-neutral-200 hover:bg-neutral-50">
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Google
                                        </Button>
                                        <Button type="button" variant="outline" className="rounded-full h-[46px] font-bold text-neutral-600 border-neutral-200 hover:bg-neutral-50">
                                            <svg className="w-4 h-4 mr-2 text-black" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.95.72 3.81 1.96-3.41 1.94-2.89 6.64.45 8.01-.8 1.9-1.91 3.59-2.93 5zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                            </svg>
                                            Apple
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center">
                                        <p className="text-[14px] text-neutral-600 font-medium leading-relaxed">
                                            We&apos;ve sent a 6-digit verification code to<br />
                                            <span className="font-bold text-[#953002]">{email}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-center block text-[13px] font-bold text-[#282828]">Enter Verification Code</Label>
                                        <div className="flex justify-center">
                                            <Input
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                className="h-[60px] w-[240px] text-center text-[28px] font-black tracking-[12px] rounded-2xl bg-[#f0e8e4] border-0 focus-visible:ring-2 focus-visible:ring-[#953002]/50 placeholder:text-neutral-300 placeholder:tracking-normal"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {displayError && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {displayError}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            disabled={loading || otp.length !== 6}
                                            size="lg"
                                            className="w-full h-[52px] text-[15px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] transition-all"
                                        >
                                            {loading ? "Verifying…" : "Verify & Complete →"}
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={() => setShowOtpInput(false)}
                                            className="w-full text-[13px] font-bold text-neutral-500 hover:text-[#953002] transition-colors"
                                        >
                                            ← Back to Registration
                                        </button>
                                    </div>

                                    <p className="text-center text-[12px] text-neutral-400">
                                        Didn&apos;t receive the code?{" "}
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={resendCooldown > 0 || resendStatus === "sending"}
                                            className="text-[#953002] font-bold hover:underline disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-opacity"
                                        >
                                            {resendStatus === "sending" ? (
                                                <><RefreshCw size={11} className="animate-spin" /> Sending…</>
                                            ) : resendCooldown > 0 ? (
                                                `Resend in ${resendCooldown}s`
                                            ) : (
                                                "Resend Code"
                                            )}
                                        </button>
                                    </p>
                                    {resendStatus === "sent" && (
                                        <p className="text-center text-[12px] text-emerald-600 font-bold animate-in fade-in duration-300">
                                            ✓ A new code was sent to {email}
                                        </p>
                                    )}
                                    {resendStatus === "error" && (
                                        <p className="text-center text-[12px] text-red-500 font-bold animate-in fade-in duration-300">
                                            Failed to resend. Please try again.
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* SUCCESS OVERLAY MODAL */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[32px] w-full max-w-[400px] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                            <div className="h-16 w-16 bg-[#e6f4ea] rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-8 w-8 text-[#137333]" />
                            </div>

                            <h3 className="text-[20px] font-extrabold text-[#282828] mb-2">
                                {role === "staff" ? "Registration Submitted" : "Registered Successful"}
                            </h3>
                            <p className="text-[14px] text-neutral-500 leading-relaxed mb-6">
                                {role === "staff"
                                    ? "Your request has been sent to the property owner for approval. You will be able to log in once they verify your account."
                                    : "You have been securely registered. Thank you for joining our platform."}
                            </p>

                            <div className="w-full bg-[#e6f4ea] rounded-xl p-3 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 border-2 border-[#953002] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[13px] font-bold text-[#137333]">Redirecting to login...</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#137333]">{countdown}s</span>
                            </div>

                            <Button
                                onClick={() => {
                                    const redirectParam = searchParams.get("redirect");
                                    const url = redirectParam
                                        ? `/auth/login?role=${role}&redirect=${encodeURIComponent(redirectParam)}`
                                        : `/auth/login?role=${role}`;
                                    router.push(url);
                                }}
                                className="w-full h-[52px] rounded-full bg-[#953002] hover:bg-[#7a2600] text-white font-extrabold text-[15px] mb-4"
                            >
                                Go to Login Now
                            </Button>

                            <p className="text-[12px] text-neutral-500 font-medium pb-2">
                                If you are not redirected, <button onClick={() => {
                                    const redirectParam = searchParams.get("redirect");
                                    const url = redirectParam
                                        ? `/auth/login?role=${role}&redirect=${encodeURIComponent(redirectParam)}`
                                        : `/auth/login?role=${role}`;
                                    router.push(url);
                                }} className="text-[#953002] font-bold hover:underline cursor-pointer">click here</button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
