import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { comment, issue } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function findIssueRecord(id: string) {
  const issues = await db
    .select({ id: issue.id })
    .from(issue)
    .where(eq(issue.identifier, id))
    .limit(1);

  if (issues.length > 0) {
    return issues[0];
  }

  const byId = await db
    .select({ id: issue.id })
    .from(issue)
    .where(eq(issue.id, id))
    .limit(1);

  return byId[0] ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentIssue = await findIssueRecord(id);
  if (!currentIssue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const body = (await request.json()) as { body?: string };
  const nextBody = body.body?.trim();

  if (!nextBody) {
    return NextResponse.json(
      { error: "Comment body is required" },
      { status: 400 },
    );
  }

  const createdComments = await db
    .insert(comment)
    .values({
      body: nextBody,
      issueId: currentIssue.id,
      userId: session.user.id,
    })
    .returning({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
    });

  const createdComment = createdComments[0];

  return NextResponse.json({
    id: createdComment.id,
    body: createdComment.body,
    createdAt: createdComment.createdAt,
    user: {
      name: session.user.name,
      image: session.user.image ?? null,
    },
    reactions: [],
  });
}
