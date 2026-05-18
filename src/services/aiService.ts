import { PlaceCategory } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-flash-latest";

export interface AISummary {
  description: string;
  category: PlaceCategory;
  estimatedDuration: number;
}

export const summarizePlace = async (
  name: string,
  address: string,
  types: string[],
  retries = 3
): Promise<AISummary> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing");
  }

  const prompt = `
    Analyze the following place: "${name}" at "${address}".
    Google Maps types: ${types.join(", ")}.

    Provide 3-7 comma-separated, punchy phrases highlighting the core vibe and what it's famous for (e.g. "Best matcha in Kyoto, quiet atmosphere, historic architecture"). 
    IMPORTANT: Make it sound natural, casual, and straight to the point. NO fluff, NO typical AI marketing speak (avoid words like "bustling", "vibrant", "unforgettable").
    Also, categorize it into one of these: museum, restaurant, coffee_shop, park, landmark, shopping, entertainment, beach, religious_site, nightlife, other.
    Finally, suggest a typical visit duration in minutes.

    Return ONLY a JSON object in this format:
    {
      "description": "string",
      "category": "string",
      "estimatedDuration": number
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Gemini API rate limit hit. Retrying in 25s...`);
        await new Promise((resolve) => setTimeout(resolve, 25000));
        return summarizePlace(name, address, types, retries - 1);
      }
      let errorMessage = "Failed to call Gemini API";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty response from Gemini");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
