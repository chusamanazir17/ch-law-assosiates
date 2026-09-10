import puppeteer from "puppeteer";
import path from "path";

const outputDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\b2396df3-7b4c-4364-8a07-e99e1765664e";
const publicDir = "c:\\Users\\HP\\OneDrive\\Desktop\\Ch-Law-main (1)\\Ch-Law-main\\public\\previews";

console.log("Launching Chrome...");
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

console.log("Opening http://localhost:3000...");
await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1000));

// 1. Hover on Tax Services button
console.log("Hovering on Tax Services...");
const buttons = await page.$$("nav button");
for (const btn of buttons) {
  const text = await page.evaluate(el => el.textContent, btn);
  if (text.includes("Tax Services")) {
    await btn.hover();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outputDir, "tax-dropdown.png") });
    await page.screenshot({ path: path.join(publicDir, "tax-dropdown.png") });
    console.log("Captured tax-dropdown.png");
    break;
  }
}

// 2. Hover on E-Stamping
console.log("Hovering on E-Stamping...");
for (const btn of buttons) {
  const text = await page.evaluate(el => el.textContent, btn);
  if (text.includes("E-Stamping")) {
    await btn.hover();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outputDir, "estamp-dropdown.png") });
    await page.screenshot({ path: path.join(publicDir, "estamp-dropdown.png") });
    console.log("Captured estamp-dropdown.png");
    break;
  }
}

// 3. Hover on All Services (Mega Menu)
console.log("Hovering on All Services...");
for (const btn of buttons) {
  const text = await page.evaluate(el => el.textContent, btn);
  if (text.includes("All Services")) {
    await btn.hover();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outputDir, "all-services-dropdown.png") });
    await page.screenshot({ path: path.join(publicDir, "all-services-dropdown.png") });
    console.log("Captured all-services-dropdown.png");
    break;
  }
}

await browser.close();
console.log("All dropdown screenshots captured successfully.");
