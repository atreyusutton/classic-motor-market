"use client"

import * as React from "react"
import Image from "next/image"
import { getCloudflareImageUrl } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

type GalleryMedia = {
  id: number
  providerId: string
  altText?: string | null
}

export function ListingGallery({ media, isSold }: { media: GalleryMedia[]; isSold?: boolean }) {
  const images = media.length > 0 ? media : []
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null))
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null))
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
  }, [lightboxIndex, images.length])

  if (images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-text-muted px-4">
        Imagery in preparation
      </div>
    )
  }

  return (
    <>
      <div id="gallery" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="relative aspect-[4/3] overflow-hidden bg-card cursor-pointer hover:opacity-90 transition"
          >
            <Image
              src={getCloudflareImageUrl(image.providerId)}
              alt={image.altText || `Gallery image ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition p-2"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length) }}
                className="absolute left-4 z-10 text-white/80 hover:text-white transition p-2"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length) }}
                className="absolute right-4 z-10 text-white/80 hover:text-white transition p-2"
                aria-label="Next image"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] m-auto" onClick={(e) => e.stopPropagation()}>
            <Image
              src={getCloudflareImageUrl(images[lightboxIndex].providerId)}
              alt={images[lightboxIndex].altText || `Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
