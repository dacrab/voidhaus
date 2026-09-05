// Rate limiting behind a small store interface. Uses Upstash Redis REST
// (fixed-window INCR + EXPIRE NX) when UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN are set; otherwise falls back to an in-memory
// sliding window that is per serverless instance. Store errors fail open with
// a once-per-process warning.
const WINDOW_MS = 60_000;

export interface RateLimitStore {
  /** Record a hit and return the number of hits inside the current window. */
  hit(key: string): Promise<number>;
}

export class MemoryStore implements RateLimitStore {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly windowMs: number) {}

  async hit(key: string): Promise<number> {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    recent.push(now);
    this.hits.set(key, recent);
    return recent.length;
  }
}

interface UpstashCommandResult {
  result?: number | null;
  error?: string;
}

export class UpstashRestStore implements RateLimitStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly windowMs: number,
    private readonly doFetch: typeof fetch = fetch,
  ) {}

  async hit(key: string): Promise<number> {
    const seconds = Math.ceil(this.windowMs / 1000);
    const response = await this.doFetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      // EXPIRE NX gives the counter a TTL exactly once, so INCR+EXPIRE forms a
      // fixed window in a single round trip.
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, seconds, "NX"],
      ]),
    });
    if (!response.ok) {
      throw new Error(`Upstash REST responded ${response.status}`);
    }
    const results = (await response.json()) as UpstashCommandResult[];
    if (!Array.isArray(results) || typeof results[0]?.result !== "number") {
      throw new Error("Unexpected Upstash REST pipeline response");
    }
    return results[0].result;
  }
}

export function getStoreFromEnv(env: NodeJS.ProcessEnv = process.env): RateLimitStore {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
  return url && token ? new UpstashRestStore(url, token, WINDOW_MS) : new MemoryStore(WINDOW_MS);
}

let warnedStoreFailure = false;

async function check(store: RateLimitStore, key: string, max: number): Promise<boolean> {
  try {
    return (await store.hit(key)) <= max;
  } catch (err) {
    if (!warnedStoreFailure) {
      warnedStoreFailure = true;
      // biome-ignore lint/suspicious/noConsole: store outage warning belongs in server logs (once per process)
      console.warn("[rate-limit] store unavailable, failing open:", err);
    }
    return true;
  }
}

const store = getStoreFromEnv();

/** Testable seam: same policy as `limited` against an injected store. */
export function limitWithStore(store: RateLimitStore, key: string, max: number): Promise<boolean> {
  return check(store, key, max);
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  const parts = xff.split(",");
  return parts[parts.length - 1].trim();
}

export async function limited(request: Request, bucket: string, max: number): Promise<boolean> {
  return !(await check(store, `${bucket}:${clientIp(request)}`, max));
}
