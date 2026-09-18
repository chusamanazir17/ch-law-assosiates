import fs from "fs";
import path from "path";
import type { Post } from "@/types/cms";
import type { ValidatedPostInput } from "@/lib/validation/post";

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");

export const DEFAULT_POSTS: Post[] = [
  {
    id: "post-e-stamp-guide",
    title: "E-Stamping & 32-A Challan Procedure in Punjab: Complete Step-by-Step Guide",
    slug: "e-stamp-punjab-procedure-guide",
    excerpt: "Comprehensive guide to generating 32-A Challans, verifying e-stamp paper authenticity, and calculating DC valuation rates across Punjab districts.",
    content: `## Overview of Punjab E-Stamping System

The Government of Punjab, through the Board of Revenue and Punjab Information Technology Board (PITB), replaced traditional physical stamp papers with digital e-Stamp papers. This electronic system eliminates counterfeit stamp papers, guarantees revenue transparency, and expedites property registration.

### Types of E-Stamp Papers

1. **Non-Judicial Stamp Papers (Challan 32-A):**
   - Required for property sales, transfer deeds, gift deeds, lease agreements, powers of attorney, mortgages, and commercial contracts.
   - The stamp duty is calculated as a statutory percentage of the property value (as determined by the official DC Valuation Table or actual transaction value, whichever is higher).

2. **Judicial Stamp Papers:**
   - Required for court fee submission, petitions, suits, and civil/criminal litigation at District and High Courts.

---

### Step-by-Step Generation Procedure at Chamber 121

1. **Information Collection:**
   - National Identity Cards (CNIC) of Seller / First Party and Purchaser / Second Party.
   - Exact Mauza, Khasra, Khewat, and Khatooni numbers or urban property municipal address.
   - Exact land measurement (Marla, Kanal, Square Feet, or Square Yards).

2. **Challan 32-A Generation:**
   - Enter property attributes into the Punjab e-Stamping portal.
   - System automatically computes Stamp Duty, Local Government Tax, and Punjab FBR Withholding Tax (Section 236C & 236K).
   - Generate official 32-A Challan with a 16-digit unique identifier.

3. **Bank Payment & Instant Issuance:**
   - Payment processed via any branch of National Bank of Pakistan (NBP) or 1Link mobile banking.
   - E-Stamp paper printed on secure watermark stationery featuring a quick-response (QR) code.

### Verification & Authenticity Check

Anyone can verify the genuineness of an issued e-Stamp paper:
- Send 16-digit e-Stamp code via SMS to **8100**.
- Scan the printed QR code using a smartphone camera.
- Visit Chamber 121, District Court Sahiwal for on-counter verification.`,
    cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
    category: "E-Stamping & Property",
    author_name: "Chaudhry Muhammad Asghar",
    status: "published",
    views_count: 1420,
    published_at: "2026-02-15T09:00:00Z",
    created_at: "2026-02-15T09:00:00Z",
    updated_at: "2026-02-15T09:00:00Z",
  },
  {
    id: "post-fbr-atl-guide",
    title: "FBR Active Taxpayer List (ATL) Benefits & Return Filing Deadlines 2026",
    slug: "fbr-active-taxpayer-list-atl-guide",
    excerpt: "Why maintaining ATL status is crucial for businesses and individuals: 100% withholding tax reduction, banking transaction benefits, and late filing surcharges.",
    content: `## Understanding Active Taxpayer Status (ATL)

The Active Taxpayer List (ATL) is an official central registry published every Monday on the Federal Board of Revenue (FBR) portal. It identifies individuals, Associations of Persons (AOP), and corporate entities who have timely submitted their annual income tax returns.

### Substantial Financial Benefits of Being on ATL

| Transaction Type | Non-ATL Withholding Rate | ATL Active Rate | Financial Saving |
| :--- | :--- | :--- | :--- |
| Purchase of Immovable Property | 7.5% - 15% | 3% | Up to 12% Saving |
| Sale of Immovable Property | 6% - 10% | 3% | Up to 7% Saving |
| Bank Cash Withdrawal (>Rs. 50k) | 0.6% | 0.0% | Completely Exempt |
| Vehicle Registration / Token Tax | 200% Advance Tax | Standard Rate | 50% Reduction |
| Dividend Income | 30% | 15% | 50% Reduction |
| Bank Profit on Debt / Savings | 30% | 15% | 50% Reduction |

---

### How to Restore Active Taxpayer Status

If your name does not appear on the ATL:
1. **File Overdue Return:** Prepare and submit your IRIS Income Tax return for the relevant tax period.
2. **Deposit Section 182A Surcharge:**
   - Individuals: Rs. 1,000 via CPR Challan.
   - AOP / Partnerships: Rs. 10,000.
   - Companies: Rs. 20,000.
3. **Automatic Reactivation:** FBR refreshes ATL status every Sunday midnight.

For expedited compliance and wealth statement reconciliation, consult our legal team at Chamber 121, District Court Sahiwal.`,
    cover_image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    category: "Income Tax",
    author_name: "Muhammad Usama Nazir",
    status: "published",
    views_count: 980,
    published_at: "2026-03-01T10:00:00Z",
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "post-property-registry-transfer",
    title: "Property Registry & Inteqal Transfer Checklist at District Court Sahiwal",
    slug: "punjab-property-registry-inteqal-transfer",
    excerpt: "Essential documents, Fard-e-Malkiat verification, biometric verification, and Sub-Registrar endorsement procedures for residential and commercial land transfers.",
    content: `## Legal Procedure for Land Conveyance & Sale Deeds

Purchasing immovable property in Sahiwal or any district in Punjab requires careful title verification, drafting of the Sale Deed (Baye-Nama), e-stamping, and physical appearance before the Sub-Registrar.

### Phase 1: Pre-Registration Title Verification

Before any earnest money (Biyana) is disbursed:
- **Fard-e-Malkiat Baraye Bai (Record of Rights for Sale):** Obtain biometric Fard from the Arazi Record Center (ARC) or computerized Land Records Management Information System (LRMIS).
- **Aks Shajra (Site Plan):** Verify the physical boundary demarcations with the Patwari.
- **Non-Encumbrance Certificate (NEC):** Ensure property is not mortgaged to a financial institution.

---

### Phase 2: Deed Drafting & E-Stamp Issuance

- Draft the bilingual Sale Deed (Baye-Nama) specifying purchase consideration, boundaries, and indemnification against defect in title.
- Generate Challan 32-A e-Stamp paper for Stamp Duty and Town Committee / Municipal Corporation Transfer of Immovable Property (TIP) Tax.
- Pay the registration fee at the District Accounts Office / NBP.

### Phase 3: Sub-Registrar Office Appearance

- Both parties along with two independent, CNIC-verified witnesses appear before the Sub-Registrar.
- Biometric thumb impressions and digital photographs are captured.
- Sub-Registrar endorses and registers the deed.
- Final step: Presentation of registered deed to the Halqa Revenue Officer for sanctioning of Mutation (**Inteqal**).`,
    cover_image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    category: "E-Stamping & Property",
    author_name: "Chaudhry Muhammad Asghar",
    status: "published",
    views_count: 1150,
    published_at: "2026-03-08T11:00:00Z",
    created_at: "2026-03-08T11:00:00Z",
    updated_at: "2026-03-08T11:00:00Z",
  },
  {
    id: "post-secp-company-incorporation",
    title: "SECP Company Registration: Step-by-Step Incorporation Guide for 2026",
    slug: "secp-company-registration-pakistan-guide",
    excerpt: "How to register a Private Limited Company or Single Member Company with SECP eZpay portal: name reservation, digital signatures, and Form II/A compliance.",
    content: `## Incorporating a Private Limited or Single Member Company

Forming a corporate entity with the Securities and Exchange Commission of Pakistan (SECP) provides limited liability protection, enhanced business credibility, and seamless access to government tenders and corporate banking.

### Required Documents

- CNIC copies of all proposed directors and chief executive.
- Proposed principal line of business.
- Three unique company names in order of preference.
- Registered office address proof (utility bill or lease agreement).
- Capital structure (Authorized capital & paid-up capital details).

---

### Step-by-Step SECP Online Incorporation Flow

1. **Name Reservation (Form 1):**
   - Search SECP name database to ensure uniqueness.
   - Reserve approved name within 24 hours.

2. **Drafting MOA & AOA:**
   - Memorandum of Association (defining core objectives).
   - Articles of Association (internal company regulations and shareholding ratios).

3. **Digital Signatures & Statutory Filing:**
   - Directors generate user IDs on the SECP e-Services portal.
   - Digital signatures affixed to incorporation application.
   - Deposit official incorporation fee via 1Link or debit/credit card.

4. **Certificate of Incorporation (CII):**
   - SECP Company Registration Office (CRO) reviews and issues the Certificate of Incorporation with a unique Corporate Universal Identification Number (CUIN).
   - Company automatically receives FBR National Tax Number (NTN).`,
    cover_image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    category: "Corporate & NTN",
    author_name: "Muhammad Usama Nazir",
    status: "published",
    views_count: 730,
    published_at: "2026-03-12T14:30:00Z",
    created_at: "2026-03-12T14:30:00Z",
    updated_at: "2026-03-12T14:30:00Z",
  },
  {
    id: "post-pra-sales-tax-services",
    title: "Punjab Revenue Authority (PRA) Sales Tax on Services: Filing Guide & Withholding",
    slug: "pra-punjab-sales-tax-services-compliance",
    excerpt: "Obligations for service providers under Punjab Sales Tax on Services Act: e-filing returns, withholding agent obligations, and monthly compliance deadlines.",
    content: `## Punjab Sales Tax on Services (PSTS) Framework

Under the Punjab Sales Tax on Services Act 2012, all businesses providing taxable services in the province of Punjab must register with the Punjab Revenue Authority (PRA) and file monthly electronic sales tax returns (PSTS-01).

### Common Taxable Services in Punjab

- Commercial construction and real estate developers.
- IT and software development services.
- Legal, financial, and management consultancies.
- Security services and human resource provision.
- Freight forwarding and logistics operators.
- Restaurants, catering, and event organizers.

---

### Monthly Compliance Calendar

- **15th of Each Month:** Deposit Punjab Sales Tax withheld and payable into the designated National Bank of Pakistan branch or via e-payment PSID.
- **18th of Each Month:** Electronic submission of monthly PSTS-01 return on the PRA e-portal.

### Withholding Agent Obligations

All registered corporate entities and withholding agents are legally required to deduct Punjab Sales Tax at prescribed rates from service providers and issue PRA Withholding Tax Deduction Certificates. Non-deduction results in default surcharge and penalty under Section 48 of the Act.

For PRA registration, monthly return filing, and audit notices defense, consult Chamber 121, District Court Sahiwal.`,
    cover_image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    category: "Sales Tax (Federal & PRA)",
    author_name: "Muhammad Usama Nazir",
    status: "published",
    views_count: 610,
    published_at: "2026-03-15T08:00:00Z",
    created_at: "2026-03-15T08:00:00Z",
    updated_at: "2026-03-15T08:00:00Z",
  }
];

function ensureDataFile(): Post[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(POSTS_FILE)) {
      fs.writeFileSync(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), "utf8");
      return DEFAULT_POSTS;
    }
    const raw = fs.readFileSync(POSTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Post[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    fs.writeFileSync(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), "utf8");
    return DEFAULT_POSTS;
  } catch (err) {
    console.error("[PostsStore] Error reading posts file:", err);
    return DEFAULT_POSTS;
  }
}

function writeDataFile(posts: Post[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch (err) {
    console.error("[PostsStore] Error writing posts file:", err);
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = ensureDataFile();
  return [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = ensureDataFile();
  return posts
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = ensureDataFile();
  const normalized = slug.trim().toLowerCase();
  return posts.find((p) => p.slug.toLowerCase() === normalized) ?? null;
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const posts = ensureDataFile();
  const normalized = slug.trim().toLowerCase();
  return posts.find((p) => p.slug.toLowerCase() === normalized && p.status === "published") ?? null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = ensureDataFile();
  return posts.find((p) => p.id === id) ?? null;
}

export async function savePost(input: ValidatedPostInput): Promise<Post> {
  const posts = ensureDataFile();
  const now = new Date().toISOString();

  if (input.id) {
    const existingIndex = posts.findIndex((p) => p.id === input.id);
    if (existingIndex !== -1) {
      const existing = posts[existingIndex];
      const updated: Post = {
        ...existing,
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        content: input.content,
        cover_image_url: input.cover_image_url ?? null,
        category: input.category,
        author_name: input.author_name,
        status: input.status,
        views_count: input.views_count !== undefined ? input.views_count : existing.views_count,
        published_at:
          input.status === "published"
            ? (input.published_at || existing.published_at || now)
            : null,
        updated_at: now,
      };
      posts[existingIndex] = updated;
      writeDataFile(posts);
      return updated;
    }
  }

  // Check if slug exists to update or generate unique id
  const existingBySlug = posts.findIndex((p) => p.slug === input.slug);
  if (existingBySlug !== -1) {
    const existing = posts[existingBySlug];
    const updated: Post = {
      ...existing,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      cover_image_url: input.cover_image_url ?? null,
      category: input.category,
      author_name: input.author_name,
      status: input.status,
      views_count: input.views_count !== undefined ? input.views_count : existing.views_count,
      published_at:
        input.status === "published"
          ? (input.published_at || existing.published_at || now)
          : null,
      updated_at: now,
    };
    posts[existingBySlug] = updated;
    writeDataFile(posts);
    return updated;
  }

  const newPost: Post = {
    id: input.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    content: input.content,
    cover_image_url: input.cover_image_url ?? null,
    category: input.category,
    author_name: input.author_name,
    status: input.status,
    views_count: input.views_count ?? 0,
    published_at: input.status === "published" ? (input.published_at || now) : null,
    created_at: now,
    updated_at: now,
  };

  posts.unshift(newPost);
  writeDataFile(posts);
  return newPost;
}

export async function deletePost(idOrSlug: string): Promise<boolean> {
  const posts = ensureDataFile();
  const initialLength = posts.length;
  const filtered = posts.filter(
    (p) => p.id !== idOrSlug && p.slug !== idOrSlug
  );
  if (filtered.length !== initialLength) {
    writeDataFile(filtered);
    return true;
  }
  return false;
}
