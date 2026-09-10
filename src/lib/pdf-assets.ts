/**
 * PDF asset helpers — resolves images/assets for both browser and Node.js
 * environments used by @react-pdf/renderer.
 */

/**
 * Returns a logo source that works in both browser and Node.js PDF rendering.
 * - In the browser: returns the public URL (e.g. "/logo-kemerya.png")
 * - In Node.js: reads the file and returns a base64 data URL
 */
export function resolveLogoSrc(logoPath: string | undefined): string | undefined {
  if (!logoPath) return undefined;

  // Browser environment — use the public URL directly
  if (typeof window !== "undefined") {
    return logoPath;
  }

  // Node.js environment — read file and convert to data URL
  // Use eval('require') to avoid Next.js bundling Node.js built-ins for client
  try {
    const nodeRequire = eval("require") as typeof require;
    const fs = nodeRequire("fs") as typeof import("fs");
    const path = nodeRequire("path") as typeof import("path");

    const absolutePath = logoPath.startsWith("/")
      ? `${process.cwd()}/public${logoPath}`
      : logoPath;

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[PDF] Logo file not found: ${absolutePath}`);
      return undefined;
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const base64 = fileBuffer.toString("base64");

    // Determine MIME type from extension
    const ext = path.extname(absolutePath).toLowerCase();
    const mimeType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".svg"
            ? "image/svg+xml"
            : ext === ".gif"
              ? "image/gif"
              : "image/png";

    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.warn("[PDF] Failed to load logo for Node.js rendering:", err);
    return undefined;
  }
}
