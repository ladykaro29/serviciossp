const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORY_MAP = {
  'PAPELERIA': 'Papelería y Oficina',
  'FIBRA OPTICA': 'Fibra Óptica y Telecom',
  'SEGURIDAD': 'CCTV y Seguridad',
  'SOLAR': 'Energía Solar',
  'COMPUTACION': 'Computación y Redes',
  'FERRETERIA Y LUMINARIAS 110': 'Ferretería y Luminarias',
  'CERCADO ELECTRICO': 'Cercado Eléctrico',
  'ROCCIA': 'Roccia Electrónica',
  'sistema completo': 'Kits y Sistemas Solares',
};

function detectBrand(name, model, sheet) {
  const text = `${name} ${model} ${sheet}`.toUpperCase();
  if (text.includes('ROCCIA')) return 'Roccia';
  if (text.includes('HILOOK')) return 'HiLook';
  if (text.includes('HIKVISION')) return 'Hikvision';
  if (text.includes('DAHUA')) return 'Dahua';
  if (text.includes('MERCUSYS')) return 'Mercusys';
  if (text.includes('TP-LINK') || text.includes('TP LINK')) return 'TP-Link';
  if (text.includes('LESSO')) return 'Lesso';
  if (text.includes('BIKAS')) return 'Bikas';
  if (text.includes('ANDELI')) return 'Andeli';
  if (text.includes('GROWATT')) return 'Growatt';
  if (text.includes('FELICITY')) return 'Felicity';
  if (text.includes('DEYE')) return 'Deye';
  if (text.includes('MUST')) return 'Must';
  return 'Genérico';
}

async function main() {
  if (!fs.existsSync('scripts/missing_products_report.json')) {
    console.error('El reporte scripts/missing_products_report.json no existe. Ejecuta compare_inventory_complete.js primero.');
    return;
  }

  const report = JSON.parse(fs.readFileSync('scripts/missing_products_report.json', 'utf8'));
  const missingBySheet = report.missingBySheet;

  let inserted = 0;
  let skipped = 0;

  for (const [sheet, items] of Object.entries(missingBySheet)) {
    const categoryName = CATEGORY_MAP[sheet] || sheet;
    console.log(`\nImportando ${items.length} productos de ${sheet} -> [${categoryName}]...`);

    for (const item of items) {
      if (!item.name || item.name.length < 3) {
        skipped++;
        continue;
      }

      // Check if already in DB to avoid duplicates
      const exists = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: item.sku },
            { name: item.name },
          ],
        },
      });

      if (exists) {
        skipped++;
        continue;
      }

      const brand = detectBrand(item.name, item.model, sheet);
      const price = item.price > 0 ? item.price : (item.cost > 0 ? item.cost * 1.3 : 10);
      const costPrice = item.cost > 0 ? item.cost : 0;
      const stock = item.stock !== undefined ? item.stock : 10;

      const featuresArr = [];
      if (item.model) featuresArr.push({ label: 'Modelo', value: item.model });
      if (item.barcode) featuresArr.push({ label: 'Código de Barra', value: item.barcode });
      if (sheet) featuresArr.push({ label: 'Origen Hoja', value: sheet });

      await prisma.product.create({
        data: {
          sku: item.sku || item.barcode || `SP-${sheet.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          name: item.name,
          category: categoryName,
          price: Math.round(price * 100) / 100,
          costPrice: Math.round(costPrice * 100) / 100,
          stock: stock,
          minStock: 2,
          unit: 'UND',
          brand: brand,
          description: item.model ? `Modelo: ${item.model}. ${item.name}` : item.name,
          features: JSON.stringify(featuresArr),
          isActive: true,
        },
      });

      inserted++;
    }
  }

  console.log(`\n=== IMPORTACIÓN COMPLETADA ===`);
  console.log(`Productos insertados exitosamente: ${inserted}`);
  console.log(`Productos omitidos (ya existentes o inválidos): ${skipped}`);

  const totalInDb = await prisma.product.count();
  console.log(`Total productos en Base de Datos ahora: ${totalInDb}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

