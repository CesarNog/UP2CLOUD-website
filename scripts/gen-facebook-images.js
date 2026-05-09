#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(outputDir, { recursive: true });

// ── Profile Photo 800x800 ──────────────────────────────────────────
const profileSvg = `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#0C4A6E"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect width="800" height="800" fill="url(#glow)"/>

  <!-- Outer ring -->
  <circle cx="400" cy="400" r="320" fill="none" stroke="rgba(14,165,233,0.15)" stroke-width="1.5"/>
  <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(14,165,233,0.08)" stroke-width="1"/>

  <!-- Icon box -->
  <rect x="248" y="210" width="304" height="304" rx="72" fill="rgba(15,23,42,0.85)" stroke="rgba(14,165,233,0.35)" stroke-width="2.5"/>

  <!-- Cloud icon (scaled up) -->
  <path d="M296 368a48 48 0 0048 48h108a60 60 0 100-120 60.02 60.02 0 00-117.36 25.15A48.01 48.01 0 00296 368z"
        stroke="#0EA5E9" stroke-width="12" stroke-linejoin="round" fill="none" stroke-linecap="round"/>

  <!-- UP2CLOUD text -->
  <text x="400" y="600" font-family="'Space Grotesk','Inter',Arial,sans-serif"
        font-size="72" font-weight="800" text-anchor="middle" letter-spacing="-1">
    <tspan fill="white">UP</tspan><tspan fill="#F97316">2</tspan><tspan fill="#0EA5E9">CLOUD</tspan>
  </text>

  <!-- Tagline -->
  <text x="400" y="652" font-family="'Inter',Arial,sans-serif"
        font-size="26" font-weight="400" fill="rgba(255,255,255,0.45)" text-anchor="middle" letter-spacing="3">
    PLATFORM ENGINEERING
  </text>
</svg>`;

// ── Cover Photo 820x312 (Facebook recommended) ─────────────────────
const coverSvg = `<svg width="820" height="312" viewBox="0 0 820 312" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#020617"/>
      <stop offset="40%"  stop-color="#0F172A"/>
      <stop offset="75%"  stop-color="#0C4A6E"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="30%" r="35%">
      <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="70%" r="30%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
    <filter id="cb">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="820" height="312" fill="url(#bg)"/>
  <rect width="820" height="312" fill="url(#glow1)"/>
  <rect width="820" height="312" fill="url(#glow2)"/>

  <!-- Orb ring -->
  <circle cx="700" cy="60" r="180" fill="none" stroke="rgba(14,165,233,0.10)" stroke-width="1"/>
  <circle cx="700" cy="60" r="130" fill="none" stroke="rgba(14,165,233,0.06)" stroke-width="1"/>

  <!-- Cloud decorations -->
  <g opacity="0.45" filter="url(#cb)">
    <circle cx="680" cy="50"  r="16" fill="white" opacity="0.15"/>
    <circle cx="712" cy="36"  r="24" fill="white" opacity="0.15"/>
    <circle cx="752" cy="40"  r="20" fill="white" opacity="0.15"/>
    <circle cx="780" cy="50"  r="14" fill="white" opacity="0.15"/>
    <rect x="665" y="50" width="128" height="16" rx="4" fill="white" opacity="0.15"/>
  </g>
  <g opacity="0.35" filter="url(#cb)">
    <circle cx="40"  cy="240" r="14" fill="#38BDF8" opacity="0.18"/>
    <circle cx="68"  cy="228" r="20" fill="#38BDF8" opacity="0.18"/>
    <circle cx="100" cy="232" r="16" fill="#38BDF8" opacity="0.18"/>
    <circle cx="124" cy="240" r="12" fill="#38BDF8" opacity="0.18"/>
    <rect x="27" y="240" width="108" height="14" rx="4" fill="#38BDF8" opacity="0.18"/>
  </g>

  <!-- Logo icon box -->
  <rect x="48" y="94" width="68" height="68" rx="16" fill="rgba(15,23,42,0.85)" stroke="rgba(14,165,233,0.30)" stroke-width="1.5"/>
  <!-- Cloud icon -->
  <path d="M60 136a10 10 0 0010 10h22a12.5 12.5 0 100-25 12.51 12.51 0 00-24.59 6.27A10.01 10.01 0 0060 136z"
        stroke="#0EA5E9" stroke-width="2.2" stroke-linejoin="round" fill="none" stroke-linecap="round"/>

  <!-- UP2CLOUD wordmark -->
  <text x="132" y="140" font-family="'Space Grotesk','Inter',Arial,sans-serif"
        font-size="44" font-weight="800" letter-spacing="-0.5">
    <tspan fill="white">UP</tspan><tspan fill="#F97316">2</tspan><tspan fill="#0EA5E9">CLOUD</tspan>
  </text>

  <!-- Divider -->
  <line x1="48" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Tagline -->
  <text x="48" y="210" font-family="'Inter',Arial,sans-serif"
        font-size="18" font-weight="400" fill="rgba(255,255,255,0.55)" letter-spacing="2">
    ENTERPRISE PLATFORM ENGINEERING &amp; CLOUD TRANSFORMATION
  </text>

  <!-- Metric pills -->
  <rect x="48"  y="232" width="110" height="40" rx="8" fill="rgba(14,165,233,0.12)" stroke="rgba(14,165,233,0.25)" stroke-width="1"/>
  <text x="103" y="248" font-family="'Space Grotesk',Arial,sans-serif" font-size="14" font-weight="800" fill="#38BDF8" text-anchor="middle">99.97%</text>
  <text x="103" y="264" font-family="'Inter',Arial,sans-serif" font-size="10" fill="rgba(255,255,255,0.45)" text-anchor="middle">Reliability</text>

  <rect x="170" y="232" width="110" height="40" rx="8" fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.25)" stroke-width="1"/>
  <text x="225" y="248" font-family="'Space Grotesk',Arial,sans-serif" font-size="14" font-weight="800" fill="#F97316" text-anchor="middle">-42%</text>
  <text x="225" y="264" font-family="'Inter',Arial,sans-serif" font-size="10" fill="rgba(255,255,255,0.45)" text-anchor="middle">Cost Reduction</text>

  <rect x="292" y="232" width="110" height="40" rx="8" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.25)" stroke-width="1"/>
  <text x="347" y="248" font-family="'Space Grotesk',Arial,sans-serif" font-size="14" font-weight="800" fill="#A78BFA" text-anchor="middle">10yr</text>
  <text x="347" y="264" font-family="'Inter',Arial,sans-serif" font-size="10" fill="rgba(255,255,255,0.45)" text-anchor="middle">Experience</text>

  <!-- URL -->
  <text x="772" y="284" font-family="'Inter',Arial,sans-serif" font-size="16" font-weight="600"
        fill="rgba(255,255,255,0.40)" text-anchor="end">up2cloud.tech</text>
</svg>`;

Promise.all([
  sharp(Buffer.from(profileSvg)).png().toFile(path.join(outputDir, 'facebook-profile.png')),
  sharp(Buffer.from(coverSvg)).png().toFile(path.join(outputDir, 'facebook-cover.png')),
]).then(() => {
  console.log('✓ facebook-profile.png (800x800)');
  console.log('✓ facebook-cover.png   (820x312)');
}).catch(err => { console.error(err); process.exit(1); });
