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
      id: schema.competitors.id,
      competitorName: schema.competitors.competitorName,
      brandId: schema.competitors.brandId,
      brandName: schema.brands.brandName,
      metaSearchTerms: schema.competitors.metaSearchTerms,
      metaPageId: schema.competitors.metaPageId,
      tiktokHandle: schema.competitors.tiktokHandle,
      platforms: schema.competitors.platforms,
      country: schema.competitors.country,
      isActive: schema.competitors.isActive,
      lastScraped: schema.competitors.lastScraped,
      notes: schema.competitors.notes,
      createdAt: schema.competitors.createdAt,
    })
    .from(schema.competitors)
    .leftJoin(schema.brands, eq(schema.competitors.brandId, schema.brands.id))
    .orderBy(desc(schema.competitors.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  if (!body.competitorName?.trim()) {
    return NextResponse.json({ error: "Competitor name is required" }, { status: 400 });
  }

  const [record] = await db
    .insert(schema.competitors)
    .values({
      competitorName: body.competitorName.trim(),
      brandId: body.brandId || null,
      metaSearchTerms: body.metaSearchTerms || null,
      metaPageId: body.metaPageId || null,
      tiktokHandle: body.tiktokHandle || null,
      platforms: body.platforms || "Meta",
      country: body.country || "FR",
      notes: body.notes || null,
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.competitorName !== undefined) updates.competitorName = body.competitorName;
  if (body.brandId !== undefined) updates.brandId = body.brandId || null;
  if (body.metaSearchTerms !== undefined) updates.metaSearchTerms = body.metaSearchTerms;
  if (body.metaPageId !== undefined) updates.metaPageId = body.metaPageId;
  if (body.tiktokHandle !== undefined) updates.tiktokHandle = body.tiktokHandle;
  if (body.platforms !== undefined) updates.platforms = body.platforms;
  if (body.country !== undefined) updates.country = body.country;
  if (body.notes !== undefined) updates.notes = body.notes;

  const [updated] = await db
    .update(schema.competitors)
    .set(updates)
    .where(eq(schema.competitors.id, body.id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { ids } = await request.json();
  if (!ids?.length) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  await db.delete(schema.competitors).where(inArray(schema.competitors.id, ids));
  return NextResponse.json({ success: true });
}
