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

// POST /api/orders (Public - Client submits quotation from /cotizacion)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerDoc,
      customerEmail,
      paymentCondition,
      notes,
      items,
      total,
    } = body

    if (!customerName || String(customerName).trim() === "") {
      return NextResponse.json(
        { error: "El nombre del cliente es obligatorio." },
        { status: 400 }
      )
    }

    const normalizedItems = Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            id: "custom-quote",
            name: notes ? `Cotización Personalizada: ${String(notes).slice(0, 80)}` : "Solicitud de Cotización General",
            quantity: 1,
            price: Number(total) || 0,
            brand: "SP",
          },
        ]

    const parsedTotal = parseFloat(total) || 0
    const prefix = body.orderType === "ORDER" ? "ORD" : "COT"
    const invoiceNumber = body.invoiceNumber || `${prefix}-${Date.now().toString().slice(-6)}`

    try {
      const newOrder = await prisma.order.create({
        data: {
          invoiceNumber,
          customerName: String(customerName).trim(),
          customerDoc: customerDoc ? String(customerDoc).trim() : "",
          customerPhone: customerPhone ? String(customerPhone).trim() : "",
          status: "Recibido",
          paymentCondition: paymentCondition || "CONTADO",
          subtotal: parsedTotal,
          total: parsedTotal,
          items: JSON.stringify(normalizedItems),
          notes: [
            customerEmail ? `Email: ${customerEmail}` : "",
            notes ? String(notes).trim() : "",
          ]
            .filter(Boolean)
            .join(" | "),
        },
      })

      return NextResponse.json(newOrder, { status: 201 })
    } catch (dbErr) {
      console.warn("Fallback creating order with minimal fields:", dbErr)
      // Fallback in case an older SQLite database lacks newer optional columns
      const minimalOrder = await prisma.order.create({
        data: {
          customerName: String(customerName).trim(),
          customerPhone: customerPhone ? String(customerPhone).trim() : "",
          status: "Recibido",
          total: parsedTotal,
          items: JSON.stringify(normalizedItems),
        },
      })
      return NextResponse.json({ ...minimalOrder, invoiceNumber }, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error al registrar la cotización" }, { status: 500 })
  }
}
