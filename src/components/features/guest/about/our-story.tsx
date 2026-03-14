"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export default function OurStory() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #953002 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image side */}
          <div
            className={`relative transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/backgrounds/about-team.png"
                alt="Prime Stay team collaborating in office"
                fill
                className="object-cover"
              />
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#953002]/20 to-transparent" />
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white rounded-xl shadow-xl p-3 sm:p-4 border border-[#f0f0f0]">
              <p className="text-[#953002] text-[24px] sm:text-[32px] font-black leading-none">2021</p>
              <p className="text-[#828282] text-[11px] sm:text-[12px] font-medium mt-1">Founded in Colombo</p>
            </div>

            {/* Decorative accent */}
            <div className="hidden md:block absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-[#ffb401]/40 rounded-tl-2xl" />
          </div>

          {/* Text side */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <span className="inline-block text-[#953002] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
              Our Story
            </span>
            <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-4 sm:mb-6">
              Born From a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
                Love for Sri Lanka
              </span>
            </h2>

            <div className="space-y-4 text-[#4f4f4f] text-[14px] sm:text-[15px] leading-relaxed">
              <p>
                Prime Stay was founded with a simple belief: every traveler deserves a stay they can trust. 
                We noticed that finding verified, quality accommodation in Sri Lanka was harder than it should be — 
                scattered listings, inconsistent quality, and no reliable way to know what you&apos;re booking.
              </p>
              <p>
                So we built a platform that puts trust first. Every property on Prime Stay is personally inspected, 
                every review is genuine, and every booking is backed by our guarantee. We work directly with 
                property owners across the island to curate stays that meet our exacting standards.
              </p>
              <p>
                Today, we serve over 50,000 happy guests annually, partnering with 1,200+ verified properties 
                across 120+ destinations — from the misty hills of Ella to the golden shores of Mirissa.
              </p>
            </div>

            {/* Mini stats row */}
            <div className="flex items-center gap-6 sm:gap-8 mt-6 sm:mt-8 pt-6 border-t border-[#e0e0e0]">
              {[
                { value: "50K+", label: "Guests Served" },
                { value: "1,200+", label: "Properties" },
                { value: "120+", label: "Destinations" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-[#953002] text-[20px] sm:text-[24px] font-black leading-none">{value}</p>
                  <p className="text-[#828282] text-[11px] sm:text-[12px] font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
