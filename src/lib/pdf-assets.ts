/**
 * PDF asset helpers — client-safe logo resolution.
 *
 * Best practice: the browser bundle must never touch Node.js built-ins
 * (no eval("require") / fs). Server-side base64 conversion lives in
 * `pdf-assets.server.ts` (imported only from API routes / Node scripts).
 */

/**
 * Returns a logo source that works in the browser PDF renderer:
 * the public URL (e.g. "/logo-kemerya.png").
 */
export function resolveLogoSrc(logoPath: string | undefined): string | undefined {
  if (!logoPath) return undefined;
  return logoPath;
}

