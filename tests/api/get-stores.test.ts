import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/get-stores/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-abc" };

function makeDbChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
  };
}

function makeSupabase(
  user: typeof MOCK_USER | null,
  storesResult: { data: unknown; error: unknown } = { data: [], error: null },
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockReturnValue(makeDbChain(storesResult)),
  };
}

describe("GET /api/get-stores", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when no authenticated user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await GET();

    expect(res.status).toBe(401);
    expect((await res.json()).error).toBeDefined();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await GET();

    expect(res.status).toBe(429);
  });

  it("returns stores array for authenticated user", async () => {
    const stores = [
      { id: 1, store_name: "My Store", shopify_store_url: "mystore.myshopify.com", connection_status: "connected" },
    ];
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, { data: stores, error: null }) as never,
    );

    const res = await GET();

    expect(res.status).toBe(200);
    expect((await res.json()).stores).toEqual(stores);
  });

  it("returns empty array when user has no stores", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, { data: [], error: null }) as never,
    );

    const res = await GET();

    expect(res.status).toBe(200);
    expect((await res.json()).stores).toEqual([]);
  });

  it("returns 500 when database query fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase(MOCK_USER, { data: null, error: { message: "DB error" } }) as never,
    );

    const res = await GET();

    expect(res.status).toBe(500);
  });
});
