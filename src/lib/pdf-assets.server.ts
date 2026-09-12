/**
 * Server-only PDF asset helpers (Node.js).
 * Import ONLY from API routes / Node scripts — never from client components.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/** Read a /public asset and return it as a base64 data URL for Node PDF rendering. */
export async function logoToDataUrl(
  logoPath: string | undefined
): Promise<string | undefined> {
  if (!logoPath) return undefined;
  try {
    const absolutePath = logoPath.startsWith("/")
      ? path.join(process.cwd(), "public", logoPath.replace(/^\//, ""))
      : path.resolve(process.cwd(), logoPath);
    const fileBuffer = await fs.readFile(absolutePath);
    const mimeType =
      MIME_BY_EXT[path.extname(absolutePath).toLowerCase()] ?? "image/png";
    return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
  } catch (err) {
    console.warn("[PDF] Failed to load logo for Node.js rendering:", err);
    return undefined;
  }
}
