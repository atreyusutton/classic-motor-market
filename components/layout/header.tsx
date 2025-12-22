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
    <>
      <div className="bg-brand-dark text-white">
        <SiteContainer className="py-2 text-center text-[0.6rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] px-4">
          <span className="hidden sm:inline">FUELFED CLASSIC MOTOR MARKET POP-UP: MAY 15, 2026 / AT 2028 LEIGH NORTHBROOK / 9:00 TO 11:00AM</span>
          <span className="sm:hidden">FUELFED POP-UP: MAY 15, 2026</span>
        </SiteContainer>
      </div>
      <header className="sticky top-0 left-0 right-0 z-50 border-b border-border-strong bg-white shadow-sm">
        <SiteContainer bleed className="py-3 sm:py-4 max-w-none px-4 md:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 rounded-full p-0 text-brand-dark transition hover:bg-brand-dark/5 hover:text-brand-gold focus-visible:ring-0 focus-visible:ring-offset-0"
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
              className="flex items-center gap-2 sm:gap-3 text-brand-dark min-w-0 flex-shrink"
              aria-label="Classic Motor Market home"
            >
              <Image
                src="/assets/logo-nav.png"
                alt="Classic Motor Market logo"
                width={160}
                height={40}
                className="h-8 sm:h-10 w-auto flex-shrink-0"
                priority
              />
              <span className="font-serif text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.45em] whitespace-nowrap hidden sm:inline">
                Classic Motor Market
              </span>
            </Link>
          </div>

          <nav className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            <Link
              href={authLink.href}
              className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-brand-dark transition-colors hover:text-brand-gold whitespace-nowrap hidden sm:inline-block"
            >
              {authLink.label}
            </Link>
            {ctaLinks.map((cta, index) => (
              <Button
                key={cta.href}
                asChild
                variant={cta.variant ?? "default"}
                size={index === 0 ? "default" : "sm"}
                className="uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[0.65rem] sm:text-sm px-2 sm:px-4 h-8 sm:h-9 md:h-10"
              >
                <Link href={cta.href}>
                  <span className="hidden sm:inline">{cta.label}</span>
                  <span className="sm:hidden">{index === 0 ? (isAuthed ? "List" : "Join") : "Browse"}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </SiteContainer>
    </header>
    </>
  )
}

