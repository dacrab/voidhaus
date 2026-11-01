// Rate limiting behind a small store interface. Upstash Redis REST is used when
// configured; otherwise an in-memory window is kept per serverless instance.
// Store failures fail open with a once-per-process warning.
const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitStore {
  /** Record a hit and return the number of hits inside the current window. */
  hit(key: string): Promise<number>;
}

export class MemoryStore implements RateLimitStore {
  readonly #hits = new Map<string, number[]>();

  constructor(private readonly windowMs: number) {}

  async hit(key: string): Promise<number> {
    const now = Date.now();
    const recent = (this.#hits.get(key) ?? []).filter((time) => now - time < this.windowMs);
    recent.push(now);
    this.#hits.set(key, recent);
    if (this.#hits.size > MAX_TRACKED_KEYS) this.#prune(now);
    return recent.length;
  }

  #prune(now: number): void {
    for (const [key, times] of this.#hits) {
      if (times.some((time) => now - time < this.windowMs)) continue;
      this.#hits.delete(key);
    }
  }
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
      // INCR + EXPIRE NX forms a fixed window in a single round trip.
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, seconds, "NX"],
      ]),
    });
    if (!response.ok) throw new Error(`Upstash REST responded ${response.status}`);

    const results: unknown = await response.json();
    const first: unknown = Array.isArray(results) ? results[0] : undefined;
    if (typeof first !== "object" || first === null || !("result" in first) || typeof first.result !== "number") {
      throw new Error("Unexpected Upstash REST pipeline response");
    }
    return first.result;
  }
}

export function getStoreFromEnv(env: NodeJS.ProcessEnv = process.env): RateLimitStore {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
  return url && token ? new UpstashRestStore(url, token, WINDOW_MS) : new MemoryStore(WINDOW_MS);
}

let warnedStoreFailure = false;

async function withinLimit(store: RateLimitStore, key: string, max: number): Promise<boolean> {
  try {
    return (await store.hit(key)) <= max;
  } catch (error) {
    if (!warnedStoreFailure) {
      warnedStoreFailure = true;
      // biome-ignore lint/suspicious/noConsole: store outage warning belongs in server logs
      console.warn("[rate-limit] store unavailable, failing open:", error);
    }
    return true;
  }
}

const store = getStoreFromEnv();

/** Testable seam: same policy as `isRateLimited` against an injected store. */
export function limitWithStore(store: RateLimitStore, key: string, max: number): Promise<boolean> {
  return withinLimit(store, key, max);
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return "unknown";
  const parts = forwardedFor.split(",");
  return parts[parts.length - 1]?.trim() ?? "unknown";
}

export async function isRateLimited(request: Request, bucket: string, max: number): Promise<boolean> {
  return !(await withinLimit(store, `${bucket}:${clientIp(request)}`, max));
}
