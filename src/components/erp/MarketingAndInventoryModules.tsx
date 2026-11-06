"use client"

import React, { useState, useMemo } from "react"
import {
  Compass,
  Tag,
  BadgePercent,
  LineChart,
  Layers,
  ArrowLeftRight,
  AlertTriangle,
  Printer,
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Package,
  Barcode,
  Truck,
  Sparkles,
  MapPin,
  TrendingUp,
  Share2,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarketingAndInventoryProps {
  section: "marketing" | "inventario"
  subView: string
  products: any[]
  customers: any[]
  settings: any
  formatMoney: (usd: number) => string
  onRefreshAll: () => Promise<void>
  showMessage: (type: "success" | "error", text: string) => void
}

export function MarketingAndInventoryModules({
  section,
  subView,
  products,
  customers,
  settings,
  formatMoney,
  onRefreshAll,
  showMessage,
}: MarketingAndInventoryProps) {
  // Cupones State
  const [coupons, setCoupons] = useState<Array<{
    id: string
    code: string
    discountType: "PERCENT" | "FIXED"
    discountValue: number
    minPurchaseUsd: number
    validUntil: string
    usageLimit: number
    usedCount: number
    status: "ACTIVO" | "AGOTADO"
  }>>([
    {
      id: "cp-1",
      code: "SOLAR-VIGIA-10",
      discountType: "PERCENT",
      discountValue: 10,
      minPurchaseUsd: 150,
      validUntil: "2026-12-31",
      usageLimit: 50,
      usedCount: 14,
      status: "ACTIVO",
    },
    {
      id: "cp-2",
      code: "BIENVENIDA-SP",
      discountType: "FIXED",
      discountValue: 15,
      minPurchaseUsd: 80,
      validUntil: "2026-11-30",
      usageLimit: 100,
      usedCount: 42,
      status: "ACTIVO",
    },
    {
      id: "cp-3",
      code: "BLACK-FRIDAY-20",
      discountType: "PERCENT",
      discountValue: 20,
      minPurchaseUsd: 300,
      validUntil: "2026-11-28",
      usageLimit: 30,
      usedCount: 0,
      status: "ACTIVO",
    },
  ])
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 10,
    minPurchaseUsd: 100,
    validUntil: "2026-12-31",
    usageLimit: 50,
  })

  // Promociones State
  const [promotions, setPromotions] = useState<Array<{
    id: string
    title: string
    category: string
    badge: string
    discountPct: number
    description: string
    activeUntil: string
  }>>([
    {
      id: "promo-1",
      title: "Combo Respaldo Solar Residencial 3kW",
      category: "ENERGÍA SOLAR",
      badge: "COMBO ESTRELLA",
      discountPct: 15,
      description: "Inversor Must 3kW + 2 Baterías Litio 24V 100Ah con 15% de descuento en paquete cerrado.",
      activeUntil: "2026-11-30",
    },
    {
      id: "promo-2",
      title: "Kit CCTV Dahua 4 Cámaras Full HD",
      category: "SEGURIDAD ELECTRÓNICA",
      badge: "INSTALACIÓN GRATIS",
      discountPct: 10,
      description: "Incluye DVR de 4 canales, disco de 1TB, cableado y fuente centralizada para El Vigía.",
      activeUntil: "2026-11-25",
    },
    {
      id: "promo-3",
      title: "Liquidación Sobrestock Routers WiFi 6",
      category: "REDES & TELECOM",
      badge: "LIQUIDACIÓN",
      discountPct: 25,
      description: "Descuento del 25% para compras mayoristas a partir de 3 unidades.",
      activeUntil: "2026-12-15",
    },
  ])

  // Campañas State
  const [campaigns, setCampaigns] = useState<Array<{
    id: string
    name: string
    channel: "WHATSAPP" | "INSTAGRAM" | "DIRECTO"
    targetAudience: string
    messagesSent: number
    clicksCount: number
    conversionsCount: number
    status: "EN_CURSO" | "FINALIZADA"
  }>>([
    {
      id: "cam-1",
      name: "Campaña Temporada de Lluvias - Cero Apagones",
      channel: "WHATSAPP",
      targetAudience: "Comercios y Fincas de El Vigía / Sur del Lago",
      messagesSent: 450,
      clicksCount: 180,
      conversionsCount: 28,
      status: "EN_CURSO",
    },
    {
      id: "cam-2",
      name: "Recordatorios de Cumpleaños & Fidelización",
      channel: "WHATSAPP",
      targetAudience: "Clientes registrados con fecha de nacimiento",
      messagesSent: 120,
      clicksCount: 84,
      conversionsCount: 46,
      status: "EN_CURSO",
    },
  ])

  // Categorías de Inventario State
  const [categoriesList, setCategoriesList] = useState<Array<{
    name: string
    targetMargin: number
    count: number
  }>>([
    { name: "INVERSORES", targetMargin: 25, count: 12 },
    { name: "BATERIAS_LITIO", targetMargin: 22, count: 8 },
    { name: "PANELES_SOLARES", targetMargin: 20, count: 15 },
    { name: "REDES_WIFI", targetMargin: 35, count: 18 },
    { name: "CAMARAS_CCTV", targetMargin: 30, count: 14 },
    { name: "REGULADORES_UPS", targetMargin: 28, count: 7 },
  ])
  const [newCatName, setNewCatName] = useState("")
  const [newCatMargin, setNewCatMargin] = useState(25)

  // Traslados State
  const [traslados, setTraslados] = useState<Array<{
    id: string
    code: string
    fromWarehouse: string
    toWarehouse: string
    itemCount: number
    driver: string
    date: string
    status: "EN_TRANSITO" | "RECIBIDO"
  }>>([
    {
      id: "trs-1",
      code: "TRS-2026-003",
      fromWarehouse: "Almacén Central (El Vigía)",
      toWarehouse: "Móvil Técnico Sur del Lago",
      itemCount: 8,
      driver: "Ing. Javier Guardia",
      date: "2026-11-04",
      status: "EN_TRANSITO",
    },
    {
      id: "trs-2",
      code: "TRS-2026-002",
      fromWarehouse: "Almacén Central (El Vigía)",
      toWarehouse: "Sucursal Tienda Principal",
      itemCount: 25,
      driver: "Carlos Mendoza",
      date: "2026-11-02",
      status: "RECIBIDO",
    },
  ])

  // Ajustes de Inventario State (Mermas / Conteo Físico)
  const [ajustes, setAjustes] = useState<Array<{
    id: string
    code: string
    productName: string
    type: "MERMA" | "CONTEO_FISICO" | "CORRECCION"
    diffQty: number
    costImpact: number
    date: string
    notes: string
  }>>([
    {
      id: "aj-1",
      code: "AJ-0012",
      productName: "ROUTER DAHUA DH-AC12 AC1200 DUAL BAND",
      type: "CONTEO_FISICO",
      diffQty: +2,
      costImpact: 74.0,
      date: "2026-11-03",
      notes: "Conteo físico de auditoría con pistola Roccia",
    },
  ])

  // Impresión de Etiquetas State
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<any>(products[0] || null)
  const [labelQtyToPrint, setLabelQtyToPrint] = useState(12)

  // ============================================================================
  // RENDER: MARKETING -> MAPA COMERCIAL
  // ============================================================================
  if (section === "marketing" && subView === "mapa") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-sky-400" />
            Mapa Comercial y <span className="text-sky-400">Geolocalización</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Distribución geográfica de clientes, cobertura de ventas e instalaciones solares activas en el occidente venezolano.
          </p>
        </div>

        {/* Zones KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { zone: "El Vigía (Alberto Adriani)", clients: 68, activeSolar: 34, status: "Alta Cobertura", color: "text-emerald-400" },
            { zone: "Mérida (Eje Metropolitano)", clients: 42, activeSolar: 22, status: "En Crecimiento", color: "text-blue-400" },
            { zone: "Sur del Lago (Zulia)", clients: 31, activeSolar: 19, status: "Agroindustrial", color: "text-amber-400" },
            { zone: "Táchira (La Tendida / Colón)", clients: 18, activeSolar: 9, status: "Zona Fronteriza", color: "text-purple-400" },
          ].map((z, idx) => (
            <div key={idx} className="bg-[#040e24] border border-white/10 p-5 rounded-3xl space-y-2">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase ${z.color}`}>{z.status}</span>
                <MapPin className="w-4 h-4 text-white/40" />
              </div>
              <h3 className="font-bold text-white text-base">{z.zone}</h3>
              <div className="pt-2 border-t border-white/5 flex justify-between text-xs text-white/60">
                <span>{z.clients} Clientes</span>
                <strong className="text-white">{z.activeSolar} Sistemas Solares</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Simulated Interactive Region Map Widget */}
        <div className="bg-[#040e24] border border-white/10 rounded-3xl p-8 relative overflow-hidden min-h-[360px] flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-center z-10">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Hub Central de Operaciones: El Vigía, Estado Mérida
              </h3>
              <p className="text-xs text-white/50">Coordenadas: 8.6253° N, 71.6508° W — Radio de atención: 180 km</p>
            </div>
            <div className="text-xs font-mono text-white/40 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              159 Clientes Georreferenciados
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 z-10">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black font-mono text-emerald-400">92%</div>
              <div className="text-[10px] uppercase font-bold text-white/60 mt-1">Efectividad Entregas</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black font-mono text-sky-400">24 hrs</div>
              <div className="text-[10px] uppercase font-bold text-white/60 mt-1">Tiempo Resp. Técnico</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black font-mono text-amber-400">$64,500</div>
              <div className="text-[10px] uppercase font-bold text-white/60 mt-1">Ventas Región Sur</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
              <div className="text-2xl font-black font-mono text-purple-400">84 kWp</div>
              <div className="text-[10px] uppercase font-bold text-white/60 mt-1">Energía Solar Instalada</div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-white/40 z-10">
            <span>Servicios y Suministros SP, C.A. — Red de Distribución Comercial</span>
            <Button
              onClick={() => showMessage("success", "Rutas logísticas sincronizadas con Google Maps / GPS de los técnicos.")}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl"
            >
              Exportar Coordenadas GPS
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: MARKETING -> CUPONES Y GIFT CARDS
  // ============================================================================
  if (section === "marketing" && subView === "cupones") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Tag className="w-8 h-8 text-pink-400" />
              Gestor de <span className="text-pink-400">Cupones y Gift Cards</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Crea códigos promocionales de descuento y gift cards canjeables directamente en el Punto de Venta (POS).
            </p>
          </div>
          <Button
            onClick={() => setShowCouponModal(true)}
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Plus className="w-4 h-4" /> Crear Cupón
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map(cp => (
            <div key={cp.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4 hover:border-pink-500/40 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                  {cp.discountType === "PERCENT" ? `${cp.discountValue}% OFF` : `$${cp.discountValue} USD OFF`}
                </span>
                <span className="text-xs font-mono text-white/40">Usados: {cp.usedCount}/{cp.usageLimit}</span>
              </div>

              <div>
                <div className="font-mono text-xl font-black text-white tracking-wider flex items-center gap-2">
                  <span>{cp.code}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cp.code)
                      showMessage("success", `Código ${cp.code} copiado al portapapeles.`)
                    }}
                    className="text-white/40 hover:text-white"
                    title="Copiar código"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/50 mt-1">Compra mínima: ${cp.minPurchaseUsd} USD</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40 text-[11px]">Vence: {cp.validUntil}</span>
                <span className="text-emerald-400 font-bold text-[11px]">Válido en POS</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Crear Cupón */}
        {showCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#040e24] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-xl font-black text-white">Nuevo Cupón de Descuento</h3>
              <input
                type="text"
                placeholder="Código del cupón (ej. SP-VERANO-15) *"
                value={couponForm.code}
                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono uppercase"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={couponForm.discountType}
                  onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
                >
                  <option value="PERCENT" className="bg-[#040e24]">% Porcentaje</option>
                  <option value="FIXED" className="bg-[#040e24]">$ Monto Fijo USD</option>
                </select>
                <input
                  type="number"
                  placeholder="Valor Descuento"
                  value={couponForm.discountValue}
                  onChange={e => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">Compra Mínima ($ USD)</label>
                  <input
                    type="number"
                    value={couponForm.minPurchaseUsd}
                    onChange={e => setCouponForm({ ...couponForm, minPurchaseUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">Límite de Canjes</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={e => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value, 10) || 50 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowCouponModal(false)} className="text-white/60">
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (!couponForm.code.trim()) return
                    setCoupons([
                      {
                        id: `cp-${Date.now()}`,
                        ...couponForm,
                        usedCount: 0,
                        status: "ACTIVO",
                      },
                      ...coupons,
                    ])
                    setShowCouponModal(false)
                    showMessage("success", `Cupón ${couponForm.code} creado exitosamente.`)
                  }}
                  className="bg-pink-500 text-slate-950 font-black rounded-xl"
                >
                  Guardar Cupón
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: MARKETING -> PROMOCIONES Y COMBOS
  // ============================================================================
  if (section === "marketing" && subView === "promociones") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BadgePercent className="w-8 h-8 text-rose-400" />
            Promociones y <span className="text-rose-400">Combos Activos</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Estrategias comerciales de paquetes solares, descuentos 2x1 y liquidación de inventario con margen protegido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4 hover:border-rose-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                    {promo.badge}
                  </span>
                  <span className="text-xs font-mono font-black text-rose-400">-{promo.discountPct}%</span>
                </div>
                <h3 className="text-lg font-black text-white">{promo.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{promo.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40 text-[11px]">Válido hasta: {promo.activeUntil}</span>
                <button
                  onClick={() => showMessage("success", `Promoción "${promo.title}" activa para ventas.`)}
                  className="text-rose-400 hover:text-rose-300 font-bold"
                >
                  Aplicar en POS →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: MARKETING -> CAMPAÑAS
  // ============================================================================
  if (section === "marketing" && subView === "campanas") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <LineChart className="w-8 h-8 text-purple-400" />
            Campañas Comerciales y <span className="text-purple-400">Difusión</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Seguimiento de campañas por WhatsApp Masivo, tasas de conversión y ventas generadas por canal.
          </p>
        </div>

        <div className="space-y-4">
          {campaigns.map(cam => (
            <div key={cam.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {cam.channel}
                  </span>
                  <span className="text-xs font-bold text-white/40">{cam.status}</span>
                </div>
                <h3 className="text-base font-black text-white">{cam.name}</h3>
                <p className="text-xs text-white/60">Audiencia: {cam.targetAudience}</p>
              </div>

              <div className="flex items-center gap-6 self-end md:self-auto text-center">
                <div>
                  <div className="text-lg font-mono font-bold text-white">{cam.messagesSent}</div>
                  <span className="text-[10px] text-white/40 block">Enviados</span>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-sky-400">{cam.clicksCount}</div>
                  <span className="text-[10px] text-white/40 block">Interacciones</span>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-emerald-400">{cam.conversionsCount}</div>
                  <span className="text-[10px] text-white/40 block">Ventas Cerradas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: INVENTARIO -> CATEGORÍAS
  // ============================================================================
  if (section === "inventario" && subView === "categorias") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-amber-400" />
              Gestión de <span className="text-amber-400">Categorías de Catálogo</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Organiza los grupos de productos, define márgenes comerciales objetivo y controla existencias por rubro.
            </p>
          </div>
        </div>

        {/* Add Category Card */}
        <div className="bg-[#040e24] border border-white/10 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Nombre de la nueva categoría (ej. ILUMINACION_SOLAR)..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value.toUpperCase())}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white uppercase"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Margen sugerido:</span>
            <input
              type="number"
              value={newCatMargin}
              onChange={e => setNewCatMargin(parseInt(e.target.value, 10) || 20)}
              className="w-16 bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white font-mono text-center"
            />
            <span className="text-xs text-white/60">%</span>
          </div>
          <Button
            onClick={() => {
              if (!newCatName.trim()) return
              setCategoriesList([...categoriesList, { name: newCatName, targetMargin: newCatMargin, count: 0 }])
              setNewCatName("")
              showMessage("success", `Categoría ${newCatName} agregada al catálogo.`)
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" /> Agregar Categoría
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categoriesList.map((cat, idx) => (
            <div key={idx} className="bg-[#040e24] border border-white/10 rounded-3xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-amber-400">{cat.name}</span>
                <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full font-mono">
                  {cat.count} productos
                </span>
              </div>
              <div className="text-xs text-white/70">
                Margen Sugerido: <strong className="text-emerald-400 font-mono">+{cat.targetMargin}%</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: INVENTARIO -> TRASLADOS ENTRE SUCURSALES
  // ============================================================================
  if (section === "inventario" && subView === "traslados") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ArrowLeftRight className="w-8 h-8 text-indigo-400" />
            Guías de Traslado de <span className="text-indigo-400">Inventario</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Control de transferencias entre Almacén Central de El Vigía y sucursales o unidades móviles de soporte técnico.
          </p>
        </div>

        <div className="space-y-3">
          {traslados.map(tr => (
            <div key={tr.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">{tr.code}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    tr.status === "RECIBIDO" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300 animate-pulse"
                  }`}>
                    {tr.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {tr.fromWarehouse} → <span className="text-indigo-300">{tr.toWarehouse}</span>
                </div>
                <p className="text-xs text-white/50">Responsable / Chofer: {tr.driver} · Fecha: {tr.date}</p>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <span className="font-mono text-xs text-white/70 font-bold">{tr.itemCount} Ítems Transferidos</span>
                {tr.status === "EN_TRANSITO" && (
                  <Button
                    onClick={() => {
                      setTraslados(prev => prev.map(x => (x.id === tr.id ? { ...x, status: "RECIBIDO" } : x)))
                      showMessage("success", `Guía ${tr.code} recibida y stock sumado al destino.`)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                  >
                    Confirmar Recepción
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: INVENTARIO -> AJUSTES Y MERMAS
  // ============================================================================
  if (section === "inventario" && subView === "ajustes") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            Ajustes de Stock y <span className="text-amber-400">Mermas</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Corrección de existencias por conteos físicos con pistola Roccia CBR-8200LW, mermas o roturas justificadas.
          </p>
        </div>

        <div className="space-y-3">
          {ajustes.map(aj => (
            <div key={aj.id} className="bg-[#040e24] border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400">{aj.code}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{aj.productName}</h3>
                <p className="text-xs text-white/50 italic">"{aj.notes}" · {aj.date}</p>
              </div>
              <div className="text-right">
                <div className={`text-base font-mono font-bold ${aj.diffQty >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {aj.diffQty >= 0 ? `+${aj.diffQty}` : aj.diffQty} unidades
                </div>
                <span className="text-xs text-white/40 font-mono">Impacto: ${aj.costImpact.toFixed(2)} USD</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: INVENTARIO -> IMPRESIÓN DE ETIQUETAS DE CÓDIGO DE BARRAS
  // ============================================================================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Printer className="w-8 h-8 text-orange-400" />
          Impresión de Etiquetas de <span className="text-orange-400">Código de Barras</span>
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Genera etiquetas térmicas y autoadhesivas con código EAN/Code128, SKU, nombre y precio en USD y Bs para etiquetar tus productos en tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Select product */}
        <div className="lg:col-span-5 bg-[#040e24] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-white">Configurar Etiqueta</h3>
          <div>
            <label className="text-xs text-white/60 block mb-1">Seleccionar Producto:</label>
            <select
              value={selectedProductForLabel?.id || ""}
              onChange={e => {
                const prod = products.find(p => p.id === e.target.value)
                if (prod) setSelectedProductForLabel(prod)
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-[#040e24]">
                  {p.name} ({p.sku || "Sin SKU"}) - ${p.price?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/60 block mb-1">Cantidad de Etiquetas a Imprimir:</label>
            <input
              type="number"
              min="1"
              value={labelQtyToPrint}
              onChange={e => setLabelQtyToPrint(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
            />
          </div>

          <Button
            onClick={() => {
              window.print()
              showMessage("success", `Enviando ${labelQtyToPrint} etiquetas a la impresora...`)
            }}
            className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Printer className="w-4 h-4" /> Imprimir {labelQtyToPrint} Etiquetas
          </Button>
        </div>

        {/* Right Preview: Label Visual Mockup */}
        <div className="lg:col-span-7 bg-[#040e24] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
          <span className="text-xs uppercase font-black text-white/40 mb-4 tracking-wider">
            Vista Previa de Etiqueta Térmica (50mm x 30mm)
          </span>

          <div className="bg-white text-slate-950 p-5 rounded-2xl shadow-2xl w-72 text-center space-y-2 border-2 border-dashed border-slate-300">
            <div className="text-[10px] font-black tracking-widest uppercase text-slate-600">
              SERVICIOS Y SUMINISTROS SP
            </div>
            <div className="font-extrabold text-xs text-slate-900 line-clamp-2">
              {selectedProductForLabel?.name || "ROUTER WIFI 6 HIKVISION DS-3WR15X"}
            </div>

            {/* Barcode Mock Visual */}
            <div className="py-2 flex flex-col items-center">
              <div className="h-10 w-48 flex items-center justify-center gap-0.5">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2].map((w, i) => (
                  <div key={i} className="h-full bg-black" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="font-mono font-bold text-xs tracking-widest text-slate-800 mt-1">
                {selectedProductForLabel?.sku || "SP-7791823"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <div className="text-left">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Precio Oficial:</span>
                <span className="text-lg font-black font-mono text-emerald-700">
                  ${selectedProductForLabel?.price?.toFixed(2) || "40.00"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">En Bolívares:</span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  Bs. {((selectedProductForLabel?.price || 40) * (settings?.usdToBs || 65.5)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

