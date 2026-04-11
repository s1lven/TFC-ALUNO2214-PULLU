import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/scrape-collection/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchShopifyPublicJson } from "@/lib/scrape/shopify-public-json";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("@/lib/scrape/shopify-public-json", () => ({ fetchShopifyPublicJson: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockFetchShopifyJson = vi.mocked(fetchShopifyPublicJson);

const MOCK_USER = { id: "user-abc" };

function makeSupabase(user: typeof MOCK_USER | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/scrape-collection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const MOCK_COLLECTION = { id: 456, title: "Summer Collection", handle: "summer" };
const MOCK_PRODUCTS = [
  { id: 1, title: "Product A" },
  { id: 2, title: "Product B" },
];

describe("POST /api/scrape-collection", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when no authenticated user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/collections/summer" }) as never);

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/collections/summer" }) as never);

    expect(res.status).toBe(429);
  });

  it("returns 400 when url is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({}) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/url is required/i);
  });

  it("returns 400 when url is invalid", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ url: "not-a-url" }) as never);

    expect(res.status).toBe(400);
  });

  it("returns 400 when url points to private host (SSRF protection)", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ url: "http://10.0.0.1/collections/summer" }) as never);

    expect(res.status).toBe(400);
  });

  it("returns 400 when url has no valid collection handle", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    // /collections/products is special-cased by extractShopifyCollectionHandle → returns null
    const res = await POST(
      makeRequest({ url: "https://example.myshopify.com/collections/products" }) as never,
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/collection handle/i);
  });

  it("returns 404 when collection is not found", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFetchShopifyJson.mockResolvedValue({ collection: null });

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/collections/ghost" }) as never);

    expect(res.status).toBe(404);
  });

  it("returns collection with products on success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    // First call: collection metadata; second call: products page 1 (< 250 → no more pages)
    mockFetchShopifyJson
      .mockResolvedValueOnce({ collection: MOCK_COLLECTION })
      .mockResolvedValueOnce({ products: MOCK_PRODUCTS });

    const res = await POST(
      makeRequest({ url: "https://example.myshopify.com/collections/summer" }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Summer Collection");
    expect(body.products).toHaveLength(2);
    expect(body.productCount).toBe(2);
  });

  it("paginates until fewer than 250 products are returned", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const fullPage = Array.from({ length: 250 }, (_, i) => ({ id: i + 1, title: `Product ${i + 1}` }));
    const lastPage = [{ id: 251, title: "Product 251" }];

    mockFetchShopifyJson
      .mockResolvedValueOnce({ collection: MOCK_COLLECTION }) // collection metadata
      .mockResolvedValueOnce({ products: fullPage })           // page 1: full (250)
      .mockResolvedValueOnce({ products: lastPage });          // page 2: partial → stop

    const res = await POST(
      makeRequest({ url: "https://example.myshopify.com/collections/summer" }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.productCount).toBe(251);
  });

  it("returns 500 when Shopify collection fetch throws", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFetchShopifyJson.mockRejectedValue(new Error("Network error"));

    const res = await POST(
      makeRequest({ url: "https://example.myshopify.com/collections/summer" }) as never,
    );

    expect(res.status).toBe(500);
  });
});
