"use client"

import { useState, useEffect, useMemo } from "react"
import { useCart } from "@/context/CartContext"
import { products as initialProducts } from "@/lib/data/products"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import {
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Wallet,
  CheckCircle2,
  Search,
  Coins,
  FileText,
  Sparkles,
  PackagePlus,
  Download,
  Gift,
  Boxes,
} from "lucide-react"
import Link from "next/link"

interface SubmittedQuoteSummary {
  invoiceNumber: string
  customerName: string
  customerDoc: string
  customerPhone: string
  customerCity: string
  paymentCondition: "CONTADO" | "CREDITO"
  paymentMethod?: string
  customNotes: string
  items: {
    id: string | number
    name: string
    brand?: string | null
    quantity: number
    price: number
  }[]
  estimatedTotal: number
  initialUsd: number
  installmentUsd: number
  whatsappUrl: string
}

export default function CotizacionPage() {
  const {
    quoteList: cart,
    addToQuote: addToCart,
    removeFromQuote: removeFromCart,
    updateQuoteQuantity: updateQuantity,
    clearQuote: clearCart,
    totalQuoteItems: totalItems,
    totalItems: directCartCount,
  } = useCart()

  // Catalog for quick-adding directly inside /cotizacion
  const [catalog, setCatalog] = useState<any[]>(initialProducts)
  const [quickSearch, setQuickSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  // Customer form state
  const [customerName, setCustomerName] = useState("")
  const [customerDoc, setCustomerDoc] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerCity, setCustomerCity] = useState("El Vigía")
  const [customNotes, setCustomNotes] = useState("")
  const [paymentCondition, setPaymentCondition] = useState<"CONTADO" | "CREDITO">("CONTADO")
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState("Binance")
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "BS" | "BINANCE" | "EUR">("USD")

  // Rates
  const [rates, setRates] = useState({
    usdToBs: 65.5,
    binanceToBs: 78.9,
    eurToBs: 71.2,
    defaultInitialPercent: 40,
    defaultInstallments: 3,
    defaultFrequencyDays: 14,
  })

  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [submittedQuote, setSubmittedQuote] = useState<SubmittedQuoteSummary | null>(null)

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data)
        }
      })
      .catch(() => {})

    fetch("/api/erp?public=true&syncRates=true")
      .then(res => res.json())
      .then(data => {
        if (data?.settings) {
          setRates({
            usdToBs: data.settings.usdToBs || 65.5,
            binanceToBs: data.settings.binanceToBs || 78.9,
            eurToBs: data.settings.eurToBs || 71.2,
            defaultInitialPercent: data.settings.defaultInitialPercent || 40,
            defaultInstallments: data.settings.defaultInstallments || 3,
            defaultFrequencyDays: data.settings.defaultFrequencyDays || 14,
          })
        }
      })
      .catch(() => {})
  }, [])

  const formatMoney = (usdPrice: number) => {
    if (displayCurrency === "BS") {
      return `Bs. ${(usdPrice * rates.usdToBs).toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    if (displayCurrency === "BINANCE") {
      return `Bs. ${(usdPrice * rates.binanceToBs).toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    if (displayCurrency === "EUR") {
      const eurVal = usdPrice * (rates.usdToBs / rates.eurToBs)
      return `€${eurVal.toFixed(2)}`
    }
    return `$${usdPrice.toFixed(2)}`
  }

  const categories = useMemo(() => {
    const cats = new Set(catalog.map(p => p.category).filter(Boolean))
    return ["Todos", ...Array.from(cats).sort()]
  }, [catalog])

  const quickCatalogResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase()
    return catalog
      .filter(p => {
        const matchesCat = selectedCategory === "Todos" || p.category === selectedCategory
        if (!matchesCat) return false
        if (!q) return true
        return (
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.brand || "").toLowerCase().includes(q) ||
          String(p.sku || "").toLowerCase().includes(q) ||
          String(p.category || "").toLowerCase().includes(q)
        )
      })
      .slice(0, 8)
  }, [catalog, quickSearch, selectedCategory])

  // Calculate total if prices exist
  const estimatedTotal = cart.reduce((sum, item) => {
    const p =
      typeof item.price === "number"
        ? item.price
        : parseFloat(String(item.price || "0").replace(/[^0-9.]/g, "")) || 0
    return sum + p * item.quantity
  }, 0)

  const initialUsd = Number((estimatedTotal * (rates.defaultInitialPercent / 100)).toFixed(2))
  const remainingUsd = Number((estimatedTotal - initialUsd).toFixed(2))
  const installmentUsd = Number((remainingUsd / (rates.defaultInstallments || 3)).toFixed(2))

  const buildWhatsAppUrl = (params: {
    invoiceNumber: string
    name: string
    doc: string
    phone: string
    city: string
    condition: "CONTADO" | "CREDITO"
    paymentMethod?: string
    notes: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    initUsd: number
    instUsd: number
  }) => {
    const itemsList =
      params.items.length > 0
        ? params.items
            .map(
              item =>
                `• ${item.name} x${item.quantity} und.${
                  item.price > 0 ? ` ($${(item.price * item.quantity).toFixed(2)})` : ""
                }`
            )
            .join("\n")
        : "• Solicitud de Cotización / Proyecto Personalizado"

    const text =
      `*SOLICITUD DE COTIZACIÓN #${params.invoiceNumber} - SERVICIOS SP*\n` +
      `👤 *Cliente:* ${params.name}\n` +
      `🪪 *CI/RIF:* ${params.doc || "No especificado"}\n` +
      `📞 *Teléfono:* ${params.phone || "No especificado"}\n` +
      `📍 *Ubicación:* ${params.city}\n` +
      `💳 *Modalidad de Pago:* ${
        params.condition === "CREDITO"
          ? `Financiado en Cuotas (${rates.defaultInitialPercent}% inicial + ${rates.defaultInstallments} cuotas cada ${rates.defaultFrequencyDays} días)`
          : "De Contado"
      }\n` +
      `💵 *Método de Pago Preferido:* ${params.paymentMethod || "Efectivo"}\n\n` +
      `📦 *Equipos / Requerimiento:*\n${itemsList}\n` +
      (params.notes ? `\n📝 *Detalles / Proyecto:* ${params.notes}\n` : "") +
      (params.total > 0
        ? `\n💰 *Total Estimado:* $${params.total.toFixed(2)} USD\n` +
          `🇻🇪 *Ref. BCV:* Bs. ${(params.total * rates.usdToBs).toFixed(2)} | *Binance:* Bs. ${(params.total * rates.binanceToBs).toFixed(2)}\n` +
          (params.condition === "CREDITO"
            ? `🔹 *Inicial (${rates.defaultInitialPercent}%):* $${params.initUsd.toFixed(2)} USD\n` +
              `🔹 *${rates.defaultInstallments} Cuotas de:* $${params.instUsd.toFixed(2)} USD c/${rates.defaultFrequencyDays} días\n`
            : "")
        : "") +
      `\nQuedo atento a su confirmación para procesar la cotización.`

    return `https://wa.me/584147550091?text=${encodeURIComponent(text)}`
  }

  const handleDownloadPdf = (quote: SubmittedQuoteSummary) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    // Header
    doc.setFillColor(4, 17, 36)
    doc.rect(0, 0, 210, 38, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("SERVICIOS Y SUMINISTROS SP, C.A.", 15, 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(210, 210, 210)
    doc.text("RIF: J-40403649-0 | El Vigía, Mérida, Venezuela | Tel: 0414-7550091", 15, 23)
    doc.text(
      `Tasa BCV: Bs. ${rates.usdToBs.toFixed(2)} | Tasa Binance: Bs. ${rates.binanceToBs.toFixed(2)}`,
      15,
      29
    )

    doc.setFillColor(255, 98, 0)
    doc.rect(145, 10, 50, 10, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(`COTIZACIÓN ${quote.invoiceNumber}`, 149, 16.5)

    // Client Info
    doc.setTextColor(4, 17, 36)
    doc.setFontSize(12)
    doc.text("DATOS DEL CLIENTE", 15, 50)
    doc.setDrawColor(220, 220, 220)
    doc.line(15, 52, 195, 52)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(`Cliente / Empresa: ${quote.customerName}`, 15, 60)
    doc.text(`CI / RIF: ${quote.customerDoc || "N/A"}`, 15, 66)
    doc.text(`Teléfono: ${quote.customerPhone || "N/A"}`, 115, 60)
    doc.text(`Ciudad: ${quote.customerCity}`, 115, 66)
    doc.text(
      `Modalidad: ${
        quote.paymentCondition === "CREDITO"
          ? `Financiado en Cuotas (${rates.defaultInitialPercent}% Inicial + ${rates.defaultInstallments} cuotas)`
          : "Pago de Contado"
      } | Método de Pago: ${quote.paymentMethod || "Efectivo"}`,
      15,
      72
    )

    // Items Table
    let y = 84
    doc.setFillColor(4, 17, 36)
    doc.rect(15, y, 180, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Descripción del Equipo / Servicio", 18, y + 5.5)
    doc.text("Cant.", 135, y + 5.5)
    doc.text("P. Unit ($)", 152, y + 5.5)
    doc.text("Subtotal ($)", 175, y + 5.5)

    y += 10
    doc.setTextColor(50, 50, 50)
    doc.setFont("helvetica", "normal")

    quote.items.forEach(item => {
      if (y > 245) {
        doc.addPage()
        y = 20
      }
      const lineName = item.name.length > 62 ? item.name.slice(0, 62) + "..." : item.name
      doc.text(lineName, 18, y + 4)
      doc.text(String(item.quantity), 137, y + 4)
      doc.text(item.price > 0 ? `$${item.price.toFixed(2)}` : "A consultar", 152, y + 4)
      doc.text(
        item.price > 0 ? `$${(item.price * item.quantity).toFixed(2)}` : "A consultar",
        175,
        y + 4
      )
      doc.setDrawColor(240, 240, 240)
      doc.line(15, y + 7, 195, y + 7)
      y += 9
    })

    if (quote.customNotes) {
      y += 4
      doc.setFont("helvetica", "bold")
      doc.text("Requerimiento / Observaciones:", 15, y)
      doc.setFont("helvetica", "normal")
      const splitNotes = doc.splitTextToSize(quote.customNotes, 175)
      doc.text(splitNotes, 15, y + 5)
      y += 6 + splitNotes.length * 4
    }

    // Totals
    y += 8
    doc.setFillColor(245, 247, 250)
    doc.rect(110, y, 85, quote.paymentCondition === "CREDITO" ? 34 : 22, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(4, 17, 36)
    doc.text(
      `Total USD: $${quote.estimatedTotal.toFixed(2)}`,
      115,
      y + 8
    )
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(
      `Equiv. BCV: Bs. ${(quote.estimatedTotal * rates.usdToBs).toFixed(2)}`,
      115,
      y + 15
    )

    if (quote.paymentCondition === "CREDITO" && quote.estimatedTotal > 0) {
      doc.setTextColor(255, 98, 0)
      doc.setFont("helvetica", "bold")
      doc.text(
        `Inicial (${rates.defaultInitialPercent}%): $${quote.initialUsd.toFixed(2)} USD`,
        115,
        y + 23
      )
      doc.text(
        `${rates.defaultInstallments} Cuotas de: $${quote.installmentUsd.toFixed(2)} USD`,
        115,
        y + 29
      )
    }

    doc.save(`Cotizacion_SP_${quote.invoiceNumber}.pdf`)
  }

  const handleSendQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg("")

    if (!customerName.trim()) {
      setErrorMsg("Por favor ingresa tu nombre o empresa para procesar la cotización.")
      return
    }

    if (cart.length === 0 && !customNotes.trim()) {
      setErrorMsg(
        "Por favor selecciona al menos un equipo del buscador o escribe tu requerimiento en el campo de detalles."
      )
      return
    }

    setSending(true)

    const itemsPayload = cart.map(i => {
      const p =
        typeof i.price === "number"
          ? i.price
          : parseFloat(String(i.price || "0").replace(/[^0-9.]/g, "")) || 0
      return {
        id: i.id,
        name: i.name,
        brand: i.brand || "SP",
        quantity: i.quantity,
        price: p,
      }
    })

    const planNote =
      paymentCondition === "CREDITO"
        ? `Modalidad: FINANCIADO EN CUOTAS (${rates.defaultInitialPercent}% Inicial: $${initialUsd} + ${rates.defaultInstallments} cuotas de $${installmentUsd} cada ${rates.defaultFrequencyDays} días)`
        : "Modalidad: PAGO DE CONTADO"

    const combinedNotes = [planNote, customNotes.trim()].filter(Boolean).join(" | ")
    let generatedInvoice = `COT-${Date.now().toString().slice(-6)}`

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${customerName.trim()} (${customerCity.trim() || "El Vigía"})`,
          customerDoc: customerDoc.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          paymentCondition,
          notes: combinedNotes,
          items: itemsPayload,
          total: estimatedTotal,
        }),
      })

      if (res.ok) {
        const saved = await res.json()
        if (saved?.invoiceNumber) {
          generatedInvoice = saved.invoiceNumber
        }
      }
    } catch (err) {
      console.error("Error al registrar cotización en base de datos:", err)
    }

    const whatsappUrl = buildWhatsAppUrl({
      invoiceNumber: generatedInvoice,
      name: customerName.trim(),
      doc: customerDoc.trim(),
      phone: customerPhone.trim(),
      city: customerCity.trim() || "El Vigía",
      condition: paymentCondition,
      paymentMethod: preferredPaymentMethod,
      notes: customNotes.trim(),
      items: itemsPayload,
      total: estimatedTotal,
      initUsd: initialUsd,
      instUsd: installmentUsd,
    })

    const summary: SubmittedQuoteSummary = {
      invoiceNumber: generatedInvoice,
      customerName: customerName.trim(),
      customerDoc: customerDoc.trim(),
      customerPhone: customerPhone.trim(),
      customerCity: customerCity.trim() || "El Vigía",
      paymentCondition,
      paymentMethod: preferredPaymentMethod,
      customNotes: customNotes.trim(),
      items:
        itemsPayload.length > 0
          ? itemsPayload
          : [
              {
                id: "custom",
                name: customNotes.trim() || "Solicitud de Cotización Personalizada",
                brand: "SP",
                quantity: 1,
                price: 0,
              },
            ],
      estimatedTotal,
      initialUsd,
      installmentUsd,
      whatsappUrl,
    }

    setSubmittedQuote(summary)
    clearCart()
    setSending(false)
  }

  // ============================================================================
  // PANTALLA DE CONFIRMACIÓN DE COTIZACIÓN ENVIADA
  // ============================================================================
  if (submittedQuote) {
    return (
      <div className="bg-background min-h-screen py-20 px-4">
        <div className="max-w-3xl mx-auto glass-dark rounded-[3rem] border border-green-500/30 p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
              Comprobante #{submittedQuote.invoiceNumber}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              ¡Cotización Registrada con Éxito!
            </h1>
            <p className="text-white/70 max-w-xl text-base">
              Tu solicitud ya fue registrada en el sistema de <strong>Servicios y Suministros SP</strong>. Puedes descargar tu comprobante en PDF o enviarlo directamente a nuestro WhatsApp de atención inmediata.
            </p>
          </div>

          {/* Resumen de la Cotización */}
          <div className="bg-[#020813]/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-white/10 pb-4">
              <div>
                <span className="text-white/40 uppercase font-bold block">Cliente / Empresa</span>
                <strong className="text-white text-sm">{submittedQuote.customerName}</strong>
              </div>
              <div>
                <span className="text-white/40 uppercase font-bold block">Ubicación / Teléfono</span>
                <strong className="text-white text-sm">
                  {submittedQuote.customerCity}{" "}
                  {submittedQuote.customerPhone ? `· ${submittedQuote.customerPhone}` : ""}
                </strong>
              </div>
              <div>
                <span className="text-white/40 uppercase font-bold block">Modalidad Elegida</span>
                <strong className="text-secondary text-sm">
                  {submittedQuote.paymentCondition === "CREDITO"
                    ? `En Cuotas (${rates.defaultInitialPercent}% Inicial + ${rates.defaultInstallments} cuotas)`
                    : "Pago de Contado"}
                </strong>
              </div>
              {submittedQuote.estimatedTotal > 0 && (
                <div>
                  <span className="text-white/40 uppercase font-bold block">Monto Total Estimado</span>
                  <strong className="text-green-400 font-mono text-base">
                    ${submittedQuote.estimatedTotal.toFixed(2)} USD{" "}
                    <span className="text-xs text-white/50">
                      (Bs. {(submittedQuote.estimatedTotal * rates.usdToBs).toFixed(2)} BCV)
                    </span>
                  </strong>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Equipos / Requerimientos Incluidos
              </div>
              {submittedQuote.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs bg-white/[0.03] px-4 py-2.5 rounded-xl border border-white/5"
                >
                  <span className="font-bold text-white">
                    {item.name} <span className="text-secondary">x{item.quantity}</span>
                  </span>
                  <span className="font-mono text-green-400">
                    {item.price > 0
                      ? `$${(item.price * item.quantity).toFixed(2)}`
                      : "Precio a confirmar"}
                  </span>
                </div>
              ))}
              {submittedQuote.customNotes && (
                <div className="text-xs text-white/70 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <strong className="text-secondary">Notas adicionales:</strong> {submittedQuote.customNotes}
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción Directa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={submittedQuote.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-green-900/30 flex items-center justify-center gap-3 text-sm transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-6 h-6" /> Enviar Ahora por WhatsApp
            </a>

            <button
              type="button"
              onClick={() => handleDownloadPdf(submittedQuote)}
              className="h-16 bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 text-sm transition-all hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" /> Descargar Cotización PDF
            </button>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setSubmittedQuote(null)}
              className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-secondary transition-colors"
            >
              ← Realizar otra cotización
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Header */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al catálogo completo
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Centro de <span className="text-secondary">Cotización</span>
            </h1>
            <p className="text-white/70 mt-3 text-base md:text-lg max-w-2xl">
              Selecciona tus equipos o describe tu proyecto, elige entre pago de contado o en cuotas ({rates.defaultInitialPercent}% inicial + {rates.defaultInstallments} cuotas cada {rates.defaultFrequencyDays} días) y obtén tu presupuesto formal en PDF.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50">¿Prefieres compra directa inmediata?</span>
              <Link
                href="/carrito"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-secondary/20 border border-white/15 hover:border-secondary/40 text-white font-bold text-xs transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-secondary" />
                <span>Ir al Carrito de Compras {directCartCount > 0 ? `(${directCartCount})` : ""}</span>
              </Link>
            </div>
          </div>

          {/* Multi-currency Switcher */}
          <div className="bg-[#041124]/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl shrink-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-secondary" /> Moneda de Cotización
            </div>
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              {(["USD", "BS", "BINANCE", "EUR"] as const).map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setDisplayCurrency(curr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    displayCurrency === curr
                      ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {curr === "USD"
                    ? "$ USD"
                    : curr === "BS"
                    ? "Bs. (BCV)"
                    : curr === "BINANCE"
                    ? "Bs. (Binance)"
                    : "€ EUR"}
                </button>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-white/60 font-mono text-center flex flex-wrap justify-center gap-2">
              <span>
                BCV: <strong className="text-green-400">Bs. {rates.usdToBs.toFixed(2)}</strong>
              </span>
              <span>|</span>
              <span>
                Binance: <strong className="text-amber-400">Bs. {rates.binanceToBs.toFixed(2)}</strong>
              </span>
              <span>|</span>
              <span>
                EUR: <strong className="text-blue-400">Bs. {rates.eurToBs.toFixed(2)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-[-40px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Selected Items + Quick Catalog Selector + Custom Project Notes */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Selected Products List */}
            <div className="glass-dark rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.03]">
                <h2 className="font-black text-foreground uppercase tracking-[0.15em] text-xs flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-secondary" /> Equipos en tu Solicitud ({totalItems})
                </h2>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[10px] font-black text-red-400 uppercase tracking-[0.15em] hover:text-red-300 transition-colors"
                  >
                    Vaciar lista
                  </button>
                )}
              </div>

              {cart.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {cart.map(item => {
                    const p =
                      typeof item.price === "number"
                        ? item.price
                        : parseFloat(String(item.price || "0")) || 0
                    return (
                      <div
                        key={String(item.id)}
                        className="p-6 flex flex-col sm:flex-row items-center gap-5 group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-foreground shrink-0 border border-white/10 relative overflow-hidden p-2">
                          {item.image && item.image !== "/placeholder-product.png" ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xl font-black uppercase opacity-20">
                              {(item.brand || "SP")[0]}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                            <span>{item.brand || "SP"} · {item.category}</span>
                            {(item as any).isBundle && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                KIT / COMBO
                              </span>
                            )}
                          </p>
                          <h3 className="font-black text-foreground text-base leading-snug mb-1">
                            {item.name}
                          </h3>
                          {p > 0 ? (
                            <div className="text-xs font-mono font-bold text-green-400">
                              {formatMoney(p)} c/u{" "}
                              <span className="text-white/40 ml-1">
                                (Subtotal: {formatMoney(p * item.quantity)})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400 font-bold">
                              Precio a confirmar por asesor
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-[#020813] p-1.5 rounded-2xl border border-white/10">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-secondary transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center font-black text-foreground text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-secondary transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <p className="text-sm text-white/70 font-medium">
                    Aún no has agregado equipos específicos a tu lista.
                  </p>
                  <p className="text-xs text-white/40">
                    Puedes <strong>agregar equipos usando el buscador rápido de abajo</strong> o escribir directamente tu requerimiento en el formulario para recibir una cotización personalizada.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Quick Add Products Directly from /cotizacion */}
            <div className="glass-dark rounded-[2.5rem] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <PackagePlus className="w-5 h-5 text-secondary" /> Agregar Equipos Rápidamente
                  </h3>
                  <p className="text-xs text-white/50">
                    Busca y añade equipos del catálogo sin salir de esta página
                  </p>
                </div>
                <Link
                  href="/productos"
                  className="text-xs font-black text-secondary hover:underline uppercase tracking-wider"
                >
                  Ver catálogo completo →
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={e => setQuickSearch(e.target.value)}
                    placeholder="Buscar inversor, batería, cámara, panel, lámpara..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-secondary"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-[#041124] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-secondary"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#041124]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {quickCatalogResults.map(prod => {
                  const priceNum = Number(prod.price) || 0
                  const inCart = cart.find(c => String(c.id) === String(prod.id))
                  return (
                    <div
                      key={String(prod.id)}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] font-black text-secondary uppercase truncate">
                            {prod.category}
                          </span>
                          {prod.isBundle && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shrink-0">
                              KIT
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white truncate" title={prod.name}>
                          {prod.name}
                        </div>
                        <div className="text-xs font-mono text-green-400 font-bold mt-0.5">
                          {priceNum > 0 ? formatMoney(priceNum) : "A consultar"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        className="px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {inCart ? `(${inCart.quantity})` : "Añadir"}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Payment Modality + Client Form + Submit */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSendQuote}
              className="glass-dark p-6 sm:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl sticky top-28 space-y-6"
            >
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
                  1. Modalidad de Pago
                </h2>
                <div className="h-1 w-12 bg-secondary rounded-full"></div>
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
                  <Wallet className="w-5 h-5 text-secondary mb-1.5" />
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
                  <CreditCard className="w-5 h-5 text-secondary mb-1.5" />
                  <div className="text-xs font-black uppercase">En Cuotas</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {rates.defaultInitialPercent}% inicial + {rates.defaultInstallments} cuotas
                  </div>
                </button>
              </div>

              {/* Método de Pago Selector */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                  Método de Pago Preferido
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: "Binance", label: "🟡 Binance", desc: "USDT Cripto" },
                    { id: "Pago Móvil", label: "📲 Pago Móvil", desc: "Bolívares BCV" },
                    { id: "Transferencia Bancaria", label: "🏦 Transferencia", desc: "Bancos Nac." },
                    { id: "Efectivo", label: "💵 Efectivo", desc: "USD / Bs en tienda" },
                    { id: "Zelle", label: "⚡ Zelle", desc: "Dólares USA" },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreferredPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        preferredPaymentMethod === m.id
                          ? "bg-secondary/20 border-secondary text-white shadow-lg shadow-secondary/15 ring-1 ring-secondary/50"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="font-bold text-xs">{m.label}</div>
                      <div className="text-[10px] text-white/40">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              {estimatedTotal > 0 && (
                <div className="bg-[#020813]/80 p-5 rounded-2xl border border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-bold">Total Estimado ({displayCurrency}):</span>
                    <span className="font-mono font-black text-green-400 text-lg">
                      {formatMoney(estimatedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/50">
                    <span>Ref. BCV / Binance:</span>
                    <span className="font-mono">
                      Bs. {(estimatedTotal * rates.usdToBs).toFixed(2)} | Bs.{" "}
                      {(estimatedTotal * rates.binanceToBs).toFixed(2)}
                    </span>
                  </div>

                  {paymentCondition === "CREDITO" && (
                    <div className="pt-3 border-t border-white/10 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-secondary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Plan ¡Llévatelo hoy y paga después!
                      </div>
                      <div className="flex justify-between text-xs text-white">
                        <span>Inicial hoy ({rates.defaultInitialPercent}%):</span>
                        <strong className="font-mono text-amber-400">
                          {formatMoney(initialUsd)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-xs text-white">
                        <span>
                          {rates.defaultInstallments} cuotas cada {rates.defaultFrequencyDays} días:
                        </span>
                        <strong className="font-mono text-secondary">
                          {formatMoney(installmentUsd)} c/u
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Client Info Inputs */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  2. Tus Datos de Contacto
                </h3>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                    Tu Nombre o Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Méndez / Inversiones Mérida C.A."
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                      Cédula o RIF
                    </label>
                    <input
                      type="text"
                      placeholder="V-12345678 / J-..."
                      value={customerDoc}
                      onChange={e => setCustomerDoc(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0414-7550091"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                      Correo (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                      Ciudad / Zona
                    </label>
                    <input
                      type="text"
                      placeholder="El Vigía, Mérida"
                      value={customerCity}
                      onChange={e => setCustomerCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                    Detalles del Proyecto / Requerimiento Adicional
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Necesito cotizar instalación completa, o busco respaldo solar para 1 nevera y 4 cámaras..."
                    value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-secondary resize-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="pt-1 space-y-3">
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full h-16 bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider rounded-2xl shadow-2xl shadow-secondary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] text-sm"
                >
                  <FileText className="w-5 h-5" />
                  {sending
                    ? "Generando Cotización..."
                    : paymentCondition === "CREDITO"
                    ? "Generar Cotización con Financiamiento"
                    : "Generar Cotización de Contado"}
                </Button>
                <p className="text-[10px] text-center text-foreground/40 uppercase tracking-widest font-bold">
                  Genera tu comprobante PDF + Envío directo a WhatsApp SP
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
