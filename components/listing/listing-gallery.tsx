"use client"

import * as React from "react"
import Image from "next/image"
import { cn, getCloudflareImageUrl } from "@/lib/utils"

type GalleryMedia = {
  id: number
  providerId: string
  altText?: string | null
}

export function ListingGallery({ media, isSold }: { media: GalleryMedia[]; isSold?: boolean }) {
  const images = media.length > 0 ? media : []

  if (images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text-muted px-4">
        Imagery in preparation
      </div>
    )
  }

  return (
    <div id="gallery" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-[4/3] overflow-hidden bg-card"
        >
          <Image
            src={getCloudflareImageUrl(image.providerId)}
            alt={image.altText || `Gallery image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
