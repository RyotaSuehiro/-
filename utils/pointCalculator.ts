
import { AppSettings, GarbageRule } from '../types';
import { getGarbageForDate } from './garbageCalculator';

/**
 * ゴミ出し予定がある日だけを抽出し、現在のポイントを計算する
 * 2回連続で「missed」があればポイント失効
 */
export const calculatePoints = (settings: AppSettings): { currentPoints: number; isGameOver: boolean } => {
  const history = settings.history;
  const rules = settings.rules;
  
  // 記録の最初の日から今日まで、ゴミ出し予定日をすべて抽出
  const datesWithGarbage: string[] = [];
  const sortedDates = Object.keys(history).sort();
  if (sortedDates.length === 0) return { currentPoints: 0, isGameOver: false };

  const firstDate = new Date(sortedDates[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(firstDate);
  while (checkDate <= today) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const garbage = getGarbageForDate(rules, checkDate);
    if (garbage.length > 0) {
      datesWithGarbage.push(dateStr);
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  let points = 0;
  let missedCount = 0;
  let totalMissedInARow = 0;

  for (const dateStr of datesWithGarbage) {
    const record = history[dateStr];
    
    if (record && record.status === 'completed') {
      points += 1;
      missedCount = 0; // 連続ミスリセット
    } else {
      // 過去の日付で記録がない、またはmissedの場合
      const isPast = new Date(dateStr) < today;
      if (isPast) {
        missedCount += 1;
        if (missedCount >= 2) {
          points = 0; // ポイント失効
        }
      }
    }
  }

  return { 
    currentPoints: points, 
    isGameOver: missedCount >= 2 
  };
};
