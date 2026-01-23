
import { AppSettings, GarbageRule } from '../types';
import { getGarbageForDate } from './garbageCalculator';

/**
 * 日付オブジェクトから「YYYY-MM-DD」形式のローカル文字列を生成
 */
const toLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 「YYYY-MM-DD」形式の文字列から、その日の「正午」のDateオブジェクトを作成
 * (タイムゾーンによる曜日のズレを防ぐため)
 */
const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

/**
 * ポイントを計算する
 */
export const calculatePoints = (settings: AppSettings): { currentPoints: number; isGameOver: boolean } => {
  const history = settings.history;
  const rules = settings.rules;
  
  // 記録されている日付のリスト
  const sortedHistoryDates = Object.keys(history).sort();
  if (sortedHistoryDates.length === 0) return { currentPoints: 0, isGameOver: false };

  const today = new Date();
  const todayStr = toLocalDateStr(today);
  
  // 最初の記録日から今日までの、ゴミ出しが必要だった日をすべてリストアップ
  const datesToReview: string[] = [];
  let runner = parseLocalDate(sortedHistoryDates[0]);
  const end = parseLocalDate(todayStr);

  while (runner <= end) {
    const dStr = toLocalDateStr(runner);
    const garbageRules = getGarbageForDate(rules, runner);
    if (garbageRules.length > 0) {
      datesToReview.push(dStr);
    }
    runner.setDate(runner.getDate() + 1);
  }

  let points = 0;
  let missedCount = 0;

  for (const dateStr of datesToReview) {
    const record = history[dateStr];
    
    if (record && record.status === 'completed') {
      points += 1;
      missedCount = 0; // 連続ミスをリセット
    } else {
      // 過去のゴミ出し日の記録がない or missed の場合
      // ただし、今日がまだ未完了なだけのときは「ミス」としてカウントしない
      if (dateStr !== todayStr) {
        missedCount += 1;
        if (missedCount >= 2) {
          points = 0; // 2回連続ミスでリセット
        }
      }
    }
  }

  return { 
    currentPoints: points, 
    isGameOver: missedCount >= 2 
  };
};
