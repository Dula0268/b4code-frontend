"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Target, Eye, Heart, Shield, Users, Zap, Globe, HeartHandshake,
  TrendingUp, Building2, Award, Calendar, Star, ArrowRight,
} from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

/* ─────────────────────────────────────────
   Static data
   ───────────────────────────────────────── */

const VALUES = [
  {
    icon: Target, title: "Our Mission",
    description: "To make finding and booking quality accommodation in Sri Lanka effortless, transparent, and trustworthy for every traveler.",
    gradient: "from-[var(--brand-primary)]/15 to-[#c84a15]/15",
    iconBg: "from-[var(--brand-primary)] to-[#c84a15]",
  },
  {
    icon: Eye, title: "Our Vision",
    description: "To become South Asia's most trusted hospitality marketplace — where guests feel at home and property owners thrive.",
    gradient: "from-[var(--brand-secondary)]/15 to-[#ffc940]/15",
    iconBg: "from-[var(--brand-secondary)] to-[#ffc940]",
  },
  {
    icon: Heart, title: "Our Values",
    description: "Trust, transparency, and excellence guide everything we do. We believe in genuine connections between travelers and local communities.",
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconBg: "from-emerald-500 to-teal-500",
  },
]

const PILLARS = [
  { icon: Shield, title: "Trust & Verification", description: "Every property is personally inspected by our team before going live.", color: "text-emerald-600", bg: "from-emerald-500/15 to-teal-500/15" },
  { icon: Users, title: "Guest-Centric Design", description: "Every feature is designed with traveler comfort and convenience in mind.", color: "text-blue-600", bg: "from-blue-500/15 to-indigo-500/15" },
  { icon: Zap, title: "Instant Confirmations", description: "Real-time availability syncing means no waiting, no double-bookings.", color: "text-amber-600", bg: "from-amber-500/15 to-orange-500/15" },
  { icon: Globe, title: "Local Expertise", description: "Our team of Sri Lankan locals curate the best experiences in every region.", color: "text-cyan-600", bg: "from-cyan-500/15 to-sky-500/15" },
  { icon: HeartHandshake, title: "Fair for Owners", description: "Transparent pricing with competitive commission rates for property owners.", color: "text-rose-600", bg: "from-rose-500/15 to-pink-500/15" },
  { icon: TrendingUp, title: "Continuous Innovation", description: "We constantly improve our platform with AI-powered recommendations and insights.", color: "text-purple-600", bg: "from-purple-500/15 to-violet-500/15" },
]

const MILESTONES = [
  { year: "2021", title: "The Beginning", description: "Prime Stay launched in Colombo with just 15 verified properties and a dream to change Sri Lankan hospitality.", icon: Calendar, color: "from-[var(--brand-primary)] to-[#c84a15]" },
  { year: "2022", title: "Rapid Growth", description: "Expanded to 200+ properties across 30 destinations. Launched our mobile-first platform with instant booking.", icon: Building2, color: "from-[var(--brand-secondary)] to-[#ffc940]" },
  { year: "2023", title: "Island-Wide Coverage", description: "Reached 600+ properties in 80+ destinations. Introduced our Best Price Guarantee and 24/7 support center.", icon: Globe, color: "from-emerald-500 to-teal-500" },
  { year: "2024", title: "Award-Winning", description: "Won 'Best Travel Tech Startup' at Sri Lanka Digital Awards. Serving 30,000+ guests annually.", icon: Award, color: "from-purple-500 to-indigo-500" },
  { year: "2025", title: "Community Impact", description: "Partnered with 1,000+ property owners. Launched owner tools and staff management features.", icon: Users, color: "from-blue-500 to-sky-500" },
  { year: "2026", title: "The Future", description: "1,200+ verified properties, 50,000+ guests, 120+ destinations. AI-powered recommendations and beyond.", icon: Star, color: "from-rose-500 to-pink-500" },
]


/* ─────────────────────────────────────────
   Main About Content Component
   ───────────────────────────────────────── */

export default function AboutContent() {
  /* Hero mount animation */
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  /* Section visibility hooks */
  const story = useInView(0.15)
  const mission = useInView(0.1)
  const pillars = useInView(0.1)
  const timeline = useInView(0.1)
  const cta = useInView(0.2)

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <Image src="/images/backgrounds/about-hero-bg.png" alt="Scenic Sri Lanka coastline with luxury resorts" fill className="object-cover object-center scale-105 animate-slow-zoom" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

        <div className={`relative z-10 text-center px-4 sm:px-6 max-w-[700px] flex flex-col items-center gap-3 sm:gap-4 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
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

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ═══════════════ OUR STORY ═══════════════ */}
      <section ref={story.ref} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, var(--brand-primary) 1px, transparent 0)`, backgroundSize: "40px 40px" }} />

        <div className="relative max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Image side */}
            <div className={`relative transition-all duration-700 ${story.isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/backgrounds/about-team.png" alt="Prime Stay team collaborating in office" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-primary)]/20 to-transparent" />
              </div>
              <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-white rounded-xl shadow-xl p-3 sm:p-4 border border-[#f0f0f0]">
                <p className="text-[var(--brand-primary)] text-[24px] sm:text-[32px] font-black leading-none">2021</p>
                <p className="text-[#828282] text-[11px] sm:text-[12px] font-medium mt-1">Founded in Colombo</p>
              </div>
              <div className="hidden md:block absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-[var(--brand-secondary)]/40 rounded-tl-2xl" />
            </div>

            {/* Text side */}
            <div className={`transition-all duration-700 delay-200 ${story.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <span className="inline-block text-[var(--brand-primary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">Our Story</span>
              <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-4 sm:mb-6">
                Born From a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#c84a15]">Love for Sri Lanka</span>
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

              <div className="flex items-center gap-6 sm:gap-8 mt-6 sm:mt-8 pt-6 border-t border-[#e0e0e0]">
                {[
                  { value: "50K+", label: "Guests Served" },
                  { value: "1,200+", label: "Properties" },
                  { value: "120+", label: "Destinations" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-[var(--brand-primary)] text-[20px] sm:text-[24px] font-black leading-none">{value}</p>
                    <p className="text-[#828282] text-[11px] sm:text-[12px] font-medium mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION / VISION / VALUES ═══════════════ */}
      <section ref={mission.ref} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-[#faf9f7] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full" />

        <div className="relative max-w-[1100px] mx-auto">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${mission.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span className="inline-block text-[var(--brand-primary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">What Drives Us</span>
            <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-3 sm:mb-4">
              Purpose Beyond{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#c84a15]">Bookings</span>
            </h2>
            <p className="text-[#828282] text-[clamp(13px,2.5vw,15px)] max-w-[480px] mx-auto leading-relaxed">
              We&apos;re building more than a platform — we&apos;re creating a community of trust that benefits travelers and property owners alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {VALUES.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className={`group relative p-6 sm:p-8 rounded-2xl bg-white border border-[#f0f0f0] hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-transparent ${mission.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 120 + 200}ms` }}
                >
                  <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1d1d1d] mb-2 sm:mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-[#828282] text-[13px] sm:text-[14px] leading-relaxed">{item.description}</p>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHAT SETS US APART ═══════════════ */}
      <section ref={pillars.ref} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, var(--brand-primary) 1px, transparent 0)`, backgroundSize: "32px 32px" }} />

        <div className="relative max-w-[1100px] mx-auto">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${pillars.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span className="inline-block text-[var(--brand-primary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">Our Difference</span>
            <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-3 sm:mb-4">
              What Sets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#c84a15]">Us Apart</span>
            </h2>
            <p className="text-[#828282] text-[clamp(13px,2.5vw,15px)] max-w-[480px] mx-auto leading-relaxed">
              Six pillars that define the Prime Stay experience and make us the most trusted booking platform in Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-xl border border-[#f0f0f0] bg-white hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5 ${pillars.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: `${i * 80 + 200}ms` }}
                >
                  <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-lg bg-gradient-to-br ${pillar.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={18} className={pillar.color} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1d1d1d] mb-1 tracking-tight">{pillar.title}</h3>
                    <p className="text-[#828282] text-[12px] sm:text-[13px] leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TIMELINE ═══════════════ */}
      <section ref={timeline.ref} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-[#0f1923] via-[#1a2a3a] to-[#0f1923] overflow-hidden">
        <div className="hidden sm:block absolute top-1/4 left-[10%] w-[200px] h-[200px] bg-[var(--brand-primary)]/10 rounded-full blur-[100px]" />
        <div className="hidden sm:block absolute bottom-1/4 right-[10%] w-[180px] h-[180px] bg-[var(--brand-secondary)]/8 rounded-full blur-[80px]" />

        <div className="relative max-w-[900px] mx-auto">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${timeline.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <span className="inline-block text-[var(--brand-secondary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">Our Journey</span>
            <h2 className="text-[clamp(24px,4.5vw,40px)] font-black text-white leading-[1.1] tracking-tight mb-3 sm:mb-4">
              From Humble Roots to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-secondary)] to-[#ffc940]">Island-Wide Trust</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 sm:left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-primary)]/30" />

            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {MILESTONES.map((milestone, i) => {
                const Icon = milestone.icon
                const isEven = i % 2 === 0
                return (
                  <div
                    key={milestone.year}
                    className={`relative flex items-start transition-all duration-700 ${timeline.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                    style={{ transitionDelay: `${i * 120 + 200}ms` }}
                  >
                    {/* Desktop: alternating sides */}
                    <div className="hidden md:grid md:grid-cols-[1fr_48px_1fr] w-full items-start">
                      <div className={`${isEven ? "pr-8" : ""}`}>
                        {isEven && (
                          <div className="text-right">
                            <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${milestone.color} text-[13px] font-bold tracking-wider uppercase mb-1`}>{milestone.year}</span>
                            <h3 className="text-white text-[18px] sm:text-[20px] font-bold tracking-tight mb-2">{milestone.title}</h3>
                            <p className="text-white/50 text-[13px] sm:text-[14px] leading-relaxed">{milestone.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg ring-4 ring-[#0f1923] flex-shrink-0`}>
                          <Icon size={16} className="text-white" />
                        </div>
                      </div>
                      <div className={`${!isEven ? "pl-8" : ""}`}>
                        {!isEven && (
                          <div>
                            <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${milestone.color} text-[13px] font-bold tracking-wider uppercase mb-1`}>{milestone.year}</span>
                            <h3 className="text-white text-[18px] sm:text-[20px] font-bold tracking-tight mb-2">{milestone.title}</h3>
                            <p className="text-white/50 text-[13px] sm:text-[14px] leading-relaxed">{milestone.description}</p>
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
                        <span className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${milestone.color} text-[11px] sm:text-[12px] font-bold tracking-wider uppercase mb-1`}>{milestone.year}</span>
                        <h3 className="text-white text-[16px] sm:text-[18px] font-bold tracking-tight mb-1.5">{milestone.title}</h3>
                        <p className="text-white/50 text-[12px] sm:text-[13px] leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section ref={cta.ref} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-[#faf9f7] overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[var(--brand-primary)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-[var(--brand-secondary)]/5 rounded-full blur-[100px]" />

        <div className={`relative max-w-[700px] mx-auto text-center transition-all duration-700 ${cta.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="inline-block text-[var(--brand-primary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">Start Your Journey</span>
          <h2 className="text-[clamp(24px,5vw,44px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-4 sm:mb-5">
            Ready to Experience{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#c84a15]">Sri Lanka?</span>
          </h2>
          <p className="text-[#828282] text-[clamp(13px,2.5vw,16px)] leading-relaxed mb-8 sm:mb-10 max-w-[520px] mx-auto">
            Whether you&apos;re planning a relaxing beach getaway, a hill country adventure, or a cultural exploration —
            Prime Stay has the perfect verified property waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/guest/search"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[#c84a15] text-white font-semibold text-[14px] sm:text-[15px] no-underline shadow-lg shadow-[var(--brand-primary)]/25 hover:shadow-xl hover:shadow-[var(--brand-primary)]/30 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              Explore Properties
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold text-[14px] sm:text-[15px] no-underline hover:bg-[var(--brand-primary)]/5 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
