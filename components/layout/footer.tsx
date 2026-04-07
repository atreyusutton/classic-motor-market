import Link from "next/link"
import Image from "next/image"
import { SiteContainer } from "./site-container"

const footerLinks = [
  {
    title: "Club",
    items: [
      { label: "Browse Vehicles", href: "/listings" },
      { label: "List Your Vehicle", href: "/sell" },
      { label: "Become a Member", href: "/register" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-brand-dark text-text-inverse">
      <SiteContainer className="py-12">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image src="/assets/cmm-logo-white.png" alt="Classic Motor Market" fill className="object-contain" />
              </div>
              <div className="font-serif text-lg font-bold uppercase tracking-[0.1em]">Classic Motor Market</div>
            </div>
            <p className="font-serif text-sm text-text-inverse/70 max-w-md leading-relaxed">
              A member driven club for European motoring enthusiasts. A curated marketplace, member to member sales,
              and remarkable vehicles.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-brand-gold font-bold">{group.title}</p>
              <ul className="mt-4 space-y-2 font-serif text-sm tracking-[0.08em] text-text-inverse/70">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-text-inverse transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-text-inverse/20 pt-6 font-serif text-xs tracking-[0.1em] text-text-inverse/60">
          © {new Date().getFullYear()} Classic Motor Market · Private Listing Club
        </div>
      </SiteContainer>
    </footer>
  )
}
