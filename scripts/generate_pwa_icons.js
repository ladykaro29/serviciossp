const sharp = require('sharp');
const fs = require('fs');

async function makeIcons() {
  const svgBg = `
    <svg width="512" height="512">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020813" />
          <stop offset="100%" stop-color="#071739" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="100" fill="url(#grad)" />
      <rect x="2" y="2" width="508" height="508" rx="98" fill="none" stroke="#ff6200" stroke-width="4" stroke-opacity="0.4" />
    </svg>
  `;

  const logoResized = await sharp('public/LogoServicios-SP.png')
    .resize(420, 420, { fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svgBg))
    .composite([{ input: logoResized, gravity: 'center' }])
    .png()
    .toFile('public/icon-512.png');

  await sharp('public/icon-512.png')
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');

  await sharp('public/icon-512.png')
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  await sharp('public/icon-512.png')
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');

  console.log('✅ PWA Icons generated: icon-512.png, icon-192.png, apple-touch-icon.png, favicon.png');
}

makeIcons().catch(console.error);
