import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  initiative,
  initiativeProject,
  issue,
  member,
  project,
  workflowState,
} from "@/lib/db/schema";
import { and, count, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's workspace
  const members = await db
    .select({ workspaceId: member.workspaceId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (members.length === 0) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  const workspaceId = members[0].workspaceId;

  const initiatives = await db
    .select()
    .from(initiative)
    .where(eq(initiative.workspaceId, workspaceId));

  // Get project counts per initiative
  const result = await Promise.all(
    initiatives.map(async (init) => {
      const projects = await db
        .select({
          id: project.id,
          name: project.name,
          status: project.status,
          icon: project.icon,
        })
        .from(initiativeProject)
        .innerJoin(project, eq(initiativeProject.projectId, project.id))
        .where(eq(initiativeProject.initiativeId, init.id));

      const completedCount = projects.filter(
        (p) => p.status === "completed",
      ).length;

      return {
        id: init.id,
        name: init.name,
        description: init.description,
        status: init.status,
        projectCount: projects.length,
        completedProjectCount: completedCount,
        createdAt: init.createdAt,
        updatedAt: init.updatedAt,
      };
    }),
  );

  return NextResponse.json({ initiatives: result });
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
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  const body = await request.json();

  const newInitiative = await db
    .insert(initiative)
    .values({
      name: body.name,
      description: body.description ?? null,
      status: body.status ?? "planned",
      workspaceId: members[0].workspaceId,
    })
    .returning();

  return NextResponse.json(newInitiative[0], { status: 201 });
}
