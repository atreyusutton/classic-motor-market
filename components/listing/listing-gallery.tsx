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
    <div className="space-y-4">
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
          <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.4em] text-text-muted">
            Imagery in preparation
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden border bg-card transition",
                index === activeIndex ? "border-brand-gold" : "border-border-soft"
              )}
            >
              <span className="sr-only">View image {index + 1}</span>
              <Image src={getCloudflareImageUrl(image.providerId)} alt={image.altText || "Gallery thumbnail"} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}





