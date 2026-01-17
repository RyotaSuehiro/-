
import { GoogleGenAI } from "@google/genai";

/**
 * 毎朝の挨拶を生成する
 */
export const getMorningGreeting = async (userName: string, garbageList: string[]): Promise<string> => {
  // ガイドライン通り、オブジェクト形式でAPIキーを渡す
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    ユーザー名: ${userName}
    今日のゴミ: ${garbageList.length > 0 ? garbageList.join('、') : '今日はゴミ出しはありません'}
    
    上記の情報をもとに、親しみやすく洗練された短い朝の挨拶（80文字以内）を生成してください。
    ゴミ出しがある場合は忘れずに捨てるよう促し、ない場合はリラックスして過ごせるような一言を添えてください。
    Markdown形式（**など）は絶対に使用しないでください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // .text プロパティから直接取得 (メソッド呼び出しではない)
    const resultText = response.text;
    return resultText?.trim() || "おはようございます！今日も素敵な一日を。";
  } catch (error) {
    console.error("Gemini API Error (Morning Greeting):", error);
    return "おはよう！ゴミ出しの準備はできたかな？今日も頑張ろう！";
  }
};

/**
 * 分別の相談に乗る
 */
export const getSortingAdvice = async (item: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    君はユーザーの親しい友人であり、スマートな掃除のプロです。
    ゴミの分別について、LINEのように端的に教えて。
    
    質問: 「${item}」は何ゴミ？
    
    ルール:
    - 日本の一般的な分別（燃える、燃えない、プラなど）で回答。
    - 回答は極めて短く、1〜2行で。
    - Markdown形式は絶対に使わない。
    - 親しみやすい口調で。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    const resultText = response.text;
    return resultText?.trim() || "ごめん、ちょっと分からなかった。自治体のHPを確認してみてね！";
  } catch (error) {
    console.error("Gemini API Error (Sorting Advice):", error);
    return "ちょっと今AIの調子が悪いみたい。あとでまた聞いてね！";
  }
};
