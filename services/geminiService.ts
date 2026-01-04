import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function editImage(base64Image: string, prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  // Use Gemini 2.5 Flash Image (Nano banana) for image editing/generation
  const model = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png", // Assuming input is converted to PNG or compatible
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract image from response
    // The response for image generation/editing typically contains the image in the parts
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}