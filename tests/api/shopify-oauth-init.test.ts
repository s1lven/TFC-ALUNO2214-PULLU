import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/shopify/oauth/init/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-1" };

function makeSupabase(insertError: unknown = null) {
  let fromCall = 0;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }),
    },
    from: vi.fn().mockImplementation(() => {
      fromCall += 1;
      if (fromCall === 1) {
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: insertError ? null : { id: 42 },
              error: insertError,
            }),
          }),
        }),
      };
    }),
  };
}

function req(body: Record<string, unknown>) {
  return new Request("http://localhost/api/shopify/oauth/init", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "pullu.example.com" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/shopify/oauth/init", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://pullu.example.com");
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as never);

    const res = await POST(
      req({
        shop_subdomain: "mystore",
        store_alias: "Main",
        client_id: "cid",
        client_secret: "sec",
      }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await POST(req({ shop_subdomain: "x" }) as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid shop domain", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await POST(
      req({
        shop_subdomain: "!!!",
        store_alias: "Main",
        client_id: "cid",
        client_secret: "sec",
      }) as never,
    );
    expect(res.status).toBe(400);
  });

  it("returns authorizationUrl and storeId on success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);

    const res = await POST(
      req({
        shop_subdomain: "cool-store",
        store_alias: "Cool",
        client_id: "abc123",
        client_secret: "secret",
      }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.storeId).toBe(42);
    expect(body.authorizationUrl).toContain("cool-store.myshopify.com");
    expect(body.authorizationUrl).toContain("client_id=abc123");
  });

  it("returns 500 when insert fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ message: "db" }) as never);

    const res = await POST(
      req({
        shop_subdomain: "cool-store",
        store_alias: "Cool",
        client_id: "abc123",
        client_secret: "secret",
      }) as never,
    );

    expect(res.status).toBe(500);
  });
});
