import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/settings/api",
}));

describe("ApiSettingsPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  async function renderPage() {
    const { default: ApiPage } = await import("@/app/(app)/settings/api/page");
    render(<ApiPage />);
  }

  it("renders page title 'API'", async () => {
    await renderPage();
    expect(screen.getByText("API")).toBeDefined();
  });

  it("renders GraphQL API description", async () => {
    await renderPage();
    expect(screen.getByText(/programmable interface/i)).toBeDefined();
  });

  it("renders Docs link", async () => {
    await renderPage();
    const docsLinks = screen.getAllByText(/Docs/);
    expect(docsLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'OAuth Applications' section", async () => {
    await renderPage();
    expect(screen.getByText("OAuth Applications")).toBeDefined();
  });

  it("renders 'New OAuth application' button", async () => {
    await renderPage();
    expect(screen.getByText("New OAuth application")).toBeDefined();
  });

  it("renders empty state for OAuth applications", async () => {
    await renderPage();
    expect(screen.getByText("No OAuth applications")).toBeDefined();
  });

  it("renders 'Webhooks' section with description", async () => {
    await renderPage();
    expect(screen.getByText("Webhooks")).toBeDefined();
    expect(
      screen.getByText(/receive HTTP requests when an entity/i),
    ).toBeDefined();
  });

  it("renders 'New webhook' button", async () => {
    await renderPage();
    expect(screen.getByText("New webhook")).toBeDefined();
  });

  it("renders empty state for webhooks", async () => {
    await renderPage();
    expect(screen.getByText("No webhooks")).toBeDefined();
  });

  it("renders 'Member API keys' section", async () => {
    await renderPage();
    expect(screen.getByText("Member API keys")).toBeDefined();
  });

  it("renders API key creation permission description", async () => {
    await renderPage();
    const matches = screen.getAllByText(/can create API keys/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'API key creation' permission selector", async () => {
    await renderPage();
    expect(screen.getByText("API key creation")).toBeDefined();
  });

  it("renders security & access settings link text", async () => {
    await renderPage();
    expect(screen.getByText(/security & access settings/i)).toBeDefined();
  });
});
