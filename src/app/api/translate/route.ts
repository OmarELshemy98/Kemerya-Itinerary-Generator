import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force dynamic execution to prevent static evaluation at build time
export const dynamic = "force-dynamic";

// System prompt for luxury travel translation (used with native JSON mode)
const SYSTEM_PROMPT = `Translate the values of this JSON object to the target language. Return ONLY a valid JSON object.`;

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

    // Combine itinerary data with static labels for translation
    const dataToTranslate = {
      ...itineraryData,
      _labels: staticLabels,
    };

    // Create prompt for Gemini
    const prompt = `Translate the following JSON data to ${targetLanguage}. 
Return ONLY the translated JSON with the exact same structure. ${SYSTEM_PROMPT}

Here is the JSON to translate:
${JSON.stringify(dataToTranslate, null, 2)}`;

    // Get Gemini model

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        // Native JSON mode: Gemini is constrained to emit syntactically
        // valid JSON — no markdown fences, no prose, no truncation artifacts.
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for consistent translations
        topK: 20,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Generate translation
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Strictly safe parsing: even with native JSON mode enabled, strip any
    // potential markdown code fences / stray whitespace before JSON.parse.
    responseText = responseText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Defensive: extract the outermost JSON object if any leading/trailing
    // prose slipped through despite JSON mode.
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      responseText = responseText.slice(jsonStart, jsonEnd + 1);
    }

    const translatedData = JSON.parse(responseText);

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