const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start connecting...')
  const start = Date.now()
  try {
    const count = await prisma.user.count()
    const duration = Date.now() - start
    console.log(`Successfully connected! Found ${count} users.`)
    console.log(`Query took ${duration}ms`)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()

