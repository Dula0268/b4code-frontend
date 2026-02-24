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

export default function GuestFooter() {
  return (
    <footer className="bg-[#0f1923] text-white">
      <div className="max-w-[1440px] mx-auto px-[30px] pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 mb-12">

          <div>
            <div className="mb-4">
              <Logo variant="white" href="/" width={140} height={40} />
            </div>
            <p className="text-[#828282] text-sm leading-relaxed max-w-[220px] mb-5">
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
                  className="text-[#828282] hover:text-[#ffb401] transition-colors duration-200"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white text-sm font-bold mb-4">{title}</h3>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[#828282] text-sm no-underline hover:text-white transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-white text-sm font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 list-none p-0 m-0">
              {CONTACT_INFO.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-2.5 text-[#828282] text-[13px]">
                  <Icon size={15} className="text-[#ffb401] flex-shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1f2d3a] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#828282] text-[13px] m-0">
            © 2026 PRIME STAY Sri Lanka. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Sitemap"].map(link => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className="text-[#828282] text-[13px] no-underline hover:text-white transition-colors duration-200"
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