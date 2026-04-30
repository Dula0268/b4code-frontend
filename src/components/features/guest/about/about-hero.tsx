"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function AboutHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/backgrounds/about-hero-bg.png"
        alt="Scenic Sri Lanka coastline with luxury resorts"
        fill
        className="object-cover object-center scale-105 animate-slow-zoom"
        priority
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 sm:px-6 max-w-[700px] flex flex-col items-center gap-3 sm:gap-4 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] sm:text-[12px] font-medium tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-secondary)] animate-pulse flex-shrink-0" />
          Our Story
        </div>

        <h1 className="text-white font-black text-[clamp(28px,6vw,52px)] leading-[1.1] tracking-tight drop-shadow-lg">
          Building Trust in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-secondary)] via-[#ffc940] to-[var(--brand-secondary)]">
            Sri Lankan Hospitality
          </span>
        </h1>

        <p className="text-white/80 text-[clamp(13px,3vw,16px)] leading-relaxed max-w-[520px] drop-shadow">
          We&apos;re on a mission to make every stay in Sri Lanka unforgettable — connecting travelers with verified properties they can trust.
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
