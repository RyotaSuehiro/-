
import { getGarbageForDate } from '../utils/garbageCalculator';
import { AppSettings } from '../types';
import { getMorningGreeting } from './geminiService';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('このブラウザは通知に対応していません。');
    alert('お使いのブラウザは通知に対応していません。iPhoneの場合は、まずホーム画面に追加してから設定を開いてください。');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * 実際のゴミ出し通知
 */
export const sendGarbageNotification = async (settings: AppSettings) => {
  if (Notification.permission !== 'granted') return;

  const today = new Date();
  const rules = getGarbageForDate(settings.rules, today);
  const garbageTypes = rules.map(r => r.type);
  
  const message = await getMorningGreeting(settings.userName, garbageTypes);

  const title = garbageTypes.length > 0 
    ? `【ゴミ出し】今日は「${garbageTypes.join('、')}」の日です`
    : "おはようございます！";

  new Notification(title, {
    body: message,
    icon: 'https://cdn-icons-png.flaticon.com/512/542/542713.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/542/542713.png',
  });
};

/**
 * テスト通知（5秒後に送信）
 */
export const sendTestNotification = (userName: string) => {
  if (Notification.permission !== 'granted') {
    alert('通知許可がありません。');
    return;
  }

  setTimeout(() => {
    new Notification("ごみしるべ通知テスト", {
      body: `こんにちは、${userName}さん！通知はバッチリ届いていますよ。`,
      icon: 'https://cdn-icons-png.flaticon.com/512/542/542713.png',
    });
  }, 5000);
};
