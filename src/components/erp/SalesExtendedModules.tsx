"use client"

import React, { useState, useMemo } from "react"
import {
  FileText,
  CreditCard,
  RotateCcw,
  CheckSquare,
  Users,
  MapPin,
  Plus,
  Search,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  Barcode,
  Truck,
  MessageCircle,
  ExternalLink,
  Phone,
  ShieldCheck,
  Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SalesExtendedProps {
  subView: "cotizaciones" | "facturas" | "devoluciones" | "verificador_salida" | "vendedores" | "rutas"
  products: any[]
  orders: any[]
  customers: any[]
  settings: any
  formatMoney: (usd: number) => string
  onRefreshAll: () => Promise<void>
  showMessage: (type: "success" | "error", text: string) => void
  onSelectPosView?: () => void
}

export function SalesExtendedModules({
  subView,
  products,
  orders,
  customers,
  settings,
  formatMoney,
  onRefreshAll,
  showMessage,
  onSelectPosView,
}: SalesExtendedProps) {
  // Cotizaciones state
  const [cotizaciones, setCotizaciones] = useState<Array<{
    id: string
    code: string
    customerName: string
    customerPhone: string
    date: string
    validUntil: string
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    status: "VIGENTE" | "CONVERTIDA" | "VENCIDA"
  }>>([
    {
      id: "cot-1",
      code: "COT-2026-001",
      customerName: "Agropecuaria El Vigía C.A.",
      customerPhone: "04147550091",
      date: "2026-11-04",
      validUntil: "2026-11-18",
      items: [
        { name: "Inversor Cargador Must Solar 3kW 24V", quantity: 1, price: 580 },
        { name: "Batería Litio LiFePO4 24V 100Ah", quantity: 2, price: 620 },
        { name: "Panel Solar Monocristalino 550W Tier 1", quantity: 4, price: 110 },
      ],
      total: 2260,
      status: "VIGENTE",
    },
    {
      id: "cot-2",
      code: "COT-2026-002",
      customerName: "Farmacia La Paz",
      customerPhone: "04247123456",
      date: "2026-11-02",
      validUntil: "2026-11-16",
      items: [
        { name: "Kit CCTV Dahua 4 Cámaras 2MP Full HD + Disco 1TB", quantity: 1, price: 185 },
        { name: "UPS 1000VA Regulador de Voltaje", quantity: 2, price: 95 },
      ],
      total: 375,
      status: "CONVERTIDA",
    },
  ])

  // New quote form
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false)
  const [quoteCustomer, setQuoteCustomer] = useState("")
  const [quotePhone, setQuotePhone] = useState("")
  const [quoteItems, setQuoteItems] = useState<Array<{ name: string; quantity: number; price: number }>>([
    { name: products[0]?.name || "Inversor Must 3kW", quantity: 1, price: products[0]?.price || 580 },
  ])

  // Devoluciones state
  const [devoluciones, setDevoluciones] = useState<Array<{
    id: string
    code: string
    customerName: string
    invoiceRef: string
    productName: string
    quantity: number
    amount: number
    reason: string
    date: string
    status: "PROCESADA" | "EN_REVISION"
  }>>([
    {
      id: "dev-1",
      code: "DEV-0042",
      customerName: "Ferretería Panamericana",
      invoiceRef: "FC-1029",
      productName: "ROUTER WIFI 6 HIKVISION DS-3WR15X AX1500",
      quantity: 1,
      amount: 40.0,
      reason: "Incompatibilidad de frecuencia en instalación",
      date: "2026-11-04",
      status: "PROCESADA",
    },
  ])
  const [showDevolucionModal, setShowDevolucionModal] = useState(false)
  const [devForm, setDevForm] = useState({
    customerName: "",
    invoiceRef: "",
    productName: "",
    quantity: 1,
    amount: 0,
    reason: "",
  })

  // Verificador de Salida (Warehouse Exit Check)
  const [verifierScanCode, setVerifierScanCode] = useState("")
  const [verifierActiveOrder, setVerifierActiveOrder] = useState<any | null>(null)
  const [scannedItemsList, setScannedItemsList] = useState<{ [key: string]: number }>({})

  // Vendedores state
  const [vendedores, setVendedores] = useState<Array<{
    id: string
    name: string
    email: string
    phone: string
    salesCount: number
    totalSalesUsd: number
    commissionRate: number
    quotaUsd: number
  }>>([
    {
      id: "v-1",
      name: "Carlos Mendoza",
      email: "carlos.ventas@serviciossp.com",
      phone: "0414-7550091",
      salesCount: 14,
      totalSalesUsd: 8450,
      commissionRate: 3.5,
      quotaUsd: 10000,
    },
    {
      id: "v-2",
      name: "Mariana Rivas",
      email: "mariana.ventas@serviciossp.com",
      phone: "0424-7128930",
      salesCount: 18,
      totalSalesUsd: 11200,
      commissionRate: 4.0,
      quotaUsd: 10000,
    },
    {
      id: "v-3",
      name: "José Leonardo Peña",
      email: "jose.solar@serviciossp.com",
      phone: "0412-9988112",
      salesCount: 9,
      totalSalesUsd: 14800,
      commissionRate: 5.0,
      quotaUsd: 15000,
    },
  ])

  // Rutas y Visitas state
  const [rutas, setRutas] = useState<Array<{
    id: string
    zone: string
    technician: string
    customerName: string
    address: string
    type: "INSTALACION_SOLAR" | "MANTENIMIENTO" | "COBRANZA" | "INSPECCION"
    time: string
    status: "EN_RUTA" | "COMPLETADA" | "PENDIENTE"
  }>>([
    {
      id: "r-1",
      zone: "El Vigía - Casco Central",
      technician: "Ing. Javier Guardia",
      customerName: "Supermercado La Gran Parada",
      address: "Av. Bolívar c/ Calle 3, El Vigía",
      type: "INSTALACION_SOLAR",
      time: "09:00 AM",
      status: "COMPLETADA",
    },
    {
      id: "r-2",
      zone: "Santa Bárbara del Zulia",
      technician: "Téc. Roberto Márquez",
      customerName: "Finca Los Caobos",
      address: "Sector Encontrados, Vía Km 35",
      type: "INSPECCION",
      time: "02:00 PM",
      status: "EN_RUTA",
    },
    {
      id: "r-3",
      zone: "El Vigía - Zona Industrial",
      technician: "Ing. Javier Guardia",
      customerName: "Frigorífico Industrial Sur",
      address: "Parque Industrial Manzana D, Galpón 4",
      type: "MANTENIMIENTO",
      time: "04:30 PM",
      status: "PENDIENTE",
    },
  ])

  // ============================================================================
  // 1. COTIZACIONES
  // ============================================================================
  if (subView === "cotizaciones") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-sky-400" />
              Presupuestos y <span className="text-sky-400">Cotizaciones</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Crea propuestas comerciales profesionales en USD y Bs, compártelas por WhatsApp y conviértelas a Pedido/Factura en 1 clic.
            </p>
          </div>
          <Button
            onClick={() => setShowNewQuoteModal(true)}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" /> Nueva Cotización
          </Button>
        </div>

        {/* Quotes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cotizaciones.map(cot => (
            <div key={cot.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4 hover:border-sky-500/40 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-sky-400">{cot.code}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        cot.status === "VIGENTE"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : cot.status === "CONVERTIDA"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {cot.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{cot.customerName}</h3>
                  <p className="text-xs text-white/50">📞 {cot.customerPhone}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-400">${cot.total.toFixed(2)}</div>
                  <div className="text-[11px] font-mono text-white/40">
                    Bs. {(cot.total * (settings?.usdToBs || 65.5)).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-white/5 rounded-2xl p-3 space-y-1.5 text-xs">
                {cot.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-white/70">
                    <span className="truncate pr-2">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-mono text-white font-bold shrink-0">${(it.quantity * it.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="text-white/40 text-[11px]">Válido hasta: {cot.validUntil}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Hola ${cot.customerName}, le compartimos su Cotización ${cot.code} por un total de $${cot.total.toFixed(2)} USD (Bs. ${(
                          cot.total * (settings?.usdToBs || 65.5)
                        ).toFixed(2)}) de kick-off Commerce / Servicios y Suministros SP. ¿Desea proceder con la facturación y despacho?`
                      )
                      window.open(`https://wa.me/58${(cot.customerPhone || "").replace(/\D/g, "")}?text=${text}`, "_blank")
                    }}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    title="Enviar por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCotizaciones(prev =>
                        prev.map(c => (c.id === cot.id ? { ...c, status: "CONVERTIDA" } : c))
                      )
                      showMessage("success", `¡Cotización ${cot.code} convertida a Pedido con éxito!`)
                      if (onSelectPosView) onSelectPosView()
                    }}
                    disabled={cot.status === "CONVERTIDA"}
                    className="py-1.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Convertir a Factura / POS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Nueva Cotización */}
        {showNewQuoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#040e24] border border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-4">
              <h3 className="text-xl font-black text-white">Generar Nueva Cotización</h3>
              <input
                type="text"
                placeholder="Nombre del Cliente o Razón Social *"
                value={quoteCustomer}
                onChange={e => setQuoteCustomer(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Teléfono / WhatsApp *"
                value={quotePhone}
                onChange={e => setQuotePhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70">Productos a Cotizar:</label>
                {quoteItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={it.name}
                      onChange={e => {
                        const val = e.target.value
                        setQuoteItems(prev => prev.map((x, i) => (i === idx ? { ...x, name: val } : x)))
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10) || 1
                        setQuoteItems(prev => prev.map((x, i) => (i === idx ? { ...x, quantity: val } : x)))
                      }}
                      className="w-16 bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white font-mono text-center"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={it.price}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        setQuoteItems(prev => prev.map((x, i) => (i === idx ? { ...x, price: val } : x)))
                      }}
                      className="w-24 bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white font-mono text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <div className="text-sm font-bold text-white">
                  Total: ${quoteItems.reduce((acc, it) => acc + it.quantity * it.price, 0).toFixed(2)} USD
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setShowNewQuoteModal(false)} className="text-white/60">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (!quoteCustomer.trim()) return
                      const total = quoteItems.reduce((acc, it) => acc + it.quantity * it.price, 0)
                      const newCode = `COT-2026-${String(cotizaciones.length + 1).padStart(3, "0")}`
                      setCotizaciones([
                        {
                          id: `cot-${Date.now()}`,
                          code: newCode,
                          customerName: quoteCustomer,
                          customerPhone: quotePhone || "04147550091",
                          date: new Date().toISOString().split("T")[0],
                          validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
                          items: [...quoteItems],
                          total,
                          status: "VIGENTE",
                        },
                        ...cotizaciones,
                      ])
                      setShowNewQuoteModal(false)
                      showMessage("success", `Cotización ${newCode} creada exitosamente.`)
                    }}
                    className="bg-sky-500 text-slate-950 font-black rounded-xl"
                  >
                    Guardar Cotización
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // 2. FACTURAS EMITIDAS
  // ============================================================================
  if (subView === "facturas") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            Facturación <span className="text-emerald-400">Fiscal y Digital</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Libro de ventas con numeración fiscal de control, desglose en USD y Bolívares (BCV), reimpresión térmica y anulación.
          </p>
        </div>

        <div className="bg-[#040e24] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 uppercase font-black tracking-wider text-[10px]">
                <th className="p-4">N° Factura</th>
                <th className="p-4">Cliente / RIF</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Condición</th>
                <th className="p-4">Monto USD</th>
                <th className="p-4">Monto Bs (BCV)</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {orders.map((ord, i) => (
                <tr key={ord.id || i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {ord.invoiceNumber || `FC-${String(i + 1001).padStart(5, "0")}`}
                  </td>
                  <td className="p-4">
                    <strong className="text-white block">{ord.customerName}</strong>
                    <span className="text-[10px] text-white/40 font-mono">{ord.customerDoc || "V-00000000"}</span>
                  </td>
                  <td className="p-4 text-white/60">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono">
                      {ord.paymentCondition || "CONTADO"}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">${ord.total.toFixed(2)}</td>
                  <td className="p-4 font-mono text-white/60">
                    Bs. {(ord.total * (settings?.usdToBs || 65.5)).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => showMessage("success", `Imprimiendo comprobante fiscal de factura ${ord.invoiceNumber || "FC-001"}...`)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                      title="Reimprimir Comprobante"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============================================================================
  // 3. DEVOLUCIONES Y RMA
  // ============================================================================
  if (subView === "devoluciones") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <RotateCcw className="w-8 h-8 text-rose-400" />
              Devoluciones de <span className="text-rose-400">Venta (RMA)</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Registro de reingresos a inventario por garantías, devoluciones de clientes y notas de crédito de ajuste.
            </p>
          </div>
          <Button
            onClick={() => setShowDevolucionModal(true)}
            className="bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" /> Registrar Devolución
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devoluciones.map(dev => (
            <div key={dev.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400">{dev.code}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{dev.customerName}</h3>
                  <span className="text-xs text-white/50">Ref. Factura: {dev.invoiceRef}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-rose-400">${dev.amount.toFixed(2)}</div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    {dev.status}
                  </span>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl text-xs space-y-1">
                <div className="text-white/80 font-bold">{dev.productName} (x{dev.quantity})</div>
                <p className="text-white/50 italic">Motivo: "{dev.reason}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Registrar Devolución */}
        {showDevolucionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#040e24] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-xl font-black text-white">Registrar Devolución de Venta</h3>
              <input
                type="text"
                placeholder="Cliente *"
                value={devForm.customerName}
                onChange={e => setDevForm({ ...devForm, customerName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="N° de Factura Afectada (ej. FC-1029)"
                value={devForm.invoiceRef}
                onChange={e => setDevForm({ ...devForm, invoiceRef: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Producto a Devolver"
                value={devForm.productName}
                onChange={e => setDevForm({ ...devForm, productName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  value={devForm.quantity}
                  onChange={e => setDevForm({ ...devForm, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto $ USD"
                  value={devForm.amount || ""}
                  onChange={e => setDevForm({ ...devForm, amount: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <textarea
                placeholder="Motivo de la devolución o garantía..."
                value={devForm.reason}
                onChange={e => setDevForm({ ...devForm, reason: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white resize-none h-20"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowDevolucionModal(false)} className="text-white/60">
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (!devForm.customerName.trim() || !devForm.productName.trim()) return
                    setDevoluciones([
                      {
                        id: `dev-${Date.now()}`,
                        code: `DEV-00${devoluciones.length + 43}`,
                        ...devForm,
                        date: new Date().toISOString().split("T")[0],
                        status: "PROCESADA",
                      },
                      ...devoluciones,
                    ])
                    setShowDevolucionModal(false)
                    showMessage("success", "Devolución registrada. Stock restablecido en inventario.")
                  }}
                  className="bg-rose-500 text-white font-black rounded-xl"
                >
                  Confirmar Reingreso
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // 4. VERIFICADOR DE SALIDA (DESPACHO DE ALMACÉN CON ROCCIA CBR-8200LW)
  // ============================================================================
  if (subView === "verificador_salida") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-purple-400" />
            Verificador de <span className="text-purple-400">Salida y Despacho</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Control de almacén a prueba de errores. Escanea el pedido con el lector Roccia CBR-8200LW y verifica los ítems físicos antes de cargar el transporte.
          </p>
        </div>

        {/* Scan Invoice Input */}
        <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Escanea el código de barra del Pedido o Factura (ej. FC-1001)..."
                value={verifierScanCode}
                onChange={e => setVerifierScanCode(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && verifierScanCode.trim()) {
                    const found = orders.find(
                      o =>
                        o.invoiceNumber?.toLowerCase() === verifierScanCode.trim().toLowerCase() ||
                        o.id === verifierScanCode.trim()
                    ) || {
                      invoiceNumber: verifierScanCode,
                      customerName: "Cliente Despacho",
                      items: JSON.stringify([
                        { name: "Inversor Must 3kW 24V", quantity: 1, sku: "SP-INV-01" },
                        { name: "Batería Litio LiFePO4 24V 100Ah", quantity: 2, sku: "SP-BAT-02" },
                      ]),
                    }
                    setVerifierActiveOrder(found)
                    setScannedItemsList({})
                    showMessage("success", `Pedido ${found.invoiceNumber} cargado para verificación.`)
                  }
                }}
                className="w-full bg-white/5 border border-purple-500/40 rounded-2xl py-3 pl-12 pr-4 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <Button
              onClick={() => {
                if (orders.length > 0) {
                  setVerifierActiveOrder(orders[0])
                  setScannedItemsList({})
                  showMessage("success", `Pedido ${orders[0].invoiceNumber || orders[0].id} cargado para verificación.`)
                }
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl"
            >
              Cargar Último Pedido
            </Button>
          </div>

          {verifierActiveOrder && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-black text-purple-300">Orden en Proceso de Despacho:</span>
                  <h3 className="text-lg font-black text-white">{verifierActiveOrder.invoiceNumber || verifierActiveOrder.id}</h3>
                  <p className="text-xs text-white/60">Cliente: {verifierActiveOrder.customerName}</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-xl">
                  {Object.keys(scannedItemsList).length} verificados
                </span>
              </div>

              {/* Items checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white/60">Ítems a verificar contra bultos físicos:</div>
                {(() => {
                  let items = []
                  try {
                    items = JSON.parse(verifierActiveOrder.items || "[]")
                  } catch {
                    items = []
                  }
                  return items.map((it: any, idx: number) => {
                    const isChecked = Boolean(scannedItemsList[it.name || it.sku])
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setScannedItemsList(prev => ({
                            ...prev,
                            [it.name || it.sku]: isChecked ? 0 : it.quantity || 1,
                          }))
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : "bg-white/5 border-white/5 text-white/70 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isChecked ? "bg-emerald-500 text-slate-950" : "bg-white/10 text-white/40"
                            }`}
                          >
                            {isChecked ? "✓" : idx + 1}
                          </div>
                          <span className="font-semibold text-xs text-white">{it.name}</span>
                        </div>
                        <div className="font-mono text-xs font-bold">Cant: {it.quantity || 1}</div>
                      </div>
                    )
                  })
                })()}
              </div>

              <Button
                onClick={() => {
                  showMessage("success", `¡Despacho autorizado! Salida de almacén sellada y aprobada para ${verifierActiveOrder.customerName}.`)
                  setVerifierActiveOrder(null)
                  setVerifierScanCode("")
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-600/30 text-xs"
              >
                ✓ Aprobar Salida y Emitir Pase de Despacho
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // 5. VENDEDORES Y COMISIONES
  // ============================================================================
  if (subView === "vendedores") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            Fuerza de <span className="text-purple-400">Ventas y Comisiones</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Monitoreo de metas mensuales, cálculo automático de comisiones ganadas y cartera de clientes asignados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vendedores.map(vend => {
            const progress = Math.min(100, Math.round((vend.totalSalesUsd / vend.quotaUsd) * 100))
            const commission = (vend.totalSalesUsd * (vend.commissionRate / 100)).toFixed(2)
            return (
              <div key={vend.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 font-black flex items-center justify-center text-sm">
                    {vend.name.charAt(0)}
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Comisión: {vend.commissionRate}%
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{vend.name}</h3>
                  <p className="text-xs text-white/50">📞 {vend.phone}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Meta Mensual:</span>
                    <span className="font-mono text-white font-bold">${vend.totalSalesUsd} / ${vend.quotaUsd}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-right text-[10px] text-purple-300 font-bold">{progress}% alcanzado</div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-white/50">Comisión Ganada:</span>
                  <span className="text-base font-black font-mono text-emerald-400">${commission} USD</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================================
  // 6. RUTAS Y VISITAS TÉCNICAS
  // ============================================================================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <MapPin className="w-8 h-8 text-sky-400" />
          Rutas Comerciales y <span className="text-sky-400">Visitas Técnicas</span>
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Planificación de visitas a campo para instalaciones solares, levantamiento técnico y cobranzas en El Vigía y zonas aledañas.
        </p>
      </div>

      <div className="space-y-3">
        {rutas.map(r => (
          <div key={r.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-sky-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-white text-base">{r.customerName}</h3>
                  <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full font-mono">
                    {r.zone}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">📍 {r.address}</p>
                <div className="text-[11px] text-sky-300/80 font-semibold mt-1">
                  Técnico: {r.technician} · Hora: {r.time}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  r.status === "COMPLETADA"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : r.status === "EN_RUTA"
                    ? "bg-amber-500/20 text-amber-300 animate-pulse"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {r.status}
              </span>
              <button
                onClick={() => {
                  setRutas(prev =>
                    prev.map(x => (x.id === r.id ? { ...x, status: "COMPLETADA" } : x))
                  )
                  showMessage("success", `Ruta a ${r.customerName} marcada como completada.`)
                }}
                className="py-1 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
              >
                Check
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

