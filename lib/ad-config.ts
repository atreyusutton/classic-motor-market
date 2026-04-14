export type AdPlacement = "home" | "card" | "detail"

export const AD_PLACEMENTS: {
  placement: AdPlacement
  label: string
  description: string
  desktop: { width: number; height: number }
  mobile: { width: number; height: number }
}[] = [
  {
    placement: "home",
    label: "Home page banner",
    description: "Shown on the home page beneath featured vehicles.",
    desktop: { width: 1200, height: 300 },
    mobile: { width: 600, height: 400 },
  },
  {
    placement: "card",
    label: "Listing card replacement",
    description: "Replaces the 8th card on the /listings browse grid. Fills the entire card area (image + info).",
    desktop: { width: 600, height: 600 },
    mobile: { width: 600, height: 600 },
  },
  {
    placement: "detail",
    label: "Listing detail page",
    description: "Shown on a vehicle detail page between narrative and related listings.",
    desktop: { width: 970, height: 250 },
    mobile: { width: 600, height: 250 },
  },
]

export function getPlacementConfig(placement: AdPlacement) {
  return AD_PLACEMENTS.find((p) => p.placement === placement)!
}
