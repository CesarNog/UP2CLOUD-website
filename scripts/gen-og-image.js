#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const W = 1200, H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#020617"/>
      <stop offset="35%"  stop-color="#0F172A"/>
      <stop offset="68%"  stop-color="#0C4A6E"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <radialGradient id="glow1" cx="15%" cy="20%" r="35%">
      <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="85%" cy="15%" r="30%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow3" cx="50%" cy="90%" r="35%">
      <stop offset="0%" stop-color="#F97316" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#F97316" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur-orb">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
    <filter id="cloud-blur">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <rect width="${W}" height="${H}" fill="url(#glow3)"/>

  <!-- Orb rings -->
  <circle cx="950" cy="80" r="260" fill="none" stroke="rgba(14,165,233,0.12)" stroke-width="1.5"/>
  <circle cx="950" cy="80" r="200" fill="none" stroke="rgba(14,165,233,0.08)" stroke-width="1"/>

  <!-- Cloud decorations -->
  <!-- Cloud top-left -->
  <g opacity="0.55" filter="url(#cloud-blur)">
    <circle cx="68"  cy="118" r="28" fill="white" opacity="0.18"/>
    <circle cx="110" cy="100" r="38" fill="white" opacity="0.18"/>
    <circle cx="160" cy="105" r="32" fill="white" opacity="0.18"/>
    <circle cx="200" cy="116" r="24" fill="white" opacity="0.18"/>
    <rect x="42" y="118" width="180" height="24" rx="4" fill="white" opacity="0.18"/>
  </g>
  <!-- Cloud top-right -->
  <g opacity="0.45" filter="url(#cloud-blur)">
    <circle cx="1000" cy="95"  r="24" fill="#C084FC" opacity="0.22"/>
    <circle cx="1040" cy="78"  r="34" fill="#C084FC" opacity="0.22"/>
    <circle cx="1090" cy="82"  r="28" fill="#C084FC" opacity="0.22"/>
    <circle cx="1128" cy="94"  r="20" fill="#C084FC" opacity="0.22"/>
    <rect x="978" y="95" width="168" height="20" rx="4" fill="#C084FC" opacity="0.22"/>
  </g>
  <!-- Cloud bottom-left -->
  <g opacity="0.40" filter="url(#cloud-blur)">
    <circle cx="55"  cy="520" r="22" fill="#38BDF8" opacity="0.20"/>
    <circle cx="90"  cy="504" r="30" fill="#38BDF8" opacity="0.20"/>
    <circle cx="132" cy="508" r="26" fill="#38BDF8" opacity="0.20"/>
    <circle cx="168" cy="518" r="18" fill="#38BDF8" opacity="0.20"/>
    <rect x="35" y="518" width="148" height="18" rx="4" fill="#38BDF8" opacity="0.20"/>
  </g>

  <!-- Logo icon box -->
  <rect x="72" y="68" width="56" height="56" rx="14" fill="rgba(15,23,42,0.80)" stroke="rgba(14,165,233,0.30)" stroke-width="1.5"/>
  <!-- Cloud icon inside box -->
  <path d="M84 101a8 8 0 008 8h18a10 10 0 100-20 10.004 10.004 0 00-19.56 4.192A8.002 8.002 0 0084 101z" stroke="#0EA5E9" stroke-width="2" stroke-linejoin="round" fill="none"/>

  <!-- UP2CLOUD wordmark -->
  <text x="144" y="103" font-family="'Space Grotesk', 'Inter', Arial, sans-serif" font-size="34" font-weight="800" fill="white" letter-spacing="-0.5">UP<tspan fill="#F97316">2</tspan><tspan fill="#0EA5E9">CLOUD</tspan></text>

  <!-- Divider -->
  <line x1="72" y1="154" x2="1128" y2="154" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Main headline -->
  <text x="72" y="240" font-family="'Space Grotesk', 'Inter', Arial, sans-serif" font-size="58" font-weight="800" fill="white" letter-spacing="-1">Enterprise</text>
  <text x="72" y="316" font-family="'Space Grotesk', 'Inter', Arial, sans-serif" font-size="58" font-weight="800" letter-spacing="-1">
    <tspan fill="#0EA5E9">Platform Engineering</tspan>
  </text>
  <text x="72" y="380" font-family="'Space Grotesk', 'Inter', Arial, sans-serif" font-size="42" font-weight="600" fill="rgba(255,255,255,0.65)" letter-spacing="-0.5">&amp; Cloud Transformation</text>

  <!-- Subtext -->
  <text x="72" y="436" font-family="'Inter', Arial, sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.50)">Kubernetes · Terraform · Multi-Cloud · DevSecOps · FinOps</text>

  <!-- Divider -->
  <line x1="72" y1="472" x2="600" y2="472" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Trust badges -->
  <circle cx="84"  cy="510" r="5" fill="#22C55E"/>
  <text x="96"  y="515" font-family="'Inter', Arial, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.70)">AWS · GCP · Azure Certified</text>
  <circle cx="370" cy="510" r="5" fill="#22C55E"/>
  <text x="382" y="515" font-family="'Inter', Arial, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.70)">10+ Years Experience</text>

  <!-- Metric cards -->
  <rect x="72"  y="548" width="140" height="56" rx="10" fill="rgba(14,165,233,0.12)" stroke="rgba(14,165,233,0.25)" stroke-width="1"/>
  <text x="142" y="570" font-family="'Space Grotesk', Arial, sans-serif" font-size="22" font-weight="800" fill="#38BDF8" text-anchor="middle">99.97%</text>
  <text x="142" y="591" font-family="'Inter', Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.50)" text-anchor="middle">Reliability</text>

  <rect x="228" y="548" width="140" height="56" rx="10" fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.25)" stroke-width="1"/>
  <text x="298" y="570" font-family="'Space Grotesk', Arial, sans-serif" font-size="22" font-weight="800" fill="#F97316" text-anchor="middle">-42%</text>
  <text x="298" y="591" font-family="'Inter', Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.50)" text-anchor="middle">Cost Reduction</text>

  <rect x="384" y="548" width="140" height="56" rx="10" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.25)" stroke-width="1"/>
  <text x="454" y="570" font-family="'Space Grotesk', Arial, sans-serif" font-size="22" font-weight="800" fill="#A78BFA" text-anchor="middle">15+</text>
  <text x="454" y="591" font-family="'Inter', Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.50)" text-anchor="middle">Projects</text>

  <!-- URL badge -->
  <rect x="900" y="548" width="228" height="56" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="1014" y="582" font-family="'Inter', Arial, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.60)" text-anchor="middle">up2cloud.tech</text>
</svg>`;

const outputDir = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'og-image.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => console.log(`OG image generated: ${outputPath}`))
  .catch(err => { console.error(err); process.exit(1); });
