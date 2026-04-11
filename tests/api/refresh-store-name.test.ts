import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/refresh-store-name/route";
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
  shopify_store_url: "cool.myshopify.com",
  shopify_token: "tok",
  connection_status: "connected" as const,
};

function makeSupabase(
  user: typeof MOCK_USER | null,
  store: typeof MOCK_STORE | null,
  opts?: { updateError?: unknown; updatedStoreName?: string },
) {
  let call = 0;
  const updateError = opts?.updateError ?? null;
  const updatedStoreName = opts?.updatedStoreName ?? "Cool Shop";
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: store,
            error: store ? null : { message: "nf" },
          }),
        };
      }
      const singleResult = {
        data: { ...MOCK_STORE, store_name: updatedStoreName },
        error: updateError,
      };
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(singleResult),
              }),
            }),
          }),
        }),
      };
    }),
  };
}

function req(body: Record<string, unknown>) {
  return new Request("http://localhost/api/refresh-store-name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/refresh-store-name", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null, null) as never);
    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when storeId missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, MOCK_STORE) as never);
    const res = await POST(req({}) as never);
    expect(res.status).toBe(400);
  });

  it("returns 404 when store not found", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER, null) as never);
    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(404);
  });

  it("updates store_name from shop.json when Shopify returns name", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, MOCK_STORE, { updatedStoreName: "My Real Name" }) as never,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shop: { name: "My Real Name" } }),
      }),
    );

    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.store.store_name).toBe("My Real Name");
  });

  it("falls back to subdomain when shop.json fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, MOCK_STORE, { updatedStoreName: "cool" }) as never,
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.store.store_name).toBe("cool");
  });

  it("returns 500 when DB update fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, MOCK_STORE, { updateError: { message: "db" } }) as never,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ shop: { name: "X" } }) }),
    );

    const res = await POST(req({ storeId: 1 }) as never);
    expect(res.status).toBe(500);
  });
});
