import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// PUT /api/products/[id] (Update)
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
    const {
      name,
      sku,
      category,
      price,
      costPrice,
      stock,
      minStock,
      unit,
      brand,
      description,
      features,
      variants,
      isBundle,
      bundleItems,
      image,
      isActive,
    } = body

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const newStockVal = stock !== undefined ? parseInt(String(stock), 10) : existing.stock
    const featuresStr =
      features !== undefined
        ? typeof features === "string"
          ? features
          : JSON.stringify(Array.isArray(features) ? features : [])
        : undefined
    const variantsStr =
      variants !== undefined
        ? typeof variants === "string"
          ? variants
          : JSON.stringify(Array.isArray(variants) ? variants : [])
        : undefined
    const bundleItemsStr =
      bundleItems !== undefined
        ? typeof bundleItems === "string"
          ? bundleItems
          : JSON.stringify(Array.isArray(bundleItems) ? bundleItems : [])
        : undefined

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: parseFloat(price) || 0 }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) || 0 }),
        ...(stock !== undefined && { stock: newStockVal }),
        ...(minStock !== undefined && { minStock: parseInt(String(minStock), 10) || 0 }),
        ...(unit !== undefined && { unit }),
        ...(brand !== undefined && { brand }),
        ...(description !== undefined && { description }),
        ...(featuresStr !== undefined && { features: featuresStr }),
        ...(variantsStr !== undefined && { variants: variantsStr }),
        ...(isBundle !== undefined && { isBundle: Boolean(isBundle) }),
        ...(bundleItemsStr !== undefined && { bundleItems: bundleItemsStr }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    if (stock !== undefined && newStockVal !== existing.stock) {
      const diff = newStockVal - existing.stock
      await prisma.inventoryMovement.create({
        data: {
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          type: diff > 0 ? "ENTRADA" : "SALIDA",
          quantity: Math.abs(diff),
          previousStock: existing.stock,
          newStock: newStockVal,
          unitCost: updatedProduct.costPrice,
          reference: "AJUSTE-MANUAL",
          notes: "Ajuste desde edición de ficha de producto",
        },
      })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 })
  }
}

// DELETE /api/products/[id]
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

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Producto eliminado con éxito" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 })
  }
}
