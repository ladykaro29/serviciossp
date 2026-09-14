import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seeding (JSON)...')

  // 1. Crear Usuario Admin
  const adminEmail = 'admin@serviciossp.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('serviciossp2026', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador SP',
        role: 'ADMIN'
      }
    })
    console.log('Usuario administrador creado: admin@serviciossp.com / serviciossp2026')
  }

  // 2. Migrar Productos
  const count = await prisma.product.count()
  if (count === 0) {
    const productsPath = path.join(process.cwd(), 'prisma', 'products_data.json')
    if (fs.existsSync(productsPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      console.log(`Migrando ${productsData.length} productos desde JSON...`)
      
      for (const product of productsData) {
        let numericPrice = 0
        if (product.price && product.price !== 'Consultar') {
            const cleanPrice = String(product.price).replace(/[^0-9.]/g, '')
            numericPrice = parseFloat(cleanPrice) || 0
        }

        await prisma.product.create({
          data: {
            name: product.name,
            category: product.category,
            price: numericPrice,
            brand: product.brand,
            image: product.image || '/placeholder-product.png',
            description: `Producto de la categoría ${product.category} de la marca ${product.brand}`,
            isActive: true
          }
        })
      }
      console.log('Productos migrados con éxito.')
    } else {
      console.log('No se encontró el archivo products_data.json.')
    }
  } else {
    console.log('Los productos ya existen en la base de datos.')
  }

  console.log('Seeding completado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
