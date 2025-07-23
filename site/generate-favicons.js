#!/usr/bin/env node

/**
 * Favicon Generation Script
 *
 * This script helps generate all the required favicon and logo sizes from our SVG.
 *
 * Requirements:
 * - Node.js
 * - sharp package: npm install sharp
 *
 * Usage:
 * node generate-favicons.js
 */

const fs = require("fs");
const path = require("path");

// Check if sharp is available
let sharp;
try {
  sharp = require("sharp");
} catch (error) {
  console.log("Sharp not found. Please install it with: npm install sharp");
  console.log(
    "Alternatively, use online tools or other methods to convert the SVG files."
  );
  process.exit(1);
}

const publicDir = path.join(__dirname, "public");
const svgPath = path.join(publicDir, "favicon.svg");

// Sizes we need to generate
const sizes = [
  // Favicon sizes
  { size: 16, name: "favicon-16x16.png" },
  { size: 24, name: "favicon-24x24.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 64, name: "favicon-64x64.png" },

  // Logo sizes for PWA
  { size: 192, name: "logo192.png" },
  { size: 512, name: "logo512.png" },

  // Apple touch icon
  { size: 180, name: "apple-touch-icon.png" },
];

async function generateFavicons() {
  console.log("🎨 Generating favicons and logos from SVG...\n");

  // Check if SVG exists
  if (!fs.existsSync(svgPath)) {
    console.error("❌ favicon.svg not found in public directory");
    return;
  }

  try {
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);

      await sharp(svgPath).resize(size, size).png().toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log("\n🎉 All favicons generated successfully!");
    console.log("\nGenerated files:");
    sizes.forEach(({ name, size }) => {
      console.log(`  - ${name} (${size}x${size})`);
    });

    console.log("\n📝 Next steps:");
    console.log("1. Update your HTML to reference the new favicon sizes");
    console.log("2. Update manifest.json with the new logo paths");
    console.log("3. Consider generating a favicon.ico file from the PNG files");
  } catch (error) {
    console.error("❌ Error generating favicons:", error.message);
  }
}

// Run the generation
generateFavicons();
