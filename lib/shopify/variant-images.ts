/**
 * Map scraped / storefront product images to created Admin API images and
 * match variants for post-create image_id updates.
 */

export function normalizeShopifyImageSrc(src: string): string {
  const s = src.trim();
  try {
    const href = s.startsWith('//') ? `https:${s}` : s;
    const u = new URL(href);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    return `${host}${path}`;
  } catch {
    return s.toLowerCase();
  }
}

/** Path-only key so storefront vs Admin CDN hostnames still match. */
function normalizeImagePath(src: string): string {
  const s = src.trim();
  try {
    const href = s.startsWith('//') ? `https:${s}` : s;
    return new URL(href).pathname.toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

/** Storefront / scraped image id may be number or string; Map keys must be consistent. */
function imageKey(id: unknown): string | null {
  if (id === undefined || id === null) return null;
  return String(id);
}

/**
 * Build mapping from source product image id -> new Shopify image id (numeric).
 * Prefers URL matching (order-independent); falls back to index alignment.
 */
export function buildScrapedToCreatedImageIdMap(
  originalImages: Array<{ id?: unknown; src?: string }>,
  createdImages: Array<{ id: unknown; src?: string }>,
): Map<string, number> {
  const mapping = new Map<string, number>();
  const usedCreatedIds = new Set<number>();

  for (let i = 0; i < originalImages.length; i++) {
    const o = originalImages[i];
    const idKey = imageKey(o.id);
    if (!idKey || !o.src) continue;

    const norm = normalizeShopifyImageSrc(o.src);
    const pathKey = normalizeImagePath(o.src);
    let created = createdImages.find(
      (c) =>
        c.src &&
        normalizeShopifyImageSrc(c.src) === norm &&
        !usedCreatedIds.has(Number(c.id)),
    );

    if (!created && pathKey) {
      created = createdImages.find(
        (c) =>
          c.src &&
          normalizeImagePath(c.src) === pathKey &&
          !usedCreatedIds.has(Number(c.id)),
      );
    }

    if (!created && createdImages[i]?.id != null) {
      created = createdImages[i];
    }

    if (created?.id != null) {
      const nid = Number(created.id);
      usedCreatedIds.add(nid);
      mapping.set(idKey, nid);
    }
  }

  // Fill gaps: strict index fallback for any original id not yet mapped
  originalImages.forEach((originalImg, index) => {
    const idKey = imageKey(originalImg.id);
    if (!idKey || mapping.has(idKey)) return;
    const ci = createdImages[index];
    if (ci?.id != null) {
      mapping.set(idKey, Number(ci.id));
    }
  });

  return mapping;
}

export function variantOptionsKey(v: Record<string, unknown>): string {
  return ['option1', 'option2', 'option3']
    .map((k) => String(v[k] ?? '').trim())
    .join('\u0001');
}

/**
 * For each original variant index, find the corresponding created Shopify variant
 * (order may differ). Falls back to same index, then first unused.
 */
export function matchCreatedVariantsToOriginals<
  O extends Record<string, unknown>,
  C extends Record<string, unknown>,
>(originalVariants: O[], createdVariants: C[]): (C | undefined)[] {
  const matched: (C | undefined)[] = new Array(originalVariants.length);
  const usedCreatedIdx = new Set<number>();

  const queueByKey = new Map<string, number[]>();
  createdVariants.forEach((cv, ci) => {
    const k = variantOptionsKey(cv);
    const q = queueByKey.get(k) ?? [];
    q.push(ci);
    queueByKey.set(k, q);
  });

  originalVariants.forEach((ov, oi) => {
    const k = variantOptionsKey(ov as Record<string, unknown>);
    const q = queueByKey.get(k);
    if (q?.length) {
      const ci = q.shift()!;
      matched[oi] = createdVariants[ci];
      usedCreatedIdx.add(ci);
    }
  });

  originalVariants.forEach((_, oi) => {
    if (matched[oi]) return;
    if (oi < createdVariants.length && !usedCreatedIdx.has(oi)) {
      matched[oi] = createdVariants[oi];
      usedCreatedIdx.add(oi);
      return;
    }
    const fallback = createdVariants.findIndex((_, i) => !usedCreatedIdx.has(i));
    if (fallback >= 0) {
      matched[oi] = createdVariants[fallback];
      usedCreatedIdx.add(fallback);
    }
  });

  return matched;
}

export function resolveVariantSourceImageId(variant: Record<string, unknown>): string | null {
  const featured = variant.featured_image as { id?: unknown } | undefined;
  const fromFeatured = featured?.id;
  const fromField = variant.image_id;
  const raw = fromFeatured !== undefined && fromFeatured !== null ? fromFeatured : fromField;
  return imageKey(raw);
}
