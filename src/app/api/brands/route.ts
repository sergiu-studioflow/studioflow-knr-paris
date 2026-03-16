import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const rows = await db
    .select()
    .from(schema.brands)
    .orderBy(asc(schema.brands.brandName));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  if (!body.brandName?.trim()) {
    return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
  }

  const [record] = await db
    .insert(schema.brands)
    .values({
      brandName: body.brandName.trim(),
      brandCluster: body.brandCluster || null,
      vertical: body.vertical || null,
      language: body.language || "fr",
      notes: body.notes || null,
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}
