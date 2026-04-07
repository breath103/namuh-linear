import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { team } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  const teams = await db
    .select({ id: team.id, settings: team.settings })
    .from(team)
    .where(eq(team.key, key))
    .limit(1);

  if (teams.length === 0) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const settings = (teams[0].settings ?? {}) as Record<string, unknown>;
  return NextResponse.json({ displayOptions: settings.displayOptions ?? null });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const body = await request.json();

  const teams = await db
    .select({ id: team.id, settings: team.settings })
    .from(team)
    .where(eq(team.key, key))
    .limit(1);

  if (teams.length === 0) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const existingSettings = (teams[0].settings ?? {}) as Record<string, unknown>;
  const updatedSettings = {
    ...existingSettings,
    displayOptions: body.displayOptions,
  };

  await db
    .update(team)
    .set({ settings: updatedSettings })
    .where(eq(team.id, teams[0].id));

  return NextResponse.json({ displayOptions: body.displayOptions });
}
