
import { GoogleGenAI } from "@google/genai";
import { GarbageType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a friendly morning greeting based on today's garbage.
 */
export const getMorningGreeting = async (userName: string, garbageList: string[]): Promise<string> => {
  const prompt = `
    ユーザー名: ${userName}
    今日のゴミ: ${garbageList.length > 0 ? garbageList.join('、') : '今日はゴミ出しはありません'}
    
    上記の情報をもとに、親しみやすく、洗練された短い朝の挨拶（80文字以内）を生成してください。
    ゴミ出しがある場合は忘れずに捨てるよう促し、ない場合はリラックスして過ごせるような一言を添えてください。
    Markdown形式は使用しないでください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "おはようございます！今日も素敵な一日になりますように。";
  } catch (error) {
    console.error("AI Greeting Error:", error);
    return "おはようございます！ゴミ出しの準備はできましたか？今日も頑張りましょう！";
  }
};

/**
 * Provides advice on how to sort specific waste items in a friendly, concise manner.
 */
export const getSortingAdvice = async (item: string): Promise<string> => {
  const prompt = `
    君はユーザーの親しい友人であり、スマートな掃除のプロです。
    ゴミの分別について、LINEのように端的に、かつ洗練された口調（丁寧すぎず、崩しすぎない）で教えて。
    
    質問: 「${item}」は何ゴミ？
    
    ルール:
    - 日本の一般的な分別（燃える、燃えない、プラなど）で回答。
    - 回答は極めて短く、1〜2行で。
    - Markdown形式（# や ** やリスト）は絶対に使わない。
    - 「〜だよ！」「〜だね」といった親しみやすい口調で。
    - 自治体によってルールが異なる点もさらっと添えて。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "ごめん、ちょっと分からなかった。自治体のHPを確認してみてね！";
  } catch (error) {
    console.error("AI Sorting Error:", error);
    return "ちょっと今通信が悪いみたい。あとでまた聞いてね！";
  }
};
