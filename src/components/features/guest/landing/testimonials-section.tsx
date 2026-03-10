"use client"

import { useEffect, useRef, useState } from "react"
import { Star, Quote } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Amara Jayawickrama",
    location: "Colombo, Sri Lanka",
    avatar: "AJ",
    rating: 5,
    text: "Absolutely incredible experience! The villa in Mirissa was even more beautiful than the photos. Prime Stay made everything seamless from booking to checkout.",
    property: "Ocean View Villa, Mirissa",
  },
  {
    name: "David Thompson",
    location: "London, UK",
    avatar: "DT",
    rating: 5,
    text: "I've used many booking platforms, but Prime Stay stands out. The verified properties gave me confidence, and the local recommendations were spot-on!",
    property: "Heritage Bungalow, Kandy",
  },
  {
    name: "Sakura Tanaka",
    location: "Tokyo, Japan",
    avatar: "ST",
    rating: 5,
    text: "The tea country lodge in Ella was magical. Waking up to misty mountain views every morning was a dream. Will definitely book through Prime Stay again.",
    property: "Mountain Lodge, Ella",
  },
]

export default function TestimonialsSection() {
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
    <section ref={sectionRef} className="relative py-24 px-5 bg-[#faf8f5] overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-20 left-10 text-[#953002]/5">
        <Quote size={200} />
      </div>

      <div className="relative max-w-[1200px] mx-auto">
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <span className="inline-block text-[#953002] text-[12px] font-bold tracking-[0.2em] uppercase mb-3">
            Guest Stories
          </span>
          <h2 className="text-[clamp(26px,4vw,44px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-4">
            Loved by Travelers{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
              Worldwide
            </span>
          </h2>
          <p className="text-[#828282] text-[15px] max-w-[480px] mx-auto leading-relaxed">
            Don&apos;t just take our word for it — hear from guests who made unforgettable memories with Prime Stay.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`relative p-7 rounded-2xl bg-white border border-[#f0f0f0] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
                }`}
              style={{ transitionDelay: `${i * 150 + 200}ms` }}
            >
              {/* Quote icon */}
              <div className="absolute -top-3 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-[#953002] to-[#c84a15] flex items-center justify-center">
                <Quote size={14} className="text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-[#ffb401] fill-[#ffb401]"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-[#4f4f4f] text-[14px] leading-relaxed mb-5 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Property tag */}
              <div className="inline-block px-3 py-1 rounded-full bg-[#953002]/5 text-[#953002] text-[11px] font-semibold mb-5">
                {t.property}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#f0f0f0]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#953002] to-[#c84a15] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1d1d1d] m-0">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-[#828282] m-0">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
