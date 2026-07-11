/**
 * Security Utilities
 */

/**
 * Escapes HTML characters to prevent XSS attacks.
 */
export function sanitizeString(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validates number fields to ensure they are positive, finite numbers.
 */
export function isValidNumber(val: any): boolean {
  const num = Number(val);
  return !isNaN(num) && isFinite(num) && num >= 0;
}

/**
 * Validates length of input parameters to prevent overflow or DOS.
 */
export function isValidLength(str: string, maxLength: number): boolean {
  if (!str) return true;
  return str.length <= maxLength;
}
