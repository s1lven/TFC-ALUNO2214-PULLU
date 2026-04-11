import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/get-collections/route";
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
        error: store ? null : { message: "not found" },
      }),
    }),
  };
}

function req(body: Record<string, unknown>) {
  return new Request("http://localhost/api/get-collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/get-collections", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null, null) as never);
    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when storeId is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);
    const res = await POST(req({}) as never);
    expect(res.status).toBe(400);
  });

  it("returns 404 when store not found", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, null) as never);
    const res = await POST(req({ storeId: 99 }) as never);
    expect(res.status).toBe(404);
  });

  it("returns 400 when store not connected", async () => {
    const pending = {
      ...MOCK_STORE,
      connection_status: "pending_oauth" as const,
      shopify_token: null,
    };
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, pending as never) as never);
    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(400);
  });

  it("merges custom and smart collections on success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("custom_collections")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                custom_collections: [{ id: 1, title: "A" }],
              }),
          });
        }
        if (url.includes("smart_collections")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                smart_collections: [{ id: 2, title: "B" }],
              }),
          });
        }
        return Promise.resolve({ ok: false, text: () => Promise.resolve("") });
      }),
    );

    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.collections).toHaveLength(2);
  });

  it("returns error status when custom_collections request fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      }),
    );

    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(403);
  });
});
