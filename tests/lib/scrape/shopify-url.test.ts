import { describe, it, expect } from "vitest";
import {
  extractShopifyProductHandle,
  extractShopifyCollectionHandle,
  extractShopifyLocale,
} from "@/lib/scrape/shopify-url";

describe("extractShopifyProductHandle", () => {
  it("extracts handle from standard /products/handle path", () => {
    expect(extractShopifyProductHandle("/products/blue-shirt")).toBe("blue-shirt");
  });

  it("strips .json suffix when present", () => {
    expect(extractShopifyProductHandle("/products/blue-shirt.json")).toBe("blue-shirt");
  });

  it("extracts handle when locale prefix is present", () => {
    expect(extractShopifyProductHandle("/en-au/products/blue-shirt")).toBe("blue-shirt");
  });

  it("extracts handle when locale and .json are both present", () => {
    expect(extractShopifyProductHandle("/en/products/blue-shirt.json")).toBe("blue-shirt");
  });

  it("handles handle with query-string segment stripped by URL parser", () => {
    expect(extractShopifyProductHandle("/products/blue-shirt")).toBe("blue-shirt");
  });

  it("returns null for empty pathname", () => {
    expect(extractShopifyProductHandle("")).toBeNull();
  });
});

describe("extractShopifyCollectionHandle", () => {
  it("extracts handle from /collections/handle path", () => {
    expect(extractShopifyCollectionHandle("/collections/summer-sale")).toBe("summer-sale");
  });

  it("strips .json suffix", () => {
    expect(extractShopifyCollectionHandle("/collections/summer-sale.json")).toBe("summer-sale");
  });

  it("extracts handle when locale prefix is present", () => {
    expect(extractShopifyCollectionHandle("/fr/collections/nouveautes")).toBe("nouveautes");
  });

  it("returns null when the segment right after /collections/ is the word 'products'", () => {
    // /collections/products is an ambiguous Shopify path — treated as no handle
    expect(extractShopifyCollectionHandle("/collections/products")).toBeNull();
  });

  it("returns null for empty pathname", () => {
    expect(extractShopifyCollectionHandle("")).toBeNull();
  });
});

describe("extractShopifyLocale", () => {
  it("returns null when there is no locale prefix", () => {
    expect(extractShopifyLocale("/products/shirt")).toBeNull();
    expect(extractShopifyLocale("/collections/summer")).toBeNull();
  });

  it("extracts two-letter language code", () => {
    expect(extractShopifyLocale("/en/products/shirt")).toBe("en");
    expect(extractShopifyLocale("/fr/collections/nouveautes")).toBe("fr");
  });

  it("extracts region-qualified locale (e.g. en-au)", () => {
    expect(extractShopifyLocale("/en-au/products/shirt")).toBe("en-au");
    expect(extractShopifyLocale("/fr-ch/collections/summer")).toBe("fr-ch");
  });

  it("returns null when prefix is not a valid locale (e.g. a category name)", () => {
    // A category like 'mens' before /products won't match the locale pattern
    expect(extractShopifyLocale("/mens/products/shirt")).toBeNull();
  });

  it("is case-insensitive and lowercases the result", () => {
    expect(extractShopifyLocale("/EN-AU/products/shirt")).toBe("en-au");
  });
});
