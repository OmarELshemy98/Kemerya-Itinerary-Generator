/**
 * Centralized, validated access to public (client-safe) environment variables.
 *
 * Best practice: read env once, validate early, and fail with a clear message
 * instead of silently falling back to stale/hardcoded defaults.
 */

/** MapTiler key used for static journey maps (optional — maps are skipped without it). */
export const MAPTILER_API_KEY: string | undefined =
  process.env.NEXT_PUBLIC_MAPTILER_API_KEY || undefined;

export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to .env.local (see .env.example).`
    );
  }
  return value;
}

/** Warn once (dev only) when an optional integration is not configured. */
const warned = new Set<string>();
export function warnMissingEnv(name: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(
    `[env] ${name} is not set — related features will be skipped. ` +
      `Add it to .env.local (see .env.example).`
  );
}
