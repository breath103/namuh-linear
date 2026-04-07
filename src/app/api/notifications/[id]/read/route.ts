import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const updated = await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(eq(notification.id, id), eq(notification.userId, session.user.id)),
    )
    .returning({ id: notification.id });

  if (updated.length === 0) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
