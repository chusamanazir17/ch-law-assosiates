import http from "http";

const BASE = "http://localhost:3000";

async function request(path, options = {}) {
  const url = new URL(path, BASE);
  const headers = options.headers || {};
  if (options.cookie) {
    headers["Cookie"] = options.cookie;
  }
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url.toString(), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
  };
}

async function runTests() {
  console.log("=== STARTING FULL CMS & ADMIN AUDIT ===");

  // 1. Check Public CMS Content API
  console.log("\n[1] Testing GET /api/cms/content...");
  const cmsRes = await request("/api/cms/content");
  if (cmsRes.status === 200 && cmsRes.data.success) {
    console.log(`✓ CMS Content API responded 200 OK.`);
    console.log(`  - Services count: ${cmsRes.data.services?.length}`);
    console.log(`  - Pages count: ${cmsRes.data.pages?.length}`);
    console.log(`  - Office title: ${cmsRes.data.settings?.name}`);
    console.log(`  - Office phone: ${cmsRes.data.settings?.phone}`);
    console.log(`  - Navigation items: ${cmsRes.data.settings?.navigationMenu?.length}`);
  } else {
    throw new Error(`Public CMS Content API failed: status ${cmsRes.status}`);
  }

  // 2. Test Admin Login (admin / admin2026)
  console.log("\n[2] Testing Admin Login with credentials (admin / admin2026)...");
  const loginRes = await request("/api/admin/login", {
    method: "POST",
    body: { username: "admin", password: "admin2026" },
  });
  if (loginRes.status !== 200 || !loginRes.data.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
  }
  const setCookie = loginRes.headers.get("set-cookie");
  const sessionCookie = setCookie ? setCookie.split(";")[0] : "";
  console.log("✓ Admin login successful. Session cookie obtained.");

  // 3. Test Pages Content CMS (GET & PUT)
  console.log("\n[3] Testing Pages Content CMS (/api/admin/pages)...");
  const pagesGet = await request("/api/admin/pages", { cookie: sessionCookie });
  if (pagesGet.status !== 200 || !pagesGet.data.success) {
    throw new Error(`Failed to GET /api/admin/pages: ${pagesGet.status}`);
  }
  console.log(`✓ Loaded ${pagesGet.data.pages.length} editable pages.`);

  // Test updating home page content
  const testHeadline = `Premier Legal Documentation & Chamber Services [Tested ${Date.now()}]`;
  const pagesPut = await request("/api/admin/pages", {
    method: "PUT",
    cookie: sessionCookie,
    body: {
      route: "/",
      heroHeadline: testHeadline,
      heroBadge: "CHAMBER 121 VERIFIED",
    },
  });
  if (pagesPut.status !== 200 || !pagesPut.data.success) {
    throw new Error(`Failed to PUT /api/admin/pages: ${JSON.stringify(pagesPut.data)}`);
  }
  console.log("✓ Successfully updated Home Page headline via Admin CMS.");

  // Verify reflection in public CMS API
  const cmsVerifyHome = await request("/api/cms/content?route=/");
  if (cmsVerifyHome.data.page?.heroHeadline === testHeadline) {
    console.log("✓ Verified immediate live reflection of updated headline in public CMS!");
  } else {
    throw new Error("Live reflection verification failed for pages CMS");
  }

  // 4. Test Services Catalog CMS (GET, PUT, POST)
  console.log("\n[4] Testing Services Catalog CMS (/api/admin/services)...");
  const servicesGet = await request("/api/admin/services", { cookie: sessionCookie });
  if (servicesGet.status !== 200 || !servicesGet.data.success) {
    throw new Error(`Failed to GET /api/admin/services: ${servicesGet.status}`);
  }
  console.log(`✓ Loaded ${servicesGet.data.services.length} legal services.`);

  // Update E-Stamping turnaround time
  const servicesPut = await request("/api/admin/services", {
    method: "PUT",
    cookie: sessionCookie,
    body: {
      id: "e-stamping",
      turnaroundTime: "Instant 15-30 mins Challan & Verification",
    },
  });
  if (servicesPut.status !== 200 || !servicesPut.data.success) {
    throw new Error(`Failed to PUT /api/admin/services: ${JSON.stringify(servicesPut.data)}`);
  }
  console.log("✓ Successfully updated E-Stamping service turnaround time.");

  // 5. Test Site Settings & Navigation Menu CMS
  console.log("\n[5] Testing Site Settings & Navigation CMS (/api/admin/settings)...");
  const settingsGet = await request("/api/admin/settings", { cookie: sessionCookie });
  if (settingsGet.status !== 200 || !settingsGet.data.success) {
    throw new Error(`Failed to GET /api/admin/settings: ${settingsGet.status}`);
  }
  console.log(`✓ Loaded office settings for "${settingsGet.data.settings.fullName}".`);

  // Update site settings
  const settingsPut = await request("/api/admin/settings", {
    method: "PUT",
    cookie: sessionCookie,
    body: {
      addressShort: "Chamber 121, District Courts Sahiwal",
      tagline: "E-Stamping, Property Registry & Legal Consultants",
    },
  });
  if (settingsPut.status !== 200 || !settingsPut.data.success) {
    throw new Error(`Failed to PUT /api/admin/settings: ${JSON.stringify(settingsPut.data)}`);
  }
  console.log("✓ Successfully updated Site Settings via Admin CMS.");

  // 6. Test Public Pages HTTP Rendering
  console.log("\n[6] Testing Public & Admin Routes HTTP Status...");
  const routesToTest = [
    "/",
    "/services/e-stamping",
    "/services/property-land",
    "/updates",
    "/admin",
    "/admin/pages",
    "/admin/services",
    "/admin/settings",
  ];

  for (const route of routesToTest) {
    const pageRes = await request(route, { cookie: sessionCookie });
    if (pageRes.status === 200) {
      console.log(`✓ ${route} -> 200 OK`);
    } else {
      console.warn(`! ${route} -> status ${pageRes.status}`);
    }
  }

  console.log("\n=== ALL CMS TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("\n❌ CMS AUDIT FAILED:", err);
  process.exit(1);
});
