import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const selectLimitMock = vi.fn();
const updateSetMock = vi.fn();
const updateWhereMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: selectLimitMock,
        }),
      }),
    })),
    update: vi.fn(() => ({
      set: (...args: unknown[]) => {
        updateSetMock(...args);
        return {
          where: (...whereArgs: unknown[]) => {
            updateWhereMock(...whereArgs);
            return Promise.resolve();
          },
        };
      },
    })),
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

describe("account preferences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when the user has no stored preferences", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    selectLimitMock.mockResolvedValue([{ id: "user-1", settings: null }]);

    const { GET } = await import("@/app/api/account/preferences/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accountPreferences: expect.objectContaining({
        defaultHomeView: "my-issues",
        theme: "system",
        pointerCursors: false,
        sidebarVisibility: expect.objectContaining({
          projects: true,
          views: true,
        }),
      }),
    });
  });

  it("merges partial patches into the stored preferences", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    selectLimitMock.mockResolvedValue([
      {
        id: "user-1",
        settings: {
          accountPreferences: {
            defaultHomeView: "inbox",
            sidebarVisibility: {
              inbox: true,
              myIssues: true,
              projects: true,
              views: true,
              initiatives: true,
              cycles: true,
            },
          },
        },
      },
    ]);

    const { PATCH } = await import("@/app/api/account/preferences/route");
    const response = await PATCH(
      new Request("http://localhost/api/account/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          accountPreferences: {
            pointerCursors: true,
            sidebarVisibility: {
              projects: false,
            },
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          accountPreferences: expect.objectContaining({
            defaultHomeView: "inbox",
            pointerCursors: true,
            sidebarVisibility: expect.objectContaining({
              projects: false,
              views: true,
            }),
          }),
        }),
      }),
    );
    await expect(response.json()).resolves.toEqual({
      accountPreferences: expect.objectContaining({
        pointerCursors: true,
        sidebarVisibility: expect.objectContaining({
          projects: false,
          views: true,
        }),
      }),
    });
  });

  it("returns 401 without a session", async () => {
    getSessionMock.mockResolvedValue(null);

    const { GET } = await import("@/app/api/account/preferences/route");
    const response = await GET();

    expect(response.status).toBe(401);
  });
});
