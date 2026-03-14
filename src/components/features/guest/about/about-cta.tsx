"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function AboutCta() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-[#faf9f7] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#953002]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-[#ffb401]/5 rounded-full blur-[100px]" />

      <div
        className={`relative max-w-[700px] mx-auto text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="inline-block text-[#953002] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
          Start Your Journey
        </span>
        <h2 className="text-[clamp(24px,5vw,44px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-4 sm:mb-5">
          Ready to Experience{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
            Sri Lanka?
          </span>
        </h2>
        <p className="text-[#828282] text-[clamp(13px,2.5vw,16px)] leading-relaxed mb-8 sm:mb-10 max-w-[520px] mx-auto">
          Whether you&apos;re planning a relaxing beach getaway, a hill country adventure, or a cultural exploration — 
          Prime Stay has the perfect verified property waiting for you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/guest/search"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#953002] to-[#c84a15] text-white font-semibold text-[14px] sm:text-[15px] no-underline shadow-lg shadow-[#953002]/25 hover:shadow-xl hover:shadow-[#953002]/30 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            Explore Properties
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border-2 border-[#953002] text-[#953002] font-semibold text-[14px] sm:text-[15px] no-underline hover:bg-[#953002]/5 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
