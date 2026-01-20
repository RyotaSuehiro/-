
import React, { useState, useEffect } from 'react';
import { AppSettings, GarbageRule, GarbageType, DayOfWeek } from '../types';
import { DAYS_JP, Icons } from '../constants';
import { requestNotificationPermission } from '../services/notificationService';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [userName, setUserName] = useState(settings.userName);
  const [notificationTimes, setNotificationTimes] = useState(settings.notificationTimes);
  const [showAlarmSync, setShowAlarmSync] = useState(false);

  useEffect(() => {
    setUserName(settings.userName);
  }, [settings.userName]);

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
    const newTimes = notificationTimes.filter((_, i) => i !== index);
    setNotificationTimes(newTimes);
    onUpdate({ ...settings, notificationTimes: newTimes });
  };

  const copyApiUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const apiUri = `${baseUrl}?mode=api`;
    navigator.clipboard.writeText(apiUri);
    alert('連携URLをコピーしました！ショートカットでこれを使うだけで、アラームが自動同期されます。');
  };

  const addDefaultRule = () => {
    const newRule: GarbageRule = {
      id: Date.now().toString(),
      type: GarbageType.BURNABLE,
      daysOfWeek: [1],
      weeksOfMonth: []
    };
    onUpdate({ ...settings, rules: [...settings.rules, newRule] });
  };

  const updateRule = (id: string, updates: Partial<GarbageRule>) => {
    onUpdate({
      ...settings,
      rules: settings.rules.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRule = (id: string) => {
    onUpdate({ ...settings, rules: settings.rules.filter(r => r.id !== id) });
  };

  return (
    <div className="px-6 py-6 animate-in slide-in-from-bottom-6 duration-700 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">設定</h2>
      </div>

      {/* --- iPhone標準アラーム同期セクション --- */}
      <section className="bg-slate-900 rounded-[32px] p-6 shadow-2xl shadow-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Icons.Bell className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Icons.Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">iPhone標準アラーム同期</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Clock App Sync</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
            iPhoneの「時計」アプリのアラームを自動的にセットします。
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyApiUrl}
              className="bg-emerald-500 text-white py-4 rounded-2xl text-[11px] font-black shadow-lg active:scale-95 transition-all"
            >
              連携URLをコピー
            </button>
            <button
              onClick={() => setShowAlarmSync(!showAlarmSync)}
              className="bg-slate-800 text-slate-300 py-4 rounded-2xl text-[11px] font-black border border-slate-700 active:scale-95 transition-all"
            >
              設定ガイド
            </button>
          </div>

          {showAlarmSync && (
            <div className="bg-slate-800/50 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center shrink-0 font-black">1</span>
                <p className="text-[10px] text-slate-200 font-bold leading-normal">
                  「ショートカット」アプリでオートメーションを作成。<br/>
                  <span className="text-emerald-400">「時刻：{notificationTimes[0]}」</span>を選択。
                </p>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center shrink-0 font-black">2</span>
                <p className="text-[10px] text-slate-200 font-bold leading-normal">
                  アクションを追加：<br/>
                  <span className="text-emerald-400">「URLの内容を取得」</span>を選び、コピーしたURLを貼る。
                </p>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center shrink-0 font-black">3</span>
                <p className="text-[10px] text-slate-200 font-bold leading-normal">
                  最後のアクション：<br/>
                  <span className="text-emerald-400">「アラームを作成」</span>または<span className="text-emerald-400">「テキストを読み上げる」</span>を追加して完了！
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Profile Section */}
      <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-300 uppercase mb-3 ml-1 tracking-[0.2em]">User Profile</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onBlur={handleNameBlur}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-50"
            placeholder="お名前"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Notification Time</label>
            <button onClick={addTime} className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase">Add Time</button>
          </div>
          <div className="space-y-3">
            {notificationTimes.map((time, idx) => (
              <div key={idx} className="flex gap-3 animate-in fade-in">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(idx, e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 outline-none"
                />
                {notificationTimes.length > 1 && (
                  <button onClick={() => removeTime(idx)} className="bg-rose-50 text-rose-400 px-5 rounded-2xl active:scale-95 transition-all">
                    <Icons.Plus className="rotate-45 w-5 h-5" />
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
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Garbage Rules</h2>
          <button onClick={addDefaultRule} className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl uppercase tracking-wider">＋ New Rule</button>
        </div>

        <div className="grid gap-4">
          {settings.rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-50 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl">
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(rule.id, { type: e.target.value as GarbageType })}
                    className="bg-transparent font-black text-slate-800 outline-none text-xs appearance-none"
                  >
                    {Object.values(GarbageType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => removeRule(rule.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-rose-200 hover:text-rose-400 hover:bg-rose-50 transition-all">
                  <Icons.Plus className="rotate-45 w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1">
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
                        isSelected 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                          : 'bg-slate-50 text-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
