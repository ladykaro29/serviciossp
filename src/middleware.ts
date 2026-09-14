import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(req: NextRequest & { nextauth?: any }) {
  const { pathname } = req.nextUrl

  // 1. Redirecciones case-sensitive para evitar bucle infinito
  const uppercaseRoutes = ["/CALCULADORA", "/Calculadora", "/PRODUCTOS", "/Productos", "/SERVICIOS", "/Servicios"]
  if (uppercaseRoutes.includes(pathname)) {
    const lowercasePath = pathname.toLowerCase()
    return NextResponse.redirect(new URL(lowercasePath, req.url), 301)
  }

  // 2. Lógica de autenticación NextAuth para rutas /admin
  if (pathname.startsWith("/admin")) {
    return withAuth(
      function (authReq) {
        // Lógica de middleware si está autenticado
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: "/admin/login",
        },
      }
    )(req as any, {} as any)
  }

  return NextResponse.next()
}

export const config = { 
  matcher: [
    "/CALCULADORA", 
    "/Calculadora", 
    "/PRODUCTOS", 
    "/Productos", 
    "/SERVICIOS", 
    "/Servicios", 
    "/admin/:path*"
  ] 
}
