#!/usr/bin/env node

/**
 * ICO File Generation Script
 *
 * This script generates a favicon.ico file from our PNG files.
 * The ICO format can contain multiple sizes in one file.
 *
 * Requirements:
 * - Node.js
 * - to-ico package: npm install to-ico
 *
 * Usage:
 * node generate-ico.js
 */

const fs = require("fs");
const path = require("path");

// Check if to-ico is available
let toIco;
try {
  toIco = require("to-ico");
} catch (error) {
  console.log("to-ico not found. Please install it with: npm install to-ico");
  console.log(
    "Alternatively, you can use online tools to convert PNG files to ICO."
  );
  process.exit(1);
}

const publicDir = path.join(__dirname, "public");

// PNG files to include in the ICO (in order of preference)
const pngFiles = [
  "favicon-16x16.png",
  "favicon-24x24.png",
  "favicon-32x32.png",
  "favicon-64x64.png",
];

async function generateIco() {
  console.log("🎨 Generating favicon.ico from PNG files...\n");

  const buffers = [];

  // Read all PNG files
  for (const filename of pngFiles) {
    const filePath = path.join(publicDir, filename);

    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      buffers.push(buffer);
      console.log(`✅ Added ${filename} to ICO`);
    } else {
      console.log(`⚠️  ${filename} not found, skipping`);
    }
  }

  if (buffers.length === 0) {
    console.error(
      "❌ No PNG files found. Please run generate-favicons.js first."
    );
    return;
  }

  try {
    // Generate ICO file
    const icoBuffer = await toIco(buffers);

    // Write to favicon.ico
    const icoPath = path.join(publicDir, "favicon.ico");
    fs.writeFileSync(icoPath, icoBuffer);

    console.log(`\n🎉 Generated favicon.ico successfully!`);
    console.log(`📁 Location: ${icoPath}`);
    console.log(
      `📊 Contains ${buffers.length} sizes: ${pngFiles
        .slice(0, buffers.length)
        .join(", ")}`
    );

    // Show file size
    const stats = fs.statSync(icoPath);
    console.log(`📏 File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } catch (error) {
    console.error("❌ Error generating ICO file:", error.message);
  }
}

// Run the generation
generateIco();
