const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function cleanStr(s) {
  if (!s) return '';
  return String(s).trim().replace(/\s+/g, ' ');
}

function normalizeKey(s) {
  return cleanStr(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log("=== INVENTARIO LDP AGOSTO vs DATABASE COMPARISON ===");
  const wb = XLSX.readFile('LDP AGOSTO.xlsb');
  
  const dbProducts = await prisma.product.findMany();
  console.log(`Productos actuales en base de datos: ${dbProducts.length}`);

  const dbBySku = new Map();
  const dbByName = new Map();
  const dbByNorm = new Map();

  for (const p of dbProducts) {
    if (p.sku) dbBySku.set(normalizeKey(p.sku), p);
    if (p.name) {
      dbByName.set(cleanStr(p.name).toLowerCase(), p);
      dbByNorm.set(normalizeKey(p.name), p);
    }
  }

  const excelProducts = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows || rows.length === 0) continue;

    // Detect column indexes
    let colSku = -1;
    let colName = -1;
    let colModel = -1;
    let colCost = -1;
    let colPrice = -1;
    let colStock = -1;
    let colBarcode = -1;
    let dataStartRow = -1;

    for (let r = 0; r < Math.min(30, rows.length); r++) {
      const rawRow = rows[r] || [];
      const rowLower = Array.from(rawRow).map(c => String(c ?? '').toLowerCase().trim());

      const descIdx = rowLower.findIndex(c => c && (c.includes('descrip') || c.includes('articulo') || c.includes('producto')));
      const costIdx = rowLower.findIndex(c => c && c.includes('costo'));
      const priceIdx = rowLower.findIndex(c => c && (c.includes('precio') || c.includes('publico') || c.includes('p.v.p') || c.includes('vendedor')));
      const stockIdx = rowLower.findIndex(c => c && (c.includes('existencia') || c.includes('stock') || c.includes('cantidad') || c.includes('disponible')));

      if (descIdx !== -1 && (costIdx !== -1 || priceIdx !== -1 || stockIdx !== -1)) {
        colName = descIdx;
        colCost = costIdx;
        colPrice = priceIdx;
        colStock = stockIdx;
        colSku = rowLower.findIndex(c => c && (c.includes('codigo') || c.includes('item') || c.includes('código')));
        colBarcode = rowLower.findIndex(c => c && (c.includes('barra') || c.includes('barcode')));
        colModel = rowLower.findIndex(c => c && c.includes('modelo'));
        dataStartRow = r + 1;
        break;
      }
    }

    if (dataStartRow === -1) {
      // Fallback for special sheets
      if (sheetName === 'sistema completo') {
        dataStartRow = 2;
        colCost = 0;
        colName = 1;
        colPrice = 2;
        colStock = 3;
      } else {
        continue;
      }
    }

    let sheetCount = 0;
    for (let r = dataStartRow; r < rows.length; r++) {
      const row = rows[r] || [];
      const rawName = colName !== -1 ? row[colName] : null;
      if (!rawName) continue;

      const nameStr = cleanStr(rawName);
      if (nameStr.length < 3) continue;
      // Skip category separator headers
      if (nameStr.startsWith('---') || nameStr.startsWith('===') || nameStr.toUpperCase() === nameStr && nameStr.length < 25 && !row[colPrice] && !row[colCost]) {
        continue;
      }

      const sku = colSku !== -1 && row[colSku] ? cleanStr(row[colSku]) : (colBarcode !== -1 && row[colBarcode] ? cleanStr(row[colBarcode]) : '');
      const barcode = colBarcode !== -1 && row[colBarcode] ? cleanStr(row[colBarcode]) : '';
      const model = colModel !== -1 && row[colModel] ? cleanStr(row[colModel]) : '';
      const cost = colCost !== -1 && row[colCost] ? parseFloat(String(row[colCost]).replace(',', '.')) || 0 : 0;
      
      let price = 0;
      if (colPrice !== -1 && row[colPrice]) {
        price = parseFloat(String(row[colPrice]).replace(',', '.')) || 0;
      }
      
      let stock = 0;
      if (colStock !== -1 && row[colStock]) {
        const stockStr = String(row[colStock]).toLowerCase().trim();
        if (stockStr === 'disponible') stock = 10;
        else if (stockStr === 'agotado') stock = 0;
        else stock = parseInt(stockStr, 10) || 0;
      }

      excelProducts.push({
        sheet: sheetName.trim(),
        sku: sku || barcode || `SP-${sheetName.substring(0,3).toUpperCase()}-${r}`,
        barcode,
        model,
        name: nameStr,
        cost,
        price,
        stock,
        row: r + 1,
      });
      sheetCount++;
    }

    console.log(`Hoja "${sheetName}": ${sheetCount} productos extraídos.`);
  }

  console.log(`\nTotal productos en Excel (LDP AGOSTO): ${excelProducts.length}`);

  // Comparison
  const matched = [];
  const missingInDb = [];

  for (const ep of excelProducts) {
    const skuKey = normalizeKey(ep.sku);
    const barcodeKey = normalizeKey(ep.barcode);
    const nameKey = cleanStr(ep.name).toLowerCase();
    const normKey = normalizeKey(ep.name);

    let match = null;
    if (skuKey && dbBySku.has(skuKey)) match = dbBySku.get(skuKey);
    else if (barcodeKey && dbBySku.has(barcodeKey)) match = dbBySku.get(barcodeKey);
    else if (dbByName.has(nameKey)) match = dbByName.get(nameKey);
    else if (dbByNorm.has(normKey)) match = dbByNorm.get(normKey);
    else {
      // Partial match: check if DB product name contains ep.name or vice-versa
      for (const [dbNorm, dbP] of dbByNorm.entries()) {
        if (dbNorm.length > 8 && normKey.length > 8) {
          if (normKey.includes(dbNorm) || dbNorm.includes(normKey)) {
            match = dbP;
            break;
          }
        }
      }
    }

    if (match) {
      matched.push({ excel: ep, db: match });
    } else {
      missingInDb.push(ep);
    }
  }

  console.log(`\n=== RESULTADOS DE COMPARACIÓN ===`);
  console.log(`Productos coincidentes en DB: ${matched.length}`);
  console.log(`Productos que FALTAN por registrar en el sistema: ${missingInDb.length}`);

  // Group missing by category/sheet
  const missingBySheet = {};
  for (const item of missingInDb) {
    if (!missingBySheet[item.sheet]) missingBySheet[item.sheet] = [];
    missingBySheet[item.sheet].push(item);
  }

  console.log("\nResumen de productos faltantes por categoría:");
  for (const [sheet, items] of Object.entries(missingBySheet)) {
    console.log(`- ${sheet}: ${items.length} productos faltantes`);
  }

  // Save detailed report
  fs.writeFileSync('scripts/missing_products_report.json', JSON.stringify({
    summary: {
      totalExcel: excelProducts.length,
      totalDb: dbProducts.length,
      matched: matched.length,
      missingCount: missingInDb.length,
    },
    missingBySheet,
    sampleMissing: missingInDb.slice(0, 50),
  }, null, 2));

  console.log("\nReporte detallado guardado en scripts/missing_products_report.json");
}

main().catch(console.error).finally(() => prisma.$disconnect());
