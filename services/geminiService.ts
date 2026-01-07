
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePhotos = async (images: string[]): Promise<string> => {
  // We send a batch of thumbnails to Gemini to get a "Wedding Memory Summary"
  const imageParts = images.map(base64 => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: base64.split(',')[1]
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...imageParts,
        { text: "These are photos from a wedding. Based on these images, write a poetic and romantic summary (3-4 sentences) of the mood and memories captured. Focus on love, celebration, and the beauty of the couple." }
      ]
    },
    config: {
      temperature: 0.8,
      topP: 0.9,
    }
  });

  return response.text || "A beautiful collection of memories from a day filled with love.";
};
