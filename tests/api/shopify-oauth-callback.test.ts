import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/shopify/oauth/callback/route";
import { createClient } from "@/lib/supabase/server";
import * as oauth from "@/lib/shopify/oauth";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/shopify/oauth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/shopify/oauth")>();
  return {
    ...mod,
    verifyOAuthHmac: vi.fn(() => true),
    exchangeCodeForToken: vi.fn().mockResolvedValue({ access_token: "access_token_xxx" }),
  };
});

const mockCreateClient = vi.mocked(createClient);
const mockVerifyHmac = vi.mocked(oauth.verifyOAuthHmac);
const mockExchange = vi.mocked(oauth.exchangeCodeForToken);

const MOCK_USER = { id: "user-uuid" };
const STORE_ROW = {
  id: 7,
  user_id: MOCK_USER.id,
  shopify_store_url: "shop.myshopify.com",
  shopify_client_id: "cid",
  shopify_client_secret: "csecret",
  oauth_nonce: "abc123nonce",
  connection_status: "pending_oauth" as const,
};

function makeSupabase(
  opts: {
    user?: typeof MOCK_USER | null;
    store?: typeof STORE_ROW | null;
    updateError?: unknown;
  } = {},
) {
  const user = opts.user !== undefined ? opts.user : MOCK_USER;
  const store = opts.store !== undefined ? opts.store : STORE_ROW;
  const updateError = opts.updateError ?? null;

  let fromCall = 0;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockImplementation(() => {
      fromCall += 1;
      if (fromCall === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: store,
            error: store ? null : { message: "nf" },
          }),
        };
      }
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: updateError }),
          }),
        }),
      };
    }),
  };
}

function makeRequest(search: string) {
  return new NextRequest(`http://localhost/api/shopify/oauth/callback?${search}`, {
    headers: { host: "pullu.example.com" },
  });
}

describe("GET /api/shopify/oauth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyHmac.mockReturnValue(true);
    mockExchange.mockResolvedValue({ access_token: "access_token_xxx" });
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://pullu.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ shop: { name: "Nice Shop" } }),
      }),
    );
  });

  it("redirects with error when params missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await GET(makeRequest("shop=shop.myshopify.com"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("shopify_error=missing_params");
  });

  it("redirects when shop hostname invalid", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await GET(makeRequest("code=c1&shop=evil.com&state=7:nonce"));
    expect(res.headers.get("location")).toContain("invalid_shop");
  });

  it("redirects when state format invalid", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=bad"));
    expect(res.headers.get("location")).toContain("invalid_state");
  });

  it("redirects when store not found", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ store: null }) as never);
    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=7:abc123nonce"));
    expect(res.headers.get("location")).toContain("store_not_found");
  });

  it("redirects when user session does not match store owner", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ user: { id: "other" } }) as never,
    );
    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=7:abc123nonce"));
    expect(res.headers.get("location")).toContain("session");
  });

  it("redirects when shop mismatch", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await GET(makeRequest("code=c1&shop=other.myshopify.com&state=7:abc123nonce"));
    expect(res.headers.get("location")).toContain("shop_mismatch");
  });

  it("redirects when nonce invalid", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=7:wrongnonce"));
    expect(res.headers.get("location")).toContain("invalid_session");
  });

  it("redirects when HMAC invalid", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);
    mockVerifyHmac.mockReturnValue(false);
    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=7:abc123nonce"));
    expect(res.headers.get("location")).toContain("invalid_hmac");
  });

  it("redirects with success when token saved", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase() as never);

    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=7:abc123nonce"));

    expect(res.headers.get("location")).toContain("shopify_connected=1");
    expect(mockExchange).toHaveBeenCalled();
  });

  it("redirects when DB update fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ updateError: { message: "fail" } }) as never,
    );

    const res = await GET(makeRequest("code=c1&shop=shop.myshopify.com&state=7:abc123nonce"));

    expect(res.headers.get("location")).toContain("db_error");
  });
});
