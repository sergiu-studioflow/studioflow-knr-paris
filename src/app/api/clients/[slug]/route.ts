import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/clients/[slug] — Get client details with related data
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { slug } = await params;
  const [client] = await db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.clientSlug, slug))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Fetch related data in parallel
  const [brandIntel, products, usps, competitors, creativeDna] = await Promise.all([
    db.select().from(schema.clientBrandIntelligence).where(eq(schema.clientBrandIntelligence.clientId, client.id)).orderBy(schema.clientBrandIntelligence.sortOrder),
    db.select().from(schema.clientProducts).where(eq(schema.clientProducts.clientId, client.id)),
    db.select().from(schema.clientUsps).where(eq(schema.clientUsps.clientId, client.id)),
    db.select().from(schema.clientCompetitors).where(eq(schema.clientCompetitors.clientId, client.id)),
    db.select().from(schema.clientCreativeDna).where(eq(schema.clientCreativeDna.clientId, client.id)),
  ]);

  return NextResponse.json({
    ...client,
    clientName: client.brandName,
    clientSlug: client.clientSlug,
    cluster: client.brandCluster,
    brandIntel,
    products,
    usps,
    competitors,
    creativeDna,
  });
}

/**
 * PUT /api/clients/[slug] — Update client
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit clients" }, { status: 403 });
  }

  const { slug } = await params;
  const body = await req.json();

  // Parse numeric fields
  if (body.monthlyAdSpend !== undefined) {
    body.monthlyAdSpend = body.monthlyAdSpend ? parseInt(String(body.monthlyAdSpend), 10) || null : null;
  }

  const [updated] = await db
    .update(schema.clients)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(schema.clients.clientSlug, slug))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ ...updated, clientName: updated.brandName, cluster: updated.brandCluster });
}

/**
 * DELETE /api/clients/[slug] — Delete client (cascade deletes all related data)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  if (auth.portalUser.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { slug } = await params;
  const [deleted] = await db
    .delete(schema.clients)
    .where(eq(schema.clients.clientSlug, slug))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  await db.insert(schema.activityLog).values({
    action: "client_deleted",
    resourceType: "client",
    details: { clientName: deleted.brandName, clientSlug: deleted.clientSlug },
  });

  return NextResponse.json({ success: true });
}
