import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { provisionClient } from "@/lib/client-provisioning";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/clients — List all clients with sub-resource counts
 */
export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const rows = await db
    .select()
    .from(schema.clients)
    .orderBy(schema.clients.brandName);

  // Normalize brand → client naming and add counts
  const clients = await Promise.all(
    rows.map(async (row) => {
      const [counts] = await db.execute(sql`
        SELECT
          (SELECT count(*) FROM client_brand_intelligence WHERE client_id = ${row.id})::int as brand_intel_count,
          (SELECT count(*) FROM client_products WHERE client_id = ${row.id})::int as products_count,
          (SELECT count(*) FROM client_usps WHERE client_id = ${row.id})::int as usps_count,
          (SELECT count(*) FROM client_competitors WHERE client_id = ${row.id})::int as competitors_count,
          (SELECT count(*) FROM client_creative_dna WHERE client_id = ${row.id})::int as creative_dna_count
      `);
      return {
        ...row,
        // Normalize: brands table uses brandName/clientSlug, but Client type expects clientName/clientSlug
        clientName: row.brandName,
        clientSlug: row.clientSlug,
        cluster: row.brandCluster,
        brandIntelCount: (counts as any).brand_intel_count ?? 0,
        productsCount: (counts as any).products_count ?? 0,
        uspsCount: (counts as any).usps_count ?? 0,
        competitorsCount: (counts as any).competitors_count ?? 0,
        creativeDnaCount: (counts as any).creative_dna_count ?? 0,
      };
    })
  );

  return NextResponse.json(clients);
}

/**
 * POST /api/clients — Create a new client with auto-provisioning
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create clients" }, { status: 403 });
  }

  const body = await req.json();
  const { clientName, website, category, primaryMarket, currency, cluster, logoUrl, brandColor, monthlyAdSpend, notes } = body;

  if (!clientName || typeof clientName !== "string" || clientName.trim().length === 0) {
    return NextResponse.json({ error: "clientName is required" }, { status: 400 });
  }

  const clientSlug = slugify(clientName);

  const [existing] = await db
    .select({ id: schema.clients.id })
    .from(schema.clients)
    .where(eq(schema.clients.clientSlug, clientSlug))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: `Client slug "${clientSlug}" already exists` }, { status: 409 });
  }

  try {
    const client = await provisionClient(
      { clientName: clientName.trim(), clientSlug, website, category, primaryMarket, currency, cluster, logoUrl, brandColor, monthlyAdSpend, notes },
      auth.portalUser.id
    );
    return NextResponse.json({ ...client, clientName: client.brandName, cluster: client.brandCluster }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create client";
    console.error("[api/clients] POST error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
