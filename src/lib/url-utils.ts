/**
 * Extract domain/hostname from URL
 * Supports various URL protocols (http, https, ftp, etc.)
 * @param url - The URL to extract domain from
 * @returns The hostname/domain portion of the URL
 */
export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '').split('/')[0];
  }
}
