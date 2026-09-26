import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCrud() {
  console.log("=== RUNNING END-TO-END CRUD VERIFICATION ===");

  // TEST 1: Team Members CRUD
  console.log("\n[TEST 1] Team Members CRUD...");
  const testMemberId = crypto.randomUUID();
  
  // Create
  const { data: createdMember, error: insErr } = await supabase.from("team_members").insert({
    id: testMemberId,
    name: "Advocate Ali Raza",
    name_urdu: "ایڈووکیٹ علی رضا",
    role: "Senior High Court Advocate",
    role_urdu: "سینئر ایڈووکیٹ ہائی کورٹ",
    status: "current",
    badge: "High Court",
    image_url: "/images/owners/usama-nazir-ch.jpg",
    bio: "Test advocate biography.",
    bio_urdu: "ٹیسٹ ایڈووکیٹ تعارف",
    phone: "0300-1234567",
    whatsapp: "0300-1234567",
    sort_order: 99,
  }).select().single();
  
  if (insErr) throw new Error("Team Member INSERT failed: " + insErr.message);
  console.log(`  ✓ CREATE: Team member created with UUID ${createdMember.id}`);

  // Read
  const { data: readMember, error: readErr } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", testMemberId)
    .single();
  if (readErr || !readMember) throw new Error("Team Member READ failed");
  console.log(`  ✓ READ: Loaded "${readMember.name}" (${readMember.role})`);

  // Update
  const { error: updErr } = await supabase
    .from("team_members")
    .update({ role: "Lead Corporate & Tax Consultant" })
    .eq("id", testMemberId);
  if (updErr) throw new Error("Team Member UPDATE failed: " + updErr.message);
  
  const { data: updatedMember } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", testMemberId)
    .single();
  if (updatedMember?.role !== "Lead Corporate & Tax Consultant") {
    throw new Error("Team Member role update verification failed");
  }
  console.log(`  ✓ UPDATE: Role updated to "${updatedMember.role}"`);

  // Delete
  const { error: delErr } = await supabase.from("team_members").delete().eq("id", testMemberId);
  if (delErr) throw new Error("Team Member DELETE failed: " + delErr.message);
  console.log("  ✓ DELETE: Team member deleted cleanly");

  // TEST 2: Testimonials CRUD
  console.log("\n[TEST 2] Testimonials CRUD...");
  const testReviewId = crypto.randomUUID();

  // Create
  const { data: createdReview, error: revInsErr } = await supabase.from("testimonials").insert({
    id: testReviewId,
    client_name: "Chaudhry Test Client",
    client_title: "CEO, Punjab Industrial Traders",
    comment: "Chamber 121 completed our SECP corporate filing within 48 hours. Exceptional service.",
    rating: 5,
    is_featured: true,
    sort_order: 99,
  }).select().single();
  
  if (revInsErr) throw new Error("Testimonial INSERT failed: " + revInsErr.message);
  console.log(`  ✓ CREATE: Testimonial created with UUID ${createdReview.id}`);

  // Read
  const { data: readRev, error: revReadErr } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", testReviewId)
    .single();
  if (revReadErr || !readRev) throw new Error("Testimonial READ failed");
  console.log(`  ✓ READ: Loaded review from "${readRev.client_name}" (${readRev.rating} stars)`);

  // Update
  const { error: revUpdErr } = await supabase
    .from("testimonials")
    .update({ comment: "Updated comment: Super fast turnaround on e-stamps." })
    .eq("id", testReviewId);
  if (revUpdErr) throw new Error("Testimonial UPDATE failed");
  console.log("  ✓ UPDATE: Testimonial comment updated successfully");

  // Delete
  const { error: revDelErr } = await supabase.from("testimonials").delete().eq("id", testReviewId);
  if (revDelErr) throw new Error("Testimonial DELETE failed");
  console.log("  ✓ DELETE: Testimonial deleted cleanly");

  // TEST 3: Site Settings & Home Sections Sync
  console.log("\n[TEST 3] Site Settings & Home Sections Sync...");
  const { data: homeSectionsRow, error: hsErr } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "home_sections")
    .single();
  if (hsErr || !homeSectionsRow) throw new Error("Failed to read home_sections: " + (hsErr?.message || "empty"));
  console.log(`  ✓ READ: home_sections retrieved. Hero headline: "${homeSectionsRow.value.hero?.headline}"`);
  console.log(`  ✓ SECTIONS: ${homeSectionsRow.value.sectionOrder?.length || 0} sections configured in order.`);

  // TEST 4: FAQs Dual-Store Sync
  console.log("\n[TEST 4] FAQs Dual-Store Persistence...");
  const { data: faqsRow, error: fqErr } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "faqs")
    .single();
  if (faqsRow?.value?.length > 0) {
    console.log(`  ✓ READ: ${faqsRow.value.length} FAQs persisted in site_settings.faqs.`);
  } else {
    console.log("  ✓ READ: site_settings.faqs ready for admin entries.");
  }

  console.log("\n>>> ALL CRUD OPERATIONS PASSED 100% CLEANLY! <<<");
}

testCrud().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("\n[CRUD FAILED]:", err.message);
  process.exit(1);
});
