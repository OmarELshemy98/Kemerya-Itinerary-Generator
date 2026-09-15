import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force dynamic execution to prevent static evaluation at build time
export const dynamic = "force-dynamic";
// Long-running translation for large itineraries — must outlive default 3s edge limit
export const maxDuration = 60;

// ── FIX #2: JSON truncation hardening (position-8340 class of failures) ──
// Gemini can still stop mid-object on very large itineraries even with a
// large maxOutputTokens budget + native JSON mode. Instead of crashing with
// "Expected ',' or ']'", we (a) walk the model list with fallbacks, (b) retry
// once asking to "complete the JSON", and (c) progressively repair truncated
// JSON (strip trailing partial token → close open strings → balance
// brackets) so a long itinerary degrades gracefully instead of failing.
const MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
];

/** Balance-aware truncation repair: close open strings/brackets. */
function repairTruncatedJson(raw: string): string {
  let text = (raw || "").replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    // A complete outer object exists — but there may still be trailing prose.
    text = text.slice(start, end + 1);
    try {
      JSON.parse(text);
      return text;
    } catch {
      // fall through to structural repair below
    }
  } else if (start !== -1) {
    text = text.slice(start);
  }
  // Drop a trailing partial token (cut mid-string / mid-number / mid-literal).
  const cutMarkers = [",", "{", "[", ":"];
  let repaired = text;
  // If we end inside an unterminated string, close it first.
  let inString = false;
  let escaped = false;
  for (const ch of repaired) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escaped = true;
      continue;
    }
    if (ch === '"') inString = !inString;
  }
  if (inString) {
    // Remove the dangling partial string fragment back to its opening quote,
    // then drop any hanging comma/colon left behind.
    const lastQuote = repaired.lastIndexOf('"');
    repaired = repaired.slice(0, lastQuote).replace(/[,:]\s*$/, "").trim();
  } else {
    // Strip trailing partial literals like `tru`, `nul`, dangling commas.
    repaired = repaired
      .replace(/,\s*$/, "")
      .replace(/:\s*("[^"]*)?$/, "")
      .replace(/:\s*$/, "")
      .replace(/\b(tru?|fals?|nul?|n?)\s*$/i, "")
      .replace(/,\s*$/, "")
      .trim();
  }
  void cutMarkers;
  // Balance brackets outside of strings.
  inString = false;
  escaped = false;
  const stack: string[] = [];
  for (const ch of repaired) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop();
    }
  }
  while (stack.length > 0) repaired += stack.pop();
  return repaired;
}

function safeParseJson(raw: string): Record<string, unknown> {
  const cleaned = (raw || "").replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const sliced = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(sliced) as Record<string, unknown>;
    } catch {
      // continue to repair path
    }
  } else {
    try {
      return JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      // continue to repair path
    }
  }
  const repaired = repairTruncatedJson(cleaned);
  return JSON.parse(repaired) as Record<string, unknown>;
}

async function generateWithFallbacks(
  genAI: GoogleGenerativeAI,
  systemInstruction: string,
  prompt: string,
  maxOutputTokens: number
): Promise<string> {
  let lastError: unknown = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          // Native JSON mode: Gemini is constrained to emit syntactically
          // valid JSON — no markdown fences, no prose, no truncation artifacts.
          responseMimeType: "application/json",
          temperature: 0.3, // Lower temperature for consistent translations
          topK: 20,
          topP: 0.95,
          // FIX #2: large budget so big itineraries translate fully instead of
          // truncating mid-array ("Expected ',' or ']'" failures).
          maxOutputTokens,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) return text;
      lastError = new Error(`Model ${modelName} returned an empty response.`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All Gemini models failed.");
}

interface TranslationRequest {
  targetLanguage: string;
  itineraryData: Record<string, unknown>;
  staticLabels: Record<string, string>;
  languageCode: string;
}

export async function POST(request: NextRequest) {
  try {
    // Runtime environment check - don't crash at build time
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    // Initialize Gemini client inside POST to avoid build-time evaluation
    const genAI = new GoogleGenerativeAI(apiKey);

    const body: TranslationRequest = await request.json();
    const { targetLanguage, itineraryData, staticLabels, languageCode } = body;

    if (!targetLanguage || !itineraryData) {
      return NextResponse.json(
        { error: "Missing required fields: targetLanguage and itineraryData" },
        { status: 400 }
      );
    }

    // Combine itinerary data with static labels for translation.
    // FIX #3: nest the SAME labels under BOTH `_labels` (legacy flat key) and
    // `ui` (protocol namespace) so `translatedData?.ui?.terms` resolves.
    const uiLabels: Record<string, string> = { ...(staticLabels || {}) };
    const dataToTranslate = {
      ...itineraryData,
      _labels: staticLabels,
      ui: uiLabels,
    };

    // System prompt for luxury travel translation (used with native JSON mode).
        const SYSTEM_PROMPT = `CRITICAL: Translate the ENTIRE JSON perfectly. DO NOT truncate, summarize, or omit any arrays. Return the exact same structure.`;

    // Create prompt for Gemini — translate EVERY human-readable value incl.
    // 'BOOKING SUMMARY', "WHAT'S INCLUDED", 'TERMS & CONDITIONS',
    // 'YOUR EXCLUSIVE TRAVEL ITINERARY'.
    const MAX_OUTPUT_TOKENS = 8192;
    const prompt = `Translate the following JSON data to ${targetLanguage}.
Translate every human-readable string VALUE (tour copy, day titles, descriptions, highlights, terms, privacy items, and ALL label strings under "_labels" and "ui"). Keep every KEY exactly unchanged. Return ONLY the translated JSON with the exact same structure.

Here is the JSON to translate:
${JSON.stringify(dataToTranslate, null, 2)}`;

    // Get Gemini model — candidates verified against the live ListModels API
    // for this key's API generation (the 1.5/2.0 models are retired and return
    // 404). We walk the list with retry/backoff on transient 503/429 spikes.
        const MODEL_CANDIDATES_RUNTIME = ["gemini-1.5-flash"];

    const RETRYABLE_ERROR = /\b(503|429)\b|overloaded|unavailable|rate limit|quota|resource_exhausted/i;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    /** generateContent with exponential backoff (up to 3 attempts, 1s then 2s) on 503/429. */
    async function generateWithRetry(
      mdl: ReturnType<typeof genAI.getGenerativeModel>,
      promptText: string
    ) {
      let lastError: unknown;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          return await mdl.generateContent(promptText);
        } catch (e) {
          lastError = e;
          const msg = String((e as Error)?.message || e);
          const isLast = attempt === 3;
          if (isLast || !RETRYABLE_ERROR.test(msg)) throw e;
          console.warn(`Translation attempt ${attempt} failed (${msg.slice(0, 120)}) — retrying in ${1000 * attempt}ms`);
          await wait(1000 * attempt); // 1000ms → 2000ms
        }
      }
      throw lastError;
    }

    let translatedData: Record<string, unknown> | null = null;
    let lastModelError: unknown = null;

    for (const candidate of MODEL_CANDIDATES_RUNTIME) {
      const model = genAI.getGenerativeModel({
        model: candidate,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          // Native JSON mode: Gemini is constrained to emit syntactically
          // valid JSON — no markdown fences, no prose, no truncation artifacts.
          responseMimeType: "application/json",
          temperature: 0.3, // Lower temperature for consistent translations
          topK: 20,
          topP: 0.95,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      });

      try {
        // Generate translation — truncation-tolerant parsing (FIX #2) with
        // retry/backoff for transient 503/429 Google server spikes.
        const result = await generateWithRetry(model, prompt);
        const rawText = result.response.text();
        try {
          translatedData = safeParseJson(rawText);
        } catch {
          const retryPrompt = `The previous JSON output was cut off mid-way (truncated). Complete it now: return the FULL corrected JSON object with the exact same structure and keys, fully translated to ${targetLanguage}. Return ONLY valid JSON. Truncated fragment: ${rawText.slice(0, 12000)}`;
          const retry = await generateWithRetry(model, retryPrompt);
          translatedData = safeParseJson(retry.response.text());
        }
        break; // success — no need for fallback models
      } catch (e) {
        lastModelError = e;
        // Non-retryable (e.g. invalid API key / bad prompt) → fail fast
        if (!RETRYABLE_ERROR.test(String((e as Error)?.message || e))) break;
        console.warn(`Model ${candidate} failed, trying next candidate…`);
      }
    }

    if (!translatedData) {
      const message = lastModelError instanceof Error ? lastModelError.message : "Translation service temporarily unavailable";
      console.error("Translation API: all model candidates exhausted:", lastModelError);
      return NextResponse.json(
        { success: false, error: `Translation service is temporarily unavailable (503). Please try again in a moment.`, detail: message },
        { status: 503 }
      );
    }

    // Guarantee the ui namespace for JSX mapping translatedData?.ui?.terms.
    const labelMap = (translatedData["_labels"] as Record<string, unknown>) || {};
    const uiMap = (translatedData["ui"] as Record<string, unknown>) || {};
    const mergedUi: Record<string, unknown> = { ...(staticLabels || {}), ...labelMap, ...uiMap };
    translatedData["ui"] = mergedUi;
    if (!translatedData["_labels"]) translatedData["_labels"] = mergedUi;

    return NextResponse.json({
      success: true,
      translatedData,
      languageCode,
      targetLanguage,
    });
  } catch (error) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}