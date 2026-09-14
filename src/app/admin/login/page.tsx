"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Credenciales incorrectas. Por favor intente de nuevo.")
      } else {
        router.push("/admin")
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020813] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-primary/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl glass-dark mb-4 border border-white/5">
            <Image 
              src="/LogoServicios-SP.png" 
              alt="Logo" 
              width={60} 
              height={60} 
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Panel Administrativo</h1>
          <p className="text-white/50 text-sm mt-2 uppercase tracking-widest font-bold">Servicios y Suministros SP</p>
        </div>

        <div className="glass-dark p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  placeholder="admin@serviciossp.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-secondary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando...
                </>
              ) : (
                "Acceder al Panel"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-white/30 text-xs font-bold uppercase tracking-widest">
          Desarrollado por Kickoff Development
        </p>
      </div>
    </div>
  )
}
