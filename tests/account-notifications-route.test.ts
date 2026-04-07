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

describe("account notifications route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when the user has no stored notification settings", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    selectLimitMock.mockResolvedValue([{ id: "user-1", settings: null }]);

    const { GET } = await import("@/app/api/account/notifications/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accountNotifications: expect.objectContaining({
        channels: expect.objectContaining({
          desktop: expect.objectContaining({
            events: expect.objectContaining({
              assignments: true,
              comments: false,
            }),
          }),
          email: expect.objectContaining({
            events: expect.objectContaining({
              assignments: false,
            }),
          }),
        }),
        updatesFromLinear: expect.objectContaining({
          showInSidebar: true,
          newsletter: false,
        }),
      }),
    });
  });

  it("merges nested channel patches into stored notification settings", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    selectLimitMock.mockResolvedValue([
      {
        id: "user-1",
        settings: {
          accountNotifications: {
            channels: {
              desktop: {
                events: {
                  assignments: true,
                  statusChanges: true,
                  mentions: true,
                  comments: false,
                },
              },
            },
          },
        },
      },
    ]);

    const { PATCH } = await import("@/app/api/account/notifications/route");
    const response = await PATCH(
      new Request("http://localhost/api/account/notifications", {
        method: "PATCH",
        body: JSON.stringify({
          accountNotifications: {
            channels: {
              desktop: {
                events: {
                  comments: true,
                },
              },
            },
            other: {
              dpa: true,
            },
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          accountNotifications: expect.objectContaining({
            channels: expect.objectContaining({
              desktop: expect.objectContaining({
                events: expect.objectContaining({
                  assignments: true,
                  comments: true,
                }),
              }),
            }),
            other: expect.objectContaining({
              dpa: true,
            }),
          }),
        }),
      }),
    );
    await expect(response.json()).resolves.toEqual({
      accountNotifications: expect.objectContaining({
        channels: expect.objectContaining({
          desktop: expect.objectContaining({
            events: expect.objectContaining({
              comments: true,
            }),
          }),
        }),
        other: expect.objectContaining({
          dpa: true,
        }),
      }),
    });
  });

  it("returns 401 without a session", async () => {
    getSessionMock.mockResolvedValue(null);

    const { GET } = await import("@/app/api/account/notifications/route");
    const response = await GET();

    expect(response.status).toBe(401);
  });
});
