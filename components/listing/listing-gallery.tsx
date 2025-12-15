"use client"

import * as React from "react"
import Image from "next/image"
import { cn, getCloudflareImageUrl } from "@/lib/utils"

type GalleryMedia = {
  id: number
  providerId: string
  altText?: string | null
}

export function ListingGallery({ media }: { media: GalleryMedia[] }) {
  const images = media.length > 0 ? media : []
  const [activeIndex, setActiveIndex] = React.useState(0)

  const activeImage = images[activeIndex]

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-border-strong bg-card">
        {activeImage ? (
          <Image
            key={activeImage.id}
            src={getCloudflareImageUrl(activeImage.providerId)}
            alt={activeImage.altText || "Listing image"}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-text-muted px-4">
            Imagery in preparation
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden border bg-card transition min-h-[60px] sm:min-h-0",
                "touch-manipulation active:opacity-80",
                index === activeIndex ? "border-brand-gold ring-2 ring-brand-gold/20" : "border-border-soft"
              )}
              aria-label={`View image ${index + 1} of ${images.length}`}
            >
              <Image src={getCloudflareImageUrl(image.providerId)} alt={image.altText || `Gallery thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}





