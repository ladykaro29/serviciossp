const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: 'file:./prisma/dev.db'
})

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ Prisma conectado correctamente')
  } catch (err) {
    console.error('❌ Error conectando Prisma:', err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
