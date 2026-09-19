import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, getStoreFromEnv, limitWithStore, MemoryStore, UpstashRestStore } from "./rate-limit";

const WINDOW_MS = 60_000;

describe("MemoryStore", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts consecutive hits inside the window", async () => {
    const store = new MemoryStore(WINDOW_MS);
    vi.setSystemTime(0);
    expect(await store.hit("k")).toBe(1);
    expect(await store.hit("k")).toBe(2);
    expect(await store.hit("k")).toBe(3);
  });

  it("keeps keys independent", async () => {
    const store = new MemoryStore(WINDOW_MS);
    vi.setSystemTime(0);
    await store.hit("a");
    await store.hit("a");
    expect(await store.hit("b")).toBe(1);
  });

  it("drops hits once the window has passed", async () => {
    const store = new MemoryStore(WINDOW_MS);
    vi.setSystemTime(0);
    await store.hit("k");
    await store.hit("k");
    vi.setSystemTime(61_000);
    expect(await store.hit("k")).toBe(1);
  });
});

function upstashFetch(result: number) {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify([{ result }, { result: 1 }]), { status: 200 }));
}

describe("UpstashRestStore", () => {
  it("sends an INCR+EXPIRE NX pipeline and returns the counter", async () => {
    const doFetch = upstashFetch(4);
    const store = new UpstashRestStore("https://example.upstash.io", "tok", WINDOW_MS, doFetch);
    const count = await store.hit("bucket:ip");
    expect(count).toBe(4);
    const [url, init] = doFetch.mock.calls[0] ?? [];
    expect(url).toBe("https://example.upstash.io/pipeline");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer tok");
    expect(JSON.parse(String(init?.body))).toEqual([
      ["INCR", "bucket:ip"],
      ["EXPIRE", "bucket:ip", 60, "NX"],
    ]);
  });

  it("rounds the window up to whole seconds", async () => {
    const doFetch = upstashFetch(1);
    const store = new UpstashRestStore("https://example.upstash.io", "tok", 1500, doFetch);
    await store.hit("k");
    const [, init] = doFetch.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body))[1]).toEqual(["EXPIRE", "k", 2, "NX"]);
  });

  it("throws on non-OK responses so callers can fail open", async () => {
    const doFetch = vi.fn<typeof fetch>(async () => new Response("nope", { status: 401 }));
    const store = new UpstashRestStore("https://example.upstash.io", "tok", WINDOW_MS, doFetch);
    await expect(store.hit("k")).rejects.toThrow("401");
  });
});

describe("store selection and failure handling", () => {
  it("selects memory when Upstash env is absent or partial", () => {
    expect(getStoreFromEnv({})).toBeInstanceOf(MemoryStore);
    expect(getStoreFromEnv({ UPSTASH_REDIS_REST_URL: "https://x" })).toBeInstanceOf(MemoryStore);
  });

  it("selects Upstash when both env vars are present", () => {
    expect(getStoreFromEnv({ UPSTASH_REDIS_REST_URL: "https://x", UPSTASH_REDIS_REST_TOKEN: "t" })).toBeInstanceOf(
      UpstashRestStore,
    );
  });

  it("clientIp uses the last XFF entry and falls back to unknown", () => {
    expect(clientIp(new Request("https://x", { headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" } }))).toBe("2.2.2.2");
    expect(clientIp(new Request("https://x"))).toBe("unknown");
  });

  it("fails open with a single warning when the store keeps failing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failing: import("./rate-limit").RateLimitStore = {
      hit: () => Promise.reject(new Error("down")),
    };
    await expect(limitWithStore(failing, "k", 5)).resolves.toBe(true);
    await expect(limitWithStore(failing, "k", 5)).resolves.toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("denies when hits exceed max via the injected-store seam", async () => {
    const store = new MemoryStore(WINDOW_MS);
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(await limitWithStore(store, "k", 2));
    }
    expect(results).toEqual([true, true, false]);
    vi.useRealTimers();
  });
});
