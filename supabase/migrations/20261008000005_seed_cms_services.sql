-- Forward migration for audit finding SEO-002 (nine static service pages
-- shadow the CMS-driven /services/[slug] route, making admin edits on those
-- slugs silently invisible).
--
-- Seeds the 9 core services into `public.cms_services` so they are fully
-- managed through the CMS. Runs AFTER 20261008000002 (SEO columns exist by
-- then) and is idempotent: rows are only inserted when their slug is absent.
--
-- The matching static route directories under app/services/ are deleted in
-- the application layer; this migration carries the content side.
--
-- This migration only ADDS rows; it never edits earlier migrations.

INSERT INTO public.cms_services
  (id, slug, name, name_urdu, category, description, tagline, hero_image,
   turnaround_time, required_documents, government_fee_info, items, active, sort_order)
VALUES
  ('e-stamping', 'e-stamping', 'E-Stamping & Stamp Paper', $$ای سٹامپنگ و چالان 32-A$$,
   'Court Document Services',
   $$Official digital stamp papers processed instantly with government portal verification, Challan 32-A generation, and biometric compliance.$$,
   'Authorized Government Stamp Vendor', '/images/services/estamp-hero.jpg',
   'Same-day (15 to 30 mins)',
   '["CNIC copies of buyer/seller", "Property details / plot number", "Challan 32-A payment slip"]'::jsonb,
   $$Calculated at official 1% DC rate for transfer of property; PKR 50–1,000 for standard affidavits.$$,
   $$[{"id":"es-1","title":"Non-Judicial E-Stamp","description":"PKR 50 to 1,000+ for commercial agreements, affidavits & contracts"},{"id":"es-2","title":"High-Value Non-Judicial","description":"For high-value commercial agreements, formal contracts, and legal declarations"},{"id":"es-3","title":"Property Sale Deed","description":"Calculated at official 1% DC rate for plot and house transfers"},{"id":"es-4","title":"Partnership Deed","description":"Authorized stamp papers for business partnerships and firm deeds"},{"id":"es-5","title":"Bank Documentation","description":"Custom stamp papers for loan agreements and mortgage deeds"},{"id":"es-6","title":"Verification & Challan 32-A","description":"Official online verification and accurate challan generation"}]$$::jsonb,
   true, 1),
  ('property-land', 'property-land', 'Property & Land Services', $$پراپرٹی رجسٹری و انتقال$$,
   'Revenue & Land Services',
   $$Complete assistance for property transfers, sale deeds, Fard Malkiat verification, and title verification across Punjab and Pakistan.$$,
   'Real Estate Legal Verification', '/images/services/property-hero.jpg',
   '1 to 3 Business Days',
   '["Original allotment / transfer letter", "Fard Malkiat from Arazi Record Center", "CNIC of parties & witnesses"]'::jsonb,
   $$Subject to District Collector (DC) property valuation table and provincial stamp duties.$$,
   $$[{"id":"pl-1","title":"Sale Deed Documentation","description":"Baya-Nama drafting, stamp duty processing & Sub-Registrar execution"},{"id":"pl-2","title":"Transfer Letter Services","description":"End-to-end facilitation for CDA, LDA, DHA, and housing societies"},{"id":"pl-3","title":"Legal Search & Title Audit","description":"Thorough verification of property titles and Non-Encumbrance (NEC)"},{"id":"pl-4","title":"Registry & Attestation","description":"Authorized assistance for property registration before Sub-Registrar"},{"id":"pl-5","title":"Succession Certificates","description":"Inheritance documentation and legal heirship transfers for real estate"},{"id":"pl-6","title":"Power of Attorney (GPA/SPA)","description":"Drafting & registration of Power of Attorney for property management"}]$$::jsonb,
   true, 2),
  ('registry-deeds', 'registry-deeds', 'Registry & Deeds', $$رجسٹری و قانونی دستاویزات$$,
   'Revenue & Land Services',
   $$Sub-registrar office registrations, gift deeds, mortgage deeds, and certified revenue records with zero administrative delays.$$,
   'Sub-Registrar & Revenue Records', '/images/services/registry-hero.jpg',
   '2 to 4 Business Days',
   '["Title deed (Sanad / Baye-Nama)", "No Objection Certificate (NOC)", "Witness biometric verification"]'::jsonb,
   $$Registration fee fixed per deed value plus local municipal council taxes.$$,
   $$[{"id":"rd-1","title":"Sale Deed (Baye Nama)","description":"Full transfer of ownership rights before the Sub-Registrar"},{"id":"rd-2","title":"Gift Deed (Hiba Nama)","description":"Official legal recording of property transferred as a gift to family"},{"id":"rd-3","title":"Power of Attorney","description":"Authorized registration of General and Special POA"},{"id":"rd-4","title":"Title Search & Verification","description":"Record verification from Sub-Registrar and Revenue offices"},{"id":"rd-5","title":"Mortgage Deed Registration","description":"Official collateral registration with banks and lenders"},{"id":"rd-6","title":"Certified Copies (Nakal)","description":"Attested copies of historical deeds from government archives"}]$$::jsonb,
   true, 3),
  ('tax', 'tax', 'Tax Services & FBR Compliance', $$انکم ٹیکس ریٹرن و فائلر اسٹیٹس$$,
   'Taxation',
   $$FBR Iris tax filings, Active Taxpayer List (ATL) status, NTN registrations, sales tax (GST/PRA), and audit representation for individuals and firms.$$,
   'Federal Board of Revenue & Iris Compliance', '/images/services/tax-hero.jpg',
   '24 Hours (NTN / ATL)',
   '["CNIC", "Salary certificate / Bank statement", "Utility bill of business premises"]'::jsonb,
   $$ATL late surcharge varies (PKR 1,000 for individuals; PKR 10,000 to 20,000 for companies).$$,
   $$[{"id":"tx-1","title":"NTN Registration","description":"Salaried, business, and freelance Iris portal setup and issuance"},{"id":"tx-2","title":"Income Tax Filing","description":"Annual tax return & wealth statements for Active Taxpayer status"},{"id":"tx-3","title":"Sales Tax Registration (STRN)","description":"GST / STRN registration for manufacturers, traders, and services"},{"id":"tx-4","title":"Tax Exemption Certificates","description":"Withholding tax exemptions and special industrial certificates"},{"id":"tx-5","title":"FBR Audit Response","description":"Professional drafting and representation for section 177 / 214C notices"},{"id":"tx-6","title":"Chamber of Commerce","description":"ICCI & RCCI chamber membership processing and documentation"}]$$::jsonb,
   true, 4),
  ('business-registration', 'business-registration', 'Business Registration & SECP', $$بزنس و کمپنی رجسٹریشن$$,
   'Corporate Services',
   $$End-to-end corporate formation with SECP, FBR, and local municipal chambers. Private Limited, Single Member, and Partnership registrations.$$,
   'SECP & Corporate Documentation', '/images/services/business-hero.jpg',
   '3 to 7 Business Days',
   '["CNICs of all directors/partners", "Company name options", "Registered office lease agreement"]'::jsonb,
   $$SECP incorporation fees start at PKR 2,500 based on authorized capital.$$,
   $$[{"id":"br-1","title":"SECP Incorporation","description":"Private Limited (Pvt. Ltd.) & SMC company registration with MOA/AOA"},{"id":"br-2","title":"Sole Proprietorship","description":"Fast-track registration of individual business entities with FBR"},{"id":"br-3","title":"Partnership Deeds (Form C)","description":"Professional drafting and registration with the Registrar of Firms"},{"id":"br-4","title":"NTN & Sales Tax (GST)","description":"Corporate tax registration, STRN certification & bank opening papers"},{"id":"br-5","title":"Chamber Membership","description":"Corporate membership for Sahiwal, Lahore & Islamabad chambers"},{"id":"br-6","title":"Trade License (CDA/DMC)","description":"Municipal licenses, signboard permissions & professional tax certificates"}]$$::jsonb,
   true, 5),
  ('trademark-ipo', 'trademark-ipo', 'Trademark & IPO Pakistan', $$ٹریڈ مارک و آئی پی او پاکستان$$,
   'Intellectual Property',
   $$Intellectual property registration, brand names, logos, copyrights, and patents filed directly with the Intellectual Property Organization (IPO Pakistan).$$,
   'IPO Pakistan Registration', '/images/services/trademark-ipo.jpg',
   $$Search in 48h; Registration 6–12 months$$,
   '["Brand logo in high resolution", "Applicant CNIC / Certificate of Incorporation", "Goods & services description"]'::jsonb,
   $$Official TM-1 application fee is PKR 3,000 per class.$$,
   $$[{"id":"tm-1","title":"Brand Trademark Filing","description":"Brand name, logo & slogan protection across all 45 classes"},{"id":"tm-2","title":"IPO Search Reports","description":"Pre-filing trademark search to ensure unique availability"},{"id":"tm-3","title":"Copyright Registration","description":"Legal protection for software, books, artwork & architectural designs"},{"id":"tm-4","title":"Patent Advisory","description":"Technical drafting and filing for innovative inventions with IPO"},{"id":"tm-5","title":"Objection & Show Cause Defense","description":"Replying to registry objections and representing in hearings"}]$$::jsonb,
   true, 6),
  ('legal-documentation', 'legal-documentation', 'Legal Documentation & Affidavits', $$قانونی دستاویزات و بیان حلفی$$,
   'Legal Documentation',
   $$Affidavits, power of attorney, lease agreements, undertakings, and formal legal notice drafting attested by Oath Commissioner.$$,
   'Contracts & Attestations', '/images/services/legal-hero.jpg',
   'Same-Day (within 1 hour)',
   '["Original CNIC of deponent", "Relevant subject matter details"]'::jsonb,
   $$Standard stamp duty plus oath commissioner attestation fee.$$,
   $$[{"id":"ld-1","title":"Affidavits & Oaths","description":"Oath commissioner attested affidavits, undertakings & indemnity bonds"},{"id":"ld-2","title":"Power of Attorney (Local/Overseas)","description":"Embassy and Foreign Office attested POA for overseas Pakistanis"},{"id":"ld-3","title":"Rent & Lease Agreements","description":"Residential and commercial tenancy agreements compliant with law"},{"id":"ld-4","title":"Formal Legal Notices","description":"Drafting notices for civil disputes, debt recovery & breach of contracts"}]$$::jsonb,
   true, 7),
  ('family-legal', 'family-legal', 'Family Court & Succession', $$فیملی کورٹ و جانشینی سرٹیفکیٹ$$,
   'Civil & Family Law',
   $$Marriage registration, succession certificates, NADRA legal heirship documentation, child guardianship, and inheritance division.$$,
   'Family Law & NADRA Certification', '/images/services/family-court.jpg',
   '1 to 2 Weeks',
   '["Death certificate of deceased", "Family Registration Certificate (FRC)", "CNIC copies of all legal heirs"]'::jsonb,
   $$NADRA succession application fee plus newspaper publication charges.$$,
   $$[{"id":"fl-1","title":"Nikahnama Registration","description":"Official NADRA and Union Council marriage registration and certs"},{"id":"fl-2","title":"Succession Certificates","description":"Court application and NADRA certificate for estate & bank accounts"},{"id":"fl-3","title":"Divorce Documents","description":"Talaq-nama, Khula notices, and Arbitration Council facilitation"},{"id":"fl-4","title":"Child Guardianship","description":"Guardian court documentation and legal custody representation"}]$$::jsonb,
   true, 8),
  ('banking-financial', 'banking-financial', 'Banking & Financial Legal Services', $$بینکنگ و مالی قانونی خدمات$$,
   'Financial Legal Services',
   $$Loan documentation, mortgage charge creation with SECP (Form 10/12), bank guarantees, corporate hypothecation deeds, and financial affidavits.$$,
   'Financial Institution Documentation', '/images/services/banking-hero.jpg',
   '1 to 3 Business Days',
   '["Sanction letter from bank", "Property documents for mortgage", "Board resolution (for corporate loans)"]'::jsonb,
   $$Stamp duty levied according to loan / mortgage value schedule.$$,
   $$[{"id":"bf-1","title":"Loan Documentation","description":"Personal, auto, and mortgage agreements with private and state banks"},{"id":"bf-2","title":"Corporate Finance Docs","description":"Commercial loans, charge creation (Form 10/12), and hypothecation"},{"id":"bf-3","title":"Financial Affidavits","description":"Source of income affidavits, loss of chequebook, and bank NOCs"},{"id":"bf-4","title":"Mortgage & Collateral","description":"Legal registration of real estate as banking security"}]$$::jsonb,
   true, 9)
ON CONFLICT (slug) DO NOTHING;

-- Preserve the public-facing titles/descriptions that lived in the deleted
-- static layout.tsx files. Only fills rows whose SEO fields are still NULL,
-- so admin edits are never overwritten. Idempotent.
UPDATE public.cms_services SET
  seo_title = v.seo_title,
  meta_description = v.meta_description
FROM (VALUES
  ('e-stamping', 'E-Stamp & Stamp Paper Services', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('property-land', 'Property & Land Services | Registry, Transfer, Search', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('registry-deeds', 'Registry & Deeds | Sale, Gift, Power of Attorney', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('tax', 'Tax Services | NTN, FBR Filing, Sales Tax', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('business-registration', 'Business Registration | SECP & FBR', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('trademark-ipo', 'Trademark & IPO Registration Services', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('legal-documentation', 'Legal Documentation & Certification', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('family-legal', 'Family & Legal Documents | Nikahnama, Divorce, Succession', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.'),
  ('banking-financial', 'Banking & Financial Documentation', 'Authorized legal documentation and tax advisory services at Sharki Gate Chamber No 121 District Court Sahiwal. Verified, transparent, and professional.')
) AS v(slug, seo_title, meta_description)
WHERE public.cms_services.slug = v.slug
  AND public.cms_services.seo_title IS NULL
  AND public.cms_services.meta_description IS NULL;
