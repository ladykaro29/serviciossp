import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

async function fetchLiveVenezuelaRates() {
  let bcvUsd: number | null = null
  let binanceUsdt: number | null = null
  let bcvEur: number | null = null

  // 1. Consultar DolarApi Venezuela (BCV Oficial y Paralelo/Binance)
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares", {
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const oficial = data.find((d: any) => d.fuente === "oficial")
        const paralelo = data.find((d: any) => d.fuente === "paralelo")
        if (oficial?.promedio && Number(oficial.promedio) > 0) {
          bcvUsd = Number(Number(oficial.promedio).toFixed(2))
        }
        if (paralelo?.promedio && Number(paralelo.promedio) > 0) {
          binanceUsdt = Number(Number(paralelo.promedio).toFixed(2))
        }
      }
    }
  } catch (e) {
    console.warn("No se pudo conectar a ve.dolarapi.com/v1/dolares:", e)
  }

  // 2. Consultar directamente API P2P de Binance (USDT -> VES) para mayor precisión
  try {
    const binanceRes = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset: "USDT",
        fiat: "VES",
        merchantCheck: true,
        page: 1,
        payTypes: [],
        publisherType: null,
        rows: 5,
        tradeType: "BUY",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
    })
    if (binanceRes.ok) {
      const bData = await binanceRes.json()
      const ads = bData?.data
      if (Array.isArray(ads) && ads.length > 0) {
        const prices = ads
          .map((item: any) => parseFloat(item?.adv?.price))
          .filter((p: number) => !isNaN(p) && p > 0)
        if (prices.length > 0) {
          const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
          binanceUsdt = Number(avg.toFixed(2))
        }
      }
    }
  } catch (e) {
    console.warn("No se pudo consultar Binance P2P directo:", e)
  }

  // 3. Consultar Euro BCV o calcular relación EUR/USD oficial
  try {
    const eurRes = await fetch("https://ve.dolarapi.com/v1/euros", {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
    if (eurRes.ok) {
      const eurData = await eurRes.json()
      if (Array.isArray(eurData)) {
        const eurOficial = eurData.find((d: any) => d.fuente === "oficial") || eurData[0]
        if (eurOficial?.promedio && Number(eurOficial.promedio) > 0) {
          bcvEur = Number(Number(eurOficial.promedio).toFixed(2))
        }
      } else if (eurData?.promedio && Number(eurData.promedio) > 0) {
        bcvEur = Number(Number(eurData.promedio).toFixed(2))
      }
    }
  } catch {}

  if (!bcvEur && bcvUsd) {
    // Relación internacional EUR/USD aproximada (1 EUR ≈ 1.085 USD) en BCV
    bcvEur = Number((bcvUsd * 1.085).toFixed(2))
  }

  return { bcvUsd, binanceUsdt, bcvEur }
}

async function ensureInitialErpData(forceSyncRates = false) {
  // 1. Settings
  let settings = await prisma.systemSetting.findUnique({ where: { id: "default" } })
  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        id: "default",
        usdToBs: 65.5,
        binanceToBs: 78.9,
        eurToBs: 71.2,
        ivaPercent: 16.0,
        igtfPercent: 3.0,
        defaultInitialPercent: 40.0,
        defaultInstallments: 3,
        defaultFrequencyDays: 14,
        companyName: "Servicios y Suministros SP, C.A.",
        companyRif: "J-40403649-0",
      },
    })
    forceSyncRates = true
  }

  // Auto-sync live rates if requested or if still on default seed value (65.5)
  if (forceSyncRates || settings.usdToBs === 65.5) {
    const live = await fetchLiveVenezuelaRates()
    if (live.bcvUsd || live.binanceUsdt || live.bcvEur) {
      settings = await prisma.systemSetting.update({
        where: { id: "default" },
        data: {
          ...(live.bcvUsd && { usdToBs: live.bcvUsd }),
          ...(live.binanceUsdt && { binanceToBs: live.binanceUsdt }),
          ...(live.bcvEur && { eurToBs: live.bcvEur }),
        },
      })
    }
  }

  // 2. Default Bank Accounts
  const bankCount = await prisma.bankAccount.count()
  if (bankCount === 0) {
    const defaultBanks = [
      {
        name: "Caja Principal Efectivo ($)",
        bankName: "Efectivo en Tienda",
        accountNumber: "CAJA-USD-01",
        currency: "USD",
        type: "EFECTIVO",
        balance: 1250.0,
      },
      {
        name: "Zelle Corporativo SP ($)",
        bankName: "Bank of America / Zelle",
        accountNumber: "pagos@serviciossp.com",
        currency: "USD",
        type: "ZELLE",
        balance: 2480.0,
      },
      {
        name: "Banco Provincial / Pago Móvil (Bs)",
        bankName: "BBVA Provincial",
        accountNumber: "0108-0098-XX-0100123456",
        currency: "BS",
        type: "BANCO",
        balance: 48500.0,
      },
      {
        name: "Cuenta Custodia Euro (€)",
        bankName: "Banesco / Efectivo EUR",
        accountNumber: "CAJA-EUR-01",
        currency: "EUR",
        type: "EFECTIVO",
        balance: 300.0,
      },
    ]
    for (const b of defaultBanks) {
      await prisma.bankAccount.create({ data: b })
    }
  }

  // 3. Default Suppliers
  const supplierCount = await prisma.supplier.count()
  if (supplierCount === 0) {
    const defaultSuppliers = [
      {
        name: "Importadora Solar Andina C.A.",
        rif: "J-41209834-1",
        contactName: "Ing. Carlos Méndez",
        phone: "0414-7123456",
        email: "ventas@solarandina.com",
        address: "Zona Industrial, Mérida",
        category: "Energía Solar e Inversores",
        notes: "Proveedor principal de paneles e inversores híbridos. Crédito a 15 días.",
      },
      {
        name: "Distribuidora Seguridad Global CCTV",
        rif: "J-30984112-8",
        contactName: "Lic. Mariana Torres",
        phone: "0424-7890123",
        email: "pedidos@seguridadcctv.ve",
        address: "San Cristóbal, Táchira",
        category: "Cámaras y Cercas Eléctricas",
        notes: "Distribuidor autorizado Hikvision y Dahua.",
      },
      {
        name: "Mayorista Redes & Fibra C.A.",
        rif: "J-50012938-4",
        contactName: "Roberto Gómez",
        phone: "0412-6543210",
        email: "contacto@redesyfibra.com",
        address: "Barquisimeto, Lara",
        category: "Redes y Conectividad",
        notes: "Despachos semanales a El Vigía.",
      },
    ]
    for (const s of defaultSuppliers) {
      await prisma.supplier.create({ data: s })
    }
  }

  // 4. Ensure products have SKU and costPrice if 0
  const zeroCostProducts = await prisma.product.findMany({
    where: { costPrice: 0 },
    take: 250,
  })
  if (zeroCostProducts.length > 0) {
    for (let i = 0; i < zeroCostProducts.length; i++) {
      const p = zeroCostProducts[i]
      const priceVal = p.price || 0
      const estimatedCost = Number((priceVal * 0.68).toFixed(2))
      const generatedSku = p.sku && p.sku.trim() !== "" ? p.sku : `SP-${String(i + 101).padStart(4, "0")}`
      await prisma.product.update({
        where: { id: p.id },
        data: {
          costPrice: estimatedCost,
          sku: generatedSku,
        },
      })
    }
  }

  return settings
}

// GET /api/erp
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get("public") === "true"
    const syncRates = searchParams.get("syncRates") === "true"

    const settings = await ensureInitialErpData(syncRates)

    if (isPublic) {
      return NextResponse.json({ settings })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const [
      customers,
      suppliers,
      purchases,
      receivables,
      payables,
      bankAccounts,
      bankTransactions,
      inventoryMovements,
      serviceOrders,
      users,
    ] = await Promise.all([
      prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.supplier.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.purchase.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.accountReceivable.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.accountPayable.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.bankAccount.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.bankTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.inventoryMovement.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.serviceOrder.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ])

    return NextResponse.json({
      settings,
      customers,
      suppliers,
      purchases,
      receivables,
      payables,
      bankAccounts,
      bankTransactions,
      inventoryMovements,
      serviceOrders,
      users,
    })
  } catch (error) {
    console.error("Error in GET /api/erp:", error)
    return NextResponse.json({ error: "Error al cargar datos del ERP" }, { status: 500 })
  }
}

// POST /api/erp
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { action, payload } = body

    const settings = await ensureInitialErpData()

    // 0. SYNC LIVE RATES (BCV & Binance P2P)
    if (action === "SYNC_LIVE_RATES") {
      const updated = await ensureInitialErpData(true)
      return NextResponse.json({ success: true, settings: updated })
    }

    // 1. UPDATE SETTINGS (Multi-currency & Financing Parameters)
    if (action === "UPDATE_SETTINGS") {
      const updated = await prisma.systemSetting.update({
        where: { id: "default" },
        data: {
          ...(payload.usdToBs !== undefined && { usdToBs: parseFloat(payload.usdToBs) || 65.5 }),
          ...(payload.binanceToBs !== undefined && { binanceToBs: parseFloat(payload.binanceToBs) || 78.9 }),
          ...(payload.eurToBs !== undefined && { eurToBs: parseFloat(payload.eurToBs) || 71.2 }),
          ...(payload.ivaPercent !== undefined && { ivaPercent: parseFloat(payload.ivaPercent) || 16 }),
          ...(payload.igtfPercent !== undefined && { igtfPercent: parseFloat(payload.igtfPercent) || 3 }),
          ...(payload.defaultInitialPercent !== undefined && {
            defaultInitialPercent: parseFloat(payload.defaultInitialPercent) || 40,
          }),
          ...(payload.defaultInstallments !== undefined && {
            defaultInstallments: parseInt(String(payload.defaultInstallments), 10) || 3,
          }),
          ...(payload.defaultFrequencyDays !== undefined && {
            defaultFrequencyDays: parseInt(String(payload.defaultFrequencyDays), 10) || 14,
          }),
          ...(payload.companyName !== undefined && { companyName: payload.companyName }),
          ...(payload.companyRif !== undefined && { companyRif: payload.companyRif }),
        },
      })
      return NextResponse.json({ success: true, settings: updated })
    }

    // 2. CREATE POS SALE / FACTURA (Contado o Financiado en Cuotas)
    if (action === "CREATE_POS_SALE") {
      const {
        customerName,
        customerDoc,
        customerPhone,
        customerCity,
        items, // [{ id, name, price, quantity }]
        paymentCondition, // CONTADO | CREDITO
        paymentMethod,
        bankAccountId,
        currency,
        applyTax,
        initialPercent,
        installmentsCount,
        frequencyDays,
        surchargePercent, // % recargo por financiamiento (opcional, ej. 25% o 0%)
        notes,
      } = payload

      if (!customerName || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Datos de cliente y productos son obligatorios" }, { status: 400 })
      }

      const subtotalUsd = items.reduce(
        (acc: number, item: any) => acc + (parseFloat(item.price) || 0) * (parseInt(String(item.quantity), 10) || 1),
        0
      )
      const taxUsd = applyTax ? Number((subtotalUsd * (settings.ivaPercent / 100)).toFixed(2)) : 0
      const baseTotalUsd = Number((subtotalUsd + taxUsd).toFixed(2))

      const finSurcharge =
        paymentCondition === "CREDITO" && surchargePercent
          ? Number((baseTotalUsd * (parseFloat(surchargePercent) / 100)).toFixed(2))
          : 0
      const finalTotalUsd = Number((baseTotalUsd + finSurcharge).toFixed(2))

      const initPct = paymentCondition === "CREDITO" ? parseFloat(initialPercent) || 40 : 100
      const paidNowUsd =
        paymentCondition === "CREDITO"
          ? Number((finalTotalUsd * (initPct / 100)).toFixed(2))
          : finalTotalUsd

      const invoiceNumber = `FAC-${Date.now().toString().slice(-6)}`

      // Upsert or create CRM Customer
      let customer = await prisma.customer.findFirst({
        where: {
          OR: [
            ...(customerDoc ? [{ document: customerDoc }] : []),
            { name: customerName },
          ],
        },
      })
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            document: customerDoc || "",
            phone: customerPhone || "",
            city: customerCity || "El Vigía",
            stage: "CLIENTE",
          },
        })
      }

      // Create Order
      const order = await prisma.order.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          customerName,
          customerDoc: customerDoc || "",
          customerPhone: customerPhone || "",
          status: "Completado",
          paymentCondition: paymentCondition || "CONTADO",
          paymentMethod: paymentMethod || "EFECTIVO_USD",
          currency: currency || "USD",
          exchangeRate: currency === "BS" ? settings.usdToBs : currency === "EUR" ? settings.eurToBs : 1,
          subtotal: subtotalUsd,
          tax: taxUsd,
          total: finalTotalUsd,
          paidAmount: paidNowUsd,
          items: JSON.stringify(items),
          notes: notes || "",
        },
      })

      // Deduct Inventory & Record Kardex
      for (const item of items) {
        const qty = parseInt(String(item.quantity), 10) || 1
        if (item.id) {
          const prod = await prisma.product.findUnique({ where: { id: item.id } })
          if (prod) {
            const newStock = Math.max(0, prod.stock - qty)
            await prisma.product.update({
              where: { id: prod.id },
              data: { stock: newStock },
            })
            await prisma.inventoryMovement.create({
              data: {
                productId: prod.id,
                productName: prod.name,
                type: "SALIDA",
                quantity: qty,
                previousStock: prod.stock,
                newStock,
                unitCost: prod.costPrice,
                reference: invoiceNumber,
                notes: `Venta ${paymentCondition} - Cliente: ${customerName}`,
              },
            })
          }
        }
      }

      // Record Bank Income if paidNowUsd > 0 and bankAccountId provided
      if (paidNowUsd > 0 && bankAccountId) {
        const bank = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
        if (bank) {
          const amountInBankCurrency =
            bank.currency === "BS"
              ? Number((paidNowUsd * settings.usdToBs).toFixed(2))
              : bank.currency === "EUR"
              ? Number((paidNowUsd * (settings.usdToBs / settings.eurToBs)).toFixed(2))
              : paidNowUsd

          await prisma.bankAccount.update({
            where: { id: bank.id },
            data: { balance: Number((bank.balance + amountInBankCurrency).toFixed(2)) },
          })

          await prisma.bankTransaction.create({
            data: {
              bankAccountId: bank.id,
              bankAccountName: bank.name,
              type: "INGRESO",
              category: "VENTA",
              amount: amountInBankCurrency,
              currency: bank.currency,
              exchangeRate: settings.usdToBs,
              amountUsd: paidNowUsd,
              reference: invoiceNumber,
              description:
                paymentCondition === "CREDITO"
                  ? `Inicial (${initPct}%) Venta ${invoiceNumber} - ${customerName}`
                  : `Cobro Venta de Contado ${invoiceNumber} - ${customerName}`,
              relatedId: order.id,
            },
          })
        }
      }

      // If CREDITO, create AccountReceivable with Installments Schedule
      if (paymentCondition === "CREDITO") {
        const balanceUsd = Number((finalTotalUsd - paidNowUsd).toFixed(2))
        const numInstallments = parseInt(String(installmentsCount), 10) || 3
        const freqDays = parseInt(String(frequencyDays), 10) || 14
        const installmentAmount = Number((balanceUsd / numInstallments).toFixed(2))

        const installmentsList = []
        let lastDueDate = new Date()
        for (let i = 1; i <= numInstallments; i++) {
          const due = new Date()
          due.setDate(due.getDate() + i * freqDays)
          lastDueDate = due
          // Adjust last installment for rounding
          const amt =
            i === numInstallments
              ? Number((balanceUsd - installmentAmount * (numInstallments - 1)).toFixed(2))
              : installmentAmount
          installmentsList.push({
            number: i,
            dueDate: due.toISOString(),
            amount: amt,
            paidAmount: 0,
            status: "PENDIENTE",
            paidAt: null,
          })
        }

        await prisma.accountReceivable.create({
          data: {
            orderId: order.id,
            customerId: customer.id,
            customerName,
            customerPhone: customerPhone || "",
            description: `Financiamiento ${invoiceNumber} (${initPct}% inicial + ${numInstallments} cuotas cada ${freqDays} días)`,
            totalAmount: finalTotalUsd,
            initialAmount: paidNowUsd,
            paidAmount: paidNowUsd,
            balance: balanceUsd,
            installmentsCount: numInstallments,
            frequencyDays: freqDays,
            installments: JSON.stringify(installmentsList),
            dueDate: lastDueDate,
            status: balanceUsd <= 0 ? "PAGADO" : "PENDIENTE",
            notes: notes || "",
          },
        })
      }

      return NextResponse.json({ success: true, order })
    }

    // 3. CREATE PURCHASE (Compra a Proveedor + Entrada de Inventario + CxP / Banco)
    if (action === "CREATE_PURCHASE") {
      const {
        invoiceNumber,
        supplierId,
        supplierName,
        paymentCondition, // CONTADO | CREDITO
        bankAccountId,
        dueDateDays,
        items, // [{ productId, name, quantity, unitCost }]
        notes,
      } = payload

      if (!supplierName || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Proveedor e ítems son requeridos" }, { status: 400 })
      }

      const totalUsd = Number(
        items
          .reduce(
            (acc: number, item: any) =>
              acc + (parseFloat(item.unitCost) || 0) * (parseInt(String(item.quantity), 10) || 1),
            0
          )
          .toFixed(2)
      )

      const invNum = invoiceNumber || `COMP-${Date.now().toString().slice(-6)}`
      const paidAmount = paymentCondition === "CONTADO" ? totalUsd : 0

      const purchase = await prisma.purchase.create({
        data: {
          invoiceNumber: invNum,
          supplierId: supplierId || null,
          supplierName,
          status: "RECIBIDA",
          paymentCondition: paymentCondition || "CONTADO",
          total: totalUsd,
          paidAmount,
          items: JSON.stringify(items),
          notes: notes || "",
        },
      })

      // Update Product Stock & CostPrice + Log InventoryMovement
      for (const item of items) {
        const qty = parseInt(String(item.quantity), 10) || 1
        const cost = parseFloat(item.unitCost) || 0
        if (item.productId) {
          const prod = await prisma.product.findUnique({ where: { id: item.productId } })
          if (prod) {
            const newStock = prod.stock + qty
            await prisma.product.update({
              where: { id: prod.id },
              data: {
                stock: newStock,
                ...(cost > 0 && { costPrice: cost }),
              },
            })
            await prisma.inventoryMovement.create({
              data: {
                productId: prod.id,
                productName: prod.name,
                type: "ENTRADA",
                quantity: qty,
                previousStock: prod.stock,
                newStock,
                unitCost: cost || prod.costPrice,
                reference: invNum,
                notes: `Compra a proveedor: ${supplierName}`,
              },
            })
          }
        }
      }

      if (paymentCondition === "CONTADO" && bankAccountId) {
        const bank = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
        if (bank) {
          const amountInBankCurrency =
            bank.currency === "BS"
              ? Number((totalUsd * settings.usdToBs).toFixed(2))
              : bank.currency === "EUR"
              ? Number((totalUsd * (settings.usdToBs / settings.eurToBs)).toFixed(2))
              : totalUsd

          await prisma.bankAccount.update({
            where: { id: bank.id },
            data: { balance: Number((bank.balance - amountInBankCurrency).toFixed(2)) },
          })

          await prisma.bankTransaction.create({
            data: {
              bankAccountId: bank.id,
              bankAccountName: bank.name,
              type: "EGRESO",
              category: "COMPRA",
              amount: amountInBankCurrency,
              currency: bank.currency,
              exchangeRate: settings.usdToBs,
              amountUsd: totalUsd,
              reference: invNum,
              description: `Pago de Compra ${invNum} - ${supplierName}`,
              relatedId: purchase.id,
            },
          })
        }
      } else if (paymentCondition === "CREDITO") {
        const due = new Date()
        due.setDate(due.getDate() + (parseInt(String(dueDateDays), 10) || 15))
        await prisma.accountPayable.create({
          data: {
            purchaseId: purchase.id,
            supplierId: supplierId || null,
            supplierName,
            invoiceNumber: invNum,
            description: `Factura de compra ${invNum} (${items.length} ítems)`,
            totalAmount: totalUsd,
            paidAmount: 0,
            balance: totalUsd,
            dueDate: due,
            status: "PENDIENTE",
            notes: notes || "",
          },
        })
      }

      return NextResponse.json({ success: true, purchase })
    }

    // 4. PAY RECEIVABLE (Registrar Cobro de Cuota / Abono CxC)
    if (action === "PAY_RECEIVABLE") {
      const { receivableId, amountUsd, bankAccountId, reference, installmentNumber } = payload
      const cxc = await prisma.accountReceivable.findUnique({ where: { id: receivableId } })
      if (!cxc) {
        return NextResponse.json({ error: "Cuenta por cobrar no encontrada" }, { status: 404 })
      }

      const payVal = Math.min(cxc.balance, parseFloat(amountUsd) || 0)
      if (payVal <= 0) {
        return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
      }

      const newPaid = Number((cxc.paidAmount + payVal).toFixed(2))
      const newBalance = Math.max(0, Number((cxc.totalAmount - newPaid).toFixed(2)))
      const newStatus = newBalance <= 0.01 ? "PAGADO" : "PARCIAL"

      // Update installments JSON
      let installmentsArr: any[] = []
      try {
        installmentsArr = JSON.parse(cxc.installments || "[]")
      } catch {
        installmentsArr = []
      }

      let remainingToAllocate = payVal
      for (const inst of installmentsArr) {
        if (inst.status === "PAGADO") continue
        if (installmentNumber && inst.number !== installmentNumber && remainingToAllocate <= 0) continue
        const instRemaining = Number((inst.amount - (inst.paidAmount || 0)).toFixed(2))
        if (remainingToAllocate >= instRemaining - 0.01) {
          inst.paidAmount = inst.amount
          inst.status = "PAGADO"
          inst.paidAt = new Date().toISOString()
          remainingToAllocate = Number((remainingToAllocate - instRemaining).toFixed(2))
        } else if (remainingToAllocate > 0) {
          inst.paidAmount = Number(((inst.paidAmount || 0) + remainingToAllocate).toFixed(2))
          inst.status = "PARCIAL"
          remainingToAllocate = 0
        }
      }

      const updatedCxc = await prisma.accountReceivable.update({
        where: { id: cxc.id },
        data: {
          paidAmount: newPaid,
          balance: newBalance,
          status: newStatus,
          installments: JSON.stringify(installmentsArr),
        },
      })

      if (bankAccountId) {
        const bank = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
        if (bank) {
          const amountInBankCurrency =
            bank.currency === "BS"
              ? Number((payVal * settings.usdToBs).toFixed(2))
              : bank.currency === "EUR"
              ? Number((payVal * (settings.usdToBs / settings.eurToBs)).toFixed(2))
              : payVal

          await prisma.bankAccount.update({
            where: { id: bank.id },
            data: { balance: Number((bank.balance + amountInBankCurrency).toFixed(2)) },
          })

          await prisma.bankTransaction.create({
            data: {
              bankAccountId: bank.id,
              bankAccountName: bank.name,
              type: "INGRESO",
              category: "COBRO_CXC",
              amount: amountInBankCurrency,
              currency: bank.currency,
              exchangeRate: settings.usdToBs,
              amountUsd: payVal,
              reference: reference || `ABONO-${cxc.id.slice(-4).toUpperCase()}`,
              description: `Cobro de cuota/abono CxC - ${cxc.customerName}`,
              relatedId: cxc.id,
            },
          })
        }
      }

      return NextResponse.json({ success: true, receivable: updatedCxc })
    }

    // 5. PAY PAYABLE (Registrar Pago a Proveedor CxP)
    if (action === "PAY_PAYABLE") {
      const { payableId, amountUsd, bankAccountId, reference } = payload
      const cxp = await prisma.accountPayable.findUnique({ where: { id: payableId } })
      if (!cxp) {
        return NextResponse.json({ error: "Cuenta por pagar no encontrada" }, { status: 404 })
      }

      const payVal = Math.min(cxp.balance, parseFloat(amountUsd) || 0)
      if (payVal <= 0) {
        return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
      }

      const newPaid = Number((cxp.paidAmount + payVal).toFixed(2))
      const newBalance = Math.max(0, Number((cxp.totalAmount - newPaid).toFixed(2)))
      const newStatus = newBalance <= 0.01 ? "PAGADO" : "PARCIAL"

      const updatedCxp = await prisma.accountPayable.update({
        where: { id: cxp.id },
        data: {
          paidAmount: newPaid,
          balance: newBalance,
          status: newStatus,
        },
      })

      if (bankAccountId) {
        const bank = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
        if (bank) {
          const amountInBankCurrency =
            bank.currency === "BS"
              ? Number((payVal * settings.usdToBs).toFixed(2))
              : bank.currency === "EUR"
              ? Number((payVal * (settings.usdToBs / settings.eurToBs)).toFixed(2))
              : payVal

          await prisma.bankAccount.update({
            where: { id: bank.id },
            data: { balance: Number((bank.balance - amountInBankCurrency).toFixed(2)) },
          })

          await prisma.bankTransaction.create({
            data: {
              bankAccountId: bank.id,
              bankAccountName: bank.name,
              type: "EGRESO",
              category: "PAGO_CXP",
              amount: amountInBankCurrency,
              currency: bank.currency,
              exchangeRate: settings.usdToBs,
              amountUsd: payVal,
              reference: reference || `PAGO-${cxp.invoiceNumber}`,
              description: `Pago a proveedor ${cxp.supplierName} (${cxp.invoiceNumber})`,
              relatedId: cxp.id,
            },
          })
        }
      }

      return NextResponse.json({ success: true, payable: updatedCxp })
    }

    // 6. ADJUST INVENTORY (Kardex Manual Adjustment)
    if (action === "ADJUST_INVENTORY") {
      const { productId, type, quantity, notes, reference } = payload
      const prod = await prisma.product.findUnique({ where: { id: productId } })
      if (!prod) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      }

      const qty = Math.abs(parseInt(String(quantity), 10) || 1)
      const newStock =
        type === "ENTRADA"
          ? prod.stock + qty
          : type === "SALIDA"
          ? Math.max(0, prod.stock - qty)
          : qty // AJUSTE exacto

      await prisma.product.update({
        where: { id: prod.id },
        data: { stock: newStock },
      })

      const movement = await prisma.inventoryMovement.create({
        data: {
          productId: prod.id,
          productName: prod.name,
          type,
          quantity: type === "AJUSTE" ? Math.abs(newStock - prod.stock) : qty,
          previousStock: prod.stock,
          newStock,
          unitCost: prod.costPrice,
          reference: reference || "KARDEX-MANUAL",
          notes: notes || "Ajuste manual de inventario",
        },
      })

      return NextResponse.json({ success: true, movement, newStock })
    }

    // 7. BANK ACCOUNTS & TRANSACTIONS
    if (action === "CREATE_BANK_ACCOUNT") {
      const { name, bankName, accountNumber, currency, type, balance } = payload
      const created = await prisma.bankAccount.create({
        data: {
          name,
          bankName: bankName || name,
          accountNumber: accountNumber || "",
          currency: currency || "USD",
          type: type || "BANCO",
          balance: parseFloat(balance) || 0,
        },
      })
      return NextResponse.json({ success: true, bankAccount: created })
    }

    if (action === "CREATE_BANK_TRANSACTION") {
      const { bankAccountId, type, category, amount, reference, description } = payload
      const bank = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } })
      if (!bank) {
        return NextResponse.json({ error: "Cuenta bancaria no encontrada" }, { status: 404 })
      }

      const amt = parseFloat(amount) || 0
      const newBalance = type === "INGRESO" ? bank.balance + amt : bank.balance - amt
      const amountUsd =
        bank.currency === "BS"
          ? Number((amt / settings.usdToBs).toFixed(2))
          : bank.currency === "EUR"
          ? Number((amt * (settings.eurToBs / settings.usdToBs)).toFixed(2))
          : amt

      await prisma.bankAccount.update({
        where: { id: bank.id },
        data: { balance: Number(newBalance.toFixed(2)) },
      })

      const tx = await prisma.bankTransaction.create({
        data: {
          bankAccountId: bank.id,
          bankAccountName: bank.name,
          type,
          category: category || "GASTO_OPERATIVO",
          amount: amt,
          currency: bank.currency,
          exchangeRate: settings.usdToBs,
          amountUsd,
          reference: reference || `MOV-${Date.now().toString().slice(-5)}`,
          description: description || "Movimiento manual de tesorería",
        },
      })

      return NextResponse.json({ success: true, transaction: tx })
    }

    // 8. CRM CUSTOMERS
    if (action === "SAVE_CUSTOMER") {
      const { id, name, document, phone, email, city, address, type, stage, creditLimit, notes } = payload
      if (id) {
        const updated = await prisma.customer.update({
          where: { id },
          data: {
            name,
            document: document || "",
            phone: phone || "",
            email: email || "",
            city: city || "El Vigía",
            address: address || "",
            type: type || "PERSONA",
            stage: stage || "CLIENTE",
            creditLimit: parseFloat(creditLimit) || 500,
            notes: notes || "",
          },
        })
        return NextResponse.json({ success: true, customer: updated })
      } else {
        const created = await prisma.customer.create({
          data: {
            name,
            document: document || "",
            phone: phone || "",
            email: email || "",
            city: city || "El Vigía",
            address: address || "",
            type: type || "PERSONA",
            stage: stage || "PROSPECTO",
            creditLimit: parseFloat(creditLimit) || 500,
            notes: notes || "",
          },
        })
        return NextResponse.json({ success: true, customer: created })
      }
    }

    if (action === "DELETE_CUSTOMER") {
      await prisma.customer.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 9. SUPPLIERS
    if (action === "SAVE_SUPPLIER") {
      const { id, name, rif, contactName, phone, email, address, category, notes } = payload
      if (id) {
        const updated = await prisma.supplier.update({
          where: { id },
          data: { name, rif, contactName, phone, email, address, category, notes },
        })
        return NextResponse.json({ success: true, supplier: updated })
      } else {
        const created = await prisma.supplier.create({
          data: { name, rif, contactName, phone, email, address, category, notes },
        })
        return NextResponse.json({ success: true, supplier: created })
      }
    }

    if (action === "DELETE_SUPPLIER") {
      await prisma.supplier.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 10. VERTICAL DE NEGOCIO SP: SERVICE ORDERS (Instalaciones Solares, CCTV, Cercas, Garantías)
    if (action === "SAVE_SERVICE_ORDER") {
      const {
        id,
        customerName,
        customerPhone,
        customerCity,
        serviceType,
        technicianName,
        status,
        scheduledDate,
        laborCost,
        materialsCost,
        serialNumbers,
        notes,
      } = payload

      const labor = parseFloat(laborCost) || 0
      const materials = parseFloat(materialsCost) || 0
      const totalPrice = Number((labor + materials).toFixed(2))

      if (id) {
        const updated = await prisma.serviceOrder.update({
          where: { id },
          data: {
            customerName,
            customerPhone,
            customerCity,
            serviceType,
            technicianName,
            status,
            scheduledDate,
            laborCost: labor,
            materialsCost: materials,
            totalPrice,
            serialNumbers,
            notes,
          },
        })
        return NextResponse.json({ success: true, serviceOrder: updated })
      } else {
        const code = `SRV-${Date.now().toString().slice(-5)}`
        const created = await prisma.serviceOrder.create({
          data: {
            code,
            customerName,
            customerPhone: customerPhone || "",
            customerCity: customerCity || "El Vigía",
            serviceType: serviceType || "ENERGIA_SOLAR",
            technicianName: technicianName || "Ing. Guardia SP",
            status: status || "VISITA_AGENDADA",
            scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
            laborCost: labor,
            materialsCost: materials,
            totalPrice,
            serialNumbers: serialNumbers || "",
            notes: notes || "",
          },
        })
        return NextResponse.json({ success: true, serviceOrder: created })
      }
    }

    if (action === "DELETE_SERVICE_ORDER") {
      await prisma.serviceOrder.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    // 11. USERS & ROLES MANAGEMENT
    if (action === "SAVE_USER") {
      const { id, name, email, password, role, isActive } = payload
      if (id) {
        const updateData: any = {
          name,
          email,
          role: role || "VENDEDOR",
          isActive: isActive ?? true,
        }
        if (password && password.trim() !== "") {
          updateData.password = await bcrypt.hash(password, 10)
        }
        const updated = await prisma.user.update({
          where: { id },
          data: updateData,
        })
        return NextResponse.json({
          success: true,
          user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
        })
      } else {
        const hashedPassword = await bcrypt.hash(password || "sp123456", 10)
        const created = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: role || "VENDEDOR",
            isActive: true,
          },
        })
        return NextResponse.json({
          success: true,
          user: { id: created.id, name: created.name, email: created.email, role: created.role },
        })
      }
    }

    if (action === "DELETE_USER") {
      const count = await prisma.user.count()
      if (count <= 1) {
        return NextResponse.json({ error: "No puedes eliminar el único usuario administrador" }, { status: 400 })
      }
      await prisma.user.delete({ where: { id: payload.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 })
  } catch (error: any) {
    console.error("Error in POST /api/erp:", error)
    return NextResponse.json({ error: error?.message || "Error al procesar operación del ERP" }, { status: 500 })
  }
}
