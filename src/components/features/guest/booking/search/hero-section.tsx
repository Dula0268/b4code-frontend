import Image from "next/image"
import SearchBar from "./search-bar"

export default function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d1a0f]">

      {/*
        YOUR IMAGE: public/images/hero-bg.jpg
        h-screen = covers the full viewport height
        object-contain = shows the full image without any cropping
        priority = loads first (above-the-fold image)
      */}
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        className="object-contain object-center"
        priority
      />

      {/* Dark overlay so white text stays readable over the bright photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

      <div className="relative z-10 text-center px-5 w-full max-w-[700px] flex flex-col items-center gap-5">
        <h1 className="text-white font-black text-[clamp(28px,5vw,52px)] leading-[1.1] tracking-tight drop-shadow-lg">
          Find, Book, and Stay with Confidence
        </h1>
        <p className="text-white/90 text-[15px] leading-relaxed max-w-[480px] drop-shadow">
          Search thousands of verified properties, enjoy secure payments, and experience stress-free travel planning.
        </p>
        <SearchBar />
      </div>
    </section>
  )
}