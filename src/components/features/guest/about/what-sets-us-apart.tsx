"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Users, Zap, Globe, HeartHandshake, TrendingUp } from "lucide-react"

const PILLARS = [
  {
    icon: Shield,
    title: "Trust & Verification",
    description: "Every property is personally inspected by our team before going live.",
    color: "text-emerald-600",
    bg: "from-emerald-500/15 to-teal-500/15",
  },
  {
    icon: Users,
    title: "Guest-Centric Design",
    description: "Every feature is designed with traveler comfort and convenience in mind.",
    color: "text-blue-600",
    bg: "from-blue-500/15 to-indigo-500/15",
  },
  {
    icon: Zap,
    title: "Instant Confirmations",
    description: "Real-time availability syncing means no waiting, no double-bookings.",
    color: "text-amber-600",
    bg: "from-amber-500/15 to-orange-500/15",
  },
  {
    icon: Globe,
    title: "Local Expertise",
    description: "Our team of Sri Lankan locals curate the best experiences in every region.",
    color: "text-cyan-600",
    bg: "from-cyan-500/15 to-sky-500/15",
  },
  {
    icon: HeartHandshake,
    title: "Fair for Owners",
    description: "Transparent pricing with competitive commission rates for property owners.",
    color: "text-rose-600",
    bg: "from-rose-500/15 to-pink-500/15",
  },
  {
    icon: TrendingUp,
    title: "Continuous Innovation",
    description: "We constantly improve our platform with AI-powered recommendations and insights.",
    color: "text-purple-600",
    bg: "from-purple-500/15 to-violet-500/15",
  },
]

export default function WhatSetsUsApart() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #953002 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-[1100px] mx-auto">
        {/* Section header */}
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block text-[#953002] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
            Our Difference
          </span>
          <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-3 sm:mb-4">
            What Sets{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
              Us Apart
            </span>
          </h2>
          <p className="text-[#828282] text-[clamp(13px,2.5vw,15px)] max-w-[480px] mx-auto leading-relaxed">
            Six pillars that define the Prime Stay experience and make us the most trusted booking platform in Sri Lanka.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-xl border border-[#f0f0f0] bg-white hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 80 + 200}ms` }}
              >
                <div
                  className={`w-10 sm:w-11 h-10 sm:h-11 rounded-lg bg-gradient-to-br ${pillar.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={18} className={pillar.color} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1d1d1d] mb-1 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-[#828282] text-[12px] sm:text-[13px] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
