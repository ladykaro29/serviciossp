"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, MessageCircle, ArrowLeft, ShoppingBag, CreditCard, Wallet, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function CotizacionPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerDoc, setCustomerDoc] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerCity, setCustomerCity] = useState("El Vigía")
  const [paymentCondition, setPaymentCondition] = useState<"CONTADO" | "CREDITO">("CONTADO")
  const [rates, setRates] = useState({
    usdToBs: 65.5,
    defaultInitialPercent: 40,
    defaultInstallments: 3,
    defaultFrequencyDays: 14,
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch("/api/erp?public=true")
      .then(res => res.json())
      .then(data => {
        if (data?.settings) {
          setRates({
            usdToBs: data.settings.usdToBs || 65.5,
            defaultInitialPercent: data.settings.defaultInitialPercent || 40,
            defaultInstallments: data.settings.defaultInstallments || 3,
            defaultFrequencyDays: data.settings.defaultFrequencyDays || 14,
          })
        }
      })
      .catch(() => {})
  }, [])

  // Calculate total if prices exist
  const estimatedTotal = cart.reduce((sum, item) => {
    const p = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0
    return sum + p * item.quantity
  }, 0)

  const initialUsd = Number((estimatedTotal * (rates.defaultInitialPercent / 100)).toFixed(2))
  const remainingUsd = Number((estimatedTotal - initialUsd).toFixed(2))
  const installmentUsd = Number((remainingUsd / (rates.defaultInstallments || 3)).toFixed(2))

  const handleSendQuote = async () => {
    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre para procesar la solicitud.")
      return
    }

    setSending(true)

    const planNote =
      paymentCondition === "CREDITO"
        ? `Modalidad solicitada: FINANCIADO EN CUOTAS (${rates.defaultInitialPercent}% Inicial: $${initialUsd} + ${rates.defaultInstallments} cuotas de $${installmentUsd} cada ${rates.defaultFrequencyDays} días)`
        : "Modalidad solicitada: PAGO DE CONTADO"

    try {
      // 1. Guardar en base de datos para el administrador
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${customerName} (${customerCity})`,
          customerDoc,
          customerPhone,
          paymentCondition,
          notes: planNote,
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
      `*SOLICITUD DE PEDIDO / COTIZACIÓN - SERVICIOS SP*\n` +
        `👤 *Cliente:* ${customerName}\n` +
        `🪪 *CI/RIF:* ${customerDoc || "No especificado"}\n` +
        `📞 *Teléfono:* ${customerPhone || "No especificado"}\n` +
        `📍 *Ubicación:* ${customerCity}\n` +
        `💳 *Modalidad de Pago:* ${
          paymentCondition === "CREDITO"
            ? `En Cuotas (${rates.defaultInitialPercent}% inicial + ${rates.defaultInstallments} cuotas cada ${rates.defaultFrequencyDays} días)`
            : "De Contado"
        }\n\n` +
        `📦 *Equipos Solicitados:*\n${itemsList}\n\n` +
        (estimatedTotal > 0
          ? `💰 *Total Estimado:* $${estimatedTotal.toFixed(2)} USD (Bs. ${(estimatedTotal * rates.usdToBs).toFixed(2)})\n` +
            (paymentCondition === "CREDITO"
              ? `🔹 *Inicial (${rates.defaultInitialPercent}%):* $${initialUsd.toFixed(2)} USD\n` +
                `🔹 *${rates.defaultInstallments} Cuotas de:* $${installmentUsd.toFixed(2)} USD c/${rates.defaultFrequencyDays} días\n\n`
              : `\n`)
          : `\n`) +
        `Quedo atento a la confirmación para procesar el pedido.`
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
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">
          Tu lista está vacía
        </h1>
        <p className="text-foreground/50 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Aún no has seleccionado equipos para tu proyecto. Explora nuestro catálogo de élite y comienza a construir tu autonomía.
        </p>
        <Button
          size="lg"
          className="bg-secondary hover:bg-secondary/90 text-white font-black px-12 h-16 rounded-2xl uppercase tracking-widest shadow-2xl shadow-secondary/20 transition-all hover:scale-105"
          asChild
        >
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
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Tu <span className="text-secondary">Solicitud</span>
          </h1>
          <p className="text-white/60 mt-4 text-xl max-w-2xl">
            Elige cómo pagar: de contado o financiado en cuotas ({rates.defaultInitialPercent}% de inicial + {rates.defaultInstallments} cuotas cada {rates.defaultFrequencyDays} días).
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-[-60px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-dark rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="font-black text-foreground uppercase tracking-[0.2em] text-[10px]">
                  Equipos Seleccionados ({totalItems})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:text-red-400 transition-colors"
                >
                  Vaciar lista
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {cart.map(item => {
                  const p = typeof item.price === "number" ? item.price : parseFloat(String(item.price)) || 0
                  return (
                    <div
                      key={item.id}
                      className="p-8 flex flex-col sm:flex-row items-center gap-8 group hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-foreground group-hover:scale-105 transition-all duration-500 shrink-0 border border-white/5 relative overflow-hidden">
                        <span className="text-2xl font-black uppercase opacity-20 relative z-10">
                          {(item.brand || "SP")[0]}
                        </span>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">
                          {item.brand}
                        </p>
                        <h3 className="font-black text-foreground text-xl leading-tight mb-2 group-hover:text-secondary transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <span className="text-[10px] text-foreground/40 uppercase tracking-widest font-black bg-white/5 px-3 py-1 rounded-full">
                            {item.category}
                          </span>
                          {p > 0 && (
                            <span className="text-xs font-mono font-bold text-green-400">
                              ${p.toFixed(2)} c/u
                            </span>
                          )}
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
                          <span className="w-8 text-center font-black text-foreground text-lg">
                            {item.quantity}
                          </span>
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
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Side */}
          <div className="lg:col-span-1">
            <div className="glass-dark p-8 rounded-[3rem] border border-white/5 shadow-2xl sticky top-28 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
                  Modalidad de Pago
                </h2>
                <div className="h-1.5 w-12 bg-secondary rounded-full"></div>
              </div>

              {/* Payment Condition Selector: Contado vs En Cuotas */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentCondition("CONTADO")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentCondition === "CONTADO"
                      ? "bg-secondary/15 border-secondary text-white shadow-lg shadow-secondary/10"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  <Wallet className="w-5 h-5 text-secondary mb-2" />
                  <div className="text-xs font-black uppercase">De Contado</div>
                  <div className="text-[10px] opacity-70 mt-0.5">Pago único inmediato</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCondition("CREDITO")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentCondition === "CREDITO"
                      ? "bg-secondary/15 border-secondary text-white shadow-lg shadow-secondary/10"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-secondary mb-2" />
                  <div className="text-xs font-black uppercase">En Cuotas</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {rates.defaultInitialPercent}% inicial + {rates.defaultInstallments} cuotas
                  </div>
                </button>
              </div>

              {/* Financial Breakdown */}
              {estimatedTotal > 0 && (
                <div className="bg-[#020813]/80 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-bold">Total Equipos (USD):</span>
                    <span className="font-mono font-black text-green-400 text-lg">
                      ${estimatedTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/50">
                    <span>Equivalente en Bolívares (BCV):</span>
                    <span className="font-mono">
                      Bs. {(estimatedTotal * rates.usdToBs).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {paymentCondition === "CREDITO" && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Plan ¡Llévatelo hoy y paga después!
                      </div>
                      <div className="flex justify-between text-xs text-white">
                        <span>Inicial hoy ({rates.defaultInitialPercent}%):</span>
                        <strong className="font-mono text-amber-400">${initialUsd.toFixed(2)} USD</strong>
                      </div>
                      <div className="flex justify-between text-xs text-white">
                        <span>{rates.defaultInstallments} cuotas cada {rates.defaultFrequencyDays} días:</span>
                        <strong className="font-mono text-secondary">${installmentUsd.toFixed(2)} USD c/u</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Client Info Inputs */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                    Tu Nombre o Empresa *
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

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                    Cédula o RIF
                  </label>
                  <input
                    type="text"
                    placeholder="V-12345678 / J-40403649-0"
                    value={customerDoc}
                    onChange={e => setCustomerDoc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
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

              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleSendQuote}
                  disabled={sending}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.1em] rounded-[1.5rem] shadow-2xl shadow-green-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  <MessageCircle className="w-6 h-6" />{" "}
                  {sending
                    ? "Procesando..."
                    : paymentCondition === "CREDITO"
                    ? "Solicitar con Financiamiento"
                    : "Solicitar de Contado"}
                </Button>
                <p className="text-[9px] text-center text-foreground/30 uppercase tracking-[0.3em] font-black">
                  Soporte prioritario 24/7 · Servicios y Suministros SP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
