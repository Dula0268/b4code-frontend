"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "guest" | "owner" | "admin" | "staff";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const mockRole: Role = "guest";

      const redirectMap: Record<Role, string> = {
        guest: "/guest",
        owner: "/owner",
        admin: "/admin",
        staff: "/staff",
      };

      router.push(redirectMap[mockRole]);
    } catch {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1000px] items-center justify-center px-6 py-10">
        {/* CARD - responsive with left hero and right form */}
        <div className="grid w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
             style={{ gridTemplateColumns: '1fr 560px' }}>
          {/* LEFT IMAGE PANEL */}
          <div className="relative block">
            {/* fallback colour in case the image fails to load */}
            <div className="absolute inset-0 bg-[#2a1410]" />
            {/* place your Figma asset in public/login-cover.jpg or adjust the path */}
            <Image
              src="/login-cover.jpg"
              alt="PrimeStay login cover"
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(151,49,2,0.8)] to-[rgba(151,49,2,0)]" />

            <div className="relative z-10 flex h-full flex-col justify-center p-10 text-white">
                <p className="text-3xl font-extrabold">PrimeStay</p>
                <h1 className="mt-4 text-[48px] font-extrabold leading-[60px]">
                  Experience the art of modern hospitality.
                </h1>
                <p className="mt-3 max-w-md text-[20px] leading-[28px]">
                  Join our exclusive network of guests, property owners, and
                  hospitality professionals worldwide.
                </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white p-8 sm:p-12">
            <div className="mx-auto w-full max-w-[420px]">
              <h2 className="text-center text-[40px] font-extrabold text-[var(--brand-primary)]">
                Welcome Back
              </h2>
              <p className="mt-3 text-center text-sm text-neutral-600">
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
                      <Mail className="absolute right-4 h-6 w-6 text-[#953002] pointer-events-none" />
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
                        className="h-[54px] w-full rounded-full bg-transparent pl-[48px] pr-[48px] text-[16px] placeholder:text-[rgba(130,130,130,0.5)] border-0"
                        required
                      />
                      <Lock className="absolute left-4 h-6 w-6 text-[#953002] pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-4 text-[#666] hover:text-[#000]"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? (
                          <EyeOff className="h-6 w-6" />
                        ) : (
                          <Eye className="h-6 w-6" />
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

                <Button type="submit" disabled={loading} size="lg" className="w-full h-[56px] text-[16px] font-extrabold rounded-full bg-[#953002] hover:bg-[#7a2600] mt-8">
                  {loading ? "Logging in..." : "Login to Platform"}
                </Button>

                <div className="text-center text-sm text-neutral-700">
                  Don’t have an account yet?{" "}
                  <Link
                    href="/auth/register"
                    className="font-extrabold text-[var(--brand-primary)] hover:underline"
                  >
                    Register for an account
                  </Link>
                </div>

                <div className="text-center">
                  <Link
                    href="/welcome"
                    className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    ← Back to Welcome
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