import Image from "next/image"
import Link from "next/link"

export default function StaffCtaSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d0d1a]">

      {/*
        YOUR IMAGE: public/images/staff-bg.jpg
        h-screen = covers the full viewport height
        object-contain = shows the full image without any cropping
      */}
      <Image
        src="/images/staff-bg.jpg"
        alt=""
        fill
        className="object-cover object-top"
      />

      {/* Stronger gradient at bottom — staff photo is lighter so needs more overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      <div className="relative z-10 text-center px-5 max-w-[700px]">
        <h2 className="text-white font-black text-[clamp(22px,4vw,40px)] leading-[1.1] tracking-tight mb-3">
          Deliver Exceptional Service, Every Day
        </h2>
        <p className="text-white/80 text-[14px] leading-relaxed mb-6 max-w-[540px] mx-auto">
          Manage reservations, update order statuses, handle food orders, and respond to guest requests in real time.
        </p>
        <Link
          href="/auth/register?role=staff"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#953002] hover:bg-[#6d2200] text-white font-semibold text-[15px] rounded-xl transition-colors no-underline"
        >
          Continue as Staff
        </Link>
      </div>
    </section>
  )
}