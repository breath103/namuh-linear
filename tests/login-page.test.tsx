import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    social: vi.fn(),
    magicLink: vi.fn(() => Promise.resolve()),
  },
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, isPending: false })),
  authClient: {},
}));

import { signIn } from "@/lib/auth-client";
import LoginPage from "@/app/(auth)/login/page";

describe("Login page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the login title", () => {
    render(<LoginPage />);
    expect(screen.getByText("Log in to Linear")).toBeDefined();
  });

  it("shows Continue with Google button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });

  it("shows Continue with Email button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Continue with Email")).toBeDefined();
  });

  it("calls signIn.social with google provider on Google click", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Continue with Google"));
    expect(signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });

  it("shows email input after clicking Continue with Email", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Continue with Email"));
    expect(
      screen.getByPlaceholderText("Enter your email address..."),
    ).toBeDefined();
  });

  it("shows back button in email step", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Continue with Email"));
    expect(screen.getByText("Back to login options")).toBeDefined();
  });

  it("returns to choose step when clicking back", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Continue with Email"));
    fireEvent.click(screen.getByText("Back to login options"));
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });

  it("shows email-sent step after submitting email", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Continue with Email"));

    const input = screen.getByPlaceholderText("Enter your email address...");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    const form = input.closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.getByText("Check your email")).toBeDefined();
    });

    expect(signIn.magicLink).toHaveBeenCalledWith({
      email: "test@example.com",
      callbackURL: "/",
    });
  });

  it("shows footer with terms text", () => {
    render(<LoginPage />);
    expect(
      screen.getByText(/Terms of Service and Privacy Policy/),
    ).toBeDefined();
  });
});
