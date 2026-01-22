#!/usr/bin/env node
/**
 * Script to convert SVG favicons to PNG at multiple sizes
 * Requires: sharp (npm install sharp)
 * Usage: node scripts/generate-favicon-pngs.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp package is required. Install it with: npm install sharp');
  console.error('SVG files have been created. You can convert them manually or install sharp to auto-convert.');
  process.exit(1);
}

const iconsDir = path.join(__dirname, '../public/icons');
const sizes = [32, 64, 128, 512];

const elements = [
  { name: 'earth', file: 'earth-favicon.svg' },
  { name: 'water', file: 'water-favicon.svg' },
  { name: 'fire', file: 'fire-favicon.svg' },
  { name: 'air', file: 'air-favicon.svg' },
  { name: 'aether', file: 'aether-favicon.svg' },
];

async function convertToPng(element) {
  const svgPath = path.join(iconsDir, element.file);
  
  if (!fs.existsSync(svgPath)) {
    console.error(`SVG file not found: ${svgPath}`);
    return;
  }

  console.log(`Converting ${element.name}...`);
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `${element.name}-favicon-${size}x${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ Created ${size}x${size} PNG`);
    } catch (error) {
      console.error(`  ✗ Failed to create ${size}x${size} PNG:`, error.message);
    }
  }
}

async function main() {
  console.log('Generating PNG favicons from SVG files...\n');
  
  for (const element of elements) {
    await convertToPng(element);
  }
  
  console.log('\n✓ All favicons generated!');
}

main().catch(console.error);








