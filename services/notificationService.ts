
import { getGarbageForDate } from '../utils/garbageCalculator';
import { AppSettings } from '../types';
import { getMorningGreeting } from './geminiService';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('このブラウザは通知に対応していません。');
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
  
  // AIからメッセージを取得
  const message = await getMorningGreeting(settings.userName, garbageTypes);

  const title = garbageTypes.length > 0 
    ? `【ゴミ出し】今日は「${garbageTypes.join('、')}」の日です`
    : "おはようございます！";

  new Notification(title, {
    body: message,
    icon: '/favicon.ico', // アイコンがあれば表示
    badge: '/favicon.ico',
  });
};
