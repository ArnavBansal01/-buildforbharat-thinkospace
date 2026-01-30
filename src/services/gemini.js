import { GoogleGenerativeAI } from "@google/generative-ai";

let inFlight = false;

// --- GROQ SERVICE (TEXT ONLY) ---
// Keeps your fast Llama-3.3 model from Groq
export const generateText = async (prompt, apiKey) => {
  if (!apiKey) throw new Error("Groq API Key is missing.");
  if (inFlight) return;

  inFlight = true;
  const GROQ_MODEL = "llama-3.3-70b-versatile";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } finally {
    inFlight = false;
  }
};

// --- NANO BANANA PRO SERVICE (IMAGE GENERATION) ---
// Uses the Gemini 3 Pro model for 4K quality and high-fidelity text
export const generateImage = async (prompt, nanoKey) => {
  if (!nanoKey) throw new Error("Nano Banana API Key is missing.");
  
  const genAI = new GoogleGenerativeAI(nanoKey);
  
  // Nano Banana Pro runs on gemini-3-pro-image-preview
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

  try {
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: `A vibrant, high-fidelity educational cartoon of: ${prompt}. Professional illustration style.` }] 
      }],
      generationConfig: {
        // Required to tell the Pro model to return pixel data
        responseModalities: ["IMAGE"],
      }
    });

    // Extract the base64 data from the first image part
    const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);
    if (imagePart) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    return null;
  } catch (err) {
    console.error("Nano Banana Pro Error:", err);
    return null;
  }
};