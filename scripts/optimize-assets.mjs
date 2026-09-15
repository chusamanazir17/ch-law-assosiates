import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function optimize() {
  console.log("Optimizing images with Sharp...");

  const emblemPath = path.join(root, "public", "logo-emblem.jpg");
  const fullPath = path.join(root, "public", "logo-full.jpg");
  const faviconPath = path.join(root, "public", "favicon.png");
  const appIconPath = path.join(root, "app", "icon.jpg");

  // 1. logo-emblem.jpg
  if (fs.existsSync(emblemPath)) {
    const origBuffer = fs.readFileSync(emblemPath);
    const origSize = origBuffer.length;
    const buffer = await sharp(origBuffer)
      .resize(180, 180, { fit: "cover" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(emblemPath, buffer);
    console.log(`logo-emblem.jpg: ${(origSize / 1024).toFixed(1)}KB -> ${(buffer.length / 1024).toFixed(1)}KB`);
  }

  // 2. favicon.png
  if (fs.existsSync(faviconPath)) {
    const origBuffer = fs.readFileSync(faviconPath);
    const origSize = origBuffer.length;
    const buffer = await sharp(origBuffer)
      .resize(64, 64, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(faviconPath, buffer);
    console.log(`favicon.png: ${(origSize / 1024).toFixed(1)}KB -> ${(buffer.length / 1024).toFixed(1)}KB`);
  }

  // 3. app/icon.jpg
  if (fs.existsSync(appIconPath)) {
    const origBuffer = fs.readFileSync(appIconPath);
    const origSize = origBuffer.length;
    const buffer = await sharp(origBuffer)
      .resize(96, 96, { fit: "cover" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(appIconPath, buffer);
    console.log(`app/icon.jpg: ${(origSize / 1024).toFixed(1)}KB -> ${(buffer.length / 1024).toFixed(1)}KB`);
  }

  // 4. logo-full.jpg
  if (fs.existsSync(fullPath)) {
    const origBuffer = fs.readFileSync(fullPath);
    const origSize = origBuffer.length;
    const buffer = await sharp(origBuffer)
      .resize({ width: 600, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(fullPath, buffer);
    console.log(`logo-full.jpg: ${(origSize / 1024).toFixed(1)}KB -> ${(buffer.length / 1024).toFixed(1)}KB`);
  }

  console.log("Image optimization complete!");
}

optimize().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});
