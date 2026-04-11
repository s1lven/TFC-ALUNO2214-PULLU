import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/exchange-rates/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const MOCK_USER = { id: "user-abc" };

function makeSupabase(user: typeof MOCK_USER | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/exchange-rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFrankfurterSuccess(rate: number, to: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          rates: { [to]: rate },
          date: "2024-01-15",
        }),
    }),
  );
}

describe("POST /api/exchange-rates", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReturnValue(true);
    vi.unstubAllGlobals();
  });

  it("returns 401 when no authenticated user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null) as never);

    const res = await POST(makeRequest({ from: "USD", to: "EUR" }) as never);

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockCheckRateLimit.mockReturnValue(false);

    const res = await POST(makeRequest({ from: "USD", to: "EUR" }) as never);

    expect(res.status).toBe(429);
  });

  it("returns 400 when from currency is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ to: "EUR" }) as never);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid or unsupported/i);
  });

  it("returns 400 when to currency is missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ from: "USD" }) as never);

    expect(res.status).toBe(400);
  });

  it("returns 400 when currency code is not in supported list", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);

    const res = await POST(makeRequest({ from: "XYZ", to: "EUR" }) as never);

    expect(res.status).toBe(400);
  });

  it("returns rate=1 without calling Frankfurter when from === to", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await POST(makeRequest({ from: "EUR", to: "EUR" }) as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rate).toBe(1);
    expect(body.from).toBe("EUR");
    expect(body.to).toBe("EUR");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("normalises lowercase currency codes to uppercase", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFrankfurterSuccess(0.92, "EUR");

    const res = await POST(makeRequest({ from: "usd", to: "eur" }) as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.from).toBe("USD");
    expect(body.to).toBe("EUR");
  });

  it("returns exchange rate from Frankfurter on success", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    mockFrankfurterSuccess(0.92, "EUR");

    const res = await POST(makeRequest({ from: "USD", to: "EUR" }) as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rate).toBe(0.92);
    expect(body.from).toBe("USD");
    expect(body.to).toBe("EUR");
    expect(body.date).toBe("2024-01-15");
  });

  it("returns 502 when Frankfurter returns non-ok response", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: () => Promise.resolve("Service unavailable"),
      }),
    );

    const res = await POST(makeRequest({ from: "USD", to: "EUR" }) as never);

    expect(res.status).toBe(502);
  });

  it("returns 502 when Frankfurter response has no valid rate", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(MOCK_USER) as never);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ rates: {}, date: "2024-01-15" }),
      }),
    );

    const res = await POST(makeRequest({ from: "USD", to: "EUR" }) as never);

    expect(res.status).toBe(502);
  });
});
