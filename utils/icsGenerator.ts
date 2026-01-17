
import { AppSettings, GarbageRule, DayOfWeek } from '../types';

const DAY_MAP: Record<DayOfWeek, string> = {
  0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA'
};

/**
 * ゴミ出しルールからiCalendar形式の文字列を生成する
 */
export const generateIcsFile = (settings: AppSettings): string => {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PROID:-//Gominabi AI//JP',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ごみしるべ予定表',
    'X-WR-TIMEZONE:Asia/Tokyo'
  ];

  settings.rules.forEach((rule) => {
    const days = rule.daysOfWeek.map(d => DAY_MAP[d]).join(',');
    // 各通知時間ごとにイベントを作成
    settings.notificationTimes.forEach((time, tIdx) => {
      const [hh, mm] = time.split(':');
      const uid = `rule-${rule.id}-${tIdx}@gominabi-ai`;
      
      ics = ics.concat([
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        // 明日の朝から開始するように設定
        `DTSTART;TZID=Asia/Tokyo:${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate() + 1).padStart(2, '0')}T${hh}${mm}00`,
        `SUMMARY:ゴミ出し: ${rule.type}`,
        `DESCRIPTION:${settings.userName}さん、${rule.type}を捨てる時間ですよ！`,
        // 繰り返しルール (毎週)
        `RRULE:FREQ=WEEKLY;BYDAY=${days}`,
        // アラーム設定 (0分前)
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:ゴミ出しの時間です: ${rule.type}`,
        'TRIGGER:-PT0M',
        'END:VALARM',
        'END:VEVENT'
      ]);
    });
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
};
