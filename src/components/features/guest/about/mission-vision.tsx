"use client"

import { useEffect, useRef, useState } from "react"
import { Target, Eye, Heart } from "lucide-react"

const VALUES = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make finding and booking quality accommodation in Sri Lanka effortless, transparent, and trustworthy for every traveler.",
    gradient: "from-[#953002]/15 to-[#c84a15]/15",
    iconBg: "from-[#953002] to-[#c84a15]",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become South Asia's most trusted hospitality marketplace — where guests feel at home and property owners thrive.",
    gradient: "from-[#ffb401]/15 to-[#ffc940]/15",
    iconBg: "from-[#ffb401] to-[#ffc940]",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Trust, transparency, and excellence guide everything we do. We believe in genuine connections between travelers and local communities.",
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconBg: "from-emerald-500 to-teal-500",
  },
]

export default function MissionVision() {
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
      className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-[#faf9f7] overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#953002] to-[#ffb401] rounded-full" />

      <div className="relative max-w-[1100px] mx-auto">
        {/* Section header */}
        <div
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block text-[#953002] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
            What Drives Us
          </span>
          <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-3 sm:mb-4">
            Purpose Beyond{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
              Bookings
            </span>
          </h2>
          <p className="text-[#828282] text-[clamp(13px,2.5vw,15px)] max-w-[480px] mx-auto leading-relaxed">
            We&apos;re building more than a platform — we&apos;re creating a community of trust that benefits travelers and property owners alike.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {VALUES.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className={`group relative p-6 sm:p-8 rounded-2xl bg-white border border-[#f0f0f0] hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-transparent ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120 + 200}ms` }}
              >
                {/* Icon */}
                <div
                  className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}
                >
                  <Icon size={22} className="text-white" />
                </div>

                <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1d1d1d] mb-2 sm:mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[#828282] text-[13px] sm:text-[14px] leading-relaxed">
                  {item.description}
                </p>

                {/* Hover gradient background */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
