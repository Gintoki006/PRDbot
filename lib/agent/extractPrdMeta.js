import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractPrdMeta(prdText) {
  const fallback = { targetUser: "", coreFocus: "", outOfScope: [], antiPatterns: [] };
  
  if (!process.env.GEMINI_API_KEY || !prdText) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Extract the following from this PRD and return ONLY valid JSON:
{
  "targetUser": "...",
  "coreFocus": "...",
  "outOfScope": ["...", "..."],
  "antiPatterns": ["...", "..."]
}`
    });

    const result = await model.generateContent(prdText);
    const responseText = result.response.text();
    
    // Strip markdown fences from response if present
    const cleanJson = responseText.replace(/```json|```/gi, "").trim();

    const parsed = JSON.parse(cleanJson);
    
    return {
      targetUser: parsed.targetUser || "",
      coreFocus: parsed.coreFocus || "",
      outOfScope: Array.isArray(parsed.outOfScope) ? parsed.outOfScope : [],
      antiPatterns: Array.isArray(parsed.antiPatterns) ? parsed.antiPatterns : [],
    };
  } catch (error) {
    console.error("[PRD_META_EXTRACTION_ERROR]", error);
    return fallback;
  }
}
