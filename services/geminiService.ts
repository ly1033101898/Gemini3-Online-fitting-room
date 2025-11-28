import { GoogleGenAI } from "@google/genai";

// Initialize the client
// API Key is automatically injected into process.env.API_KEY
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const BASE_URL = process.env.GEMINI_BASE_URL;
const API_KEY = process.env.GEMINI_API_KEY;

if (!BASE_URL || !API_KEY) {
  throw new Error("Please set GEMINI_BASE_URL and GEMINI_API_KEY in your environment variables.");
}

const ai = new GoogleGenAI({
  httpOptions: {
    baseUrl: BASE_URL,
  },
  apiKey: API_KEY,
});
/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param imageBase64 The base64 encoded string of the source image (raw data, no data URI prefix).
 * @param mimeType The MIME type of the source image.
 * @param prompt The text prompt describing the change.
 * @returns The base64 data URI of the generated image or null if failed.
 */
export const generateEditedImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const content = response.candidates[0].content;
    
    // Iterate through parts to find the image part
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct the data URI
        const resultMimeType = part.inlineData.mimeType || 'image/png';
        return `data:${resultMimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // If no image part found, maybe there's text explaining why
    const textPart = content.parts.find(p => p.text);
    if (textPart) {
      throw new Error(textPart.text);
    }

    return null;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};