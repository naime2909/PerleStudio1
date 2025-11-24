import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIResponseSchema } from '../types';

export const generateBeadPalette = async (theme: string): Promise<AIResponseSchema | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("API Key Gemini manquante. Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env");
    alert("⚠️ Clé API Gemini manquante. Veuillez configurer VITE_GEMINI_API_KEY dans les variables d'environnement.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Génère une palette de couleurs de perles pour bracelet basée sur le thème : "${theme}". 
    
Retourne un JSON avec cette structure exacte:
{
  "paletteName": "Nom créatif de la palette",
  "description": "Description courte de l'ambiance",
  "colors": [
    {
      "name": "Nom de la couleur en français",
      "hex": "#XXXXXX",
      "suggestion": "Mat, Brillant, Cristal, Bois ou Métal"
    }
  ]
}

Donne 5 à 8 couleurs cohérentes et harmonieuses pour un bracelet élégant.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) return null;
    
    // Nettoyer le texte (enlever les ```json si présents)
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText) as AIResponseSchema;

  } catch (error) {
    console.error("Erreur lors de la génération de la palette:", error);
    alert("❌ Erreur lors de la génération. Vérifiez votre clé API Gemini.");
    return null;
  }
};
