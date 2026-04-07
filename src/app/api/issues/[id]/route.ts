import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  comment,
  issue,
  issueLabel,
  label,
  project,
  team,
  user,
  workflowState,
} from "@/lib/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
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

  // Find issue by identifier (e.g., ENG-45) or by id
  const issues = await db
    .select({
      id: issue.id,
      number: issue.number,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      stateId: issue.stateId,
      assigneeId: issue.assigneeId,
      creatorId: issue.creatorId,
      projectId: issue.projectId,
      dueDate: issue.dueDate,
      estimate: issue.estimate,
      sortOrder: issue.sortOrder,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      teamId: issue.teamId,
    })
    .from(issue)
    .where(eq(issue.identifier, id))
    .limit(1);

  if (issues.length === 0) {
    // Try by UUID
    const byId = await db.select().from(issue).where(eq(issue.id, id)).limit(1);
    if (byId.length === 0) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    issues.push(byId[0]);
  }

  const iss = issues[0];

  // Fetch related data in parallel
  const [
    stateRows,
    assigneeRows,
    creatorRows,
    teamRows,
    projectRows,
    labelRows,
    commentRows,
  ] = await Promise.all([
    db.select().from(workflowState).where(eq(workflowState.id, iss.stateId)),
    iss.assigneeId
      ? db
          .select({ id: user.id, name: user.name, image: user.image })
          .from(user)
          .where(eq(user.id, iss.assigneeId))
      : Promise.resolve([]),
    db
      .select({ id: user.id, name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, iss.creatorId)),
    db
      .select({ id: team.id, name: team.name, key: team.key })
      .from(team)
      .where(eq(team.id, iss.teamId)),
    iss.projectId
      ? db
          .select({ id: project.id, name: project.name, icon: project.icon })
          .from(project)
          .where(eq(project.id, iss.projectId))
      : Promise.resolve([]),
    db
      .select({ labelName: label.name, labelColor: label.color })
      .from(issueLabel)
      .innerJoin(label, eq(issueLabel.labelId, label.id))
      .where(eq(issueLabel.issueId, iss.id)),
    db
      .select({
        id: comment.id,
        body: comment.body,
        userId: comment.userId,
        userName: user.name,
        userImage: user.image,
        createdAt: comment.createdAt,
      })
      .from(comment)
      .leftJoin(user, eq(comment.userId, user.id))
      .where(eq(comment.issueId, iss.id))
      .orderBy(asc(comment.createdAt)),
  ]);

  const state = stateRows[0];
  const assignee = assigneeRows[0] ?? null;
  const creator = creatorRows[0] ?? null;
  const teamData = teamRows[0];
  const projectData = projectRows[0] ?? null;

  return NextResponse.json({
    id: iss.id,
    number: iss.number,
    identifier: iss.identifier,
    title: iss.title,
    description: iss.description,
    priority: iss.priority,
    estimate: iss.estimate,
    dueDate: iss.dueDate,
    createdAt: iss.createdAt,
    updatedAt: iss.updatedAt,
    state: state
      ? {
          id: state.id,
          name: state.name,
          category: state.category,
          color: state.color,
        }
      : null,
    assignee,
    creator,
    team: teamData,
    project: projectData,
    labels: labelRows.map((l) => ({ name: l.labelName, color: l.labelColor })),
    comments: commentRows.map((c) => ({
      id: c.id,
      body: c.body,
      user: { name: c.userName, image: c.userImage },
      createdAt: c.createdAt,
    })),
  });
}
