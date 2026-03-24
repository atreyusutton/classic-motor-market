import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCloudflareImageUrl, generateListingSlug } from "@/lib/utils"
import { ListingTestGallery } from "./gallery"

export const dynamic = "force-dynamic"

// ─── Design tokens (1:1 match to partner PDF) ─────────────────────────────────
const C = {
  bg: "#E0D8BC",            // warm parchment — page background
  bar: "#1B2E23",           // dark forest green — announcement bar + footer
  accent: "#3B7A58",        // mid teal green — price, active states
  text: "#1A1A1A",          // near-black — primary text
  muted: "#666",            // muted text
  sectionBg: "#C8BD9C",     // darker tan — member listings section
  footerBg: "#191F19",      // very dark — footer
  btnDark: "#253028",       // dark fill — contact seller button
  thumbBg: "#C8BC9A",       // thumbnail strip background
}

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const CONDITION_LABELS: Record<string, string> = {
  show_car: "SHOW CAR",
  driver: "DRIVER",
  it_runs: "IT RUNS",
  project: "PROJECT",
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ListingTestPage() {
  // Pick the most recent active listing that has at least one image
  const listing = await prisma.listing.findFirst({
    where: { listingStatus: "active", media: { some: {} } },
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { username: true, name: true } },
      media: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!listing) notFound()

  // Other listings for the Member Listings grid (up to 9)
  const otherListings = await prisma.listing.findMany({
    where: {
      listingStatus: { in: ["active", "sold"] },
      id: { not: listing.id },
      media: { some: {} },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 9,
    include: { media: { orderBy: { sortOrder: "asc" } } },
  })

  const images = listing.media.filter((m) => m.type === "image")
  const title = `${listing.year ?? ""} ${listing.make ?? ""} ${listing.model ?? ""}`.trim().toUpperCase()
  const sellerHandle = (listing.seller.username || listing.seller.name?.split(" ")[0] || "seller").toUpperCase()
  const conditionLabel = listing.conditionGrade ? CONDITION_LABELS[listing.conditionGrade] ?? listing.conditionGrade.toUpperCase() : "—"

  const fmtPrice = (cents: number | null) =>
    cents != null ? `$${cents.toLocaleString("en-US")}` : "—"

  const fmtMiles = (m: number | null) =>
    m != null ? `${m.toLocaleString("en-US")}K` : "—"

  return (
    <div style={{ backgroundColor: C.bg, fontFamily: FONT, color: C.text, minHeight: "100vh" }}>

      {/* ── Announcement bar ──────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: C.bar,
          color: "white",
          textAlign: "center",
          padding: "7px 16px",
          fontSize: "10.5px",
          fontWeight: 500,
          letterSpacing: "0.14em",
          lineHeight: 1.5,
        }}
      >
        FUELFED CLASSIC MOTOR MARKET POP-UP: MAY 15, 2026 &nbsp;/&nbsp; AT 2028 LEIGH NORTHBROOK &nbsp;/&nbsp; 9:00 TO 11:00AM
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav
        style={{
          backgroundColor: C.bg,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: `1px solid rgba(0,0,0,0.12)`,
        }}
      >
        {/* Hamburger */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", cursor: "pointer", marginRight: "4px" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: "block", width: "18px", height: "2px", backgroundColor: C.text }} />
          ))}
        </div>

        {/* Logo */}
        <Link href="/">
          <Image
            src="/assets/cmm-logo-blue.png"
            alt="Classic Motor Market"
            width={44}
            height={44}
            style={{ height: "38px", width: "auto", display: "block" }}
          />
        </Link>

        <div style={{ flex: 1 }} />

        {/* Nav links */}
        {[
          { label: "LOG IN", href: "/login" },
          { label: "BECOME A MEMBER", href: "/register" },
          { label: "BROWSE VEHICLES", href: "/listings" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              textDecoration: "none",
              color: C.text,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.13em",
            }}
          >
            {label}
          </Link>
        ))}

        {/* Search icon */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.text}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ cursor: "pointer", marginLeft: "4px" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </nav>

      {/* ── Hero + Thumbnail gallery (full-width) ─────────────────── */}
      <ListingTestGallery images={images} title={title} />

      {/* ── Detail content ────────────────────────────────────────── */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 24px" }}>

        {/* Title + Price */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "20px 0 10px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: 900,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </h1>
          <span
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: C.accent,
              letterSpacing: "0.05em",
            }}
          >
            {fmtPrice(listing.askingPrice)}
          </span>
        </div>

        {/* Seller / Location row */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            flexWrap: "wrap",
            borderTop: "1px solid rgba(0,0,0,0.18)",
            borderBottom: "1px solid rgba(0,0,0,0.18)",
            padding: "9px 0",
            fontSize: "10.5px",
            letterSpacing: "0.13em",
          }}
        >
          <span>
            <strong>SELLER:</strong> {sellerHandle}
          </span>
          <span>
            <strong>LOCATION:</strong> {(listing.location ?? "—").toUpperCase()}
          </span>
        </div>

        {/* Specs grid — 3 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "6px 28px",
            padding: "16px 0",
            fontSize: "10.5px",
            letterSpacing: "0.1em",
          }}
        >
          {[
            ["MILES", fmtMiles(listing.mileage)],
            ["ENGINE", (listing.engine ?? "—").toUpperCase()],
            ["OVERALL CONDITION", conditionLabel],
            ["PAINT", (listing.exteriorColor ?? "—").toUpperCase()],
            ["TRANS", (listing.transmission ?? "—").toUpperCase()],
            ["BODY", conditionLabel],
            ["INTERIOR", (listing.interiorColorMaterial ?? "—").toUpperCase()],
            ["LOCATION", (listing.location ?? "—").toUpperCase()],
            ["MECHANICALS", "EXCELLENT"],
          ].map(([label, value]) => (
            <div key={label}>
              <strong>{label}:</strong> {value}
            </div>
          ))}
        </div>

        {/* Description */}
        {(listing.vehicleHistory || listing.optionsAndFeatures || listing.maintenanceHistory) && (
          <div
            style={{
              fontSize: "13px",
              lineHeight: "1.75",
              color: C.text,
              maxWidth: "780px",
              marginBottom: "20px",
            }}
          >
            {listing.vehicleHistory && <p style={{ margin: "0 0 12px" }}>{listing.vehicleHistory}</p>}
            {listing.optionsAndFeatures && <p style={{ margin: "0 0 12px" }}>{listing.optionsAndFeatures}</p>}
            {listing.maintenanceHistory && <p style={{ margin: "0" }}>{listing.maintenanceHistory}</p>}
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
          <button
            style={{
              backgroundColor: C.btnDark,
              color: "white",
              border: "none",
              padding: "10px 22px",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              cursor: "pointer",
              textTransform: "uppercase",
              fontFamily: FONT,
            }}
          >
            CONTACT SELLER
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: C.text,
              border: `1.5px solid ${C.text}`,
              padding: "10px 22px",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              cursor: "pointer",
              textTransform: "uppercase",
              fontFamily: FONT,
            }}
          >
            REPORT LISTING
          </button>
        </div>
      </div>

      {/* ── Full photo grid ───────────────────────────────────────── */}
      {images.length > 1 && (
        <div style={{ maxWidth: "1080px", margin: "0 auto 48px", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "3px",
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  paddingBottom: "75%",
                  overflow: "hidden",
                  backgroundColor: "#bbb",
                }}
              >
                <Image
                  src={getCloudflareImageUrl(img.providerId)}
                  alt={`${title} photo ${i + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 1080px) 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Member Listings section ───────────────────────────────── */}
      <div style={{ backgroundColor: C.sectionBg, padding: "52px 24px 48px" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>

          {/* Section heading */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "17px",
                fontWeight: 900,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              MEMBER LISTINGS
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.2em",
                color: C.muted,
                textTransform: "uppercase",
              }}
            >
              VEHICLES FROM OUR COLLECTORS AND MEMBERS
            </p>
          </div>

          {/* 3-column listing grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {otherListings.map((l) => {
              const cover = l.media.find((m) => m.isCover) || l.media[0]
              const lTitle = `${l.year ?? ""} ${l.make ?? ""} ${l.model ?? ""}`.trim()
              const specsLine = [
                l.mileage ? `${l.mileage.toLocaleString()}K MILES` : null,
                l.transmission ? l.transmission.toUpperCase() : null,
                l.location ? l.location.toUpperCase() : null,
              ]
                .filter(Boolean)
                .join(" / ")

              return (
                <Link
                  key={l.id}
                  href={generateListingSlug(l)}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  {/* Card image */}
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "72%",
                      overflow: "hidden",
                      backgroundColor: "#aaa",
                      marginBottom: "10px",
                    }}
                  >
                    {cover ? (
                      <Image
                        src={getCloudflareImageUrl(cover.providerId)}
                        alt={lTitle}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 1080px) 33vw"
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, backgroundColor: "#bbb" }} />
                    )}
                  </div>

                  {/* Card text */}
                  <div
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 900,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    {lTitle}
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      letterSpacing: "0.08em",
                      color: C.muted,
                      marginBottom: "5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {specsLine}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.accent,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {fmtPrice(l.askingPrice)}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "7px",
              marginTop: "36px",
              alignItems: "center",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: i === 0 ? "22px" : "7px",
                  height: "7px",
                  borderRadius: "4px",
                  backgroundColor: i === 0 ? C.bar : "#999",
                  transition: "width 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: C.footerBg, color: "rgba(255,255,255,0.85)", padding: "40px 24px 32px" }}>
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {/* Left: logo + links */}
          <div style={{ display: "flex", gap: "36px", alignItems: "flex-start" }}>
            <Image
              src="/assets/cmm-logo-white.png"
              alt="Classic Motor Market"
              width={56}
              height={56}
              style={{ height: "54px", width: "auto" }}
            />
            <div
              style={{
                fontSize: "9.5px",
                letterSpacing: "0.16em",
                lineHeight: "2.3",
                textTransform: "uppercase",
                opacity: 0.8,
              }}
            >
              {["LOG IN", "BECOME A MEMBER", "BROWSE CARS", "SELL A CAR", "ABOUT", "CONTACT", "LEGAL / PRIVACY"].map(
                (item) => (
                  <div key={item}>{item}</div>
                )
              )}
            </div>
          </div>

          {/* Right: copyright + social */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px" }}>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "0.12em",
                opacity: 0.55,
                textAlign: "right",
                lineHeight: 2,
                textTransform: "uppercase",
              }}
            >
              <div>© CLASSIC MOTOR MARKET, INC.</div>
              <div>ALL RIGHTS RESERVED</div>
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "12px", opacity: 0.7 }}>
              {/* Instagram */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
              </svg>
              {/* Facebook */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
