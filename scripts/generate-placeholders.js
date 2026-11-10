const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(process.cwd(), 'public', 'images', 'products');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function makeSvg(title, subtitle, iconSvg, accentColor = '#ff6200') {
  return `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#041124" />
      <stop offset="50%" stop-color="#081e3d" />
      <stop offset="100%" stop-color="#020813" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="150" y1="150" x2="450" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="#ff9500" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="600" height="600" fill="url(#bgGrad)" />
  <rect width="600" height="600" fill="url(#grid)" />

  <circle cx="300" cy="260" r="150" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="8 8" />
  <circle cx="300" cy="260" r="130" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

  <g transform="translate(230, 190)">
    ${iconSvg}
  </g>

  <rect x="180" y="380" width="240" height="40" rx="20" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="405" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="${accentColor}" text-anchor="middle" letter-spacing="3">SERVICIOS SP</text>

  <text x="300" y="455" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">${title}</text>
  <text x="300" y="485" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.6)" text-anchor="middle">${subtitle}</text>
</svg>
`;
}

// 1. General Placeholder
const generalSvg = makeSvg(
  'Equipo Certificado',
  'Garantía Oficial &amp; Respaldo Técnico',
  `<rect width="140" height="140" rx="28" fill="#0e2547" stroke="url(#accentGrad)" stroke-width="3" />
   <path d="M35 50 H105 M35 70 H85 M35 90 H105" stroke="white" stroke-width="8" stroke-linecap="round" />
   <circle cx="95" cy="70" r="7" fill="#ff6200" />`
);

// 2. Redes y Computación
const redesSvg = makeSvg(
  'Redes &amp; Telecomunicaciones',
  'Routers, Switches, Mikrotik &amp; Wi-Fi 6',
  `<rect width="140" height="140" rx="28" fill="#0a2a4a" stroke="#00b4d8" stroke-width="3" />
   <circle cx="70" cy="50" r="14" fill="#00b4d8" />
   <circle cx="35" cy="95" r="12" fill="#00b4d8" />
   <circle cx="105" cy="95" r="12" fill="#00b4d8" />
   <line x1="70" y1="50" x2="35" y2="95" stroke="white" stroke-width="4" />
   <line x1="70" y1="50" x2="105" y2="95" stroke="white" stroke-width="4" />`,
  '#00b4d8'
);

// 3. Ferretería y Luminarias
const ferreteriaSvg = makeSvg(
  'Ferretería &amp; Luminarias',
  'Luminarias LED, Reflectores &amp; Fijaciones',
  `<rect width="140" height="140" rx="28" fill="#2d2208" stroke="#f59e0b" stroke-width="3" />
   <circle cx="70" cy="65" r="28" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="4" />
   <path d="M70 15 V30 M70 100 V115 M20 65 H35 M105 65 H120 M35 30 L45 40 M95 90 L105 100 M35 100 L45 90 M95 40 L105 30" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
   <circle cx="70" cy="65" r="12" fill="#fff" />`,
  '#f59e0b'
);

// 4. Papelería y Oficina
const papeleriaSvg = makeSvg(
  'Papelería &amp; Oficina',
  'Suministros Corporativos &amp; Archivo',
  `<rect width="140" height="140" rx="28" fill="#1b2a26" stroke="#10b981" stroke-width="3" />
   <rect x="35" y="25" width="70" height="90" rx="8" fill="rgba(255,255,255,0.08)" stroke="#10b981" stroke-width="3" />
   <line x1="50" y1="45" x2="90" y2="45" stroke="#10b981" stroke-width="4" stroke-linecap="round" />
   <line x1="50" y1="65" x2="90" y2="65" stroke="white" stroke-width="3" stroke-linecap="round" />
   <line x1="50" y1="85" x2="75" y2="85" stroke="white" stroke-width="3" stroke-linecap="round" />`,
  '#10b981'
);

// 5. Roccia Electrónica / Lector
const rocciaSvg = makeSvg(
  'Roccia Electrónica',
  'Lectores CBR-8200LW &amp; Código de Barras',
  `<rect width="140" height="140" rx="28" fill="#2b1442" stroke="#a855f7" stroke-width="3" />
   <line x1="30" y1="45" x2="30" y2="95" stroke="white" stroke-width="4" />
   <line x1="42" y1="45" x2="42" y2="95" stroke="white" stroke-width="6" />
   <line x1="56" y1="45" x2="56" y2="95" stroke="white" stroke-width="3" />
   <line x1="68" y1="45" x2="68" y2="95" stroke="white" stroke-width="8" />
   <line x1="86" y1="45" x2="86" y2="95" stroke="white" stroke-width="4" />
   <line x1="98" y1="45" x2="98" y2="95" stroke="white" stroke-width="6" />
   <line x1="110" y1="45" x2="110" y2="95" stroke="white" stroke-width="3" />
   <line x1="20" y1="70" x2="120" y2="70" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 2" />`,
  '#a855f7'
);

async function run() {
  await sharp(Buffer.from(generalSvg)).png().toFile('public/placeholder-product.png');
  console.log('✓ public/placeholder-product.png created');

  await sharp(Buffer.from(redesSvg)).png().toFile('public/images/products/redes.png');
  console.log('✓ public/images/products/redes.png created');

  await sharp(Buffer.from(ferreteriaSvg)).png().toFile('public/images/products/ferreteria.png');
  console.log('✓ public/images/products/ferreteria.png created');

  await sharp(Buffer.from(papeleriaSvg)).png().toFile('public/images/products/papeleria.png');
  console.log('✓ public/images/products/papeleria.png created');

  await sharp(Buffer.from(rocciaSvg)).png().toFile('public/images/products/roccia.png');
  console.log('✓ public/images/products/roccia.png created');
}

run().catch(console.error);
