import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// PUT /api/solar-leads/[id] (Update status or notes)
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
    const { status, notes } = body

    const updatedLead = await prisma.solarLead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("Error updating solar lead:", error)
    return NextResponse.json({ error: "Error al actualizar prospecto" }, { status: 500 })
  }
}

// DELETE /api/solar-leads/[id]
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

    await prisma.solarLead.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Prospecto eliminado" })
  } catch (error) {
    console.error("Error deleting solar lead:", error)
    return NextResponse.json({ error: "Error al eliminar prospecto" }, { status: 500 })
  }
}
