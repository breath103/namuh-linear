import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: vi.fn(() => ({ type: "drizzle" })),
}));
vi.mock("@/lib/email", () => ({
  sendMagicLinkEmail: vi.fn(() => Promise.resolve()),
}));

let capturedConfig: Record<string, unknown> | null = null;

vi.mock("better-auth", () => ({
  betterAuth: vi.fn((config: Record<string, unknown>) => {
    capturedConfig = config;
    return {
      api: { getSession: vi.fn() },
      handler: vi.fn(),
    };
  }),
}));

vi.mock("better-auth/plugins", () => ({
  magicLink: vi.fn((opts) => ({ id: "magic-link", options: opts })),
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn(() => ({ GET: vi.fn(), POST: vi.fn() })),
}));

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signIn: { social: vi.fn(), magicLink: { request: vi.fn() } },
    signOut: vi.fn(),
    useSession: vi.fn(() => ({ data: null, isPending: true })),
  })),
}));

vi.mock("better-auth/client/plugins", () => ({
  magicLinkClient: vi.fn(() => ({ id: "magic-link-client" })),
}));

vi.stubEnv("AUTH_GOOGLE_ID", "test-google-id");
vi.stubEnv("AUTH_GOOGLE_SECRET", "test-google-secret");
vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3015");
vi.stubEnv("BETTER_AUTH_SECRET", "test-secret");
vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3015");
vi.stubEnv("DATABASE_URL", "postgresql://test@localhost/test");

describe("Auth configuration", () => {
  it("exports auth instance with Google provider configured", async () => {
    const { auth } = await import("@/lib/auth");
    expect(auth).toBeDefined();
    expect(capturedConfig).not.toBeNull();
    const social = capturedConfig?.socialProviders as Record<
      string,
      Record<string, string>
    >;
    expect(social?.google?.clientId).toBe("test-google-id");
  });

  it("disables email+password auth (passwordless only)", async () => {
    await import("@/lib/auth");
    const ep = capturedConfig?.emailAndPassword as Record<string, boolean>;
    expect(ep?.enabled).toBe(false);
  });

  it("configures magic link plugin with 10min expiry", async () => {
    await import("@/lib/auth");
    const plugins = capturedConfig?.plugins as Array<{
      id: string;
      options: { expiresIn: number };
    }>;
    expect(plugins).toBeDefined();
    const mlPlugin = plugins?.find((p) => p.id === "magic-link");
    expect(mlPlugin).toBeDefined();
    expect(mlPlugin?.options?.expiresIn).toBe(600);
  });

  it("magic link plugin has sendMagicLink function", async () => {
    await import("@/lib/auth");
    const plugins = capturedConfig?.plugins as Array<{
      id: string;
      options: { sendMagicLink: unknown };
    }>;
    const mlPlugin = plugins?.find((p) => p.id === "magic-link");
    expect(typeof mlPlugin?.options?.sendMagicLink).toBe("function");
  });

  it("uses drizzle adapter with pg provider", async () => {
    const { drizzleAdapter } = await import("better-auth/adapters/drizzle");
    await import("@/lib/auth");
    expect(drizzleAdapter).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ provider: "pg" }),
    );
  });

  it("enables session cookie caching", async () => {
    await import("@/lib/auth");
    const session = capturedConfig?.session as Record<
      string,
      Record<string, unknown>
    >;
    expect(session?.cookieCache?.enabled).toBe(true);
  });

  it("exports auth client with magic link support", async () => {
    const { authClient, signIn, signOut, useSession } = await import(
      "@/lib/auth-client"
    );
    expect(authClient).toBeDefined();
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(useSession).toBeDefined();
  });

  it("auth API route exports GET and POST handlers", async () => {
    const route = await import("@/app/api/auth/[...all]/route");
    expect(route.GET).toBeDefined();
    expect(route.POST).toBeDefined();
  });
});
