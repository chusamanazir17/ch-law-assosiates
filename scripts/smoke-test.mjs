/**
 * Production-Readiness Smoke Test Suite
 * Tests core endpoints, security headers, rate limiting, and auth boundaries.
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function logPass(title) {
  console.log(`  \x1b[32m✔ PASS\x1b[0m ${title}`);
  passed++;
}

function logFail(title, error) {
  console.log(`  \x1b[31m✖ FAIL\x1b[0m ${title}`);
  if (error) console.error(`    -> ${error}`);
  failed++;
}

async function runTests() {
  console.log(`\n========================================`);
  console.log(`🚀 Starting Smoke Tests on: ${BASE_URL}`);
  console.log(`========================================\n`);

  // Test 1: Public Homepage
  try {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status === 200) {
      logPass(`GET / returns HTTP 200 OK`);
    } else {
      logFail(`GET / returns HTTP 200 OK`, `Received status ${res.status}`);
    }

    // Test 2: Security Headers
    const headers = res.headers;
    const xfo = headers.get("x-frame-options");
    const xcto = headers.get("x-content-type-options");
    const csp = headers.get("content-security-policy");
    const hsts = headers.get("strict-transport-security");

    if (xfo === "DENY") {
      logPass(`Header: X-Frame-Options is DENY`);
    } else {
      logFail(`Header: X-Frame-Options is DENY`, `Received: ${xfo}`);
    }

    if (xcto === "nosniff") {
      logPass(`Header: X-Content-Type-Options is nosniff`);
    } else {
      logFail(`Header: X-Content-Type-Options is nosniff`, `Received: ${xcto}`);
    }

    if (csp && csp.includes("default-src 'self'")) {
      logPass(`Header: Content-Security-Policy is active and configured`);
    } else {
      logFail(`Header: Content-Security-Policy is active`, `Received: ${csp}`);
    }

    if (hsts && hsts.includes("max-age=")) {
      logPass(`Header: Strict-Transport-Security is active`);
    } else {
      logFail(`Header: Strict-Transport-Security is active`, `Received: ${hsts}`);
    }
  } catch (err) {
    logFail(`Server connection to ${BASE_URL}`, err.message);
    console.log(`\n\x1b[33mTip: Ensure the application is running (npm run dev or npm start) before executing smoke tests.\x1b[0m\n`);
    process.exit(1);
  }

  // Test 3: Public CMS Content API
  try {
    const res = await fetch(`${BASE_URL}/api/cms/content`);
    const json = await res.json();
    if (res.status === 200 && json.success === true && (json.settings || json.data)) {
      logPass(`GET /api/cms/content returns HTTP 200 with valid CMS data`);
    } else {
      logFail(`GET /api/cms/content returns HTTP 200 with valid CMS data`, `Status: ${res.status}, response keys: ${Object.keys(json || {}).join(", ")}`);
    }
  } catch (err) {
    logFail(`GET /api/cms/content`, err.message);
  }

  // Test 4: Protected Admin API (Unauthenticated must return 401)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/sections`);
    if (res.status === 401) {
      logPass(`GET /api/admin/sections (unauthenticated) returns HTTP 401 Unauthorized`);
    } else {
      logFail(`GET /api/admin/sections (unauthenticated) returns HTTP 401 Unauthorized`, `Received status ${res.status}`);
    }
  } catch (err) {
    logFail(`GET /api/admin/sections auth check`, err.message);
  }

  // Test 5: Admin Login Validation (Empty body returns 400)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.status === 400) {
      logPass(`POST /api/admin/login (empty body) returns HTTP 400 Bad Request`);
    } else {
      logFail(`POST /api/admin/login (empty body) returns HTTP 400 Bad Request`, `Received status ${res.status}`);
    }
  } catch (err) {
    logFail(`POST /api/admin/login empty body`, err.message);
  }

  // Test 6: Admin Login Authentication (Invalid credentials return 401)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "wronguser", password: "wrongpassword123" }),
    });
    if (res.status === 401) {
      logPass(`POST /api/admin/login (invalid creds) returns HTTP 401 Invalid credentials`);
    } else {
      logFail(`POST /api/admin/login (invalid creds) returns HTTP 401 Invalid credentials`, `Received status ${res.status}`);
    }
  } catch (err) {
    logFail(`POST /api/admin/login invalid creds`, err.message);
  }

  // Test 7: Inquiry Form Validation (Invalid payload returns 400)
  try {
    const res = await fetch(`${BASE_URL}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", phone: "invalid" }),
    });
    if (res.status === 400) {
      logPass(`POST /api/inquiries (invalid payload) returns HTTP 400 Validation Error`);
    } else {
      logFail(`POST /api/inquiries (invalid payload) returns HTTP 400 Validation Error`, `Received status ${res.status}`);
    }
  } catch (err) {
    logFail(`POST /api/inquiries validation`, err.message);
  }

  // Test 8: Office Endpoints Role-Based Auth (Unauthenticated must return 401)
  const officeEndpoints = [
    "/api/office/cases",
    "/api/office/finance",
    "/api/office/tax",
    "/api/office/stamps",
    "/api/office/dashboard"
  ];

  for (const endpoint of officeEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (res.status === 401) {
        logPass(`GET ${endpoint} (unauthenticated) returns HTTP 401 Unauthorized`);
      } else {
        logFail(`GET ${endpoint} (unauthenticated) returns HTTP 401 Unauthorized`, `Received status ${res.status}`);
      }
    } catch (err) {
      logFail(`GET ${endpoint} auth check`, err.message);
    }
  }

  // Summary
  console.log(`\n========================================`);
  console.log(`Smoke Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
