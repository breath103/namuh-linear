import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  initiative,
  initiativeProject,
  issue,
  project,
  workflowState,
} from "@/lib/db/schema";
import { and, count, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const initiatives = await db
    .select()
    .from(initiative)
    .where(eq(initiative.id, id))
    .limit(1);

  if (initiatives.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const init = initiatives[0];

  // Get linked projects with issue progress
  const linkedProjects = await db
    .select({
      id: project.id,
      name: project.name,
      status: project.status,
      icon: project.icon,
      slug: project.slug,
    })
    .from(initiativeProject)
    .innerJoin(project, eq(initiativeProject.projectId, project.id))
    .where(eq(initiativeProject.initiativeId, id));

  const projectsWithProgress = await Promise.all(
    linkedProjects.map(async (p) => {
      const totalResult = await db
        .select({ value: count() })
        .from(issue)
        .where(eq(issue.projectId, p.id));
      const issueCount = totalResult[0]?.value ?? 0;

      let completedIssueCount = 0;
      if (issueCount > 0) {
        const completedStates = await db
          .select({ id: workflowState.id })
          .from(workflowState)
          .where(eq(workflowState.category, "completed"));

        if (completedStates.length > 0) {
          const completedResult = await db
            .select({ value: count() })
            .from(issue)
            .where(
              and(
                eq(issue.projectId, p.id),
                sql`${issue.stateId} IN (${sql.join(
                  completedStates.map((s) => sql`${s.id}`),
                  sql`, `,
                )})`,
              ),
            );
          completedIssueCount = completedResult[0]?.value ?? 0;
        }
      }

      return {
        ...p,
        issueCount,
        completedIssueCount,
      };
    }),
  );

  return NextResponse.json({
    initiative: {
      ...init,
      projectCount: projectsWithProgress.length,
      completedProjectCount: projectsWithProgress.filter(
        (p) => p.status === "completed",
      ).length,
    },
    projects: projectsWithProgress,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;

  const updated = await db
    .update(initiative)
    .set(updateData)
    .where(eq(initiative.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const deleted = await db
    .delete(initiative)
    .where(eq(initiative.id, id))
    .returning();

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
