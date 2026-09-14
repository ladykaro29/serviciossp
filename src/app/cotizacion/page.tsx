"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, MessageCircle, ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CotizacionPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerCity, setCustomerCity] = useState("El Vigía")
  const [sending, setSending] = useState(false)

  const handleSendQuote = async () => {
    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre para procesar la cotización.")
      return
    }

    setSending(true)

    // Calculate total if prices exist
    const estimatedTotal = cart.reduce((sum, item) => {
      const p = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0
      return sum + p * item.quantity
    }, 0)

    try {
      // 1. Guardar en base de datos para el administrador
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${customerName} (${customerCity})`,
          customerPhone,
          items: cart.map(i => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            brand: i.brand,
          })),
          total: estimatedTotal,
        }),
      })
    } catch (e) {
      console.error("Error al registrar cotización en base de datos:", e)
    }

    // 2. Enviar a WhatsApp de Servicios SP
    const itemsList = cart.map(item => `- ${item.name} x${item.quantity} und.`).join("\n")
    const message = encodeURIComponent(
      `*SOLICITUD DE COTIZACIÓN - SERVICIOS SP*\n` +
      `👤 *Cliente:* ${customerName}\n` +
      `📞 *Teléfono:* ${customerPhone || "No especificado"}\n` +
      `📍 *Ubicación:* ${customerCity}\n\n` +
      `📦 *Equipos Solicitados:*\n${itemsList}\n\n` +
      `Quedo atento a la disponibilidad y presupuesto formal.`
    )

    window.open(`https://wa.me/584147550091?text=${message}`, "_blank")
    clearCart()
    setSending(false)
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-background">
        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <ShoppingBag className="w-10 h-10 text-secondary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">Tu lista está vacía</h1>
        <p className="text-foreground/50 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Aún no has seleccionado equipos para tu proyecto. Explora nuestro catálogo de élite y comienza a construir tu autonomía.
        </p>
        <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-black px-12 h-16 rounded-2xl uppercase tracking-widest shadow-2xl shadow-secondary/20 transition-all hover:scale-105" asChild>
          <Link href="/productos">Ir al Catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Header */}
      <div className="bg-primary text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/productos" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Tu <span className="text-secondary">Solicitud</span></h1>
          <p className="text-white/60 mt-4 text-xl max-w-2xl">Revisa los equipos seleccionados y solicita tu cotización técnica de inmediato.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-[-60px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-dark rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="font-black text-foreground uppercase tracking-[0.2em] text-[10px]">Equipos Seleccionados ({totalItems})</h2>
                <button onClick={clearCart} className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:text-red-400 transition-colors">Vaciar lista</button>
              </div>
              <div className="divide-y divide-white/5">
                {cart.map((item) => (
                  <div key={item.id} className="p-8 flex flex-col sm:flex-row items-center gap-8 group hover:bg-white/[0.02] transition-colors">
                    {/* Placeholder for Product Image */}
                    <div className="w-28 h-28 bg-white/5 rounded-[2rem] flex items-center justify-center text-foreground group-hover:scale-105 transition-all duration-500 shrink-0 border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="text-2xl font-black uppercase opacity-20 relative z-10">{item.brand[0]}</span>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">{item.brand}</p>
                      <h3 className="font-black text-foreground text-xl leading-tight mb-2 group-hover:text-secondary transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-[10px] text-foreground/40 uppercase tracking-widest font-black bg-white/5 px-3 py-1 rounded-full">{item.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 bg-[#020813] p-2 rounded-2xl border border-white/5 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-secondary transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-black text-foreground text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-secondary transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Side */}
          <div className="lg:col-span-1">
            <div className="glass-dark p-10 rounded-[3rem] border border-white/5 shadow-2xl sticky top-28 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Resumen de Cotización</h2>
                <div className="h-1.5 w-12 bg-secondary rounded-full"></div>
                <p className="text-foreground/50 text-sm leading-relaxed italic">
                  Al solicitar tu cotización, uno de nuestros especialistas validará existencias y tiempos de instalación.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Total de Unidades</span>
                  <span className="font-black text-foreground text-lg">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/40 font-black uppercase tracking-widest text-[10px]">Técnico Asignado</span>
                  <span className="font-black text-secondary">Inmediato</span>
                </div>
              </div>

              {/* Client Info Inputs */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1.5">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Méndez"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1.5">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="0414-..."
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1.5">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      placeholder="El Vigía"
                      value={customerCity}
                      onChange={e => setCustomerCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <Button 
                  onClick={handleSendQuote}
                  disabled={sending}
                  className="w-full h-20 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.1em] rounded-[1.5rem] shadow-2xl shadow-green-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg"
                >
                  <MessageCircle className="w-7 h-7" /> {sending ? "Procesando..." : "Enviar a WhatsApp"}
                </Button>
                <p className="text-[9px] text-center text-foreground/30 uppercase tracking-[0.3em] font-black">
                  Soporte prioritario 24/7
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

