import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, getStoreFromEnv, limitWithStore, MemoryStore, UpstashRestStore } from "./rate-limit";

describe("MemoryStore", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts consecutive hits inside the window", async () => {
    const store = new MemoryStore();
    vi.setSystemTime(0);
    expect(await store.hit("k", 60_000)).toBe(1);
    expect(await store.hit("k", 60_000)).toBe(2);
    expect(await store.hit("k", 60_000)).toBe(3);
  });

  it("keeps keys independent", async () => {
    const store = new MemoryStore();
    vi.setSystemTime(0);
    await store.hit("a", 60_000);
    await store.hit("a", 60_000);
    expect(await store.hit("b", 60_000)).toBe(1);
  });

  it("drops hits once the window has passed", async () => {
    const store = new MemoryStore();
    vi.setSystemTime(0);
    await store.hit("k", 60_000);
    await store.hit("k", 60_000);
    vi.setSystemTime(61_000);
    expect(await store.hit("k", 60_000)).toBe(1);
  });
});

function upstashFetch(result: number) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify([{ result }, { result: 1 }]), { status: 200 }));
}

describe("UpstashRestStore", () => {
  it("sends an INCR+EXPIRE NX pipeline and returns the counter", async () => {
    const doFetch = upstashFetch(4);
    const store = new UpstashRestStore("https://example.upstash.io", "tok", doFetch as unknown as typeof fetch);
    const count = await store.hit("bucket:ip", 60_000);
    expect(count).toBe(4);
    const [url, init] = (doFetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://example.upstash.io/pipeline");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual([
      ["INCR", "bucket:ip"],
      ["EXPIRE", "bucket:ip", 60, "NX"],
    ]);
  });

  it("rounds the window up to whole seconds", async () => {
    const doFetch = upstashFetch(1);
    const store = new UpstashRestStore("https://example.upstash.io", "tok", doFetch as unknown as typeof fetch);
    await store.hit("k", 1500);
    const [, init] = (doFetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body)[1]).toEqual(["EXPIRE", "k", 2, "NX"]);
  });

  it("throws on non-OK responses so callers can fail open", async () => {
    const doFetch = vi.fn().mockResolvedValue(new Response("nope", { status: 401 }));
    const store = new UpstashRestStore("https://example.upstash.io", "tok", doFetch as unknown as typeof fetch);
    await expect(store.hit("k", 60_000)).rejects.toThrow("401");
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
    await expect(limitWithStore(failing, "k", 60_000, 5)).resolves.toBe(true);
    await expect(limitWithStore(failing, "k", 60_000, 5)).resolves.toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("denies when hits exceed max via the injected-store seam", async () => {
    const store = new MemoryStore();
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(await limitWithStore(store, "k", 60_000, 2));
    }
    expect(results).toEqual([true, true, false]);
    vi.useRealTimers();
  });
});
