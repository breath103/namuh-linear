import { db } from "@/lib/db";
import { member, team } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function getTeamIdByKey(key: string): Promise<string | null> {
  const teams = await db
    .select({ id: team.id })
    .from(team)
    .where(eq(team.key, key))
    .limit(1);
  return teams[0]?.id ?? null;
}

export async function getWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getTeamByKey(
  key: string,
): Promise<{ id: string; name: string; key: string } | null> {
  const teams = await db
    .select({ id: team.id, name: team.name, key: team.key })
    .from(team)
    .where(eq(team.key, key))
    .limit(1);
  return teams[0] ?? null;
}
