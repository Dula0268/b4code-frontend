import Image from "next/image"
import Link from "next/link"

export default function OwnerCtaSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1a0f0a]">

      {/*
        YOUR IMAGE: public/images/owner-bg.jpg
        object-contain shows the full image without any cropping
        h-screen makes this section cover the entire viewport
      */}
      <Image
        src="/images/owner-bg.jpg"
        alt=""
        fill
        className="object-cover object-top"
      />

      {/* Gradient from transparent top to dark bottom so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative z-10 text-center px-5 max-w-[700px]">
        <h2 className="text-white font-black text-[clamp(22px,4vw,40px)] leading-[1.1] tracking-tight mb-3">
          Manage Your Property with Confidence
        </h2>
        <p className="text-white/80 text-[14px] leading-relaxed mb-6 max-w-[540px] mx-auto">
          List your property, control pricing and availability, manage reservations, and grow your revenue — all from one powerful dashboard.
        </p>
        <Link
          href="/auth/register?role=owner"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#953002] hover:bg-[#6d2200] text-white font-semibold text-[15px] rounded-xl transition-colors no-underline"
        >
          Continue as Owner
        </Link>
      </div>
    </section>
  )
}