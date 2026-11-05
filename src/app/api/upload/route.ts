import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo de imagen" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitizar extensión y generar nombre único
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const ext = path.extname(originalName) || ".png"
    const baseName = path.basename(originalName, ext).slice(0, 32)
    const fileName = `${Date.now()}_${baseName}${ext}`

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
      await mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      return NextResponse.json({
        success: true,
        url: `/uploads/products/${fileName}`,
      })
    } catch {
      // Fallback en entornos serverless de solo lectura: retornar Data URI base64
      const mimeType = file.type || "image/png"
      const base64Url = `data:${mimeType};base64,${buffer.toString("base64")}`
      return NextResponse.json({
        success: true,
        url: base64Url,
      })
    }
  } catch (error) {
    console.error("Error al subir imagen:", error)
    return NextResponse.json({ error: "Error al procesar la imagen subida" }, { status: 500 })
  }
}

