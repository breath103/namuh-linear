import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock ioredis before importing the module
vi.mock("ioredis", () => {
  const store = new Map<string, string>();

  const RedisMock = vi.fn().mockImplementation(() => ({
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: vi.fn((key: string, value: string, _mode?: string, _ttl?: number) => {
      store.set(key, value);
      return Promise.resolve("OK");
    }),
    del: vi.fn((...keys: string[]) => {
      let count = 0;
      for (const key of keys) {
        if (store.delete(key)) count++;
      }
      return Promise.resolve(count);
    }),
    keys: vi.fn((pattern: string) => {
      const prefix = pattern.replace("*", "");
      const matched = [...store.keys()].filter((k) => k.startsWith(prefix));
      return Promise.resolve(matched);
    }),
    publish: vi.fn(() => Promise.resolve(1)),
    subscribe: vi.fn(() => Promise.resolve()),
    unsubscribe: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(() => Promise.resolve()),
    _store: store,
  }));

  return { default: RedisMock };
});

// Set env before importing module
vi.stubEnv("REDIS_URL", "redis://localhost:6379");

describe("Redis utilities", () => {
  let redisModule: typeof import("@/lib/redis");

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    redisModule = await import("@/lib/redis");
  });

  it("exports redis and redisSub clients", () => {
    expect(redisModule.redis).toBeDefined();
    expect(redisModule.redisSub).toBeDefined();
    expect(redisModule.redis).not.toBe(redisModule.redisSub);
  });

  it("cacheSet stores JSON and cacheGet retrieves it", async () => {
    const data = { name: "test-workspace", id: "ws-123" };
    await redisModule.cacheSet("workspace:ws-123", data, 60);
    const result = await redisModule.cacheGet<typeof data>("workspace:ws-123");
    expect(result).toEqual(data);
  });

  it("cacheGet returns null for missing keys", async () => {
    const result = await redisModule.cacheGet("nonexistent");
    expect(result).toBeNull();
  });

  it("cacheDel removes a key", async () => {
    await redisModule.cacheSet("temp", { value: 1 });
    await redisModule.cacheDel("temp");
    const result = await redisModule.cacheGet("temp");
    expect(result).toBeNull();
  });

  it("cacheDelPattern removes matching keys", async () => {
    await redisModule.cacheSet("team:1", { id: "1" });
    await redisModule.cacheSet("team:2", { id: "2" });
    await redisModule.cacheDelPattern("team:*");
    expect(await redisModule.cacheGet("team:1")).toBeNull();
    expect(await redisModule.cacheGet("team:2")).toBeNull();
  });

  it("publish sends JSON to a channel", async () => {
    await redisModule.publish("updates", { type: "issue_created", id: "1" });
    expect(redisModule.redis.publish).toHaveBeenCalledWith(
      "updates",
      JSON.stringify({ type: "issue_created", id: "1" }),
    );
  });

  it("subscribe registers on the subscriber client", async () => {
    const handler = vi.fn();
    await redisModule.subscribe("updates", handler);
    expect(redisModule.redisSub.subscribe).toHaveBeenCalledWith("updates");
    expect(redisModule.redisSub.on).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });

  it("unsubscribe removes subscription", async () => {
    await redisModule.unsubscribe("updates");
    expect(redisModule.redisSub.unsubscribe).toHaveBeenCalledWith("updates");
  });
});
