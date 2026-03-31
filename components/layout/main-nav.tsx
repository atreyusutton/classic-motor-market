"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { NavLink } from "@/types/navigation"

export function MainNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-brand-dark lg:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "transition-colors hover:text-brand-dark",
            pathname === link.href ? "text-brand-dark" : "text-text-muted"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

