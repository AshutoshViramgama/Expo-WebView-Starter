/**
 * urlUtils.ts
 *
 * URL validation, sanitization, and domain-checking utilities.
 * Pure functions – no side effects, fully testable.
 */

/**
 * Returns the hostname of a URL, or an empty string if the URL is invalid.
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Returns true when `url` belongs to one of the `allowedDomains`.
 * Checks both exact match and sub-domain match
 * (e.g. domain "example.com" allows "www.example.com").
 */
export function isDomainAllowed(url: string, allowedDomains: string[]): boolean {
  if (!url || allowedDomains.length === 0) return false;

  const hostname = getHostname(url);
  if (!hostname) return false;

  return allowedDomains.some((domain) => {
    const d = domain.toLowerCase();
    return hostname === d || hostname.endsWith(`.${d}`);
  });
}

/**
 * Upgrades a URL from http:// to https:// when httpsOnly is enabled.
 * Returns the original URL unchanged for non-http schemes (e.g. about:, file:).
 */
export function ensureHttps(url: string, httpsOnly: boolean): string {
  if (!httpsOnly) return url;
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

/**
 * Returns true for URL schemes that should be handled by the system
 * (tel:, mailto:, intent:, market:, etc.) rather than loaded inside the WebView.
 */
export function isSystemScheme(url: string): boolean {
  const systemSchemes = ['tel:', 'mailto:', 'intent:', 'market:', 'maps:', 'geo:'];
  return systemSchemes.some((scheme) => url.startsWith(scheme));
}

/**
 * Returns true if the URL uses the http or https scheme.
 */
export function isHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
