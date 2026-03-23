import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/brand-intel?brandId=xxx — returns intel entries (all or filtered by brand)
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const brandId = request.nextUrl.searchParams.get("brandId");

  const query = db
    .select({
      id: schema.brandIntelligence.id,
      brandId: schema.brandIntelligence.brandId,
      brandName: schema.brands.brandName,
      title: schema.brandIntelligence.title,
      type: schema.brandIntelligence.type,
      rawContent: schema.brandIntelligence.rawContent,
      notionPageId: schema.brandIntelligence.notionPageId,
      ownerName: schema.brandIntelligence.ownerName,
      updatedAt: schema.brandIntelligence.updatedAt,
      createdAt: schema.brandIntelligence.createdAt,
    })
    .from(schema.brandIntelligence)
    .leftJoin(schema.brands, eq(schema.brandIntelligence.brandId, schema.brands.id))
    .orderBy(asc(schema.brandIntelligence.type), asc(schema.brandIntelligence.title));

  const rows = brandId
    ? await query.where(eq(schema.brandIntelligence.brandId, brandId))
    : await query;

  return NextResponse.json(rows);
}

// PUT /api/brand-intel — update a specific entry by id
export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit brand intelligence" }, { status: 403 });
  }

  const body = await request.json();
  const { id, rawContent, sections } = body;

  if (!id) {
    return NextResponse.json({ error: "Entry id is required" }, { status: 400 });
  }

  const [result] = await db
    .update(schema.brandIntelligence)
    .set({
      rawContent: rawContent ?? undefined,
      sections: sections ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.brandIntelligence.id, id))
    .returning();

  if (!result) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "brand_intel_updated",
    resourceType: "brand_intel",
    resourceId: result.id,
  });

  return NextResponse.json(result);
}

// POST /api/brand-intel — create new entry
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create brand intelligence" }, { status: 403 });
  }

  const body = await request.json();
  const { brandId, title, type, rawContent } = body;

  if (!brandId || !title) {
    return NextResponse.json({ error: "brandId and title are required" }, { status: 400 });
  }

  const [result] = await db
    .insert(schema.brandIntelligence)
    .values({
      brandId,
      title,
      type: type || null,
      rawContent: rawContent || null,
    })
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "brand_intel_created",
    resourceType: "brand_intel",
    resourceId: result.id,
  });

  return NextResponse.json(result, { status: 201 });
}
