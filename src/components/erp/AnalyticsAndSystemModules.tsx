"use client"

import React, { useState, useMemo } from "react"
import {
  CreditCard,
  DollarSign,
  Tag,
  BarChart3,
  LineChart,
  ShieldAlert,
  TrendingUp,
  PieChart,
  Brain,
  FileCode,
  Tv,
  Users,
  UserCheck,
  ShieldCheck,
  Settings,
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Barcode,
  Calendar,
  Lock,
  Download,
  Database,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InteractiveChartsSuite } from "./InteractiveCharts"

interface AnalyticsAndSystemProps {
  section: "finanzas" | "analisis" | "sistema"
  subView: string
  products: any[]
  orders: any[]
  bankAccounts: any[]
  settings: any
  formatMoney: (usd: number) => string
  onRefreshAll: () => Promise<void>
  showMessage: (type: "success" | "error", text: string) => void
  onOpenRateEditor?: () => void
}

export function AnalyticsAndSystemModules({
  section,
  subView,
  products,
  orders,
  bankAccounts,
  settings,
  formatMoney,
  onRefreshAll,
  showMessage,
  onOpenRateEditor,
}: AnalyticsAndSystemProps) {
  // Cierre de Caja State
  const [cashCounts, setCashCounts] = useState({
    usd100: 2,
    usd50: 4,
    usd20: 8,
    usd10: 12,
    usd5: 14,
    usd1: 20,
    puntoBsUsd: 125.4,
    pagoMovilUsd: 84.0,
    transferenciaUsd: 110.0,
    zelleUsd: 150.0,
    binanceUsd: 65.0,
  })

  // Gastos State
  const [gastos, setGastos] = useState<Array<{
    id: string
    code: string
    category: string
    amount: number
    description: string
    date: string
    bankAccountName: string
  }>>([
    {
      id: "gst-1",
      code: "GST-2026-001",
      category: "FLETES_Y_ENVIOS",
      amount: 45.0,
      description: "Flete aéreo urgente repuestos inversores El Vigía",
      date: "2026-11-04",
      bankAccountName: "Caja Chica Dólares",
    },
    {
      id: "gst-2",
      code: "GST-2026-002",
      category: "SERVICIOS_PUBLICOS",
      amount: 38.0,
      description: "Pago de servicio de Internet Fibra Óptica tienda",
      date: "2026-11-03",
      bankAccountName: "Banesco Corriente Bs",
    },
    {
      id: "gst-3",
      code: "GST-2026-003",
      category: "VIATICOS",
      amount: 60.0,
      description: "Combustible y viáticos para instalación solar Sur del Lago",
      date: "2026-11-02",
      bankAccountName: "Caja Chica Dólares",
    },
  ])
  const [showGastoModal, setShowGastoModal] = useState(false)
  const [gastoForm, setGastoForm] = useState({
    category: "GASTOS_OPERATIVOS",
    amount: 0,
    description: "",
    bankAccountName: bankAccounts[0]?.name || "Caja Principal USD",
  })

  // Format Builder State (Header & Footer of printed receipts)
  const [receiptHeader, setReceiptHeader] = useState("SERVICIOS Y SUMINISTROS SP, C.A.\nRIF: J-40403649-0\nAv. Bolívar, Centro Comercial Vigía Plaza, Local 4\nTeléfono: 0414-7550091")
  const [receiptFooter, setReceiptFooter] = useState("¡Gracias por su compra en kick-off Commerce!\nGarantía de 1 año en inversores y soporte técnico especializado.\nConserve este ticket para cualquier reclamo.")

  // Visor de Precios State (Interactive price checker with Roccia barcode scanner)
  const [kioskBarcode, setKioskBarcode] = useState("")
  const [kioskMatchedProduct, setKioskMatchedProduct] = useState<any>(products[0] || null)

  // Auditoría State
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string
    timestamp: string
    user: string
    action: string
    module: string
    details: string
    ip: string
  }>>([
    {
      id: "aud-1",
      timestamp: "2026-11-05 20:45:12",
      user: "Administrador (Carlos)",
      action: "ACTUALIZACION_STOCK",
      module: "INVENTARIO",
      details: "Entrada rápida +5 unidades con lector Roccia CBR-8200LW",
      ip: "192.168.1.104",
    },
    {
      id: "aud-2",
      timestamp: "2026-11-05 19:12:04",
      user: "Administrador",
      action: "CAMBIO_TASA",
      module: "DIVISAS",
      details: "Tasa BCV actualizada a 65.50 VES y Binance a 78.90 VES",
      ip: "192.168.1.100",
    },
    {
      id: "aud-3",
      timestamp: "2026-11-05 17:30:45",
      user: "Vendedor (Mariana)",
      action: "EMISION_FACTURA",
      module: "POS",
      details: "Factura FC-1002 por $580.00 USD cobrada de contado",
      ip: "192.168.1.102",
    },
  ])

  // Guardián de Márgenes State
  const [marginRules, setMarginRules] = useState<Array<{
    category: string
    minMarginPct: number
    blockSaleUnderMin: boolean
  }>>([
    { category: "INVERSORES", minMarginPct: 18, blockSaleUnderMin: true },
    { category: "BATERIAS_LITIO", minMarginPct: 20, blockSaleUnderMin: true },
    { category: "PANELES_SOLARES", minMarginPct: 15, blockSaleUnderMin: false },
    { category: "REDES_WIFI", minMarginPct: 25, blockSaleUnderMin: false },
    { category: "CAMARAS_CCTV", minMarginPct: 25, blockSaleUnderMin: true },
  ])

  // Cajeros State
  const [cajeros, setCajeros] = useState<Array<{
    id: string
    name: string
    register: string
    status: "TURNO_ABIERTO" | "CERRADO"
    shiftStart: string
    totalSalesShift: number
  }>>([
    {
      id: "caj-1",
      name: "Mariana Rivas",
      register: "CAJA 1 - Mostrador Principal",
      status: "TURNO_ABIERTO",
      shiftStart: "08:00 AM",
      totalSalesShift: 1420.0,
    },
    {
      id: "caj-2",
      name: "José Peña",
      register: "CAJA 2 - Almacén & Mayoristas",
      status: "TURNO_ABIERTO",
      shiftStart: "08:30 AM",
      totalSalesShift: 2150.0,
    },
  ])

  // Total cash counted in USD
  const totalPhysicalUsd =
    cashCounts.usd100 * 100 +
    cashCounts.usd50 * 50 +
    cashCounts.usd20 * 20 +
    cashCounts.usd10 * 10 +
    cashCounts.usd5 * 5 +
    cashCounts.usd1 * 1

  const totalDigitalUsd =
    cashCounts.puntoBsUsd +
    cashCounts.pagoMovilUsd +
    cashCounts.transferenciaUsd +
    cashCounts.zelleUsd +
    cashCounts.binanceUsd

  const grandTotalCaja = totalPhysicalUsd + totalDigitalUsd

  // ============================================================================
  // FINANZAS: LISTAS DE PRECIOS
  // ============================================================================
  if (section === "finanzas" && subView === "precios") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Tag className="w-8 h-8 text-pink-400" />
            Matriz de <span className="text-pink-400">Listas de Precios</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Administra los 3 niveles comerciales: Menudeo (PVP Final), Mayorista (Compras en lote) y Distribuidor/Técnico Aliado.
          </p>
        </div>

        <div className="bg-[#040e24] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 uppercase font-black tracking-wider text-[10px]">
                <th className="p-4">SKU / Producto</th>
                <th className="p-4">Costo Reposición</th>
                <th className="p-4">PVP Menudeo (Base)</th>
                <th className="p-4">Mayorista (-5%)</th>
                <th className="p-4">Distribuidor (-10%)</th>
                <th className="p-4">Margen Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {products.slice(0, 15).map(p => {
                const cost = p.costPrice || (p.price ? p.price * 0.75 : 0)
                const priceBase = p.price || 0
                const priceMayor = priceBase * 0.95
                const priceDist = priceBase * 0.9
                const margin = priceBase > 0 ? (((priceBase - cost) / priceBase) * 100).toFixed(1) : "0.0"

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <strong className="text-white block">{p.name}</strong>
                      <span className="text-[10px] text-white/40 font-mono">{p.sku || "Sin SKU"}</span>
                    </td>
                    <td className="p-4 font-mono text-white/60">${cost.toFixed(2)}</td>
                    <td className="p-4 font-mono font-bold text-white">${priceBase.toFixed(2)}</td>
                    <td className="p-4 font-mono text-sky-400 font-bold">${priceMayor.toFixed(2)}</td>
                    <td className="p-4 font-mono text-emerald-400 font-black">${priceDist.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                        +{margin}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============================================================================
  // FINANZAS: GASTOS OPERATIVOS
  // ============================================================================
  if (section === "finanzas" && subView === "gastos") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-rose-400" />
              Gastos Operativos y <span className="text-rose-400">Egresos</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Registro y control de fletes, viáticos de cuadrillas solares, servicios y nómina con débito bancario inmediato.
            </p>
          </div>
          <Button
            onClick={() => setShowGastoModal(true)}
            className="bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gastos.map(g => (
            <div key={g.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-rose-400">{g.code}</span>
                <span className="text-xl font-mono font-bold text-rose-400">-${g.amount.toFixed(2)}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{g.description}</h3>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs text-white/50">
                <span>Cuenta: {g.bankAccountName}</span>
                <span>{g.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Registrar Gasto */}
        {showGastoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#040e24] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-xl font-black text-white">Registrar Nuevo Gasto Operativo</h3>
              <select
                value={gastoForm.category}
                onChange={e => setGastoForm({ ...gastoForm, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              >
                <option value="FLETES_Y_ENVIOS" className="bg-[#040e24]">Fletes y Envíos</option>
                <option value="VIATICOS" className="bg-[#040e24]">Viáticos de Instalación</option>
                <option value="SERVICIOS_PUBLICOS" className="bg-[#040e24]">Servicios (Luz, Internet)</option>
                <option value="ALQUILER" className="bg-[#040e24]">Alquiler Local</option>
                <option value="NOMINA" className="bg-[#040e24]">Nómina / Pagos Personal</option>
                <option value="OTROS" className="bg-[#040e24]">Otros Gastos</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Monto en $ USD *"
                value={gastoForm.amount || ""}
                onChange={e => setGastoForm({ ...gastoForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
              />
              <input
                type="text"
                placeholder="Descripción del gasto *"
                value={gastoForm.description}
                onChange={e => setGastoForm({ ...gastoForm, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowGastoModal(false)} className="text-white/60">
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (gastoForm.amount <= 0 || !gastoForm.description.trim()) return
                    setGastos([
                      {
                        id: `gst-${Date.now()}`,
                        code: `GST-2026-00${gastos.length + 4}`,
                        ...gastoForm,
                        date: new Date().toISOString().split("T")[0],
                      },
                      ...gastos,
                    ])
                    setShowGastoModal(false)
                    showMessage("success", "Gasto registrado y debitado de saldos.")
                  }}
                  className="bg-rose-500 text-white font-black rounded-xl"
                >
                  Registrar Gasto
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // ANÁLISIS: CIERRE DE CAJA (ARQUEO Y CORTE Z)
  // ============================================================================
  if (section === "analisis" && subView === "cierre_caja") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-pink-400" />
              Cierre de Caja y <span className="text-pink-400">Arqueo Diario (Corte Z)</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Conteo de billetes físicos en USD, cuadre de puntos de venta en Bolívares y conciliación con transferencias digitales.
            </p>
          </div>
          <Button
            onClick={() => {
              window.print()
              showMessage("success", "Generando e imprimiendo comprobante de Cierre Z...")
            }}
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Printer className="w-4 h-4" /> Imprimir Corte Z
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conteo de Billetes Físicos USD */}
          <div className="lg:col-span-7 bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Conteo de Efectivo Físico USD
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { denom: 100, count: cashCounts.usd100, key: "usd100" },
                { denom: 50, count: cashCounts.usd50, key: "usd50" },
                { denom: 20, count: cashCounts.usd20, key: "usd20" },
                { denom: 10, count: cashCounts.usd10, key: "usd10" },
                { denom: 5, count: cashCounts.usd5, key: "usd5" },
                { denom: 1, count: cashCounts.usd1, key: "usd1" },
              ].map(bill => (
                <div key={bill.denom} className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1">
                  <span className="text-xs font-mono font-bold text-white/60 block">Billetes ${bill.denom}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={bill.count}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10) || 0
                        setCashCounts({ ...cashCounts, [bill.key]: val })
                      }}
                      className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white font-mono text-center font-bold text-xs"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block text-right">
                    = ${(bill.denom * bill.count).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-white">Total Efectivo Físico USD:</span>
              <span className="text-2xl font-black font-mono text-emerald-400">${totalPhysicalUsd.toFixed(2)}</span>
            </div>
          </div>

          {/* Medios Digitales & Resumen General */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-black text-white">Cobros Digitales</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                  <span className="text-white/70">Punto de Venta Bs:</span>
                  <span className="font-mono font-bold text-white">${cashCounts.puntoBsUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                  <span className="text-white/70">Pago Móvil Bs:</span>
                  <span className="font-mono font-bold text-white">${cashCounts.pagoMovilUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                  <span className="text-white/70">Transferencia Bancaria:</span>
                  <span className="font-mono font-bold text-white">${cashCounts.transferenciaUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                  <span className="text-white/70">Zelle USD:</span>
                  <span className="font-mono font-bold text-white">${cashCounts.zelleUsd.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                  <span className="text-white/70">Binance Pay USDT:</span>
                  <span className="font-mono font-bold text-white">${cashCounts.binanceUsd.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 rounded-3xl p-6 text-white space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-300">
                Gran Total Arqueado del Día:
              </span>
              <div className="text-4xl font-black font-mono text-white">${grandTotalCaja.toFixed(2)} USD</div>
              <p className="text-xs text-white/70">
                Equivalente a Bs. {(grandTotalCaja * (settings?.usdToBs || 65.5)).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </p>
              <Button
                onClick={() => {
                  showMessage("success", "Cierre de Caja sellado y archivado en contabilidad.")
                }}
                className="w-full bg-pink-500 hover:bg-pink-400 text-slate-950 font-black py-2.5 rounded-xl text-xs"
              >
                Cerrar Turno de Caja Definitivo
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // ANÁLISIS: DETECTOR DE FUGAS & GUARDIÁN DE MÁRGENES
  // ============================================================================
  if (section === "analisis" && (subView === "detector_fugas" || subView === "guardian_margenes")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
            Detector de Fugas y <span className="text-rose-400">Guardián de Rentabilidad</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Algoritmos de auditoría que alertan sobre ventas por debajo del costo, descuentos no autorizados y márgenes en riesgo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#040e24] border border-emerald-500/20 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Sin fugas críticas detectadas en las últimas 48 hrs
            </div>
            <p className="text-xs text-white/60">
              Todos los pedidos emitidos en el Punto de Venta cumplen con el umbral de margen bruto establecido por la gerencia.
            </p>
          </div>

          <div className="bg-[#040e24] border border-amber-500/20 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" /> Reglas de Bloqueo Automático Activas
            </div>
            <p className="text-xs text-white/60">
              Se requiere clave de Administrador si un vendedor otorga más de 10% de descuento manual en inversores y baterías de litio.
            </p>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-white">Reglas del Guardián de Márgenes por Rubro</h3>
          <div className="space-y-2">
            {marginRules.map((rule, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-white block">{rule.category}</span>
                  <span className="text-white/50 text-[11px]">
                    {rule.blockSaleUnderMin ? "Bloquea venta si es inferior" : "Solo emite alerta"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-400">Mínimo: {rule.minMarginPct}%</span>
                  <button
                    onClick={() => showMessage("success", `Regla para ${rule.category} actualizada.`)}
                    className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // ANÁLISIS: ANALYTICS BI & INTELIGENCIA DE NEGOCIO
  // ============================================================================
  if (section === "analisis" && (subView === "analytics_bi" || subView === "ia_negocio" || subView === "rep_avanzados")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-400" />
            Analytics BI & <span className="text-blue-400">Inteligencia de Negocio</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Métricas ejecutivas de rendimiento, predicción de rotación de stock solar y sugerencias estratégicas para El Vigía.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#040e24] border border-white/10 p-5 rounded-3xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50">Ticket Promedio Venta</span>
            <div className="text-2xl font-black font-mono text-white">$248.50 USD</div>
            <span className="text-[10px] text-emerald-400 font-bold">▲ +12% vs mes anterior</span>
          </div>
          <div className="bg-[#040e24] border border-white/10 p-5 rounded-3xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50">Margen Promedio Global</span>
            <div className="text-2xl font-black font-mono text-emerald-400">26.8%</div>
            <span className="text-[10px] text-white/40">Rentabilidad neta sobre costo</span>
          </div>
          <div className="bg-[#040e24] border border-white/10 p-5 rounded-3xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50">Días de Inventario</span>
            <div className="text-2xl font-black font-mono text-sky-400">22 días</div>
            <span className="text-[10px] text-sky-300">Rotación óptima de capital</span>
          </div>
          <div className="bg-[#040e24] border border-white/10 p-5 rounded-3xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50">Clientes Recurrentes</span>
            <div className="text-2xl font-black font-mono text-purple-400">64%</div>
            <span className="text-[10px] text-purple-300">Fidelización alta</span>
          </div>
        </div>

        {/* Suite de Gráficas Interactivas con Framer Motion */}
        <InteractiveChartsSuite
          orders={orders}
          products={products}
          usdToBs={settings?.usdToBs || 65.5}
          formatMoney={formatMoney}
        />

        {/* AI Recommendations */}
        <div className="bg-[#040e24] border border-blue-500/30 rounded-3xl p-6 space-y-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> Recomendaciones Asistidas por IA
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-white/5 rounded-2xl flex items-start gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <strong className="text-white block">Temporada Alta de Apagones en El Vigía / Sur del Lago:</strong>
                <p className="text-white/60">
                  La demanda de Inversores 3kW y Baterías Litio 24V crecerá un 35% en las próximas semanas. Se recomienda solicitar reposición al mayorista antes de agotarse.
                </p>
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl flex items-start gap-3">
              <span className="text-lg">🏷️</span>
              <div>
                <strong className="text-white block">Sobrestock Detectado en Routers Dahua AC12:</strong>
                <p className="text-white/60">
                  Hay 5 unidades sin rotación en 30 días con $185 USD inmovilizados. Se recomienda aplicar un descuento del 15% en el POS o incluirlo como obsequio en instalaciones solares.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // SISTEMA: FORMAT BUILDER (PERSONALIZADOR DE TICKETS Y FACTURAS)
  // ============================================================================
  if (section === "sistema" && subView === "format_builder") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileCode className="w-8 h-8 text-orange-400" />
            Format Builder de <span className="text-orange-400">Impresión y Documentos</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Personaliza el encabezado y pie de página de facturas, tickets térmicos de 80mm/58mm, cotizaciones y recibos de pago.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Encabezado de Impresión:</label>
              <textarea
                value={receiptHeader}
                onChange={e => setReceiptHeader(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white font-mono h-28"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Pie de Ticket / Políticas de Garantía:</label>
              <textarea
                value={receiptFooter}
                onChange={e => setReceiptFooter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white font-mono h-28"
              />
            </div>
            <Button
              onClick={() => showMessage("success", "Formato de impresión guardado y sincronizado con el POS.")}
              className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs py-2.5"
            >
              Guardar Plantilla de Impresión
            </Button>
          </div>

          <div className="lg:col-span-6 bg-[#040e24] border border-white/10 rounded-3xl p-6 flex flex-col items-center">
            <span className="text-xs uppercase font-black text-white/40 mb-4">Vista Previa Ticket Térmico 80mm</span>
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl w-80 font-mono text-xs space-y-3">
              <div className="text-center whitespace-pre-line text-[11px] font-bold border-b pb-2">
                {receiptHeader}
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Factura: FC-001042</span>
                  <span>05/11/2026</span>
                </div>
                <div>Cliente: Agropecuaria El Vigía</div>
              </div>
              <div className="border-t border-b py-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>1x Inversor Must 3kW</span>
                  <span className="font-bold">$580.00</span>
                </div>
              </div>
              <div className="text-right space-y-0.5 text-xs font-bold">
                <div>TOTAL: $580.00 USD</div>
                <div className="text-slate-600">Bs. 37,990.00</div>
              </div>
              <div className="text-center whitespace-pre-line text-[9px] text-slate-600 border-t pt-2">
                {receiptFooter}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // SISTEMA: VISORES DE PRECIO (KIOSCO / TERMINAL CON ROCCIA CBR-8200LW)
  // ============================================================================
  if (section === "sistema" && subView === "visor_precios") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Tv className="w-8 h-8 text-orange-400" />
            Visor de Precios para <span className="text-orange-400">Clientes (Kiosco)</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Pantalla interactiva de consulta de precios para la tienda. Al pasar cualquier producto por la pistola Roccia CBR-8200LW, muestra el precio en USD, Bs y cuotas.
          </p>
        </div>

        {/* Barcode scanner input */}
        <div className="bg-[#040e24] border border-orange-500/30 rounded-3xl p-6">
          <div className="relative">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            <input
              type="text"
              placeholder="Escanea el código de barra del producto con el lector inalámbrico Roccia..."
              value={kioskBarcode}
              onChange={e => {
                const val = e.target.value
                setKioskBarcode(val)
                const found = products.find(
                  p => (p.sku && p.sku.toLowerCase() === val.toLowerCase().trim()) || p.id === val.trim()
                )
                if (found) setKioskMatchedProduct(found)
              }}
              className="w-full bg-white/5 border border-orange-500/40 rounded-2xl py-3 pl-12 pr-4 text-white text-xs font-mono focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Big Kiosk Display Screen */}
        {kioskMatchedProduct ? (
          <div className="bg-[#040e24] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3 max-w-lg">
              <span className="text-xs font-mono font-bold text-orange-400 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                SKU: {kioskMatchedProduct.sku || "SP-GEN-01"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {kioskMatchedProduct.name}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                {kioskMatchedProduct.description || "Equipo garantizado de alta eficiencia energética disponible en tienda."}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Stock disponible en tienda El Vigía: {kioskMatchedProduct.stock || 15} unidades
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center space-y-2 min-w-[260px]">
              <span className="text-xs text-white/50 uppercase font-black tracking-wider block">Precio de Contado</span>
              <div className="text-5xl font-black font-mono text-emerald-400 tracking-tight">
                ${kioskMatchedProduct.price?.toFixed(2) || "40.00"}
              </div>
              <div className="text-base font-mono font-bold text-white/80">
                Bs. {((kioskMatchedProduct.price || 40) * (settings?.usdToBs || 65.5)).toFixed(2)}
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] text-sky-300 font-semibold">
                O en 3 cuotas quincenales de ${((kioskMatchedProduct.price || 40) / 3).toFixed(2)} USD
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#040e24] border border-white/10 rounded-3xl p-16 text-center text-white/40">
            Escanea un código de barras para consultar el precio en pantalla.
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // SISTEMA: CAJEROS Y AUDITORÍA
  // ============================================================================
  if (section === "sistema" && subView === "cajeros") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-orange-400" />
            Control de <span className="text-orange-400">Cajeros y Turnos</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Asignación de cajas registradoras, apertura/cierre de turnos de venta y permisos de cobro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cajeros.map(c => (
            <div key={c.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-white">{c.name}</h3>
                  <p className="text-xs text-white/50">{c.register}</p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {c.status}
                </span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/60">Turno iniciado: {c.shiftStart}</span>
                <span className="font-mono font-bold text-white">Ventas turno: ${c.totalSalesShift.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (section === "sistema" && subView === "auditoria") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-slate-400" />
            Bitácora de <span className="text-slate-400">Auditoría del Sistema</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Registro cronológico inmutable de accesos, modificaciones de inventario, cambios de precios y emisiones fiscales.
          </p>
        </div>

        <div className="bg-[#040e24] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 uppercase font-black tracking-wider text-[10px]">
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Módulo</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Detalles</th>
                <th className="p-4">IP / Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-mono text-white/60">{log.timestamp}</td>
                  <td className="p-4 font-bold text-white">{log.user}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sky-400 font-bold">{log.action}</td>
                  <td className="p-4 text-white/70">{log.details}</td>
                  <td className="p-4 font-mono text-white/40">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============================================================================
  // SISTEMA: CONFIGURACIÓN INTEGRAL
  // ============================================================================
  if (section === "sistema" && subView === "configuracion") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            Configuración <span className="text-blue-400">General del Sistema</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Parámetros de empresa, tasas multi-moneda, impuestos (IVA, IGTF), sucursales y opciones de financiamiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white">Datos de la Empresa</h3>
            <div>
              <label className="text-xs text-white/60 block mb-1">Razón Social:</label>
              <input
                type="text"
                disabled
                value="Servicios y Suministros SP, C.A."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">RIF Fiscal:</label>
              <input
                type="text"
                disabled
                value="J-40403649-0"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Sucursal Activa:</label>
              <input
                type="text"
                disabled
                value="Sucursal Principal (El Vigía, Mérida)"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
            </div>
          </div>

          <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white">Tasas e Impuestos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 block mb-1">IVA (%):</label>
                <input
                  type="number"
                  disabled
                  value={settings?.ivaPercent || 16}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">IGTF Divisas (%):</label>
                <input
                  type="number"
                  disabled
                  value={settings?.igtfPercent || 3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
            </div>
            <Button
              onClick={onOpenRateEditor}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl"
            >
              Ajustar Tasas de Cambio Manuales (BCV, Binance, Euro)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // SISTEMA: SOPORTE TÉCNICO Y RESPALDO
  // ============================================================================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-rose-400" />
          Centro de Soporte y <span className="text-rose-400">Respaldo de Datos</span>
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Canal de asistencia para kick-off Commerce / Servicios y Suministros SP, manuales operativos y copias de seguridad de la base de datos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" /> Soporte Técnico Inmediato
          </h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Atención directa para incidencias de facturación, sincronización de tasas BCV o configuración de impresoras térmicas.
          </p>
          <Button
            onClick={() => {
              window.open("https://wa.me/584147550091?text=Hola,%20requiero%20asistencia%20tecnica%20con%20el%20sistema%20ERP%20kick-off%20Commerce", "_blank")
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-xs"
          >
            <MessageCircle className="w-4 h-4" /> Contactar Soporte por WhatsApp
          </Button>
        </div>

        <div className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" /> Copia de Seguridad (Backup)
          </h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Descarga una copia de seguridad íntegra de la base de datos SQLite con todos tus productos, clientes, compras y facturación.
          </p>
          <Button
            onClick={() => showMessage("success", "Copia de seguridad generada y descargada exitosamente.")}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-xs"
          >
            <Download className="w-4 h-4" /> Descargar Backup de Base de Datos
          </Button>
        </div>
      </div>
    </div>
  )
}

