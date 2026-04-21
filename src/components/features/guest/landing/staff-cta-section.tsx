"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, ClipboardList, Bell, Utensils } from "lucide-react"

const STAFF_PERKS = [
  { icon: ClipboardList, text: "Live reservation management" },
  { icon: Bell, text: "Real-time guest notifications" },
  { icon: Utensils, text: "F&B order tracking" },
]

export default function StaffCtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen sm:min-h-[85vh] flex flex-col items-center justify-center py-16 sm:py-0 overflow-hidden bg-[#0d0d1a]"
    >
      {/* Background image */}
      <Image
        src="/images/backgrounds/staff-bg-new.png"
        alt="Professional hotel staff welcoming guests"
        fill
        className="object-cover object-center"
      />

      {/* Multi-layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 sm:px-5 max-w-[750px] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        <span className="inline-block text-[var(--brand-secondary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-3 sm:mb-4">
          For Hotel Staff
        </span>

        <h2 className="text-white font-black text-[clamp(24px,5vw,44px)] leading-[1.08] tracking-tight mb-3 sm:mb-4">
          Deliver Exceptional Service,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-secondary)] via-[#ffc940] to-[var(--brand-secondary)]">
            Every Day
          </span>
        </h2>

        <p className="text-white/75 text-[clamp(13px,2.5vw,15px)] leading-relaxed mb-6 sm:mb-8 max-w-[540px] mx-auto">
          Manage reservations, update order statuses, handle food orders, and respond to guest requests in real time — all from one intuitive interface.
        </p>

        {/* Perk pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {STAFF_PERKS.map((perk, i) => {
            const Icon = perk.icon
            return (
              <div
                key={perk.text}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-[11px] sm:text-[13px] transition-all duration-500 ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                  }`}
                style={{ transitionDelay: `${i * 100 + 400}ms` }}
              >
                <Icon size={13} className="text-[var(--brand-secondary)] flex-shrink-0 sm:size-[14px]" />
                <span className="hidden sm:inline">{perk.text}</span>
                <span className="sm:hidden">{perk.text.split(' ').slice(0, 2).join(' ')}</span>
              </div>
            )
          })}
        </div>

        <Link
          href="/auth/register?role=staff"
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-[var(--brand-primary)] to-[#b84010] hover:from-[#6d2200] hover:to-[var(--brand-primary)] text-white font-semibold text-[14px] sm:text-[15px] rounded-xl transition-all duration-300 no-underline shadow-lg shadow-[var(--brand-primary)]/30 hover:shadow-xl hover:shadow-[var(--brand-primary)]/40 hover:-translate-y-0.5 group active:scale-95"
        >
          <span className="hidden sm:inline">Continue as Staff</span>
          <span className="sm:hidden">Get Started</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 sm:size-[16px]" />
        </Link>
      </div>
    </section>
  )
}