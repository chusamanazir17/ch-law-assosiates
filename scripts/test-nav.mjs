import puppeteer from "puppeteer";

async function testNavigation() {
  console.log("Launching local Puppeteer to test navigation...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to http://localhost:3000 ...");
  const startTime = Date.now();
  const response = await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  const loadTime = Date.now() - startTime;
  console.log(`Loaded in ${loadTime}ms with status: ${response.status()}`);

  // Test 1: Hover over Tax Nav Button
  console.log("Testing hover on #nav-button-tax...");
  await page.hover("#nav-button-tax");
  await new Promise((r) => setTimeout(r, 400));
  const taxDropdown = await page.$("#nav-dropdown-tax");
  const isTaxVisible = taxDropdown ? await page.evaluate((el) => window.getComputedStyle(el).opacity !== "0", taxDropdown) : false;
  console.log("Tax dropdown visible on hover:", isTaxVisible);

  // Test 2: Click on Tax Nav Button
  console.log("Testing click on #nav-button-tax...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#nav-button-tax"),
  ]);
  console.log("Current URL after clicking Tax button:", page.url());

  // Test 3: Hover on E-Stamping from Tax Page
  console.log("Testing hover on #nav-button-e-stamping...");
  await page.hover("#nav-button-e-stamping");
  await new Promise((r) => setTimeout(r, 400));
  const estampDropdown = await page.$("#nav-dropdown-e-stamping");
  const isEstampVisible = estampDropdown ? await page.evaluate((el) => window.getComputedStyle(el).opacity !== "0", estampDropdown) : false;
  console.log("E-Stamping dropdown visible on hover:", isEstampVisible);

  // Test 4: Click on E-Stamping Nav Button
  console.log("Testing click on #nav-button-e-stamping...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#nav-button-e-stamping"),
  ]);
  console.log("Current URL after clicking E-Stamping button:", page.url());

  // Test 5: Click on Business Registration
  console.log("Testing click on #nav-button-business...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#nav-button-business"),
  ]);
  console.log("Current URL after clicking Business button:", page.url());

  await browser.close();
  console.log("All navigation tests completed successfully!");
}

testNavigation().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
