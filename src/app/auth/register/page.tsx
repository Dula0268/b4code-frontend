"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Mail, Lock, CheckCircle2, Phone, User, Home, MapPin, Building2, Briefcase, KeyRound, Building } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth/auth.store";

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
    const [employeeId, setEmployeeId] = useState("");
    const [assignedProperty, setAssignedProperty] = useState("");

    const [localError, setLocalError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(2);

    const displayError = localError || authError;

    // Password strength calculation
    const getPasswordStrength = () => {
        if (!password) return { label: "", color: "bg-transparent", width: "0%" };
        if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
        if (password.length < 10) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
        return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    };

    const strength = getPasswordStrength();

    const handleFillMockData = () => {
        const randomStr = Math.random().toString(36).substring(2, 6);
        setFullName(`Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`);
        setEmail(`demo_${role}_${randomStr}@primestay.com`);
        setPhone("+1 555 010 1234");
        setPassword("Pass1234");
        setConfirmPassword("Pass1234");
        setAgreedToTerms(true);

        if (role === "owner") {
            setPropertyName("Sunset Villa");
            setPropertyAddress("123 Ocean Dr, Miami, FL");
            setNationalId("ID-987654321");
        } else if (role === "staff") {
            setStaffRole("Manager");
            setEmployeeId("EMP-1024");
            setAssignedProperty("Sunset Villa");
        }
    };


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

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters.");
            return;
        }

        try {
            await register(email, password, role);
            setShowSuccessModal(true);
        } catch {
            // Error handled by store
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showSuccessModal && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (showSuccessModal && countdown === 0) {
            router.push("/auth/login");
        }
        return () => clearTimeout(timer);
    }, [showSuccessModal, countdown, router]);


    return (
        <div className="min-h-screen bg-white relative flex flex-col p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-[1000px] my-auto">

                {/* CARD */}
                <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl md:grid md:[grid-template-columns:1fr_520px]">

                    {/* LEFT IMAGE PANEL */}
                    <div className="relative h-52 md:h-auto md:block">
                        <div className="absolute inset-0 bg-[#1a0a05]" />
                        <Image
                            src="/login-cover.jpg"
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
                                <p className="mt-2 text-[14px] text-neutral-500 font-medium">
                                    Join our hospitality community today.
                                </p>
                            </div>

                            {/* ROLE DISPLAY (HIDDEN TOGGLE) */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-[12px] font-extrabold text-neutral-800 uppercase tracking-wider block">Joining as</Label>
                                    <button
                                        type="button"
                                        onClick={handleFillMockData}
                                        className="text-[11px] font-bold text-[#953002] hover:underline bg-[rgba(149,48,2,0.1)] px-2 py-1 rounded-full"
                                    >
                                        Auto-fill Mock Data
                                    </button>
                                </div>
                                <div className="flex p-3 bg-[#f0e8e4] rounded-2xl items-center justify-center">
                                    <span className="text-[#953002] text-lg font-black uppercase tracking-widest">
                                        {role}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                {/* Common Fields */}
                                <div className="space-y-1.5">
                                    <Label className="pl-1 text-[13px] font-bold text-[#282828]">Full Name</Label>
                                    <div className="relative">
                                        <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                            <Input
                                                type="text"
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
                                                placeholder="+94 777 646 946"
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
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="h-[48px] w-full rounded-full bg-transparent pl-[40px] pr-[12px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                    required
                                                />
                                                <Lock className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
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
                                                <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                    <Input
                                                        type="text"
                                                        placeholder="Manager"
                                                        value={staffRole}
                                                        onChange={(e) => setStaffRole(e.target.value)}
                                                        className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                        required={role === "staff"}
                                                    />
                                                    <Briefcase className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="pl-1 text-[13px] font-bold text-[#282828]">Employee ID</Label>
                                            <div className="relative">
                                                <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                    <Input
                                                        type="text"
                                                        placeholder="EMP-0001"
                                                        value={employeeId}
                                                        onChange={(e) => setEmployeeId(e.target.value)}
                                                        className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                        required={role === "staff"}
                                                    />
                                                    <KeyRound className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="pl-1 text-[13px] font-bold text-[#282828]">Assigned Property</Label>
                                            <div className="relative">
                                                <div className="bg-[#f0e8e4] rounded-full w-full flex items-center">
                                                    <Input
                                                        type="text"
                                                        placeholder="Select a property"
                                                        value={assignedProperty}
                                                        onChange={(e) => setAssignedProperty(e.target.value)}
                                                        className="h-[48px] w-full rounded-full bg-transparent pl-[42px] pr-[16px] text-[14px] placeholder:text-neutral-400 border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                        required={role === "staff"}
                                                    />
                                                    <MapPin className="absolute left-4 h-4 w-4 text-[#953002]/70 pointer-events-none" />
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
                                        href="/auth/login"
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

                            <h3 className="text-[20px] font-extrabold text-[#282828] mb-2">Registered Successful</h3>
                            <p className="text-[14px] text-neutral-500 leading-relaxed mb-6">
                                You have been securely logged in.<br />Thank you for using our platform.
                            </p>

                            <div className="w-full bg-[#e6f4ea] rounded-xl p-3 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 border-2 border-[#953002] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[13px] font-bold text-[#137333]">Redirecting to login...</span>
                                </div>
                                <span className="text-[13px] font-bold text-[#137333]">{countdown}s</span>
                            </div>

                            <Button
                                onClick={() => router.push("/auth/login")}
                                className="w-full h-[52px] rounded-full bg-[#953002] hover:bg-[#7a2600] text-white font-extrabold text-[15px] mb-4"
                            >
                                Go to Login Now
                            </Button>

                            <p className="text-[12px] text-neutral-500 font-medium pb-2">
                                If you are not redirected, <button onClick={() => router.push("/auth/login")} className="text-[#953002] font-bold hover:underline cursor-pointer">click here</button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
