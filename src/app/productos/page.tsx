"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  Filter,
  MessageCircle,
  Plus,
  Check,
  Coins,
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
  if (product?.brand) fallback.push(`Marca / Especificación: ${product.brand}`)
  if (product?.category) fallback.push(`Línea: ${product.category}`)
  const specsMatch = String(product?.name || "").match(/\b(\d+(?:W|V|Ah|kVA|kW|MP|K|m|A|Hz|\-\d+V))\b/gi)
  if (specsMatch && specsMatch.length > 0) {
    fallback.push(`Capacidad / Rango: ${Array.from(new Set(specsMatch)).join(" · ")}`)
  }
  fallback.push("Garantía certificada por Servicios y Suministros SP")
  return fallback
}

export default function ProductosPage() {
  const [productList, setProductList] = useState<any[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [addedProductId, setAddedProductId] = useState<string | number | null>(null)
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "BS" | "BINANCE" | "EUR">("USD")
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
    const cats = new Set(productList.map(p => p.category).filter(Boolean))
    return ["Todos", ...Array.from(cats).sort()]
  }, [productList])

  const filteredProducts = useMemo(() => {
    return productList.filter(product => {
      const nameStr = String(product?.name || "")
      const brandStr = String(product?.brand || "")
      const skuStr = String(product?.sku || "")
      const descStr = String(product?.description || "")
      const q = searchQuery.toLowerCase().trim()
      if (!q && selectedCategory === "Todos") return true
      const matchesSearch =
        !q ||
        nameStr.toLowerCase().includes(q) ||
        brandStr.toLowerCase().includes(q) ||
        skuStr.toLowerCase().includes(q) ||
        descStr.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === "Todos" || product?.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [productList, searchQuery, selectedCategory])

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

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Page Header */}
      <div className="bg-primary text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left">
          <div>
            <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
              Equipos de Alta Tecnología · Multi-Moneda (BCV · Binance · USD · EUR)
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
              Catálogo <span className="text-secondary">Premium</span>
            </h1>
            <p className="text-white/60 max-w-2xl text-xl leading-relaxed">
              Explora especificaciones técnicas, características, variantes y opciones de pago de contado o en cuotas.
            </p>
          </div>

          {/* Multi-currency Switcher Card */}
          <div className="bg-[#041124]/90 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl shrink-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-secondary" /> Moneda y Tasa de Referencia
            </div>
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              {(["USD", "BS", "BINANCE", "EUR"] as const).map(curr => (
                <button
                  key={curr}
                  onClick={() => setDisplayCurrency(curr)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
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
            <div className="mt-2.5 text-[10px] text-white/50 font-mono text-center flex flex-wrap justify-center gap-2">
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

      <div className="container mx-auto px-4 mt-[-60px] relative z-20 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-28">
            <h2 className="font-black text-foreground mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
              <Filter className="w-4 h-4 text-secondary" /> Filtrar Por
            </h2>
            <div className="flex flex-wrap lg:flex-col gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] uppercase tracking-[0.15em] text-left px-5 py-4 rounded-2xl transition-all duration-300 border font-black ${
                    selectedCategory === cat
                      ? "bg-secondary border-secondary text-white shadow-2xl shadow-secondary/20 scale-[1.02]"
                      : "text-foreground/40 hover:bg-white/5 hover:text-foreground border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="flex-1">
          {/* Search/Stats Bar */}
          <div className="glass-dark p-6 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative w-full md:w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/30 w-5 h-5 group-focus-within:text-secondary transition-colors" />
              <input
                type="text"
                placeholder="Busca marcas, modelos, SKU o características..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl border border-white/5 focus:ring-4 focus:ring-secondary/5 focus:border-secondary outline-none text-base transition-all bg-white/5 focus:bg-background text-white placeholder:text-white/20 font-medium"
              />
            </div>
            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
              Catálogo: <span className="text-secondary">{filteredProducts.length} Equipos</span>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map(product => {
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
                    className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden hover:shadow-[0_20px_50px_rgba(255,98,0,0.1)] hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full relative"
                  >
                    {/* Clickable Image Area */}
                    <div
                      onClick={() => openProductDetail(product)}
                      className="aspect-square bg-white/5 relative p-10 flex items-center justify-center overflow-hidden border-b border-white/5 cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent"></div>

                      {product.image && product.image !== "/placeholder-product.png" ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10"
                          onError={e => {
                            ;(e.target as any).style.display = "none"
                          }}
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-[3rem] bg-white/5 shadow-inner border border-white/10 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-700 relative z-10">
                          <span className="text-3xl font-black uppercase tracking-tighter opacity-10">
                            {product.brand || "SP"}
                          </span>
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-6 left-6 z-20">
                        <span
                          className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                            stockVal > 0
                              ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          <PackageCheck className="w-3 h-3" />
                          {stockVal > 0 ? `Stock: ${stockVal}` : "Bajo Pedido"}
                        </span>
                      </div>

                      {/* Brand Badge */}
                      <div className="absolute top-6 right-6 bg-[#020813] border border-white/10 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl z-20">
                        {product.brand || "SP"}
                      </div>

                      {/* Category & Variants/Kit Count */}
                      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap justify-between items-center gap-1.5 z-20">
                        <span className="text-[9px] bg-secondary/10 text-secondary font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest border border-secondary/20">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {isKit && (
                            <span className="text-[9px] bg-purple-500/25 text-purple-200 font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-purple-500/40 flex items-center gap-1 shadow-md">
                              <Gift className="w-3 h-3 text-purple-300" /> Kit {bundleList.length > 0 ? `(${bundleList.length})` : ""}
                            </span>
                          )}
                          {variantsList.length > 0 && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-blue-500/30 flex items-center gap-1">
                              <Layers className="w-3 h-3" /> {variantsList.length} var.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      {product.sku && (
                        <div className="mb-2">
                          <span className="font-mono text-[10px] bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-md font-bold tracking-wider inline-block">
                            {product.sku}
                          </span>
                        </div>
                      )}
                      <h3
                        onClick={() => openProductDetail(product)}
                        className="font-black text-foreground text-lg leading-tight mb-2 line-clamp-2 group-hover:text-secondary transition-colors cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Short Description Preview */}
                      <p className="text-xs text-foreground/60 line-clamp-2 mb-3">
                        {product.description || `Equipo profesional de la línea ${product.category} con respaldo técnico SP.`}
                      </p>

                      {/* Key Characteristics Preview */}
                      {featuresList.length > 0 && (
                        <div className="space-y-1 mb-4">
                          {featuresList.slice(0, 2).map((feat: any, i: number) => {
                            const featText = typeof feat === "object" ? normalizeFeature(feat) : String(feat)
                            return (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/75 truncate">
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
                        className="mb-4 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-black uppercase tracking-wider text-white/80 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-secondary" /> Ver Detalles, Características y Variantes
                      </button>

                      {/* Financing Pill if hasPrice */}
                      {hasPrice && (
                        <div className="mb-4 bg-secondary/10 border border-secondary/20 rounded-2xl p-2.5 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-secondary shrink-0" />
                          <div className="text-[10px] leading-tight text-white/80">
                            <span className="font-black text-secondary">¡En cuotas!</span> Inicial{" "}
                            <strong className="text-white">{formatPrice(initialUsd)}</strong> ({rates.defaultInitialPercent}%) + 3 cuotas
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div>
                          <span className="text-[10px] text-foreground/40 uppercase tracking-widest font-black block mb-0.5">
                            {hasPrice ? `Precio (${displayCurrency})` : "Cotizar"}
                          </span>
                          {hasPrice ? (
                            <span className="font-black text-xl text-green-400 font-mono tracking-tight">
                              {formatPrice(priceNum)}
                            </span>
                          ) : (
                            <span className="font-black text-lg text-foreground tracking-tighter italic">
                              A Consultar
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2.5">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            size="icon"
                            className={`h-12 w-12 rounded-2xl shrink-0 shadow-2xl transition-all hover:scale-110 active:scale-95 ${
                              addedProductId === product.id
                                ? "bg-green-600"
                                : "bg-primary border border-white/10 hover:bg-secondary"
                            }`}
                          >
                            {addedProductId === product.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </Button>
                          <Button
                            onClick={() => handleWhatsApp(product.name)}
                            size="icon"
                            className="h-12 w-12 bg-green-600 hover:bg-green-700 text-white rounded-2xl shrink-0 shadow-2xl shadow-green-900/20 transition-all hover:scale-110 active:scale-95"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-32 text-center glass-dark rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                <Search className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Sin resultados</h3>
              <p className="text-foreground/40 max-w-md mx-auto italic">
                No pudimos encontrar equipos que coincidan con tu búsqueda.
              </p>
              <Button
                variant="outline"
                className="mt-10 h-14 px-10 rounded-2xl border-secondary text-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("Todos")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </main>
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
        const effectivePrice = activeVariant?.price !== undefined && Number(activeVariant.price) > 0
          ? Number(activeVariant.price)
          : Number(selectedProduct.price) || 0
        const effectiveStock = activeVariant?.stock !== undefined
          ? Number(activeVariant.stock)
          : selectedProduct.stock ?? 15

        return (
          <div
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-[#041124] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
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

                  <div className="grid grid-cols-2 gap-3 text-xs">
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

                    {/* Price Box in Multi-currency */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/40 block">
                          Precio de Contado ({displayCurrency})
                        </span>
                        {effectivePrice > 0 ? (
                          <div className="flex items-baseline gap-3 mt-1">
                            <span className="text-3xl font-black text-green-400 font-mono">
                              {formatPrice(effectivePrice)}
                            </span>
                            {displayCurrency !== "USD" && (
                              <span className="text-xs font-mono text-white/50">
                                (${effectivePrice.toFixed(2)} USD)
                              </span>
                            )}
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
