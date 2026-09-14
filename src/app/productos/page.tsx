"use client"

import { useState, useMemo } from "react"
import { ShoppingCart, Search, Filter, MessageCircle, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/data/products"
import { useCart } from "@/context/CartContext"

export default function ProductosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [addedProductId, setAddedProductId] = useState<number | null>(null)
  const { addToCart } = useCart()

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ["Todos", ...Array.from(cats).sort()]
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const handleAddToCart = (product: any) => {
    addToCart(product)
    setAddedProductId(product.id)
    setTimeout(() => setAddedProductId(null), 2000)
  }

  const handleWhatsApp = (productName: string) => {
    const message = encodeURIComponent(`Hola, me interesa consultar el precio y disponibilidad de: ${productName}`)
    window.open(`https://wa.me/584147550091?text=${message}`, "_blank")
  }

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-background">
      {/* Page Header */}
      <div className="bg-primary text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10 text-center lg:text-left">
          <div className="inline-block px-4 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
            Equipos de Alta Tecnología
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">Catálogo <span className="text-secondary">Premium</span></h1>
          <p className="text-white/60 max-w-2xl text-xl leading-relaxed">
            Explora nuestra selección curada de equipos de seguridad, energía solar y soluciones de conectividad industrial.
          </p>
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
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] uppercase tracking-[0.15em] text-left px-5 py-4 rounded-2xl transition-all duration-300 border font-black ${
                    selectedCategory === cat 
                    ? 'bg-secondary border-secondary text-white shadow-2xl shadow-secondary/20 scale-[1.02]' 
                    : 'text-foreground/40 hover:bg-white/5 hover:text-foreground border-transparent'
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
                placeholder="Busca marcas, modelos o categorías..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl border border-white/5 focus:ring-4 focus:ring-secondary/5 focus:border-secondary outline-none text-base transition-all bg-white/5 focus:bg-background text-white placeholder:text-white/20 font-medium"
              />
            </div>
            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
              Stock: <span className="text-secondary">{filteredProducts.length} Equipos</span>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden hover:shadow-[0_20px_50px_rgba(255,98,0,0.1)] hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full relative">
                  <div className="aspect-square bg-white/5 relative p-10 flex items-center justify-center overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent"></div>
                    
                    {/* Visual Placeholder */}
                    <div className="w-40 h-40 rounded-[3rem] bg-white/5 shadow-inner border border-white/10 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-700 relative z-10">
                      <span className="text-3xl font-black uppercase tracking-tighter opacity-10">{product.brand}</span>
                    </div>
                    
                    {/* Brand Badge */}
                    <div className="absolute top-6 right-6 bg-[#020813] border border-white/10 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl">
                      {product.brand}
                    </div>

                    {/* Category Label */}
                    <div className="absolute bottom-6 left-6">
                      <span className="text-[9px] bg-secondary/10 text-secondary font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-secondary/20">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="font-black text-foreground text-xl leading-tight mb-8 flex-1 line-clamp-2 group-hover:text-secondary transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-foreground/40 uppercase tracking-widest font-black block mb-1">Cotizar</span>
                        <span className="font-black text-xl text-foreground tracking-tighter italic">Disponible</span>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          size="icon" 
                          className={`h-14 w-14 rounded-2xl shrink-0 shadow-2xl transition-all hover:scale-110 active:scale-95 ${
                            addedProductId === product.id ? 'bg-green-600' : 'bg-primary border border-white/10 hover:bg-secondary'
                          }`}
                        >
                          {addedProductId === product.id ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                        </Button>
                        <Button 
                          onClick={() => handleWhatsApp(product.name)}
                          size="icon" 
                          className="h-14 w-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl shrink-0 shadow-2xl shadow-green-900/20 transition-all hover:scale-110 active:scale-95"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center glass-dark rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                <Search className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tighter">Sin resultados</h3>
              <p className="text-foreground/40 max-w-md mx-auto italic">No pudimos encontrar equipos que coincidan con tu búsqueda.</p>
              <Button 
                variant="outline" 
                className="mt-10 h-14 px-10 rounded-2xl border-secondary text-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
                onClick={() => {setSearchQuery(""); setSelectedCategory("Todos")}}
              >
                Limpiar filtros
              </Button>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}


