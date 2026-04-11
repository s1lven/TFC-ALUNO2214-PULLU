import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/scrape-product/route";
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
  return new Request("http://localhost/api/scrape-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const MOCK_PRODUCT = { id: 123, title: "Test Product", handle: "test-product" };

describe("POST /api/scrape-product", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when no authenticated user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/products/shirt" }) as never);

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/products/shirt" }) as never);

    expect(res.status).toBe(429);
  });

  it("returns 400 when url is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({}) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/url is required/i);
  });

  it("returns 400 when url is not a valid URL", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ url: "not-a-url" }) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid url/i);
  });

  it("returns 400 when url points to a private/local host (SSRF protection)", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ url: "http://localhost/products/shirt" }) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not allowed/i);
  });

  it("returns 400 when url points to an internal IP (SSRF protection)", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ url: "http://192.168.1.1/products/shirt" }) as never);

    expect(res.status).toBe(400);
  });

  it("returns 400 when url has no product handle (root path)", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    // A URL with only the root path has no segments → extractShopifyProductHandle returns null
    const res = await POST(makeRequest({ url: "https://example.myshopify.com/" }) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/product handle/i);
  });

  it("returns 404 when product is not found on the remote store", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFetchShopifyJson.mockResolvedValue({ product: null });

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/products/ghost" }) as never);

    expect(res.status).toBe(404);
  });

  it("returns product data on success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFetchShopifyJson.mockResolvedValue({ product: MOCK_PRODUCT });

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/products/shirt" }) as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Test Product");
    expect(body.handle).toBe("test-product");
  });

  it("preserves locale prefix when present in URL", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFetchShopifyJson.mockResolvedValue({ product: MOCK_PRODUCT });

    const res = await POST(
      makeRequest({ url: "https://example.myshopify.com/en-au/products/shirt" }) as never,
    );

    expect(res.status).toBe(200);
    // locale is passed to the json URL — verify the fetch was called with en-au in path
    expect(mockFetchShopifyJson).toHaveBeenCalledWith(
      expect.stringContaining("en-au"),
      expect.any(String),
    );
  });

  it("returns 500 when Shopify fetch throws", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFetchShopifyJson.mockRejectedValue(new Error("Network error"));

    const res = await POST(makeRequest({ url: "https://example.myshopify.com/products/shirt" }) as never);

    expect(res.status).toBe(500);
  });
});
