import { describe, expect, it } from "vitest";

describe("Issues search API route", () => {
  it("uses inArray for workspace team filtering", async () => {
    const fs = await import("node:fs");
    const content = fs.readFileSync(
      "src/app/api/issues/search/route.ts",
      "utf-8",
    );

    expect(content).toContain("inArray(issue.teamId, teamIds)");
  });

  it("honors an explicit workspaceId when scoping search", async () => {
    const fs = await import("node:fs");
    const content = fs.readFileSync(
      "src/app/api/issues/search/route.ts",
      "utf-8",
    );

    expect(content).toContain('searchParams.get("workspaceId")');
    expect(content).toContain("eq(member.workspaceId, requestedWorkspaceId)");
  });
});
