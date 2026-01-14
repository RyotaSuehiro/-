
import { GarbageRule, DayOfWeek } from '../types';

/**
 * Calculates which week of the month a given date falls into (1-indexed).
 */
export const getWeekOfMonth = (date: Date): number => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeekOfFirst = firstDayOfMonth.getDay();
  return Math.ceil((date.getDate() + dayOfWeekOfFirst) / 7);
};

/**
 * Checks if a specific rule applies to a given date.
 */
export const doesRuleApply = (rule: GarbageRule, date: Date): boolean => {
  const currentDayOfWeek = date.getDay() as DayOfWeek;
  
  // 指定された曜日に含まれているかチェック
  if (!rule.daysOfWeek.includes(currentDayOfWeek)) return false;

  // weeksOfMonthが空なら「毎週」
  if (rule.weeksOfMonth.length === 0) return true;

  const currentWeekOfMonth = getWeekOfMonth(date);
  return rule.weeksOfMonth.includes(currentWeekOfMonth);
};

/**
 * Gets all applicable garbage types for a given date.
 */
export const getGarbageForDate = (rules: GarbageRule[], date: Date): GarbageRule[] => {
  return rules.filter(rule => doesRuleApply(rule, date));
};

/**
 * Gets the next collection date for each rule starting from a specific date.
 */
export const getNextOccurrences = (rules: GarbageRule[], startDate: Date, daysAhead: number = 7): { date: Date, rules: GarbageRule[] }[] => {
  const results = [];
  for (let i = 0; i <= daysAhead; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    const applicable = getGarbageForDate(rules, checkDate);
    if (applicable.length > 0) {
      results.push({ date: checkDate, rules: applicable });
    }
  }
  return results;
};
