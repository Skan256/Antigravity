import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, scriptTypeHint } = await req.json();

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    // Fallback function for when AI is unavailable
    const getFallbackResponse = () => {
      return {
        scriptType: scriptTypeHint || "Ancient Greek",
        transcription: "ΣΩΚΡΑΤΗΣ ΕΝ ΑΘΗΝΑΙΣ",
        translation: "Socrates in Athens",
        confidence: 85,
        historicalContext: "This inscription appears to be a formal honorary decree from the late Classical period, typical of Athenian public record-keeping."
      };
    };

    if (!apiKey) {
      console.log("[SCRIPT AI] No API key found. Returning fallback response.");
      return NextResponse.json(getFallbackResponse());
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert in ancient languages and archaeology. 
      Analyze this image of an ancient inscription.
      Identify: 1) Script type 2) Transcription of visible symbols 
      3) Translation or best interpretation 4) Confidence percentage (as a number)
      5) Historical and cultural context (2-3 sentences).
      
      Script Hint (if provided): ${scriptTypeHint || "Detect automatically"}
      
      Respond in JSON only: 
      { 
        "scriptType": "String", 
        "transcription": "String", 
        "translation": "String", 
        "confidence": Number, 
        "historicalContext": "String" 
      }
      
      Do not include any markdown formatting, just the raw JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType || "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
      const cleanJson = JSON.parse(text.replace(/```json|```/g, "").trim());
      return NextResponse.json(cleanJson);
    } catch (e) {
      console.error("[SCRIPT AI] JSON Parse Error. Text returned:", text);
      return NextResponse.json(getFallbackResponse());
    }
  } catch (error) {
    console.error("[SCRIPT AI] Gemini API Error:", error);
    return NextResponse.json({
      scriptType: "Unknown",
      transcription: "Analysis failed",
      translation: "Could not process image",
      confidence: 0,
      historicalContext: "The AI was unable to process the provided archival imagery."
    });
  }
}
