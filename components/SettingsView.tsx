
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
  const [isIOS, setIsIOS] = useState(false);
  const [isShortcutInstalled, setIsShortcutInstalled] = useState(false);

  useEffect(() => {
    // OS判定: iPhone, iPad, iPod を対象とする
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    // ショートカット連携済みのステータスをlocalStorageから取得
    const installed = localStorage.getItem('gominabi_shortcut_installed_v2') === 'true';
    setIsShortcutInstalled(installed);
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    onUpdate({ ...settings, ...updates });
  };

  const WEEKS = [1, 2, 3, 4, 5];

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      alert('ブラウザ通知が有効になりました！');
    } else {
      alert('通知権限が拒否されました。');
    }
  };

  // STEP 1: ショートカットをインストール（連携）
  const handleInstallShortcut = () => {
    const shortcutUrl = 'https://www.icloud.com/shortcuts/60aaacf6a0eb453e8d5474d0adb8f530';
    window.open(shortcutUrl, '_blank');
    
    // 連携済みとしてマーク
    setIsShortcutInstalled(true);
    localStorage.setItem('gominabi_shortcut_installed_v2', 'true');
  };

  // STEP 2: アラームをセット（反映）
  const handleSyncAlarms = () => {
    if (settings.notificationTimes.length === 0) {
      alert('通知時間が設定されていません。');
      return;
    }
    
    // アプリ内の時間データを 08:00,08:15 形式の文字列に変換
    const inputParam = settings.notificationTimes.join(',');
    const shortcutName = encodeURIComponent('ごみしるべ通知設定');
    const runUrl = `shortcuts://run-shortcut?name=${shortcutName}&input=${inputParam}`;
    
    // iOSのURLスキームを実行してショートカットを起動
    window.location.href = runUrl;
  };

  return (
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-bottom-6 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">設定</h2>
      </div>

      {/* プロフィール設定 */}
      <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-300 uppercase mb-3 ml-1 tracking-[0.2em]">Profile</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onBlur={() => updateSettings({ userName })}
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black text-slate-700 outline-none focus:ring-2 ring-emerald-100 transition-all"
            placeholder="お名前"
          />
        </div>
      </section>

      {/* iOSショートカット連携セクション (iPhoneのみ表示) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">iPhone Alarm Sync</h2>
        </div>

        {!isIOS ? (
          <div className="bg-slate-100 rounded-[32px] p-6 border border-slate-200 text-center">
            <p className="text-[11px] font-bold text-slate-400">
              ⚠️ iPhoneアラーム同期はiOS端末専用の機能です。
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-[40px] p-7 text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Icons.Bell className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">アラーム一括同期</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sync with Clock App</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* STEP 1: 連携 */}
              <div className={`p-5 rounded-3xl border transition-all duration-500 ${!isShortcutInstalled ? 'bg-white/5 border-white/10' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${!isShortcutInstalled ? 'bg-white text-slate-900' : 'bg-emerald-500 text-white'}`}>
                    {isShortcutInstalled ? <Icons.Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-black mb-3">iPhoneと連携する</p>
                    {!isShortcutInstalled ? (
                      <button 
                        onClick={handleInstallShortcut}
                        className="w-full bg-white text-slate-900 py-3.5 rounded-2xl font-black text-[11px] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        ショートカットを取得
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                        <span>連携済み</span>
                        <button onClick={handleInstallShortcut} className="text-slate-500 underline text-[9px] ml-auto">再取得</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 2: 反映 */}
              <div className={`p-5 rounded-3xl border transition-all duration-500 ${isShortcutInstalled ? 'bg-white/5 border-white/10' : 'opacity-40 grayscale pointer-events-none'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center text-xs font-black shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-black mb-3">アラームをセット</p>
                    <button 
                      onClick={handleSyncAlarms}
                      disabled={!isShortcutInstalled}
                      className="w-full bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-[11px] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      反映を実行する
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 px-1">
              <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                ※時間を変更した後は、再度「反映を実行する」をタップしてiPhoneのアラームを更新してください。
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 通知時間設定 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Notification Times</h2>
          <button 
            onClick={handleEnableNotifications}
            className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase"
          >
            Browser Permission
          </button>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            {settings.notificationTimes.map((time, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const newTimes = [...settings.notificationTimes];
                    newTimes[idx] = e.target.value;
                    updateSettings({ notificationTimes: newTimes });
                  }}
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 font-black text-slate-700 outline-none"
                />
                <button 
                  onClick={() => {
                    const newTimes = settings.notificationTimes.filter((_, i) => i !== idx);
                    updateSettings({ notificationTimes: newTimes });
                  }}
                  className="text-rose-300 p-2"
                >
                  <Icons.Plus className="rotate-45 w-5 h-5" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => updateSettings({ notificationTimes: [...settings.notificationTimes, '08:00'] })}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-100 text-[10px] font-black text-slate-300 uppercase hover:bg-slate-50 transition-colors"
            >
              + Add Notification Time
            </button>
          </div>
        </div>
      </section>

      {/* ゴミ出しルール設定 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Garbage Rules</h2>
          <button 
            onClick={() => {
              const newRule: GarbageRule = { id: Date.now().toString(), type: GarbageType.BURNABLE, daysOfWeek: [1], weeksOfMonth: [] };
              updateSettings({ rules: [...settings.rules, newRule] });
            }}
            className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl uppercase"
          >
            ＋ New Rule
          </button>
        </div>

        <div className="grid gap-4">
          {settings.rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <select
                  value={rule.type}
                  onChange={(e) => {
                    const newRules = settings.rules.map(r => r.id === rule.id ? { ...r, type: e.target.value as GarbageType } : r);
                    updateSettings({ rules: newRules });
                  }}
                  className="bg-slate-50 font-black text-slate-800 rounded-xl px-4 py-2 outline-none text-xs appearance-none border-none"
                >
                  {Object.values(GarbageType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button 
                  onClick={() => updateSettings({ rules: settings.rules.filter(r => r.id !== rule.id) })}
                  className="text-rose-300 p-2 hover:text-rose-500 transition-colors"
                >
                  <Icons.Plus className="rotate-45 w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Occurrence (Week of Month)</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const newRules = settings.rules.map(r => r.id === rule.id ? { ...r, weeksOfMonth: [] } : r);
                      updateSettings({ rules: newRules });
                    }}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all ${
                      rule.weeksOfMonth.length === 0 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    毎週
                  </button>
                  {WEEKS.map((week) => {
                    const isSelected = rule.weeksOfMonth.includes(week);
                    return (
                      <button
                        key={week}
                        onClick={() => {
                          const newWeeks = isSelected 
                            ? rule.weeksOfMonth.filter(w => w !== week) 
                            : [...rule.weeksOfMonth, week].sort();
                          const newRules = settings.rules.map(r => r.id === rule.id ? { ...r, weeksOfMonth: newWeeks } : r);
                          updateSettings({ rules: newRules });
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                          isSelected ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        第{week}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Day of Week</label>
                <div className="flex justify-between gap-1">
                  {DAYS_JP.map((day, idx) => {
                    const isSelected = rule.daysOfWeek.includes(idx as DayOfWeek);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const newDays = isSelected ? rule.daysOfWeek.filter(d => d !== idx) : [...rule.daysOfWeek, idx as DayOfWeek].sort();
                          const newRules = settings.rules.map(r => r.id === rule.id ? { ...r, daysOfWeek: newDays as DayOfWeek[] } : r);
                          updateSettings({ rules: newRules });
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

      {/* リセットボタン */}
      <section className="p-4 text-center">
        <button 
          onClick={() => {
            if (confirm('全ての記録を削除してリセットしますか？')) {
              updateSettings({ history: {} });
            }
          }}
          className="text-[10px] font-black text-rose-400 uppercase tracking-widest"
        >
          Reset All History
        </button>
      </section>
    </div>
  );
};

export default SettingsView;
