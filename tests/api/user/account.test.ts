import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/user/account/route";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCreateServiceClient = vi.mocked(createServiceClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-abc" };

function makeSupabase(user: typeof MOCK_USER | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: user ? null : new Error() }),
    },
  };
}

function makeDeleteChain(error: unknown = null) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error }),
    }),
  };
}

function makeAdminClient({
  openaiError = null,
  storesError = null,
  authError = null,
}: {
  openaiError?: unknown;
  storesError?: unknown;
  authError?: unknown;
} = {}) {
  const openaiChain = makeDeleteChain(openaiError);
  const storesChain = makeDeleteChain(storesError);

  return {
    from: vi
      .fn()
      .mockReturnValueOnce(openaiChain)   // first call: user_ai_credentials
      .mockReturnValueOnce(storesChain),  // second call: shopify_stores
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: authError }),
      },
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/user/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("DELETE /api/user/account", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await DELETE(makeRequest({ confirmation: "delete" }));

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await DELETE(makeRequest({ confirmation: "delete" }));

    expect(res.status).toBe(429);
  });

  it("returns 400 when confirmation word is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await DELETE(makeRequest({}));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/delete/i);
  });

  it("returns 400 when confirmation word is wrong", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await DELETE(makeRequest({ confirmation: "yes" }));

    expect(res.status).toBe(400);
  });

  it("deletes all user data and returns success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(makeAdminClient() as never);

    const res = await DELETE(makeRequest({ confirmation: "delete" }));

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("deletes in correct order: openai creds → stores → auth user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    const admin = makeAdminClient();
    mockCreateServiceClient.mockReturnValue(admin as never);

    await DELETE(makeRequest({ confirmation: "delete" }));

    const [firstCall, secondCall] = admin.from.mock.calls;
    expect(firstCall[0]).toBe("user_ai_credentials");
    expect(secondCall[0]).toBe("shopify_stores");
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith(MOCK_USER.id);
  });

  it("returns 500 when openai creds deletion fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(
      makeAdminClient({ openaiError: { message: "DB error" } }) as never,
    );

    const res = await DELETE(makeRequest({ confirmation: "delete" }));

    expect(res.status).toBe(500);
  });

  it("returns 500 when stores deletion fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(
      makeAdminClient({ storesError: { message: "DB error" } }) as never,
    );

    const res = await DELETE(makeRequest({ confirmation: "delete" }));

    expect(res.status).toBe(500);
  });

  it("returns 500 when auth user deletion fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(
      makeAdminClient({ authError: { message: "Auth error" } }) as never,
    );

    const res = await DELETE(makeRequest({ confirmation: "delete" }));

    expect(res.status).toBe(500);
  });
});
