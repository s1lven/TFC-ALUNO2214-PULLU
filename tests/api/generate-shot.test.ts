import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/generate-shot/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-1" };

function makeSupabase(user: typeof MOCK_USER | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  };
}

function req(body: Record<string, unknown>) {
  return new Request("http://localhost/api/generate-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate-shot", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
    vi.stubEnv("FAL_API_KEY", "fal_test_key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);
    const res = await POST(req({ productImages: ["data:image/jpeg;base64,abc"] }) as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when productImages empty", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    const res = await POST(req({ productImages: [] }) as never);
    expect(res.status).toBe(400);
  });

  it("returns 500 when FAL_API_KEY missing", async () => {
    vi.unstubAllEnvs();
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    const res = await POST(req({ productImages: ["data:image/jpeg;base64,abc"] }) as never);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/fal api key/i);
  });

  it("returns images when FAL succeeds", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            request_id: "r1",
            images: [{ url: "https://cdn.example.com/out.jpg" }],
            description: "done",
          }),
      }),
    );

    const res = await POST(
      req({
        productImages: ["data:image/jpeg;base64,abc"],
        description: "Studio shot",
        style: "Minimal",
        aspectRatio: "1:1",
        numImages: 1,
      }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.images).toHaveLength(1);
    expect(body.requestId).toBe("r1");
  });

  it("returns 500 when FAL HTTP not ok", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve("error"),
      }),
    );

    const res = await POST(req({ productImages: ["data:image/jpeg;base64,x"] }) as never);
    expect(res.status).toBe(500);
  });
});
