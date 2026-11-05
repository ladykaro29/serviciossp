import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// PUT /api/orders/[id] (Update status & sync inventory if completed)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, customerName, customerPhone } = body

    const existingOrder = await prisma.order.findUnique({ where: { id } })
    if (!existingOrder) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(customerName && { customerName }),
        ...(customerPhone && { customerPhone }),
      },
    })

    // Si pasa a Completado por primera vez desde la web, descontar stock automáticamente
    if (status === "Completado" && existingOrder.status !== "Completado") {
      try {
        const parsedItems = JSON.parse(existingOrder.items || "[]")
        if (Array.isArray(parsedItems)) {
          for (const item of parsedItems) {
            const qty = Number(item.quantity) || 1
            const product = item.id
              ? await prisma.product.findUnique({ where: { id: item.id } })
              : await prisma.product.findFirst({ where: { name: item.name } })

            if (product) {
              const newStock = Math.max(0, product.stock - qty)
              await prisma.product.update({
                where: { id: product.id },
                data: { stock: newStock },
              })
              await prisma.inventoryMovement.create({
                data: {
                  productId: product.id,
                  productName: product.name,
                  type: "SALIDA",
                  quantity: qty,
                  previousStock: product.stock,
                  newStock,
                  unitCost: product.costPrice,
                  reference: existingOrder.invoiceNumber || `ORD-${existingOrder.id.slice(-6).toUpperCase()}`,
                  notes: `Venta web completada - Cliente: ${existingOrder.customerName}`,
                },
              })
            }
          }
        }
      } catch (e) {
        console.error("Error deducting stock on order completion:", e)
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Error al actualizar la cotización" }, { status: 500 })
  }
}

// DELETE /api/orders/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Cotización eliminada" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Error al eliminar cotización" }, { status: 500 })
  }
}
