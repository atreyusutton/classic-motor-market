"use client"

import { useState } from "react"
import Image from "next/image"
import { getCloudflareImageUrl } from "@/lib/utils"

type MediaItem = {
  id: number
  providerId: string
  isCover: boolean
  sortOrder: number
  type: string
}

export function ListingTestGallery({ images, title }: { images: MediaItem[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const active = images[activeIdx]
  const thumbWindowStart = Math.max(0, Math.min(activeIdx - 1, images.length - 4))
  const visibleThumbs = images.slice(thumbWindowStart, thumbWindowStart + 4)

  return (
    <>
      {/* Hero image — full viewport width */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "52%",
          backgroundColor: "#888",
          overflow: "hidden",
        }}
      >
        {active && (
          <Image
            src={getCloudflareImageUrl(active.providerId)}
            alt={title}
            fill
            priority
            style={{ objectFit: "cover" }}
            sizes="100vw"
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            height: "86px",
            gap: "2px",
            backgroundColor: "#C8BC9A",
          }}
        >
          <button
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "none",
              color: "white",
              fontSize: "26px",
              width: "36px",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
            aria-label="Previous"
          >
            ‹
          </button>

          {visibleThumbs.map((img, i) => {
            const realIdx = thumbWindowStart + i
            const isActive = activeIdx === realIdx
            return (
              <div
                key={img.id}
                onClick={() => setActiveIdx(realIdx)}
                style={{
                  flex: 1,
                  position: "relative",
                  height: "86px",
                  overflow: "hidden",
                  cursor: "pointer",
                  opacity: isActive ? 1 : 0.55,
                  outline: isActive ? "3px solid #3B7A58" : "none",
                  outlineOffset: "-3px",
                  transition: "opacity 0.15s",
                }}
              >
                <Image
                  src={getCloudflareImageUrl(img.providerId)}
                  alt={`Photo ${realIdx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="25vw"
                />
              </div>
            )
          })}

          <button
            onClick={() => setActiveIdx((i) => Math.min(images.length - 1, i + 1))}
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "none",
              color: "white",
              fontSize: "26px",
              width: "36px",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
