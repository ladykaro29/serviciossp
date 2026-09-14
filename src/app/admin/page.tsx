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
  Tag,
  RefreshCw,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductItem {
  id: string
  name: string
  category: string
  price: number
  brand: string | null
  image: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const sessionObj = useSession()
  const session = sessionObj?.data
  const status = sessionObj?.status || "loading"
  const router = useRouter()

  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Current product being edited / created
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    price: 0,
    brand: "",
    image: "",
    description: "",
    isActive: true
  })

  // Delete confirmation modal
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, router])

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products?all=true")
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      } else {
        setMessage({ type: "error", text: "Error al cargar la lista de productos." })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de conexión al obtener productos." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchProducts()
    }
  }, [status])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean))
    return ["Todos", ...Array.from(cats).sort()]
  }, [products])

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat = selectedCategory === "Todos" || p.category === selectedCategory

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive)

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [products, searchQuery, selectedCategory, statusFilter])

  // Metrics
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const inactiveProducts = totalProducts - activeProducts

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode("create")
    setFormData({
      id: "",
      name: "",
      category: categories[1] || "INVERSORES",
      price: 0,
      brand: "",
      image: "/placeholder-product.png",
      description: "",
      isActive: true
    })
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (product: ProductItem) => {
    setModalMode("edit")
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price || 0,
      brand: product.brand || "",
      image: product.image || "/placeholder-product.png",
      description: product.description || "",
      isActive: product.isActive
    })
    setIsModalOpen(true)
  }

  // Quick toggle active status
  const handleToggleActive = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive })
      })

      if (res.ok) {
        const updated = await res.json()
        setProducts(prev => prev.map(p => (p.id === product.id ? updated : p)))
        setMessage({
          type: "success",
          text: `Producto "${product.name}" ${updated.isActive ? "activado" : "ocultado"}.`
        })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al actualizar estado del producto." })
    }
  }

  // Submit create or edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })

        if (res.ok) {
          const created = await res.json()
          setProducts(prev => [created, ...prev])
          setIsModalOpen(false)
          setMessage({ type: "success", text: "¡Producto creado con éxito!" })
          setTimeout(() => setMessage(null), 4000)
        } else {
          const err = await res.json()
          setMessage({ type: "error", text: err.error || "Error al crear producto." })
        }
      } else {
        const res = await fetch(`/api/products/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })

        if (res.ok) {
          const updated = await res.json()
          setProducts(prev => prev.map(p => (p.id === formData.id ? updated : p)))
          setIsModalOpen(false)
          setMessage({ type: "success", text: "¡Producto actualizado con éxito!" })
          setTimeout(() => setMessage(null), 4000)
        } else {
          const err = await res.json()
          setMessage({ type: "error", text: err.error || "Error al actualizar producto." })
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de red al guardar los cambios." })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
        setProductToDelete(null)
        setMessage({ type: "success", text: "Producto eliminado correctamente." })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: "error", text: "No se pudo eliminar el producto." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de red al eliminar el producto." })
    } finally {
      setDeleting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
        <p className="text-white/60 font-medium">Cargando panel administrativo...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#020813] text-foreground font-sans pb-24">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#041124]/90 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/LogoServicios-SP.png"
                alt="Logo Servicios SP"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Modo Admin
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-white/50">Sesión iniciada como</span>
              <span className="text-sm font-bold text-white">{session.user?.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white/80 hover:text-white hover:bg-white/5 rounded-xl gap-2 text-xs"
              asChild
            >
              <Link href="/productos" target="_blank">
                Ver Tienda <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl gap-2 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-10">
        {/* Banner Title & Quick Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Gestor de <span className="text-secondary">Productos</span>
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Crea, modifica precios, categorías y disponibilidad de los productos en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchProducts}
              variant="outline"
              size="lg"
              className="border-white/10 text-white/80 hover:text-white hover:bg-white/5 rounded-2xl gap-2 font-bold"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-secondary" : ""}`} />
              Actualizar
            </Button>
            <Button
              onClick={handleOpenCreate}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl gap-2 shadow-lg shadow-secondary/20 hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" /> Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Status Alert Notification */}
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

        {/* Metrics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#041124]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50">Total Productos</div>
              <div className="text-3xl font-black text-white mt-1">{totalProducts}</div>
            </div>
          </div>

          <div className="bg-[#041124]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50">Productos Visibles</div>
              <div className="text-3xl font-black text-green-400 mt-1">{activeProducts}</div>
            </div>
          </div>

          <div className="bg-[#041124]/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50">Categorías</div>
              <div className="text-3xl font-black text-white mt-1">{categories.length - 1}</div>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-[#041124]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca o modelo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white">
              <Filter className="w-4 h-4 text-secondary" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#041124] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 text-xs font-bold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === "all" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === "active" ? "bg-green-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  statusFilter === "inactive" ? "bg-red-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Ocultos
              </button>
            </div>
          </div>
        </div>

        {/* Products Table / Cards */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-secondary mx-auto mb-4" />
            <p className="text-white/50 font-medium">Cargando inventario de productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#041124]/30 p-16 rounded-[2.5rem] border border-white/5 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No se encontraron productos</h3>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Prueba cambiando los filtros de búsqueda o agrega un nuevo producto con el botón superior.
            </p>
          </div>
        ) : (
          <div className="bg-[#041124]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-white/40 bg-white/[0.02]">
                    <th className="py-5 px-6">Producto</th>
                    <th className="py-5 px-6">Categoría</th>
                    <th className="py-5 px-6">Marca</th>
                    <th className="py-5 px-6">Precio ($ USD)</th>
                    <th className="py-5 px-6">Estado</th>
                    <th className="py-5 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name & Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {product.image && product.image !== "/placeholder-product.png" ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  ;(e.target as any).style.display = "none"
                                }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-white/30" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-secondary transition-colors line-clamp-1 max-w-sm">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs text-white/40 line-clamp-1 max-w-sm mt-0.5">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="py-4 px-6 text-white/70 font-medium">
                        {product.brand || "—"}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-base text-white">
                        {product.price > 0 ? (
                          <span className="text-green-400 font-mono">${product.price.toFixed(2)}</span>
                        ) : (
                          <span className="text-white/40 font-mono text-xs uppercase tracking-wider">A Consultar</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            product.isActive
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                              : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          {product.isActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Activo
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Oculto
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleOpenEdit(product)}
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 border-white/10 text-white/80 hover:text-white hover:bg-white/10 rounded-xl gap-1.5 text-xs font-bold"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-secondary" /> Modificar
                          </Button>
                          <Button
                            onClick={() => setProductToDelete(product)}
                            size="sm"
                            variant="destructive"
                            className="h-9 w-9 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 px-6 border-t border-white/5 flex justify-between items-center text-xs text-white/40 font-medium">
              <span>Mostrando {filteredProducts.length} de {products.length} productos</span>
              <span>Servicios y Suministros SP</span>
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#041124] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-2xl font-black text-white">
                {modalMode === "create" ? "Crear Nuevo Producto" : "Modificar Producto"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Inversor Híbrido 5kW Deye"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej: INVERSORES, BATERIAS, CAMARAS"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej: Deye, Hikvision, Felicity"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                    Precio ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00 (0 = A Consultar)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-mono text-sm focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-white/40 mt-1 block">Coloca 0 si prefieres que el cliente consulte precio.</span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                    Visibilidad en Catálogo
                  </label>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded-lg accent-secondary cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-white">
                        {formData.isActive ? "Producto Visible y Activo" : "Producto Oculto"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... o /placeholder-product.png"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/60 mb-2">
                  Descripción o Especificaciones
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles técnicos, voltaje, garantía..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-secondary transition-colors resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-white/10 text-white/70 hover:text-white rounded-2xl px-6 h-12"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl px-8 h-12 gap-2 shadow-lg shadow-secondary/20"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {modalMode === "create" ? "Crear Producto" : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#041124] border border-red-500/20 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">¿Eliminar Producto?</h3>
            <p className="text-white/60 text-sm mb-6">
              ¿Estás seguro de que deseas eliminar permanentemente <strong>&ldquo;{productToDelete.name}&rdquo;</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setProductToDelete(null)}
                className="border-white/10 text-white/70 hover:text-white rounded-2xl px-6 h-12"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl px-6 h-12 gap-2 shadow-lg shadow-red-900/30"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Eliminar Definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
