
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, GarbageType, GarbageRule } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import SettingsView from './components/SettingsView';
import SortingBot from './components/SortingBot';
import { sendGarbageNotification } from './services/notificationService';

const STORAGE_KEY = 'gominabi_settings';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'ユーザー',
  notificationTimes: ['08:00'],
  rules: [
    { id: '1', type: GarbageType.BURNABLE, daysOfWeek: [1, 4], weeksOfMonth: [] },
    { id: '2', type: GarbageType.PLASTIC, daysOfWeek: [3], weeksOfMonth: [] },
    { id: '3', type: GarbageType.NON_BURNABLE, daysOfWeek: [3], weeksOfMonth: [2, 4] },
    { id: '4', type: GarbageType.RECYCLABLE, daysOfWeek: [5], weeksOfMonth: [2, 4] },
  ]
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'home' | 'bot' | 'settings'>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const notifiedSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // データ移行: notificationTime (string) -> notificationTimes (string[])
        const notificationTimes = parsed.notificationTimes || [parsed.notificationTime || '08:00'];
        const updatedRules = parsed.rules.map((r: any) => ({
          ...r,
          daysOfWeek: r.daysOfWeek || [r.dayOfWeek]
        }));
        setSettings({ ...parsed, notificationTimes, rules: updatedRules });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  // 通知チェックロジック
  useEffect(() => {
    const checkNotification = () => {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
      const todayKey = now.toDateString();

      // 各設定時間に対してチェック
      settings.notificationTimes.forEach(time => {
        const uniqueKey = `${todayKey}-${time}`;
        if (currentTime === time && !notifiedSetRef.current.has(uniqueKey)) {
          sendGarbageNotification(settings);
          notifiedSetRef.current.add(uniqueKey);
        }
      });
    };

    const interval = setInterval(checkNotification, 30000); 
    checkNotification();

    return () => clearInterval(interval);
  }, [settings]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${
        activeTab === id ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
      }`}
    >
      <Icon />
      <span className="text-[10px] mt-1 font-bold tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col shadow-2xl shadow-slate-200">
      <header className="bg-white/80 backdrop-blur-md px-6 py-5 border-b border-slate-50 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 p-2 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Icons.Trash />
          </div>
          <h1 className="font-black text-2xl text-slate-800 tracking-tighter">ごみしるべ</h1>
        </div>
        <div className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">
          {settings.notificationTimes.length} Reminders
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 bg-slate-50/30">
        {activeTab === 'home' && <Dashboard settings={settings} />}
        {activeTab === 'bot' && <SortingBot settings={settings} />}
        {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={updateSettings} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-50 flex items-center justify-around z-30 pb-safe">
        <NavItem id="home" icon={Icons.Calendar} label="ホーム" />
        <NavItem id="bot" icon={Icons.Bot} label="ごみしるべAI" />
        <NavItem id="settings" icon={Icons.Settings} label="設定" />
      </nav>
    </div>
  );
};

export default App;
