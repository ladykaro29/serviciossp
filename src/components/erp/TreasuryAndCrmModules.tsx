"use client"

import React, { useState } from "react"
import {
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Users,
  Wrench,
  FileSpreadsheet,
  ShieldCheck,
  Phone,
  MapPin,
  MessageCircle,
  Trash2,
  SunMedium,
  BarChart3,
  Coins,
  UserCheck,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TreasuryAndCrmProps {
  activeSubModule: "bancos" | "contabilidad" | "crm_vertical" | "usuarios"
  products: any[]
  orders: any[]
  customers: any[]
  purchases: any[]
  receivables: any[]
  payables: any[]
  bankAccounts: any[]
  bankTransactions: any[]
  serviceOrders: any[]
  users: any[]
  settings: any
  formatMoney: (usd: number) => string
  onRefreshAll: () => Promise<void>
  showMessage: (type: "success" | "error", text: string) => void
}

export function TreasuryAndCrmModules({
  activeSubModule,
  products,
  orders,
  customers,
  purchases,
  receivables,
  payables,
  bankAccounts,
  bankTransactions,
  serviceOrders,
  users,
  settings,
  formatMoney,
  onRefreshAll,
  showMessage,
}: TreasuryAndCrmProps) {
  const [submitting, setSubmitting] = useState(false)

  // Bank Form State
  const [txForm, setTxForm] = useState({
    bankAccountId: bankAccounts[0]?.id || "",
    type: "EGRESO",
    category: "GASTO_OPERATIVO",
    amount: "",
    reference: "",
    description: "",
  })

  const [newBankForm, setNewBankForm] = useState({
    name: "",
    bankName: "",
    accountNumber: "",
    currency: "USD",
    type: "BANCO",
    balance: 0,
  })
  const [showNewBankModal, setShowNewBankModal] = useState(false)

  // CRM & Vertical State
  const [crmTab, setCrmTab] = useState<"vertical" | "clientes">("vertical")
  const [srvForm, setSrvForm] = useState({
    id: "",
    customerName: "",
    customerPhone: "",
    customerCity: "El Vigía",
    serviceType: "ENERGIA_SOLAR",
    technicianName: "Ing. Guardia SP",
    status: "VISITA_AGENDADA",
    scheduledDate: new Date().toISOString().split("T")[0],
    laborCost: 120,
    materialsCost: 0,
    serialNumbers: "",
    notes: "",
  })

  const [custForm, setCustForm] = useState({
    id: "",
    name: "",
    document: "",
    phone: "",
    email: "",
    city: "El Vigía",
    type: "PERSONA",
    stage: "CLIENTE",
    creditLimit: 500,
    notes: "",
  })

  // Users Form
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VENDEDOR",
  })

  // Handlers
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txForm.amount || parseFloat(txForm.amount) <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_BANK_TRANSACTION",
          payload: {
            ...txForm,
            bankAccountId: txForm.bankAccountId || bankAccounts[0]?.id,
          },
        }),
      })
      if (res.ok) {
        showMessage("success", "Movimiento bancario registrado y saldo actualizado.")
        setTxForm({ ...txForm, amount: "", reference: "", description: "" })
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBankForm.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_BANK_ACCOUNT", payload: newBankForm }),
      })
      if (res.ok) {
        showMessage("success", "Nueva cuenta o caja creada.")
        setShowNewBankModal(false)
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveServiceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!srvForm.customerName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_SERVICE_ORDER", payload: srvForm }),
      })
      if (res.ok) {
        showMessage("success", "Orden de servicio técnico / instalación guardada.")
        setSrvForm({
          id: "",
          customerName: "",
          customerPhone: "",
          customerCity: "El Vigía",
          serviceType: "ENERGIA_SOLAR",
          technicianName: "Ing. Guardia SP",
          status: "VISITA_AGENDADA",
          scheduledDate: new Date().toISOString().split("T")[0],
          laborCost: 120,
          materialsCost: 0,
          serialNumbers: "",
          notes: "",
        })
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateServiceStatus = async (srv: any, newStatus: string) => {
    await fetch("/api/erp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SAVE_SERVICE_ORDER",
        payload: { ...srv, status: newStatus },
      }),
    })
    showMessage("success", `Orden ${srv.code} actualizada a ${newStatus}.`)
    await onRefreshAll()
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!custForm.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_CUSTOMER", payload: custForm }),
      })
      if (res.ok) {
        showMessage("success", "Cliente guardado en el CRM.")
        setCustForm({
          id: "",
          name: "",
          document: "",
          phone: "",
          email: "",
          city: "El Vigía",
          type: "PERSONA",
          stage: "CLIENTE",
          creditLimit: 500,
          notes: "",
        })
        await onRefreshAll()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userForm.name || !userForm.email) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/erp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_USER", payload: userForm }),
      })
      if (res.ok) {
        showMessage("success", "Usuario del sistema creado correctamente.")
        setUserForm({ name: "", email: "", password: "", role: "VENDEDOR" })
        await onRefreshAll()
      } else {
        showMessage("error", "No se pudo crear el usuario (verifica que el correo no esté repetido).")
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================================
  // 1. BANCOS Y TESORERÍA MULTI-MONEDA
  // ============================================================================
  if (activeSubModule === "bancos") {
    const rateBs = settings?.usdToBs || 65.5
    const rateEur = settings?.eurToBs || 71.2
    const consolidatedUsd = bankAccounts.reduce((acc, b) => {
      if (b.currency === "BS") return acc + b.balance / rateBs
      if (b.currency === "EUR") return acc + b.balance * (rateEur / rateBs)
      return acc + b.balance
    }, 0)

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Bancos y <span className="text-secondary">Tesorería Multi-Moneda</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Control de Cajas en Efectivo ($/€), Zelle y Cuentas Nacionales en Bolívares (Pago Móvil / Transferencias).
            </p>
          </div>
          <Button
            onClick={() => setShowNewBankModal(true)}
            className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-2xl gap-2 text-xs"
          >
            <Plus className="w-4 h-4" /> Nueva Cuenta / Caja
          </Button>
        </div>

        {/* Bank Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bankAccounts.map(b => (
            <div
              key={b.id}
              className="bg-[#041124]/70 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary/15 text-secondary">
                  {b.type} · {b.currency}
                </span>
                <Landmark className="w-5 h-5 text-white/30" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{b.name}</h3>
                <p className="text-xs text-white/40 font-mono">{b.accountNumber || b.bankName}</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] uppercase text-white/40 font-bold">Saldo Disponible</div>
                <div className="text-2xl font-black text-green-400 font-mono">
                  {b.currency === "BS" ? "Bs. " : b.currency === "EUR" ? "€" : "$"}
                  {b.balance.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consolidated & Manual Entry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCreateTransaction}
            className="lg:col-span-4 bg-[#041124]/80 p-6 rounded-3xl border border-white/10 space-y-4 h-fit"
          >
            <h3 className="text-lg font-black text-white">Registrar Gasto Operativo / Ingreso</h3>
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Cuenta o Caja</label>
              <select
                value={txForm.bankAccountId}
                onChange={e => setTxForm({ ...txForm, bankAccountId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              >
                {bankAccounts.map(b => (
                  <option key={b.id} value={b.id} className="bg-[#041124]">
                    {b.name} ({b.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Tipo</label>
                <select
                  value={txForm.type}
                  onChange={e => setTxForm({ ...txForm, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="EGRESO" className="bg-[#041124]">Egreso / Gasto (-)</option>
                  <option value="INGRESO" className="bg-[#041124]">Ingreso (+)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Categoría</label>
                <select
                  value={txForm.category}
                  onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="GASTO_OPERATIVO" className="bg-[#041124]">Gasto Operativo</option>
                  <option value="SERVICIO_TECNICO" className="bg-[#041124]">Servicio / Instalación</option>
                  <option value="NOMINA_COMISION" className="bg-[#041124]">Nómina / Comisión</option>
                  <option value="AJUSTE" className="bg-[#041124]">Ajuste / Cambio Divisa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                Monto (en la moneda de la cuenta) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={txForm.amount}
                onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">N° Referencia</label>
              <input
                type="text"
                value={txForm.reference}
                onChange={e => setTxForm({ ...txForm, reference: e.target.value })}
                placeholder="Ej: Pago Móvil #8921 / Recibo"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Concepto / Detalle *</label>
              <input
                type="text"
                required
                value={txForm.description}
                onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                placeholder="Ej: Pago combustible camioneta de instalación"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-secondary text-white font-black rounded-xl">
              Registrar Movimiento
            </Button>
          </form>

          {/* Transactions Table */}
          <div className="lg:col-span-8 bg-[#041124]/50 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-black text-white">Libro de Movimientos Bancarios y Cajas</h3>
              <span className="text-xs font-mono text-green-400 font-bold">
                Liquidez Consolidada: ${consolidatedUsd.toFixed(2)} USD ({formatMoney(consolidatedUsd)})
              </span>
            </div>
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-black text-white/40">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Cuenta</th>
                    <th className="p-4">Concepto</th>
                    <th className="p-4">Ref.</th>
                    <th className="p-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bankTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 text-white/50">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="p-4 font-bold text-white">{tx.bankAccountName}</td>
                      <td className="p-4 text-white/80">{tx.description}</td>
                      <td className="p-4 font-mono text-white/50">{tx.reference}</td>
                      <td
                        className={`p-4 text-right font-mono font-black ${
                          tx.type === "INGRESO" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {tx.type === "INGRESO" ? "+" : "-"}
                        {tx.currency === "BS" ? "Bs. " : "$"}
                        {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showNewBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form
              onSubmit={handleCreateBankAccount}
              className="bg-[#041124] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-black text-white">Crear Nueva Cuenta o Caja</h3>
              <input
                type="text"
                required
                placeholder="Nombre de la Cuenta (Ej: Binance USDT SP)"
                value={newBankForm.name}
                onChange={e => setNewBankForm({ ...newBankForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newBankForm.currency}
                  onChange={e => setNewBankForm({ ...newBankForm, currency: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
                >
                  <option value="USD" className="bg-[#041124]">Dólares (USD)</option>
                  <option value="BS" className="bg-[#041124]">Bolívares (BS)</option>
                  <option value="EUR" className="bg-[#041124]">Euros (EUR)</option>
                </select>
                <select
                  value={newBankForm.type}
                  onChange={e => setNewBankForm({ ...newBankForm, type: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
                >
                  <option value="BANCO" className="bg-[#041124]">Banco</option>
                  <option value="EFECTIVO" className="bg-[#041124]">Caja Efectivo</option>
                  <option value="ZELLE" className="bg-[#041124]">Zelle</option>
                  <option value="BINANCE" className="bg-[#041124]">Binance</option>
                </select>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Saldo Inicial"
                value={newBankForm.balance}
                onChange={e => setNewBankForm({ ...newBankForm, balance: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewBankModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-secondary text-white font-black">
                  Crear Cuenta
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // 2. CONTABILIDAD & ESTADO DE RESULTADOS
  // ============================================================================
  if (activeSubModule === "contabilidad") {
    const completedOrders = orders.filter(o => o.status === "Completado" || o.status === "Aprobado")
    const totalSalesRevenue = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0)

    // Estimate COGS from sold items
    let estimatedCogs = 0
    completedOrders.forEach(o => {
      try {
        const items = JSON.parse(o.items || "[]")
        items.forEach((it: any) => {
          const prod = products.find(p => p.id === it.id || p.name === it.name)
          const unitCost = prod?.costPrice || (Number(it.price) || 0) * 0.68
          estimatedCogs += unitCost * (Number(it.quantity) || 1)
        })
      } catch {}
    })

    const serviceRevenue = serviceOrders
      .filter(s => s.status === "COMPLETADO")
      .reduce((acc, s) => acc + (s.totalPrice || 0), 0)

    const operationalExpenses = bankTransactions
      .filter(t => t.type === "EGRESO" && t.category === "GASTO_OPERATIVO")
      .reduce((acc, t) => acc + (t.amountUsd || 0), 0)

    const grossProfit = totalSalesRevenue + serviceRevenue - estimatedCogs
    const netProfit = grossProfit - operationalExpenses

    const inventoryCostValue = products.reduce(
      (acc, p) => acc + (p.costPrice || 0) * (p.stock ?? 15),
      0
    )
    const inventoryRetailValue = products.reduce(
      (acc, p) => acc + (p.price || 0) * (p.stock ?? 15),
      0
    )

    const handleExportAccountingCsv = () => {
      const headers = ["Fecha,Tipo,Referencia,Cliente/Proveedor,Condicion,Total_USD,Equivalente_Bs\n"]
      const rows = orders.map(
        o =>
          `"${new Date(o.createdAt).toLocaleDateString()}","VENTA","${o.invoiceNumber || o.id}","${o.customerName}","${
            o.paymentCondition
          }","${o.total.toFixed(2)}","${(o.total * (settings?.usdToBs || 65.5)).toFixed(2)}"`
      )
      const purRows = purchases.map(
        p =>
          `"${new Date(p.createdAt).toLocaleDateString()}","COMPRA","${p.invoiceNumber}","${p.supplierName}","${
            p.paymentCondition
          }","-${p.total.toFixed(2)}","-${(p.total * (settings?.usdToBs || 65.5)).toFixed(2)}"`
      )
      const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows, purRows).join("\n")
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `libro_contable_SP_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Módulo de <span className="text-secondary">Contabilidad y Utilidad</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Estado de resultados financieros, valoración de inventario y libros de ventas y compras.
            </p>
          </div>
          <Button
            onClick={handleExportAccountingCsv}
            className="bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl gap-2 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Libro Contable (CSV / Excel)
          </Button>
        </div>

        {/* Accounting KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#041124]/70 p-6 rounded-3xl border border-white/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Ingresos Brutos (Ventas + Servicios)
            </div>
            <div className="text-2xl font-black text-green-400 font-mono mt-2">
              ${(totalSalesRevenue + serviceRevenue).toFixed(2)} USD
            </div>
            <div className="text-xs text-white/40 font-mono mt-1">
              {formatMoney(totalSalesRevenue + serviceRevenue)}
            </div>
          </div>

          <div className="bg-[#041124]/70 p-6 rounded-3xl border border-white/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Costo Mercancía Vendida (COGS)
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-2">
              ${estimatedCogs.toFixed(2)} USD
            </div>
            <div className="text-xs text-white/40 mt-1">Costo reposición de equipos</div>
          </div>

          <div className="bg-[#041124]/70 p-6 rounded-3xl border border-white/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Utilidad Neta Estimada
            </div>
            <div className="text-2xl font-black text-secondary font-mono mt-2">
              ${netProfit.toFixed(2)} USD
            </div>
            <div className="text-xs text-white/40 mt-1">
              Descontando gastos operativos (${operationalExpenses.toFixed(2)})
            </div>
          </div>

          <div className="bg-[#041124]/70 p-6 rounded-3xl border border-white/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Valoración de Inventario Actual
            </div>
            <div className="text-xl font-black text-white font-mono mt-2">
              Costo: ${inventoryCostValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-green-400 font-mono mt-1">
              Precio Venta: ${inventoryRetailValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // 3. CRM CLIENTES & LA VERTICAL DEL NEGOCIO SP (INSTALACIONES / GARANTÍAS)
  // ============================================================================
  if (activeSubModule === "crm_vertical") {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              CRM y <span className="text-secondary">Vertical Técnica SP</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Gestión de Instalaciones (Energía Solar, CCTV, Cercas Eléctricas, Redes), control de seriales/garantías y directorio CRM.
            </p>
          </div>

          <div className="flex bg-[#041124] p-1.5 rounded-2xl border border-white/10 gap-2">
            <button
              onClick={() => setCrmTab("vertical")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                crmTab === "vertical" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Órdenes de Instalación / Garantías ({serviceOrders.length})
            </button>
            <button
              onClick={() => setCrmTab("clientes")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                crmTab === "clientes" ? "bg-secondary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Directorio CRM Clientes ({customers.length})
            </button>
          </div>
        </div>

        {crmTab === "vertical" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveServiceOrder}
              className="lg:col-span-4 bg-[#041124]/80 p-6 rounded-3xl border border-white/10 space-y-3.5 h-fit"
            >
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-secondary" /> Nueva Orden de Instalación
              </h3>
              <input
                type="text"
                required
                placeholder="Nombre del Cliente *"
                value={srvForm.customerName}
                onChange={e => setSrvForm({ ...srvForm, customerName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={srvForm.customerPhone}
                  onChange={e => setSrvForm({ ...srvForm, customerPhone: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Ciudad / Sector"
                  value={srvForm.customerCity}
                  onChange={e => setSrvForm({ ...srvForm, customerCity: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">
                    Vertical del Servicio
                  </label>
                  <select
                    value={srvForm.serviceType}
                    onChange={e => setSrvForm({ ...srvForm, serviceType: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="ENERGIA_SOLAR" className="bg-[#041124]">Energía Solar / Inversor</option>
                    <option value="CCTV" className="bg-[#041124]">Cámaras CCTV</option>
                    <option value="CERCA_ELECTRICA" className="bg-[#041124]">Cerca Eléctrica</option>
                    <option value="REDES" className="bg-[#041124]">Redes / Enlace WiFi</option>
                    <option value="MANTENIMIENTO" className="bg-[#041124]">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">
                    Técnico Asignado
                  </label>
                  <input
                    type="text"
                    value={srvForm.technicianName}
                    onChange={e => setSrvForm({ ...srvForm, technicianName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">
                    Mano de Obra ($ USD)
                  </label>
                  <input
                    type="number"
                    value={srvForm.laborCost}
                    onChange={e => setSrvForm({ ...srvForm, laborCost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">
                    Materiales ($ USD)
                  </label>
                  <input
                    type="number"
                    value={srvForm.materialsCost}
                    onChange={e => setSrvForm({ ...srvForm, materialsCost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-white/40 font-bold mb-1">
                  Seriales de Equipos (Control de Garantía)
                </label>
                <input
                  type="text"
                  placeholder="Ej: INV-SN998212, BAT-LFP-0041"
                  value={srvForm.serialNumbers}
                  onChange={e => setSrvForm({ ...srvForm, serialNumbers: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Especificaciones del proyecto o visita técnica..."
                value={srvForm.notes}
                onChange={e => setSrvForm({ ...srvForm, notes: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />

              <Button type="submit" disabled={submitting} className="w-full bg-secondary text-white font-black rounded-xl">
                Registrar Orden Técnica
              </Button>
            </form>

            <div className="lg:col-span-8 space-y-4">
              {serviceOrders.length === 0 ? (
                <div className="bg-[#041124]/40 p-16 rounded-3xl border border-white/5 text-center text-white/50">
                  No hay órdenes de instalación activas. Registra la primera en el formulario lateral.
                </div>
              ) : (
                serviceOrders.map(srv => (
                  <div
                    key={srv.id}
                    className="bg-[#041124]/50 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono bg-secondary/20 text-secondary px-2.5 py-0.5 rounded-lg font-bold">
                          {srv.code}
                        </span>
                        <span className="text-xs font-black uppercase bg-white/10 px-2.5 py-0.5 rounded-lg text-white">
                          {srv.serviceType}
                        </span>
                        <h4 className="text-lg font-black text-white">{srv.customerName}</h4>
                      </div>
                      <div className="text-xs text-white/60">
                        📍 {srv.customerCity} | 👷 Técnico: <strong>{srv.technicianName}</strong> | 📅 Fecha: {srv.scheduledDate}
                      </div>
                      {srv.serialNumbers && (
                        <div className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                          🛡️ Seriales Garantía: {srv.serialNumbers}
                        </div>
                      )}
                      {srv.notes && <p className="text-xs text-white/50 italic">{srv.notes}</p>}
                    </div>

                    <div className="flex flex-col justify-between items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-white/40 font-bold">Total Servicio</div>
                        <div className="text-xl font-black text-green-400 font-mono">
                          ${srv.totalPrice.toFixed(2)} USD
                        </div>
                      </div>

                      <select
                        value={srv.status}
                        onChange={e => handleUpdateServiceStatus(srv, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white"
                      >
                        <option value="VISITA_AGENDADA" className="bg-[#041124]">Visita Agendada</option>
                        <option value="PRESUPUESTADO" className="bg-[#041124]">Presupuestado</option>
                        <option value="EN_INSTALACION" className="bg-[#041124]">En Instalación</option>
                        <option value="COMPLETADO" className="bg-[#041124]">Completado</option>
                        <option value="GARANTIA" className="bg-[#041124]">En Garantía</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Directorio CRM Clientes */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveCustomer}
              className="lg:col-span-4 bg-[#041124]/80 p-6 rounded-3xl border border-white/10 space-y-3.5 h-fit"
            >
              <h3 className="text-lg font-black text-white">Nuevo Cliente CRM</h3>
              <input
                type="text"
                required
                placeholder="Nombre Completo o Empresa *"
                value={custForm.name}
                onChange={e => setCustForm({ ...custForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Cédula o RIF"
                value={custForm.document}
                onChange={e => setCustForm({ ...custForm, document: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Teléfono / WhatsApp"
                value={custForm.phone}
                onChange={e => setCustForm({ ...custForm, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={custForm.type}
                  onChange={e => setCustForm({ ...custForm, type: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="PERSONA" className="bg-[#041124]">Persona</option>
                  <option value="EMPRESA" className="bg-[#041124]">Empresa</option>
                  <option value="MAYORISTA" className="bg-[#041124]">Mayorista / Instalador</option>
                </select>
                <select
                  value={custForm.stage}
                  onChange={e => setCustForm({ ...custForm, stage: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="PROSPECTO" className="bg-[#041124]">Prospecto</option>
                  <option value="COTIZADO" className="bg-[#041124]">Cotizado</option>
                  <option value="CLIENTE" className="bg-[#041124]">Cliente Activo</option>
                  <option value="VIP" className="bg-[#041124]">Cliente VIP</option>
                </select>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-secondary text-white font-black rounded-xl">
                Guardar en CRM
              </Button>
            </form>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customers.map(c => (
                <div key={c.id} className="bg-[#041124]/50 p-5 rounded-3xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary">
                      {c.type} · {c.stage}
                    </span>
                    <span className="text-xs font-mono text-white/50">{c.document || "Sin CI/RIF"}</span>
                  </div>
                  <h4 className="text-lg font-black text-white">{c.name}</h4>
                  <div className="text-xs text-white/60">
                    📞 {c.phone || "—"} | 📍 {c.city || "El Vigía"}
                  </div>
                  <div className="text-xs font-mono text-green-400">
                    Límite de Crédito: ${c.creditLimit?.toFixed(2) || "500.00"} USD
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // 4. USUARIOS Y ROLES DEL SISTEMA
  // ============================================================================
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Gestión de <span className="text-secondary">Usuarios y Roles</span>
        </h1>
        <p className="text-white/60 text-sm mt-1">
          Administra los accesos del personal al sistema en la nube (Administradores, Vendedores, Técnicos y Contadores).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form
          onSubmit={handleSaveUser}
          className="lg:col-span-4 bg-[#041124]/80 p-6 rounded-3xl border border-white/10 space-y-4 h-fit"
        >
          <h3 className="text-lg font-black text-white">Crear Nuevo Usuario</h3>
          <input
            type="text"
            required
            placeholder="Nombre y Apellido *"
            value={userForm.name}
            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
          />
          <input
            type="email"
            required
            placeholder="Correo Electrónico *"
            value={userForm.email}
            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
          />
          <input
            type="password"
            required
            placeholder="Contraseña de Acceso *"
            value={userForm.password}
            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
          />
          <select
            value={userForm.role}
            onChange={e => setUserForm({ ...userForm, role: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
          >
            <option value="ADMIN" className="bg-[#041124]">ADMIN (Control Total)</option>
            <option value="VENDEDOR" className="bg-[#041124]">VENDEDOR (Ventas, POS, CRM)</option>
            <option value="TECNICO" className="bg-[#041124]">TECNICO (Instalaciones y Garantías)</option>
            <option value="CONTADOR" className="bg-[#041124]">CONTADOR (Contabilidad, Bancos, CxC/CxP)</option>
          </select>
          <Button type="submit" disabled={submitting} className="w-full bg-secondary text-white font-black rounded-xl">
            Habilitar Usuario
          </Button>
        </form>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map(u => (
            <div
              key={u.id}
              className="bg-[#041124]/50 p-5 rounded-3xl border border-white/10 flex justify-between items-center"
            >
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary">
                  {u.role}
                </span>
                <h4 className="text-lg font-black text-white mt-1">{u.name || "Usuario SP"}</h4>
                <p className="text-xs text-white/50">{u.email}</p>
              </div>
              <UserCheck className="w-6 h-6 text-green-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

