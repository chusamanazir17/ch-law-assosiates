import puppeteer from "puppeteer";

const routes = [
  ["/", "home"],
  ["/services/e-stamping", "estamp"],
  ["/services/business-registration", "business"],
  ["/services/banking-financial", "banking"],
  ["/services/family-legal", "family"],
  ["/services/legal-documentation", "legal"],
  ["/services/property-land", "property"],
  ["/services/registry-deeds", "registry"],
  ["/services/tax", "tax"],
  ["/services/trademark-ipo", "trademark"],
];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

for (const [route, name] of routes) {
  await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle2", timeout: 60000 });
  // smooth-scroll through the page to trigger all in-view animations
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 200) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
  });
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `/home/user/shots/${name}.png`, fullPage: true });
  console.log("shot", name);
}

await browser.close();
console.log("done");
