"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Suspense } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth/auth.store";


function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, loading, error, setError, isAuthenticated, user, isRestoring } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Clear any previous global auth errors on mount
  useEffect(() => {
    setError(null);
  }, [setError]);

  // If already authenticated, redirect immediately to role-based dashboard.
  // This handles the case where the guest guard redirects a staff/owner to /auth/login
  // — they shouldn't have to log in again.
  useEffect(() => {
    if (isRestoring || !isAuthenticated || !user) return;
    const rolePaths: Record<string, string> = {
      guest: "/guest/booking/my-bookings",
      staff: "/staff",
      owner: "/owner",
      admin: "/admin",
    };
    router.replace(rolePaths[user.role.toLowerCase()] ?? "/");
  }, [isAuthenticated, user, isRestoring, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      // login() returns the role-based home path (e.g. "/guest/booking/my-bookings", "/staff", "/owner")
      const path = await login(email, password);
      const redirect = searchParams?.get("redirect");

      // Derive the role prefix from the returned path (e.g. "/guest", "/staff", "/owner", "/admin")
      const rolePrefix = "/" + (path.split("/")[1] ?? "");

      // GUEST CONTEXT BLOCK: If the user clicked Login from a guest page (/guest/...)
      // but logged in with a non-guest account, don't logout — just send them to their
      // own dashboard. Avoids unexpectedly logging out a staff/owner/admin user.
      if (redirect?.startsWith("/guest") && rolePrefix !== "/guest") {
        router.push(path);
        return;
      }

      // Only honor the redirect if it belongs to the same role's URL space.
      // Prevents staff/owner/admin from being routed into guest pages (and vice versa).
      const isRedirectValidForRole =
        redirect && redirect !== "/" && redirect.startsWith(rolePrefix);

      router.push(isRedirectValidForRole ? redirect : path);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";

      if (message.includes("pending")) {
        setError("⏳ Your account is pending approval.");
        return;
      }

      if (message.includes("rejected")) {
        setError("❌ Your account has been rejected.");
        return;
      }

      setError(message || "Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-[1000px] my-auto">
        {/* CARD — stacks vertically on mobile, side-by-side on desktop */}
        <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl md:grid md:[grid-template-columns:1fr_520px]">
          {/* LEFT IMAGE PANEL — banner on mobile, full panel on desktop */}
          <div className="relative h-52 md:h-auto md:block">
            <div className="absolute inset-0 bg-[#1a0a05]" />
            <Image
              src="/images/auth/login-cover.jpg"
              alt="PrimeStay login cover"
              fill
              className="object-cover opacity-100"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10">
              <p className="text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg md:text-[44px]">
                PrimeStay
              </p>
              {/* tagline hidden on mobile banner — shown on desktop */}
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
          <div className="bg-white px-6 py-8 sm:px-10 md:px-12 md:py-12">
            <div className="mx-auto w-full max-w-[420px]">
              <h2 className="text-center text-[28px] font-extrabold text-[var(--brand-primary)] md:text-[40px]">
                Welcome Back
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-600">
                Secure access to your management dashboard
              </p>

              <form onSubmit={onSubmit} className="mt-10 space-y-6">
                <div className="space-y-2">
                  <Label className="pl-1 text-[16px] font-bold text-[#282828]">Email Address</Label>
                  <div className="relative">
                    <div className="bg-[rgba(149,48,2,0.1)] rounded-full w-full flex items-center">
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-[54px] w-full rounded-full bg-transparent pl-[48px] pr-[24px] text-[16px] placeholder:text-[rgba(130,130,130,0.5)] border-0"
                        required
                      />
                      <Mail className="absolute left-4 h-6 w-6 text-[#953002] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[16px] font-bold text-[#282828]">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-[14px] font-bold text-[#953002] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <div className="bg-[rgba(149,48,2,0.1)] border border-[#e5e7eb] rounded-full w-full flex items-center">

                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="h-[54px] w-full rounded-full bg-transparent pl-[48px] pr-[52px] text-[16px] placeholder:text-[rgba(130,130,130,0.5)] border-0 appearance-none"
                        required
                        hideToggle
                        suppressHydrationWarning
                      />

                      <Lock className="absolute left-4 h-6 w-6 text-[#953002] pointer-events-none" />

                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-4 z-10 text-[#666] hover:text-[#000]"
                        aria-label={showPw ? "Hide password" : "Show password"}
                        suppressHydrationWarning
                      >
                        {showPw ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>

                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} size="lg" className="w-full h-[56px] text-[16px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] mt-8" suppressHydrationWarning>
                  {loading ? "Logging in…" : "Login to Platform"}
                </Button>


                {!searchParams?.get("redirect")?.includes("/admin") && searchParams?.get("role") !== "admin" && (
                  <div className="text-center text-sm text-neutral-700">
                    Don&apos;t have an account yet?{" "}
                    <Link
                      href={(() => {
                        const roleParam = searchParams?.get("role");
                        const redirectParam = searchParams?.get("redirect");
                        // Determine role: prefer explicit ?role= param, then fall back to redirect path
                        const detectedRole =
                          roleParam === "staff" || redirectParam?.includes("/staff") ? "staff"
                          : roleParam === "owner" || redirectParam?.includes("/owner") ? "owner"
                          : redirectParam ? "guest"
                          : roleParam ?? null;

                        if (!detectedRole) return "/auth/register";
                        const redirectSuffix = redirectParam
                          ? `&redirect=${encodeURIComponent(redirectParam)}`
                          : "";
                        return `/auth/register?role=${detectedRole}${redirectSuffix}`;
                      })()}
                      className="font-extrabold text-[var(--brand-primary)] hover:underline"
                    >
                      Register for an account
                    </Link>
                  </div>
                )}

                <div className="text-center">
                  <Link
                    href="/"
                    className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}