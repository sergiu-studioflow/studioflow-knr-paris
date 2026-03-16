import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    const [report] = await db
      .select()
      .from(schema.intelligenceReports)
      .where(eq(schema.intelligenceReports.id, id));

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  }

  const rows = await db
    .select()
    .from(schema.intelligenceReports)
    .orderBy(desc(schema.intelligenceReports.createdAt));

  return NextResponse.json(rows);
}
