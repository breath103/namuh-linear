import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customView, member, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (members.length === 0) {
    return NextResponse.json({ views: [] });
  }

  const workspaceId = members[0].workspaceId;

  const views = await db
    .select({
      id: customView.id,
      name: customView.name,
      layout: customView.layout,
      isPersonal: customView.isPersonal,
      filterState: customView.filterState,
      teamId: customView.teamId,
      ownerName: user.name,
      ownerImage: user.image,
      createdAt: customView.createdAt,
    })
    .from(customView)
    .leftJoin(user, eq(customView.ownerId, user.id))
    .where(eq(customView.workspaceId, workspaceId))
    .orderBy(customView.createdAt);

  const result = views.map((v) => ({
    id: v.id,
    name: v.name,
    layout: v.layout,
    isPersonal: v.isPersonal,
    filterState: v.filterState,
    teamId: v.teamId,
    owner: v.ownerName ? { name: v.ownerName, image: v.ownerImage } : null,
    createdAt: v.createdAt,
  }));

  return NextResponse.json({ views: result });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (members.length === 0) {
    return NextResponse.json({ error: "No workspace found" }, { status: 400 });
  }

  const workspaceId = members[0].workspaceId;
  const body = await request.json();

  const { name, layout, isPersonal, filterState, teamId } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const [newView] = await db
    .insert(customView)
    .values({
      name: name.trim(),
      ownerId: session.user.id,
      workspaceId,
      layout: layout ?? "list",
      isPersonal: isPersonal ?? true,
      filterState: filterState ?? {},
      teamId: teamId ?? null,
    })
    .returning();

  return NextResponse.json({ view: newView }, { status: 201 });
}
