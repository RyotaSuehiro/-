
import React, { useState, useEffect } from 'react';
import { AppSettings, GarbageRule, GarbageType, DayOfWeek } from '../types';
import { DAYS_JP, Icons } from '../constants';
import { requestNotificationPermission, sendTestNotification } from '../services/notificationService';
import { generateIcsFile } from '../utils/icsGenerator';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [userName, setUserName] = useState(settings.userName);
  const [notificationTimes, setNotificationTimes] = useState(settings.notificationTimes);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [isTestLoading, setIsTestLoading] = useState(false);

  useEffect(() => {
    setUserName(settings.userName);
  }, [settings.userName]);

  useEffect(() => {
    setNotificationTimes(settings.notificationTimes);
  }, [settings.notificationTimes]);

  const toggleAlarm = () => {
    onUpdate({ ...settings, alarmEnabled: !settings.alarmEnabled });
  };

  const handleNameBlur = () => {
    onUpdate({ ...settings, userName });
  };

  const addTime = () => {
    const lastTime = notificationTimes[notificationTimes.length - 1] || '08:00';
    const [h, m] = lastTime.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(h, m + 5);
    const newTime = `${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`;
    
    const newTimes = [...notificationTimes, newTime].sort();
    setNotificationTimes(newTimes);
    onUpdate({ ...settings, notificationTimes: newTimes });
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...notificationTimes];
    newTimes[index] = value;
    setNotificationTimes(newTimes);
    onUpdate({ ...settings, notificationTimes: newTimes.sort() });
  };

  const removeTime = (index: number) => {
    if (notificationTimes.length <= 1) return;
    const newTimes = notificationTimes.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
    onUpdate({ ...settings, notificationTimes: newTimes });
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleTestNotification = () => {
    setIsTestLoading(true);
    sendTestNotification(userName);
    setTimeout(() => setIsTestLoading(false), 6000);
  };

  const handleExportIcs = () => {
    const icsContent = generateIcsFile(settings);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'garbage_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('カレンダー設定ファイルをダウンロードしました。iPhoneでこれを開いて「すべて追加」を押すと、標準アラームとして登録されます！');
  };

  const removeRule = (id: string) => {
    onUpdate({
      ...settings,
      rules: settings.rules.filter(r => r.id !== id)
    });
  };

  const addDefaultRule = () => {
    const newRule: GarbageRule = {
      id: Date.now().toString(),
      type: GarbageType.BURNABLE,
      daysOfWeek: [1],
      weeksOfMonth: []
    };
    onUpdate({
      ...settings,
      rules: [...settings.rules, newRule]
    });
  };

  const updateRule = (id: string, updates: Partial<GarbageRule>) => {
    onUpdate({
      ...settings,
      rules: settings.rules.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  return (
    <div className="px-6 py-6 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">設定</h2>
        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
          <Icons.Settings />
        </div>
      </div>

      {/* External Sync Section (Calendar Alarm) */}
      <section className="bg-blue-600 rounded-[32px] p-6 shadow-xl shadow-blue-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-2xl text-white">
              <Icons.Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">iPhoneアラーム連携</h3>
          </div>
          <p className="text-[10px] text-blue-100 font-bold leading-relaxed">
            iPhone標準のカレンダーにゴミ出し予定を登録します。アプリを閉じていても、iPhoneがアラームを鳴らしてくれるようになります。
          </p>
          <button
            onClick={handleExportIcs}
            className="w-full bg-white text-blue-600 py-3.5 rounded-2xl text-[11px] font-black shadow-lg active:scale-[0.98] transition-all"
          >
            カレンダーに登録する
          </button>
        </div>
      </section>

      {/* User Info Section */}
      <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">ユーザー名</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="お名前"
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-black text-slate-700 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">通知時間</label>
            <button 
              onClick={addTime}
              className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
            >
              追加
            </button>
          </div>
          <div className="space-y-3">
            {notificationTimes.map((time, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(idx, e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 outline-none"
                />
                {notificationTimes.length > 1 && (
                  <button 
                    onClick={() => removeTime(idx)}
                    className="bg-rose-50 text-rose-400 px-4 rounded-2xl"
                  >
                    <Icons.Plus className="rotate-45" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Existing Rules Section... */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">ゴミ出しルール</h2>
          <button
            onClick={addDefaultRule}
            className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"
          >
            ＋ ルールを追加
          </button>
        </div>

        <div className="space-y-4">
          {settings.rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-50 rounded-[32px] p-6 shadow-sm transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <select
                  value={rule.type}
                  onChange={(e) => updateRule(rule.id, { type: e.target.value as GarbageType })}
                  className="bg-slate-50 font-black text-slate-800 rounded-xl px-4 py-2 outline-none text-xs appearance-none cursor-pointer"
                >
                  {Object.values(GarbageType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button onClick={() => removeRule(rule.id)} className="text-rose-300">
                  <Icons.Plus className="rotate-45 w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between gap-1">
                  {DAYS_JP.map((day, idx) => {
                    const isSelected = rule.daysOfWeek.includes(idx as DayOfWeek);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const newDays = isSelected
                            ? rule.daysOfWeek.filter(d => d !== idx)
                            : [...rule.daysOfWeek, idx as DayOfWeek].sort();
                          updateRule(rule.id, { daysOfWeek: newDays });
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                          isSelected ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
