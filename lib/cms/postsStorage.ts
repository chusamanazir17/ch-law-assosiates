import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { Post } from "@/types/cms";

const DATA_FILE = path.join(process.cwd(), "data", "posts.json");

const SEED_POSTS: Post[] = [
  {
    id: "c4a33d83-37f6-4caa-a51d-88b99b0cbf6d",
    title: "Complete Guide to E-Stamping & Property Registration in Punjab (2024)",
    slug: "complete-guide-e-stamping-property-registration-punjab",
    excerpt: "Understanding the 32-A Challan generation, e-stamp verification, and required legal documentation at District Court Sahiwal.",
    content: "# Understanding E-Stamping in Punjab\n\nThe Government of Punjab introduced the e-Stamping system to replace traditional paper stamp papers with computer-generated, tamper-proof e-Stamp certificates.\n\n## Key Steps in Generating an E-Stamp Paper:\n1. **Assessment of Property Value:** Calculate DC rate.\n2. **Challan 32-A Form Submission:** Accurate entry of parties.\n3. **Payment of Stamp Duty:** Payment through NBP.\n4. **Verification:** Barcode verification on e-Stamping portal.",
    cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=75",
    category: "E-Stamping & Property",
    author_name: "Usama Nazir Ch",
    status: "published",
    views_count: 342,
    published_at: "2026-09-16T05:43:00Z",
    created_at: "2026-09-16T05:43:00Z",
    updated_at: "2026-09-16T05:43:00Z",
  },
  {
    id: "0411e6fc-39a4-42ff-803f-a26b758a53e5",
    title: "FBR Active Taxpayer List (ATL): Benefits & Filing Requirements",
    slug: "fbr-active-taxpayer-list-atl-benefits-requirements",
    excerpt: "Why maintaining Active Taxpayer status on FBR Iris saves you 50% or more on withholding taxes for banking and property transactions.",
    content: "# Why You Must Be on the FBR Active Taxpayer List (ATL)\n\nIn Pakistan, the difference in tax rates between a Filer (Active Taxpayer) and a Non-Filer is substantial. Non-filers face double withholding tax on vehicle registration, bank cash withdrawals, dividend earnings, and immovable property transfers.",
    cover_image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=75",
    category: "Taxation & FBR",
    author_name: "Haji Nazir Ahmad",
    status: "published",
    views_count: 215,
    published_at: "2026-09-16T05:43:00Z",
    created_at: "2026-09-16T05:43:00Z",
    updated_at: "2026-09-16T05:43:00Z",
  },
  {
    id: "seed-1",
    title: "Preparing for your office visit",
    slug: "preparing-for-your-office-visit",
    excerpt: "Contact our office to confirm which documents your service requires. Keep your paperwork together so our team can review it during your visit.",
    content: "# Before you arrive\n\nContact our office to confirm which documents your service requires.\n\nKeep your paperwork together so our team can review it during your visit.\n\n![Documents arranged on an office desk](https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75)\n*Office Consultation Desk*\n\nBring original CNIC cards, property records, and prior tax returns.",
    cover_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=75",
    category: "Guides",
    author_name: "Admin",
    status: "published",
    views_count: 89,
    published_at: "2026-09-16T10:24:00Z",
    created_at: "2026-09-16T10:24:00Z",
    updated_at: "2026-09-16T10:24:00Z",
  },
  {
    id: "seed-2",
    title: "Your tax document checklist",
    slug: "your-tax-document-checklist",
    excerpt: "A comprehensive checklist of salary slips, bank statements, and deduction proofs required for prompt Iris filing.",
    content: "# Tax Document Checklist\n\n- Bank Account Statement (1st July - 30th June)\n- Annual Salary Certificate\n- Utility Bills\n- Withholding Tax Certificates",
    cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=75",
    category: "Tax tips",
    author_name: "Admin",
    status: "draft",
    views_count: 0,
    published_at: null,
    created_at: "2026-09-15T09:15:00Z",
    updated_at: "2026-09-15T09:15:00Z",
  },
  {
    id: "seed-3",
    title: "Understanding e-stamp services",
    slug: "understanding-e-stamp-services",
    excerpt: "How stamp duty values are calculated and verified through the Punjab e-Stamping portal.",
    content: "# Understanding E-Stamp Services\n\nVerified 32-A Challan generation and deed drafting services at District Court Sahiwal.",
    cover_image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=75",
    category: "E-stamp",
    author_name: "Admin",
    status: "published",
    views_count: 140,
    published_at: "2026-09-14T15:20:00Z",
    created_at: "2026-09-14T15:20:00Z",
    updated_at: "2026-09-14T15:20:00Z",
  },
  {
    id: "seed-4",
    title: "Office opening hours",
    slug: "office-opening-hours",
    excerpt: "Updated judicial court and chamber working hours for the current legal term.",
    content: "# Office Opening Hours\n\nMonday to Saturday: 8:30 AM to 5:00 PM\nFriday Break: 1:00 PM to 2:30 PM\nSunday: Closed (Available for emergency WhatsApp consultation)",
    cover_image_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=75",
    category: "Updates",
    author_name: "Admin",
    status: "draft",
    views_count: 0,
    published_at: null,
    created_at: "2026-09-14T11:40:00Z",
    updated_at: "2026-09-14T11:40:00Z",
  },
  {
    id: "seed-5",
    title: "Organising your paperwork",
    slug: "organising-your-paperwork",
    excerpt: "How to organize title deeds, fard, and registry documentation before visiting Chamber 121.",
    content: "# Organizing Paperwork\n\nAlways ensure original deeds and NADRA verification slips are safely bundled in chronological order.",
    cover_image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=75",
    category: "Guides",
    author_name: "Admin",
    status: "draft",
    views_count: 0,
    published_at: null,
    created_at: "2026-09-13T14:10:00Z",
    updated_at: "2026-09-13T14:10:00Z",
  },
  {
    id: "seed-6",
    title: "How to find our office",
    slug: "how-to-find-our-office",
    excerpt: "Directions and landmark guidance to locate Chamber 121, Sharki Gate, District Court Sahiwal.",
    content: "# How to Find Our Office\n\nLocated inside Sharki Gate, Chamber No 121, District Court Sahiwal. Minutes away from Registry Branch and District Bar.",
    cover_image_url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=75",
    category: "Updates",
    author_name: "Admin",
    status: "published",
    views_count: 58,
    published_at: "2026-09-12T09:05:00Z",
    created_at: "2026-09-12T09:05:00Z",
    updated_at: "2026-09-12T09:05:00Z",
  },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";
  return createClient(url, key);
}

function ensureLocalFile(): Post[] {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_POSTS, null, 2), "utf8");
      return SEED_POSTS;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as Post[];
  } catch {
    return SEED_POSTS;
  }
}

function writeLocalFile(posts: Post[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local posts database:", err);
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const localPosts = ensureLocalFile();

  try {
    const supabase = getSupabaseClient();
    const { data: dbPosts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbPosts && dbPosts.length > 0) {
      // Merge DB posts with local posts
      const mergedMap = new Map<string, Post>();
      // First populate with local
      localPosts.forEach((p) => mergedMap.set(p.slug, p));
      // Override/augment with DB posts
      dbPosts.forEach((p: any) => mergedMap.set(p.slug, { ...mergedMap.get(p.slug), ...p }));

      const merged = Array.from(mergedMap.values());
      writeLocalFile(merged);
      return merged;
    }
  } catch (err) {
    // Non-fatal, fallback to local
  }

  return localPosts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) || null;
}

export async function savePost(postPayload: Partial<Post>): Promise<Post> {
  const all = await getAllPosts();
  const now = new Date().toISOString();

  let targetSlug = postPayload.slug?.trim() || "";
  if (!targetSlug && postPayload.title) {
    targetSlug = postPayload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const existingIdx = all.findIndex(
    (p) => (postPayload.id && p.id === postPayload.id) || (targetSlug && p.slug === targetSlug)
  );

  let updatedPost: Post;

  if (existingIdx >= 0) {
    updatedPost = {
      ...all[existingIdx],
      ...postPayload,
      slug: targetSlug || all[existingIdx].slug,
      updated_at: now,
      published_at:
        postPayload.status === "published" && !all[existingIdx].published_at
          ? now
          : all[existingIdx].published_at,
    };
    all[existingIdx] = updatedPost;
  } else {
    updatedPost = {
      id: postPayload.id || `post-${Date.now()}`,
      title: postPayload.title || "Untitled Post",
      slug: targetSlug || `post-${Date.now()}`,
      excerpt: postPayload.excerpt || "",
      content: postPayload.content || "",
      cover_image_url: postPayload.cover_image_url || null,
      category: postPayload.category || "Guides",
      author_name: postPayload.author_name || "Admin",
      status: postPayload.status || "draft",
      views_count: postPayload.views_count || 0,
      published_at: postPayload.status === "published" ? now : null,
      created_at: now,
      updated_at: now,
    };
    all.unshift(updatedPost);
  }

  // Persist locally
  writeLocalFile(all);

  // Try saving to Supabase
  try {
    const supabase = getSupabaseClient();
    await supabase.from("posts").upsert(
      {
        title: updatedPost.title,
        slug: updatedPost.slug,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        cover_image_url: updatedPost.cover_image_url,
        category: updatedPost.category,
        author_name: updatedPost.author_name,
        status: updatedPost.status,
        published_at: updatedPost.published_at,
      },
      { onConflict: "slug" }
    );
  } catch (err) {
    // If Supabase write hits RLS without service key, local file is already safely persisted!
  }

  return updatedPost;
}

export async function deletePost(idOrSlug: string): Promise<boolean> {
  const all = await getAllPosts();
  const filtered = all.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  writeLocalFile(filtered);

  try {
    const supabase = getSupabaseClient();
    await supabase.from("posts").delete().or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
  } catch {
    // Local deletion is complete
  }

  return true;
}
