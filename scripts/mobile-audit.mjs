import puppeteer from "puppeteer";
const routes = ["/","/services/e-stamping","/services/business-registration","/services/banking-financial","/services/family-legal","/services/legal-documentation","/services/property-land","/services/registry-deeds","/services/tax","/services/trademark-ipo"];
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });
const p = await browser.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
let problems = 0;
for (const r of routes) {
  await p.goto("http://localhost:3000"+r, { waitUntil: "networkidle2" });
  await p.evaluate(async () => { for (let y=0;y<=document.body.scrollHeight;y+=150){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));} window.scrollTo(0,0); });
  await new Promise(res=>setTimeout(res,600));
  const sw = await p.evaluate(()=>document.documentElement.scrollWidth);
  const status = sw > 390 ? "OVERFLOW "+sw : "clean";
  if (sw>390) problems++;
  console.log(status.padEnd(12), r);
}
console.log(problems ? problems+" PROBLEMS" : "ALL CLEAN");
await browser.close();
