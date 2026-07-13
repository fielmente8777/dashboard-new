// Mirrors gian/src/services/seoToken.service.ts — display estimates only.
const USD_INR       = 95.02;
const PROFIT_MARGIN = 0.40;

const costInr = (usd: number) => usd * USD_INR;
const chargeInr = (usd: number) => costInr(usd) / (1 - PROFIT_MARGIN);
const toTokens  = (usd: number) => Math.max(1, Math.ceil(chargeInr(usd)));

const LOCAL_PER_KW        = toTokens(0.002);
export const WEBSITE_PER_KW_IN   = toTokens(0.0125);  // 2 credits (India)
export const WEBSITE_PER_KW_INTL = toTokens(0.017);    // 3 credits (outside India)
const GEO_GRID            = toTokens(0.015);

export const isIndiaCountry = (countryCode?: string): boolean =>
  !countryCode || countryCode.toUpperCase() === 'IN';

export const getWebsiteTokensPerKeyword = (countryCode?: string): number =>
  isIndiaCountry(countryCode) ? WEBSITE_PER_KW_IN : WEBSITE_PER_KW_INTL;

export const estimateLocalTokens = (n: number): number =>
  n <= 0 ? 0 : n * LOCAL_PER_KW;

export const estimateWebsiteTokens = (n: number, countryCode?: string): number =>
  n <= 0 ? 0 : n * getWebsiteTokensPerKeyword(countryCode);

export const estimateGeoGridTokens = (): number => GEO_GRID;

export interface SeoTokenPricing {
  localPerKeyword:   number;
  websitePerKeyword: number;
  geoGridScan:       number;
}

export const DEFAULT_SEO_PRICING: SeoTokenPricing = {
  localPerKeyword:   LOCAL_PER_KW,
  websitePerKeyword: WEBSITE_PER_KW_IN,
  geoGridScan:       GEO_GRID,
};

export const pricingForCountry = (countryCode?: string): SeoTokenPricing => ({
  localPerKeyword:   LOCAL_PER_KW,
  websitePerKeyword: getWebsiteTokensPerKeyword(countryCode),
  geoGridScan:       GEO_GRID,
});
