import puppeteer from "puppeteer";
import path from "path";

const outputDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\4d4e663e-b6c2-4b49-9861-0e26f75e8349";

console.log("Launching Chrome via Puppeteer...");
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

console.log("Navigating to http://localhost:3000/ ...");
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1000));

// 1. Verify removal of requested buttons
const navAudit = await page.evaluate(() => {
  const header = document.querySelector("header");
  if (!header) return { error: "No header found" };

  const text = header.innerText || "";
  const hasGetStarted = /get started/i.test(text);
  const hasAllServices = /all services/i.test(text);
  const hasContactUs = /contact us|contact/i.test(text);

  const themeToggle = header.querySelector("button[title*='Switch to'], button[aria-label*='Switch to']");
  const urduToggle = Array.from(header.querySelectorAll("button")).find(b => b.innerText.includes("اردو") || b.innerText.includes("English"));

  return {
    hasGetStarted,
    hasAllServices,
    hasContactUs,
    themeToggleFound: !!themeToggle,
    urduToggleFound: !!urduToggle,
    headerTextPreview: text.replace(/\s+/g, " ").trim().slice(0, 200),
  };
});

console.log("Navbar Audit Results:", JSON.stringify(navAudit, null, 2));

// Capture Light Mode English
await page.screenshot({ path: path.join(outputDir, "navbar-light-en.png"), clip: { x: 0, y: 0, width: 1440, height: 180 } });
console.log("Captured navbar-light-en.png");

// Hover Tax Services dropdown
console.log("Hovering Tax Services dropdown...");
const taxBtn = await page.evaluateHandle(() => {
  const buttons = Array.from(document.querySelectorAll("header button"));
  return buttons.find(b => b.innerText.includes("Tax") || b.innerText.includes("ٹیکس"));
});
if (taxBtn) {
  await taxBtn.hover();
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, "dropdown-tax-en.png"), clip: { x: 0, y: 0, width: 1440, height: 500 } });
  console.log("Captured dropdown-tax-en.png");
}

// 2. Click Theme Toggle to Dark Mode
console.log("Clicking Theme Toggle...");
const themeBtn = await page.waitForSelector("header button[title*='Switch to'], header button[aria-label*='Switch to']");
await themeBtn.click();
await new Promise((r) => setTimeout(r, 800));

const isDarkMode = await page.evaluate(() => document.documentElement.classList.contains("dark"));
console.log("Is dark mode active:", isDarkMode);

await page.screenshot({ path: path.join(outputDir, "navbar-dark-en.png"), clip: { x: 0, y: 0, width: 1440, height: 180 } });
await page.screenshot({ path: path.join(outputDir, "home-dark-en.png"), fullPage: false });
console.log("Captured dark mode screenshots");

// 3. Click Urdu Toggle
console.log("Clicking Urdu Toggle...");
const langBtn = await page.evaluateHandle(() => {
  const buttons = Array.from(document.querySelectorAll("header button"));
  return buttons.find(b => b.innerText.includes("اردو") || b.innerText.includes("English"));
});
await langBtn.click();
await new Promise((r) => setTimeout(r, 1500));

const urduAudit = await page.evaluate(() => {
  const dir = document.documentElement.getAttribute("dir");
  const lang = document.documentElement.getAttribute("lang");
  const headerText = document.querySelector("header")?.innerText || "";
  const bodyText = document.body?.innerText || "";

  return {
    dir,
    lang,
    hasTaxUrdu: headerText.includes("ٹیکس") || headerText.includes("ٹیکس سروسز"),
    hasEstampUrdu: headerText.includes("سٹامپنگ") || headerText.includes("ای سٹامپنگ"),
    hasBusinessUrdu: headerText.includes("بزنس رجسٹریشن") || headerText.includes("بزنس"),
    hasPropertyUrdu: headerText.includes("پراپرٹی"),
    bodyUrduSample: bodyText.slice(0, 250).replace(/\s+/g, " "),
  };
});

console.log("Urdu Audit Results:", JSON.stringify(urduAudit, null, 2));

await page.screenshot({ path: path.join(outputDir, "navbar-dark-ur.png"), clip: { x: 0, y: 0, width: 1440, height: 180 } });
await page.screenshot({ path: path.join(outputDir, "home-dark-ur.png"), fullPage: false });
console.log("Captured Urdu dark mode screenshots");

// Hover Tax Services in Urdu
const taxUrduBtn = await page.evaluateHandle(() => {
  const buttons = Array.from(document.querySelectorAll("header button"));
  return buttons.find(b => b.innerText.includes("ٹیکس"));
});
if (taxUrduBtn) {
  await taxUrduBtn.hover();
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, "dropdown-tax-ur.png"), clip: { x: 0, y: 0, width: 1440, height: 500 } });
  console.log("Captured dropdown-tax-ur.png");
}

// Switch to Light mode in Urdu
await themeBtn.click();
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: path.join(outputDir, "home-light-ur.png"), fullPage: false });
// Switch back to Dark mode
await themeBtn.click();
await new Promise((r) => setTimeout(r, 600));

// Capture e-Stamping in Urdu & Dark Mode
console.log("Navigating to e-stamping in Urdu...");
await page.goto("http://localhost:3000/services/e-stamping", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1000));
await page.screenshot({ path: path.join(outputDir, "service-estamp-dark-ur.png"), fullPage: false });
console.log("Captured service-estamp-dark-ur.png");

// Switch to English and capture Tax service
console.log("Navigating to Tax in English...");
const enBtn = await page.evaluateHandle(() => {
  const buttons = Array.from(document.querySelectorAll("header button"));
  return buttons.find((b) => b.innerText.includes("English"));
});
if (enBtn) {
  await enBtn.click();
  await new Promise((r) => setTimeout(r, 800));
}
await page.goto("http://localhost:3000/services/tax", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1000));
await page.screenshot({ path: path.join(outputDir, "service-tax-dark-en.png"), fullPage: false });
console.log("Captured service-tax-dark-en.png");

// Capture Home Consultation Form
console.log("Navigating to Home and scrolling to Consultation form...");
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight - 1400);
});
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: path.join(outputDir, "consultation-form-dark.png"), fullPage: false });
console.log("Captured consultation-form-dark.png");

await browser.close();
console.log("Verification and captures finished successfully!");
