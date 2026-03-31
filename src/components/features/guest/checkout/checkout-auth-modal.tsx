"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth/auth.store"
import { X, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react"

type ModalMode = "login" | "register"

interface CheckoutAuthModalProps {
  /** Pre-filled from checkout form */
  email: string
  firstName: string
  lastName: string
  phone: string
  /** Which mode to open in */
  initialMode: ModalMode
  /** Called after successful login/register */
  onSuccess: () => void
  /** Called when user dismisses the modal */
  onClose: () => void
}

export default function CheckoutAuthModal({
  email,
  firstName,
  lastName,
  phone,
  initialMode,
  onSuccess,
  onClose,
}: CheckoutAuthModalProps) {
  const [mode, setMode] = useState<ModalMode>(initialMode)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { loginForCheckout, registerFromCheckout, loading } = useAuthStore()

  const handleLogin = async () => {
    setLocalError(null)
    if (!password) {
      setLocalError("Please enter your password.")
      return
    }
    try {
      await loginForCheckout(email, password)
      onSuccess()
    } catch {
      setLocalError("Invalid password. Please try again.")
    }
  }

  const handleRegister = async () => {
    setLocalError(null)
    if (!password) {
      setLocalError("Please create a password.")
      return
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.")
      return
    }
    try {
      await registerFromCheckout(email, password, {
        firstName,
        lastName,
        phone,
      })
      onSuccess()
    } catch {
      setLocalError("Registration failed. Please try again.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "login") {
      handleLogin()
    } else {
      handleRegister()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: "authModalIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Header Gradient Strip */}
        <div className="h-1.5 bg-gradient-to-r from-[var(--brand-primary)] via-[#e07030] to-[var(--brand-primary)]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--gray-5)] transition-all cursor-pointer bg-transparent border-none z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Icon + Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
              {mode === "login" ? (
                <LogIn size={24} className="text-[var(--brand-primary)]" />
              ) : (
                <UserPlus size={24} className="text-[var(--brand-primary)]" />
              )}
            </div>

            {mode === "login" ? (
              <>
                <h2 className="text-xl font-bold text-[var(--fg)] mb-1.5">
                  Welcome back!
                </h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  We found an account with{" "}
                  <span className="font-semibold text-[var(--fg)]">
                    {email}
                  </span>
                  . Please log in to complete your booking.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[var(--fg)] mb-1.5">
                  Create your account
                </h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Set a password to save your details for future bookings as{" "}
                  <span className="font-semibold text-[var(--fg)]">
                    {email}
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full h-11 px-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--gray-5)]/50 text-[var(--fg)] text-sm outline-none cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
                {mode === "login" ? "Password" : "Create Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "login"
                      ? "Enter your password"
                      : "Min. 6 characters"
                  }
                  className="w-full h-11 px-4 pr-11 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all bg-white text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] bg-transparent border-none cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password — Register only */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 px-4 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all bg-white text-sm"
                />
              </div>
            )}

            {/* Error */}
            {localError && (
              <div className="text-sm text-[var(--state-error)] bg-[var(--state-error)]/5 border border-[var(--state-error)]/20 rounded-[var(--radius)] px-4 py-2.5 text-center">
                {localError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none text-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  {mode === "login"
                    ? "Log in & Complete Booking"
                    : "Create Account & Book"}
                </>
              )}
            </button>
          </form>

          {/* Mode toggle */}
          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center">
            {mode === "login" ? (
              <p className="text-sm text-[var(--muted)]">
                Not your account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register")
                    setLocalError(null)
                    setPassword("")
                    setConfirmPassword("")
                  }}
                  className="text-[var(--brand-primary)] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Create a new account
                </button>
              </p>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    setLocalError(null)
                    setPassword("")
                    setConfirmPassword("")
                  }}
                  className="text-[var(--brand-primary)] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Log in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes authModalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
