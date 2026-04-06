import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

function createRedisClient(): Redis {
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    lazyConnect: true,
  });

  return client;
}

/** Primary Redis client for caching and pub/sub commands */
export const redis = createRedisClient();

/** Dedicated subscriber client (Redis requires separate connections for pub/sub) */
export const redisSub = createRedisClient();

// ─── Cache helpers ───────────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (value === null) return null;
  return JSON.parse(value) as T;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// ─── Pub/Sub helpers ─────────────────────────────────────────────────

export async function publish(
  channel: string,
  message: Record<string, unknown>,
): Promise<void> {
  await redis.publish(channel, JSON.stringify(message));
}

export async function subscribe(
  channel: string,
  handler: (message: Record<string, unknown>) => void,
): Promise<void> {
  await redisSub.subscribe(channel);
  redisSub.on("message", (ch, msg) => {
    if (ch === channel) {
      handler(JSON.parse(msg));
    }
  });
}

export async function unsubscribe(channel: string): Promise<void> {
  await redisSub.unsubscribe(channel);
}
