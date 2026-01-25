
import { AppSettings } from '../types';
import { getGarbageForDate } from './garbageCalculator';
import { formatLocalDate, parseLocalDate } from './dateUtils';

/**
 * ポイントを計算する
 */
export const calculatePoints = (settings: AppSettings): { currentPoints: number; isGameOver: boolean } => {
  const history = settings.history;
  const rules = settings.rules;
  
  const sortedHistoryDates = Object.keys(history).sort();
  if (sortedHistoryDates.length === 0) return { currentPoints: 0, isGameOver: false };

  const today = new Date();
  const todayStr = formatLocalDate(today);
  
  // 最初の記録日から今日までの、ゴミ出しが必要だった日をすべてリストアップ
  const datesToReview: string[] = [];
  let runner = parseLocalDate(sortedHistoryDates[0]);
  const end = parseLocalDate(todayStr);

  while (runner <= end) {
    const dStr = formatLocalDate(runner);
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
      missedCount = 0;
    } else {
      // 今日以外で未達成の日があればミスとしてカウント
      if (dateStr !== todayStr) {
        missedCount += 1;
        if (missedCount >= 2) {
          points = 0; 
        }
      }
    }
  }

  return { 
    currentPoints: points, 
    isGameOver: missedCount >= 2 
  };
};
