"use client"

import { useEffect, useRef, useState } from "react"
import { Building2, Users, Globe, Award, Calendar, Star } from "lucide-react"

const MILESTONES = [
  {
    year: "2021",
    title: "The Beginning",
    description: "Prime Stay launched in Colombo with just 15 verified properties and a dream to change Sri Lankan hospitality.",
    icon: Calendar,
    color: "from-[#953002] to-[#c84a15]",
  },
  {
    year: "2022",
    title: "Rapid Growth",
    description: "Expanded to 200+ properties across 30 destinations. Launched our mobile-first platform with instant booking.",
    icon: Building2,
    color: "from-[#ffb401] to-[#ffc940]",
  },
  {
    year: "2023",
    title: "Island-Wide Coverage",
    description: "Reached 600+ properties in 80+ destinations. Introduced our Best Price Guarantee and 24/7 support center.",
    icon: Globe,
    color: "from-emerald-500 to-teal-500",
  },
  {
    year: "2024",
    title: "Award-Winning",
    description: "Won 'Best Travel Tech Startup' at Sri Lanka Digital Awards. Serving 30,000+ guests annually.",
    icon: Award,
    color: "from-purple-500 to-indigo-500",
  },
  {
    year: "2025",
    title: "Community Impact",
    description: "Partnered with 1,000+ property owners. Launched owner tools and staff management features.",
    icon: Users,
    color: "from-blue-500 to-sky-500",
  },
  {
    year: "2026",
    title: "The Future",
    description: "1,200+ verified properties, 50,000+ guests, 120+ destinations. AI-powered recommendations and beyond.",
    icon: Star,
    color: "from-rose-500 to-pink-500",
  },
]

export default function Timeline() {
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
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-[#0f1923] via-[#1a2a3a] to-[#0f1923] overflow-hidden"
    >
      {/* Decorative glowing orbs */}
      <div className="hidden sm:block absolute top-1/4 left-[10%] w-[200px] h-[200px] bg-[#953002]/10 rounded-full blur-[100px]" />
      <div className="hidden sm:block absolute bottom-1/4 right-[10%] w-[180px] h-[180px] bg-[#ffb401]/8 rounded-full blur-[80px]" />

      <div className="relative max-w-[900px] mx-auto">
        {/* Section header */}
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block text-[#ffb401] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
            Our Journey
          </span>
          <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-white leading-[1.1] tracking-tight mb-3 sm:mb-4">
            From Humble Roots to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb401] to-[#ffc940]">
              Island-Wide Trust
            </span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line - center on desktop, left on mobile */}
          <div className="absolute left-4 sm:left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#953002] via-[#ffb401] to-[#953002]/30" />

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {MILESTONES.map((milestone, i) => {
              const Icon = milestone.icon
              const isEven = i % 2 === 0
              return (
                <div
                  key={milestone.year}
                  className={`relative flex items-start transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${i * 120 + 200}ms` }}
                >
                  {/* Desktop: alternating sides */}
                  <div className="hidden md:grid md:grid-cols-[1fr_48px_1fr] w-full items-start">
                    {/* Left content */}
                    <div className={`${isEven ? "pr-8" : ""}`}>
                      {isEven && (
                        <div className="text-right">
                          <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${milestone.color} text-[13px] font-bold tracking-wider uppercase mb-1`}>
                            {milestone.year}
                          </span>
                          <h3 className="text-white text-[18px] sm:text-[20px] font-bold tracking-tight mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-white/50 text-[13px] sm:text-[14px] leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="flex justify-center">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg ring-4 ring-[#0f1923] flex-shrink-0`}>
                        <Icon size={16} className="text-white" />
                      </div>
                    </div>

                    {/* Right content */}
                    <div className={`${!isEven ? "pl-8" : ""}`}>
                      {!isEven && (
                        <div>
                          <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${milestone.color} text-[13px] font-bold tracking-wider uppercase mb-1`}>
                            {milestone.year}
                          </span>
                          <h3 className="text-white text-[18px] sm:text-[20px] font-bold tracking-tight mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-white/50 text-[13px] sm:text-[14px] leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile: all items left-aligned */}
                  <div className="md:hidden flex items-start gap-4 sm:gap-5 w-full">
                    <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg ring-3 ring-[#0f1923] flex-shrink-0 z-10`}>
                      <Icon size={14} className="text-white sm:size-[16px]" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${milestone.color} text-[11px] sm:text-[12px] font-bold tracking-wider uppercase mb-1`}>
                        {milestone.year}
                      </span>
                      <h3 className="text-white text-[16px] sm:text-[18px] font-bold tracking-tight mb-1.5">
                        {milestone.title}
                      </h3>
                      <p className="text-white/50 text-[12px] sm:text-[13px] leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
