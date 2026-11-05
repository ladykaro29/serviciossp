import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/solar-leads (Admin only)
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

    const leads = await prisma.solarLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error("Error fetching solar leads:", error)
    return NextResponse.json({ error: "Error al obtener prospectos solares" }, { status: 500 })
  }
}

// POST /api/solar-leads (Public - from Solar Calculator)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerCity,
      propertyType,
      dailyKwh,
      inverterCapacity,
      panelsCount,
      batteryCapacityAh,
      priceMin,
      priceMax,
    } = body

    if (!customerName) {
      return NextResponse.json({ error: "Nombre del cliente es requerido" }, { status: 400 })
    }

    const newLead = await prisma.solarLead.create({
      data: {
        customerName,
        customerPhone: customerPhone || "",
        customerCity: customerCity || "El Vigía",
        propertyType: propertyType || "Residencial",
        dailyKwh: parseFloat(dailyKwh) || 0,
        inverterCapacity: parseFloat(inverterCapacity) || 0,
        panelsCount: parseInt(panelsCount) || 0,
        batteryCapacityAh: parseFloat(batteryCapacityAh) || 0,
        priceMin: parseFloat(priceMin) || 0,
        priceMax: parseFloat(priceMax) || 0,
        status: "Nuevo",
      },
    })

    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error("Error creating solar lead:", error)
    return NextResponse.json({ error: "Error al registrar prospecto solar" }, { status: 500 })
  }
}
