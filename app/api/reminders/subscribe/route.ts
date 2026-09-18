import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/config/env";
import { validateSubscription } from "@/lib/validation/subscription";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GENERIC_SUCCESS = {
  success: true,
  message: "If this email address is valid, a confirmation link has been sent to your inbox.",
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypots must look successful to automated submitters.
    if (typeof body.hp_company === "string" && body.hp_company.trim()) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const categoryIds = Array.isArray(body.category_ids)
      ? body.category_ids.filter((id): id is string => typeof id === "string")
      : [];
    const consent = body.consent === true;

    const validation = validateSubscription({ name, email, category_ids: categoryIds, consent });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: Object.values(validation.errors)[0] || "Invalid subscription request." },
        { status: 400 }
      );
    }

    const config = getSupabasePublicConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Reminder service is not configured yet." },
        { status: 503 }
      );
    }

    // Fallback UI categories use stable slugs. Resolve them to database UUIDs
    // before calling the secured Edge Function.
    let resolvedCategoryIds = categoryIds;
    if (categoryIds.some((id) => !UUID_RE.test(id))) {
      const slugs = categoryIds.filter((id) => !UUID_RE.test(id));
      const lookupResponse = await fetch(
        `${config.url}/rest/v1/tax_categories?select=id,slug&is_active=eq.true&slug=in.(${slugs.map(encodeURIComponent).join(",")})`,
        {
          headers: {
            apikey: config.anonKey,
            Authorization: `Bearer ${config.anonKey}`,
          },
          cache: "no-store",
        }
      );

      if (!lookupResponse.ok) {
        return NextResponse.json(
          { success: false, error: "Unable to verify reminder categories. Please try again." },
          { status: 503 }
        );
      }

      const rows = (await lookupResponse.json()) as Array<{ id: string; slug: string }>;
      const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
      resolvedCategoryIds = categoryIds
        .map((id) => (UUID_RE.test(id) ? id : bySlug.get(id)))
        .filter((id): id is string => Boolean(id));

      if (resolvedCategoryIds.length !== categoryIds.length) {
        return NextResponse.json(
          { success: false, error: "One or more reminder categories are unavailable." },
          { status: 400 }
        );
      }
    }

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const edgeResponse = await fetch(`${config.url}/functions/v1/subscribe`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
      },
      body: JSON.stringify({
        name: name.slice(0, 100),
        email,
        category_ids: resolvedCategoryIds,
        consent,
        hp_company: "",
      }),
      cache: "no-store",
    });

    const result = await edgeResponse.json().catch(() => ({
      success: false,
      error: "Reminder service returned an invalid response.",
    }));

    return NextResponse.json(result, { status: edgeResponse.status });
  } catch (error) {
    console.error("[Reminder Subscribe] Request failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process subscription at this time." },
      { status: 500 }
    );
  }
}
