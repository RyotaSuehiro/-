
import { GoogleGenAI } from "@google/genai";

/**
 * ユーザーへの朝の挨拶を生成します。
 * Gemini APIを使用して、ゴミ出しの種類に応じたパーソナライズされたメッセージを生成します。
 */
export const getMorningGreeting = async (userName: string, garbageTypes: string[]): Promise<string> => {
  // process.env.API_KEY を使用して GoogleGenAI を初期化
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = garbageTypes.length > 0
    ? `あなたは親切なゴミ出しサポートAIです。${userName}さんに朝の挨拶をしてください。
       今日は「${garbageTypes.join('、')}」の日であることを伝え、ゴミ出しを忘れないように、
       やる気の出る短くて明るいメッセージを一言（30文字以内）で作成してください。`
    : `あなたは親切なゴミ出しサポートAIです。${userName}さんに朝の挨拶をしてください。
       今日はゴミ出しの予定はありません。一日が楽しくなるような短くて明るいメッセージを一言（30文字以内）で作成してください。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // response.text プロパティからテキストを取得
    return response.text?.trim() || "おはようございます！今日も一日頑張りましょう！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "おはようございます！今日も一日頑張りましょう！";
  }
};
