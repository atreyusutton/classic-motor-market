import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCloudflareImageUrl } from "@/lib/utils"
import { type AdPlacement, getPlacementConfig } from "@/lib/ad-config"

export async function AdSlot({
  placement,
  className = "",
}: {
  placement: AdPlacement
  className?: string
}) {
  const ads = await prisma.ad.findMany({ where: { placement, active: true } }).catch(() => [])

  const cfg = getPlacementConfig(placement)
  const isCard = placement === "card"

  if (ads.length === 0) {
    const wrapperClass = isCard
      ? `h-full w-full overflow-hidden border border-dashed border-brand-dark/20 bg-white text-xs uppercase tracking-[0.2em] text-brand-dark/40 flex items-center justify-center ${className}`
      : `w-full overflow-hidden border border-dashed border-brand-dark/20 bg-white text-xs uppercase tracking-[0.2em] text-brand-dark/40 flex items-center justify-center ${className}`
    return (
      <div
        className={wrapperClass}
        style={isCard ? undefined : { aspectRatio: `${cfg.desktop.width} / ${cfg.desktop.height}` }}
        aria-label="Advertisement placeholder"
      >
        <span className="hidden sm:inline">Ad · {cfg.label} · {cfg.desktop.width}×{cfg.desktop.height}</span>
        <span className="sm:hidden">Ad · {cfg.mobile.width}×{cfg.mobile.height}</span>
      </div>
    )
  }

  const ad = ads[Math.floor(Math.random() * ads.length)]
  const desktopUrl = getCloudflareImageUrl(ad.desktopImageId, "public")
  const mobileUrl = getCloudflareImageUrl(ad.mobileImageId, "public")

  if (isCard) {
    return (
      <Link
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block h-full w-full overflow-hidden ${className}`}
        aria-label={`Advertisement: ${ad.name}`}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopUrl} />
          <img src={mobileUrl} alt={ad.name} className="h-full w-full object-cover" />
        </picture>
      </Link>
    )
  }

  return (
    <Link
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block w-full overflow-hidden ${className}`}
      aria-label={`Advertisement: ${ad.name}`}
    >
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet={desktopUrl}
          width={cfg.desktop.width}
          height={cfg.desktop.height}
        />
        <img
          src={mobileUrl}
          alt={ad.name}
          width={cfg.mobile.width}
          height={cfg.mobile.height}
          className="w-full h-auto block"
        />
      </picture>
    </Link>
  )
}
