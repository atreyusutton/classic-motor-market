const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const listings = await prisma.listing.findMany({
    include: { media: true }
  })
  console.log("Listings in DB:", JSON.stringify(listings, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

