const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    const count = await prisma.solarLead.count()
    console.log('✅ Prisma conectado correctamente. SolarLeads en DB:', count)
  } catch (err) {
    console.error('❌ Error conectando Prisma:', err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
