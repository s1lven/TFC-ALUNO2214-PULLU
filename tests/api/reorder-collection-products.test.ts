import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/reorder-collection-products/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-1" };
const MOCK_STORE = {
  id: 1,
  user_id: MOCK_USER.id,
  shopify_store_url: "shop.myshopify.com",
  shopify_token: "tok",
  connection_status: "connected" as const,
};

function makeSupabase(user: typeof MOCK_USER | null, store: typeof MOCK_STORE | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: store,
        error: store ? null : { message: "nf" },
      }),
    }),
  };
}

function req(body: Record<string, unknown>) {
  return new Request("http://localhost/api/reorder-collection-products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function graphqlResponse(data: Record<string, unknown>) {
  return {
    ok: true,
    json: () => Promise.resolve({ data }),
  };
}

describe("POST /api/reorder-collection-products", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 400 when fields missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);
    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null, MOCK_STORE) as never);
    const res = await POST(
      req({
        storeId: 1,
        collectionGid: "gid://shopify/Collection/1",
        productIds: ["gid://shopify/Product/1"],
      }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when store not found", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, null) as never);
    const res = await POST(
      req({
        storeId: 1,
        collectionGid: "gid://shopify/Collection/1",
        productIds: ["gid://shopify/Product/1"],
      }) as never,
    );
    expect(res.status).toBe(404);
  });

  it("returns success when GraphQL reorder succeeds", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);

    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        call += 1;
        if (call === 1) {
          return Promise.resolve(
            graphqlResponse({
              collectionUpdate: {
                collection: { id: "gid://shopify/Collection/1", sortOrder: "MANUAL" },
                userErrors: [],
              },
            }),
          );
        }
        return Promise.resolve(
          graphqlResponse({
            collectionReorderProducts: {
              job: { id: "j1", done: true },
              userErrors: [],
            },
          }),
        );
      }),
    );

    const res = await POST(
      req({
        storeId: 1,
        collectionGid: "gid://shopify/Collection/1",
        productIds: ["gid://shopify/Product/2", "gid://shopify/Product/1"],
      }) as never,
    );

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("returns 400 when Shopify returns userErrors", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);

    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        call += 1;
        if (call === 1) {
          return Promise.resolve(
            graphqlResponse({
              collectionUpdate: {
                collection: { id: "1", sortOrder: "MANUAL" },
                userErrors: [],
              },
            }),
          );
        }
        return Promise.resolve(
          graphqlResponse({
            collectionReorderProducts: {
              job: null,
              userErrors: [{ field: "id", message: "bad" }],
            },
          }),
        );
      }),
    );

    const res = await POST(
      req({
        storeId: 1,
        collectionGid: "gid://shopify/Collection/1",
        productIds: ["gid://shopify/Product/1"],
      }) as never,
    );

    expect(res.status).toBe(400);
  });
});
