// ============================================================
// Network & Input Validation Utilities
// ============================================================

/**
 * Validates whether a given string is a valid IPv4 address
 * e.g. 192.168.1.100 or 10.254.110.2
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(trimmed);
}

/**
 * Cleans and sanitizes an IP input (strips http://, slashes, trailing spaces)
 */
export function sanitizeIpInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .split(':')[0]; // strip port if included
}
