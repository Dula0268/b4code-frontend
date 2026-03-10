"use client"

import { useEffect, useRef, useState } from "react"
import { Building2, Users, Globe, Award } from "lucide-react"

const STATS = [
  { icon: Building2, value: "1,200+", label: "Verified Properties", color: "from-[#953002] to-[#c84a15]" },
  { icon: Users, value: "50,000+", label: "Happy Guests", color: "from-[#ffb401] to-[#ffc940]" },
  { icon: Globe, value: "120+", label: "Destinations", color: "from-emerald-500 to-teal-500" },
  { icon: Award, value: "4.9/5", label: "Average Rating", color: "from-purple-500 to-indigo-500" },
]

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-5 bg-gradient-to-br from-[#0f1923] via-[#1a2a3a] to-[#0f1923] overflow-hidden"
    >
      {/* Decorative glowing orbs */}
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-[#953002]/10 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-[#ffb401]/8 rounded-full blur-[80px] -translate-y-1/2" />

      <div className="relative max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`text-center transition-all duration-700 ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                  }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <p className="text-white text-[clamp(28px,4vw,40px)] font-black tracking-tight mb-1">
                  {stat.value}
                </p>
                <p className="text-white/50 text-[13px] font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
