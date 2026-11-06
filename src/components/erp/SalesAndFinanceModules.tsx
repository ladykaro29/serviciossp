"use client"

import React, { useState, useMemo } from "react"
import { jsPDF } from "jspdf"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  CreditCard,
  Wallet,
  Building2,
  Truck,
  ArrowRight,
  DollarSign,
  Calendar,
  Search,
  UserPlus,
  Receipt,
  Loader2,
  AlertCircle,
  Check,
  Grid,
  List,
  ChevronDown,
  User,
  Store,
  Tag,
  Gift,
  X,
  Coins,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SalesAndFinanceProps {
  activeSubModule: "ventas" | "compras" | "cxc_cxp"
  products: any[]
  orders: any[]
  customers: any[]
  suppliers: any[]
  purchases: any[]
  receivables: any[]
  payables: any[]
  bankAccounts: any[]
  settings: any
  formatMoney: (usd: number) => string
  onRefreshAll: () => Promise<void>
  showMessage: (type: "success" | "error", text: string) => void
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>
  onDeleteOrder: (orderId: string) => Promise<void>
}

export function SalesAndFinanceModules({
  activeSubModule,
  products,
  orders,
  customers,
  suppliers,
  purchases,
  receivables,
  payables,
  bankAccounts,
  settings,
  formatMoney,
  onRefreshAll,
  showMessage,
  onUpdateOrderStatus,
  onDeleteOrder,
}: SalesAndFinanceProps) {
  const [submitting, setSubmitting] = useState(false)

  // ==========================================
  // 1. VENTAS & POS STATE (Executive Cloud ERP style)
  // ==========================================
  const [salesView, setSalesView] = useState<"pos" | "orders">("pos")
  const [posSearch, setPosSearch] = useState("")
  const [posCart, setPosCart] = useState<Array<{ id: string; name: string; sku: string; price: number; quantity: number; stock: number; isBundle?: boolean }>>([])
  
  // Branch, Register & View Config (Matching reference)
  const [posBranch, setPosBranch] = useState("Sucursal Principal (El Vigía)")
  const [posRegister, setPosRegister] = useState("CAJA 1")
  const [posCurrencyMode, setPosCurrencyMode] = useState<"USD" | "BS" | "MIXTO">("USD")
  const [posPriceTier, setPosPriceTier] = useState<"Menudeo" | "Mayorista" | "Distribuidor">("Menudeo")
  const [posCategoryFilter, setPosCategoryFilter] = useState("Todas")
  const [posLayoutView, setPosLayoutView] = useState<"grid" | "list">("grid")
  const [posDiscount, setPosDiscount] = useState<number>(0)
  const [posCheckoutModalOpen, setPosCheckoutModalOpen] = useState(false)
  const [posPaymentMethod, setPosPaymentMethod] = useState("Efectivo USD")
  const [posAmountTendered, setPosAmountTendered] = useState<number>(0)
  const [posSelectedCustomerId, setPosSelectedCustomerId] = useState<string>("final")
  const [posCustomerSelectorOpen, setPosCustomerSelectorOpen] = useState(false)

  // Customer Data
  const [posCustomerName, setPosCustomerName] = useState("Consumidor Final")
  const [posCustomerDoc, setPosCustomerDoc] = useState("V-00000000")
  const [posCustomerPhone, setPosCustomerPhone] = useState("")
  const [posCustomerCity, setPosCustomerCity] = useState("El Vigía")
  const [posPaymentCondition, setPosPaymentCondition] = useState<"CONTADO" | "CREDITO">("CONTADO")
  const [posBankAccountId, setPosBankAccountId] = useState<string>(bankAccounts[0]?.id || "")
  const [posApplyTax, setPosApplyTax] = useState(false)
  const [posInitialPercent, setPosInitialPercent] = useState<number>(settings?.defaultInitialPercent || 40)
  const [posInstallmentsCount, setPosInstallmentsCount] = useState<number>(settings?.defaultInstallments || 3)
  const [posFrequencyDays, setPosFrequencyDays] = useState<number>(settings?.defaultFrequencyDays || 14)
  const [posSurchargePercent, setPosSurchargePercent] = useState<number>(0)
  const [posNotes, setPosNotes] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("Todos")

  // ==========================================
  // 2. COMPRAS & PROVEEDORES STATE
  // ==========================================
  const [purchasesView, setPurchasesView] = useState<"new_purchase" | "history" | "suppliers">("new_purchase")
  const [purSupplierId, setPurSupplierId] = useState("")
  const [purSupplierName, setPurSupplierName] = useState("")
  const [purInvoiceNumber, setPurInvoiceNumber] = useState("")
  const [purPaymentCondition, setPurPaymentCondition] = useState<"CONTADO" | "CREDITO">("CONTADO")
  const [purBankAccountId, setPurBankAccountId] = useState<string>(bankAccounts[0]?.id || "")
  const [purDueDateDays, setPurDueDateDays] = useState(15)
  const [purSearch, setPurSearch] = useState("")
  const [purItems, setPurItems] = useState<Array<{ productId: string; name: string; quantity: number; unitCost: number }>>([])
  const [purNotes, setPurNotes] = useState("")

  // Supplier Form
  const [supForm, setSupForm] = useState({
    id: "",
    name: "",
    rif: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    category: "Energía Solar e Inversores",
    notes: "",
  })

  // ==========================================
  // 3. CXC & CXP STATE
  // ==========================================
  const [cxcTab, setCxcTab] = useState<"cxc" | "cxp">("cxc")
  const [payingCxc, setPayingCxc] = useState<any | null>(null)
  const [cxcPayAmount, setCxcPayAmount] = useState<number>(0)
  const [cxcPayBankId, setCxcPayBankId] = useState<string>(bankAccounts[0]?.id || "")
  const [cxcPayRef, setCxcPayRef] = useState("")

  const [payingCxp, setPayingCxp] = useState<any | null>(null)
  const [cxpPayAmount, setCxpPayAmount] = useState<number>(0)
  const [cxpPayBankId, setCxpPayBankId] = useState<string>(bankAccounts[0]?.id || "")
  const [cxpPayRef, setCxpPayRef] = useState("")

  // Categories list for POS
  const posCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean))
    return ["Todas", ...Array.from(cats).sort()]
  }, [products])

  // Dynamic unit price considering Price Tier
  const getProductUnitPrice = (prod: any) => {
    const base = prod.price || 0
    if (posPriceTier === "Mayorista") return Number((base * 0.95).toFixed(2))
    if (posPriceTier === "Distribuidor") return Number((base * 0.90).toFixed(2))
    return base
  }

  // Filtered products for POS
  const posProducts = useMemo(() => {
    const q = posSearch.toLowerCase().trim()
    return products
      .filter(p => p.isActive)
      .filter(p => {
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)

        const matchesCat = posCategoryFilter === "Todas" || p.category === posCategoryFilter
        return matchesSearch && matchesCat
      })
  }, [products, posSearch, posCategoryFilter])

  // Filtered products for Purchases
  const purProducts = useMemo(() => {
    const q = purSearch.toLowerCase().trim()
    return products
      .filter(
        p =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 15)
  }, [products, purSearch])

  // POS Totals (with discount & dual currency)
  const posSubtotal = posCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const posSubtotalAfterDiscount = Math.max(0, posSubtotal - (Number(posDiscount) || 0))
  const posTax = posApplyTax ? Number((posSubtotalAfterDiscount * ((settings?.ivaPercent || 16) / 100)).toFixed(2)) : 0
  const posBaseTotal = Number((posSubtotalAfterDiscount + posTax).toFixed(2))
  const posSurcharge =
    posPaymentCondition === "CREDITO" && posSurchargePercent > 0
      ? Number((posBaseTotal * (posSurchargePercent / 100)).toFixed(2))
      : 0
  const posFinalTotal = Number((posBaseTotal + posSurcharge).toFixed(2))
  const posRateBs = settings?.usdToBs || 65.5
  const posTotalBs = Number((posFinalTotal * posRateBs).toFixed(2))

  const posInitialUsd =
    posPaymentCondition === "CREDITO"
      ? Number((posFinalTotal * (posInitialPercent / 100)).toFixed(2))
      : posFinalTotal
  const posBalanceUsd = Number((posFinalTotal - posInitialUsd).toFixed(2))
  const posInstallmentUsd =
    posInstallmentsCount > 0 ? Number((posBalanceUsd / posInstallmentsCount).toFixed(2)) : 0

  // Change / Vuelto calculation in tender modal
  const posChangeDueUsd = useMemo(() => {
    if (posAmountTendered <= 0) return 0
    return Math.max(0, Number((posAmountTendered - posFinalTotal).toFixed(2)))
  }, [posAmountTendered, posFinalTotal])

  const posChangeDueBs = useMemo(() => {
    return Number((posChangeDueUsd * posRateBs).toFixed(2))
  }, [posChangeDueUsd, posRateBs])

  const addToPosCart = (prod: any) => {
    const unitPrice = getProductUnitPrice(prod)
    setPosCart(prev => {
      const existing = prev.find(i => i.id === prod.id)
      if (existing) {
        return prev.map(i => (i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          sku: prod.sku || "SP",
          price: unitPrice,
          quantity: 1,
          stock: prod.stock ?? 15,
          isBundle: prod.isBundle,
        },
      ]
    })
  }

  // Load web order into POS
  const handleLoadOrderIntoPos = (order: any) => {
    try {
      const parsed = JSON.parse(order.items || "[]")
      setPosCustomerName(order.customerName || "")
      setPosCustomerDoc(order.customerDoc || "")
      setPosCustomerPhone(order.customerPhone || "")
      setPosPaymentCondition(order.paymentCondition === "CREDITO" ? "CREDITO" : "CONTADO")
      setPosCart(
        parsed.map((it: any) => ({
          id: it.id || "",
          name: it.name,
          sku: it.sku || "WEB",
          price: parseFloat(it.price) || 0,
          quantity: parseInt(String(it.quantity), 10) || 1,
          stock: 15,
        }))
      )
      setSalesView("pos")
      showMessage("success", `Cotización de "${order.customerName}" cargada en el Facturador POS.`)
    } catch {
      showMessage("error", "No se pudieron cargar los ítems de la cotización.")
    }
  }

  // Generate PDF Receipt / Financing Schedule
  const handleDownloadInvoicePdf = (saleData: {
    invoiceNumber: string
    customerName: string
    customerDoc: string
    customerPhone: string
    items: any[]
    totalUsd: number
    paymentCondition: string
    initialUsd: number
    installmentsCount: number
    frequencyDays: number
    installmentUsd: number
  }) => {
    const doc = new jsPDF()
    const rateBs = settings?.usdToBs || 65.5

    doc.setFillColor(4, 17, 36)
    doc.rect(0, 0, 210, 42, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("SERVICIOS Y SUMINISTROS SP, C.A.", 14, 18)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("RIF: J-40403649-0 | El Vigía, Edo. Mérida | Tel: 0414-7550091", 14, 26)
    doc.text(`Tasa BCV Ref: Bs. ${rateBs.toFixed(2)} / USD`, 14, 33)

    doc.setTextColor(255, 98, 0)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(saleData.invoiceNumber, 155, 20)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 155, 28)
    doc.text(`Modalidad: ${saleData.paymentCondition}`, 155, 34)

    doc.setTextColor(20, 20, 20)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("DATOS DEL CLIENTE:", 14, 54)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Cliente: ${saleData.customerName}`, 14, 61)
    doc.text(`CI / RIF: ${saleData.customerDoc || "N/A"}   |   Teléfono: ${saleData.customerPhone || "N/A"}`, 14, 67)

    let y = 78
    doc.setFillColor(240, 240, 240)
    doc.rect(14, y - 5, 182, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("DESCRIPCIÓN DEL EQUIPO / SERVICIO", 16, y)
    doc.text("CANT.", 125, y)
    doc.text("P. UNIT ($)", 145, y)
    doc.text("SUBTOTAL ($)", 172, y)

    y += 8
    doc.setFont("helvetica", "normal")
    saleData.items.forEach(it => {
      const sub = (Number(it.price) || 0) * (Number(it.quantity) || 1)
      doc.text(String(it.name).substring(0, 52), 16, y)
      doc.text(String(it.quantity), 128, y)
      doc.text(`$${Number(it.price).toFixed(2)}`, 145, y)
      doc.text(`$${sub.toFixed(2)}`, 172, y)
      y += 7
    })

    y += 4
    doc.line(14, y, 196, y)
    y += 8
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`TOTAL OPERACIÓN: $${saleData.totalUsd.toFixed(2)} USD`, 120, y)
    y += 6
    doc.setFontSize(10)
    doc.text(`Equivalente: Bs. ${(saleData.totalUsd * rateBs).toFixed(2)}`, 120, y)

    if (saleData.paymentCondition === "CREDITO") {
      y += 14
      doc.setFillColor(255, 245, 235)
      doc.rect(14, y - 6, 182, 42, "F")
      doc.setTextColor(200, 70, 0)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("CRONOGRAMA DE FINANCIAMIENTO EN CUOTAS (LLÉVATELO HOY Y PAGA DESPUÉS)", 18, y)
      y += 7
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(9)
      doc.text(`• Pago Inicial Recibido Hoy: $${saleData.initialUsd.toFixed(2)} USD (Bs. ${(saleData.initialUsd * rateBs).toFixed(2)})`, 18, y)
      y += 6
      doc.text(
        `• Saldo Financiado: $${(saleData.totalUsd - saleData.initialUsd).toFixed(2)} USD en ${saleData.installmentsCount} cuotas cada ${saleData.frequencyDays} días:`,
        18,
        y
      )
      for (let i = 1; i <= saleData.installmentsCount; i++) {
        y += 6
        const d = new Date()
        d.setDate(d.getDate() + i * saleData.frequencyDays)
        doc.text(
          `   Cuota #${i} - Vence: ${d.toLocaleDateString()}  -->  Monto: $${saleData.installmentUsd.toFixed(2)} USD (Bs. ${(saleData.installmentUsd * rateBs).toFixed(2)})`,
          18,
          y
        )
      }
    }

    doc.save(`${saleData.invoiceNumber}_${saleData.customerName.replace(/\s+/g, "_")}.pdf`)
  }

  // Submit POS Sale
  const handleCreatePosSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!posCustomerName.trim() || posCart.length === 0) {
      showMessage("error", "Ingresa el nombre del cliente y al menos un producto en la venta.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_POS_SALE",
          payload: {
            customerName: posCustomerName,
            customerDoc: posCustomerDoc,
            customerPhone: posCustomerPhone,
            customerCity: posCustomerCity,
            items: posCart,
            paymentCondition: posPaymentCondition,
            bankAccountId: posBankAccountId || bankAccounts[0]?.id,
            currency: "USD",
            applyTax: posApplyTax,
            initialPercent: posInitialPercent,
            installmentsCount: posInstallmentsCount,
            frequencyDays: posFrequencyDays,
            surchargePercent: posSurchargePercent,
            notes: posNotes,
          },
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showMessage(
          "success",
          posPaymentCondition === "CREDITO"
            ? `¡Venta Financiada ${data.order.invoiceNumber} procesada! Se descontó el stock, se registró la inicial en Banco y se creó el plan de ${posInstallmentsCount} cuotas en CxC.`
            : `¡Venta de Contado ${data.order.invoiceNumber} registrada con éxito! Stock e ingresos actualizados.`
        )
        handleDownloadInvoicePdf({
          invoiceNumber: data.order.invoiceNumber,
          customerName: posCustomerName,
          customerDoc: posCustomerDoc,
          customerPhone: posCustomerPhone,
          items: posCart,
          totalUsd: posFinalTotal,
          paymentCondition: posPaymentCondition,
          initialUsd: posInitialUsd,
          installmentsCount: posInstallmentsCount,
          frequencyDays: posFrequencyDays,
          installmentUsd: posInstallmentUsd,
        })
        setPosCart([])
        setPosCustomerName("")
        setPosCustomerDoc("")
        setPosCustomerPhone("")
        setPosNotes("")
        await onRefreshAll()
      } else {
        showMessage("error", data.error || "Error al procesar la venta.")
      }
    } catch {
      showMessage("error", "Error de conexión al procesar la venta.")
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Purchase
  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purSupplierName.trim() || purItems.length === 0) {
      showMessage("error", "Selecciona un proveedor y agrega productos a la factura de compra.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PURCHASE",
          payload: {
            invoiceNumber: purInvoiceNumber,
            supplierId: purSupplierId,
            supplierName: purSupplierName,
            paymentCondition: purPaymentCondition,
            bankAccountId: purBankAccountId || bankAccounts[0]?.id,
            dueDateDays: purDueDateDays,
            items: purItems,
            notes: purNotes,
          },
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showMessage(
          "success",
          `¡Compra ${data.purchase.invoiceNumber} registrada! Se incrementó el stock de ${purItems.length} productos automáticamente.`
        )
        setPurItems([])
        setPurInvoiceNumber("")
        setPurNotes("")
        await onRefreshAll()
      } else {
        showMessage("error", data.error || "Error al registrar compra.")
      }
    } catch {
      showMessage("error", "Error de red al guardar compra.")
    } finally {
      setSubmitting(false)
    }
  }

  // Save Supplier
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supForm.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_SUPPLIER", payload: supForm }),
      })
      if (res.ok) {
        showMessage("success", "Proveedor guardado correctamente.")
        setSupForm({
          id: "",
          name: "",
          rif: "",
          contactName: "",
          phone: "",
          email: "",
          address: "",
          category: "Energía Solar e Inversores",
          notes: "",
        })
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Pay CxC
  const handlePayReceivable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingCxc || cxcPayAmount <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PAY_RECEIVABLE",
          payload: {
            receivableId: payingCxc.id,
            amountUsd: cxcPayAmount,
            bankAccountId: cxcPayBankId || bankAccounts[0]?.id,
            reference: cxcPayRef,
          },
        }),
      })
      if (res.ok) {
        showMessage("success", `¡Cobro de $${cxcPayAmount.toFixed(2)} USD registrado e ingresado en Banco!`)
        setPayingCxc(null)
        setCxcPayRef("")
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Pay CxP
  const handlePayPayable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingCxp || cxpPayAmount <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PAY_PAYABLE",
          payload: {
            payableId: payingCxp.id,
            amountUsd: cxpPayAmount,
            bankAccountId: cxpPayBankId || bankAccounts[0]?.id,
            reference: cxpPayRef,
          },
        }),
      })
      if (res.ok) {
        showMessage("success", `¡Pago a proveedor de $${cxpPayAmount.toFixed(2)} USD registrado!`)
        setPayingCxp(null)
        setCxpPayRef("")
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================================
  // RENDER 1: VENTAS & PUNTO DE VENTA (POS) + BANDEJA WEB
  // ============================================================================
  if (activeSubModule === "ventas") {
    const filteredOrders = orders.filter(o => orderStatusFilter === "Todos" || o.status === orderStatusFilter)

    return (
      <div className="space-y-8">
        {/* Sub-navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Módulo de <span className="text-secondary">Ventas y Facturación</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Factura de contado o activa planes en cuotas ({settings?.defaultInitialPercent || 40}% inicial + {settings?.defaultInstallments || 3} cuotas cada {settings?.defaultFrequencyDays || 14} días).
            </p>
          </div>

          <div className="flex bg-[#041124] p-1.5 rounded-2xl border border-white/10 gap-2">
            <button
              onClick={() => setSalesView("pos")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                salesView === "pos" ? "bg-secondary text-white shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Facturador POS / Cuotas
            </button>
            <button
              onClick={() => setSalesView("orders")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                salesView === "orders" ? "bg-secondary text-white shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <Receipt className="w-4 h-4" /> Cotizaciones y Pedidos ({orders.length})
            </button>
          </div>
        </div>

        {salesView === "pos" ? (
          <div className="space-y-4">
            {/* ====================================================================
                TOP POS TOOLBAR (Exact layout from reference screenshot)
               ==================================================================== */}
            <div className="bg-[#050f24] border border-white/5 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              {/* Left Selectors: Branch & Register */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#030917] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/90">
                  <Store className="w-3.5 h-3.5 text-secondary" />
                  <select
                    value={posBranch}
                    onChange={e => setPosBranch(e.target.value)}
                    className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Sucursal Principal (El Vigía)" className="bg-[#030917]">
                      Sucursal Principal (El Vigía)
                    </option>
                    <option value="Almacén Central SP" className="bg-[#030917]">
                      Almacén Central SP
                    </option>
                    <option value="Showroom Mérida" className="bg-[#030917]">
                      Showroom Mérida
                    </option>
                  </select>
                </div>

                <div className="bg-[#3b2d13] border border-amber-500/40 text-amber-300 font-mono font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <span>📦 {posRegister}</span>
                </div>

                <button
                  type="button"
                  onClick={() => showMessage("success", `Caja 1 sincronizada. Tasa BCV: Bs. ${posRateBs.toFixed(2)}`)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-xs"
                  title="Opciones de caja"
                >
                  •••
                </button>
              </div>

              {/* Center: Live Search & Barcode Input */}
              <div className="flex-1 min-w-[260px] max-w-xl relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posSearch}
                  onChange={e => setPosSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && posProducts.length === 1) {
                      addToPosCart(posProducts[0])
                      setPosSearch("")
                      showMessage("success", `Agregado: ${posProducts[0].name}`)
                    }
                  }}
                  placeholder="Buscar o escanear — nombre, SKU o código de barras (Enter agrega)"
                  className="w-full bg-[#030917] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* Right: Currency Toggle, Price Tier, Categories & View Toggle */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Currency Switcher: USD | Bs. | Mixto */}
                <div className="flex bg-[#030917] p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPosCurrencyMode("USD")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      posCurrencyMode === "USD"
                        ? "bg-blue-600 text-white shadow-md font-black"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosCurrencyMode("BS")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      posCurrencyMode === "BS"
                        ? "bg-blue-600 text-white shadow-md font-black"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Bs.
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosCurrencyMode("MIXTO")}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      posCurrencyMode === "MIXTO"
                        ? "bg-blue-600 text-white shadow-md font-black"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Mixto
                  </button>
                </div>

                {/* Price Tier Dropdown */}
                <div className="bg-[#030917] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white">
                  <select
                    value={posPriceTier}
                    onChange={e => setPosPriceTier(e.target.value as any)}
                    className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Menudeo" className="bg-[#030917]">Menudeo ▾</option>
                    <option value="Mayorista" className="bg-[#030917]">Mayorista (-5%) ▾</option>
                    <option value="Distribuidor" className="bg-[#030917]">Distribuidor (-10%) ▾</option>
                  </select>
                </div>

                {/* Category Dropdown Filter */}
                <div className="bg-[#030917] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white">
                  <select
                    value={posCategoryFilter}
                    onChange={e => setPosCategoryFilter(e.target.value)}
                    className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {posCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-[#030917]">
                        {cat} ▾
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex bg-[#030917] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPosLayoutView("grid")}
                    className={`p-1.5 rounded-lg transition-all ${
                      posLayoutView === "grid" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                    }`}
                    title="Vista en cuadrícula"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosLayoutView("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      posLayoutView === "list" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
                    }`}
                    title="Vista en lista"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ====================================================================
                MAIN POS WORKSPACE: LEFT CATALOG + RIGHT TICKET
               ==================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: Product Catalog Grid / List */}
              <div className="lg:col-span-8 space-y-4">
                {posLayoutView === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 max-h-[72vh] overflow-y-auto pr-1">
                    {posProducts.map(prod => {
                      const stockVal = prod.stock ?? 15
                      const minVal = prod.minStock ?? 3
                      const unitPrice = getProductUnitPrice(prod)
                      const unitPriceBs = unitPrice * posRateBs

                      return (
                        <div
                          key={prod.id}
                          onClick={() => addToPosCart(prod)}
                          className="bg-[#061126] border border-white/5 hover:border-secondary/50 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] cursor-pointer group select-none min-h-[220px]"
                        >
                          {/* Image Box */}
                          <div className="w-full h-24 rounded-xl bg-[#030917] border border-white/5 flex items-center justify-center overflow-hidden mb-2 relative">
                            {prod.image && prod.image !== "/placeholder-product.png" ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                                onError={e => {
                                  ;(e.target as any).style.display = "none"
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
                                📦
                              </div>
                            )}

                            {prod.isBundle && (
                              <span className="absolute top-1 left-1 text-[8px] bg-purple-500/90 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                                <Gift className="w-2.5 h-2.5" /> KIT
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-[10px] font-mono text-white/40 truncate">
                                {prod.sku || "SP-0000"}
                              </div>
                              <h4 className="text-xs font-bold text-white group-hover:text-secondary line-clamp-2 leading-tight mt-0.5">
                                {prod.name}
                              </h4>
                            </div>

                            {/* Prices based on Currency Mode */}
                            <div className="my-2">
                              {(posCurrencyMode === "USD" || posCurrencyMode === "MIXTO") && (
                                <div className="text-sm font-black font-mono text-emerald-400">
                                  ${unitPrice.toFixed(2)}
                                </div>
                              )}
                              {(posCurrencyMode === "BS" || posCurrencyMode === "MIXTO") && (
                                <div className="text-[11px] font-mono text-sky-400 font-bold truncate">
                                  Bs. {unitPriceBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                                </div>
                              )}
                            </div>

                            {/* Stock & Unit Footer */}
                            <div className="flex items-center justify-between text-[9px] pt-2 border-t border-white/5">
                              <span
                                className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                                  stockVal <= minVal
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-emerald-500/15 text-emerald-400"
                                }`}
                              >
                                Stock: {stockVal}
                              </span>
                              <span className="text-white/40 font-semibold bg-white/5 px-1.5 py-0.5 rounded">
                                {prod.unit || "Unidad"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-[#061126] border border-white/5 rounded-2xl overflow-hidden max-h-[72vh] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#030917] text-white/40 text-[10px] font-black uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="py-3 px-4">SKU / Producto</th>
                          <th className="py-3 px-3">Categoría</th>
                          <th className="py-3 px-3">Stock</th>
                          <th className="py-3 px-3 text-right">Precio ($)</th>
                          <th className="py-3 px-3 text-right">Precio (Bs.)</th>
                          <th className="py-3 px-4 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {posProducts.map(prod => {
                          const unitPrice = getProductUnitPrice(prod)
                          return (
                            <tr
                              key={prod.id}
                              onClick={() => addToPosCart(prod)}
                              className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                            >
                              <td className="py-2.5 px-4">
                                <div className="font-bold text-white">{prod.name}</div>
                                <div className="text-[10px] font-mono text-white/40">{prod.sku}</div>
                              </td>
                              <td className="py-2.5 px-3 text-white/60">{prod.category}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-emerald-400 font-bold">
                                  {prod.stock ?? 15}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                                ${unitPrice.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">
                                Bs. {(unitPrice * posRateBs).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  className="w-7 h-7 rounded-lg bg-secondary/20 hover:bg-secondary text-secondary hover:text-white flex items-center justify-center mx-auto"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RIGHT: POS Sales Register / Ticket de Venta (Exact style to reference) */}
              <div className="lg:col-span-4">
                <div className="bg-[#050f24] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[580px]">
                  {/* Ticket Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Venta actual</span>
                        <span className="text-white/40 font-normal">· {posCart.length} productos</span>
                      </h3>
                      {posCart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPosCart([])}
                          className="text-[11px] text-red-400 hover:underline font-semibold"
                        >
                          Vaciar
                        </button>
                      )}
                    </div>

                    {/* Customer Selector Dropdown matching screenshot */}
                    <div className="mb-3 relative">
                      <div
                        onClick={() => setPosCustomerSelectorOpen(!posCustomerSelectorOpen)}
                        className="w-full bg-[#030917] border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="font-semibold truncate">{posCustomerName}</span>
                          {posCustomerDoc && (
                            <span className="text-white/40 text-[10px] font-mono">({posCustomerDoc})</span>
                          )}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                      </div>

                      {/* Dropdown Options */}
                      {posCustomerSelectorOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#040e24] border border-white/15 rounded-2xl p-2 shadow-2xl z-30 space-y-1">
                          <div
                            onClick={() => {
                              setPosCustomerName("Consumidor Final")
                              setPosCustomerDoc("V-00000000")
                              setPosCustomerPhone("")
                              setPosCustomerSelectorOpen(false)
                            }}
                            className="p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs text-white flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            <strong>Consumidor Final</strong>
                          </div>

                          {customers.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setPosCustomerName(c.name)
                                setPosCustomerDoc(c.document || "")
                                setPosCustomerPhone(c.phone || "")
                                setPosCustomerCity(c.city || "El Vigía")
                                setPosCustomerSelectorOpen(false)
                              }}
                              className="p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs text-white/90 flex items-center justify-between"
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="text-[10px] text-white/40 font-mono">{c.document}</span>
                            </div>
                          ))}

                          <div className="border-t border-white/10 pt-1 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const customName = prompt("Nombre o Razón Social del cliente:")
                                if (customName) {
                                  const customDoc = prompt("CI o RIF del cliente (ej. V-12345678):") || ""
                                  const customPhone = prompt("Teléfono WhatsApp:") || ""
                                  setPosCustomerName(customName)
                                  setPosCustomerDoc(customDoc)
                                  setPosCustomerPhone(customPhone)
                                }
                                setPosCustomerSelectorOpen(false)
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-secondary/20 text-secondary text-xs font-bold flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" /> Registrar nuevo cliente aquí
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {posCart.length === 0 ? (
                        <div className="text-center py-12 px-4 text-white/40">
                          <div className="text-xs font-semibold">Sin productos aún.</div>
                          <div className="text-[11px] text-white/30 mt-1">
                            Haz clic en un producto para agregar.
                          </div>
                        </div>
                      ) : (
                        posCart.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-[#030917] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white truncate text-[11px]">{item.name}</div>
                              <div className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                                ${item.price.toFixed(2)} c/u
                              </div>
                            </div>

                            {/* Qty Adjusters */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPosCart(prev =>
                                    prev.map((x, i) =>
                                      i === idx ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x
                                    )
                                  )
                                }
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-mono font-bold text-white text-xs">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPosCart(prev =>
                                    prev.map((x, i) => (i === idx ? { ...x, quantity: x.quantity + 1 } : x))
                                  )
                                }
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => setPosCart(prev => prev.filter((_, i) => i !== idx))}
                                className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Ticket Bottom Calculations */}
                  <div className="border-t border-white/10 pt-3 space-y-3 mt-3">
                    {/* Subtotal & IVA */}
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Subtotal</span>
                      <span className="font-mono text-white font-bold">${posSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/60">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={posApplyTax}
                          onChange={e => setPosApplyTax(e.target.checked)}
                          className="rounded accent-secondary"
                        />
                        <span>IVA {posApplyTax ? `(${settings?.ivaPercent || 16}%)` : "0%"}</span>
                      </label>
                      <span className="font-mono text-white">${posTax.toFixed(2)}</span>
                    </div>

                    {/* Descuento / cupón input field */}
                    <div className="flex items-center justify-between gap-2 bg-[#030917] border border-white/10 rounded-xl px-3 py-1.5 text-xs">
                      <span className="text-white/50 text-[11px]">Descuento / cupón / tasa:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-white/40">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={posDiscount || ""}
                          onChange={e => setPosDiscount(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-16 bg-transparent text-right font-mono text-amber-400 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Mode Toggle: Contado vs Cuotas */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPosPaymentCondition("CONTADO")}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                          posPaymentCondition === "CONTADO"
                            ? "bg-green-500/20 border border-green-500/50 text-green-300"
                            : "bg-white/5 text-white/50 hover:text-white"
                        }`}
                      >
                        De Contado
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentCondition("CREDITO")}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                          posPaymentCondition === "CREDITO"
                            ? "bg-secondary/20 border border-secondary/50 text-secondary"
                            : "bg-white/5 text-white/50 hover:text-white"
                        }`}
                      >
                        En Cuotas (40%)
                      </button>
                    </div>

                    {/* Total Dual (USD and Bs.) */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-black uppercase text-white/70">TOTAL</span>
                        <div className="text-right">
                          <div className="text-2xl font-black font-mono text-emerald-400">
                            ${posFinalTotal.toFixed(2)}
                          </div>
                          <div className="text-[11px] font-mono text-white/50">
                            ≈ Bs. {posTotalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} a cobrar
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Big Action Button: ✓ Cobrar $X.XX */}
                    <button
                      type="button"
                      disabled={posCart.length === 0}
                      onClick={() => {
                        setPosAmountTendered(posFinalTotal)
                        setPosCheckoutModalOpen(true)
                      }}
                      className="w-full py-3.5 px-4 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:hover:bg-[#10b981] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <Check className="w-5 h-5 font-black stroke-[3]" />
                      <span>Cobrar ${posFinalTotal.toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ====================================================================
                CHECKOUT & PAYMENT MODAL (Fast Cashier Modal)
               ==================================================================== */}
            {posCheckoutModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <div className="bg-[#050f24] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-secondary" /> Finalizar Venta en Caja
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPosCheckoutModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[#030917] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/50 uppercase font-bold">Cliente</div>
                      <div className="text-sm font-bold text-white">{posCustomerName}</div>
                      <div className="text-[10px] font-mono text-white/40">{posCustomerDoc || "Sin documento"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/50 uppercase font-bold">Monto Total a Cobrar</div>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        ${posFinalTotal.toFixed(2)} USD
                      </div>
                      <div className="text-xs font-mono text-sky-400 font-bold">
                        Bs. {posTotalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-white/60">
                      Método de Pago
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { id: "Efectivo USD", label: "💵 Efectivo USD ($)" },
                        { id: "Pago Móvil (Bs.)", label: "📲 Pago Móvil (Bs.)" },
                        { id: "Punto de Venta", label: "💳 Punto de Venta" },
                        { id: "Zelle", label: "⚡ Zelle ($)" },
                        { id: "Binance Pay / USDT", label: "🟡 Binance USDT" },
                        { id: "Transferencia Bancaria", label: "🏦 Transferencia" },
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPosPaymentMethod(m.id)}
                          className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                            posPaymentMethod === m.id
                              ? "bg-secondary text-white border-secondary shadow-lg"
                              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tendered Amount & Change Calculator */}
                  <div className="grid grid-cols-2 gap-3 bg-[#030917] border border-white/10 rounded-2xl p-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                        Monto Recibido ($ USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={posAmountTendered}
                        onChange={e => setPosAmountTendered(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/60 mb-1">
                        Cambio / Vuelto
                      </label>
                      <div className="p-2 bg-white/5 rounded-xl">
                        <div className="text-base font-black font-mono text-emerald-400">
                          ${posChangeDueUsd.toFixed(2)} USD
                        </div>
                        <div className="text-[10px] font-mono text-white/50">
                          Bs. {posChangeDueBs.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPosCheckoutModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={handleCreatePosSale}
                      className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-secondary/20 flex items-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span>Emitir Ticket y Completar Venta</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Bandeja de Cotizaciones y Pedidos Web */
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {["Todos", "Recibido", "En Evaluación", "Presupuesto Enviado", "Completado", "Cancelado"].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    orderStatusFilter === st
                      ? "bg-secondary text-white shadow-lg"
                      : "bg-[#041124]/40 text-white/50 hover:text-white border border-white/5"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-[#041124]/30 p-16 rounded-3xl border border-white/5 text-center text-white/50">
                No hay pedidos ni cotizaciones en este estado.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  let parsedItems: any[] = []
                  try {
                    parsedItems = JSON.parse(order.items || "[]")
                  } catch {
                    parsedItems = []
                  }

                  return (
                    <div
                      key={order.id}
                      className="bg-[#041124]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex flex-col lg:flex-row justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg text-secondary font-bold">
                            {order.invoiceNumber || `ORD-${order.id.slice(-5).toUpperCase()}`}
                          </span>
                          <h3 className="text-lg font-black text-white">{order.customerName}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.paymentCondition === "CREDITO"
                                ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                : "bg-green-500/15 text-green-400 border border-green-500/30"
                            }`}
                          >
                            {order.paymentCondition === "CREDITO" ? "Financiado / En Cuotas" : "De Contado"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                            {order.status}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {order.notes && (
                          <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                            {order.notes}
                          </div>
                        )}

                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                          <ul className="space-y-1 text-xs text-white/80">
                            {parsedItems.map((it, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>
                                  • {it.name} <strong className="text-secondary">x{it.quantity}</strong>
                                </span>
                                {Number(it.price) > 0 && (
                                  <span className="font-mono">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                          {order.total > 0 && (
                            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between font-bold text-sm text-white">
                              <span>Total Operación:</span>
                              <span className="text-green-400 font-mono">
                                ${order.total.toFixed(2)} USD ({formatMoney(order.total)})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-3 min-w-[230px]">
                        <Button
                          onClick={() => handleLoadOrderIntoPos(order)}
                          className="w-full bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl gap-2 text-xs"
                        >
                          <ShoppingCart className="w-4 h-4" /> Cargar en Facturador POS
                        </Button>

                        <select
                          value={order.status}
                          onChange={e => onUpdateOrderStatus(order.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        >
                          <option value="Recibido" className="bg-[#041124]">Recibido</option>
                          <option value="En Evaluación" className="bg-[#041124]">En Evaluación</option>
                          <option value="Presupuesto Enviado" className="bg-[#041124]">Presupuesto Enviado</option>
                          <option value="Completado" className="bg-[#041124]">Completado (Descuenta Stock)</option>
                          <option value="Cancelado" className="bg-[#041124]">Cancelado</option>
                        </select>

                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar Registro
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER 2: COMPRAS & PROVEEDORES
  // ============================================================================
  if (activeSubModule === "compras") {
    const purTotal = purItems.reduce((acc, i) => acc + i.unitCost * i.quantity, 0)

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Módulo de <span className="text-secondary">Compras y Proveedores</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Registra facturas de compra para alimentar el stock automáticamente, actualizar costos y controlar Cuentas por Pagar.
            </p>
          </div>

          <div className="flex bg-[#041124] p-1.5 rounded-2xl border border-white/10 gap-2">
            <button
              onClick={() => setPurchasesView("new_purchase")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                purchasesView === "new_purchase" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              + Registrar Compra
            </button>
            <button
              onClick={() => setPurchasesView("history")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                purchasesView === "history" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Historial Compras ({purchases.length})
            </button>
            <button
              onClick={() => setPurchasesView("suppliers")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                purchasesView === "suppliers" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Proveedores ({suppliers.length})
            </button>
          </div>
        </div>

        {purchasesView === "new_purchase" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Select products to restock */}
            <div className="lg:col-span-6 bg-[#041124]/60 p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white/70">
                1. Seleccionar Equipos que Ingresan al Almacén
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={purSearch}
                  onChange={e => setPurSearch(e.target.value)}
                  placeholder="Buscar producto para agregar a la compra..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white"
                />
              </div>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {purProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setPurItems(prev => {
                        const ex = prev.find(x => x.productId === p.id)
                        if (ex) {
                          return prev.map(x =>
                            x.productId === p.id ? { ...x, quantity: x.quantity + 1 } : x
                          )
                        }
                        return [
                          ...prev,
                          {
                            productId: p.id,
                            name: p.name,
                            quantity: 5,
                            unitCost: p.costPrice || Number(((p.price || 0) * 0.68).toFixed(2)),
                          },
                        ]
                      })
                    }}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-secondary/10 border border-white/5 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-white/40 font-mono">
                        Stock actual: {p.stock ?? 15} | Último costo: ${(p.costPrice || 0).toFixed(2)}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-secondary" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Purchase Invoice Form */}
            <form
              onSubmit={handleCreatePurchase}
              className="lg:col-span-6 bg-[#041124]/80 p-6 rounded-3xl border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-5 h-5 text-secondary" /> 2. Datos de Factura de Compra
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1">
                    Proveedor *
                  </label>
                  <select
                    required
                    value={purSupplierId}
                    onChange={e => {
                      setPurSupplierId(e.target.value)
                      const s = suppliers.find(x => x.id === e.target.value)
                      if (s) setPurSupplierName(s.name)
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="" className="bg-[#041124]">
                      -- Seleccionar proveedor --
                    </option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#041124]">
                        {s.name} ({s.rif})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1">
                    N° Factura / Control Proveedor
                  </label>
                  <input
                    type="text"
                    value={purInvoiceNumber}
                    onChange={e => setPurInvoiceNumber(e.target.value)}
                    placeholder="Ej: FAC-009821"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1">
                    Condición de Pago
                  </label>
                  <select
                    value={purPaymentCondition}
                    onChange={e => setPurPaymentCondition(e.target.value as "CONTADO" | "CREDITO")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="CONTADO" className="bg-[#041124]">De Contado (Descuenta de Banco)</option>
                    <option value="CREDITO" className="bg-[#041124]">A Crédito (Genera Cuenta por Pagar CxP)</option>
                  </select>
                </div>

                {purPaymentCondition === "CONTADO" ? (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/50 mb-1">
                      Pagar desde Cuenta / Caja
                    </label>
                    <select
                      value={purBankAccountId}
                      onChange={e => setPurBankAccountId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    >
                      {bankAccounts.map(b => (
                        <option key={b.id} value={b.id} className="bg-[#041124]">
                          {b.name} ({b.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-white/50 mb-1">
                      Días de Crédito Otorgados
                    </label>
                    <input
                      type="number"
                      value={purDueDateDays}
                      onChange={e => setPurDueDateDays(parseInt(e.target.value, 10) || 15)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Items table */}
              <div className="border-y border-white/10 py-3 space-y-2 max-h-60 overflow-y-auto">
                {purItems.length === 0 ? (
                  <p className="text-center text-xs text-white/30 py-6">
                    Selecciona productos de la columna izquierda para cargar cantidades y costos.
                  </p>
                ) : (
                  purItems.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 bg-white/[0.03] p-2.5 rounded-xl text-xs"
                    >
                      <span className="font-bold text-white flex-1 truncate">{it.name}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-white/40">Cant:</label>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={e => {
                            const q = parseInt(e.target.value, 10) || 1
                            setPurItems(prev => prev.map((x, i) => (i === idx ? { ...x, quantity: q } : x)))
                          }}
                          className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-white font-mono"
                        />
                        <label className="text-[10px] text-white/40">Costo $:</label>
                        <input
                          type="number"
                          step="0.01"
                          value={it.unitCost}
                          onChange={e => {
                            const c = parseFloat(e.target.value) || 0
                            setPurItems(prev => prev.map((x, i) => (i === idx ? { ...x, unitCost: c } : x)))
                          }}
                          className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-amber-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setPurItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-white/60">Total Factura de Compra:</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  ${purTotal.toFixed(2)} USD ({formatMoney(purTotal)})
                </span>
              </div>

              <Button
                type="submit"
                disabled={submitting || purItems.length === 0}
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl uppercase tracking-wider text-xs"
              >
                Registrar Compra y Sumar al Inventario
              </Button>
            </form>
          </div>
        )}

        {purchasesView === "history" && (
          <div className="bg-[#041124]/40 rounded-3xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4">Factura</th>
                  <th className="p-4">Proveedor</th>
                  <th className="p-4">Condición</th>
                  <th className="p-4">Total ($ USD)</th>
                  <th className="p-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-bold text-secondary">{p.invoiceNumber}</td>
                    <td className="p-4 font-bold text-white">{p.supplierName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                        {p.paymentCondition}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">${p.total.toFixed(2)}</td>
                    <td className="p-4 text-xs text-white/50">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {purchasesView === "suppliers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={handleSaveSupplier}
              className="bg-[#041124]/80 p-6 rounded-3xl border border-white/10 space-y-4 h-fit"
            >
              <h3 className="text-lg font-black text-white">Agregar / Editar Proveedor</h3>
              <input
                type="text"
                required
                placeholder="Razón Social del Proveedor *"
                value={supForm.name}
                onChange={e => setSupForm({ ...supForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="RIF (Ej: J-41209834-1)"
                value={supForm.rif}
                onChange={e => setSupForm({ ...supForm, rif: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Persona de Contacto"
                value={supForm.contactName}
                onChange={e => setSupForm({ ...supForm, contactName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Teléfono / WhatsApp"
                value={supForm.phone}
                onChange={e => setSupForm({ ...supForm, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Rubro / Categoría"
                value={supForm.category}
                onChange={e => setSupForm({ ...supForm, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <Button type="submit" className="w-full bg-secondary text-white font-black rounded-xl">
                Guardar Proveedor
              </Button>
            </form>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suppliers.map(s => (
                <div key={s.id} className="bg-[#041124]/50 p-5 rounded-3xl border border-white/5 space-y-2">
                  <div className="text-xs font-mono text-secondary font-bold">{s.rif || "SIN RIF"}</div>
                  <h4 className="text-lg font-black text-white">{s.name}</h4>
                  <div className="text-xs text-white/60">Contacto: {s.contactName || "—"}</div>
                  <div className="text-xs text-white/60">Tel: {s.phone || "—"}</div>
                  <div className="text-[11px] text-white/40 italic">{s.notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER 3: CUENTAS POR COBRAR (CUOTAS) & CUENTAS POR PAGAR
  // ============================================================================
  const totalCxcPending = receivables.reduce((acc, r) => acc + (r.balance || 0), 0)
  const totalCxpPending = payables.reduce((acc, p) => acc + (p.balance || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Cuentas por <span className="text-secondary">Cobrar y Pagar</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Control de planes de financiamiento en cuotas de clientes (CxC) y facturas pendientes con proveedores (CxP).
          </p>
        </div>

        <div className="flex bg-[#041124] p-1.5 rounded-2xl border border-white/10 gap-2">
          <button
            onClick={() => setCxcTab("cxc")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              cxcTab === "cxc" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Cuentas por Cobrar / Cuotas (${totalCxcPending.toFixed(2)})
          </button>
          <button
            onClick={() => setCxcTab("cxp")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              cxcTab === "cxp" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Cuentas por Pagar Proveedores (${totalCxpPending.toFixed(2)})
          </button>
        </div>
      </div>

      {cxcTab === "cxc" ? (
        <div className="space-y-4">
          {receivables.length === 0 ? (
            <div className="bg-[#041124]/40 p-16 rounded-3xl border border-white/5 text-center text-white/50">
              No hay cuentas por cobrar ni planes de cuotas registrados. Crea una venta financiada en el Facturador POS para generar el cronograma automático.
            </div>
          ) : (
            receivables.map(r => {
              let installmentsList: any[] = []
              try {
                installmentsList = JSON.parse(r.installments || "[]")
              } catch {
                installmentsList = []
              }
              const pctPaid = r.totalAmount > 0 ? Math.min(100, Math.round((r.paidAmount / r.totalAmount) * 100)) : 100

              return (
                <div
                  key={r.id}
                  className="bg-[#041124]/50 p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white">{r.customerName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black ${
                            r.status === "PAGADO"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{r.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-white/40">Saldo Pendiente</div>
                        <div className="text-2xl font-black text-amber-400 font-mono">
                          ${r.balance.toFixed(2)} USD
                        </div>
                        <div className="text-[11px] text-white/50 font-mono">{formatMoney(r.balance)}</div>
                      </div>

                      {r.balance > 0 && (
                        <Button
                          onClick={() => {
                            setPayingCxc(r)
                            const nextInst = installmentsList.find(i => i.status !== "PAGADO")
                            setCxcPayAmount(
                              nextInst
                                ? Number((nextInst.amount - (nextInst.paidAmount || 0)).toFixed(2))
                                : r.balance
                            )
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl gap-2 text-xs"
                        >
                          <DollarSign className="w-4 h-4" /> Cobrar Cuota / Abono
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all" style={{ width: `${pctPaid}%` }} />
                  </div>

                  {/* Installments Schedule Grid */}
                  {installmentsList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {installmentsList.map((inst, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border text-xs flex justify-between items-center ${
                            inst.status === "PAGADO"
                              ? "bg-green-500/10 border-green-500/30 text-green-300"
                              : "bg-white/[0.03] border-white/10 text-white"
                          }`}
                        >
                          <div>
                            <div className="font-black uppercase">Cuota #{inst.number}</div>
                            <div className="text-[11px] opacity-70">
                              Vence: {new Date(inst.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-black text-sm">${Number(inst.amount).toFixed(2)}</div>
                            <div className="text-[10px] font-bold uppercase">{inst.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* Cuentas por Pagar Proveedores */
        <div className="space-y-4">
          {payables.length === 0 ? (
            <div className="bg-[#041124]/40 p-16 rounded-3xl border border-white/5 text-center text-white/50">
              No tienes facturas pendientes por pagar a proveedores.
            </div>
          ) : (
            payables.map(p => (
              <div
                key={p.id}
                className="bg-[#041124]/50 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div>
                  <span className="text-xs font-mono text-secondary font-bold">{p.invoiceNumber}</span>
                  <h3 className="text-xl font-black text-white">{p.supplierName}</h3>
                  <p className="text-xs text-white/50">
                    Vence: {new Date(p.dueDate).toLocaleDateString()} | Total Factura: ${p.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-white/40">Deuda Pendiente</div>
                    <div className="text-2xl font-black text-red-400 font-mono">${p.balance.toFixed(2)} USD</div>
                  </div>
                  {p.balance > 0 && (
                    <Button
                      onClick={() => {
                        setPayingCxp(p)
                        setCxpPayAmount(p.balance)
                      }}
                      className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl text-xs"
                    >
                      Registrar Pago
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Cobro CxC */}
      {payingCxc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handlePayReceivable}
            className="bg-[#041124] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-xl font-black text-white">Registrar Cobro de Cuota / Abono</h3>
            <p className="text-xs text-white/60">
              Cliente: <strong>{payingCxc.customerName}</strong> | Saldo pendiente: ${payingCxc.balance.toFixed(2)} USD
            </p>
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1">Monto a Cobrar ($ USD)</label>
              <input
                type="number"
                step="0.01"
                max={payingCxc.balance}
                required
                value={cxcPayAmount}
                onChange={e => setCxcPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1">Cuenta Bancaria / Caja Destino</label>
              <select
                value={cxcPayBankId}
                onChange={e => setCxcPayBankId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              >
                {bankAccounts.map(b => (
                  <option key={b.id} value={b.id} className="bg-[#041124]">
                    {b.name} ({b.currency})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1">Referencia de Pago</label>
              <input
                type="text"
                value={cxcPayRef}
                onChange={e => setCxcPayRef(e.target.value)}
                placeholder="Ej: Zelle #98123 / Efectivo"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setPayingCxc(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-black">
                Confirmar Cobro
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pago CxP */}
      {payingCxp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handlePayPayable}
            className="bg-[#041124] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-xl font-black text-white">Registrar Pago a Proveedor</h3>
            <p className="text-xs text-white/60">
              Proveedor: <strong>{payingCxp.supplierName}</strong> | Saldo: ${payingCxp.balance.toFixed(2)} USD
            </p>
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1">Monto a Pagar ($ USD)</label>
              <input
                type="number"
                step="0.01"
                max={payingCxp.balance}
                required
                value={cxpPayAmount}
                onChange={e => setCxpPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 mb-1">Pagar desde Cuenta / Caja</label>
              <select
                value={cxpPayBankId}
                onChange={e => setCxpPayBankId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              >
                {bankAccounts.map(b => (
                  <option key={b.id} value={b.id} className="bg-[#041124]">
                    {b.name} ({b.currency})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setPayingCxp(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-secondary text-white font-black">
                Confirmar Pago
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

