import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/lib/env";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt for luxury travel translation
const SYSTEM_PROMPT = `You are a luxury travel API. Translate ALL values in the provided JSON object to the target language.
Keep the exact JSON keys intact. Do not translate the keys. Maintain a premium, high-end hospitality tone.
Return ONLY raw JSON without any markdown formatting, explanations, or additional text.
If a value is already in the target language, leave it unchanged.
Preserve all numbers, dates (in their original format), currency symbols, and special characters.`;

interface TranslationRequest {
  targetLanguage: string;
  itineraryData: Record<string, unknown>;
  staticLabels: Record<string, string>;
  languageCode: string;
}

export async function POST(request: NextRequest) {
  try {
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
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.3, // Lower temperature for consistent translations
        topK: 20,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Generate translation
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up response - remove markdown code blocks if present
    const cleanedJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse the translated JSON
    const translatedData = JSON.parse(cleanedJson);

    return NextResponse.json({
      success: true,
      translatedData,
      languageCode,
      targetLanguage,
    });
  } catch (error) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      {
        error: "Translation failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}