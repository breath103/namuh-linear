import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { issue, member, team } from "@/lib/db/schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length === 0) {
    return NextResponse.json([]);
  }

  // Get user's workspace
  const memberships = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (memberships.length === 0) {
    return NextResponse.json([]);
  }

  const workspaceId = memberships[0].workspaceId;

  // Get workspace teams
  const workspaceTeams = await db
    .select({ id: team.id })
    .from(team)
    .where(eq(team.workspaceId, workspaceId));

  const teamIds = workspaceTeams.map((t) => t.id);

  if (teamIds.length === 0) {
    return NextResponse.json([]);
  }

  // Search issues by title or identifier
  const results = await db
    .select({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      priority: issue.priority,
    })
    .from(issue)
    .where(
      and(
        sql`${issue.teamId} = ANY(${teamIds})`,
        or(
          ilike(issue.title, `%${query}%`),
          ilike(issue.identifier, `%${query}%`),
        ),
      ),
    )
    .orderBy(issue.createdAt)
    .limit(10);

  return NextResponse.json(results);
}
