import { describe, it, expect } from "vitest";
import { isPublicHttpUrlForFetch } from "@/lib/security/public-url";

function url(s: string) {
  return new URL(s);
}

describe("isPublicHttpUrlForFetch – allowed hosts", () => {
  it("allows regular https domain", () => {
    expect(isPublicHttpUrlForFetch(url("https://example.myshopify.com/products/shirt"))).toBe(true);
  });

  it("allows regular http domain", () => {
    expect(isPublicHttpUrlForFetch(url("http://example.com/page"))).toBe(true);
  });

  it("allows public IP address (e.g. 8.8.8.8)", () => {
    expect(isPublicHttpUrlForFetch(url("https://8.8.8.8/products/test"))).toBe(true);
  });
});

describe("isPublicHttpUrlForFetch – SSRF blocked hosts", () => {
  it("blocks localhost by name", () => {
    expect(isPublicHttpUrlForFetch(url("http://localhost/api/secret"))).toBe(false);
  });

  it("blocks localhost subdomains", () => {
    expect(isPublicHttpUrlForFetch(url("http://app.localhost/api/secret"))).toBe(false);
  });

  it("blocks 127.0.0.1", () => {
    expect(isPublicHttpUrlForFetch(url("http://127.0.0.1/api/secret"))).toBe(false);
  });

  it("blocks 0.0.0.0", () => {
    expect(isPublicHttpUrlForFetch(url("http://0.0.0.0/"))).toBe(false);
  });

  it("blocks IPv6 loopback ::1", () => {
    expect(isPublicHttpUrlForFetch(url("http://[::1]/secret"))).toBe(false);
  });

  it("blocks private 10.x.x.x range", () => {
    expect(isPublicHttpUrlForFetch(url("http://10.0.0.1/secret"))).toBe(false);
    expect(isPublicHttpUrlForFetch(url("http://10.255.255.255/secret"))).toBe(false);
  });

  it("blocks private 192.168.x.x range", () => {
    expect(isPublicHttpUrlForFetch(url("http://192.168.1.1/secret"))).toBe(false);
    expect(isPublicHttpUrlForFetch(url("http://192.168.0.1/secret"))).toBe(false);
  });

  it("blocks private 172.16.x.x – 172.31.x.x range", () => {
    expect(isPublicHttpUrlForFetch(url("http://172.16.0.1/secret"))).toBe(false);
    expect(isPublicHttpUrlForFetch(url("http://172.31.255.255/secret"))).toBe(false);
  });

  it("does NOT block 172.32.x.x (outside private range)", () => {
    expect(isPublicHttpUrlForFetch(url("http://172.32.0.1/page"))).toBe(true);
  });

  it("blocks link-local 169.x.x.x range", () => {
    expect(isPublicHttpUrlForFetch(url("http://169.254.169.254/metadata"))).toBe(false);
  });
});

describe("isPublicHttpUrlForFetch – disallowed protocols", () => {
  it("blocks file:// protocol", () => {
    expect(isPublicHttpUrlForFetch(url("file:///etc/passwd"))).toBe(false);
  });

  it("blocks ftp:// protocol", () => {
    expect(isPublicHttpUrlForFetch(url("ftp://example.com/file"))).toBe(false);
  });
});
