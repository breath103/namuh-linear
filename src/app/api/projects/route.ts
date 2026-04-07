import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  issue,
  member,
  project,
  projectMilestone,
  user,
} from "@/lib/db/schema";
import { and, count, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find user's workspace
  const members = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (members.length === 0) {
    return NextResponse.json({ projects: [] });
  }

  const workspaceId = members[0].workspaceId;

  // Get all projects for this workspace with lead info
  const projects = await db
    .select({
      id: project.id,
      name: project.name,
      description: project.description,
      icon: project.icon,
      slug: project.slug,
      status: project.status,
      priority: project.priority,
      leadId: project.leadId,
      leadName: user.name,
      leadImage: user.image,
      startDate: project.startDate,
      targetDate: project.targetDate,
      createdAt: project.createdAt,
    })
    .from(project)
    .leftJoin(user, eq(project.leadId, user.id))
    .where(eq(project.workspaceId, workspaceId))
    .orderBy(project.createdAt);

  // Get issue counts per project for progress calculation
  const projectIds = projects.map((p) => p.id);
  const progressMap: Record<string, { total: number; completed: number }> = {};

  if (projectIds.length > 0) {
    const issueCounts = await db
      .select({
        projectId: issue.projectId,
        total: count(),
        completed: count(issue.completedAt),
      })
      .from(issue)
      .where(sql`${issue.projectId} IS NOT NULL`)
      .groupBy(issue.projectId);

    for (const row of issueCounts) {
      if (row.projectId) {
        progressMap[row.projectId] = {
          total: Number(row.total),
          completed: Number(row.completed),
        };
      }
    }
  }

  const result = projects.map((p) => {
    const prog = progressMap[p.id];
    const progress =
      prog && prog.total > 0
        ? Math.round((prog.completed / prog.total) * 100)
        : 0;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
      slug: p.slug,
      status: p.status,
      priority: p.priority,
      health: "No updates",
      lead: p.leadName ? { name: p.leadName, image: p.leadImage } : null,
      startDate: p.startDate,
      targetDate: p.targetDate,
      progress,
      createdAt: p.createdAt,
    };
  });

  return NextResponse.json({ projects: result });
}
