import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/translate/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveOpenAiApiKeyForUser } from "@/lib/openai/user-api-key";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("@/lib/openai/user-api-key", () => ({ resolveOpenAiApiKeyForUser: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockResolveKey = vi.mocked(resolveOpenAiApiKeyForUser);

const MOCK_USER = { id: "user-abc" };

function makeSupabase(user: typeof MOCK_USER | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const MOCK_PRODUCT_DATA = {
  title: "Blue T-Shirt",
  description: "<p>A comfortable shirt.</p>",
  options: [{ name: "Color", values: ["Blue", "Red"] }],
};

const MOCK_TRANSLATED = {
  title: "Camiseta Azul",
  description: "<p>Uma camisa confortável.</p>",
  options: [{ name: "Cor", values: ["Azul", "Vermelho"] }],
};

function mockOpenAISuccess(payload: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify(payload) } }],
        }),
    }),
  );
}

describe("POST /api/translate", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 401 when no authenticated user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await POST(makeRequest({ productData: MOCK_PRODUCT_DATA, targetLang: "ES" }) as never);

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await POST(makeRequest({ productData: MOCK_PRODUCT_DATA, targetLang: "ES" }) as never);

    expect(res.status).toBe(429);
  });

  it("returns 400 when user has no OpenAI key configured", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue(null);

    const res = await POST(makeRequest({ productData: MOCK_PRODUCT_DATA, targetLang: "ES" }) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/openai api key/i);
  });

  it("returns 400 when productData is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue("sk-test-key");

    const res = await POST(makeRequest({ targetLang: "ES" }) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/required/i);
  });

  it("returns 400 when targetLang is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue("sk-test-key");

    const res = await POST(makeRequest({ productData: MOCK_PRODUCT_DATA }) as never);

    expect(res.status).toBe(400);
  });

  it("returns translated data on success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue("sk-test-key");
    mockOpenAISuccess(MOCK_TRANSLATED);

    const res = await POST(
      makeRequest({ productData: MOCK_PRODUCT_DATA, targetLang: "PT-PT" }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.translatedData.title).toBe("Camiseta Azul");
    expect(body.detectedSourceLang).toBe("auto");
  });

  it("unwraps GPT response when wrapped in a single root key", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue("sk-test-key");
    // GPT sometimes returns { translation: { title, description, options } }
    mockOpenAISuccess({ translation: MOCK_TRANSLATED });

    const res = await POST(
      makeRequest({ productData: MOCK_PRODUCT_DATA, targetLang: "ES" }) as never,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.translatedData.title).toBe("Camiseta Azul");
  });

  it("returns error status when OpenAI API returns non-ok", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue("sk-test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      }),
    );

    const res = await POST(
      makeRequest({ productData: MOCK_PRODUCT_DATA, targetLang: "ES" }) as never,
    );

    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/translation failed/i);
  });

  it("applies enhancementPrompt when provided", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockResolveKey.mockResolvedValue("sk-test-key");

    let capturedBody = "";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (_url: string, opts: RequestInit) => {
        capturedBody = opts.body as string;
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: JSON.stringify(MOCK_TRANSLATED) } }],
            }),
        };
      }),
    );

    await POST(
      makeRequest({
        productData: MOCK_PRODUCT_DATA,
        targetLang: "ES",
        enhancementPrompt: "Make it sound luxurious",
      }) as never,
    );

    const parsed = JSON.parse(capturedBody);
    expect(parsed.messages[0].content).toContain("Make it sound luxurious");
  });
});
