import { AIResponseSchema } from '../types';

export const generateBeadPalette = async (theme: string): Promise<AIResponseSchema | null> => {
  console.log("Générateur IA désactivé. Utilisez les couleurs prédéfinies.");
  alert("⚠️ Le générateur IA est désactivé dans cette version. Utilisez les 40+ couleurs disponibles dans la palette !");
  return null;
};
