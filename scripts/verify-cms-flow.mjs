import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runVerification() {
  console.log("=== SUPABASE CMS DATA FLOW VERIFICATION ===");
  console.log("Connected to:", supabaseUrl);

  let passed = 0;
  let failed = 0;

  // 1. Team Members
  try {
    const { data: team, error } = await supabase.from("team_members").select("*");
    if (error) throw error;
    console.log(`[PASS] team_members: ${team.length} members loaded.`);
    passed++;
  } catch (err) {
    console.error("[FAIL] team_members:", err.message);
    failed++;
  }

  // 2. Testimonials
  try {
    const { data: testimonials, error } = await supabase.from("testimonials").select("*");
    if (error) throw error;
    console.log(`[PASS] testimonials: ${testimonials.length} reviews loaded.`);
    passed++;
  } catch (err) {
    console.error("[FAIL] testimonials:", err.message);
    failed++;
  }

  // 3. Site Settings (site & home_sections)
  try {
    const { data: settings, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    const keys = settings.map((s) => s.key);
    console.log(`[PASS] site_settings: found keys [${keys.join(", ")}].`);
    if (keys.includes("site") && keys.includes("home_sections")) {
      passed++;
    } else {
      console.warn("[WARN] Missing standard keys in site_settings");
    }
  } catch (err) {
    console.error("[FAIL] site_settings:", err.message);
    failed++;
  }

  // 4. CMS Services
  try {
    const { data: services, error } = await supabase.from("cms_services").select("id, name, slug");
    if (error) throw error;
    console.log(`[PASS] cms_services: ${services.length} services loaded.`);
    passed++;
  } catch (err) {
    console.error("[FAIL] cms_services:", err.message);
    failed++;
  }

  // 5. CMS Pages
  try {
    const { data: pages, error } = await supabase.from("cms_pages").select("id, route, title");
    if (error) throw error;
    console.log(`[PASS] cms_pages: ${pages.length} page routes loaded.`);
    passed++;
  } catch (err) {
    console.error("[FAIL] cms_pages:", err.message);
    failed++;
  }

  // 6. Posts
  try {
    const { data: posts, error } = await supabase.from("posts").select("id, title, status");
    if (error) throw error;
    console.log(`[PASS] posts: ${posts.length} articles loaded.`);
    passed++;
  } catch (err) {
    console.error("[FAIL] posts:", err.message);
    failed++;
  }

  // 7. Consultation Inquiries
  try {
    const { data: inquiries, error } = await supabase.from("consultation_inquiries").select("id, name, status");
    if (error) throw error;
    console.log(`[PASS] consultation_inquiries: ${inquiries.length} inquiries loaded.`);
    passed++;
  } catch (err) {
    console.error("[FAIL] consultation_inquiries:", err.message);
    failed++;
  }

  // 8. Storage bucket 'media'
  try {
    const { data: files, error } = await supabase.storage.from("media").list();
    if (error) throw error;
    console.log(`[PASS] storage bucket 'media': verified accessible (${files.length} items).`);
    passed++;
  } catch (err) {
    console.error("[FAIL] storage bucket 'media':", err.message);
    failed++;
  }

  console.log(`\nVerification Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runVerification();
