import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "@/app/api/user/openai-key/route";
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
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  };
}

function makeDeleteChain(result: { error: unknown }) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(result),
    }),
  };
}

function makeAdminForGet(row: { openai_key_last_four: string } | null, error: unknown = null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: row, error }),
    }),
  };
}

function makeAdminForUpsert(error: unknown = null) {
  return {
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error }),
    }),
  };
}

function makeAdminForDelete(error: unknown = null) {
  return {
    from: vi.fn().mockReturnValue(makeDeleteChain({ error })),
  };
}

function makePostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/user/openai-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/user/openai-key", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns configured=false when user has no key", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(makeAdminForGet(null) as never);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(false);
    expect(body.lastFour).toBeNull();
  });

  it("returns configured=true with lastFour when key exists", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(
      makeAdminForGet({ openai_key_last_four: "X4f9" }) as never,
    );

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(true);
    expect(body.lastFour).toBe("X4f9");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await GET();

    expect(res.status).toBe(429);
  });
});

describe("POST /api/user/openai-key", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await POST(makePostRequest({ apiKey: "sk-test" }));

    expect(res.status).toBe(401);
  });

  it("returns 400 when apiKey is empty", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makePostRequest({ apiKey: "" }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/required/i);
  });

  it("returns 400 when apiKey exceeds max length", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makePostRequest({ apiKey: "sk-" + "x".repeat(510) }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/too long/i);
  });

  it("saves the key and returns the last four characters", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(makeAdminForUpsert(null) as never);

    const res = await POST(makePostRequest({ apiKey: "sk-proj-abcd1234" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lastFour).toBe("1234");
  });

  it("returns 500 when upsert fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(
      makeAdminForUpsert({ message: "DB error" }) as never,
    );

    const res = await POST(makePostRequest({ apiKey: "sk-proj-test1234" }));

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/user/openai-key", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await DELETE();

    expect(res.status).toBe(401);
  });

  it("deletes the key and returns success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(makeAdminForDelete(null) as never);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("returns 500 when deletion fails", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCreateServiceClient.mockReturnValue(
      makeAdminForDelete({ message: "DB error" }) as never,
    );

    const res = await DELETE();

    expect(res.status).toBe(500);
  });
});
