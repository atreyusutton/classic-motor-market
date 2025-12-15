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
                <Image src="/assets/logo.png" alt="Classic Motor Market" fill className="object-contain" />
              </div>
              <div className="font-serif text-xl uppercase tracking-[0.4em]">Classic Motor Market</div>
            </div>
            <p className="text-sm text-text-inverse/70 max-w-md leading-relaxed">
              The private club for European motoring enthusiasts. Editorial storytelling, discreet conversations,
              and a curated marketplace for remarkable automobiles.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="font-serif text-xs uppercase tracking-[0.4em] text-brand-gold">{group.title}</p>
              <ul className="mt-4 space-y-2 text-sm uppercase tracking-[0.3em] text-text-inverse/70">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-text-inverse">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-text-inverse/20 pt-6 text-xs uppercase tracking-[0.4em] text-text-inverse/60">
          © {new Date().getFullYear()} Classic Motor Market · Private Listing Club
        </div>
      </SiteContainer>
    </footer>
  )
}
