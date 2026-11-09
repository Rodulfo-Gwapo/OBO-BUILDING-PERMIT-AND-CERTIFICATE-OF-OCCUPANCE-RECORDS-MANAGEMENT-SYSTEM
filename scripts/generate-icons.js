import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPNG(width, height, isMaskable = false) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;
  const safeMargin = isMaskable ? 0.8 : 0.95;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base background: Deep OBO Navy #0f3d64
      let r = 15;
      let g = 61;
      let b = 100;
      let a = 255;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxR = (width / 2) * safeMargin;

      // Subtle radial gradient in background
      const normDist = dist / (width / 2);
      if (normDist < 1.0) {
        const bgGrad = 1 - normDist * 0.35;
        r = Math.min(255, Math.floor(r * bgGrad + 5 * (1 - normDist)));
        g = Math.min(255, Math.floor(g * bgGrad + 30 * (1 - normDist)));
        b = Math.min(255, Math.floor(b * bgGrad + 60 * (1 - normDist)));
      }

      // Outer gold circle seal
      const ringOuter = 210 * scale * safeMargin;
      const ringInner = 195 * scale * safeMargin;
      if (dist >= ringInner && dist <= ringOuter) {
        // Gold #fcee21
        r = 252;
        g = 238;
        b = 33;
      } else if (dist < ringInner && dist >= ringInner - 6 * scale) {
        // Gold accent ring
        r = 201;
        g = 168;
        b = 0;
      }

      // Inside seal: Classic Government OBO Building Columns / Structure & Certificate Ribbon
      // Main central building pediment (triangle roof)
      // Pediment top: cy - 100*scale, base: cy - 40*scale, width: 140*scale
      const pedTopY = cy - 100 * scale * safeMargin;
      const pedBaseY = cy - 45 * scale * safeMargin;
      const pedHalfW = 120 * scale * safeMargin;

      if (y >= pedTopY && y <= pedBaseY) {
        const progress = (y - pedTopY) / (pedBaseY - pedTopY);
        const currentHalfW = progress * pedHalfW;
        if (Math.abs(dx) <= currentHalfW) {
          // Gold / White Pediment
          r = 255;
          g = 255;
          b = 255;
        }
      }

      // Architrave beam
      const beamTop = cy - 45 * scale * safeMargin;
      const beamBottom = cy - 30 * scale * safeMargin;
      if (y >= beamTop && y <= beamBottom && Math.abs(dx) <= 125 * scale * safeMargin) {
        r = 252;
        g = 238;
        b = 33; // Gold beam
      }

      // 4 Classic pillars
      const pillarTop = cy - 30 * scale * safeMargin;
      const pillarBottom = cy + 45 * scale * safeMargin;
      if (y >= pillarTop && y <= pillarBottom) {
        const pillarW = 16 * scale * safeMargin;
        const positions = [-90, -30, 30, 90].map(p => p * scale * safeMargin);
        for (const p of positions) {
          if (Math.abs(dx - p) <= pillarW / 2) {
            r = 245;
            g = 248;
            b = 252; // White column
            // subtle shadow
            if (dx - p > pillarW / 4) {
              r = 207;
              g = 224;
              b = 234;
            }
          }
        }
      }

      // Base steps of building
      const step1Top = cy + 45 * scale * safeMargin;
      const step1Bottom = cy + 60 * scale * safeMargin;
      if (y >= step1Top && y <= step1Bottom && Math.abs(dx) <= 130 * scale * safeMargin) {
        r = 252;
        g = 238;
        b = 33;
      }
      const step2Top = cy + 60 * scale * safeMargin;
      const step2Bottom = cy + 72 * scale * safeMargin;
      if (y >= step2Top && y <= step2Bottom && Math.abs(dx) <= 145 * scale * safeMargin) {
        r = 255;
        g = 255;
        b = 255;
      }

      // Foreground Ribbon / Badge: "OBO"
      // Centered badge at cy + 90 * scale
      const badgeY = cy + 105 * scale * safeMargin;
      const badgeW = 90 * scale * safeMargin;
      const badgeH = 28 * scale * safeMargin;
      if (Math.abs(y - badgeY) <= badgeH && Math.abs(dx) <= badgeW) {
        r = 179;
        g = 48;
        b = 42; // Official Stamp Red #b3302a
        // border
        if (Math.abs(y - badgeY) >= badgeH - 3 * scale || Math.abs(dx) >= badgeW - 3 * scale) {
          r = 252;
          g = 238;
          b = 33;
        }
      }

      // Stars on top left and top right
      const star1Dist = Math.sqrt(Math.pow(dx - (-120 * scale * safeMargin), 2) + Math.pow(dy - (-110 * scale * safeMargin), 2));
      const star2Dist = Math.sqrt(Math.pow(dx - (120 * scale * safeMargin), 2) + Math.pow(dy - (-110 * scale * safeMargin), 2));
      if (star1Dist <= 12 * scale * safeMargin || star2Dist <= 12 * scale * safeMargin) {
        r = 252;
        g = 238;
        b = 33;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
console.log('Generating PWA PNG icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

// Generate SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="oboBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#14527f" />
      <stop offset="70%" stop-color="#0f3d64" />
      <stop offset="100%" stop-color="#082238" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#oboBg)"/>
  
  <!-- Outer Gold Ring -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="#fcee21" stroke-width="8" />
  <circle cx="256" cy="256" r="202" fill="none" stroke="#c9a800" stroke-width="2" stroke-dasharray="6,4" />
  
  <!-- Stars -->
  <polygon points="120,130 126,144 140,144 128,154 133,168 120,158 107,168 112,154 100,144 114,144" fill="#fcee21"/>
  <polygon points="392,130 398,144 412,144 400,154 405,168 392,158 379,168 384,154 372,144 386,144" fill="#fcee21"/>

  <!-- Official Building / Pediment -->
  <g filter="url(#shadow)">
    <!-- Triangular Roof Pediment -->
    <polygon points="256,120 130,195 382,195" fill="#ffffff" stroke="#c9a800" stroke-width="4"/>
    <polygon points="256,138 155,190 357,190" fill="#fcee21" opacity="0.3"/>
    
    <!-- Architrave -->
    <rect x="120" y="195" width="272" height="18" rx="3" fill="#fcee21" stroke="#c9a800" stroke-width="2"/>
    
    <!-- 4 Roman Pillars -->
    <rect x="145" y="213" width="26" height="95" rx="3" fill="#ffffff"/>
    <rect x="205" y="213" width="26" height="95" rx="3" fill="#ffffff"/>
    <rect x="281" y="213" width="26" height="95" rx="3" fill="#ffffff"/>
    <rect x="341" y="213" width="26" height="95" rx="3" fill="#ffffff"/>
    
    <!-- Pillar Details -->
    <line x1="158" y1="218" x2="158" y2="303" stroke="#d9eefa" stroke-width="3"/>
    <line x1="218" y1="218" x2="218" y2="303" stroke="#d9eefa" stroke-width="3"/>
    <line x1="294" y1="218" x2="294" y2="303" stroke="#d9eefa" stroke-width="3"/>
    <line x1="354" y1="218" x2="354" y2="303" stroke="#d9eefa" stroke-width="3"/>

    <!-- Building Steps Base -->
    <rect x="115" y="308" width="282" height="18" rx="2" fill="#fcee21" stroke="#c9a800" stroke-width="2"/>
    <rect x="95" y="326" width="322" height="20" rx="3" fill="#ffffff" stroke="#cfe0ea" stroke-width="2"/>
  </g>

  <!-- Central Crest / Certificate Ribbon Badge -->
  <g filter="url(#shadow)">
    <rect x="156" y="360" width="200" height="46" rx="8" fill="#b3302a" stroke="#fcee21" stroke-width="3"/>
    <text x="256" y="392" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-weight="900" font-size="24" fill="#ffffff" letter-spacing="4">O.B.O.</text>
  </g>

  <!-- Subtitle Ribbon Curve text or banner -->
  <text x="256" y="440" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-weight="700" font-size="14" fill="#fcee21" letter-spacing="1.5">BUILDING &amp; OCCUPANCY REGISTRY</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
console.log('PWA icons generated successfully in /public');
