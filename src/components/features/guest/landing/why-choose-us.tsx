"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, CreditCard, Clock, Star, Headphones, MapPin } from "lucide-react"

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "Every listing is personally inspected and verified for quality, safety, and accuracy.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Bank-grade encryption protects every transaction. Pay confidently with multiple options.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-600",
  },
  {
    icon: Clock,
    title: "Instant Booking",
    description: "No waiting — confirm your reservation instantly and receive immediate confirmation.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
  {
    icon: Star,
    title: "Best Price Guarantee",
    description: "Find a lower price elsewhere? We match it. You always get the best deal with us.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-600",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated team is available round the clock to assist you before, during, and after your stay.",
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-600",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description: "Curated recommendations from locals who know the best hidden gems across Sri Lanka.",
    gradient: "from-cyan-500/20 to-sky-500/20",
    iconColor: "text-cyan-600",
  },
]

export default function WhyChooseUs() {
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
    <section ref={sectionRef} className="relative py-24 px-5 bg-white overflow-hidden">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #953002 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto">
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <span className="inline-block text-[#953002] text-[12px] font-bold tracking-[0.2em] uppercase mb-3">
            Why Prime Stay
          </span>
          <h2 className="text-[clamp(26px,4vw,44px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-4">
            A Booking Experience That&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
              Simply Better
            </span>
          </h2>
          <p className="text-[#828282] text-[15px] max-w-[500px] mx-auto leading-relaxed">
            We go beyond just listing rooms. Here&apos;s why thousands of travelers trust Prime Stay for their Sri Lankan adventures.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group relative p-7 rounded-2xl border border-[#f0f0f0] bg-white hover:bg-gradient-to-br ${feature.gradient} transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-transparent ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="text-[18px] font-bold text-[#1d1d1d] mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#828282] text-[14px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
