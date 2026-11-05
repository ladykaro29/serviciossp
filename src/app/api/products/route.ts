import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {}
    if (!all) {
      where.isActive = true
    }
    if (category && category !== "Todos") {
      where.category = category
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

// POST /api/products (Create)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, sku, category, price, costPrice, stock, minStock, unit, brand, description, image, isActive } = body

    if (!name || !category) {
      return NextResponse.json({ error: "El nombre y la categoría son requeridos" }, { status: 400 })
    }

    const initialStock = stock !== undefined ? parseInt(String(stock), 10) || 0 : 15
    const parsedCost = parseFloat(costPrice) || 0

    const newProduct = await prisma.product.create({
      data: {
        sku: sku || `SP-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        category,
        price: parseFloat(price) || 0,
        costPrice: parsedCost,
        stock: initialStock,
        minStock: minStock !== undefined ? parseInt(String(minStock), 10) || 3 : 3,
        unit: unit || "UND",
        brand: brand || "",
        description: description || "",
        image: image || "/placeholder-product.png",
        isActive: isActive ?? true,
      },
    })

    if (initialStock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: newProduct.id,
          productName: newProduct.name,
          type: "ENTRADA",
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          unitCost: parsedCost,
          reference: "INV-INICIAL",
          notes: "Inventario inicial al crear producto",
        },
      })
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 })
  }
}
