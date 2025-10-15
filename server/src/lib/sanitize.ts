import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitization utilities to prevent XSS attacks
 *
 * DOMPurify removes:
 * - <script> tags
 * - JavaScript event handlers (onclick, onerror, etc.)
 * - javascript: URLs
 * - data: URLs (except safe ones)
 * - Any potentially dangerous HTML
 */

/**
 * Sanitize plain text (removes ALL HTML)
 *
 * Use for: Names, titles, short descriptions
 *
 * Example:
 * Input:  "Great place! <script>alert('xss')</script>"
 * Output: "Great place! "
 */
export function sanitizePlainText(input: string | null | undefined): string {
  if (!input) return "";

  // Remove all HTML tags and return plain text
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    KEEP_CONTENT: true, // Keep the text content
  }).trim();
}

/**
 * Sanitize rich text (allows safe HTML formatting)
 *
 * Use for: Review content, descriptions with formatting
 *
 * Allows: <b>, <i>, <strong>, <em>, <p>, <br>, <ul>, <li>
 * Removes: <script>, onclick, etc.
 *
 * Example:
 * Input:  "<p>Great place!</p><script>alert('xss')</script>"
 * Output: "<p>Great place!</p>"
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return "";

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "span",
    ],
    ALLOWED_ATTR: ["href", "title"], // Only for <a> tags
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/, // Only http(s) and mailto links
  }).trim();
}

/**
 * Sanitize a URL
 *
 * Use for: User-submitted URLs, external links
 *
 * Example:
 * Input:  "javascript:alert('xss')"
 * Output: ""
 *
 * Input:  "https://example.com"
 * Output: "https://example.com"
 */
export function sanitizeURL(input: string | null | undefined): string {
  if (!input) return "";

  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();

  // Only allow http(s) and mailto protocols
  if (!sanitized.match(/^(https?:\/\/|mailto:)/i)) {
    return "";
  }

  return sanitized;
}

/**
 * Sanitize an email address
 *
 * Use for: Email inputs
 *
 * Example:
 * Input:  "user@example.com<script>alert(1)</script>"
 * Output: "user@example.com"
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return "";

  // Remove all HTML and trim
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  }).trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return "";
  }

  return cleaned.toLowerCase();
}

/**
 * Batch sanitize an object's string fields
 *
 * Use for: Sanitizing entire form data objects
 *
 * Example:
 * ```typescript
 * const sanitized = sanitizeObject({
 *   name: "John<script>alert(1)</script>",
 *   bio: "<p>Developer</p><script>alert(1)</script>"
 * }, {
 *   name: 'plainText',
 *   bio: 'richText'
 * });
 * // Result: { name: "John", bio: "<p>Developer</p>" }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldTypes: Record<keyof T, "plainText" | "richText" | "url" | "email">
): T {
  const sanitized: Record<string, any> = { ...obj };

  for (const [key, type] of Object.entries(fieldTypes)) {
    const value = obj[key];

    if (typeof value === "string") {
      switch (type) {
        case "plainText":
          sanitized[key] = sanitizePlainText(value);
          break;
        case "richText":
          sanitized[key] = sanitizeRichText(value);
          break;
        case "url":
          sanitized[key] = sanitizeURL(value);
          break;
        case "email":
          sanitized[key] = sanitizeEmail(value);
          break;
      }
    }
  }

  return sanitized as T;
}
