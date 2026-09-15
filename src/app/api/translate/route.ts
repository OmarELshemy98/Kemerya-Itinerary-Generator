import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";
// الحل 2: إزالة { apiVersion: "v1" } عشان المكتبة تشتغل بالديفولت الصحيح بتاعها
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function POST(request: NextRequest) {
  if (!genAI) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Translation service unavailable — GEMINI_API_KEY is not configured on the server.",
      },
      { status: 503 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const {
    targetLanguage,
    itineraryData,
    staticLabels,
    languageCode,
  } = body as {
    targetLanguage?: string;
    itineraryData?: Record<string, unknown>;
    staticLabels?: Record<string, unknown>;
    languageCode?: string;
  };

  const targetLang = (targetLanguage || languageCode || "ar").trim();

  if (!itineraryData && !staticLabels) {
    return NextResponse.json(
      { success: false, error: "Missing payload — provide itineraryData or staticLabels" },
      { status: 400 }
    );
  }

  const merged: Record<string, unknown> = {
    ...(itineraryData ?? {}),
    ...(staticLabels ?? {}),
  };

  if (Object.keys(merged).length === 0) {
    return NextResponse.json({
      success: true,
      translatedData: {},
      languageCode: targetLang,
      targetLanguage: targetLang,
    });
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const prompt = `You are a professional translator for a luxury Egyptian travel agency (Kemerya Tours).
Target language: ${targetLang}

CRITICAL INSTRUCTIONS:
1. Translate ALL human-readable STRING VALUES inside the following JSON payload.
2. NEVER translate JSON KEYS — keep every key EXACTLY as it is (including English keys like "title", "description", "inclusions", "price", etc.).
3. NEVER translate numbers, booleans, null, currency codes, URLs, or dates.
4. Preserve the EXACT JSON structure. Keep arrays as arrays, objects as objects, nested keys in their place.
5. Proper nouns (Giza Pyramids, Luxor Temple, Cairo, Nile, Hurghada, etc.) should be transliterated naturally into the target language when appropriate.
6. RETURN ONLY A SINGLE VALID JSON OBJECT. No markdown fences, no prose, no explanations.

JSON payload to translate:
${JSON.stringify(merged)}`;

  const generationConfig = {
    maxOutputTokens: 16384,
    temperature: 0.1,
    topK: 40,
    topP: 0.95,
    responseMimeType: "application/json" as const,
  };

  let retries = 3;
  let lastError: Error | null = null;
  let parsed: Record<string, unknown> | null = null;

  while (retries > 0) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const rawText = result.response.text().trim();
      if (!rawText) {
        throw new Error("Gemini returned an empty translation response.");
      }
      const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      const candidate =
        start !== -1 && end > start
          ? cleaned.slice(start, end + 1)
          : cleaned;

      const value = JSON.parse(candidate) as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Gemini returned valid JSON, but it was not a JSON object.");
      }
      parsed = value as Record<string, unknown>;
      break;
    } catch (err: any) {
      lastError = err;
      console.error(`[translate] Gemini attempt failed (${retries} remaining):`, err);
      retries--;
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  if (!parsed) {
    const userMessage =
      targetLang === "ar" || targetLang.startsWith("ar")
        ? "فشل ترجمة البيانات بعد عدة محاولات. الرجاء المحاولة مرة أخرى."
        : "Failed to produce a valid translated JSON after multiple attempts. Please try again.";
    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        detail: lastError?.message || "Unknown translation error",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    translatedData: parsed,
    languageCode: targetLang,
    targetLanguage: targetLang,
  });
}