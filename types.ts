
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export enum GarbageType {
  BURNABLE = '燃えるゴミ',
  NON_BURNABLE = '燃えないゴミ',
  PLASTIC = 'プラスチック',
  RECYCLABLE = '資源ゴミ',
  PAPER = '古紙・段ボール',
  BOTTLES_CANS = 'びん・缶・ペットボトル',
  LARGE = '粗大ゴミ',
  OTHER = 'その他'
}

export interface GarbageRule {
  id: string;
  type: GarbageType;
  daysOfWeek: DayOfWeek[];
  weeksOfMonth: number[];
  customLabel?: string;
}

export interface AppSettings {
  userName: string;
  notificationTimes: string[];
  rules: GarbageRule[];
  alarmEnabled: boolean; // アラーム音の有効化フラグ
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
