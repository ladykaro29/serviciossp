const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Loading LDP AGOSTO.xlsb...");
  const wb = XLSX.readFile('LDP AGOSTO.xlsb');
  
  // Also load current products from DB
  const dbProducts = await prisma.product.findMany();
  console.log(`Current DB has ${dbProducts.length} products.`);
  const dbProductNames = new Set(dbProducts.map(p => p.name.trim().toLowerCase()));
  const dbProductSkus = new Set(dbProducts.map(p => (p.sku || "").trim().toLowerCase()).filter(Boolean));

  const allExcelItems = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find header row
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const row = rows[i] || [];
      const rowStr = row.map(c => String(c || '').toLowerCase()).join(' ');
      if (rowStr.includes('descrip') || rowStr.includes('producto') || rowStr.includes('articulo') || rowStr.includes('codigo') || rowStr.includes('precio') || rowStr.includes('cantidad') || rowStr.includes('stock')) {
        headerRowIdx = i;
        break;
      }
    }

    console.log(`\n--- Sheet: "${sheetName}" (Rows: ${rows.length}) Header row: ${headerRowIdx} ---`);
    if (headerRowIdx !== -1) {
      console.log('Headers:', rows[headerRowIdx]);
      // Look at 2 data rows
      for (let j = headerRowIdx + 1; j < Math.min(headerRowIdx + 4, rows.length); j++) {
        console.log(`Row ${j}:`, rows[j]);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

