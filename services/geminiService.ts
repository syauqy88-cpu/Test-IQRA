import { GoogleGenAI, Type } from "@google/genai";

const SYLLABUS_MAP: Record<number, string> = {
  1: "Fokus: Huruf tunggal Hijaiyah baris Fathah.",
  2: "Fokus: Kasrah (bunyi 'i') dan Dhommah (bunyi 'u').",
  3: "Fokus: Tanween (an, in, un).",
  4: "Fokus: Huruf Bersambung.",
  5: "Fokus: Hukum Mad & Sukun.",
  6: "Fokus: Syaddah (Sabdu).",
  7: "Fokus: Hukum Nun/Mim Mati & Dengung.",
  8: "Fokus: Tanda Waqaf & Sujud Tilawah."
};

export async function getLevelGuidance(levelTitle: string, subtitle: string) {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan penerangan ringkas dan 3 contoh perkataan untuk tajuk pembelajaran agama: ${levelTitle} - ${subtitle}. Gunakan bahasa yang mudah untuk kanak-kanak.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.STRING }
          },
          required: ['explanation', 'examples', 'tips']
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function getQuizQuestions(levelId: number, levelTitle: string, subtitle: string, count: number = 10) {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  try {
    const syllabus = SYLLABUS_MAP[levelId] || `Fokus pada ${levelTitle}`;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai Guru Al-Quran pakar. Hasilkan ${count} soalan kuiz untuk ${levelTitle} (${subtitle}). Silibus: ${syllabus}. Format JSON sahaja.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctIndex', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return null;
  }
}