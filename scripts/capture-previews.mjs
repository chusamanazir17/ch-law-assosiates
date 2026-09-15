import puppeteer from "puppeteer";
import path from "path";

const artifactDir = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\052867b0-e57a-487f-9341-4d0c86800b18";

async function capture() {
  console.log("Launching Puppeteer for preview captures...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Home Page Hero & Navbar
  console.log("Capturing homepage...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await page.screenshot({
    path: path.join(artifactDir, "preview-home.png"),
    clip: { x: 0, y: 0, width: 1440, height: 850 },
  });

  // 2. Tax Dropdown Opened on Hover
  console.log("Hovering Tax Services nav button...");
  await page.hover("#nav-button-tax");
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(artifactDir, "preview-tax-dropdown.png"),
    clip: { x: 0, y: 0, width: 1440, height: 800 },
  });

  // 3. Click Nav Button -> Tax Services Page
  console.log("Clicking Tax Services button to navigate...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#nav-button-tax"),
  ]);
  await page.screenshot({
    path: path.join(artifactDir, "preview-tax-page.png"),
    clip: { x: 0, y: 0, width: 1440, height: 850 },
  });

  // 4. E-Stamping Page
  console.log("Clicking E-Stamping button to navigate...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#nav-button-e-stamping"),
  ]);
  await page.screenshot({
    path: path.join(artifactDir, "preview-estamp-page.png"),
    clip: { x: 0, y: 0, width: 1440, height: 850 },
  });

  await browser.close();
  console.log("Previews captured successfully in artifact directory!");
}

capture().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});
