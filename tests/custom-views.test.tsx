import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ViewsPage from "@/app/(app)/views/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/views",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function waitForLoaded() {
  return waitFor(() => {
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
}

describe("Custom Views Page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Views list rendering", () => {
    it("renders page title and tabs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: [] }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      expect(
        screen.getByRole("heading", { name: "Views" }),
      ).toBeInTheDocument();
      const tabButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.hasAttribute("data-active"));
      expect(tabButtons).toHaveLength(2);
      expect(tabButtons[0]).toHaveTextContent("Issues");
      expect(tabButtons[1]).toHaveTextContent("Projects");
      expect(tabButtons[0]).toHaveAttribute("data-active", "true");
    });

    it("shows empty state when no views exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: [] }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      expect(screen.getByText("No views")).toBeInTheDocument();
    });

    it("renders view list with name and owner columns", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [
            {
              id: "v1",
              name: "My Active Issues",
              layout: "list",
              isPersonal: true,
              owner: { name: "John Doe", image: null },
              createdAt: "2026-01-01T00:00:00Z",
            },
            {
              id: "v2",
              name: "Sprint Board",
              layout: "board",
              isPersonal: false,
              owner: { name: "Jane Smith", image: null },
              createdAt: "2026-01-02T00:00:00Z",
            },
          ],
        }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      expect(screen.getByText("My Active Issues")).toBeInTheDocument();
      expect(screen.getByText("Sprint Board")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Owner")).toBeInTheDocument();
    });

    it("separates personal and shared views with section headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [
            {
              id: "v1",
              name: "Personal View",
              layout: "list",
              isPersonal: true,
              owner: { name: "John Doe", image: null },
              createdAt: "2026-01-01T00:00:00Z",
            },
            {
              id: "v2",
              name: "Shared View",
              layout: "board",
              isPersonal: false,
              owner: { name: "John Doe", image: null },
              createdAt: "2026-01-02T00:00:00Z",
            },
          ],
        }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      expect(screen.getByText("Personal View")).toBeInTheDocument();
      expect(screen.getByText(/Only visible to you/)).toBeInTheDocument();
      expect(screen.getByText("Shared View")).toBeInTheDocument();
    });

    it("shows create view button in header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [
            {
              id: "v1",
              name: "Test View",
              layout: "list",
              isPersonal: false,
              owner: { name: "John", image: null },
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
        }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      expect(
        screen.getByRole("button", { name: /create view/i }),
      ).toBeInTheDocument();
    });

    it("displays view layout icon", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [
            {
              id: "v1",
              name: "List View",
              layout: "list",
              isPersonal: false,
              owner: { name: "John", image: null },
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
        }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      expect(screen.getByText("List View")).toBeInTheDocument();
      expect(screen.getByLabelText(/list layout/i)).toBeInTheDocument();
    });
  });

  describe("Create view modal", () => {
    it("opens modal and submits new view", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            views: [
              {
                id: "v1",
                name: "Existing View",
                layout: "list",
                isPersonal: false,
                owner: { name: "User", image: null },
                createdAt: "2026-01-01T00:00:00Z",
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            view: { id: "new-v", name: "New View", layout: "list" },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ views: [] }),
        });

      render(<ViewsPage />);
      await waitForLoaded();

      const createBtn = screen.getByRole("button", { name: /create view/i });
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/view name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText(/view name/i), {
        target: { value: "New View" },
      });

      const submitBtn = screen.getByRole("button", { name: /^create$/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/views",
          expect.objectContaining({ method: "POST" }),
        );
      });
    });
  });

  describe("Tab switching", () => {
    it("switches between Issues and Projects tabs", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ views: [] }),
      });

      render(<ViewsPage />);
      await waitForLoaded();

      const tabButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.hasAttribute("data-active"));
      const issuesTab = tabButtons[0];
      const projectsTab = tabButtons[1];

      expect(issuesTab).toHaveAttribute("data-active", "true");
      expect(projectsTab).toHaveAttribute("data-active", "false");

      fireEvent.click(projectsTab);
      expect(projectsTab).toHaveAttribute("data-active", "true");
      expect(issuesTab).toHaveAttribute("data-active", "false");
    });
  });
});

describe("Views API route", () => {
  it("API route file exports GET and POST handlers", async () => {
    const fs = await import("node:fs");
    const content = fs.readFileSync("src/app/api/views/route.ts", "utf-8");
    expect(content).toContain("export async function GET");
    expect(content).toContain("export async function POST");
  });
});
