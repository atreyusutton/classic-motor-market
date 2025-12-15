const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Update the first user to be an admin
  const user = await prisma.user.findFirst()
  if (user) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true }
    })
    console.log("Updated user to admin:", updatedUser)
  } else {
    console.log("No user found to update")
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

