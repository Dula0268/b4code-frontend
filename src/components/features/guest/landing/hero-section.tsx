"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import SearchBar from "@/components/features/guest/search/search-bar"
import { ChevronDown } from "lucide-react"

function FloatingParticle({ delay, size, left, duration }: { delay: number; size: number; left: string; duration: number }) {
  return (
    <div
      className="absolute rounded-full bg-white/10 animate-float"
      style={{
        width: size,
        height: size,
        left,
        bottom: "-20px",
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen md:h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d1a0f] py-16 md:py-0">

      {/* Background image */}
      <Image
        src="/images/backgrounds/hero-bg-new.png"
        alt="Luxury tropical resort at sunset"
        fill
        className="object-cover object-center scale-105 animate-slow-zoom"
        priority
      />

      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Animated floating particles - hidden on mobile for performance */}
      <div className="hidden sm:block">
        <FloatingParticle delay={0} size={6} left="10%" duration={12} />
        <FloatingParticle delay={2} size={4} left="25%" duration={15} />
        <FloatingParticle delay={4} size={8} left="45%" duration={10} />
        <FloatingParticle delay={1} size={5} left="65%" duration={14} />
        <FloatingParticle delay={3} size={7} left="80%" duration={11} />
        <FloatingParticle delay={5} size={3} left="90%" duration={16} />
      </div>

      {/* Hero content */}
      <div className={`relative z-10 text-center px-4 sm:px-5 w-full max-w-[780px] flex flex-col items-center gap-4 sm:gap-6 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-[12px] font-medium tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-secondary)] animate-pulse flex-shrink-0" />
          <span className="hidden xs:inline">Sri Lanka&apos;s Premier Booking Platform</span>
          <span className="inline xs:hidden">Premier Booking Platform</span>
        </div>

        <h1 className="text-white font-black text-[clamp(28px,6.5vw,60px)] leading-[1.1] sm:leading-[1.05] tracking-tight drop-shadow-lg">
          Find, Book, and Stay
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-secondary)] via-[#ffc940] to-[var(--brand-secondary)]">
            with Confidence
          </span>
        </h1>

        <p className="text-white/85 text-[clamp(14px,3.5vw,16px)] leading-relaxed max-w-[520px] drop-shadow px-2">
          Search thousands of verified properties, enjoy secure payments, and experience stress-free travel across the paradise island.
        </p>

        <Suspense fallback={<div className="h-14 w-full max-w-[640px] rounded-xl bg-white/20 animate-pulse" />}>
          <SearchBar />
        </Suspense>

        {/* Trust indicators */}
        <div className="flex items-center gap-3 sm:gap-6 mt-2 sm:mt-4 flex-wrap justify-center">
          {[
            { value: "1000+", label: "Properties" },
            { value: "50K+", label: "Happy Guests" },
            { value: "4.9", label: "Avg Rating" },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <span className="text-white font-bold text-[13px] sm:text-[15px]">{value}</span>
              <span className="text-white/60 text-[10px] sm:text-[12px] whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 animate-bounce">
        <span className="text-white/50 text-[11px] tracking-widest uppercase">Explore</span>
        <ChevronDown size={20} className="text-white/50" />
      </div>
    </section>
  )
}