export const FRANKFURTER_CURRENCIES = [
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'BRL', name: 'Brazilian real' },
  { code: 'BGN', name: 'Bulgarian lev' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'CZK', name: 'Czech koruna' },
  { code: 'DKK', name: 'Danish krone' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'HKD', name: 'Hong Kong dollar' },
  { code: 'HUF', name: 'Hungarian forint' },
  { code: 'IDR', name: 'Indonesian rupiah' },
  { code: 'ILS', name: 'Israeli shekel' },
  { code: 'INR', name: 'Indian rupee' },
  { code: 'ISK', name: 'Icelandic króna' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'KRW', name: 'South Korean won' },
  { code: 'MXN', name: 'Mexican peso' },
  { code: 'MYR', name: 'Malaysian ringgit' },
  { code: 'NOK', name: 'Norwegian krone' },
  { code: 'NZD', name: 'New Zealand dollar' },
  { code: 'PHP', name: 'Philippine peso' },
  { code: 'PLN', name: 'Polish złoty' },
  { code: 'RON', name: 'Romanian leu' },
  { code: 'SEK', name: 'Swedish krona' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'THB', name: 'Thai baht' },
  { code: 'TRY', name: 'Turkish lira' },
  { code: 'USD', name: 'US dollar' },
  { code: 'ZAR', name: 'South African rand' },
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF ',
  SEK: 'kr ',
  NOK: 'kr ',
  DKK: 'kr ',
  PLN: 'zł ',
  INR: '₹',
  KRW: '₩',
  BRL: 'R$',
  MXN: 'MX$',
  NZD: 'NZ$',
  SGD: 'S$',
  HKD: 'HK$',
  TRY: '₺',
  ZAR: 'R ',
  THB: '฿',
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? `${code} `;
}

/**
 * Retail-style rounding: returns the largest value ≤ `price` whose decimal
 * part equals `ending` (e.g. ending = 0.95 → ...95).
 *
 * Examples: roundToEnding(29.99, 0.95) → 29.95
 *           roundToEnding(30.00, 0.95) → 29.95
 *           roundToEnding(30.96, 0.95) → 30.95
 */
export function roundToEnding(price: number, ending: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (!Number.isFinite(ending) || ending <= 0 || ending >= 1) return Number(price.toFixed(2));
  // Math.floor(price - ending) + ending is equivalent and avoids the two-step
  const result = Math.floor(price - ending) + ending;
  return Math.max(0, Number(result.toFixed(2)));
}

export function formatShopifyPrice(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0.00';
  return n.toFixed(2);
}

export type PriceAdjustPipeline = {
  /** Multiply first: 1 unit of "from" currency × rate = "to" currency. Use 1 for no conversion. */
  exchangeRate: number;
  /**
   * Percentage to adjust the price after currency conversion.
   * Positive = increase (10 → +10%), negative = decrease (-20 → −20%). 0 = no change.
   */
  adjustPercent: number;
  maxPrice: number | null;
  /** null = no psychological rounding */
  roundEnding: number | null;
};

function applyPipelineScalar(value: number, pipe: PriceAdjustPipeline): number {
  let v = value;
  if (pipe.exchangeRate > 0 && Number.isFinite(pipe.exchangeRate)) {
    v *= pipe.exchangeRate;
  }
  if (pipe.adjustPercent !== 0 && Number.isFinite(pipe.adjustPercent)) {
    v *= 1 + pipe.adjustPercent / 100;
  }
  if (v < 0) v = 0;
  if (pipe.maxPrice != null && pipe.maxPrice > 0) {
    v = Math.min(v, pipe.maxPrice);
  }
  if (pipe.roundEnding != null) {
    v = roundToEnding(v, pipe.roundEnding);
  }
  return v;
}

export type CollectionVariant = {
  price?: string;
  compare_at_price?: string;
  [key: string]: unknown;
};

export type CollectionProductShape = {
  variants?: CollectionVariant[];
  [key: string]: unknown;
};

export function adjustCollectionProductsPrices(
  products: CollectionProductShape[],
  pipe: PriceAdjustPipeline,
): CollectionProductShape[] {
  return products.map((p) => ({
    ...p,
    variants: p.variants?.map((v) => {
      const priceNum = parseFloat(String(v.price ?? '')) || 0;
      const compareRaw = v.compare_at_price;
      const hasCompare =
        compareRaw != null &&
        String(compareRaw).trim() !== '' &&
        parseFloat(String(compareRaw)) > 0;
      const compareNum = hasCompare ? parseFloat(String(compareRaw)) : null;

      const newPrice = applyPipelineScalar(priceNum, pipe);
      let newCompare: number | null = null;
      if (compareNum != null && compareNum > 0) {
        newCompare = applyPipelineScalar(compareNum, pipe);
        if (newCompare <= newPrice) {
          newCompare = null;
        }
      }

      const next: CollectionVariant = {
        ...v,
        price: formatShopifyPrice(newPrice),
      };
      if (newCompare != null && newCompare > newPrice) {
        next.compare_at_price = formatShopifyPrice(newCompare);
      } else {
        next.compare_at_price = '';
      }
      return next;
    }),
  }));
}
