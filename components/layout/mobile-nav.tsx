"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { NavLink } from "@/types/navigation"

type MobileNavProps = {
  links: NavLink[]
  authLink: NavLink
  ctas: Array<NavLink & { variant?: "default" | "outline" }>
}

export function MobileNav({ links, authLink, ctas }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-sm tracking-[0.3em] uppercase text-brand-dark hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-white px-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="border-b border-border-strong px-6 py-4 font-serif text-lg tracking-[0.2em] text-brand-dark">
          Classic Motor Market
        </div>
        <div className="space-y-4 px-6 py-6 text-xs font-semibold uppercase tracking-[0.35em] text-brand-dark">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={authLink.href}
            className="block border-t border-border-strong pt-4"
            onClick={() => setOpen(false)}
          >
            {authLink.label}
          </Link>
          <div className="space-y-3">
            {ctas.map((cta) => (
              <Button
                key={cta.href}
                asChild
                variant={cta.variant ?? "default"}
                className="w-full uppercase tracking-[0.35em]"
                onClick={() => setOpen(false)}
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

