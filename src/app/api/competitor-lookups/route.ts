import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const rows = await db
    .select({
      id: schema.competitorLookupRequests.id,
      lookupMode: schema.competitorLookupRequests.lookupMode,
      competitorId: schema.competitorLookupRequests.competitorId,
      competitorName: schema.competitors.competitorName,
      category: schema.competitorLookupRequests.category,
      brandId: schema.competitorLookupRequests.brandId,
      brandName: schema.competitorLookupRequests.brandName,
      country: schema.competitorLookupRequests.country,
      maxAds: schema.competitorLookupRequests.maxAds,
      status: schema.competitorLookupRequests.status,
      resultReportId: schema.competitorLookupRequests.resultReportId,
      createdAt: schema.competitorLookupRequests.createdAt,
    })
    .from(schema.competitorLookupRequests)
    .leftJoin(
      schema.competitors,
      eq(schema.competitorLookupRequests.competitorId, schema.competitors.id)
    )
    .orderBy(desc(schema.competitorLookupRequests.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  if (!body.lookupMode) {
    return NextResponse.json({ error: "lookupMode is required" }, { status: 400 });
  }

  if (body.lookupMode === "Competitor" && !body.competitorId) {
    return NextResponse.json({ error: "competitorId is required for Competitor mode" }, { status: 400 });
  }
  if (body.lookupMode === "Category" && !body.category?.trim()) {
    return NextResponse.json({ error: "category is required for Category mode" }, { status: 400 });
  }

  const [record] = await db
    .insert(schema.competitorLookupRequests)
    .values({
      lookupMode: body.lookupMode,
      competitorId: body.competitorId || null,
      category: body.category || null,
      brandId: body.brandId || null,
      brandName: body.brandName || null,
      country: body.country || "FR",
      maxAds: body.maxAds || 30,
    })
    .returning();

  // Fire-and-forget webhook to n8n
  const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/knr-competitor-lookup`;
  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lookupRequestId: record.id,
      lookupMode: record.lookupMode,
      competitorId: record.competitorId,
      category: record.category,
      brandId: record.brandId,
      brandName: record.brandName,
      country: record.country,
      maxAds: record.maxAds,
    }),
  }).catch(() => {});

  return NextResponse.json(record, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { ids } = await request.json();
  if (!ids?.length) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  await db
    .delete(schema.competitorLookupRequests)
    .where(inArray(schema.competitorLookupRequests.id, ids));
  return NextResponse.json({ success: true });
}
