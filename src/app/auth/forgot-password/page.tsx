"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Mock API call to send reset link
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setIsSubmitted(true);
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen w-full max-w-[1000px] items-center justify-center px-4 py-6 md:px-6 md:py-10">
                {/* CARD — stacks vertically on mobile, side-by-side on desktop */}
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
                                <p className="mt-2 max-w-xs text-[13px] leading-[20px] text-white/75">
                                    Join our exclusive network of guests, property owners, and
                                    hospitality professionals worldwide.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="bg-white px-6 py-8 sm:px-10 md:px-12 md:py-12 flex flex-col justify-center">
                        <div className="mx-auto w-full max-w-[420px]">
                            {!isSubmitted ? (
                                <>
                                    <h2 className="text-center text-[28px] font-extrabold text-[var(--brand-primary)] md:text-[36px] leading-tight mt-4">
                                        Reset your password
                                    </h2>
                                    <p className="mt-4 text-center text-[15px] text-neutral-600 leading-relaxed px-2">
                                        Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                                    </p>

                                    <form onSubmit={onSubmit} className="mt-10 space-y-6">
                                        <div className="space-y-3">
                                            <Label className="pl-1 text-[16px] font-bold text-[#282828]">Email address</Label>
                                            <div className="relative">
                                                <div className="bg-[rgba(149,48,2,0.1)] rounded-full w-full flex items-center">
                                                    <Input
                                                        type="email"
                                                        placeholder="e.g. alex@hospitality.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="h-[54px] w-full rounded-full bg-transparent pl-[48px] pr-[24px] text-[16px] placeholder:text-[rgba(130,130,130,0.5)] border-0 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                                                        required
                                                    />
                                                    <Mail className="absolute left-5 h-5 w-5 text-[#953002] pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading} size="lg" className="w-full h-[56px] text-[16px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] mt-8 transition-all">
                                            {loading ? "Sending..." : "Send Reset Link"}
                                        </Button>

                                        <div className="mt-8 text-center">
                                            <Link
                                                href="/auth/login"
                                                className="inline-flex items-center text-[15px] font-bold text-neutral-600 hover:text-[#953002] transition-colors"
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Login
                                            </Link>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 py-6">
                                    <div className="bg-emerald-50 rounded-full p-4 mb-6 shadow-sm border border-emerald-100">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    </div>
                                    <h2 className="text-[28px] font-extrabold text-[#282828] md:text-[36px] leading-tight">
                                        Password reset link sent!
                                    </h2>
                                    <p className="mt-4 text-[15px] text-neutral-600 leading-relaxed px-2">
                                        We&apos;ve sent a recovery link to your email address. Please check your inbox and your spam folder just in case.
                                    </p>

                                    <div className="w-full mt-10 space-y-6">
                                        {/* Mock Email UI for User Consideration */}
                                        <div className="rounded-xl border border-neutral-200 p-5 mt-4 text-left shadow-sm">
                                            <div className="flex items-center gap-3 border-b border-neutral-100 pb-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900">PrimeStay Support</p>
                                                    <p className="text-xs text-neutral-500">to {email || "you"}</p>
                                                </div>
                                            </div>
                                            <h3 className="text-base font-bold text-neutral-900 mb-2">Reset your PrimeStay password</h3>
                                            <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                                                We received a request to reset the password for your PrimeStay account. Click the button below to choose a new password.
                                            </p>
                                            <div className="flex justify-center mt-6 mb-2">
                                                <Link href="/auth/reset-password" className="inline-block w-[80%] max-w-[280px]">
                                                    <Button type="button" size="lg" className="w-full h-[52px] text-[16px] font-extrabold rounded-full bg-[#137333] hover:bg-[#0d5324] text-white shadow-lg tracking-wide transition-all transform hover:scale-[1.02]">
                                                        Reset Password
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="pt-4 text-center space-y-4">
                                            <p className="text-[14px] text-neutral-500 font-medium">
                                                Didn&apos;t receive the email?{" "}
                                                <button
                                                    onClick={() => {
                                                        setIsSubmitted(false);
                                                        setEmail("");
                                                    }}
                                                    className="font-bold text-[#953002] hover:underline"
                                                >
                                                    Resend Info
                                                </button>
                                            </p>

                                            <div className="pt-2">
                                                <Link
                                                    href="/auth/login"
                                                    className="inline-flex items-center text-[15px] font-bold text-neutral-600 hover:text-[#953002] transition-colors"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Back to Login
                                                </Link>
                                            </div>
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
