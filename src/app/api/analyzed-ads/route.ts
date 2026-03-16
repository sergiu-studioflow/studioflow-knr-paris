import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, and, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const url = new URL(request.url);
  const platform = url.searchParams.get("platform");
  const brandName = url.searchParams.get("brandName");
  const week = url.searchParams.get("week");
  const limit = parseInt(url.searchParams.get("limit") || "200");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const conditions: SQL[] = [];
  if (platform) conditions.push(eq(schema.analyzedAds.platform, platform));
  if (brandName) conditions.push(eq(schema.analyzedAds.brandName, brandName));
  if (week) conditions.push(eq(schema.analyzedAds.week, week));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(schema.analyzedAds)
    .where(where)
    .orderBy(desc(schema.analyzedAds.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(rows);
}
