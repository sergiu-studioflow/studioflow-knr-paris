import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const rows = await db
    .select()
    .from(schema.creativeBriefs)
    .orderBy(desc(schema.creativeBriefs.createdAt));

  return NextResponse.json(rows);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status !== undefined) updates.status = body.status;

  const [updated] = await db
    .update(schema.creativeBriefs)
    .set(updates)
    .where(eq(schema.creativeBriefs.id, body.id))
    .returning();

  return NextResponse.json(updated);
}
