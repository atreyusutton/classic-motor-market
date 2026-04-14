import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const events = [
  {
    title: "COFFEE & CLASSICS® BARRINGTON: MAY 2, 2026 / AT FOUNDRY PARK / BARRINGTON, IL / 8:00 TO 10:00AM",
    shortTitle: "C&C BARRINGTON: MAY 2, 2026",
    date: new Date("2026-05-02T08:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® HINSDALE: MAY 9, 2026 / AT BURLINGTON PARK / HINSDALE, IL / 8:00 TO 10:00AM",
    shortTitle: "C&C HINSDALE: MAY 9, 2026",
    date: new Date("2026-05-09T08:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® WINNETKA: MAY 16, 2026 / AT HUBBARD WOODS / WINNETKA, IL / 8:00 TO 10:00AM",
    shortTitle: "C&C WINNETKA: MAY 16, 2026",
    date: new Date("2026-05-16T08:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® MILWAUKEE: MAY 30, 2026 / AT HISTORIC THIRD WARD / MILWAUKEE, WI / 9:00 TO 11:00AM",
    shortTitle: "C&C MILWAUKEE: MAY 30, 2026",
    date: new Date("2026-05-30T09:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® MICHIGAN: JUNE 6, 2026 / AT WOODWARD AVENUE / BIRMINGHAM, MI / 8:00 TO 10:00AM",
    shortTitle: "C&C MICHIGAN: JUNE 6, 2026",
    date: new Date("2026-06-06T08:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® BOULDER: JUNE 13, 2026 / AT PEARL STREET / BOULDER, CO / 9:00 TO 11:00AM",
    shortTitle: "C&C BOULDER: JUNE 13, 2026",
    date: new Date("2026-06-13T09:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® PHILLY: JUNE 20, 2026 / AT NAVY YARD / PHILADELPHIA, PA / 8:00 TO 10:00AM",
    shortTitle: "C&C PHILLY: JUNE 20, 2026",
    date: new Date("2026-06-20T08:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® DOOR COUNTY: JULY 11, 2026 / AT SISTER BAY WATERFRONT / SISTER BAY, WI / 9:00 TO 11:00AM",
    shortTitle: "C&C DOOR COUNTY: JULY 11, 2026",
    date: new Date("2026-07-11T09:00:00"),
  },
  {
    title: "COFFEE & CLASSICS® FORT LAUDERDALE: JANUARY 17, 2027 / AT LAS OLAS BOULEVARD / FORT LAUDERDALE, FL / 8:00 TO 10:00AM",
    shortTitle: "C&C FT. LAUDERDALE: JAN 17, 2027",
    date: new Date("2027-01-17T08:00:00"),
  },
]

async function main() {
  const existingTitles = new Set(
    (await prisma.event.findMany({ select: { title: true } })).map((e) => e.title),
  )
  const toCreate = events.filter((e) => !existingTitles.has(e.title))
  if (toCreate.length === 0) {
    console.log("All Coffee & Classics events already present.")
    return
  }
  const created = await prisma.event.createMany({
    data: toCreate.map((e) => ({ ...e, active: true })),
  })
  console.log(`Created ${created.count} new event(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
