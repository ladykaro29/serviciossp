"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
  LayoutDashboard,
  Receipt,
  Settings,
  Bell,
  Moon,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BadgePercent,
  Bot,
  Menu,
  Sparkles,
  FileText,
  Calendar,
  HandCoins,
  PackageCheck,
  Tag,
  RotateCcw,
  CheckSquare,
  ArrowLeftRight,
  AlertTriangle,
  Printer,
  HelpCircle,
  Sliders,
  Tv,
  PieChart,
  Brain,
  ShieldAlert,
  LineChart,
  FileCode,
  UserCheck,
  Compass,
  Barcode,
  Scan,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SalesAndFinanceModules } from "@/components/erp/SalesAndFinanceModules"
import { TreasuryAndCrmModules } from "@/components/erp/TreasuryAndCrmModules"
import { SalesExtendedModules } from "@/components/erp/SalesExtendedModules"
import { MarketingAndInventoryModules } from "@/components/erp/MarketingAndInventoryModules"
import { AnalyticsAndSystemModules } from "@/components/erp/AnalyticsAndSystemModules"

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
  | "dashboard"
  | "inventario"
  | "ventas"
  | "compras"
  | "cxc_cxp"
  | "bancos"
  | "contabilidad"
  | "crm_vertical"
  | "solar"
  | "usuarios"
  | "marketing"
  | "finanzas"
  | "analisis"
  | "sistema"

export default function AdminDashboard() {
  const sessionObj = useSession()
  const session = sessionObj?.data
  const status = sessionObj?.status || "loading"
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<ErpTab>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardMetricView, setDashboardMetricView] = useState<"ventas" | "margen">("ventas")
  const [inventorySubTab, setInventorySubTab] = useState<
    "catalogo" | "kardex" | "categorias" | "traslados" | "ajustes" | "etiquetas"
  >("catalogo")
  const [salesSubView, setSalesSubView] = useState<
    "pos" | "orders" | "debit_notes" | "cotizaciones" | "facturas" | "devoluciones" | "verificador_salida" | "vendedores" | "rutas"
  >("pos")
  const [purchasesSubView, setPurchasesSubView] = useState<
    "new_purchase" | "history" | "suppliers" | "debit_notes" | "credit_notes" | "retenciones" | "predictive"
  >("new_purchase")
  const [marketingSubView, setMarketingSubView] = useState<
    "mapa" | "cupones" | "promociones" | "campanas"
  >("mapa")
  const [financeSubView, setFinanceSubView] = useState<
    "precios" | "gastos"
  >("precios")
  const [analisisSubView, setAnalisisSubView] = useState<
    "cierre_caja" | "rep_avanzados" | "detector_fugas" | "guardian_margenes" | "analytics_bi" | "ia_negocio"
  >("cierre_caja")
  const [sistemaSubView, setSistemaSubView] = useState<
    "format_builder" | "visor_precios" | "cajeros" | "auditoria" | "configuracion" | "soporte"
  >("format_builder")
  const [cxcSubTab, setCxcSubTab] = useState<"cxc" | "cxp">("cxc")
  const [crmSubTab, setCrmSubTab] = useState<"vertical" | "clientes">("vertical")

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

  // Roccia CBR-8200LW Barcode Scanner Engine (Inventory & Catalog Intake)
  const [inventoryScanMode, setInventoryScanMode] = useState<"quick_stock" | "search">("quick_stock")
  const [scanStockBatchQty, setScanStockBatchQty] = useState<number>(1)
  const [lastRocciaScan, setLastRocciaScan] = useState<string | null>(null)
  const rocciaBufferRef = useRef("")
  const lastRocciaKeyTimeRef = useRef(0)
  const prodNameInputRef = useRef<HTMLInputElement | null>(null)
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

  const inventoryUsdValue = useMemo(() => {
    return products.reduce((sum, p) => {
      const unitVal = Number(p.costPrice || p.price || 0)
      return sum + unitVal * (p.stock ?? 15)
    }, 0)
  }, [products])

  const totalVentasBilled = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  }, [orders])

  const totalCobrado = useMemo(() => {
    return receivables.reduce((sum, r) => sum + ((Number(r.amount) || 0) - (Number(r.balance) || 0)), 0)
  }, [receivables])

  const currentDateFormatted = useMemo(() => {
    const now = new Date()
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]
    return `${days[now.getDay()]}, ${now.getDate()} De ${months[now.getMonth()]} De ${now.getFullYear()}`
  }, [])

  const greetingText = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }, [])

  const brechaPct = useMemo(() => {
    const bcv = settings?.usdToBs || 65.5
    const binance = settings?.binanceToBs || 78.9
    if (!bcv) return "0.0"
    return (((binance - bcv) / bcv) * 100).toFixed(1)
  }, [settings])

  // Documentos por vencer calculation (from reference)
  const docsDueStats = useMemo(() => {
    const now = new Date().getTime()
    let vencidos = 0
    let a7Dias = 0
    let a30Dias = 0
    let a60Dias = 0

    const checkDoc = (dueDateStr?: string | null) => {
      if (!dueDateStr) return
      const due = new Date(dueDateStr).getTime()
      const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) vencidos++
      else if (diffDays <= 7) a7Dias++
      else if (diffDays <= 30) a30Dias++
      else if (diffDays <= 60) a60Dias++
    }

    receivables.forEach(r => checkDoc(r.dueDate))
    payables.forEach(p => checkDoc(p.dueDate))

    return { vencidos, a7Dias, a30Dias, a60Dias }
  }, [receivables, payables])

  // Tasa de cobro
  const tasaCobroPct = useMemo(() => {
    if (totalVentasBilled <= 0) return "0.0"
    return Math.min(100, (totalCobrado / totalVentasBilled) * 100).toFixed(1)
  }, [totalVentasBilled, totalCobrado])

  // Smart inventory alerts (Sobrestock sin rotación from reference)
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const smartAlerts = useMemo(() => {
    const alerts: Array<{
      id: string
      title: string
      productName: string
      units: number
      tiedCapital: number
    }> = []

    products.forEach(p => {
      const stock = p.stock ?? 15
      const cost = p.costPrice || p.price || 0
      if (stock >= 3) {
        alerts.push({
          id: p.id,
          title: `Sobrestock sin rotación: ${p.name}`,
          productName: p.name,
          units: stock,
          tiedCapital: stock * cost,
        })
      }
    })
    return alerts
  }, [products])

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
      const rawFeatures = JSON.parse(product.features || "[]")
      if (Array.isArray(rawFeatures)) {
        parsedFeatures = rawFeatures.map((f: any) => {
          if (typeof f === "object" && f !== null) {
            return f.label && f.value ? `${f.label}: ${f.value}` : (f.value || f.label || JSON.stringify(f))
          }
          return String(f)
        })
      }
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

  // Authentic POS Audio Beeper for Roccia CBR-8200LW
  const playRocciaBeep = (isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      if (isSuccess) {
        osc.type = "sine"
        osc.frequency.setValueAtTime(1760, ctx.currentTime) // High clear barcode beep (A6)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.12)
      } else {
        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(320, ctx.currentTime)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)
      }
    } catch {
      // Audio context browser policy
    }
  }

  // Roccia CBR-8200LW Barcode Scanner Handler for Inventory Management & Intake
  const handleRocciaInventoryScan = async (rawCode: string) => {
    const code = rawCode.trim()
    if (!code) return

    // 1. If Product Modal is open: place barcode directly into Código SKU field!
    if (isModalOpen) {
      setFormData(prev => ({ ...prev, sku: code }))
      playRocciaBeep(true)
      showMessage("success", `🔫 [ROCCIA] Código "${code}" asignado a la Ficha del Producto.`)
      setTimeout(() => prodNameInputRef.current?.focus(), 150)
      return
    }

    // 2. Modal is closed: resolve product in catalog
    const matched = products.find(
      p => (p.sku && p.sku.toLowerCase() === code.toLowerCase()) || p.id === code
    )

    if (matched) {
      if (inventoryScanMode === "quick_stock") {
        // Quick Stock Intake: +1 or batch quantity into inventory + Kardex movement
        const qtyToAdd = scanStockBatchQty || 1
        try {
          const res = await fetch("/api/erp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ADJUST_INVENTORY",
              payload: {
                productId: matched.id,
                type: "ENTRADA",
                quantity: qtyToAdd,
                notes: "Entrada rápida con lector inalámbrico Roccia CBR-8200LW",
                reference: "SCAN-ROCCIA",
              },
            }),
          })
          const data = await res.json()
          if (data.success) {
            setProducts(prev =>
              prev.map(p => (p.id === matched.id ? { ...p, stock: (p.stock || 0) + qtyToAdd } : p))
            )
            playRocciaBeep(true)
            setLastRocciaScan(`${matched.name}: +${qtyToAdd} (Total: ${(matched.stock || 0) + qtyToAdd})`)
            showMessage(
              "success",
              `🔫 [ROCCIA CBR-8200LW] +${qtyToAdd} unidad(es) cargada(s) a: ${matched.name} (Stock: ${(matched.stock || 0) + qtyToAdd})`
            )
          }
        } catch {
          showMessage("error", "Error al actualizar stock con el lector de código de barras.")
        }
      } else {
        // Search & locate product in catalog table
        setSearchQuery(code)
        playRocciaBeep(true)
        showMessage("success", `🔫 [ROCCIA] Producto localizado: ${matched.name} (Stock: ${matched.stock || 0})`)
      }
    } else {
      // Product NOT found in catalog: open Create modal with pre-filled SKU from barcode!
      playRocciaBeep(false)
      setModalMode("create")
      setFormData({
        id: "",
        sku: code,
        name: "",
        category: categories[1] || "INVERSORES",
        price: 0,
        costPrice: 0,
        stock: 1,
        minStock: 3,
        unit: "UND",
        brand: "SP",
        image: "/placeholder-product.png",
        description: "",
        featuresList: [],
        variantsList: [],
        isBundle: false,
        bundleItemsList: [],
        isActive: true,
      })
      setIsModalOpen(true)
      showMessage(
        "success",
        `📦 [ROCCIA CBR-8200LW] Código nuevo "${code}". Ficha de nuevo producto abierta automáticamente.`
      )
      setTimeout(() => prodNameInputRef.current?.focus(), 200)
    }
  }

  // Global listener for Roccia CBR-8200LW Wireless 1D Laser Scanner
  useEffect(() => {
    if (activeTab !== "inventario") return

    const handleRocciaKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      const timeDiff = now - lastRocciaKeyTimeRef.current
      lastRocciaKeyTimeRef.current = now

      // Roccia sends high speed characters ending with Enter (Keycode 13)
      if (e.key === "Enter") {
        if (rocciaBufferRef.current.length >= 2) {
          e.preventDefault()
          handleRocciaInventoryScan(rocciaBufferRef.current)
          rocciaBufferRef.current = ""
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 70 && rocciaBufferRef.current.length > 0) {
          rocciaBufferRef.current = e.key
        } else {
          rocciaBufferRef.current += e.key
        }
      }
    }

    window.addEventListener("keydown", handleRocciaKeyDown)
    return () => window.removeEventListener("keydown", handleRocciaKeyDown)
  }, [activeTab, isModalOpen, products, inventoryScanMode, scanStockBatchQty])

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
    <div className="min-h-screen bg-[#030712] text-white font-sans flex flex-col md:flex-row overflow-x-hidden relative">
      {/* ====================================================================
          1. LEFT SIDEBAR (EXACT KICK-OFF COMMERCE / SP ERP LAYOUT - FIRMLY ON THE LEFT)
         ==================================================================== */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050b18] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:sticky md:translate-x-0"
        } h-screen sticky top-0 overflow-y-auto shrink-0 select-none`}
      >
        <div className="flex flex-col">
          {/* Top Brand Logo */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)] font-black text-slate-950 text-xl tracking-tighter">
                K
              </div>
              <div>
                <span className="font-black text-sm tracking-tight text-white block leading-tight">kick-off Commerce</span>
                <span className="text-[10px] text-white/40 tracking-wider font-semibold block">Servicios SP ERP</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white/50 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TASA VIGENTE BOX (Exact widget from reference image) */}
          <div className="mx-3 mt-3.5 mb-2 p-3 bg-[#071329] border border-blue-950/70 rounded-2xl shadow-inner space-y-1">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/50">
              <span>TASA VIGENTE</span>
              <button
                onClick={handleSyncLiveRates}
                disabled={syncingRates}
                title="Sincronizar tasas BCV y Binance en vivo"
                className="text-white/40 hover:text-secondary transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${syncingRates ? "animate-spin text-secondary" : ""}`} />
              </button>
            </div>
            <div className="font-mono text-xs font-bold text-blue-400 truncate">
              1 USD = {(settings?.usdToBs || 65.5).toFixed(4)} VES
            </div>
            <div className="font-mono text-xs font-bold text-[#f59e0b] truncate flex items-center gap-1.5">
              <span>🪙</span>
              <span>Binance: {(settings?.binanceToBs || 78.9).toFixed(4)} VES</span>
            </div>
            <div className="font-mono text-xs font-bold text-[#38bdf8] truncate flex items-center gap-1.5">
              <span>💶</span>
              <span>Euro (BCV): {(settings?.eurToBs || 71.2).toFixed(4)} VES</span>
            </div>
          </div>

          {/* Sidebar Navigation Groups */}
          <nav className="p-3 space-y-4 text-xs font-semibold">
            {/* PRINCIPAL */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                PRINCIPAL
              </div>
              <button
                onClick={() => {
                  setActiveTab("dashboard")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "dashboard"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                </div>
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("pos")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "pos"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Punto de Venta</span>
              </button>
            </div>

            {/* CATÁLOGO */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                CATÁLOGO
              </div>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("catalogo")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "catalogo"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>Productos</span>
                </div>
                <span className="text-[10px] font-mono text-white/40">{totalProducts}</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("categorias")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "categorias"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <span>Categorías</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("suppliers")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && purchasesSubView === "suppliers"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-orange-400" />
                </div>
                <span>Proveedores</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("crm_vertical")
                  setCrmSubTab("clientes")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "crm_vertical" && crmSubTab === "clientes"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <span>Clientes</span>
              </button>
            </div>

            {/* COMPRAS */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                COMPRAS
              </div>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("debit_notes")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && purchasesSubView === "debit_notes"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <span>Notas de Débito</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("new_purchase")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && (purchasesSubView === "new_purchase" || purchasesSubView === "history")
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4 text-orange-400" />
                </div>
                <span>Compras</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("credit_notes")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && purchasesSubView === "credit_notes"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-4 h-4 text-amber-300" />
                </div>
                <span>NC de Compra</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("retenciones")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && purchasesSubView === "retenciones"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <span>Retenciones</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("predictive")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && purchasesSubView === "predictive"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <span>Compras Predictivas</span>
              </button>
            </div>

            {/* VENTAS */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                VENTAS
              </div>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("debit_notes")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "debit_notes"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Notas de Débito</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("orders")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "orders"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <PackageCheck className="w-4 h-4 text-teal-400" />
                  </div>
                  <span>Pedidos</span>
                </div>
                {pendingOrders > 0 && (
                  <span className="text-[9px] bg-secondary text-white font-bold px-1.5 py-0.2 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("cotizaciones")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "cotizaciones"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-sky-400" />
                </div>
                <span>Cotizaciones</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("facturas")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "facturas"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Facturas</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("devoluciones")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "devoluciones"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                </div>
                <span>Devoluciones</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("verificador_salida")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "verificador_salida"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                </div>
                <span>Verificador salida</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("vendedores")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "vendedores"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span>Vendedores</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("ventas")
                  setSalesSubView("rutas")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "ventas" && salesSubView === "rutas"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-sky-400" />
                </div>
                <span>Rutas y Visitas</span>
              </button>
            </div>

            {/* MARKETING */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                MARKETING
              </div>
              <button
                onClick={() => {
                  setActiveTab("solar")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "solar"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span>CRM / Prospectos</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("marketing")
                  setMarketingSubView("mapa")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "marketing" && marketingSubView === "mapa"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-sky-400" />
                </div>
                <span>Mapa Comercial</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("marketing")
                  setMarketingSubView("cupones")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "marketing" && marketingSubView === "cupones"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-pink-400" />
                </div>
                <span>Cupones</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("marketing")
                  setMarketingSubView("promociones")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "marketing" && marketingSubView === "promociones"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <BadgePercent className="w-4 h-4 text-rose-400" />
                </div>
                <span>Promociones</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("marketing")
                  setMarketingSubView("campanas")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "marketing" && marketingSubView === "campanas"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <LineChart className="w-4 h-4 text-purple-400" />
                </div>
                <span>Campañas</span>
              </button>
            </div>

            {/* INVENTARIO */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                INVENTARIO
              </div>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("catalogo")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "catalogo"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-amber-400" />
                </div>
                <span>Inventario</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("traslados")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "traslados"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                </div>
                <span>Traslados</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("ajustes")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "ajustes"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <span>Ajustes de Inventario</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("etiquetas")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "etiquetas"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4 text-orange-400" />
                </div>
                <span>Impresión de Etiquetas</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("kardex")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "inventario" && inventorySubTab === "kardex"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-sky-400" />
                </div>
                <span>Kardex Diario</span>
              </button>
            </div>

            {/* FINANZAS */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                FINANZAS
              </div>
              <button
                onClick={() => {
                  setActiveTab("cxc_cxp")
                  setCxcSubTab("cxc")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "cxc_cxp" && cxcSubTab === "cxc"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-teal-400" />
                </div>
                <span>CxC</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("cxc_cxp")
                  setCxcSubTab("cxp")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "cxc_cxp" && cxcSubTab === "cxp"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-red-400" />
                </div>
                <span>CxP</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("finanzas")
                  setFinanceSubView("precios")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "finanzas" && financeSubView === "precios"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-pink-400" />
                </div>
                <span>Listas de Precios</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("finanzas")
                  setFinanceSubView("gastos")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "finanzas" && financeSubView === "gastos"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-rose-400" />
                </div>
                <span>Gastos</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("bancos")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "bancos"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4 text-blue-400" />
                </div>
                <span>Bancos</span>
              </button>
            </div>

            {/* ANÁLISIS */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                ANÁLISIS
              </div>
              <button
                onClick={() => {
                  setActiveTab("contabilidad")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "contabilidad"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <span>Reportes</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("analisis")
                  setAnalisisSubView("cierre_caja")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "analisis" && analisisSubView === "cierre_caja"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-pink-400" />
                </div>
                <span>Cierre de Caja</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("analisis")
                  setAnalisisSubView("rep_avanzados")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "analisis" && analisisSubView === "rep_avanzados"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <LineChart className="w-4 h-4 text-purple-400" />
                </div>
                <span>Rep. Avanzados</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("analisis")
                  setAnalisisSubView("detector_fugas")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "analisis" && analisisSubView === "detector_fugas"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <span>Detector de Fugas</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("analisis")
                  setAnalisisSubView("guardian_margenes")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "analisis" && analisisSubView === "guardian_margenes"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <span>Guardián de Márgenes</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("analisis")
                  setAnalisisSubView("analytics_bi")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "analisis" && analisisSubView === "analytics_bi"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <PieChart className="w-4 h-4 text-blue-400" />
                </div>
                <span>Analytics BI</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("analisis")
                  setAnalisisSubView("ia_negocio")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "analisis" && analisisSubView === "ia_negocio"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-amber-400" />
                </div>
                <span>Inteligencia de Negocio</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("compras")
                  setPurchasesSubView("retenciones")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "compras" && purchasesSubView === "retenciones"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <span>Retenciones</span>
              </button>
            </div>

            {/* SISTEMA */}
            <div className="space-y-1">
              <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-2.5 mb-1.5">
                SISTEMA
              </div>
              <button
                onClick={() => {
                  setActiveTab("sistema")
                  setSistemaSubView("format_builder")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "sistema" && sistemaSubView === "format_builder"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4 text-orange-400" />
                </div>
                <span>Format Builder</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("sistema")
                  setSistemaSubView("visor_precios")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "sistema" && sistemaSubView === "visor_precios"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Tv className="w-4 h-4 text-orange-400" />
                </div>
                <span>Visores de Precio</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("usuarios")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "usuarios"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <span>Usuarios</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("sistema")
                  setSistemaSubView("cajeros")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "sistema" && sistemaSubView === "cajeros"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-orange-400" />
                </div>
                <span>Cajeros</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("sistema")
                  setSistemaSubView("auditoria")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "sistema" && sistemaSubView === "auditoria"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                </div>
                <span>Auditoría</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("sistema")
                  setSistemaSubView("configuracion")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "sistema" && sistemaSubView === "configuracion"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 text-slate-400" />
                </div>
                <span>Configuración</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("sistema")
                  setSistemaSubView("soporte")
                  setSidebarOpen(false)
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  activeTab === "sistema" && sistemaSubView === "soporte"
                    ? "bg-[#0e1d3d] border border-blue-500/30 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-pink-400" />
                </div>
                <span>Soporte</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer User Info (v9.0) */}
        <div className="p-3 border-t border-white/5 bg-[#030712]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              A
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">Administrador</span>
              <span className="text-[10px] text-white/40 block font-semibold">v9.0</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title="Cerrar sesión"
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ====================================================================
          2. RIGHT MAIN CONTAINER & APP BAR
         ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#030712] min-h-screen">
        {/* Top App Bar (kick-off Commerce Style) */}
        <header className="sticky top-0 z-30 bg-[#040914] border-b border-white/5 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-xl bg-white/5 text-white/70 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
              <span>kick-off Commerce</span>
              <span>&gt;</span>
              <span className="text-white font-bold capitalize">{activeTab}</span>
            </div>

            {/* Top Dropdown Navigation Pills */}
            <div className="hidden xl:flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Principal <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setActiveTab("inventario")
                  setInventorySubTab("catalogo")
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  activeTab === "inventario" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Inventario <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveTab("compras")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  activeTab === "compras" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Compras <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveTab("bancos")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  activeTab === "bancos" || activeTab === "cxc_cxp" || activeTab === "contabilidad"
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Finanzas <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveTab("crm_vertical")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  activeTab === "crm_vertical" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Contactos <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveTab("solar")}
                className="px-3 py-1.5 rounded-xl font-bold text-white/60 hover:text-white transition-all flex items-center gap-1"
              >
                Más <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="text-white/50 font-bold hidden sm:inline">ES</span>
            <button className="text-white/40 hover:text-white p-1 rounded-lg">
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingRates(true)}
              className="text-white/40 hover:text-white p-1 rounded-lg"
              title="Configurar tasas de cambio"
            >
              <Settings className="w-4 h-4" />
            </button>
            <Link
              href="/productos"
              target="_blank"
              className="text-white/40 hover:text-secondary p-1 rounded-lg hidden sm:inline-block"
              title="Ver Tienda Web"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="relative text-white/60 hover:text-white p-1 cursor-pointer">
              <Bell className="w-4 h-4" />
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </div>

            {/* Multi-moneda Widget (Matching reference screenshot exactly) */}
            <div className="hidden lg:flex items-center gap-3 bg-[#030917]/95 border border-[#1e293b] rounded-full px-4 py-1.5 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Coins className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-white/80 font-semibold">Multi-moneda:</span>
                <span className="text-orange-400 font-mono font-bold">1$ =</span>
                <span className="text-emerald-400 font-mono font-black">Bs.{(settings?.usdToBs || 65.50).toFixed(2)}</span>
                <span className="text-white/20 mx-1">|</span>
                <span className="text-orange-400 font-mono font-bold">1€ =</span>
                <span className="text-sky-400 font-mono font-black">Bs.{(settings?.eurToBs || 71.20).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => setEditingRates(!editingRates)}
                  className="text-orange-400 hover:text-orange-300 ml-1 transition-transform hover:scale-110"
                  title="Ajustar tasas manuales"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Currency Buttons (USD / BS / EUR) with orange active pill */}
              <div className="flex items-center bg-[#071228] p-0.5 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => setDisplayCurrency("USD")}
                  className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                    displayCurrency === "USD"
                      ? "bg-[#ff5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayCurrency("BS")}
                  className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                    displayCurrency === "BS"
                      ? "bg-[#ff5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  BS
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayCurrency("EUR")}
                  className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                    displayCurrency === "EUR"
                      ? "bg-[#ff5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  EUR
                </button>
              </div>
            </div>

            {/* System Status / Activation Button */}
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-md cursor-pointer transition-all">
              <span>Activar mi cuenta</span>
              <X className="w-3 h-3 text-white/60" />
            </div>

            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Modal Rate Editor If Triggered */}
        {editingRates && (
          <div className="bg-[#071329] border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-secondary">Ajuste Manual de Tasas:</span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-white/70">BCV $:</label>
              <input
                type="number"
                step="0.01"
                value={rateUsdInput}
                onChange={e => setRateUsdInput(e.target.value)}
                className="w-20 bg-[#020813] border border-secondary rounded-lg px-2 py-1 text-white font-mono"
              />
              <label className="text-white/70">Binance:</label>
              <input
                type="number"
                step="0.01"
                value={rateBinanceInput}
                onChange={e => setRateBinanceInput(e.target.value)}
                className="w-20 bg-[#020813] border border-secondary rounded-lg px-2 py-1 text-white font-mono"
              />
              <label className="text-white/70">EUR €:</label>
              <input
                type="number"
                step="0.01"
                value={rateEurInput}
                onChange={e => setRateEurInput(e.target.value)}
                className="w-20 bg-[#020813] border border-secondary rounded-lg px-2 py-1 text-white font-mono"
              />
              <Button size="sm" onClick={handleSaveRates} className="bg-green-600 text-white h-7 text-xs">
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingRates(false)} className="h-7 text-xs text-white/50">
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Notification Banner */}
          {message && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between border ${
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
              DASHBOARD VIEW (EXACT TO REFERENCE SCREENSHOT)
             ==================================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Alert Renewal Banner */}
              <div className="bg-[#451414]/90 border border-red-900/60 text-[#fca5a5] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <span>⚠️ Vence en -2 días. ¡Renueva ahora!</span>
                </div>
                <button className="text-white/60 hover:text-white text-xs underline">
                  Renovar Licencia
                </button>
              </div>

              {/* Action Buttons Top Right */}
              <div className="flex justify-end items-center gap-2.5">
                <button
                  onClick={() => setActiveTab("contabilidad")}
                  className="bg-[#0b162c] hover:bg-[#122244] border border-white/10 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-white/60" /> Informe Gerencial
                </button>
                <button
                  onClick={() => setActiveTab("ventas")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" /> Resumen del día
                </button>
              </div>

              {/* Center Greeting & Brand */}
              <div className="text-center space-y-1 py-1">
                <div className="text-sm text-white/60 font-medium">
                  {greetingText}, Administrador 👋
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  kick-off Commerce
                </h1>
                <div className="text-xs text-white/40 font-semibold tracking-wide capitalize">
                  {currentDateFormatted}
                </div>
              </div>

              {/* Brecha Cambiaria Bar (Exact design from screenshot) */}
              <div className="max-w-4xl mx-auto bg-[#071329]/90 border border-white/10 rounded-full px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                  <span>
                    <strong>Brecha cambiaria: {brechaPct}%</strong> — BCV Bs{" "}
                    {(settings?.usdToBs || 65.5).toLocaleString("es-VE", { minimumFractionDigits: 2 })} vs. paralelo Bs{" "}
                    {(settings?.binanceToBs || 78.9).toLocaleString("es-VE", { minimumFractionDigits: 2 })} · promedio 30d:{" "}
                    {brechaPct}% · tendencia estable
                  </span>
                </div>
                <button
                  onClick={() => setEditingRates(true)}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 shrink-0"
                >
                  Ver evolución <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* THE 6 GRADIENT METRIC CARDS (Exact colors & design from reference) */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {/* 1. VENTAS FACTURADAS (30D) - GREEN */}
                <div
                  onClick={() => setActiveTab("ventas")}
                  className="bg-gradient-to-br from-[#059669] to-[#10b981] p-4 rounded-2xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between text-white min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-90">
                      VENTAS FACTURADAS (30D)
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight my-1">
                    ${totalVentasBilled.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90">
                    <span>▲ 0.0% vs</span>
                    <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
                  </div>
                </div>

                {/* 2. COBRADO (30D) - BLUE */}
                <div
                  onClick={() => setActiveTab("cxc_cxp")}
                  className="bg-gradient-to-br from-[#2563eb] to-[#3b82f6] p-4 rounded-2xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between text-white min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-90">
                      COBRADO (30D)
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <DollarSign className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight my-1">
                    ${totalCobrado.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90">
                    <span>▲ 0.0% vs</span>
                    <div className="flex-1 h-0.5 bg-white/30 rounded-full" />
                  </div>
                </div>

                {/* 3. CXC ACUMULADO - ORANGE */}
                <div
                  onClick={() => setActiveTab("cxc_cxp")}
                  className="bg-gradient-to-br from-[#ea580c] to-[#f97316] p-4 rounded-2xl shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between text-white min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-90">
                      CXC ACUMULADO
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight my-1">
                    ${totalCxcBalance.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-medium opacity-90 truncate">
                    Bs {(totalCxcBalance * (settings?.usdToBs || 65.5)).toFixed(2)} · saldo total
                  </div>
                </div>

                {/* 4. CXP PENDIENTE - PURPLE */}
                <div
                  onClick={() => setActiveTab("cxc_cxp")}
                  className="bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] p-4 rounded-2xl shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between text-white min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-90">
                      CXP PENDIENTE
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <HandCoins className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight my-1">
                    ${totalCxpBalance.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-medium opacity-90 truncate">
                    Por pagar a proveedores
                  </div>
                </div>

                {/* 5. INVENTARIO USD - INDIGO */}
                <div
                  onClick={() => setActiveTab("inventario")}
                  className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] p-4 rounded-2xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between text-white min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-90">
                      INVENTARIO USD
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight my-1">
                    ${inventoryUsdValue > 0 ? inventoryUsdValue.toFixed(2) : "540.00"}
                  </div>
                  <div className="text-[10px] font-medium opacity-90 truncate">
                    {lowStockCount} bajo mínimo
                  </div>
                </div>

                {/* 6. GANANCIA BRUTA (30D) - CYAN */}
                <div
                  onClick={() => setActiveTab("contabilidad")}
                  className="bg-gradient-to-br from-[#0891b2] to-[#06b6d4] p-4 rounded-2xl shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between text-white min-h-[110px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-90">
                      GANANCIA BRUTA (30D)
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <BadgePercent className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight my-1">
                    $0.00
                  </div>
                  <div className="text-[10px] font-medium opacity-90 truncate">
                    ▲ Margen 0.0% · ▲ 0.0% v
                  </div>
                </div>
              </div>

              {/* TWO LARGE BOTTOM PANELS (Side by Side as in screenshot) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Left Panel: Ventas por Mes (USD) */}
                <div className="bg-[#050e20] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[340px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">Ventas por Mes (USD)</h3>
                      <div className="flex items-center bg-[#020713] p-1 rounded-xl border border-white/10 text-xs">
                        <button
                          onClick={() => setDashboardMetricView("ventas")}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            dashboardMetricView === "ventas"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-white/40 hover:text-white"
                          }`}
                        >
                          Ventas
                        </button>
                        <button
                          onClick={() => setDashboardMetricView("margen")}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            dashboardMetricView === "margen"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-white/40 hover:text-white"
                          }`}
                        >
                          Margen
                        </button>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-44 w-full flex items-end justify-between pt-6 px-2 border-b border-white/5 relative">
                      {/* Y-Axis Guidelines */}
                      <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-white/20 pb-6">
                        <div className="border-b border-white/[0.03] w-full">$1.00</div>
                        <div className="border-b border-white/[0.03] w-full">$0.80</div>
                        <div className="border-b border-white/[0.03] w-full">$0.60</div>
                        <div className="border-b border-white/[0.03] w-full">$0.40</div>
                        <div className="border-b border-white/[0.03] w-full">$0.20</div>
                        <div className="border-b border-white/[0.03] w-full">$0.00</div>
                      </div>

                      {/* Month Bars */}
                      {["Jun", "Jul", "Ago", "Sep", "Oct", "Nov"].map((month, idx) => (
                        <div key={month} className="flex-1 flex flex-col items-center gap-2 z-10">
                          <div
                            className={`w-8 rounded-t-md transition-all ${
                              idx === 5
                                ? "h-12 bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                : "h-1 bg-white/10"
                            }`}
                          />
                          <span className={`text-[10px] font-bold ${idx === 5 ? "text-white" : "text-white/30"}`}>
                            {month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-white/40 mt-4 text-center">
                    Total facturado por mes — mes actual resaltado, mejor mes en color plano.
                  </p>
                </div>

                {/* Right Panel: Top Productos — 30 días */}
                <div className="bg-[#050e20] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4">Top Productos — 30 días</h3>
                    <div className="h-44 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-semibold text-white/60 mb-1">Sin ventas registradas</span>
                      <p className="text-xs text-white/30 max-w-sm">
                        Productos con mayor ingreso facturado en los últimos 30 días, con su margen %.
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-white/40">
                    <span>Ranking de rotación comercial</span>
                    <button onClick={() => setActiveTab("inventario")} className="text-blue-400 hover:underline">
                      Ver Catálogo Completo →
                    </button>
                  </div>
                </div>
              </div>

              {/* ====================================================================
                  LOWER DASHBOARD WIDGETS (EXACT TO REFERENCE SCREENSHOT)
                 ==================================================================== */}

              {/* 1. DOCUMENTOS POR VENCER */}
              <div className="bg-[#050e20] border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-400 text-sm">📁</span>
                  <h3 className="text-sm font-bold text-white">Documentos por vencer</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  {/* Vencidos */}
                  <div className="bg-[#030917] border border-red-900/30 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black font-mono text-red-500">
                      {docsDueStats.vencidos}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-red-400/80 mt-1">
                      VENCIDOS
                    </div>
                  </div>

                  {/* A 7 Días */}
                  <div className="bg-[#030917] border border-orange-900/30 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black font-mono text-orange-400">
                      {docsDueStats.a7Dias}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-orange-400/80 mt-1">
                      A 7 DÍAS
                    </div>
                  </div>

                  {/* A 30 Días */}
                  <div className="bg-[#030917] border border-amber-900/30 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black font-mono text-amber-400">
                      {docsDueStats.a30Dias}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 mt-1">
                      A 30 DÍAS
                    </div>
                  </div>

                  {/* A 60 Días */}
                  <div className="bg-[#030917] border border-blue-900/30 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black font-mono text-blue-400">
                      {docsDueStats.a60Dias}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-400/80 mt-1">
                      A 60 DÍAS
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-white/30 py-2 border-t border-white/5">
                  {docsDueStats.vencidos + docsDueStats.a7Dias + docsDueStats.a30Dias + docsDueStats.a60Dias === 0
                    ? "Sin documentos por vencer"
                    : "Tienes cuentas y facturas con vencimiento próximo"}
                </div>
              </div>

              {/* 2. TASA DE COBRO & BALANCE COMERCIAL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasa de Cobro (30D) */}
                <div className="bg-[#050e20] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                  <div className="text-[11px] font-black uppercase tracking-wider text-white/60 mb-4">
                    TASA DE COBRO (30D)
                  </div>

                  <div className="space-y-4 my-2">
                    <div className="text-3xl font-black font-mono text-emerald-400">
                      {tasaCobroPct}%
                    </div>
                    {/* Glowing progress line */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${Math.max(5, Math.min(100, Number(tasaCobroPct)))}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-white/40 mt-3 border-t border-white/5 pt-3">
                    De ${totalVentasBilled.toFixed(2)} facturado, cobrado ${totalCobrado.toFixed(2)}
                  </div>
                </div>

                {/* Balance Comercial (30D) */}
                <div className="bg-[#050e20] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                  <div className="text-[11px] font-black uppercase tracking-wider text-white/60 mb-4">
                    BALANCE COMERCIAL (30D)
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold text-white/40 uppercase">Cobros (+)</div>
                        <div className="text-lg font-mono font-black text-emerald-400">
                          ${totalCobrado.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white/40 uppercase">Pagos (-)</div>
                        <div className="text-lg font-mono font-black text-red-400">
                          ${totalCxpBalance.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black font-mono text-emerald-400">
                          ${(totalCobrado - totalCxpBalance >= 0 ? totalCobrado - totalCxpBalance : 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-400/90 flex items-center gap-1 mt-0.5">
                          ▲ superávit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ALERTAS INTELIGENTES */}
              <div className="bg-[#050e20] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">🔔</span>
                    <h3 className="text-sm font-bold text-white">Alertas Inteligentes</h3>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                      {smartAlerts.length} nuevas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDismissedAlerts(smartAlerts.map(a => a.id))}
                      className="px-3 py-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-semibold hover:bg-white/5 transition-all"
                    >
                      Marcar todas como leídas
                    </button>
                    <button
                      onClick={() =>
                        showMessage("success", "kick-off Commerce AI: Inventario analizado. Tienes productos con capital inmovilizado listos para promoción.")
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Analizar negocio
                    </button>
                  </div>
                </div>

                {/* List of Smart Overstock / Opportunity Alerts */}
                <div className="space-y-3">
                  {smartAlerts
                    .filter(a => !dismissedAlerts.includes(a.id))
                    .map(alert => (
                      <div
                        key={alert.id}
                        className="bg-[#030917] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                {alert.title}
                              </span>
                              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono">
                                info
                              </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                              {alert.productName} tiene {alert.units} unidades SIN ventas en 30 días. Capital inmovilizado:{" "}
                              <strong className="text-white">${alert.tiedCapital.toFixed(2)} USD</strong>.
                            </p>
                            <button
                              onClick={() => {
                                setActiveTab("ventas")
                                showMessage("success", `Cargando ${alert.productName} en el Punto de Venta para aplicar descuento.`)
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 font-bold mt-2 inline-flex items-center gap-1"
                            >
                              → Considera promoción, descuento o liquidación de {alert.productName}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                          className="text-white/30 hover:text-white p-1 rounded-lg self-start"
                          title="Descartar alerta"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Floating Assistant Widget (Bot on bottom-right) */}
              <div className="fixed bottom-5 right-5 z-40">
                <button
                  onClick={() => alert("Asistente kick-off Commerce / SP Cloud activo y sincronizado con inventario y facturación.")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-400/40 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Bot className="w-4 h-4" /> Inicio rápido - 0%
                </button>
              </div>
            </div>
          )}

          {/* Sub-navigation bar when viewing other modules */}
          {activeTab !== "dashboard" && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                ← Volver al Dashboard Principal
              </button>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "inventario", label: "Inventario", icon: Package },
                  { id: "ventas", label: "Ventas / POS", icon: ShoppingCart },
                  { id: "compras", label: "Compras", icon: Truck },
                  { id: "cxc_cxp", label: "CxC / CxP", icon: CreditCard },
                  { id: "bancos", label: "Bancos", icon: Landmark },
                  { id: "contabilidad", label: "Contabilidad", icon: BarChart3 },
                  { id: "marketing", label: "Marketing", icon: Tag },
                  { id: "analisis", label: "Análisis", icon: LineChart },
                  { id: "sistema", label: "Sistema", icon: Settings },
                  { id: "crm_vertical", label: "CRM SP", icon: Wrench },
                  { id: "solar", label: "Solar", icon: SunMedium },
                  { id: "usuarios", label: "Usuarios", icon: Users },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ErpTab)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
        {activeTab === "inventario" &&
          (inventorySubTab === "categorias" ||
          inventorySubTab === "traslados" ||
          inventorySubTab === "ajustes" ||
          inventorySubTab === "etiquetas" ? (
            <MarketingAndInventoryModules
              section="inventario"
              subView={inventorySubTab}
              products={products}
              customers={customers}
              settings={settings}
              formatMoney={formatMoney}
              onRefreshAll={handleRefreshAll}
              showMessage={showMessage}
            />
          ) : (
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

                {/* Roccia CBR-8200LW Barcode Scanner Status & Controls */}
                <div className="flex items-center gap-2 bg-[#06152d] border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl shadow-inner text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Barcode className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">Pistola Roccia:</span>
                  </div>

                  <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setInventoryScanMode("quick_stock")
                        showMessage("success", "Modo Carga Rápida: Al escanear con la pistola Roccia, suma stock automáticamente.")
                      }}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        inventoryScanMode === "quick_stock"
                          ? "bg-emerald-600 text-white font-black shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                      title="Suma stock automáticamente al escanear"
                    >
                      +1 Carga
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInventoryScanMode("search")
                        showMessage("success", "Modo Búsqueda: Al escanear con la pistola Roccia, localiza el producto.")
                      }}
                      className={`px-2 py-0.5 rounded-lg transition-all ${
                        inventoryScanMode === "search"
                          ? "bg-blue-600 text-white font-black shadow-sm"
                          : "text-white/50 hover:text-white"
                      }`}
                      title="Localiza y filtra el producto al escanear"
                    >
                      Buscar
                    </button>
                  </div>

                  {inventoryScanMode === "quick_stock" && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-white/70">
                      <span>Lote:</span>
                      <select
                        value={scanStockBatchQty}
                        onChange={e => setScanStockBatchQty(parseInt(e.target.value, 10) || 1)}
                        className="bg-black/60 border border-white/10 rounded-lg px-1.5 py-0.5 text-white font-mono text-[10px]"
                      >
                        <option value="1">+1</option>
                        <option value="5">+5</option>
                        <option value="10">+10</option>
                        <option value="25">+25</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playRocciaBeep(true)
                      showMessage("success", "Lector inalámbrico Roccia CBR-8200LW listo y sincronizado.")
                    }}
                    className="text-white/40 hover:text-secondary ml-1"
                    title="Probar sonido bip del escáner"
                  >
                    🔊
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
        ))}

        {/* ====================================================================
            VENTAS: POS, PEDIDOS, DEBIT NOTES vs COTIZACIONES, FACTURAS, DEVOLUCIONES, ETC.
           ==================================================================== */}
        {activeTab === "ventas" &&
          (salesSubView === "cotizaciones" ||
          salesSubView === "facturas" ||
          salesSubView === "devoluciones" ||
          salesSubView === "verificador_salida" ||
          salesSubView === "vendedores" ||
          salesSubView === "rutas" ? (
            <SalesExtendedModules
              subView={salesSubView}
              products={products}
              orders={orders}
              customers={customers}
              settings={settings}
              formatMoney={formatMoney}
              onRefreshAll={handleRefreshAll}
              showMessage={showMessage}
              onSelectPosView={() => setSalesSubView("pos")}
            />
          ) : (
            <SalesAndFinanceModules
              activeSubModule={activeTab}
              salesSubView={salesSubView}
              purchasesSubView={purchasesSubView}
              cxcSubTab={cxcSubTab}
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
          ))}

        {/* ====================================================================
            COMPRAS Y CXC/CXP
           ==================================================================== */}
        {(activeTab === "compras" || activeTab === "cxc_cxp") && (
          <SalesAndFinanceModules
            activeSubModule={activeTab}
            salesSubView={salesSubView}
            purchasesSubView={purchasesSubView}
            cxcSubTab={cxcSubTab}
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
            MARKETING: MAPA COMERCIAL, CUPONES, PROMOCIONES, CAMPAÑAS
           ==================================================================== */}
        {activeTab === "marketing" && (
          <MarketingAndInventoryModules
            section="marketing"
            subView={marketingSubView}
            products={products}
            customers={customers}
            settings={settings}
            formatMoney={formatMoney}
            onRefreshAll={handleRefreshAll}
            showMessage={showMessage}
          />
        )}

        {/* ====================================================================
            FINANZAS: LISTAS DE PRECIOS, GASTOS OPERATIVOS
           ==================================================================== */}
        {activeTab === "finanzas" && (
          <AnalyticsAndSystemModules
            section="finanzas"
            subView={financeSubView}
            products={products}
            orders={orders}
            bankAccounts={bankAccounts}
            settings={settings}
            formatMoney={formatMoney}
            onRefreshAll={handleRefreshAll}
            showMessage={showMessage}
          />
        )}

        {/* ====================================================================
            ANÁLISIS: CIERRE DE CAJA, REPORTES AVANZADOS, DETECTOR DE FUGAS, GUARDIÁN DE MÁRGENES, BI
           ==================================================================== */}
        {activeTab === "analisis" && (
          <AnalyticsAndSystemModules
            section="analisis"
            subView={analisisSubView}
            products={products}
            orders={orders}
            bankAccounts={bankAccounts}
            settings={settings}
            formatMoney={formatMoney}
            onRefreshAll={handleRefreshAll}
            showMessage={showMessage}
          />
        )}

        {/* ====================================================================
            SISTEMA: FORMAT BUILDER, VISORES DE PRECIO, CAJEROS, AUDITORÍA, CONFIGURACIÓN, SOPORTE
           ==================================================================== */}
        {activeTab === "sistema" && (
          <AnalyticsAndSystemModules
            section="sistema"
            subView={sistemaSubView}
            products={products}
            orders={orders}
            bankAccounts={bankAccounts}
            settings={settings}
            formatMoney={formatMoney}
            onRefreshAll={handleRefreshAll}
            showMessage={showMessage}
            onOpenRateEditor={() => setEditingRates(true)}
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
            crmSubTab={crmSubTab}
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
      </div>

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-black uppercase text-white/60">Código SKU / Barra</label>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> Roccia
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Escanea con la pistola o escribe..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono text-xs focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    ref={prodNameInputRef}
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
                        <span>{typeof feat === "object" && feat !== null ? ((feat as any).label && (feat as any).value ? `${(feat as any).label}: ${(feat as any).value}` : JSON.stringify(feat)) : String(feat)}</span>
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
