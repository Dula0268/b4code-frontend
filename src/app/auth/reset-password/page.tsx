"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(2);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
        // Mock API call to reset password
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setIsSuccess(true);
    }

    // Handle countdown for redirect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (isSuccess && countdown === 0) {
            router.push("/auth/login");
        }
        return () => clearTimeout(timer);
    }, [isSuccess, countdown, router]);

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            {/* 
        This page uses a slightly different layout (centered card) 
        as it represents the final step of the reset flow, 
        but we can keep it consistent with the overall auth layout.
        Let's use the same side-by-side layout for consistency.
      */}
            <div className="mx-auto flex min-h-screen w-full max-w-[1000px] items-center justify-center px-4 py-6 md:px-6 md:py-10">
                <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl md:grid md:[grid-template-columns:1fr_520px]">
                    {/* LEFT IMAGE PANEL */}
                    <div className="relative h-52 md:h-auto md:block">
                        <div className="absolute inset-0 bg-[#1a0a05]" />
                        <Image
                            src="/login-cover.jpg"
                            alt="PrimeStay cover"
                            fill
                            className="object-cover opacity-100"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                        <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10">
                            <p className="text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg md:text-[44px]">
                                PrimeStay
                            </p>
                            <div className="mb-0 hidden md:mb-16 md:block">
                                <h2 className="text-[22px] font-bold leading-[30px] text-white drop-shadow-md">
                                    Experience the art of<br />modern hospitality.
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="bg-white px-6 py-8 sm:px-10 md:px-12 md:py-12 flex flex-col justify-center">
                        <div className="mx-auto w-full max-w-[420px]">
                            {!isSuccess ? (
                                <>
                                    <h2 className="text-center text-[28px] font-extrabold text-[var(--brand-primary)] md:text-[36px] leading-tight">
                                        Reset Password
                                    </h2>
                                    <p className="mt-3 text-center text-[15px] text-neutral-600 leading-relaxed px-2">
                                        Enter your new password below to regain access to your account.
                                    </p>

                                    <form onSubmit={onSubmit} className="mt-8 space-y-6">
                                        {/* NEW PASSWORD */}
                                        <div className="space-y-3">
                                            <Label className="pl-1 text-[16px] font-bold text-[#282828]">New Password</Label>
                                            <div className="relative">
                                                <div className="bg-[rgba(149,48,2,0.1)] border border-[#e5e7eb] border-transparent focus-within:border-[#953002]/30 rounded-full w-full flex items-center transition-colors">
                                                    <Input
                                                        type={showPw ? "text" : "password"}
                                                        placeholder="Min. 8 characters"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="h-[54px] w-full rounded-full bg-transparent pl-[48px] pr-[48px] text-[16px] placeholder:text-[rgba(130,130,130,0.5)] border-0 focus-visible:ring-0"
                                                        required
                                                        minLength={8}
                                                    />
                                                    <Lock className="absolute left-5 h-5 w-5 text-[#953002] pointer-events-none" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPw((s) => !s)}
                                                        className="absolute right-5 text-[#666] hover:text-[#000]"
                                                    >
                                                        {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CONFIRM PASSWORD */}
                                        <div className="space-y-3">
                                            <Label className="pl-1 text-[16px] font-bold text-[#282828]">Confirm Password</Label>
                                            <div className="relative">
                                                <div className="bg-[rgba(149,48,2,0.1)] border border-[#e5e7eb] border-transparent focus-within:border-[#953002]/30 rounded-full w-full flex items-center transition-colors">
                                                    <Input
                                                        type={showConfirmPw ? "text" : "password"}
                                                        placeholder="Repeat new password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="h-[54px] w-full rounded-full bg-transparent pl-[48px] pr-[48px] text-[16px] placeholder:text-[rgba(130,130,130,0.5)] border-0 focus-visible:ring-0"
                                                        required
                                                        minLength={8}
                                                    />
                                                    <Lock className="absolute left-5 h-5 w-5 text-[#953002] pointer-events-none" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPw((s) => !s)}
                                                        className="absolute right-5 text-[#666] hover:text-[#000]"
                                                    >
                                                        {showConfirmPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} size="lg" className="w-full h-[56px] text-[16px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] mt-8 transition-all">
                                            {loading ? "Resetting..." : "Reset Password"}
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 py-6">
                                    <div className="bg-emerald-50 rounded-full p-4 mb-6 shadow-sm border border-emerald-100">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <h2 className="text-[28px] font-extrabold text-[#282828] md:text-[32px] leading-tight">
                                        Password Reset Successful
                                    </h2>
                                    <p className="mt-3 text-[15px] text-neutral-500 leading-relaxed px-2">
                                        You have been securely logged in.<br />
                                        Thank you for using our platform.
                                    </p>

                                    <div className="w-full mt-8 bg-neutral-100/50 border border-neutral-200 rounded-2xl p-4">
                                        <div className="flex items-center justify-between text-sm font-semibold text-neutral-600 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-[#953002] border-t-transparent animate-spin" />
                                                Redirecting to login...
                                            </div>
                                            <span className="text-[#953002]">{countdown}s</span>
                                        </div>
                                        {/* Simulated progress bar */}
                                        <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#953002] transition-all duration-1000 ease-linear"
                                                style={{ width: `${((2 - countdown) / 2) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full mt-6 space-y-4">
                                        <Link href="/auth/login" className="block w-full">
                                            <Button type="button" size="lg" className="w-full h-[54px] text-[16px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] transition-all">
                                                Go to Login Now
                                            </Button>
                                        </Link>

                                        <div className="pt-4 text-center">
                                            <p className="text-[13px] text-neutral-500 font-medium">
                                                If you are not redirected,{" "}
                                                <Link href="/auth/login" className="font-bold text-[#953002] hover:underline">
                                                    click here.
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
