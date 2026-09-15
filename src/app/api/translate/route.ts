import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  try {
    const cleaned = (raw || "").replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // continue to repair
      }
    }
    try {
      return JSON.parse(cleaned);
    } catch {
      // continue to repair
    }
    return null;
  } catch {
    return null;
  }
}

function repairTruncatedJson(raw: string): string {
  let text = (raw || "").replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    text = text.slice(start, end + 1);
    try {
      JSON.parse(text);
      return text;
    } catch {
      // fall through
    }
  } else if (start !== -1) {
    text = text.slice(start);
  }
  let repaired = text;
  let inString = false;
  let escaped = false;
  for (const ch of repaired) {
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { if (inString) escaped = true; continue; }
    if (ch === '"') inString = !inString;
  }
  if (inString) {
    const lastQuote = repaired.lastIndexOf('"');
    repaired = repaired.slice(0, lastQuote).replace(/[,:]\\s*$/, "").trim();
  } else {
    repaired = repaired
      .replace(/,\s*$/, "")
      .replace(/:\s*(\"[^\"]*)?$/, "")
      .replace(/:\s*$/, "")
      .replace(/\b(tru?|fals?|nul?|n?)\s*$/i, "")
      .replace(/,\s*$/, "")
      .trim();
  }
  inString = false;
  escaped = false;
  const stack: string[] = [];
  for (const ch of repaired) {
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { if (inString) escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
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

const PROMPT_TEMPLATE = `You are a professional translator. Translate the following JSON data to {language}.

Rules:
- Translate all string values ONLY. Do NOT translate keys, numbers, booleans, null.
- Preserve all JSON structure exactly.
- Return ONLY valid JSON. No explanations, no markdown fences.
- If a value is already a translation or contains proper nouns, keep it as-is.

JSON data:
{data}`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sourceLang = searchParams.get("sourceLang") || "en";
  const targetLang = searchParams.get("targetLang") || "ar";
  const dataJson = searchParams.get("data");

  if (!dataJson) {
    return NextResponse.json(
      { error: "Missing 'data' parameter" },
      { status: 400 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(dataJson);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in 'data' parameter" },
      { status: 400 }
    );
  }

  if (!genAI) {
    return NextResponse.json(
      { error: "Translation service not configured (GEMINI_API_KEY missing)" },
      { status: 503 }
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    });

    const prompt = PROMPT_TEMPLATE
      .replace("{language}", targetLang)
      .replace("{data}", JSON.stringify(data, null, 2));

    // Wrap model.generateContent in a while(retries > 0) loop with try/catch
    let retries = 3;
    let lastError: Error | null = null;
    let result;

    while (retries > 0) {
      try {
        result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            responseMimeType: "application/json",
          },
        });
        break;
      } catch (error: any) {
        lastError = error;
        const msg = error.message || String(error);
        const isRetryable = msg.includes("503") || msg.includes("429") || 
                           msg.includes("timeout") || msg.includes("rate limit") ||
                           msg.includes("Server") || msg.includes("connection");
        if (isRetryable && retries > 1) {
          console.warn(`Translation attempt failed: ${msg.slice(0, 100)}. Retrying in 2000ms...`);
          await new Promise((r) => setTimeout(r, 2000));
          retries--;
          continue;
        }
        throw error;
      }
    }
    const responseText = result!.response.text();
    let parsed = safeParseJson(responseText);
    if (!parsed) {
      const repaired = repairTruncatedJson(responseText);
      parsed = safeParseJson(repaired);
    }

    if (!parsed) {
      console.warn("Initial translation was truncated, requesting completion...");
      const completionPrompt = `The previous JSON output was cut off mid-way (truncated). Complete it now: return the FULL corrected JSON object with the exact same structure and keys, fully translated to ${targetLang}. Return ONLY valid JSON. Truncated fragment: ${responseText.slice(0, 12000)}`;

      retries = 2;
      while (retries > 0) {
        try {
          const retryResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: completionPrompt }] }],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              responseMimeType: "application/json",
            },
          });
          parsed = safeParseJson(retryResult.response.text());
          if (parsed) break;
          const repaired2 = repairTruncatedJson(retryResult.response.text());
          parsed = safeParseJson(repaired2);
          if (parsed) break;
          retries--;
          if (retries > 0) { await new Promise((r: (v: void) => void) => setTimeout(r, 2000)); }
        } catch (e) {
          retries--;
          if (retries === 0) throw e;
          await new Promise((r: (v: void) => void) => setTimeout(r, 2000));
        }
      }
    }


    if (!parsed) {
      return NextResponse.json({
        success: false,
        error: "Failed to generate valid JSON translation",
        detail: responseText.slice(0, 500),
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      translatedData: parsed,
      sourceLang,
      targetLang,
    });
  } catch (error: any) {
    console.error("Translation API error:", error);
    const message = error.message || String(error);
    let status = 500;
    let userMessage = "Translation failed";

    if (message.includes("503") || message.includes("unavailable")) {
      status = 503;
      userMessage = "Translation service temporarily unavailable (503). Please try again in a moment.";
    } else if (message.includes("429")) {
      status = 429;
      userMessage = "Too many translation requests. Please try again later.";
    }

    return NextResponse.json({ success: false, error: userMessage, detail: message }, { status });
  }
}