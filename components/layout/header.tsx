import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, LogOut, Menu } from "lucide-react"

import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
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

export async function Header() {
  const session = await auth()
  const isAuthed = Boolean(session?.user)

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  let events = await prisma.event
    .findMany({
      where: { active: true, date: { gte: oneDayAgo } },
      orderBy: { date: "asc" },
    })
    .catch(() => [] as Array<{ id: number; title: string; shortTitle: string | null; date: Date }>)

  if (events.length === 0) {
    const next = await prisma.event
      .findFirst({
        where: { date: { gte: oneDayAgo } },
        orderBy: { date: "asc" },
      })
      .catch(() => null)
    if (next) events = [next]
  }

  const fallbackLong = "FUELFED CLASSIC MOTOR MARKET POP-UP: MAY 15, 2026 / AT 2028 LEIGH / NORTHBROOK, IL / 9:00 TO 11:00AM"
  const fallbackShort = "FUELFED POP-UP: MAY 15, 2026"
  const longText = events.length === 0 ? fallbackLong : events.map((e) => e.title).join(" • ")
  const shortText =
    events.length === 0
      ? fallbackShort
      : events.map((e) => e.shortTitle || e.title).join(" • ")

  const menuLinks: NavLink[] = [
    { label: "Browse Vehicles", href: "/listings" },
    { label: "List a Vehicle", href: "/sell" },
    ...(!isAuthed ? [{ label: "Become a Member", href: "/register" }] : []),
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    isAuthed
      ? { label: session?.user?.name ?? session?.user?.email ?? "Account", href: "/account" }
      : { label: "Log In", href: "/login" },
  ]

  // Always-visible CTA next to hamburger
  const headerCta = isAuthed
    ? { label: "List Vehicle", href: "/sell" }
    : { label: "Become a Member", href: "/register" }

  return (
    <>
      <div className="bg-brand-dark text-white overflow-hidden">
          <SiteContainer className="py-2 text-center text-[0.6rem] min-[800px]:text-[0.68rem] font-semibold uppercase tracking-[0.15em] min-[800px]:tracking-[0.2em] px-4 whitespace-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden min-[1080px]:inline">{longText}</span>
            <span className="min-[1080px]:hidden">{shortText}</span>
          </SiteContainer>
        </div>
      <header className="sticky top-0 left-0 right-0 z-50 border-b border-border-strong bg-white shadow-sm">
        <SiteContainer bleed className="py-2 min-[800px]:py-4 max-w-none px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Logo + site name — always visible */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-3 text-brand-dark min-w-0 flex-shrink-0"
              aria-label="Classic Motor Market home"
            >
              <Image
                src="/assets/logo-nav.png"
                alt="Classic Motor Market logo"
                width={160}
                height={40}
                className="h-7 min-[800px]:h-10 w-auto flex-shrink-0"
                priority
              />
              <span className="font-serif font-bold text-[0.65rem] sm:text-sm md:text-base uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.22em] whitespace-nowrap">
                Classic Motor Market
              </span>
            </Link>

            {/* Right: CTA button + hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {!isAuthed && (
                <Link
                  href="/login"
                  className="hidden min-[800px]:inline-flex items-center uppercase tracking-[0.18em] text-[0.7rem] font-semibold text-brand-dark hover:text-brand-gold transition-colors px-2 h-9 md:h-10"
                >
                  Log In
                </Link>
              )}
              <Button
                asChild
                variant="outline"
                className="hidden min-[800px]:inline-flex uppercase tracking-[0.18em] text-[0.7rem] px-4 h-9 md:h-10 border-brand-dark text-brand-dark bg-white hover:bg-brand-dark/5 hover:text-brand-dark"
              >
                <Link href="/listings">Browse Vehicles</Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="hidden min-[800px]:inline-flex uppercase tracking-[0.18em] text-[0.7rem] px-4 h-9 md:h-10"
              >
                <Link href={headerCta.href}>{headerCta.label}</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 shrink-0 rounded-full p-0 text-brand-dark transition hover:bg-brand-dark/5 hover:text-brand-gold focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border border-brand-dark/20 bg-white p-2 text-brand-dark shadow-2xl ring-1 ring-brand-dark/25"
                  align="end"
                >
                  <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.2em] text-brand-dark">
                    Menu
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-brand-dark/30" />
                  {menuLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.href}
                      asChild
                      className="text-[0.7rem] uppercase tracking-[0.18em]"
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
                  {isAuthed && (
                    <>
                      <DropdownMenuSeparator className="bg-brand-dark/30" />
                      <form
                        action={async () => {
                          "use server"
                          await signOut({ redirectTo: "/" })
                        }}
                      >
                        <button
                          type="submit"
                          className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span>Sign Out</span>
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SiteContainer>
      </header>
    </>
  )
}

