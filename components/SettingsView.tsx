
import React, { useState, useEffect } from 'react';
import { AppSettings, GarbageRule, GarbageType, DayOfWeek } from '../types';
import { DAYS_JP, Icons } from '../constants';
import { requestNotificationPermission, sendTestNotification } from '../services/notificationService';

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
    if (granted) {
      alert('通知が許可されました！「テスト通知」で動作を確認してみてください。');
    }
  };

  const handleTestNotification = () => {
    setIsTestLoading(true);
    sendTestNotification(userName);
    setTimeout(() => setIsTestLoading(false), 6000);
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

      {/* Notification Status Banner */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">通知設定</label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${permissionStatus === 'granted' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {permissionStatus === 'granted' ? '許可済み' : '未許可'}
          </span>
        </div>

        {permissionStatus !== 'granted' ? (
          <button
            onClick={handleRequestPermission}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Icons.Bell />
            通知を許可する
          </button>
        ) : (
          <button
            onClick={handleTestNotification}
            disabled={isTestLoading}
            className={`w-full py-4 rounded-2xl text-sm font-bold border-2 border-emerald-500 text-emerald-600 transition-all flex items-center justify-center gap-3 ${isTestLoading ? 'opacity-50' : 'active:bg-emerald-50'}`}
          >
            {isTestLoading ? (
              '5秒後に通知が届きます...'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                通知をテストする
              </>
            )}
          </button>
        )}
        
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium px-1">
          ※ iPhoneの方は、まずSafariの共有メニューから「ホーム画面に追加」を行ってください。追加した後の「ごみしるべ」アプリ内で設定しないと通知は届きません。
        </p>
      </section>

      {/* User Info Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">ユーザー名</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="お名前を入力"
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 placeholder-slate-300 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">リマインド時間 (複数可)</label>
            <button 
              onClick={addTime}
              className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"
            >
              ＋ 追加
            </button>
          </div>
          <div className="space-y-3">
            {notificationTimes.map((time, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(idx, e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 outline-none"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                    <Icons.Bell />
                  </div>
                </div>
                {notificationTimes.length > 1 && (
                  <button 
                    onClick={() => removeTime(idx)}
                    className="bg-rose-50 text-rose-400 p-4 rounded-2xl transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">ゴミ出しルール</h2>
          <button
            onClick={addDefaultRule}
            className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
          >
            <Icons.Plus />
            種類を追加
          </button>
        </div>

        <div className="space-y-4">
          {settings.rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                    <Icons.Trash />
                  </div>
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(rule.id, { type: e.target.value as GarbageType })}
                    className="bg-transparent font-bold text-slate-800 rounded-lg py-1 outline-none text-sm appearance-none cursor-pointer"
                  >
                    {Object.values(GarbageType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 p-2 rounded-xl transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase block mb-2 px-1">曜日を選択 (複数可)</span>
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
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105'
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-300 uppercase block mb-2 px-1">実施する週</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateRule(rule.id, { weeksOfMonth: [] })}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                        rule.weeksOfMonth.length === 0 
                          ? 'bg-emerald-500 text-white shadow-md' 
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      毎週
                    </button>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(week => (
                        <button
                          key={week}
                          onClick={() => {
                            const newWeeks = rule.weeksOfMonth.includes(week)
                              ? rule.weeksOfMonth.filter(w => w !== week)
                              : [...rule.weeksOfMonth, week].sort();
                            updateRule(rule.id, { weeksOfMonth: newWeeks });
                          }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                            rule.weeksOfMonth.includes(week)
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-50 text-slate-300'
                          }`}
                        >
                          第{week}
                        </button>
                      ))}
                    </div>
                  </div>
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
