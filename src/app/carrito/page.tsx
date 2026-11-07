"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  MessageCircle,
  FileText,
  ShieldCheck,
  Package,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react"

interface OrderConfirmation {
  invoiceNumber: string
  customerName: string
  customerPhone: string
  customerDoc: string
  customerEmail: string
  deliveryType: "TIENDA" | "ENVIO"
  deliveryAddress: string
  paymentMethod: string
  notes: string
  items: any[]
  totalUsd: number
  totalBs: number
  whatsappUrl: string
}

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, cartSubtotal, totalQuoteItems } = useCart()

  // Exchange rates
  const [rates, setRates] = useState({
    usdToBs: 65.5,
    binanceToBs: 78.9,
  })

  // Customer & checkout state
  const [customerName, setCustomerName] = useState("")
  const [customerDoc, setCustomerDoc] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryType, setDeliveryType] = useState<"TIENDA" | "ENVIO">("TIENDA")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("PAGO_MOVIL")
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null)

  // Fetch live rates
  useEffect(() => {
    fetch("/api/erp?public=true&syncRates=true")
      .then(res => res.json())
      .then(data => {
        if (data?.settings) {
          setRates({
            usdToBs: data.settings.usdToBs || 65.5,
            binanceToBs: data.settings.binanceToBs || 78.9,
          })
        }
      })
      .catch(() => {})
  }, [])

  const totalBs = cartSubtotal * rates.usdToBs

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (cart.length === 0) {
      setErrorMsg("El carrito está vacío.")
      return
    }

    if (!customerName.trim()) {
      setErrorMsg("Por favor ingresa tu nombre completo o razón social.")
      return
    }

    if (!customerPhone.trim()) {
      setErrorMsg("Por favor ingresa tu número de teléfono / WhatsApp para contactarte.")
      return
    }

    if (deliveryType === "ENVIO" && !deliveryAddress.trim()) {
      setErrorMsg("Por favor indica la dirección o agencia de envío (MRW, Tealca, Zoom).")
      return
    }

    setLoading(true)

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    const paymentMethodLabels: Record<string, string> = {
      PAGO_MOVIL: "Pago Móvil / Transferencia VES",
      BINANCE: "Binance Pay / USDT",
      ZELLE: "Zelle USD",
      EFECTIVO: "Efectivo USD (en Tienda)",
      PUNTO: "Punto de Venta VES (en Tienda)",
    }
    const paymentLabel = paymentMethodLabels[paymentMethod] || paymentMethod

    const orderPayload = {
      orderType: "ORDER",
      invoiceNumber: orderNumber,
      customerName: customerName.trim(),
      customerDoc: customerDoc.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      paymentCondition: "CONTADO",
      paymentMethod: paymentLabel,
      total: cartSubtotal,
      notes: [
        `Despacho: ${deliveryType === "TIENDA" ? "Retiro en Tienda SP (El Vigía)" : `Envío Nacional a: ${deliveryAddress}`}`,
        `Método de Pago: ${paymentLabel}`,
        notes.trim() ? `Observaciones: ${notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      items: cart.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
      })),
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "No se pudo registrar el pedido.")
      }

      // Build WhatsApp message link
      const itemsListText = cart
        .map(
          item =>
            `• *${item.name}* (x${item.quantity}) - $${((Number(item.price) || 0) * item.quantity).toFixed(2)}`
        )
        .join("\n")

      const waText =
        `*🛒 NUEVO PEDIDO #${orderNumber} - SERVICIOS SP*\n` +
        `👤 *Cliente:* ${customerName.trim()}\n` +
        `🪪 *Cédula/RIF:* ${customerDoc.trim() || "No especificado"}\n` +
        `📞 *Teléfono:* ${customerPhone.trim()}\n` +
        `🚚 *Entrega:* ${deliveryType === "TIENDA" ? "Retiro en Tienda (El Vigía, Mérida)" : `Envío a: ${deliveryAddress.trim()}`}\n` +
        `💳 *Método de Pago:* ${paymentLabel}\n\n` +
        `📦 *Productos en Pedido:*\n${itemsListText}\n\n` +
        `💰 *TOTAL A PAGAR:*\n` +
        `💵 *USD:* $${cartSubtotal.toFixed(2)} USD\n` +
        `🇻🇪 *VES:* Bs. ${totalBs.toFixed(2)} (Tasa BCV ${rates.usdToBs.toFixed(2)})\n` +
        (notes.trim() ? `\n📝 *Notas:* ${notes.trim()}\n` : "") +
        `\nAdjunto comprobante para coordinar la entrega. ¡Gracias!`

      const waUrl = `https://wa.me/584147550091?text=${encodeURIComponent(waText)}`

      setOrderConfirmation({
        invoiceNumber: orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerDoc: customerDoc.trim(),
        customerEmail: customerEmail.trim(),
        deliveryType,
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: paymentLabel,
        notes: notes.trim(),
        items: [...cart],
        totalUsd: cartSubtotal,
        totalBs,
        whatsappUrl: waUrl,
      })

      clearCart()
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar el pedido. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // PANTALLA DE PEDIDO CONFIRMADO
  // ============================================================================
  if (orderConfirmation) {
    return (
      <div className="bg-[#020813] text-white min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto bg-[#041124] border border-green-500/30 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 inline-block">
              Pedido #{orderConfirmation.invoiceNumber}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              ¡Pedido Registrado con Éxito!
            </h1>
            <p className="text-white/70 text-sm max-w-lg mx-auto">
              Tu orden ya ha sido registrada en el sistema de <strong>Servicios y Suministros SP</strong>. Envíanos un WhatsApp para confirmar el pago y coordinar el despacho inmediato.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-white/40 uppercase font-bold block mb-1">Cliente</span>
                <strong className="text-white text-sm">{orderConfirmation.customerName}</strong>
                {orderConfirmation.customerDoc && (
                  <p className="text-white/60">{orderConfirmation.customerDoc}</p>
                )}
              </div>
              <div>
                <span className="text-white/40 uppercase font-bold block mb-1">Contacto</span>
                <strong className="text-white text-sm">{orderConfirmation.customerPhone}</strong>
                {orderConfirmation.customerEmail && (
                  <p className="text-white/60">{orderConfirmation.customerEmail}</p>
                )}
              </div>
              <div>
                <span className="text-white/40 uppercase font-bold block mb-1">Modalidad de Despacho</span>
                <strong className="text-secondary text-sm flex items-center gap-1.5">
                  {orderConfirmation.deliveryType === "TIENDA" ? (
                    <>
                      <Store className="w-4 h-4" /> Retiro en Tienda SP (El Vigía)
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" /> Envío: {orderConfirmation.deliveryAddress}
                    </>
                  )}
                </strong>
              </div>
              <div>
                <span className="text-white/40 uppercase font-bold block mb-1">Método de Pago</span>
                <strong className="text-white text-sm">{orderConfirmation.paymentMethod}</strong>
              </div>
            </div>

            {/* Total breakdown */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-white/70">Total a Pagar:</span>
              <div className="text-right">
                <div className="text-2xl font-black text-green-400 font-mono">
                  ${orderConfirmation.totalUsd.toFixed(2)} USD
                </div>
                <div className="text-xs text-white/50 font-mono">
                  Bs. {orderConfirmation.totalBs.toFixed(2)} (Ref. BCV)
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <a
              href={orderConfirmation.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-6 h-6" /> Confirmar Pedido por WhatsApp
            </a>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOrderConfirmation(null)}
                className="flex-1 h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase"
              >
                Hacer Otra Compra
              </Button>
              <Button
                asChild
                className="flex-1 h-12 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-xs uppercase"
              >
                <Link href="/productos">Ir al Catálogo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // PANTALLA PRINCIPAL: CARRITO DE COMPRAS
  // ============================================================================
  return (
    <div className="bg-[#020813] text-white min-h-screen pb-32">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft className="w-4 h-4" /> Seguir Comprando en el Catálogo
              </Link>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                <ShoppingCart className="w-9 h-9 text-secondary" /> Carrito de Compras
              </h1>
              <p className="text-white/70 mt-2 text-sm md:text-base max-w-xl">
                Procesa tu compra directa con retiro en tienda en El Vigía o despacho nacional.
              </p>
            </div>

            {/* Quote list pill reminder */}
            <div className="bg-[#041124] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="text-white/50 uppercase font-black tracking-wider text-[10px]">
                  ¿Buscas presupuesto o cuotas?
                </div>
                <Link
                  href="/cotizacion"
                  className="text-secondary font-black hover:underline flex items-center gap-1 mt-0.5"
                >
                  Ir al Cotizador Formal {totalQuoteItems > 0 && `(${totalQuoteItems} equipos)`} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {cart.length === 0 ? (
          /* Empty State */
          <div className="max-w-xl mx-auto text-center py-20 px-6 bg-[#041124] border border-white/5 rounded-[2.5rem] space-y-6">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Tu carrito está vacío</h2>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                No tienes productos agregados para compra directa. Explora nuestro catálogo con equipos de seguridad, redes, telecomunicaciones e infraestructura.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild className="h-12 px-6 bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl">
                <Link href="/productos">Explorar Productos</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider rounded-xl">
                <Link href="/cotizacion">Solicitar Cotización Formal</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-white/60">
                  {totalItems} {totalItems === 1 ? "Producto" : "Productos"} en Carrito
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar carrito
                </button>
              </div>

              <div className="space-y-3">
                {cart.map(item => {
                  const unitPrice = Number(item.price) || 0
                  const itemSubtotal = unitPrice * item.quantity

                  return (
                    <div
                      key={item.id}
                      className="bg-[#041124] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-white/20"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {item.image && (
                          <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/20">
                            {item.category || "SP"}
                          </span>
                          <h3 className="font-bold text-white text-sm sm:text-base truncate mt-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            <span className="text-green-400 font-mono font-bold">
                              ${unitPrice.toFixed(2)} USD
                            </span>
                            <span className="text-white/40">·</span>
                            <span className="text-white/50 font-mono text-[11px]">
                              Bs. {(unitPrice * rates.usdToBs).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-sm text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <div className="text-base font-black text-white font-mono">
                            ${itemSubtotal.toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[11px] text-white/40 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto mt-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Guarantees Box */}
              <div className="bg-[#041124]/60 border border-white/5 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/70">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                  <span>Garantía oficial y soporte técnico SP</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-secondary shrink-0" />
                  <span>Equipos nuevos en empaque original</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-secondary shrink-0" />
                  <span>Despacho el mismo día hábil</span>
                </div>
              </div>
            </div>

            {/* Checkout Form Column (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[#041124] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-2xl">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-secondary" /> Finalizar Compra
                  </h2>
                  <p className="text-xs text-white/60 mt-1">
                    Completa tus datos para emitir tu orden y coordinar el pago.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-4">
                  {/* Delivery Mode */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-white/60 mb-2">
                      Modalidad de Despacho *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("TIENDA")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deliveryType === "TIENDA"
                            ? "bg-secondary/20 border-secondary text-white shadow-md shadow-secondary/10"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-black">
                          <Store className="w-4 h-4 text-secondary" /> Retiro en Tienda
                        </div>
                        <span className="text-[10px] text-white/50 block mt-1">
                          El Vigía, Mérida (Gratis)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("ENVIO")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deliveryType === "ENVIO"
                            ? "bg-secondary/20 border-secondary text-white shadow-md shadow-secondary/10"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-black">
                          <Truck className="w-4 h-4 text-secondary" /> Envío Nacional
                        </div>
                        <span className="text-[10px] text-white/50 block mt-1">
                          MRW, Zoom, Tealca
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
                        Nombre Completo / Razón Social *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Ej: Inversiones Tecnológicas, C.A."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-secondary outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
                          Cédula / RIF
                        </label>
                        <input
                          type="text"
                          value={customerDoc}
                          onChange={e => setCustomerDoc(e.target.value)}
                          placeholder="J-12345678-9"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-secondary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          placeholder="0414-7550091"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-secondary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
                        Correo Electrónico (opcional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="ventas@tuempresa.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-secondary outline-none transition-all"
                      />
                    </div>

                    {deliveryType === "ENVIO" && (
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
                          Dirección / Agencia de Envío *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder="Ej: MRW El Vigía Centro / Dirección física"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-secondary outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1.5">
                      Método de Pago Preferido *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#020813] border border-white/10 text-white text-xs focus:border-secondary outline-none cursor-pointer"
                    >
                      <option value="PAGO_MOVIL">📱 Pago Móvil / Transferencia VES</option>
                      <option value="BINANCE">🟡 Binance Pay / USDT</option>
                      <option value="ZELLE">💙 Zelle USD</option>
                      <option value="EFECTIVO">💵 Efectivo USD (en Tienda El Vigía)</option>
                      <option value="PUNTO">💳 Punto de Venta VES (en Tienda El Vigía)</option>
                    </select>

                    {/* Coordinates preview */}
                    <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/70 space-y-1">
                      {paymentMethod === "PAGO_MOVIL" && (
                        <div>
                          <strong className="text-secondary block">Coordenadas Pago Móvil:</strong>
                          <span>Banesco / Provincial · RIF: J-40403649-0 · Tel: 0414-7550091</span>
                        </div>
                      )}
                      {paymentMethod === "BINANCE" && (
                        <div>
                          <strong className="text-secondary block">Coordenadas Binance Pay:</strong>
                          <span>Email: serviciosysuministrossp@gmail.com (Pay ID disponible al confirmar)</span>
                        </div>
                      )}
                      {paymentMethod === "ZELLE" && (
                        <div>
                          <strong className="text-secondary block">Coordenadas Zelle:</strong>
                          <span>Se facilitarán al confirmar el pedido por WhatsApp</span>
                        </div>
                      )}
                      {(paymentMethod === "EFECTIVO" || paymentMethod === "PUNTO") && (
                        <div>
                          <strong className="text-secondary block">Pago en Sede:</strong>
                          <span>Av. Principal, El Vigía, Mérida (Horario: Lun a Sáb 8am - 6pm)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extra Notes */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-white/60 mb-1">
                      Notas u Observaciones del Pedido
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Ej: Facturar a nombre de la empresa, entregar por la tarde..."
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-secondary outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Totals Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Subtotal ({totalItems} items):</span>
                      <span className="font-mono text-white">${cartSubtotal.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Tasa de Cambio Oficial (BCV):</span>
                      <span className="font-mono text-white/80">Bs. {rates.usdToBs.toFixed(2)} / $</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-end">
                      <span className="text-sm font-black text-white">Total a Pagar:</span>
                      <div className="text-right">
                        <div className="text-xl font-black text-green-400 font-mono">
                          ${cartSubtotal.toFixed(2)} USD
                        </div>
                        <div className="text-[11px] text-white/60 font-mono">
                          Bs. {totalBs.toFixed(2)} VES
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 text-sm transition-all hover:scale-[1.01]"
                  >
                    {loading ? (
                      "Procesando Pedido..."
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Confirmar y Procesar Pedido
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
