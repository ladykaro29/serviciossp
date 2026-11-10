/**
 * Helper to resolve high-fidelity product images for Catalog, Inventory and POS.
 * If the product has a custom uploaded photo or external URL, it is used directly.
 * Otherwise, it falls back to a certified high-res representative category photo.
 */
export function getProductImageUrl(product?: {
  image?: string | null
  category?: string | null
  name?: string | null
}): string {
  if (!product) return "/placeholder-product.png"

  const customImg = product.image?.trim()
  if (customImg && customImg !== "" && customImg !== "/placeholder-product.png") {
    return customImg
  }

  const category = (product.category || "").toLowerCase()
  const name = (product.name || "").toLowerCase()

  // Match by specific keywords or category
  if (
    category.includes("cctv") ||
    category.includes("seguridad") ||
    category.includes("cámara") ||
    category.includes("camara") ||
    name.includes("camara") ||
    name.includes("cámara") ||
    name.includes("dvr") ||
    name.includes("nvr") ||
    name.includes("hilook") ||
    name.includes("hikvision")
  ) {
    return "/cctv_installation_real_1776996300001_1776997539323.png"
  }

  if (
    category.includes("cercado") ||
    name.includes("cercado") ||
    name.includes("energizador") ||
    name.includes("cerco") ||
    name.includes("aislador")
  ) {
    return "/electric_fence_installation_real_1776996300002_1776997554085.png"
  }

  if (
    category.includes("kit") ||
    name.includes("kit solar") ||
    name.includes("sistema solar")
  ) {
    return "/hero-solar.png"
  }

  if (
    category.includes("solar") ||
    name.includes("inversor") ||
    name.includes("panel") ||
    name.includes("batería") ||
    name.includes("bateria") ||
    name.includes("mppt")
  ) {
    return "/inverter_installation_real_1776996300000_1776997524603.png"
  }

  if (
    category.includes("redes") ||
    category.includes("computaci") ||
    name.includes("router") ||
    name.includes("switch") ||
    name.includes("wifi") ||
    name.includes("access point")
  ) {
    return "/images/products/redes.png"
  }

  if (
    category.includes("ferreter") ||
    category.includes("luminaria") ||
    name.includes("lámpara") ||
    name.includes("lampara") ||
    name.includes("reflector") ||
    name.includes("bombillo")
  ) {
    return "/images/products/ferreteria.png"
  }

  if (
    category.includes("papeler") ||
    category.includes("oficina") ||
    name.includes("bolígrafo") ||
    name.includes("boligrafo") ||
    name.includes("resma")
  ) {
    return "/images/products/papeleria.png"
  }

  if (
    category.includes("roccia") ||
    name.includes("roccia") ||
    name.includes("lector") ||
    name.includes("cbr-8200lw") ||
    name.includes("escáner") ||
    name.includes("escaner")
  ) {
    return "/images/products/roccia.png"
  }

  if (
    category.includes("fibra") ||
    category.includes("telecom") ||
    name.includes("odf") ||
    name.includes("splitter")
  ) {
    return "/technician-detail.png"
  }

  return "/placeholder-product.png"
}
