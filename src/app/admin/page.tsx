import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#020813] p-8 text-white">
      <div className="max-w-4xl mx-auto mt-10">
        <h1 className="text-4xl font-black mb-4">Panel Administrativo</h1>
        <div className="glass-dark p-8 rounded-3xl border border-white/10">
          <p className="text-xl">¡Bienvenido, <span className="text-secondary font-bold">{session.user?.email}</span>!</p>
          <p className="mt-4 text-white/50">El dashboard y las funciones de administración aún están en construcción. Aquí se añadirán las pantallas para gestionar productos, servicios, y más.</p>
        </div>
      </div>
    </div>
  )
}
