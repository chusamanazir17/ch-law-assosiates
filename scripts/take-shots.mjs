import puppeteer from "puppeteer";
import path from "path";

const outputDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\b2396df3-7b4c-4364-8a07-e99e1765664e";

const routes = [
  ["/", "home"],
  ["/services/e-stamping", "estamp"],
  ["/services/property-land", "property"],
  ["/services/business-registration", "business"],
  ["/services/tax", "tax"],
];

console.log("Launching browser...");
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

for (const [route, name] of routes) {
  const url = `http://localhost:3000${route}`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // smooth-scroll through the page to trigger in-view animations
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });

  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await new Promise((r) => setTimeout(r, 1200));

  const heroPath = path.join(outputDir, `${name}-hero.png`);
  await page.screenshot({ path: heroPath, fullPage: false });
  console.log(`Captured hero: ${heroPath}`);

  const fullPath = path.join(outputDir, `${name}-full.png`);
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log(`Captured full: ${fullPath}`);
}

await browser.close();
console.log("All screenshots captured successfully.");
