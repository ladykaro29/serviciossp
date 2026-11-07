import { NextResponse } from "next/server"

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
]

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API Key no configurada en el servidor" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { prompt, systemInstruction } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "El campo 'prompt' es requerido" },
        { status: 400 }
      )
    }

    let lastError = null

    // Intentar con la lista de modelos compatibles en orden
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

        const payload: any = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }],
          }
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({
            success: true,
            model,
            text: data.candidates[0].content.parts[0].text,
          })
        } else {
          lastError = data?.error?.message || "Respuesta inválida de Gemini"
        }
      } catch (err: any) {
        lastError = err?.message || "Error al conectar con Gemini"
      }
    }

    return NextResponse.json(
      { error: `Error al generar con Gemini: ${lastError}` },
      { status: 502 }
    )
  } catch (error: any) {
    console.error("Error en /api/ai:", error)
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
  const projectId = process.env.GOOGLE_PROJECT_ID || "300699477972"

  return NextResponse.json({
    status: isConfigured ? "configured" : "missing_key",
    provider: "Google Gemini API",
    projectId,
    defaultModel: "gemini-3.5-flash-lite",
  })
}
