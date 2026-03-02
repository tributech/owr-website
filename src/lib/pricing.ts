export interface PriceInfo {
  display: string;
  currency: string;
  suffix: string;
}

interface PriceEntry {
  symbol: string;
  amount: string;
  currency: string;
}

const PRICES: Record<string, PriceEntry> = {
  USD: { symbol: '$', amount: '7', currency: 'USD' },
  AUD: { symbol: 'A$', amount: '9.99', currency: 'AUD' },
  EUR: { symbol: '€', amount: '5.99', currency: 'EUR' },
  GBP: { symbol: '£', amount: '5.49', currency: 'GBP' },
  NZD: { symbol: 'NZ$', amount: '11.99', currency: 'NZD' },
  SGD: { symbol: 'S$', amount: '8.99', currency: 'SGD' },
  CAD: { symbol: 'C$', amount: '9.99', currency: 'CAD' },
  JPY: { symbol: '¥', amount: '1,100', currency: 'JPY' },
};

const DEFAULT_CURRENCY = 'USD';

const REGION_TO_CURRENCY: Record<string, string> = {
  us: 'USD',
  au: 'AUD',
  uk: 'GBP',
  nz: 'NZD',
  sg: 'SGD',
  ca: 'CAD',
  jp: 'JPY',
  fr: 'EUR', de: 'EUR', it: 'EUR', es: 'EUR',
  nl: 'EUR', pt: 'EUR', be: 'EUR', at: 'EUR',
  ie: 'EUR', fi: 'EUR', gr: 'EUR', ee: 'EUR',
  lv: 'EUR', lt: 'EUR', sk: 'EUR', si: 'EUR',
  mt: 'EUR', cy: 'EUR', lu: 'EUR', hr: 'EUR',
  europe: 'EUR',
};

/** Map IANA timezone prefix → currency (more reliable than navigator.language for location) */
const TZ_TO_CURRENCY: Record<string, string> = {
  'Australia': 'AUD',
  'Pacific/Auckland': 'NZD',
  'Pacific/Chatham': 'NZD',
  'Asia/Singapore': 'SGD',
  'Asia/Tokyo': 'JPY',
  'America/Toronto': 'CAD', 'America/Vancouver': 'CAD', 'America/Edmonton': 'CAD',
  'America/Winnipeg': 'CAD', 'America/Halifax': 'CAD', 'America/St_Johns': 'CAD',
  'America/Regina': 'CAD', 'America/Iqaluit': 'CAD', 'America/Whitehorse': 'CAD',
  'Europe/London': 'GBP',
  'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR', 'Europe/Rome': 'EUR',
  'Europe/Madrid': 'EUR', 'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR', 'Europe/Dublin': 'EUR', 'Europe/Helsinki': 'EUR',
  'Europe/Lisbon': 'EUR', 'Europe/Athens': 'EUR', 'Europe/Tallinn': 'EUR',
  'Europe/Riga': 'EUR', 'Europe/Vilnius': 'EUR', 'Europe/Bratislava': 'EUR',
  'Europe/Ljubljana': 'EUR', 'Europe/Malta': 'EUR', 'Europe/Nicosia': 'EUR',
  'Europe/Luxembourg': 'EUR', 'Europe/Zagreb': 'EUR',
};

export function priceForCurrency(currency: string): PriceInfo {
  const entry = PRICES[currency] || PRICES[DEFAULT_CURRENCY];
  return {
    display: `${entry.symbol}${entry.amount}`,
    currency: entry.currency,
    suffix: `${entry.currency}/month`,
  };
}

function currencyFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return DEFAULT_CURRENCY;
    // Check exact match first (e.g. "Asia/Singapore")
    if (TZ_TO_CURRENCY[tz]) return TZ_TO_CURRENCY[tz];
    // Check prefix (e.g. "Australia" matches "Australia/Sydney", "Australia/Melbourne", etc.)
    const prefix = tz.split('/')[0];
    if (TZ_TO_CURRENCY[prefix]) return TZ_TO_CURRENCY[prefix];
  } catch { /* Intl not available */ }
  return DEFAULT_CURRENCY;
}

export function detectCurrency(regionSlug: string | null | undefined): string {
  if (regionSlug) {
    const fromRegion = REGION_TO_CURRENCY[regionSlug];
    if (fromRegion) return fromRegion;
  }
  return currencyFromTimezone();
}
