"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  DollarSign,
  RefreshCw,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Filter,
  ClipboardList,
  MessageCircle,
  Phone,
  Clock,
  SunMedium,
  Zap,
  BatteryCharging,
  MapPin,
  Building2,
  ShoppingCart,
  Truck,
  CreditCard,
  Landmark,
  BarChart3,
  Wrench,
  Users,
  Coins,
  History,
  Boxes,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SalesAndFinanceModules } from "@/components/erp/SalesAndFinanceModules"
import { TreasuryAndCrmModules } from "@/components/erp/TreasuryAndCrmModules"

interface ProductItem {
  id: string
  sku?: string
  name: string
  category: string
  price: number
  costPrice?: number
  stock?: number
  minStock?: number
  unit?: string
  brand: string | null
  image: string | null
  description: string | null
  features?: string | null
  variants?: string | null
  isBundle?: boolean
  bundleItems?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  invoiceNumber?: string
  customerName: string
  customerDoc?: string
  customerPhone: string | null
  status: string
  paymentCondition?: string
  total: number
  items: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface SolarLeadItem {
  id: string
  customerName: string
  customerPhone: string | null
  customerCity: string | null
  propertyType: string | null
  dailyKwh: number
  inverterCapacity: number
  panelsCount: number
  batteryCapacityAh: number
  priceMin: number
  priceMax: number
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

type ErpTab =
  | "inventario"
  | "ventas"
  | "compras"
  | "cxc_cxp"
  | "bancos"
  | "contabilidad"
  | "crm_vertical"
  | "solar"
  | "usuarios"

export default function AdminDashboard() {
  const sessionObj = useSession()
  const session = sessionObj?.data
  const status = sessionObj?.status || "loading"
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<ErpTab>("inventario")
  const [inventorySubTab, setInventorySubTab] = useState<"catalogo" | "kardex">("catalogo")

  // Multi-currency State
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "BS" | "BINANCE" | "EUR">("USD")
  const [settings, setSettings] = useState<any>({
    usdToBs: 65.5,
    binanceToBs: 78.9,
    eurToBs: 71.2,
    ivaPercent: 16,
    igtfPercent: 3,
    defaultInitialPercent: 40,
    defaultInstallments: 3,
    defaultFrequencyDays: 14,
  })
  const [editingRates, setEditingRates] = useState(false)
  const [syncingRates, setSyncingRates] = useState(false)
  const [rateUsdInput, setRateUsdInput] = useState("65.50")
  const [rateBinanceInput, setRateBinanceInput] = useState("78.90")
  const [rateEurInput, setRateEurInput] = useState("71.20")

  // Products State
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "low_stock">("all")

  // Orders & Solar Leads State
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [solarLeads, setSolarLeads] = useState<SolarLeadItem[]>([])
  const [loadingSolarLeads, setLoadingSolarLeads] = useState(false)
  const [solarStatusFilter, setSolarStatusFilter] = useState("Todos")
  const [solarSearchQuery, setSolarSearchQuery] = useState("")
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({})
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null)

  // ERP State
  const [customers, setCustomers] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [receivables, setReceivables] = useState<any[]>([])
  const [payables, setPayables] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [bankTransactions, setBankTransactions] = useState<any[]>([])
  const [inventoryMovements, setInventoryMovements] = useState<any[]>([])
  const [serviceOrders, setServiceOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    name: "",
    category: "",
    price: 0,
    costPrice: 0,
    stock: 15,
    minStock: 3,
    unit: "UND",
    brand: "",
    image: "",
    description: "",
    featuresList: [] as string[],
    variantsList: [] as Array<{ name: string; price: number; stock: number }>,
    isBundle: false,
    bundleItemsList: [] as Array<{
      productId?: string
      name: string
      quantity: number
      unitCost?: number
      unitPrice?: number
    }>,
    isActive: true,
  })
  const [newFeatureInput, setNewFeatureInput] = useState("")
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPrice, setNewVariantPrice] = useState("")
  const [newVariantStock, setNewVariantStock] = useState("10")
  const [selectedBundleProductId, setSelectedBundleProductId] = useState("")
  const [bundleCustomItemName, setBundleCustomItemName] = useState("")
  const [bundleItemQty, setBundleItemQty] = useState("1")
  const [uploadingImage, setUploadingImage] = useState(false)

  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4500)
  }

  const formatMoney = (usdAmount: number) => {
    const val = Number(usdAmount) || 0
    if (displayCurrency === "BS") {
      return `Bs. ${(val * (settings?.usdToBs || 65.5)).toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    if (displayCurrency === "BINANCE") {
      return `Bs. ${(val * (settings?.binanceToBs || 78.9)).toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    if (displayCurrency === "EUR") {
      const eur = val * ((settings?.usdToBs || 65.5) / (settings?.eurToBs || 71.2))
      return `€${eur.toFixed(2)}`
    }
    return `$${val.toFixed(2)}`
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, router])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products?all=true")
      if (res.ok) {
        setProducts(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        setOrders(await res.json())
      }
    } catch {}
  }

  const fetchSolarLeads = async () => {
    setLoadingSolarLeads(true)
    try {
      const res = await fetch("/api/solar-leads")
      if (res.ok) {
        const data = await res.json()
        setSolarLeads(data)
        const notesMap: { [id: string]: string } = {}
        data.forEach((lead: SolarLeadItem) => {
          notesMap[lead.id] = lead.notes || ""
        })
        setEditingNotes(notesMap)
      }
    } finally {
      setLoadingSolarLeads(false)
    }
  }

  const fetchErpData = async (syncRates = false) => {
    try {
      const res = await fetch(`/api/erp${syncRates ? "?syncRates=true" : ""}`)
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
          setRateUsdInput(String(data.settings.usdToBs))
          setRateBinanceInput(String(data.settings.binanceToBs || 78.9))
          setRateEurInput(String(data.settings.eurToBs))
        }
        setCustomers(data.customers || [])
        setSuppliers(data.suppliers || [])
        setPurchases(data.purchases || [])
        setReceivables(data.receivables || [])
        setPayables(data.payables || [])
        setBankAccounts(data.bankAccounts || [])
        setBankTransactions(data.bankTransactions || [])
        setInventoryMovements(data.inventoryMovements || [])
        setServiceOrders(data.serviceOrders || [])
        setUsers(data.users || [])
      }
    } catch (e) {
      console.error("Error fetching ERP data:", e)
    }
  }

  const handleRefreshAll = async () => {
    await Promise.all([fetchProducts(), fetchOrders(), fetchSolarLeads(), fetchErpData(false)])
  }

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([fetchProducts(), fetchOrders(), fetchSolarLeads(), fetchErpData(true)])
    }
  }, [status])

  const handleSyncLiveRates = async () => {
    setSyncingRates(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC_LIVE_RATES" }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
          setRateUsdInput(String(data.settings.usdToBs))
          setRateBinanceInput(String(data.settings.binanceToBs || 78.9))
          setRateEurInput(String(data.settings.eurToBs))
          showMessage(
            "success",
            `Tasas sincronizadas en vivo: BCV = Bs. ${data.settings.usdToBs.toFixed(2)} | Binance = Bs. ${(data.settings.binanceToBs || 78.9).toFixed(2)} | EUR = Bs. ${data.settings.eurToBs.toFixed(2)}`
          )
        }
      }
    } finally {
      setSyncingRates(false)
    }
  }

  const handleSaveRates = async () => {
    const usdToBs = parseFloat(rateUsdInput) || 65.5
    const binanceToBs = parseFloat(rateBinanceInput) || 78.9
    const eurToBs = parseFloat(rateEurInput) || 71.2
    const res = await fetch("/api/erp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_SETTINGS",
        payload: { usdToBs, binanceToBs, eurToBs },
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setSettings(data.settings)
      setEditingRates(false)
      showMessage(
        "success",
        `Tasas Multi-moneda guardadas: BCV = Bs. ${usdToBs.toFixed(2)} | Binance = Bs. ${binanceToBs.toFixed(2)} | EUR = Bs. ${eurToBs.toFixed(2)}`
      )
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean))
    return ["Todos", ...Array.from(cats).sort()]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)

      const matchesCat = selectedCategory === "Todos" || p.category === selectedCategory

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive) ||
        (statusFilter === "low_stock" && (p.stock ?? 15) <= (p.minStock ?? 3))

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [products, searchQuery, selectedCategory, statusFilter])

  const filteredSolarLeads = useMemo(() => {
    return solarLeads.filter(l => {
      const q = solarSearchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        l.customerName.toLowerCase().includes(q) ||
        (l.customerPhone && l.customerPhone.toLowerCase().includes(q)) ||
        (l.customerCity && l.customerCity.toLowerCase().includes(q))
      const matchesStatus = solarStatusFilter === "Todos" || l.status === solarStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [solarLeads, solarSearchQuery, solarStatusFilter])

  // KPI Metrics
  const totalProducts = products.length
  const lowStockCount = products.filter(p => (p.stock ?? 15) <= (p.minStock ?? 3)).length
  const pendingOrders = orders.filter(o => o.status === "Recibido").length
  const totalCxcBalance = receivables.reduce((acc, r) => acc + (r.balance || 0), 0)
  const totalCxpBalance = payables.reduce((acc, p) => acc + (p.balance || 0), 0)
  const newSolarLeads = solarLeads.filter(l => l.status === "Nuevo").length

  const handleOpenCreate = () => {
    setModalMode("create")
    setFormData({
      id: "",
      sku: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      category: categories[1] || "INVERSORES",
      price: 0,
      costPrice: 0,
      stock: 15,
      minStock: 3,
      unit: "UND",
      brand: "",
      image: "/placeholder-product.png",
      description: "",
      featuresList: [],
      variantsList: [],
      isBundle: false,
      bundleItemsList: [],
      isActive: true,
    })
    setNewFeatureInput("")
    setNewVariantName("")
    setNewVariantPrice("")
    setNewVariantStock("10")
    setSelectedBundleProductId("")
    setBundleCustomItemName("")
    setBundleItemQty("1")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: ProductItem) => {
    setModalMode("edit")
    let parsedFeatures: string[] = []
    let parsedVariants: Array<{ name: string; price: number; stock: number }> = []
    let parsedBundleItems: Array<{ productId?: string; name: string; quantity: number; unitCost?: number; unitPrice?: number }> = []
    try {
      parsedFeatures = JSON.parse(product.features || "[]")
      if (!Array.isArray(parsedFeatures)) parsedFeatures = []
    } catch {
      parsedFeatures = []
    }
    try {
      parsedVariants = JSON.parse(product.variants || "[]")
      if (!Array.isArray(parsedVariants)) parsedVariants = []
    } catch {
      parsedVariants = []
    }
    try {
      parsedBundleItems = JSON.parse(product.bundleItems || "[]")
      if (!Array.isArray(parsedBundleItems)) parsedBundleItems = []
    } catch {
      parsedBundleItems = []
    }

    setFormData({
      id: product.id,
      sku: product.sku || "",
      name: product.name,
      category: product.category,
      price: product.price || 0,
      costPrice: product.costPrice || 0,
      stock: product.stock ?? 15,
      minStock: product.minStock ?? 3,
      unit: product.unit || "UND",
      brand: product.brand || "",
      image: product.image || "/placeholder-product.png",
      description: product.description || "",
      featuresList: parsedFeatures,
      variantsList: parsedVariants,
      isBundle: product.isBundle ?? false,
      bundleItemsList: parsedBundleItems,
      isActive: product.isActive,
    })
    setNewFeatureInput("")
    setNewVariantName("")
    setNewVariantPrice(String(product.price || 0))
    setNewVariantStock(String(product.stock ?? 10))
    setSelectedBundleProductId("")
    setBundleCustomItemName("")
    setBundleItemQty("1")
    setIsModalOpen(true)
  }

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }))
        showMessage("success", "Imagen subida y vinculada a la ficha del producto.")
      } else {
        showMessage("error", data.error || "Error al subir la imagen.")
      }
    } catch {
      showMessage("error", "Error de red al subir la imagen.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAutoGenerateFeatures = () => {
    const auto: string[] = []
    if (formData.brand) auto.push(`Marca / Línea: ${formData.brand}`)
    if (formData.category) auto.push(`Categoría Técnica: ${formData.category}`)
    if (formData.sku) auto.push(`Código de Referencia (SKU): ${formData.sku}`)
    // Extraer posibles especificaciones del nombre (ej. 18W, 85-265V, 12V, 48V, 100Ah, 4K)
    const specsRegex = /\b(\d+(?:W|V|Ah|kVA|kW|MP|K|m|A|Hz|\-\d+V))\b/gi
    const matches = formData.name.match(specsRegex)
    if (matches && matches.length > 0) {
      auto.push(`Especificaciones nominales: ${Array.from(new Set(matches)).join(" / ")}`)
    }
    auto.push("Garantía certificada por Servicios y Suministros SP")
    auto.push("Soporte técnico y asesoría de instalación disponible")
    setFormData(prev => ({
      ...prev,
      featuresList: Array.from(new Set([...prev.featuresList, ...auto])),
    }))
  }

  const handleToggleActive = async (product: ProductItem) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProducts(prev => prev.map(p => (p.id === product.id ? updated : p)))
      showMessage("success", `Producto "${product.name}" ${updated.isActive ? "activado" : "ocultado"}.`)
    }
  }

  const handleQuickStockAdjust = async (product: ProductItem, delta: number) => {
    const newStock = Math.max(0, (product.stock ?? 15) + delta)
    const res = await fetch("/api/erp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ADJUST_INVENTORY",
        payload: {
          productId: product.id,
          type: delta > 0 ? "ENTRADA" : "SALIDA",
          quantity: Math.abs(delta),
          reference: "RAPIDO-PANEL",
          notes: `Ajuste rápido (${delta > 0 ? "+1" : "-1"}) en tabla de inventario`,
        },
      }),
    })
    if (res.ok) {
      setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, stock: newStock } : p)))
      fetchErpData()
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)))
      showMessage("success", `Estado actualizado a "${newStatus}".`)
      if (newStatus === "Completado") {
        fetchProducts()
        fetchErpData()
      }
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("¿Deseas eliminar este registro?")) return
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
    if (res.ok) {
      setOrders(prev => prev.filter(o => o.id !== orderId))
      showMessage("success", "Registro eliminado.")
    }
  }

  // Convert Solar Lead into Technical Service Order + CRM Customer
  const handleConvertSolarToServiceOrder = async (lead: SolarLeadItem) => {
    await fetch("/api/erp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SAVE_SERVICE_ORDER",
        payload: {
          customerName: lead.customerName,
          customerPhone: lead.customerPhone || "",
          customerCity: lead.customerCity || "El Vigía",
          serviceType: "ENERGIA_SOLAR",
          technicianName: "Ing. Guardia SP",
          status: "VISITA_AGENDADA",
          scheduledDate: new Date().toISOString().split("T")[0],
          laborCost: 250,
          materialsCost: lead.priceMin || 1200,
          notes: `Kit Solar ${lead.inverterCapacity}kVA + ${lead.panelsCount} paneles + ${lead.batteryCapacityAh}Ah (${lead.dailyKwh} kWh/día)`,
        },
      }),
    })
    await fetch("/api/erp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SAVE_CUSTOMER",
        payload: {
          name: lead.customerName,
          phone: lead.customerPhone || "",
          city: lead.customerCity || "El Vigía",
          type: lead.propertyType === "Comercial" ? "EMPRESA" : "PERSONA",
          stage: "COTIZADO",
          notes: `Lead Solar: ${lead.inverterCapacity}kVA`,
        },
      }),
    })
    showMessage("success", `¡Estudio solar de ${lead.customerName} convertido en Orden de Instalación y agregado al CRM!`)
    await fetchErpData()
    setActiveTab("crm_vertical")
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = modalMode === "create" ? "/api/products" : `/api/products/${formData.id}`
      const method = modalMode === "create" ? "POST" : "PUT"
      const payload = {
        ...formData,
        features: JSON.stringify(formData.featuresList || []),
        variants: JSON.stringify(formData.variantsList || []),
        isBundle: formData.isBundle,
        bundleItems: JSON.stringify(formData.bundleItemsList || []),
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setIsModalOpen(false)
        showMessage("success", modalMode === "create" ? "¡Producto creado con éxito!" : "¡Producto actualizado!")
        await handleRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
        setProductToDelete(null)
        showMessage("success", "Producto eliminado correctamente.")
      }
    } finally {
      setDeleting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
        <p className="text-white/60 font-medium">Cargando Sistema de Gestión Comercial SP Cloud...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#020813] text-foreground font-sans pb-24">
      {/* Top Cloud ERP Header with Multi-Currency Engine */}
      <header className="sticky top-0 z-40 bg-[#041124]/95 backdrop-blur-xl border-b border-white/10 py-3">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/LogoServicios-SP.png"
                alt="Logo Servicios SP"
                width={115}
                height={38}
                className="object-contain"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> SP Cloud ERP
            </div>
          </div>

          {/* Multi-Currency Bar (BCV - Binance - EUR) */}
          <div className="flex flex-wrap items-center gap-3 bg-white/[0.03] border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs">
              <Coins className="w-4 h-4 text-secondary" />
              <span className="text-white/50 font-bold hidden xl:inline">Multi-moneda:</span>
            </div>

            {editingRates ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-green-400 font-bold">BCV $:</span>
                <input
                  type="number"
                  step="0.01"
                  value={rateUsdInput}
                  onChange={e => setRateUsdInput(e.target.value)}
                  className="w-20 bg-[#020813] border border-secondary rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-amber-400 font-bold">Binance:</span>
                <input
                  type="number"
                  step="0.01"
                  value={rateBinanceInput}
                  onChange={e => setRateBinanceInput(e.target.value)}
                  className="w-20 bg-[#020813] border border-secondary rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-blue-400 font-bold">EUR €:</span>
                <input
                  type="number"
                  step="0.01"
                  value={rateEurInput}
                  onChange={e => setRateEurInput(e.target.value)}
                  className="w-20 bg-[#020813] border border-secondary rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
                <button
                  onClick={handleSaveRates}
                  className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <button
                  onClick={() => setEditingRates(true)}
                  className="text-white/80 hover:text-secondary flex flex-wrap items-center gap-2"
                  title="Haz clic para editar las tasas manualmente"
                >
                  <span>
                    BCV: <strong className="text-green-400">Bs.{settings?.usdToBs?.toFixed(2)}</strong>
                  </span>
                  <span className="text-white/20">|</span>
                  <span>
                    Binance: <strong className="text-amber-400">Bs.{(settings?.binanceToBs || 78.9).toFixed(2)}</strong>
                  </span>
                  <span className="text-white/20">|</span>
                  <span>
                    1€ = <strong className="text-blue-400">Bs.{settings?.eurToBs?.toFixed(2)}</strong>
                  </span>
                  <Edit2 className="w-3 h-3 text-secondary" />
                </button>
                <button
                  onClick={handleSyncLiveRates}
                  disabled={syncingRates}
                  title="Sincronizar tasa actual BCV y Binance P2P en vivo"
                  className="p-1 rounded-lg bg-white/5 hover:bg-secondary/20 text-white/70 hover:text-secondary transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingRates ? "animate-spin text-secondary" : ""}`} />
                </button>
              </div>
            )}

            <div className="flex bg-[#020813] p-0.5 rounded-xl border border-white/10">
              {(
                [
                  { id: "USD", label: "USD" },
                  { id: "BS", label: "BS BCV" },
                  { id: "BINANCE", label: "BINANCE" },
                  { id: "EUR", label: "EUR" },
                ] as const
              ).map(curr => (
                <button
                  key={curr.id}
                  onClick={() => setDisplayCurrency(curr.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    displayCurrency === curr.id ? "bg-secondary text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {curr.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white/80 hover:text-white rounded-xl gap-1.5 text-xs"
              asChild
            >
              <Link href="/productos" target="_blank">
                Tienda <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8">
        {/* Executive ERP Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          <div
            onClick={() => setActiveTab("inventario")}
            className="bg-[#041124]/60 hover:bg-[#041124] cursor-pointer p-4 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center justify-between">
              <span>Inventario</span>
              <Package className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-xl font-black text-white mt-1">{totalProducts} ítems</div>
            <div className="text-[11px] text-amber-400 font-bold">
              {lowStockCount > 0 ? `⚠️ ${lowStockCount} stock bajo` : "Stock óptimo"}
            </div>
          </div>

          <div
            onClick={() => setActiveTab("ventas")}
            className="bg-[#041124]/60 hover:bg-[#041124] cursor-pointer p-4 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center justify-between">
              <span>Ventas / POS</span>
              <ShoppingCart className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{orders.length} órdenes</div>
            <div className="text-[11px] text-secondary font-bold">{pendingOrders} cotiz. nuevas</div>
          </div>

          <div
            onClick={() => setActiveTab("cxc_cxp")}
            className="bg-[#041124]/60 hover:bg-[#041124] cursor-pointer p-4 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center justify-between">
              <span>Por Cobrar (CxC)</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-400 font-mono mt-1">{formatMoney(totalCxcBalance)}</div>
            <div className="text-[11px] text-white/50">{receivables.length} planes en cuotas</div>
          </div>

          <div
            onClick={() => setActiveTab("cxc_cxp")}
            className="bg-[#041124]/60 hover:bg-[#041124] cursor-pointer p-4 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center justify-between">
              <span>Por Pagar (CxP)</span>
              <Truck className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-lg font-black text-red-400 font-mono mt-1">{formatMoney(totalCxpBalance)}</div>
            <div className="text-[11px] text-white/50">{suppliers.length} proveedores</div>
          </div>

          <div
            onClick={() => setActiveTab("bancos")}
            className="bg-[#041124]/60 hover:bg-[#041124] cursor-pointer p-4 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center justify-between">
              <span>Bancos y Cajas</span>
              <Landmark className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-green-400 font-mono mt-1">{bankAccounts.length} cuentas</div>
            <div className="text-[11px] text-white/50">USD · Bs · EUR</div>
          </div>

          <div
            onClick={() => setActiveTab("crm_vertical")}
            className="bg-[#041124]/60 hover:bg-[#041124] cursor-pointer p-4 rounded-2xl border border-white/5 transition-all"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 flex items-center justify-between">
              <span>Vertical & CRM</span>
              <Wrench className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-xl font-black text-white mt-1">{serviceOrders.length} instalac.</div>
            <div className="text-[11px] text-green-400">{customers.length} clientes CRM</div>
          </div>
        </div>

        {/* Full ERP Module Navigation Bar */}
        <div className="flex flex-wrap border-b border-white/10 mb-8 gap-2 sm:gap-4">
          {[
            { id: "inventario", label: "Inventario & Kardex", icon: Package },
            { id: "ventas", label: "Ventas & POS (Cuotas)", icon: ShoppingCart, badge: pendingOrders },
            { id: "compras", label: "Compras & Proveedores", icon: Truck },
            { id: "cxc_cxp", label: "CxC (Cuotas) & CxP", icon: CreditCard },
            { id: "bancos", label: "Bancos Multi-moneda", icon: Landmark },
            { id: "contabilidad", label: "Contabilidad", icon: BarChart3 },
            { id: "crm_vertical", label: "CRM & Vertical SP", icon: Wrench },
            { id: "solar", label: "Leads Solares", icon: SunMedium, badge: newSolarLeads },
            { id: "usuarios", label: "Usuarios", icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ErpTab)}
              className={`pb-3.5 px-2 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? "border-secondary text-white"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4 text-secondary" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="bg-secondary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Notification Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="text-sm font-semibold">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ====================================================================
            TAB 1: INVENTARIO AVANZADO & KARDEX
           ==================================================================== */}
        {activeTab === "inventario" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Control de <span className="text-secondary">Inventario y Kardex</span>
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Gestión de existencias reales, SKU, costos de reposición, márgenes de ganancia y auditoría de entradas/salidas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-[#041124] p-1 rounded-2xl border border-white/10">
                  <button
                    onClick={() => setInventorySubTab("catalogo")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                      inventorySubTab === "catalogo" ? "bg-secondary text-white" : "text-white/50"
                    }`}
                  >
                    Existencias ({products.length})
                  </button>
                  <button
                    onClick={() => setInventorySubTab("kardex")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 ${
                      inventorySubTab === "kardex" ? "bg-secondary text-white" : "text-white/50"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" /> Kardex ({inventoryMovements.length})
                  </button>
                </div>

                <Button
                  onClick={handleOpenCreate}
                  className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl gap-2"
                >
                  <Plus className="w-4 h-4" /> Nuevo Producto
                </Button>
              </div>
            </div>

            {inventorySubTab === "catalogo" ? (
              <>
                {/* Search & Filters */}
                <div className="bg-[#041124]/40 p-5 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, SKU, marca o categoría..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white text-xs focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white">
                      <Filter className="w-3.5 h-3.5 text-secondary" />
                      <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-[#041124] text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 text-xs font-bold">
                      {[
                        { id: "all", label: "Todos" },
                        { id: "active", label: "Activos" },
                        { id: "low_stock", label: `Stock Bajo (${lowStockCount})` },
                        { id: "inactive", label: "Ocultos" },
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setStatusFilter(st.id as any)}
                          className={`px-3 py-1.5 rounded-xl transition-colors ${
                            statusFilter === st.id ? "bg-secondary text-white" : "text-white/60 hover:text-white"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-[#041124]/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/[0.02]">
                          <th className="py-4 px-5">SKU / Equipo</th>
                          <th className="py-4 px-4">Categoría</th>
                          <th className="py-4 px-4">Stock Actual</th>
                          <th className="py-4 px-4">Costo ($ USD)</th>
                          <th className="py-4 px-4">Precio Venta ({displayCurrency})</th>
                          <th className="py-4 px-4">Margen</th>
                          <th className="py-4 px-4">Estado</th>
                          <th className="py-4 px-5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {filteredProducts.map(product => {
                          const stockVal = product.stock ?? 15
                          const minVal = product.minStock ?? 3
                          const costVal = product.costPrice || 0
                          const priceVal = product.price || 0
                          const marginPct =
                            priceVal > 0 && costVal > 0
                              ? Math.round(((priceVal - costVal) / priceVal) * 100)
                              : 32

                          return (
                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-secondary font-bold">
                                    {product.sku || "SP"}
                                  </span>
                                  <div>
                                    <div className="font-bold text-white line-clamp-1 max-w-xs flex items-center gap-2">
                                      <span>{product.name}</span>
                                      {product.isBundle && (
                                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                                          <Gift className="w-3 h-3 text-purple-400" /> KIT
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-white/40">{product.brand || "SP"}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">
                                  {product.category}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuickStockAdjust(product, -1)}
                                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-white flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <span
                                    className={`font-mono font-black px-2.5 py-0.5 rounded-lg ${
                                      stockVal <= minVal
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                        : "bg-green-500/15 text-green-400"
                                    }`}
                                  >
                                    {stockVal} {product.unit || "UND"}
                                  </span>
                                  <button
                                    onClick={() => handleQuickStockAdjust(product, 1)}
                                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-white flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-white/70">
                                ${costVal.toFixed(2)}
                              </td>

                              <td className="py-3.5 px-4 font-mono font-black text-green-400 text-sm">
                                {priceVal > 0 ? formatMoney(priceVal) : "A Consultar"}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-[11px] font-mono text-blue-400 font-bold">
                                  +{marginPct}%
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => handleToggleActive(product)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    product.isActive
                                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                      : "bg-white/5 text-white/40"
                                  }`}
                                >
                                  {product.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  {product.isActive ? "Activo" : "Oculto"}
                                </button>
                              </td>

                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    onClick={() => handleOpenEdit(product)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2.5 border-white/10 text-white/80 rounded-xl text-xs"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-secondary" />
                                  </Button>
                                  <Button
                                    onClick={() => setProductToDelete(product)}
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 w-8 p-0 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Kardex de Movimientos de Inventario */
              <div className="bg-[#041124]/40 rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <th className="p-4">Fecha / Hora</th>
                      <th className="p-4">Producto</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Cantidad</th>
                      <th className="p-4">Stock Ant. → Nuevo</th>
                      <th className="p-4">Referencia / Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventoryMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-white/40">
                          Aún no hay movimientos en el Kardex. Se registran automáticamente con cada venta, compra o ajuste de stock.
                        </td>
                      </tr>
                    ) : (
                      inventoryMovements.map(mov => (
                        <tr key={mov.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 text-white/50">{new Date(mov.createdAt).toLocaleString()}</td>
                          <td className="p-4 font-bold text-white">{mov.productName}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                mov.type === "ENTRADA"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {mov.type}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-white">{mov.quantity}</td>
                          <td className="p-4 font-mono text-white/60">
                            {mov.previousStock} → <strong className="text-white">{mov.newStock}</strong>
                          </td>
                          <td className="p-4 text-white/70">
                            <span className="font-mono text-secondary mr-2">{mov.reference}</span>
                            {mov.notes}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TABS 2, 3, 4: VENTAS/POS, COMPRAS, CXC/CXP
           ==================================================================== */}
        {(activeTab === "ventas" || activeTab === "compras" || activeTab === "cxc_cxp") && (
          <SalesAndFinanceModules
            activeSubModule={activeTab}
            products={products}
            orders={orders}
            customers={customers}
            suppliers={suppliers}
            purchases={purchases}
            receivables={receivables}
            payables={payables}
            bankAccounts={bankAccounts}
            settings={settings}
            formatMoney={formatMoney}
            onRefreshAll={handleRefreshAll}
            showMessage={showMessage}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {/* ====================================================================
            TABS 5, 6, 7, 9: BANCOS, CONTABILIDAD, CRM/VERTICAL, USUARIOS
           ==================================================================== */}
        {(activeTab === "bancos" ||
          activeTab === "contabilidad" ||
          activeTab === "crm_vertical" ||
          activeTab === "usuarios") && (
          <TreasuryAndCrmModules
            activeSubModule={activeTab}
            products={products}
            orders={orders}
            customers={customers}
            purchases={purchases}
            receivables={receivables}
            payables={payables}
            bankAccounts={bankAccounts}
            bankTransactions={bankTransactions}
            serviceOrders={serviceOrders}
            users={users}
            settings={settings}
            formatMoney={formatMoney}
            onRefreshAll={handleRefreshAll}
            showMessage={showMessage}
          />
        )}

        {/* ====================================================================
            TAB 8: PROSPECTOS DE CALCULADORA SOLAR
           ==================================================================== */}
        {activeTab === "solar" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Prospectos de <span className="text-secondary">Calculadora Solar</span>
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Convierte estudios fotovoltaicos en Órdenes de Instalación Técnica y clientes del CRM con un clic.
                </p>
              </div>
            </div>

            {filteredSolarLeads.length === 0 ? (
              <div className="bg-[#041124]/30 p-16 rounded-3xl border border-white/5 text-center text-white/50">
                No hay prospectos solares registrados.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSolarLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="bg-[#041124]/40 p-6 rounded-3xl border border-white/5 flex flex-col lg:flex-row justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white">{lead.customerName}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                          {lead.status}
                        </span>
                        <span className="text-xs text-white/40">{lead.customerCity}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 text-xs">
                        <div>
                          <span className="text-white/40 block">Consumo:</span>
                          <strong className="font-mono text-white">{lead.dailyKwh} kWh/día</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">Inversor:</span>
                          <strong className="font-mono text-secondary">{lead.inverterCapacity} kVA</strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">Paneles / Batería:</span>
                          <strong className="font-mono text-white">
                            {lead.panelsCount}u / {lead.batteryCapacityAh}Ah
                          </strong>
                        </div>
                        <div>
                          <span className="text-white/40 block">Presupuesto Est.:</span>
                          <strong className="font-mono text-green-400">
                            ${lead.priceMin} - ${lead.priceMax}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 min-w-[230px]">
                      <Button
                        onClick={() => handleConvertSolarToServiceOrder(lead)}
                        className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl text-xs gap-2"
                      >
                        <Wrench className="w-4 h-4" /> Crear Orden de Instalación + CRM
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE / EDIT PRODUCT MODAL (Enhanced with SKU, CostPrice, Stock, MinStock) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#041124] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-2xl font-black text-white">
                {modalMode === "create" ? "Crear Nuevo Producto (ERP)" : "Modificar Ficha de Producto"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">Categoría *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                    Costo Compra ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-amber-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                    Precio Venta ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-green-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">Alerta Mínimo</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Image Upload & Preview Section */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-secondary">
                  Imagen del Producto (Subir Archivo o URL)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image && formData.image !== "/placeholder-product.png" ? (
                      <img
                        src={formData.image}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={e => {
                          ;(e.target as any).style.display = "none"
                        }}
                      />
                    ) : (
                      <Package className="w-8 h-8 text-white/20" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer bg-secondary hover:bg-secondary/90 text-white text-xs font-black px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-lg transition-all">
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>{uploadingImage ? "Subiendo imagen..." : "Subir Imagen desde mi Equipo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      {formData.image && formData.image !== "/placeholder-product.png" && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "/placeholder-product.png" })}
                          className="text-xs text-red-400 hover:underline px-2 py-1"
                        >
                          Quitar imagen
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      placeholder="O pega aquí una URL de imagen (https://... o /uploads/...)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                  Descripción Comercial para el Cliente
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe los beneficios, aplicaciones y detalles generales del equipo..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs"
                />
              </div>

              {/* Technical Characteristics (Features) */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-secondary">
                    Características y Especificaciones Técnicas ({formData.featuresList.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateFeatures}
                    className="text-[10px] font-bold bg-secondary/15 hover:bg-secondary/25 text-secondary px-2.5 py-1 rounded-lg border border-secondary/30 transition-colors"
                  >
                    ✨ Auto-extraer características
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={e => setNewFeatureInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newFeatureInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            featuresList: [...prev.featuresList, newFeatureInput.trim()],
                          }))
                          setNewFeatureInput("")
                        }
                      }
                    }}
                    placeholder="Ej: Voltaje de entrada: 85-265V AC / Potencia: 18W / Garantía: 1 Año"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!newFeatureInput.trim()) return
                      setFormData(prev => ({
                        ...prev,
                        featuresList: [...prev.featuresList, newFeatureInput.trim()],
                      }))
                      setNewFeatureInput("")
                    }}
                    className="bg-white/10 hover:bg-secondary text-white font-black rounded-xl text-xs px-4"
                  >
                    + Agregar
                  </Button>
                </div>

                {formData.featuresList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.featuresList.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#020813] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/90"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({
                              ...prev,
                              featuresList: prev.featuresList.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-white/40 hover:text-red-400 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Variants */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-secondary">
                  Variantes del Producto (Opcional: Potencia, Capacidad, Color o Presentación) ({formData.variantsList.length})
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={e => setNewVariantName(e.target.value)}
                    placeholder="Nombre variante (Ej: 18W Luz Blanca / 24W / Con Instalación)"
                    className="sm:col-span-6 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={newVariantPrice}
                    onChange={e => setNewVariantPrice(e.target.value)}
                    placeholder="Precio $ USD"
                    className="sm:col-span-3 bg-white/5 border border-white/10 rounded-xl p-2.5 text-green-400 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!newVariantName.trim()) return
                      setFormData(prev => ({
                        ...prev,
                        variantsList: [
                          ...prev.variantsList,
                          {
                            name: newVariantName.trim(),
                            price: parseFloat(newVariantPrice) || prev.price || 0,
                            stock: parseInt(newVariantStock, 10) || 10,
                          },
                        ],
                      }))
                      setNewVariantName("")
                    }}
                    className="sm:col-span-3 bg-white/10 hover:bg-secondary text-white font-black rounded-xl text-xs"
                  >
                    + Variante
                  </Button>
                </div>

                {formData.variantsList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formData.variantsList.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-[#020813] border border-white/10 px-3.5 py-2 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-bold text-white">{v.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-green-400 font-bold">
                            ${Number(v.price).toFixed(2)} USD
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                variantsList: prev.variantsList.filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Bundle / Kit Component (BOM) */}
              <div
                className={`border rounded-2xl p-4 space-y-4 transition-all ${
                  formData.isBundle
                    ? "bg-purple-950/20 border-purple-500/40 shadow-lg shadow-purple-950/30"
                    : "bg-white/[0.02] border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-400" />
                      <label className="text-xs font-black uppercase tracking-wider text-purple-300">
                        ¿Es un Producto Compuesto / Kit / Combo?
                      </label>
                    </div>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      Activa esta opción para kits que incluyen múltiples productos y accesorios (ej: Kit Solar, Kit CCTV, etc.)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isBundle: !prev.isBundle }))}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      formData.isBundle
                        ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40"
                        : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                    }`}
                  >
                    {formData.isBundle ? "✓ Sí, es un Kit / Combo" : "Producto Simple"}
                  </button>
                </div>

                {formData.isBundle && (
                  <div className="space-y-4 pt-3 border-t border-purple-500/20">
                    <div className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5" /> Componentes Incluidos en este Kit ({formData.bundleItemsList.length})
                      </span>
                      {formData.bundleItemsList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const totalCost = formData.bundleItemsList.reduce(
                              (sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 1),
                              0
                            )
                            const totalPrice = formData.bundleItemsList.reduce(
                              (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
                              0
                            )
                            setFormData(prev => ({
                              ...prev,
                              costPrice: totalCost > 0 ? Number(totalCost.toFixed(2)) : prev.costPrice,
                              price: totalPrice > 0 ? Number(totalPrice.toFixed(2)) : prev.price,
                            }))
                            showMessage("success", `Precios auto-calculados: Costo $${totalCost.toFixed(2)} | Venta $${totalPrice.toFixed(2)}`)
                          }}
                          className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 px-2.5 py-1 rounded-lg transition-all"
                        >
                          ⚡ Auto-calcular Costo y Precio desde componentes
                        </button>
                      )}
                    </div>

                    {/* Add Component to Kit */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#020813] p-3 rounded-xl border border-white/10">
                      <div className="sm:col-span-5">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">
                          Elegir del Inventario
                        </label>
                        <select
                          value={selectedBundleProductId}
                          onChange={e => {
                            setSelectedBundleProductId(e.target.value)
                            const found = products.find(p => p.id === e.target.value)
                            if (found) {
                              setBundleCustomItemName(found.name)
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-xs"
                        >
                          <option value="" className="bg-[#041124]">-- Seleccionar producto --</option>
                          {products
                            .filter(p => p.id !== formData.id)
                            .map(p => (
                              <option key={p.id} value={p.id} className="bg-[#041124]">
                                {p.name} (${Number(p.price || 0).toFixed(2)})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">
                          O Nombre Personalizado / Accesorio
                        </label>
                        <input
                          type="text"
                          value={bundleCustomItemName}
                          onChange={e => setBundleCustomItemName(e.target.value)}
                          placeholder="Ej: Cable Solar 10AWG (20m)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">
                          Cant.
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bundleItemQty}
                          onChange={e => setBundleItemQty(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white font-mono text-xs text-center"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const nameToAdd = bundleCustomItemName.trim()
                            if (!nameToAdd) return
                            const matchedProd = products.find(p => p.id === selectedBundleProductId)
                            const qty = parseInt(bundleItemQty, 10) || 1
                            const unitCost = matchedProd?.costPrice || 0
                            const unitPrice = matchedProd?.price || 0

                            setFormData(prev => ({
                              ...prev,
                              bundleItemsList: [
                                ...prev.bundleItemsList,
                                {
                                  productId: selectedBundleProductId || undefined,
                                  name: nameToAdd,
                                  quantity: qty,
                                  unitCost,
                                  unitPrice,
                                },
                              ],
                            }))
                            setSelectedBundleProductId("")
                            setBundleCustomItemName("")
                            setBundleItemQty("1")
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl p-2 text-xs uppercase tracking-wider transition-all"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>

                    {/* Table / List of Added Components */}
                    {formData.bundleItemsList.length > 0 ? (
                      <div className="space-y-1.5">
                        {formData.bundleItemsList.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-[#020813] border border-purple-500/20 px-3.5 py-2 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-mono font-black text-purple-300 text-xs">
                                x{item.quantity}
                              </span>
                              <div>
                                <span className="font-bold text-white">{item.name}</span>
                                {item.unitPrice !== undefined && item.unitPrice > 0 && (
                                  <span className="text-[10px] text-white/40 block">
                                    Ref: ${Number(item.unitPrice).toFixed(2)} c/u · Subtotal: ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData(prev => ({
                                  ...prev,
                                  bundleItemsList: prev.bundleItemsList.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-white/40 italic bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                        Aún no has agregado componentes a este kit. Selecciona productos arriba para armar el paquete.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="bg-secondary text-white font-black">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Guardar Producto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#041124] border border-red-500/20 rounded-3xl w-full max-w-md p-8 text-center">
            <h3 className="text-xl font-black text-white mb-2">¿Eliminar Producto?</h3>
            <p className="text-white/60 text-xs mb-6">{productToDelete.name}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setProductToDelete(null)}>
                Cancelar
              </Button>
              <Button onClick={handleDeleteProduct} disabled={deleting} className="bg-red-600 text-white font-black">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
