import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Menu } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { NavLink } from "@/types/navigation"

import { SiteContainer } from "./site-container"

type CtaLink = NavLink & {
  variant?: "default" | "outline"
}

export async function Header() {
  const session = await auth()
  const isAuthed = Boolean(session?.user)

  const menuLinks: NavLink[] = [
    { label: "Browse Vehicles", href: "/listings" },
    { label: "List a Vehicle", href: "/sell" },
    { label: "Become a Member", href: "/register" },
    { label: "Contact", href: "/contact" },
    isAuthed
      ? { label: session?.user?.name ?? session?.user?.email ?? "Account", href: "/account" }
      : { label: "Log In", href: "/login" },
  ]

  const authLink: NavLink = isAuthed
    ? {
        label: session?.user?.name ?? session?.user?.email ?? "Account",
        href: "/account",
      }
    : { label: "Log In", href: "/login" }

  const ctaLinks: CtaLink[] = isAuthed
    ? [
        { label: "List Vehicle", href: "/sell", variant: "default" }, // brand blue/primary
        { label: "Browse Vehicles", href: "/listings", variant: "outline" }, // outline (previous style)
      ]
    : [
        { label: "Become a Member", href: "/register", variant: "default" }, // brand blue/primary
        { label: "Browse Vehicles", href: "/listings", variant: "outline" }, // outline (previous style)
      ]

  return (
    <header className="border-b border-border-strong bg-page/95">
      <div className="bg-brand-dark text-white">
        <SiteContainer className="py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.4em]">
          FUELFED CLASSIC MOTOR MARKET POP-UP: MAY 15, 2026 / AT 2028 LEIGH
          NORTHBROOK / 9:00 TO 11:00AM
        </SiteContainer>
      </div>
      <SiteContainer bleed className="py-4 max-w-none px-4 md:px-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 shrink-0 rounded-full p-0 text-brand-dark transition hover:bg-brand-dark/5 hover:text-brand-gold focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-label="Open quick links"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 border border-brand-dark/20 bg-page/95 p-2 text-brand-dark shadow-2xl ring-1 ring-brand-dark/25 backdrop-blur"
                align="start"
              >
                <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.4em] text-brand-dark">
                  Quick Links
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-brand-dark/30" />
                {menuLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.href}
                    asChild
                    className="text-[0.7rem] uppercase tracking-[0.35em]"
                  >
                    <Link
                      href={link.href}
                      className="flex w-full items-center justify-between gap-2 text-brand-dark"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-brand-dark/70" />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/"
              className="flex items-center gap-3 text-brand-dark"
              aria-label="Classic Motor Market home"
            >
              <Image
                src="/assets/logo-nav.png"
                alt="Classic Motor Market logo"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="font-serif text-sm uppercase tracking-[0.3em] sm:text-base sm:tracking-[0.45em] whitespace-nowrap">
                Classic Motor Market
              </span>
            </Link>
          </div>

          <nav className="flex items-center justify-end gap-3 sm:gap-4">
            <Link
              href={authLink.href}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-dark transition-colors hover:text-brand-gold whitespace-nowrap"
            >
              {authLink.label}
            </Link>
            {ctaLinks.map((cta) => (
              <Button
                key={cta.href}
                asChild
                variant={cta.variant ?? "default"}
                className="uppercase tracking-[0.35em]"
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </SiteContainer>
    </header>
  )
}

