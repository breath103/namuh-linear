import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { member, workspace } from "@/lib/db/schema";
import { sendInvitationEmail } from "@/lib/email";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface InviteRequest {
  workspaceId: string;
  invites: { email: string; role: "admin" | "member" | "guest" }[];
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as InviteRequest;
  const { workspaceId, invites } = body;

  if (!workspaceId || !invites?.length) {
    return NextResponse.json(
      { error: "Workspace ID and at least one invite are required" },
      { status: 400 },
    );
  }

  // Verify the user is a member of the workspace
  const membership = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (membership.length === 0) {
    return NextResponse.json(
      { error: "You are not a member of this workspace" },
      { status: 403 },
    );
  }

  // Get workspace info for the email
  const [ws] = await db
    .select({ name: workspace.name, urlSlug: workspace.urlSlug })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);

  if (!ws) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3015";
  const results: {
    email: string;
    status: "sent" | "failed";
    error?: string;
  }[] = [];

  for (const invite of invites) {
    const email = invite.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      results.push({
        email: invite.email,
        status: "failed",
        error: "Invalid email",
      });
      continue;
    }

    try {
      const inviteUrl = `${baseUrl}/login?workspace=${ws.urlSlug}`;
      await sendInvitationEmail(email, ws.name, session.user.name, inviteUrl);
      results.push({ email, status: "sent" });
    } catch {
      results.push({ email, status: "failed", error: "Failed to send email" });
    }
  }

  return NextResponse.json({ results });
}
