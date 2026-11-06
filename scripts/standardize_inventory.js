const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORY_PREFIX = {
  'Papelería y Oficina': 'PAP',
  'Fibra Óptica y Telecom': 'FIB',
  'CCTV y Seguridad': 'SEG',
  'Energía Solar': 'SOL',
  'Computación y Redes': 'COM',
  'Ferretería y Luminarias': 'FER',
  'Cercado Eléctrico': 'CER',
  'Roccia Electrónica': 'ROC',
  'Kits y Sistemas Solares': 'KIT',
  'General': 'GEN',
  'BREACKER, INTERRUPTORES Y CONTACTOR': 'FER',
  'CAMARAS': 'SEG',
  'MINI UPS-POWER BANK-UPS': 'COM',
  'DVR Y DISCOS': 'SEG',
  'COMPUTACION Y ACCESORIOS': 'COM',
  'INVERSORES': 'SOL',
  'CABLE UTP Y CONECTORES': 'COM',
  'FERRETERIA': 'FER',
  'FIBRA OPTICA Y ACCESORIOS': 'FIB',
  'PROTECTORES Y REGLETAS': 'FER',
  'BATERIAS': 'SOL',
  'BOMBAS DE AGUA SOLAR': 'SOL',
  'ILUMINACION': 'FER',
  'RACK Y ACCESORIOS': 'COM',
  'REFLECTORES LED': 'SOL',
  'RADIOS TRANSMISORES': 'SEG',
  'ROUTER- SWITCH- REPETIDOR': 'COM',
  'SIRENAS Y ALARMAS': 'CER',
};

const brands = {
  'HILOOK': 'HiLook',
  'HIKVISION': 'Hikvision',
  'DAHUA': 'Dahua',
  'IMOU': 'Imou',
  'EZVIZ': 'Ezviz',
  'MERCUSYS': 'Mercusys',
  'TP-LINK': 'TP-Link',
  'TPLINK': 'TP-Link',
  'ROCCIA': 'Roccia',
  'LESSO': 'Lesso',
  'BIKAS': 'Bikas',
  'ANDELI': 'Andeli',
  'SEAGATE': 'Seagate',
  'WESTERN': 'Western',
  'EPSON': 'Epson',
  'BAOFENG': 'Baofeng',
  'CUDY': 'Cudy',
  'BEGPROD': 'Begprod',
  'GROWATT': 'Growatt',
  'FELICITY': 'Felicity',
  'DEYE': 'Deye',
  'MUST': 'Must',
  'KORES': 'Kores',
  'SOLITA': 'Solita',
  'OSLO': 'Oslo',
  'ALPHA': 'Alpha',
  'CANTV': 'CANTV',
  'ABA': 'ABA',
  'KINGSTON': 'Kingston',
  'SANDISK': 'SanDisk',
};

const acronyms = new Set([
  'LED', 'HD', 'DVR', 'NVR', 'CCTV', 'PVP', 'BCV', 'VES', 'USD', 'IP66', 'IP67', 'IP65', 'IP68',
  'MP', 'W', 'V', 'VA', 'KVA', 'KW', 'AH', 'MAH', 'AMP', 'MM', 'CM', 'MTS', 'M', 'KM',
  'GIGABIT', 'MBPS', 'GB', 'TB', 'WIFI', 'RJ45', 'RJ11', 'UTP', 'FTP', 'STP', 'PLC',
  'SC/UPC', 'LC/UPC', 'SC/APC', 'FC', 'APC', 'UPC', 'POE', 'PTZ', 'AI', 'IA', 'USB',
  'SATA', 'HDMI', 'VGA', 'RCA', 'CAT5', 'CAT6', 'CAT5E', 'CAT6E', 'PVC', 'FRP', 'LSZH',
  'MPPT', 'PWM', 'LFP', 'LIFEPO4', 'GEL', 'AGM', 'MCA', 'NKM', 'SPX', 'OLED', 'LCD', 'AC', 'DC',
  '1D', '2D', '3D', '4K', '2K', '3K', 'RGB', 'DOD', 'SOC', 'BMS', 'UPS', 'LAN', 'WAN'
]);

const accents = {
  'BATERIA': 'Batería',
  'BATERIAS': 'Baterías',
  'BOLIGRAFO': 'Bolígrafo',
  'BOLIGRAFOS': 'Bolígrafos',
  'LAMPARA': 'Lámpara',
  'LAMPARAS': 'Lámparas',
  'CAMARA': 'Cámara',
  'CAMARAS': 'Cámaras',
  'INALAMBRICO': 'Inalámbrico',
  'INALAMBRICA': 'Inalámbrica',
  'OPTICA': 'Óptica',
  'OPTICO': 'Óptico',
  'OPTICAS': 'Ópticas',
  'OPTICOS': 'Ópticos',
  'ELECTRICO': 'Eléctrico',
  'ELECTRICA': 'Eléctrica',
  'ELECTRICOS': 'Eléctricos',
  'ELECTRICAS': 'Eléctricas',
  'CONEXION': 'Conexión',
  'TERMINACION': 'Terminación',
  'PROTECCION': 'Protección',
  'EXTENSION': 'Extensión',
  'AUTOMATICO': 'Automático',
  'AUTOMATICA': 'Automática',
  'TUBERIA': 'Tubería',
  'TUBERIAS': 'Tuberías',
  'POLIESTER': 'Poliéster',
  'FOTOVOLTAICO': 'Fotovoltaico',
  'FOTOVOLTAICA': 'Fotovoltaica',
  'MODEM': 'Módem',
  'TERMICA': 'Térmica',
  'TERMICO': 'Térmico',
  'NUMERO': 'Número',
  'LAPIZ': 'Lápiz',
  'PESTAÑA': 'Pestaña',
  'CODIGO': 'Código',
  'HIBRIDO': 'Híbrido',
  'HYBRIDO': 'Híbrido',
  'PORTATIL': 'Portátil',
  'PLASTICO': 'Plástico',
  'PLASTICA': 'Plástica',
  'ALUMINIO': 'Aluminio',
  'METALICO': 'Metálico',
  'METALICA': 'Metálica',
  'TELEVISION': 'Televisión',
  'IMPRESION': 'Impresión',
};

const lowerwords = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'en', 'con', 'por', 'para', 'y', 'o', 'un', 'una', 'unos', 'unas', 'a', 'al', 'sin', 'sobre', 'x']);

function titleCaseWord(w, idx, total) {
  if (!w) return '';
  const clean = w.replace(/^[\(\[\{]/, '').replace(/[\)\]\}\.,;:]$/, '');
  const prefix = w.slice(0, w.indexOf(clean) === -1 ? 0 : w.indexOf(clean));
  const suffix = w.slice(prefix.length + clean.length);

  const upper = clean.toUpperCase();

  let formatted = '';

  if (accents[upper]) {
    formatted = accents[upper];
  } else if (brands[upper]) {
    formatted = brands[upper];
  } else if (acronyms.has(upper)) {
    formatted = upper;
  } else {
    // Number with unit e.g. 12V, 100W, 2.8MM, 300MBPS, 4K, 24V-110V
    const unitMatch = clean.match(/^([0-9]+(?:\.[0-9]+)?)([a-zA-Z]+)$/);
    if (unitMatch) {
      const num = unitMatch[1];
      const unitUpper = unitMatch[2].toUpperCase();
      let cleanUnit = unitUpper;
      if (unitUpper === 'MBPS') cleanUnit = 'Mbps';
      else if (unitUpper === 'GBPS') cleanUnit = 'Gbps';
      else if (unitUpper === 'MAH') cleanUnit = 'mAh';
      else if (unitUpper === 'AH') cleanUnit = 'Ah';
      else if (unitUpper === 'MM') cleanUnit = 'mm';
      else if (unitUpper === 'CM') cleanUnit = 'cm';
      else if (unitUpper === 'MTS') cleanUnit = 'mts';
      else if (unitUpper === 'KG') cleanUnit = 'kg';
      formatted = num + cleanUnit;
    } else if (/^[A-Z0-9]+-[A-Z0-9]+(-[A-Z0-9]+)*$/i.test(clean) || (/[A-Z]/i.test(clean) && /[0-9]/.test(clean) && clean.length >= 4)) {
      // Model numbers (e.g., THC-B120-PC, MW300D, CBR-8200LW)
      formatted = upper;
    } else {
      const lower = clean.toLowerCase();
      if (lowerwords.has(lower) && idx > 0 && idx < total - 1) {
        formatted = lower;
      } else {
        formatted = upper.charAt(0) + upper.slice(1).toLowerCase();
      }
    }
  }

  return prefix + formatted + suffix;
}

function formatTitle(raw) {
  if (!raw) return '';
  // Clean multi-spaces and separators
  const words = raw.trim().replace(/\s+/g, ' ').split(' ');
  return words.map((w, i) => titleCaseWord(w, i, words.length)).join(' ');
}

function standardizeSku(rawSku, category, index) {
  const catCode = CATEGORY_PREFIX[category] || 'GEN';
  
  if (!rawSku || rawSku.trim() === '') {
    return `SP-${catCode}-${String(index + 1).padStart(5, '0')}`;
  }

  const clean = rawSku.trim().toUpperCase();

  // If already like SP-PAP-00010, return as is
  if (/^SP-[A-Z]{3}-\d{5}$/.test(clean)) {
    return clean;
  }

  // If like SP-PAP-10 or SP-CER-15 or SP-SIS-2
  const spMatch = clean.match(/^SP-([A-Z]{3})-(\d+)$/);
  if (spMatch) {
    const pCode = spMatch[1] === 'SIS' ? 'KIT' : spMatch[1];
    const num = String(spMatch[2]).padStart(5, '0');
    return `SP-${pCode}-${num}`;
  }

  // If pure number like 80028, 50101, 40000, 33100, 8002
  if (/^\d+$/.test(clean)) {
    const num = clean.padStart(5, '0');
    return `SP-${catCode}-${num}`;
  }

  // If alphanumeric like LES-CAN39 or HUPCSCUPC-01
  const cleanAlnum = clean.replace(/[^A-Z0-9]/g, '');
  return `SP-${catCode}-${cleanAlnum.slice(0, 8)}`;
}

async function main() {
  console.log("=== INICIANDO ESTANDARIZACIÓN DE INVENTARIO KICK-OFF COMMERCE ===");

  // 1. Eliminar filas basuras sin SKU del volcado anterior
  const deletedLegacy = await prisma.product.deleteMany({
    where: {
      OR: [
        { sku: "" },
        { sku: null },
      ],
    },
  });
  console.log(`Filas residuales sin SKU eliminadas: ${deletedLegacy.count}`);

  // 2. Obtener todos los productos válidos
  const products = await prisma.product.findMany();
  console.log(`Total productos a estandarizar: ${products.length}`);

  let updatedCount = 0;
  const samples = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const originalSku = p.sku || '';
    const originalName = p.name || '';

    const newSku = standardizeSku(originalSku, p.category, i);
    const newName = formatTitle(originalName);

    // Parse features to save original code for barcode scanning
    let features = [];
    try {
      features = JSON.parse(p.features || '[]');
      if (!Array.isArray(features)) features = [];
    } catch {
      features = [];
    }

    // Add barcode / original reference to features if not present
    if (originalSku && originalSku !== newSku && !features.some(f => f.label?.includes('Código'))) {
      features.unshift({ label: 'Código Original', value: originalSku });
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        sku: newSku,
        name: newName,
        features: JSON.stringify(features),
      },
    });

    updatedCount++;
    if (samples.length < 15 && originalName !== newName) {
      samples.push({
        oldSku: originalSku,
        newSku: newSku,
        oldName: originalName,
        newName: newName,
      });
    }
  }

  console.log(`\n=== ESTANDARIZACIÓN COMPLETADA CON ÉXITO ===`);
  console.log(`Productos actualizados: ${updatedCount}`);
  console.log(`\nEjemplos de estandarización antes y después:`);
  samples.forEach(s => {
    console.log(`[${s.oldSku} -> ${s.newSku}]`);
    console.log(`  Antes:   ${s.oldName}`);
    console.log(`  Después: ${s.newName}\n`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
