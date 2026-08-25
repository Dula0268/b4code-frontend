import Link from "next/link"
import Logo from "@/components/shared/branding/logo"
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react"

const FOOTER_LINKS = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Safety Information", href: "/safety" },
    { label: "Cancellation Options", href: "/cancellation" },
    { label: "Report a Concern", href: "/report" },
  ],
}

const CONTACT_INFO = [
  { icon: MapPin, text: "Level 4, Access Towers, Union Place, Colombo 02" },
  { icon: Phone, text: "+94 11 234 5678" },
  { icon: Mail, text: "hello@primestay.lk" },
]

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Mail, href: "mailto:hello@primestay.lk", label: "Email" },
]

type GuestFooterProps = {
  variant?: "full" | "compact"
}

const POLICY_LINKS = ["Privacy", "Terms", "Sitemap"]

export default function GuestFooter({ variant = "compact" }: GuestFooterProps) {
  if (variant === "compact") {
    return (
      <footer className="bg-white border-t border-[var(--brand-primary)]/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[var(--brand-primary)] text-[12px] m-0 text-center sm:text-left font-medium">
            © 2026 PRIME STAY Sri Lanka. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {POLICY_LINKS.map(link => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-[var(--brand-primary)]/80 text-[12px] font-medium no-underline hover:text-[var(--brand-secondary)] transition-colors duration-200"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-white text-[var(--brand-primary)] border-t border-[var(--brand-primary)]/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-[30px] pt-10 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-8 sm:gap-10 mb-10 sm:mb-12">

          <div>
            <div className="mb-4">
              <Logo variant="default" href="/" width={140} height={40} />
            </div>
            <p className="text-[var(--gray-2)] text-sm leading-relaxed max-w-[220px] mb-5">
              The premier platform for luxury villa rentals and boutique stays in Sri Lanka. Experience the island like never before.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand-primary)] hover:text-[var(--brand-secondary)] transition-colors duration-200"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-[var(--brand-primary)] text-sm font-bold mb-4">{title}</h3>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[var(--gray-2)] text-sm font-medium no-underline hover:text-[var(--brand-secondary)] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[var(--brand-primary)] text-sm font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 list-none p-0 m-0">
              {CONTACT_INFO.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-2.5 text-[var(--gray-2)] text-[13px] font-medium">
                  <Icon size={15} className="text-[var(--brand-secondary)] flex-shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--brand-primary)]/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--brand-primary)]/80 font-medium text-[13px] m-0">
            © 2026 PRIME STAY Sri Lanka. All rights reserved.
          </p>
          <div className="flex gap-6">
            {POLICY_LINKS.map(link => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-[var(--brand-primary)]/80 font-medium text-[13px] no-underline hover:text-[var(--brand-secondary)] transition-colors duration-200"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}