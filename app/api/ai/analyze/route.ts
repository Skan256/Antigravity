import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const { title, period, location, description } = await req.json();

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  // Fallback function for when AI is unavailable
  const getFallbackResponse = () => {
    return {
      interpretation: `Based on the ${period} dating and ${location} context, this artifact suggests a transitionary phase in local craftsmanship. The ${title} design reflects established aesthetic patterns of the region's cultural lineage.`,
      usage: `Standard archaeological models indicate this likely served a functional role in daily life, potentially involving storage or ritualistic presentation, consistent with other finds from ${location}.`,
      significance: `This discovery strengthens the chronological mapping of ${period} activities at the site. It serves as a key indicator of material exchange and domestic stability within the identified stratum.`
    };
  };

  if (!apiKey) {
    console.log("[AI] No API key found. Returning fallback response.");
    return NextResponse.json(getFallbackResponse());
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert archaeological AI analyst. 
      Analyze the following artifact and provide a structured JSON response.
      
      Artifact Title: ${title}
      Period: ${period}
      Location: ${location}
      Description: ${description}

      Return exactly this JSON structure:
      {
        "interpretation": "A 2-3 sentence historical interpretation",
        "usage": "1-2 sentences on possible usage",
        "significance": "1-2 sentences on cultural significance"
      }
      
      Do not include any markdown formatting, just the raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const cleanJson = JSON.parse(text.replace(/```json|```/g, "").trim());
      return NextResponse.json(cleanJson);
    } catch (e) {
      console.error("[AI] JSON Parse Error. Text returned:", text);
      return NextResponse.json(getFallbackResponse());
    }
  } catch (error) {
    console.error("[AI] Gemini API Error:", error);
    return NextResponse.json(getFallbackResponse());
  }
}
