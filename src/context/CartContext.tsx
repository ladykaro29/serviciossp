"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  id: string | number
  sku?: string
  name: string
  category: string
  price?: number | null
  brand?: string | null
  image?: string | null
  description?: string | null
  quantity: number
}

interface CartContextType {
  // Carrito de Compras (Compra Directa - /carrito)
  cart: CartItem[]
  addToCart: (product: any, variant?: any) => void
  removeFromCart: (productId: string | number) => void
  updateQuantity: (productId: string | number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  cartSubtotal: number

  // Lista de Cotización Formal (Presupuesto / Cuotas - /cotizacion)
  quoteList: CartItem[]
  addToQuote: (product: any, variant?: any) => void
  removeFromQuote: (productId: string | number) => void
  updateQuoteQuantity: (productId: string | number, quantity: number) => void
  clearQuote: () => void
  totalQuoteItems: number
  quoteSubtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [quoteList, setQuoteList] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load cart and quoteList from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("servicios_sp_cart")
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        }
      }

      const savedQuotes = localStorage.getItem("servicios_sp_quotes")
      if (savedQuotes) {
        const parsedQuotes = JSON.parse(savedQuotes)
        if (Array.isArray(parsedQuotes)) {
          setQuoteList(parsedQuotes)
        }
      }
    } catch (e) {
      console.error("Failed to parse cart/quotes", e)
    } finally {
      setHydrated(true)
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("servicios_sp_cart", JSON.stringify(cart))
    } catch (e) {
      console.error("Failed to save cart", e)
    }
  }, [cart, hydrated])

  // Save quoteList to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("servicios_sp_quotes", JSON.stringify(quoteList))
    } catch (e) {
      console.error("Failed to save quotes", e)
    }
  }, [quoteList, hydrated])

  // ---------------------------------------------
  // CARRITO DE COMPRA (COMPRA DIRECTA)
  // ---------------------------------------------
  const addToCart = (product: any, variant?: any) => {
    const itemName = variant ? `${product.name} (${variant.name})` : product.name
    const itemPrice = variant && typeof variant.price === "number"
      ? variant.price
      : (typeof product.price === "number" ? product.price : parseFloat(String(product.price || 0)) || 0)
    const itemId = variant ? `${product.id}-${variant.name.replace(/\s+/g, "_")}` : String(product.id)

    setCart(prev => {
      const existing = prev.find(item => String(item.id) === itemId)
      if (existing) {
        return prev.map(item =>
          String(item.id) === itemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: itemId,
          sku: variant?.sku || product.sku || "",
          name: itemName,
          category: product.category || "General",
          price: itemPrice,
          brand: product.brand || "SP",
          image: product.image || "/placeholder-product.png",
          description: product.description || "",
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (productId: string | number) => {
    const targetId = String(productId)
    setCart(prev => prev.filter(item => String(item.id) !== targetId))
  }

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    const targetId = String(productId)
    setCart(prev =>
      prev.map(item => (String(item.id) === targetId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setCart([])

  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )

  // ---------------------------------------------
  // LISTA DE COTIZACIÓN FORMAL (PRESUPUESTO / CUOTAS)
  // ---------------------------------------------
  const addToQuote = (product: any, variant?: any) => {
    const itemName = variant ? `${product.name} (${variant.name})` : product.name
    const itemPrice = variant && typeof variant.price === "number"
      ? variant.price
      : (typeof product.price === "number" ? product.price : parseFloat(String(product.price || 0)) || 0)
    const itemId = variant ? `${product.id}-${variant.name.replace(/\s+/g, "_")}` : String(product.id)

    setQuoteList(prev => {
      const existing = prev.find(item => String(item.id) === itemId)
      if (existing) {
        return prev.map(item =>
          String(item.id) === itemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: itemId,
          sku: variant?.sku || product.sku || "",
          name: itemName,
          category: product.category || "General",
          price: itemPrice,
          brand: product.brand || "SP",
          image: product.image || "/placeholder-product.png",
          description: product.description || "",
          quantity: 1,
        },
      ]
    })
  }

  const removeFromQuote = (productId: string | number) => {
    const targetId = String(productId)
    setQuoteList(prev => prev.filter(item => String(item.id) !== targetId))
  }

  const updateQuoteQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromQuote(productId)
      return
    }
    const targetId = String(productId)
    setQuoteList(prev =>
      prev.map(item => (String(item.id) === targetId ? { ...item, quantity } : item))
    )
  }

  const clearQuote = () => setQuoteList([])

  const totalQuoteItems = quoteList.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const quoteSubtotal = quoteList.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        cartSubtotal,
        quoteList,
        addToQuote,
        removeFromQuote,
        updateQuoteQuantity,
        clearQuote,
        totalQuoteItems,
        quoteSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
