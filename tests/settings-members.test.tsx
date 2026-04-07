import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import MembersPage from "@/app/(app)/settings/members/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/settings/members",
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

function waitForLoaded() {
  return waitFor(() => {
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
}

const mockMembers = [
  {
    id: "m1",
    name: "Alice Smith",
    email: "alice@acme.com",
    image: null,
    role: "owner",
    status: "active",
    teams: ["Engineering"],
    joinedAt: "2026-01-15T00:00:00Z",
    lastSeenAt: "2026-04-07T10:00:00Z",
  },
  {
    id: "m2",
    name: "Bob Jones",
    email: "bob@acme.com",
    image: null,
    role: "member",
    status: "active",
    teams: ["Design"],
    joinedAt: "2026-02-01T00:00:00Z",
    lastSeenAt: null,
  },
  {
    id: "m3",
    name: "Charlie Brown",
    email: "charlie@acme.com",
    image: null,
    role: "member",
    status: "pending",
    teams: [],
    joinedAt: "2026-03-10T00:00:00Z",
    lastSeenAt: null,
  },
];

describe("Members Admin Page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Members heading with Export CSV and Invite buttons", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });
    render(<MembersPage />);
    await waitForLoaded();

    expect(
      screen.getByRole("heading", { name: "Members" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Export CSV" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite" })).toBeInTheDocument();
  });

  it("renders table columns", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });
    render(<MembersPage />);
    await waitForLoaded();

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByText("Joined")).toBeInTheDocument();
    expect(screen.getByText("Last seen")).toBeInTheDocument();
  });

  it("renders member rows with name, email, and role badge", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });
    render(<MembersPage />);
    await waitForLoaded();

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@acme.com")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("shows active and pending counts", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });
    render(<MembersPage />);
    await waitForLoaded();

    expect(screen.getByText("2")).toBeInTheDocument(); // Active count
    expect(screen.getByText("1")).toBeInTheDocument(); // Pending count
  });

  it("shows active/pending status badges", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });
    render(<MembersPage />);
    await waitForLoaded();

    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows empty state when no members", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    });
    render(<MembersPage />);
    await waitForLoaded();

    expect(screen.getByText(/No members yet/)).toBeInTheDocument();
  });
});
