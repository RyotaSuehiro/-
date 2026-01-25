
/**
 * Dateオブジェクトからローカル時間の YYYY-MM-DD 文字列を取得する
 */
export const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * YYYY-MM-DD 文字列からローカル時間の正午のDateオブジェクトを作成する
 * (タイムゾーンのズレによる計算ミスを防ぐため)
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};
