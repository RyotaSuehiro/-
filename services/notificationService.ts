
import { getGarbageForDate } from '../utils/garbageCalculator';
import { AppSettings } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendGarbageNotification = async (settings: AppSettings) => {
  if (Notification.permission !== 'granted') return;

  const today = new Date();
  const rules = getGarbageForDate(settings.rules, today);
  const garbageTypes = rules.map(r => r.type);
  
  if (garbageTypes.length === 0) return;

  const title = `【ゴミ出し】今日は「${garbageTypes.join('、')}」の日です`;
  const body = `おはようございます、${settings.userName}さん。ゴミを出して、写真を撮ってポイントをゲットしましょう！`;

  new Notification(title, {
    body,
    icon: 'https://cdn-icons-png.flaticon.com/512/542/542713.png',
  });
};
