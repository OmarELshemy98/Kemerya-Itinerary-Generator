import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a tour description string into an array of bullet-point strings.
 * Splits on sentence boundaries (". ", "?" or "!"), strips paragraph breaks,
 * and removes leading bullet characters ("•", "-", "*") so the result is clean.
 */
export function parseDescriptionToBullets(description: string): string[] {
  if (!description) return [];
  // Normalize newlines/paragraphs into spaces
  const flat = description
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!flat) return [];

  // Step 1: split on sentence-ending punctuation (. ?) or !(!) to get sentence-like chunks
  const raw = flat
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const bullets: string[] = [];
  for (const chunk of raw) {
    // If the chunk itself contains multiple sentences, split again on ". " and "! "
    const subChunks = chunk
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sub of subChunks) {
      // Strip leading bullet chars
      const cleaned = sub.replace(/^[•\-\*\u2022\u25E6\u2043\u2219\s]+/, "").trim();
      if (cleaned) bullets.push(cleaned);
    }
  }

  // Fallback: if nothing useful came out, return the whole description as a single bullet
  if (bullets.length === 0 && flat) {
    bullets.push(flat);
  }

  return bullets;
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
  };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function calculateNights(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
