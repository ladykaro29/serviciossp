import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/orders (Admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status && status !== "Todos") {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 })
  }
}

// POST /api/orders (Public - Client submits quotation from cart)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, items, total } = body

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Nombre del cliente y lista de ítems son requeridos." },
        { status: 400 }
      )
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone: customerPhone || "",
        status: "Recibido",
        total: parseFloat(total) || 0,
        items: JSON.stringify(items),
      },
    })

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error al registrar la cotización" }, { status: 500 })
  }
}
