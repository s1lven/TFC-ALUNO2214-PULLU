import { describe, it, expect } from "vitest";
import {
  roundToEnding,
  formatShopifyPrice,
  adjustCollectionProductsPrices,
  type PriceAdjustPipeline,
} from "@/lib/pricing/adjust-collection-prices";

// ─── roundToEnding ────────────────────────────────────────────────────────────

describe("roundToEnding", () => {
  it("rounds down to the nearest .99 ending", () => {
    expect(roundToEnding(30.0, 0.99)).toBe(29.99);
    expect(roundToEnding(29.99, 0.99)).toBe(29.99);
    expect(roundToEnding(30.5, 0.99)).toBe(29.99);
  });

  it("rounds down to the nearest .95 ending", () => {
    expect(roundToEnding(29.99, 0.95)).toBe(29.95);
    expect(roundToEnding(30.0, 0.95)).toBe(29.95);
    expect(roundToEnding(30.96, 0.95)).toBe(30.95);
  });

  it("returns 0 for non-positive prices", () => {
    expect(roundToEnding(0, 0.99)).toBe(0);
    expect(roundToEnding(-5, 0.99)).toBe(0);
  });

  it("returns price as-is (2 decimals) when ending is invalid", () => {
    expect(roundToEnding(29.99, 0)).toBe(29.99);
    expect(roundToEnding(29.99, 1)).toBe(29.99);
    expect(roundToEnding(29.99, 1.5)).toBe(29.99);
  });

  it("returns 0 for non-finite price", () => {
    expect(roundToEnding(Infinity, 0.99)).toBe(0);
    expect(roundToEnding(NaN, 0.99)).toBe(0);
  });
});

// ─── formatShopifyPrice ───────────────────────────────────────────────────────

describe("formatShopifyPrice", () => {
  it("formats to two decimal places", () => {
    expect(formatShopifyPrice(29.9)).toBe("29.90");
    expect(formatShopifyPrice(100)).toBe("100.00");
    expect(formatShopifyPrice(0.5)).toBe("0.50");
  });

  it("returns '0.00' for negative values", () => {
    expect(formatShopifyPrice(-1)).toBe("0.00");
  });

  it("returns '0.00' for non-finite values", () => {
    expect(formatShopifyPrice(NaN)).toBe("0.00");
    expect(formatShopifyPrice(Infinity)).toBe("0.00");
  });
});

// ─── adjustCollectionProductsPrices ──────────────────────────────────────────

const identityPipeline: PriceAdjustPipeline = {
  exchangeRate: 1,
  adjustPercent: 0,
  maxPrice: null,
  roundEnding: null,
};

describe("adjustCollectionProductsPrices", () => {
  it("returns the same price when pipeline is identity (no changes)", () => {
    const products = [{ variants: [{ price: "25.00", compare_at_price: "" }] }];
    const result = adjustCollectionProductsPrices(products, identityPipeline);
    expect(result[0].variants![0].price).toBe("25.00");
  });

  it("applies exchange rate correctly", () => {
    const products = [{ variants: [{ price: "100.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      exchangeRate: 1.08,
    });
    expect(result[0].variants![0].price).toBe("108.00");
  });

  it("applies percentage adjustment correctly (increase)", () => {
    const products = [{ variants: [{ price: "100.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      adjustPercent: 10,
    });
    expect(result[0].variants![0].price).toBe("110.00");
  });

  it("applies percentage adjustment correctly (decrease)", () => {
    const products = [{ variants: [{ price: "100.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      adjustPercent: -20,
    });
    expect(result[0].variants![0].price).toBe("80.00");
  });

  it("applies maxPrice cap", () => {
    const products = [{ variants: [{ price: "200.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      exchangeRate: 2,
      maxPrice: 300,
    });
    expect(result[0].variants![0].price).toBe("300.00");
  });

  it("applies psychological rounding (roundEnding)", () => {
    const products = [{ variants: [{ price: "100.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      roundEnding: 0.99,
    });
    expect(result[0].variants![0].price).toBe("99.99");
  });

  it("adjusts compare_at_price in parallel with price", () => {
    const products = [{ variants: [{ price: "50.00", compare_at_price: "80.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      exchangeRate: 1.5,
    });
    expect(result[0].variants![0].price).toBe("75.00");
    expect(result[0].variants![0].compare_at_price).toBe("120.00");
  });

  it("clears compare_at_price when it would be <= new price after adjustment", () => {
    // After a large discount, compare_at_price may end up <= price → should be cleared.
    const products = [{ variants: [{ price: "100.00", compare_at_price: "110.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      ...identityPipeline,
      adjustPercent: 20, // price → 120, compare → 132 → compare still > price, ok
    });
    // Verify it handles the edge case where compare <= price
    const products2 = [{ variants: [{ price: "100.00", compare_at_price: "90.00" }] }];
    const result2 = adjustCollectionProductsPrices(products2, identityPipeline);
    // compare_at_price (90) < price (100) → should be cleared
    expect(result2[0].variants![0].compare_at_price).toBe("");
  });

  it("handles products without variants gracefully", () => {
    const products = [{ id: 1, title: "No variants" }];
    const result = adjustCollectionProductsPrices(products, identityPipeline);
    expect(result[0]).toMatchObject({ id: 1, title: "No variants" });
  });

  it("applies the full pipeline in the correct order (rate → percent → cap → rounding)", () => {
    // price=100, rate=1.2 → 120, +10% → 132, cap=130 → 130, round .99 → 129.99
    const products = [{ variants: [{ price: "100.00" }] }];
    const result = adjustCollectionProductsPrices(products, {
      exchangeRate: 1.2,
      adjustPercent: 10,
      maxPrice: 130,
      roundEnding: 0.99,
    });
    expect(result[0].variants![0].price).toBe("129.99");
  });
});
