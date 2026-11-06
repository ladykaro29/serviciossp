"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Search,
  Filter,
  MessageCircle,
  Plus,
  Check,
  CreditCard,
  PackageCheck,
  Eye,
  X,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Tag,
  Gift,
  Boxes,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  Flame,
  Award,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { products as initialProducts } from "@/lib/data/products"
import { useCart } from "@/context/CartContext"

function normalizeFeature(feat: any): string {
  if (typeof feat === "string") return feat
  if (typeof feat === "number") return String(feat)
  if (typeof feat === "object" && feat !== null) {
    if (feat.label && feat.value) return `${feat.label}: ${feat.value}`
    if (feat.value) return String(feat.value)
    if (feat.label) return String(feat.label)
    if (feat.name) return String(feat.name)
    try {
      return JSON.stringify(feat)
    } catch {
      return ""
    }
  }
  return String(feat ?? "")
}

function parseJsonArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string" && raw.trim() !== "") {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function getEffectiveFeatures(product: any): string[] {
  const custom = parseJsonArray(product?.features)
  if (custom.length > 0) {
    return custom.map(normalizeFeature).filter(Boolean)
  }

  // Generar características técnicas automáticas cuando aún no se han personalizado
  const fallback: string[] = []
  if (product?.brand) fallback.push(`Marca: ${product.brand}`)
  if (product?.category) fallback.push(`Línea: ${product.category}`)
  const specsMatch = String(product?.name || "").match(/\b(\d+(?:W|V|Ah|kVA|kW|MP|K|m|A|Hz|\-\d+V))\b/gi)
  if (specsMatch && specsMatch.length > 0) {
    fallback.push(`Especificación: ${Array.from(new Set(specsMatch)).join(" · ")}`)
  }
  fallback.push("Garantía certificada Servicios y Suministros SP")
  return fallback
}

export default function ProductosPage() {
  const [productList, setProductList] = useState<any[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [addedProductId, setAddedProductId] = useState<string | number | null>(null)
  const [onlyWithPrice, setOnlyWithPrice] = useState(false)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyKits, setOnlyKits] = useState(false)
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured")
  const [visibleCount, setVisibleCount] = useState<number>(24)

  // Slider State for Featured Products
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [isSliderPaused, setIsSliderPaused] = useState(false)

  const [rates, setRates] = useState({
    usdToBs: 65.5,
    binanceToBs: 78.9,
    eurToBs: 71.2,
    defaultInitialPercent: 40,
  })
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0)
  const { addToCart } = useCart()

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data)
        }
      })
      .catch(err => console.error("Error al cargar productos dinámicos:", err))

    fetch("/api/erp?public=true&syncRates=true")
      .then(res => res.json())
      .then(data => {
        if (data?.settings) {
          setRates({
            usdToBs: data.settings.usdToBs || 65.5,
            binanceToBs: data.settings.binanceToBs || 78.9,
            eurToBs: data.settings.eurToBs || 71.2,
            defaultInitialPercent: data.settings.defaultInitialPercent || 40,
          })
        }
      })
      .catch(() => {})
  }, [])

  const formatPrice = (usdPrice: number) => {
    return `$${usdPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Selected Featured Products for the Slider
  const featuredProducts = useMemo(() => {
    if (productList.length === 0) return []

    const priorityCategories = [
      "Kits y Sistemas Solares",
      "Energía Solar",
      "CCTV y Seguridad",
      "Computación y Redes",
      "Cercado Eléctrico",
      "Ferretería y Luminarias",
    ]

    const chosen: any[] = []
    const chosenIds = new Set<string>()

    // 1. Prioritize flagship products with price and meaningful specs from key categories
    for (const cat of priorityCategories) {
      const match = productList.find(
        p => p.category === cat && Number(p.price) > 0 && !chosenIds.has(p.id)
      )
      if (match) {
        chosen.push(match)
        chosenIds.add(match.id)
      }
    }

    // 2. Add any kit or combo
    const kits = productList.filter(
      p => (p.isBundle || parseJsonArray(p.bundleItems).length > 0) && !chosenIds.has(p.id)
    )
    for (const k of kits) {
      if (chosen.length >= 6) break
      chosen.push(k)
      chosenIds.add(k.id)
    }

    // 3. Fallback to fill up to 6
    if (chosen.length < 5) {
      const remaining = productList
        .filter(p => Number(p.price) > 0 && !chosenIds.has(p.id))
        .slice(0, 6 - chosen.length)
      chosen.push(...remaining)
    }

    return chosen.length > 0 ? chosen : productList.slice(0, 5)
  }, [productList])

  // Autoplay slider for featured products
  useEffect(() => {
    if (featuredProducts.length <= 1 || isSliderPaused) return
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredProducts.length)
    }, 5500)
    return () => clearInterval(interval)
  }, [featuredProducts.length, isSliderPaused])

  const nextSlide = () => {
    setFeaturedIndex(prev => (prev + 1) % featuredProducts.length)
  }

  const prevSlide = () => {
    setFeaturedIndex(prev => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  }

  const categories = useMemo(() => {
    const cats = new Set(productList.map(p => p.category).filter(Boolean))
    return ["Todos", ...Array.from(cats).sort()]
  }, [productList])

  // Reset pagination count on search/filter change
  useEffect(() => {
    setVisibleCount(24)
  }, [searchQuery, selectedCategory, onlyWithPrice, onlyInStock, onlyKits, sortBy])

  const filteredProducts = useMemo(() => {
    let result = productList.filter(product => {
      const nameStr = String(product?.name || "")
      const brandStr = String(product?.brand || "")
      const skuStr = String(product?.sku || "")
      const descStr = String(product?.description || "")
      const q = searchQuery.toLowerCase().trim()

      const matchesSearch =
        !q ||
        nameStr.toLowerCase().includes(q) ||
        brandStr.toLowerCase().includes(q) ||
        skuStr.toLowerCase().includes(q) ||
        descStr.toLowerCase().includes(q)

      const matchesCategory = selectedCategory === "Todos" || product?.category === selectedCategory
      const matchesPrice = !onlyWithPrice || (product?.price && Number(product.price) > 0)
      const matchesStock = !onlyInStock || (product?.stock === undefined || Number(product.stock) > 0)
      const matchesKits = !onlyKits || Boolean(product?.isBundle || parseJsonArray(product?.bundleItems).length > 0)

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesKits
    })

    // Sort
    if (sortBy === "price_asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
    }

    return result
  }, [productList, searchQuery, selectedCategory, onlyWithPrice, onlyInStock, onlyKits, sortBy])

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const handleAddToCart = (product: any, variant?: { name: string; price: number }) => {
    const itemToAdd = variant
      ? {
          ...product,
          id: `${product.id}-${variant.name}`,
          name: `${product.name} (${variant.name})`,
          price: variant.price || product.price,
        }
      : product

    addToCart(itemToAdd)
    setAddedProductId(product.id)
    setTimeout(() => setAddedProductId(null), 2000)
  }

  const handleWhatsApp = (productName: string, variantName?: string) => {
    const fullTitle = variantName ? `${productName} - Variante: ${variantName}` : productName
    const message = encodeURIComponent(
      `Hola, me interesa consultar detalles, disponibilidad y plan de cuotas de: ${fullTitle}`
    )
    window.open(`https://wa.me/584147550091?text=${message}`, "_blank")
  }

  const openProductDetail = (product: any) => {
    setSelectedProduct(product)
    setSelectedVariantIdx(0)
  }

  const currentSlide = featuredProducts[featuredIndex] || null
  const currentSlidePrice = currentSlide?.price ? Number(currentSlide.price) : 0
  const currentSlideInitial = currentSlidePrice * (rates.defaultInitialPercent / 100)
  const currentSlideFeatures = currentSlide ? getEffectiveFeatures(currentSlide).slice(0, 3) : []

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#020813] text-foreground">
      {/* Page Header Hero */}
      <div className="bg-gradient-to-b from-[#041124] via-[#020813] to-[#020813] text-white pt-24 pb-16 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none"></div>
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/15 border border-secondary/30 text-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-secondary/10">
              <Sparkles className="w-3.5 h-3.5" /> Catálogo Técnico Profesional · Servicios y Suministros SP
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none text-white">
              Soluciones & Equipos <span className="text-secondary">Certificados</span>
            </h1>

            <p className="text-white/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-normal">
              Explora más de 800 equipos en Energía Solar, CCTV y Seguridad, Redes, Cercado Eléctrico y Luminarias con respaldo de ingeniería y planes de pago en cuotas.
            </p>

            {/* Quick Benefits Chips */}
            <div className="pt-2 flex flex-wrap justify-center items-center gap-2.5 sm:gap-4 text-xs font-bold text-white/80">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                <ShieldCheck className="w-4 h-4 text-secondary" /> Garantía Certificada SP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                <CreditCard className="w-4 h-4 text-secondary" /> Planes de Pago en Cuotas
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                <Boxes className="w-4 h-4 text-secondary" /> +800 Equipos Disponibles
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                <MessageCircle className="w-4 h-4 text-green-400" /> Asesoría Inmediata WhatsApp
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20 space-y-12">
        {/* ====================================================================
            FEATURED PRODUCTS SLIDER (Carrusel de Productos Destacados)
           ==================================================================== */}
        {featuredProducts.length > 0 && currentSlide && (
          <section
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
            className="relative rounded-[2.5rem] p-6 sm:p-10 bg-gradient-to-br from-[#061938]/90 via-[#030e22]/95 to-[#020813] border border-secondary/30 shadow-[0_25px_60px_rgba(255,98,0,0.12)] overflow-hidden transition-all backdrop-blur-xl"
          >
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Slider Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-secondary/20 border border-secondary/40 text-secondary flex items-center justify-center shadow-lg shadow-secondary/20">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-secondary flex items-center gap-1.5">
                    Equipos & Soluciones Destacadas
                  </h3>
                  <p className="text-[11px] text-white/50 font-medium">
                    Selección de alto rendimiento para proyectos residenciales e industriales
                  </p>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white/50 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <strong className="text-white">{featuredIndex + 1}</strong> / {featuredProducts.length}
                </span>
                <button
                  onClick={prevSlide}
                  aria-label="Producto anterior"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-secondary border border-white/10 hover:border-secondary text-white/70 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Producto siguiente"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-secondary border border-white/10 hover:border-secondary text-white/70 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Data & Actions */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-secondary text-white shadow-md shadow-secondary/20">
                    ★ Destacado SP
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/15">
                    {currentSlide.category}
                  </span>
                  {currentSlide.brand && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-secondary border border-white/10">
                      {currentSlide.brand}
                    </span>
                  )}
                  {currentSlide.sku && (
                    <span className="font-mono text-[10px] text-white/60 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                      SKU: {currentSlide.sku}
                    </span>
                  )}
                </div>

                <h2
                  onClick={() => openProductDetail(currentSlide)}
                  className="text-2xl sm:text-3xl lg:text-4xl font-black text-white hover:text-secondary transition-colors cursor-pointer leading-tight line-clamp-2"
                >
                  {currentSlide.name}
                </h2>

                <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed">
                  {currentSlide.description ||
                    `Solución profesional de la línea ${currentSlide.category} con respaldo técnico oficial y soporte garantizado por Servicios y Suministros SP.`}
                </p>

                {/* Key Features Bullets */}
                {currentSlideFeatures.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {currentSlideFeatures.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/85">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price and Financing Box */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  {currentSlidePrice > 0 ? (
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-white/40 block">
                        Precio de Contado
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-green-400 font-mono tracking-tight">
                        {formatPrice(currentSlidePrice)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xl font-black text-amber-400 italic">Precio a Consultar</span>
                    </div>
                  )}

                  {currentSlidePrice > 0 && (
                    <div className="bg-secondary/15 border border-secondary/30 rounded-2xl px-4 py-2 text-xs">
                      <div className="font-black text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> Plan en Cuotas
                      </div>
                      <div className="text-white font-mono text-[11px] font-bold mt-0.5">
                        Inicial: <strong className="text-white">{formatPrice(currentSlideInitial)}</strong> ({rates.defaultInitialPercent}%) + 3 cuotas
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 flex flex-wrap gap-3">
                  <Button
                    onClick={() => openProductDetail(currentSlide)}
                    className="h-12 px-6 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider text-xs gap-2 shadow-xl shadow-secondary/20"
                  >
                    <Eye className="w-4 h-4" /> Ver Especificaciones Técnicas
                  </Button>

                  <Button
                    onClick={() => handleAddToCart(currentSlide)}
                    className={`h-12 px-5 rounded-2xl font-black uppercase tracking-wider text-xs gap-2 transition-all ${
                      addedProductId === currentSlide.id
                        ? "bg-green-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                    }`}
                  >
                    {addedProductId === currentSlide.id ? (
                      <>
                        <Check className="w-4 h-4" /> Agregado
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Agregar a Solicitud
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleWhatsApp(currentSlide.name)}
                    variant="outline"
                    className="h-12 px-4 rounded-2xl border-white/15 bg-white/5 hover:bg-green-600/20 hover:border-green-500/40 text-white hover:text-green-400 text-xs font-bold gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp
                  </Button>
                </div>
              </div>

              {/* Right Column: Visual Box */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  onClick={() => openProductDetail(currentSlide)}
                  className="w-full max-w-md aspect-square rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-2xl hover:border-secondary/50 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                  {currentSlide.image && currentSlide.image !== "/placeholder-product.png" ? (
                    <img
                      src={currentSlide.image}
                      alt={currentSlide.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-2xl"
                      onError={e => {
                        ;(e.target as any).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 relative z-10">
                      <div className="w-24 h-24 rounded-3xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary mb-4 shadow-xl group-hover:scale-110 transition-transform">
                        <Zap className="w-12 h-12" />
                      </div>
                      <span className="text-xl font-black uppercase text-white/90 tracking-wider">
                        {currentSlide.brand || "Servicios SP"}
                      </span>
                      <span className="text-xs text-white/50 font-mono mt-1">
                        {currentSlide.category}
                      </span>
                    </div>
                  )}

                  {/* Floating Trust Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-black uppercase tracking-wider bg-[#020813]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-white/80 z-20">
                    <span className="flex items-center gap-1.5 text-secondary">
                      <ShieldCheck className="w-3.5 h-3.5" /> Respaldo SP Certificado
                    </span>
                    <span className="text-green-400 font-mono">Disponible</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 pt-6 relative z-10">
              {featuredProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFeaturedIndex(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    featuredIndex === idx
                      ? "w-8 bg-secondary shadow-lg shadow-secondary/30"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </section>
        )}

        {/* ====================================================================
            MAIN CATALOG VIEW (Filtros, Búsqueda y Grilla)
           ==================================================================== */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-[#041124]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl sticky top-28 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-black text-white text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-secondary" /> Categorías
                </h2>
                <span className="text-[10px] font-mono font-bold text-white/40">
                  {categories.length - 1} líneas
                </span>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {categories.map(cat => {
                  const count =
                    cat === "Todos"
                      ? productList.length
                      : productList.filter(p => p.category === cat).length

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs text-left px-4 py-3 rounded-2xl transition-all duration-200 border font-bold flex items-center justify-between gap-2 ${
                        selectedCategory === cat
                          ? "bg-secondary border-secondary text-white shadow-xl shadow-secondary/20"
                          : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg shrink-0 ${
                          selectedCategory === cat
                            ? "bg-black/30 text-white font-black"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Filter Checkboxes in Sidebar */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-2">
                  Filtros Rápidos
                </span>

                <label className="flex items-center gap-2 text-xs text-white/75 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={onlyWithPrice}
                    onChange={e => setOnlyWithPrice(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-secondary focus:ring-secondary/40"
                  />
                  <span>Solo con precio visible</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white/75 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={e => setOnlyInStock(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-secondary focus:ring-secondary/40"
                  />
                  <span>Solo con stock disponible</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white/75 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={onlyKits}
                    onChange={e => setOnlyKits(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-secondary focus:ring-secondary/40"
                  />
                  <span>Kits y Combos completos</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6">
            {/* Search & Toolbar Bar */}
            <div className="bg-[#041124]/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search input */}
              <div className="relative w-full md:flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 group-focus-within:text-secondary transition-colors" />
                <input
                  type="text"
                  placeholder="Busca por marca, modelo, SKU o descripción..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-13 pr-10 py-3.5 rounded-2xl border border-white/10 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none text-sm transition-all bg-white/[0.04] text-white placeholder:text-white/30 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort selector & stats */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3 py-2 rounded-2xl">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-secondary" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-white/90 outline-none cursor-pointer"
                  >
                    <option value="featured" className="bg-[#041124]">Recomendados</option>
                    <option value="price_asc" className="bg-[#041124]">Precio: Menor a Mayor</option>
                    <option value="price_desc" className="bg-[#041124]">Precio: Mayor a Menor</option>
                    <option value="name_asc" className="bg-[#041124]">Nombre: A - Z</option>
                  </select>
                </div>

                <div className="text-[11px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white/70 px-4 py-2.5 rounded-2xl">
                  <span className="text-secondary font-mono">{filteredProducts.length}</span> equipos
                </div>
              </div>
            </div>

            {/* Active Filters Bar if any active */}
            {(selectedCategory !== "Todos" || searchQuery || onlyWithPrice || onlyInStock || onlyKits) && (
              <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] border border-white/5 p-3 rounded-2xl text-xs">
                <span className="text-white/40 font-bold uppercase text-[10px] tracking-wider">
                  Filtros activos:
                </span>
                {selectedCategory !== "Todos" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 font-bold text-[11px]">
                    Línea: {selectedCategory}
                    <X
                      onClick={() => setSelectedCategory("Todos")}
                      className="w-3 h-3 cursor-pointer hover:text-white"
                    />
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-[11px]">
                    Búsqueda: &ldquo;{searchQuery}&rdquo;
                    <X
                      onClick={() => setSearchQuery("")}
                      className="w-3 h-3 cursor-pointer hover:text-secondary"
                    />
                  </span>
                )}
                {onlyWithPrice && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-[11px]">
                    Con precio
                    <X
                      onClick={() => setOnlyWithPrice(false)}
                      className="w-3 h-3 cursor-pointer hover:text-white"
                    />
                  </span>
                )}
                {onlyInStock && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-[11px]">
                    En stock
                    <X
                      onClick={() => setOnlyInStock(false)}
                      className="w-3 h-3 cursor-pointer hover:text-white"
                    />
                  </span>
                )}
                {onlyKits && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold text-[11px]">
                    Kits / Combos
                    <X
                      onClick={() => setOnlyKits(false)}
                      className="w-3 h-3 cursor-pointer hover:text-white"
                    />
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory("Todos")
                    setSearchQuery("")
                    setOnlyWithPrice(false)
                    setOnlyInStock(false)
                    setOnlyKits(false)
                  }}
                  className="ml-auto text-[11px] font-black uppercase text-secondary hover:underline"
                >
                  Restablecer todo
                </button>
              </div>
            )}

            {/* Product Cards Grid */}
            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleProducts.map(product => {
                  const variantsList = parseJsonArray(product.variants)
                  const bundleList = parseJsonArray(product.bundleItems)
                  const isKit = Boolean(product.isBundle || bundleList.length > 0)
                  const featuresList = getEffectiveFeatures(product)
                  const hasPrice = product.price && Number(product.price) > 0
                  const priceNum = Number(product.price) || 0
                  const initialUsd = priceNum * (rates.defaultInitialPercent / 100)
                  const stockVal = product.stock !== undefined ? Number(product.stock) : 15

                  return (
                    <div
                      key={product.id}
                      className="bg-[#041124]/80 hover:bg-[#041124] rounded-3xl border border-white/10 hover:border-secondary/50 shadow-xl hover:shadow-[0_20px_45px_rgba(255,98,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full relative overflow-hidden backdrop-blur-md"
                    >
                      {/* Clickable Image Area */}
                      <div
                        onClick={() => openProductDetail(product)}
                        className="aspect-square bg-gradient-to-b from-white/[0.04] to-transparent relative p-8 flex items-center justify-center overflow-hidden border-b border-white/5 cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {product.image && product.image !== "/placeholder-product.png" ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-md"
                            onError={e => {
                              ;(e.target as any).style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center text-center p-3 group-hover:scale-105 transition-transform duration-500 relative z-10">
                            <span className="text-xl font-black uppercase tracking-wider text-white/20 group-hover:text-secondary/40 transition-colors">
                              {product.brand || "SP"}
                            </span>
                            <span className="text-[10px] text-white/30 font-mono mt-1">
                              {product.category}
                            </span>
                          </div>
                        )}

                        {/* Stock Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border backdrop-blur-md ${
                              stockVal > 0
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                stockVal > 0 ? "bg-green-400 animate-pulse" : "bg-amber-400"
                              }`}
                            />
                            {stockVal > 0 ? `Stock: ${stockVal}` : "Bajo Pedido"}
                          </span>
                        </div>

                        {/* Brand Badge */}
                        <div className="absolute top-4 right-4 bg-[#020813]/90 border border-white/10 text-white/90 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg z-20">
                          {product.brand || "SP"}
                        </div>

                        {/* Category & Variants / Kit Pills */}
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between items-center gap-1.5 z-20">
                          <span className="text-[9px] bg-secondary/15 text-secondary font-black px-3 py-1 rounded-xl uppercase tracking-widest border border-secondary/25">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1">
                            {isKit && (
                              <span className="text-[9px] bg-purple-500/25 text-purple-200 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border border-purple-500/40 flex items-center gap-1 shadow-md">
                                <Gift className="w-3 h-3 text-purple-300" /> Kit
                              </span>
                            )}
                            {variantsList.length > 0 && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-300 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
                                <Layers className="w-3 h-3" /> {variantsList.length} var.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Content */}
                      <div className="p-6 flex flex-col flex-1">
                        {product.sku && (
                          <div className="mb-2">
                            <span className="font-mono text-[10px] bg-white/5 text-white/60 px-2.5 py-0.5 rounded-md font-bold tracking-wider inline-block border border-white/10">
                              {product.sku}
                            </span>
                          </div>
                        )}

                        <h3
                          onClick={() => openProductDetail(product)}
                          className="font-black text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-secondary transition-colors cursor-pointer"
                          title={product.name}
                        >
                          {product.name}
                        </h3>

                        {/* Short Description Preview */}
                        <p className="text-xs text-white/60 line-clamp-2 mb-3 leading-relaxed">
                          {product.description ||
                            `Equipo profesional de la línea ${product.category} con respaldo técnico SP.`}
                        </p>

                        {/* Technical Characteristics Preview */}
                        {featuresList.length > 0 && (
                          <div className="space-y-1 mb-4">
                            {featuresList.slice(0, 2).map((feat: any, i: number) => {
                              const featText = typeof feat === "object" ? normalizeFeature(feat) : String(feat)
                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 text-[11px] text-white/75 truncate"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                                  <span className="truncate">{featText}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* View Full Detail Button */}
                        <button
                          type="button"
                          onClick={() => openProductDetail(product)}
                          className="mb-4 w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-secondary/20 border border-white/10 hover:border-secondary/40 text-[11px] font-black uppercase tracking-wider text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-secondary" /> Ver Ficha Técnica & Variantes
                        </button>

                        {/* Financing Pill if hasPrice */}
                        {hasPrice && (
                          <div className="mb-4 bg-secondary/10 border border-secondary/25 rounded-2xl p-2.5 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-secondary shrink-0" />
                            <div className="text-[10px] leading-tight text-white/80">
                              <span className="font-black text-secondary">¡En cuotas!</span> Inicial{" "}
                              <strong className="text-white">{formatPrice(initialUsd)}</strong> ({rates.defaultInitialPercent}%) + 3 cuotas
                            </div>
                          </div>
                        )}

                        {/* Card Footer: Price & Actions */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                          <div>
                            <span className="text-[9px] text-white/40 uppercase tracking-widest font-black block mb-0.5">
                              {hasPrice ? "Precio" : "Cotizar"}
                            </span>
                            {hasPrice ? (
                              <span className="font-black text-xl text-green-400 font-mono tracking-tight">
                                {formatPrice(priceNum)}
                              </span>
                            ) : (
                              <span className="font-black text-base text-amber-400 italic">
                                A Consultar
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              size="icon"
                              className={`h-11 w-11 rounded-2xl shrink-0 shadow-lg transition-all hover:scale-105 active:scale-95 ${
                                addedProductId === product.id
                                  ? "bg-green-600 text-white"
                                  : "bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20"
                              }`}
                              title="Agregar a solicitud"
                            >
                              {addedProductId === product.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              onClick={() => handleWhatsApp(product.name)}
                              size="icon"
                              variant="outline"
                              className="h-11 w-11 rounded-2xl shrink-0 border-white/10 bg-white/5 hover:bg-green-600/20 hover:border-green-500/40 text-white hover:text-green-400 transition-all"
                              title="Consultar por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 text-green-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Empty Search State */
              <div className="bg-[#041124]/90 p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">No se encontraron productos</h3>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  No hay coincidencias con los filtros aplicados. Intenta con otro término de búsqueda o limpia los filtros.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("Todos")
                    setSearchQuery("")
                    setOnlyWithPrice(false)
                    setOnlyInStock(false)
                    setOnlyKits(false)
                  }}
                  className="rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black uppercase text-xs tracking-wider"
                >
                  Ver Todo el Catálogo
                </Button>
              </div>
            )}

            {/* Load More Button if filtered has more */}
            {visibleCount < filteredProducts.length && (
              <div className="text-center pt-8 pb-4">
                <Button
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="h-14 px-8 rounded-2xl bg-[#041124] hover:bg-white/10 border border-white/15 text-white font-black uppercase tracking-wider text-xs gap-3 shadow-2xl transition-all hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 text-secondary" /> Cargar Más Equipos (Mostrando {visibleCount} de {filteredProducts.length})
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ====================================================================
          PRODUCT DETAIL MODAL (Descripción, Características y Variantes)
         ==================================================================== */}
      {selectedProduct && (() => {
        const variantsList = parseJsonArray(selectedProduct.variants)
        const bundleList = parseJsonArray(selectedProduct.bundleItems)
        const isKit = Boolean(selectedProduct.isBundle || bundleList.length > 0)
        const featuresList = getEffectiveFeatures(selectedProduct)
        const activeVariant = variantsList[selectedVariantIdx] || null
        const effectivePrice =
          activeVariant?.price !== undefined && Number(activeVariant.price) > 0
            ? Number(activeVariant.price)
            : Number(selectedProduct.price) || 0
        const effectiveStock =
          activeVariant?.stock !== undefined
            ? Number(activeVariant.stock)
            : selectedProduct.stock ?? 15

        return (
          <div
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-[#041124] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Cerrar ventana"
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Image & Badges */}
                <div className="md:col-span-5 space-y-4">
                  <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-6 relative">
                    {selectedProduct.image && selectedProduct.image !== "/placeholder-product.png" ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-4xl font-black uppercase text-white/15">
                        {selectedProduct.brand || "SP"}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
                      <span className="text-[10px] uppercase text-white/40 font-bold block">Código SKU</span>
                      <strong className="font-mono text-secondary">{selectedProduct.sku || "SP-CERT"}</strong>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
                      <span className="text-[10px] uppercase text-white/40 font-bold block">Disponibilidad</span>
                      <strong className="text-green-400">{effectiveStock} unidades</strong>
                    </div>
                  </div>
                </div>

                {/* Right Column: Full Info, Description, Characteristics & Variants */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.brand && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white/80">
                          Marca: {selectedProduct.brand}
                        </span>
                      )}
                      {isKit && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 shadow-md">
                          <Gift className="w-3.5 h-3.5 text-purple-400" /> Kit / Combo Compuesto
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {selectedProduct.name}
                    </h2>

                    {/* Price Box */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/40 block">
                          Precio de Contado
                        </span>
                        {effectivePrice > 0 ? (
                          <div className="flex items-baseline gap-3 mt-1">
                            <span className="text-3xl font-black text-green-400 font-mono">
                              {formatPrice(effectivePrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-black text-amber-400">Precio a Consultar</span>
                        )}
                      </div>

                      {effectivePrice > 0 && (
                        <div className="text-right bg-secondary/10 border border-secondary/30 px-3.5 py-2 rounded-xl">
                          <div className="text-[10px] font-black uppercase text-secondary">
                            Plan en Cuotas ({rates.defaultInitialPercent}% Inicial)
                          </div>
                          <div className="text-xs font-mono text-white font-bold">
                            Inicial: {formatPrice(effectivePrice * (rates.defaultInitialPercent / 100))} + 3 cuotas
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variants Selector */}
                    {variantsList.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-secondary flex items-center gap-1.5">
                          <Layers className="w-4 h-4" /> Selecciona una Variante / Presentación:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {variantsList.map((v: any, idx: number) => {
                            const vName = typeof v === "object" ? (v?.name || `Opción ${idx + 1}`) : String(v)
                            const vPrice = typeof v === "object" ? Number(v?.price || 0) : 0
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedVariantIdx(idx)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all flex items-center gap-2 ${
                                  selectedVariantIdx === idx
                                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                                    : "bg-white/5 text-white/70 border-white/10 hover:text-white"
                                }`}
                              >
                                <span>{vName}</span>
                                {vPrice > 0 && (
                                  <span className="font-mono opacity-90">
                                    ({formatPrice(vPrice)})
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Full Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-white/50">
                        Descripción del Producto
                      </h4>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {selectedProduct.description ||
                          `Equipo de alto rendimiento perteneciente a la línea de ${selectedProduct.category}, seleccionado bajo estándares de ingeniería de Servicios y Suministros SP.`}
                      </p>
                    </div>

                    {/* Kit / Bundle Included Components List */}
                    {isKit && bundleList.length > 0 && (
                      <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-purple-200">
                            ¿Qué incluye este Kit / Combo? ({bundleList.length} equipos/componentes)
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {bundleList.map((item: any, idx: number) => {
                            const itemName = typeof item === "object" ? (item?.name || `Componente ${idx + 1}`) : String(item)
                            const itemQty = typeof item === "object" ? (item?.quantity || 1) : 1
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 bg-[#020813]/90 border border-purple-500/20 px-3 py-2 rounded-xl text-xs"
                              >
                                <span className="w-6 h-6 rounded-lg bg-purple-500/25 text-purple-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                                  x{itemQty}
                                </span>
                                <span className="font-bold text-white leading-tight">{itemName}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Technical Characteristics List */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-white/50">
                        Características y Especificaciones Técnicas
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {featuresList.map((feat: any, idx: number) => {
                          const featText = typeof feat === "object" ? normalizeFeature(feat) : String(feat)
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl text-xs text-white/90"
                            >
                              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                              <span>{featText}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => {
                        handleAddToCart(selectedProduct, activeVariant || undefined)
                        setSelectedProduct(null)
                      }}
                      className="flex-1 h-14 bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider rounded-2xl gap-2 shadow-xl shadow-secondary/20"
                    >
                      <Plus className="w-5 h-5" /> Agregar a Solicitud
                      {activeVariant ? ` (${activeVariant.name})` : ""}
                    </Button>

                    <Button
                      onClick={() => handleWhatsApp(selectedProduct.name, activeVariant?.name)}
                      className="h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wider rounded-2xl gap-2 px-6"
                    >
                      <MessageCircle className="w-5 h-5" /> Consultar en WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
