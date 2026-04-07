import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { label, member } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (memberships.length === 0) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  const { id } = await params;
  const workspaceId = memberships[0].workspaceId;
  const body = await request.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.color !== undefined) updates.color = body.color;
  if (body.description !== undefined) updates.description = body.description;

  const [updated] = await db
    .update(label)
    .set(updates)
    .where(and(eq(label.id, id), eq(label.workspaceId, workspaceId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 });
  }

  return NextResponse.json({ label: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (memberships.length === 0) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  const { id } = await params;
  const workspaceId = memberships[0].workspaceId;

  const [deleted] = await db
    .delete(label)
    .where(and(eq(label.id, id), eq(label.workspaceId, workspaceId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
