"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

const DESTINATIONS = [
  {
    name: "Sigiriya",
    tagline: "The Ancient Rock Fortress",
    image: "/images/destinations/sigiriya.png",
    price: "From LKR 45,000/night",
    href: "/guest/search?destination=Sigiriya",
  },
  {
    name: "Mirissa",
    tagline: "Sun, Surf & Whale Watching",
    image: "/images/destinations/mirissa.png",
    price: "From LKR 35,000 /night",
    href: "/guest/search?destination=Mirissa",
  },
  {
    name: "Kandy",
    tagline: "Cultural Heart of Lanka",
    image: "/images/destinations/kandy.png",
    price: "From LKR 40,000/night",
    href: "/guest/search?destination=Kandy",
  },
  {
    name: "Ella",
    tagline: "Tea Country Paradise",
    image: "/images/destinations/ella.png",
    price: "From LKR 30,000/night",
    href: "/guest/search?destination=Ella",
  },
]

export default function FeaturedDestinations() {
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
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-5 bg-[#faf8f5] overflow-hidden"
    >
      {/* Decorative background elements - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-radial from-[#953002]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-radial from-[#ffb401]/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-[1200px] mx-auto">
        {/* Section header */}
        <div
          className={`text-center mb-10 sm:mb-12 md:mb-16 transition-all duration-700 px-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <span className="inline-block text-[#953002] text-[10px] sm:text-[12px] font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3">
            Popular Destinations
          </span>
          <h2 className="text-[clamp(22px,5vw,44px)] font-black text-[#1d1d1d] leading-[1.1] tracking-tight mb-3 sm:mb-4">
            Explore Sri Lanka&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#953002] to-[#c84a15]">
              Finest Stays
            </span>
          </h2>
          <p className="text-[#828282] text-[clamp(13px,2.5vw,15px)] max-w-[480px] mx-auto leading-relaxed">
            From ancient fortresses to pristine beaches — discover handpicked properties in the island&apos;s most stunning locations.
          </p>
        </div>

        {/* Destination cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {DESTINATIONS.map((dest, i) => (
            <Link
              key={dest.name}
              href={dest.href}
              className={`group relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[3/4] no-underline transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 active:scale-95 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
                }`}
              style={{ transitionDelay: `${i * 150 + 200}ms` }}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Price badge - better positioning on mobile */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[11px] font-semibold whitespace-nowrap">
                {dest.price}
              </div>

              {/* Content - better padding on mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                <h3 className="text-white text-[18px] sm:text-[20px] font-bold mb-1 tracking-tight">
                  {dest.name}
                </h3>
                <p className="text-white/70 text-[12px] sm:text-[13px] mb-2 sm:mb-3">
                  {dest.tagline}
                </p>
                <div className="flex items-center gap-1.5 text-[#ffb401] text-[12px] sm:text-[13px] font-semibold group-hover:gap-3 transition-all duration-300">
                  Explore
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
