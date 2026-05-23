"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronDown, ArrowRight, Shield, CreditCard, Clock, Star,
  Headphones, MapPin, Building2, Users, Globe, Award, Quote,
  BarChart3, Calendar, DollarSign, ClipboardList, Bell, Utensils,
} from "lucide-react"
import SearchBar from "@/components/guest/search/search-bar"
import { useInView } from "@/hooks/use-in-view"

/* ─────────────────────────────────────────
   Static data (no repeats — defined once)
   ───────────────────────────────────────── */

const DESTINATIONS = [
  { name: "Sigiriya", tagline: "The Ancient Rock Fortress", image: "/images/destinations/sigiriya.png", price: "From LKR 45,000/night", href: "/guest/search?destination=Sigiriya" },
  { name: "Mirissa", tagline: "Sun, Surf & Whale Watching", image: "/images/destinations/mirissa.png", price: "From LKR 35,000/night", href: "/guest/search?destination=Mirissa" },
  { name: "Kandy", tagline: "Cultural Heart of Lanka", image: "/images/destinations/kandy.png", price: "From LKR 40,000/night", href: "/guest/search?destination=Kandy" },
  { name: "Ella", tagline: "Tea Country Paradise", image: "/images/destinations/ella.png", price: "From LKR 30,000/night", href: "/guest/search?destination=Ella" },
]

const FEATURES = [
  { icon: Shield, title: "Verified Properties", description: "Every listing is personally inspected and verified for quality, safety, and accuracy.", gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-600" },
  { icon: CreditCard, title: "Secure Payments", description: "Bank-grade encryption protects every transaction. Pay confidently with multiple options.", gradient: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-600" },
  { icon: Clock, title: "Instant Booking", description: "No waiting — confirm your reservation instantly and receive immediate confirmation.", gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-600" },
  { icon: Star, title: "Best Price Guarantee", description: "Find a lower price elsewhere? We match it. You always get the best deal with us.", gradient: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-600" },
  { icon: Headphones, title: "24/7 Support", description: "Our dedicated team is available round the clock to assist you before, during, and after your stay.", gradient: "from-rose-500/20 to-red-500/20", iconColor: "text-rose-600" },
  { icon: MapPin, title: "Local Expertise", description: "Curated recommendations from locals who know the best hidden gems across Sri Lanka.", gradient: "from-cyan-500/20 to-sky-500/20", iconColor: "text-cyan-600" },
]

const STATS = [
  { icon: Building2, value: "1,200+", label: "Verified Properties", color: "from-[var(--brand-primary)] to-[#c84a15]" },
  { icon: Users, value: "50,000+", label: "Happy Guests", color: "from-[var(--brand-secondary)] to-[#ffc940]" },
  { icon: Globe, value: "120+", label: "Destinations", color: "from-emerald-500 to-teal-500" },
  { icon: Award, value: "4.9/5", label: "Average Rating", color: "from-purple-500 to-indigo-500" },
]

const TESTIMONIALS = [
  { name: "Amara Jayawickrama", location: "Colombo, Sri Lanka", avatar: "AJ", rating: 5, text: "Absolutely incredible experience! The villa in Mirissa was even more beautiful than the photos. Prime Stay made everything seamless from booking to checkout.", property: "Ocean View Villa, Mirissa" },
  { name: "David Thompson", location: "London, UK", avatar: "DT", rating: 5, text: "I've used many booking platforms, but Prime Stay stands out. The verified properties gave me confidence, and the local recommendations were spot-on!", property: "Heritage Bungalow, Kandy" },
  { name: "Sakura Tanaka", location: "Tokyo, Japan", avatar: "ST", rating: 5, text: "The tea country lodge in Ella was magical. Waking up to misty mountain views every morning was a dream. Will definitely book through Prime Stay again.", property: "Mountain Lodge, Ella" },
]

const OWNER_PERKS = [
  { icon: BarChart3, text: "Real-time analytics dashboard" },
  { icon: Calendar, text: "Smart availability management" },
  { icon: DollarSign, text: "Flexible dynamic pricing" },
]

const STAFF_PERKS = [
  { icon: ClipboardList, text: "Live reservation management" },
  { icon: Bell, text: "Real-time guest notifications" },
  { icon: Utensils, text: "F&B order tracking" },
]


/* ─────────────────────────────────────────
   Reusable tiny sub-components (private)
   ───────────────────────────────────────── */

function FloatingParticle({ delay, size, left, duration }: { delay: number; size: number; left: string; duration: number }) {
  return (
    <div
      className="absolute rounded-full bg-white/10 animate-float"
      style={{ width: size, height: size, left, bottom: "-20px", animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    />
  )
}

/** Section header pattern used by Destinations, WhyChooseUs, Testimonials */
function SectionHeader({ tag, title, highlight, subtitle, isVisible }: { tag: string; title: string; highlight: string; subtitle: string; isVisible: boolean }) {
  return (
    <div className={`text-center mb-10 sm:mb-12 md:mb-16 transition-all duration-700 px-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <span className="inline-block text-[var(--brand-primary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
        {tag}
      </span>
      <h2 className="text-[clamp(22px,5vw,44px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-3 sm:mb-4">
        {title}{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#c84a15]">
          {highlight}
        </span>
      </h2>
      <p className="text-[#828282] text-[clamp(13px,2.5vw,15px)] max-w-[500px] mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  )
}

/** CTA section pattern used by Owner & Staff sections */
function CtaSection({
  bgImage, bgAlt, bgColor, tag, title, highlight, subtitle, perks, ctaText, ctaTextMobile, ctaHref,
}: {
  bgImage: string; bgAlt: string; bgColor: string; tag: string; title: string; highlight: string; subtitle: string
  perks: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }[]
  ctaText: string; ctaTextMobile: string; ctaHref: string
}) {
  const { ref, isVisible } = useInView(0.2)

  return (
    <section ref={ref} className={`relative min-h-screen sm:min-h-[85vh] flex flex-col items-center justify-center py-16 sm:py-0 overflow-hidden ${bgColor}`}>
      <Image src={bgImage} alt={bgAlt} fill className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      <div className={`relative z-10 text-center px-4 sm:px-5 max-w-[750px] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <span className="inline-block text-[var(--brand-secondary)] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-3 sm:mb-4">
          {tag}
        </span>

        <h2 className="text-white font-black text-[clamp(24px,5vw,44px)] leading-[1.08] tracking-tight mb-3 sm:mb-4">
          {title}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-secondary)] via-[#ffc940] to-[var(--brand-secondary)]">
            {highlight}
          </span>
        </h2>

        <p className="text-white/75 text-[clamp(13px,2.5vw,15px)] leading-relaxed mb-6 sm:mb-8 max-w-[540px] mx-auto">
          {subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {perks.map((perk, i) => {
            const Icon = perk.icon
            return (
              <div
                key={perk.text}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-[11px] sm:text-[13px] transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 100 + 400}ms` }}
              >
                <Icon size={13} className="text-[var(--brand-secondary)] flex-shrink-0 sm:size-[14px]" />
                <span className="hidden sm:inline">{perk.text}</span>
                <span className="sm:hidden">{perk.text.split(" ").slice(0, 2).join(" ")}</span>
              </div>
            )
          })}
        </div>

        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-[var(--brand-primary)] to-[#b84010] hover:from-[#6d2200] hover:to-[var(--brand-primary)] text-white font-semibold text-[14px] sm:text-[15px] rounded-xl transition-all duration-300 no-underline shadow-lg shadow-[var(--brand-primary)]/30 hover:shadow-xl hover:shadow-[var(--brand-primary)]/40 hover:-translate-y-0.5 group active:scale-95"
        >
          <span className="hidden sm:inline">{ctaText}</span>
          <span className="sm:hidden">{ctaTextMobile}</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 sm:size-[16px]" />
        </Link>
      </div>
    </section>
  )
}


/* ─────────────────────────────────────────
   Main Landing Content Component
   ───────────────────────────────────────── */

export default function LandingContent() {
  /* Hero mount animation */
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  /* Section visibility hooks */
  const destinations = useInView(0.15)
  const features = useInView(0.1)
  const stats = useInView(0.3)
  const testimonials = useInView(0.15)

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen md:h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d1a0f] py-16 md:py-0">
        <Image src="/images/backgrounds/hero-bg-new.png" alt="Luxury tropical resort at sunset" fill className="object-cover object-center scale-105 animate-slow-zoom" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        <div className="hidden sm:block">
          <FloatingParticle delay={0} size={6} left="10%" duration={12} />
          <FloatingParticle delay={2} size={4} left="25%" duration={15} />
          <FloatingParticle delay={4} size={8} left="45%" duration={10} />
          <FloatingParticle delay={1} size={5} left="65%" duration={14} />
          <FloatingParticle delay={3} size={7} left="80%" duration={11} />
          <FloatingParticle delay={5} size={3} left="90%" duration={16} />
        </div>

        <div className={`relative z-10 text-center px-4 sm:px-5 w-full max-w-[780px] flex flex-col items-center gap-4 sm:gap-6 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
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

        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 animate-bounce">
          <span className="text-white/50 text-[11px] tracking-widest uppercase">Explore</span>
          <ChevronDown size={20} className="text-white/50" />
        </div>
      </section>

      {/* ═══════════════ FEATURED DESTINATIONS ═══════════════ */}
      <section ref={destinations.ref} className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-5 bg-[#faf8f5] overflow-hidden">
        <div className="hidden sm:block absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-radial from-[var(--brand-primary)]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-radial from-[var(--brand-secondary)]/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-[1200px] mx-auto">
          <SectionHeader
            tag="Popular Destinations"
            title="Explore Sri Lanka&apos;s"
            highlight="Finest Stays"
            subtitle="From ancient fortresses to pristine beaches — discover handpicked properties in the island&apos;s most stunning locations."
            isVisible={destinations.isVisible}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {DESTINATIONS.map((dest, i) => (
              <Link
                key={dest.name}
                href={dest.href}
                className={`group relative rounded-2xl overflow-hidden aspect-[3/4] no-underline transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 active:scale-95 ${destinations.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <Image src={dest.image} alt={dest.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[11px] font-semibold whitespace-nowrap">
                  {dest.price}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                  <h3 className="text-white text-[18px] sm:text-[20px] font-bold mb-1 tracking-tight">{dest.name}</h3>
                  <p className="text-white/70 text-[12px] sm:text-[13px] mb-2 sm:mb-3">{dest.tagline}</p>
                  <div className="flex items-center gap-1.5 text-[var(--brand-secondary)] text-[12px] sm:text-[13px] font-semibold group-hover:gap-3 transition-all duration-300">
                    Explore
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY CHOOSE US ═══════════════ */}
      <section ref={features.ref} className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-5 bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, var(--brand-primary) 1px, transparent 0)`, backgroundSize: "40px 40px" }} />

        <div className="relative max-w-[1200px] mx-auto">
          <SectionHeader
            tag="Why Prime Stay"
            title="A Booking Experience That&apos;s"
            highlight="Simply Better"
            subtitle="We go beyond just listing rooms. Here&apos;s why thousands of travelers trust Prime Stay for their Sri Lankan adventures."
            isVisible={features.isVisible}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`group relative p-4 sm:p-5 md:p-7 rounded-2xl border border-[#f0f0f0] bg-white hover:bg-gradient-to-br ${feature.gradient} transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-transparent ${features.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 100 + 200}ms` }}
                >
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon size={20} className={feature.iconColor} />
                  </div>
                  <h3 className="text-[16px] sm:text-[17px] md:text-[18px] font-bold text-[#1d1d1d] mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-[#828282] text-[13px] sm:text-[14px] leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section ref={stats.ref} className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-5 bg-gradient-to-br from-[#0f1923] via-[#1a2a3a] to-[#0f1923] overflow-hidden">
        <div className="hidden sm:block absolute top-1/2 left-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--brand-primary)]/10 rounded-full blur-[80px] sm:blur-[100px] -translate-y-1/2" />
        <div className="hidden sm:block absolute top-1/2 right-1/4 w-[150px] sm:w-[250px] h-[150px] sm:h-[250px] bg-[var(--brand-secondary)]/8 rounded-full blur-[60px] sm:blur-[80px] -translate-y-1/2" />

        <div className="relative max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-700 ${stats.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className={`w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg flex-shrink-0`}>
                    <Icon size={20} className="text-white sm:size-[24px]" />
                  </div>
                  <p className="text-white text-[clamp(24px,5vw,40px)] font-black tracking-tight mb-0.5 sm:mb-1 leading-tight">{stat.value}</p>
                  <p className="text-white/50 text-[11px] sm:text-[12px] md:text-[13px] font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section ref={testimonials.ref} className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-5 bg-[#faf8f5] overflow-hidden">
        <div className="hidden sm:block absolute top-10 sm:top-20 left-5 sm:left-10 text-[var(--brand-primary)]/5">
          <Quote size={120} className="sm:size-[200px]" />
        </div>

        <div className="relative max-w-[1200px] mx-auto">
          <SectionHeader
            tag="Guest Stories"
            title="Loved by Travelers"
            highlight="Worldwide"
            subtitle="Don&apos;t just take our word for it — hear from guests who made unforgettable memories with Prime Stay."
            isVisible={testimonials.isVisible}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`relative p-4 sm:p-5 md:p-7 rounded-2xl bg-white border border-[#f0f0f0] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${testimonials.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <div className="absolute -top-3 right-4 sm:right-6 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[#c84a15] flex items-center justify-center flex-shrink-0">
                  <Quote size={13} className="text-white sm:size-[14px]" />
                </div>

                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)] sm:size-[14px]" />
                  ))}
                </div>

                <p className="text-[#4f4f4f] text-[13px] sm:text-[14px] leading-relaxed mb-3 sm:mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[var(--brand-primary)]/5 text-[var(--brand-primary)] text-[10px] sm:text-[11px] font-semibold mb-4 sm:mb-5">
                  {t.property}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#f0f0f0]">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[#c84a15] flex items-center justify-center text-white text-[11px] sm:text-[13px] font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] sm:text-[14px] font-semibold text-[#1d1d1d] m-0 truncate">{t.name}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#828282] m-0 truncate">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ OWNER CTA ═══════════════ */}
      <CtaSection
        bgImage="/images/backgrounds/owner-bg-new.png"
        bgAlt="Luxury boutique hotel interior"
        bgColor="bg-[#1a0f0a]"
        tag="For Property Owners"
        title="Manage Your Property"
        highlight="with Confidence"
        subtitle="List your property, control pricing and availability, manage reservations, and grow your revenue — all from one powerful dashboard."
        perks={OWNER_PERKS}
        ctaText="Continue as Owner"
        ctaTextMobile="Get Started"
        ctaHref="/auth/register?role=owner"
      />

      {/* ═══════════════ STAFF CTA ═══════════════ */}
      <CtaSection
        bgImage="/images/backgrounds/staff-bg-new.png"
        bgAlt="Professional hotel staff welcoming guests"
        bgColor="bg-[#0d0d1a]"
        tag="For Hotel Staff"
        title="Deliver Exceptional Service,"
        highlight="Every Day"
        subtitle="Manage reservations, update order statuses, handle food orders, and respond to guest requests in real time — all from one intuitive interface."
        perks={STAFF_PERKS}
        ctaText="Continue as Staff"
        ctaTextMobile="Get Started"
        ctaHref="/auth/register?role=staff"
      />
    </>
  )
}
