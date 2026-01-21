
import { GoogleGenAI, Type } from "@google/genai";
import { Property, UserPreferences, PropertyType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Uses Gemini to recommend top 3 properties based on renter preferences
 */
export const getRecommendedProperties = async (
  preferences: UserPreferences,
  allProperties: Property[]
): Promise<string[]> => {
  try {
    const propertySnapshot = allProperties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      area: p.area,
      type: p.propertyType,
      sqft: p.sqft,
      bedrooms: p.bedrooms
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Renter Preferences: ${JSON.stringify(preferences)}. 
      Available Properties: ${JSON.stringify(propertySnapshot)}. 
      Based on the preferences, return an array of up to 3 property IDs that are the best matches.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const recommendedIds = JSON.parse(response.text || '[]');
    return recommendedIds;
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return [];
  }
};

/**
 * AI-powered description generator for owners
 */
export const generatePropertyDescription = async (property: Partial<Property>): Promise<string> => {
  try {
    const prompt = `Write a short, catchy and professional real estate listing description for a ${property.propertyType} in ${property.area}. 
    Features: ${property.bedrooms} Bedrooms, ${property.bathrooms} Bathrooms, ${property.sqft} Sqft, ${property.furnishingStatus}. 
    Title: ${property.title}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Error generating description.";
  }
};
