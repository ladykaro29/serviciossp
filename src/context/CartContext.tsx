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
  cart: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (productId: string | number) => void
  updateQuantity: (productId: string | number, quantity: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("servicios_sp_cart")
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to parse cart", e)
    } finally {
      setHydrated(true)
    }
  }, [])

  // Save cart to localStorage on change (only after initial hydration so we don't overwrite saved cart with [])
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("servicios_sp_cart", JSON.stringify(cart))
    } catch (e) {
      console.error("Failed to save cart", e)
    }
  }, [cart, hydrated])

  const addToCart = (product: any) => {
    setCart(prev => {
      const targetId = String(product.id)
      const existing = prev.find(item => String(item.id) === targetId)
      if (existing) {
        return prev.map(item =>
          String(item.id) === targetId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku || "",
          name: product.name,
          category: product.category || "General",
          price: typeof product.price === "number" ? product.price : parseFloat(String(product.price || 0)) || 0,
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

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}
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
