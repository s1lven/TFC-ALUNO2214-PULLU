import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/add-collection-to-shopify/route";
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
  return new Request("http://localhost/api/add-collection-to-shopify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/add-collection-to-shopify", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 400 when storeId missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);
    const res = await POST(req({ collectionOnly: true, title: "New" }) as never);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null, MOCK_STORE) as never);
    const res = await POST(
      req({ storeId: 1, collectionOnly: true, title: "New" }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when store not found", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, null) as never);
    const res = await POST(
      req({ storeId: 1, collectionOnly: true, title: "New" }) as never,
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when store not connected", async () => {
    const pending = { ...MOCK_STORE, connection_status: "pending_oauth" as const, shopify_token: null };
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, pending as never) as never);
    const res = await POST(
      req({ storeId: 1, collectionOnly: true, title: "New" }) as never,
    );
    expect(res.status).toBe(400);
  });

  it("creates collection when collectionOnly and GraphQL succeeds", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              collectionCreate: {
                collection: {
                  id: "gid://shopify/Collection/99",
                  title: "Summer",
                  handle: "summer",
                  legacyResourceId: "99",
                },
                userErrors: [],
              },
            },
          }),
      }),
    );

    const res = await POST(
      req({
        storeId: 1,
        collectionOnly: true,
        title: "Summer",
        handle: "summer",
        body_html: "<p>Hi</p>",
      }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.collection.title).toBe("Summer");
    expect(Number(body.collection.id)).toBe(99);
  });

  it("returns 400 for batch import placeholder", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);
    const res = await POST(req({ storeId: 1, title: "Only title" }) as never);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/batch import/i);
  });
});
