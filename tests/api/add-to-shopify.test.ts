import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/add-to-shopify/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-abc" };

const MOCK_STORE = {
  id: 1,
  user_id: MOCK_USER.id,
  shopify_store_url: "mystore.myshopify.com",
  shopify_token: "shpat_test_token",
  connection_status: "connected",
};

const MINIMAL_PRODUCT_BODY = {
  storeId: 1,
  title: "Test Shirt",
  handle: "test-shirt",
  body_html: "<p>Great shirt</p>",
  vendor: "Acme",
  images: [{ src: "https://cdn.shopify.com/shirt.jpg", alt: "Test Shirt" }],
  options: [],
  variants: [{ price: "29.99", sku: "SHIRT-01" }],
  taxable: true,
  trackQuantity: false,
  status: "active",
  published: true,
};

function makeDbChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };
}

function makeSupabase(
  user: typeof MOCK_USER | null,
  storeResult: { data: unknown; error: unknown } = { data: MOCK_STORE, error: null },
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockReturnValue(makeDbChain(storeResult)),
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/add-to-shopify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const MOCK_SHOPIFY_PRODUCT = {
  id: 9876543,
  title: "Test Shirt",
  handle: "test-shirt",
  variants: [{ id: 111, price: "29.99" }],
  images: [{ id: 222, src: "https://cdn.shopify.com/shirt.jpg" }],
};

function mockShopifySuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ product: MOCK_SHOPIFY_PRODUCT }),
    }),
  );
}

describe("POST /api/add-to-shopify", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 400 when storeId is missing", async () => {
    const body = { ...MINIMAL_PRODUCT_BODY };
    delete (body as Record<string, unknown>).storeId;

    const res = await POST(makeRequest(body) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/store id/i);
  });

  it("returns 401 when no authenticated user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(429);
  });

  it("returns 404 when store is not found for this user", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, { data: null, error: { message: "Not found" } }) as never,
    );

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(404);
  });

  it("returns 400 when store is not connected (pending_oauth)", async () => {
    const pendingStore = { ...MOCK_STORE, connection_status: "pending_oauth" };
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, { data: pendingStore, error: null }) as never,
    );

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not connected/i);
  });

  it("returns 400 when store has no token", async () => {
    const noTokenStore = { ...MOCK_STORE, shopify_token: null };
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, { data: noTokenStore, error: null }) as never,
    );

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(400);
  });

  it("creates product on Shopify and returns it", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockShopifySuccess();

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.product.id).toBe(9876543);
    expect(body.product.title).toBe("Test Shirt");
  });

  it("sends correct Shopify access token header", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    let capturedHeaders: Record<string, string> = {};
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
        capturedHeaders = opts.headers as Record<string, string>;
        return {
          ok: true,
          json: () => Promise.resolve({ product: MOCK_SHOPIFY_PRODUCT }),
        };
      }),
    );

    await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(capturedHeaders["X-Shopify-Access-Token"]).toBe("shpat_test_token");
  });

  it("maps options and variants correctly when options are present", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    let capturedBody = "";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
        capturedBody = opts.body as string;
        return {
          ok: true,
          json: () => Promise.resolve({ product: MOCK_SHOPIFY_PRODUCT }),
        };
      }),
    );

    await POST(
      makeRequest({
        ...MINIMAL_PRODUCT_BODY,
        options: [{ name: "Size", values: ["S", "M", "L"] }],
        variants: [
          { price: "19.99", option1: "S", sku: "SHIRT-S" },
          { price: "19.99", option1: "M", sku: "SHIRT-M" },
        ],
      }) as never,
    );

    const parsed = JSON.parse(capturedBody);
    expect(parsed.product.options).toHaveLength(1);
    expect(parsed.product.options[0].name).toBe("Size");
    expect(parsed.product.variants).toHaveLength(2);
    expect(parsed.product.variants[0].option1).toBe("S");
  });

  it("returns error from Shopify API when request fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: () => Promise.resolve('{"errors": "Handle has already been taken"}'),
      }),
    );

    const res = await POST(makeRequest(MINIMAL_PRODUCT_BODY) as never);

    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/shopify api error/i);
  });
});
