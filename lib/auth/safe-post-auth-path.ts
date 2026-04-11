/**
 * Only allow redirects after auth to dashboard routes (prevents open redirects).
 */
export function safePostAuthPath(next: string | null | undefined): string {
  if (next == null || typeof next !== "string") return "/dashboard";
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/dashboard";
  const pathOnly = t.split("?")[0] ?? "";
  if (pathOnly === "/dashboard" || pathOnly.startsWith("/dashboard/")) return t;
  return "/dashboard";
}
