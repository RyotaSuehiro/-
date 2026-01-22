
import React, { useState, useEffect } from 'react';
import { AppSettings, GarbageType, GarbageHistoryRecord } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import SettingsView from './components/SettingsView';
import StampCardView from './components/StampCardView';

const STORAGE_KEY = 'gominabi_v2_settings';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'ユーザー',
  notificationTimes: ['08:00'],
  rules: [
    { id: '1', type: GarbageType.BURNABLE, daysOfWeek: [1, 4], weeksOfMonth: [] },
    { id: '2', type: GarbageType.PLASTIC, daysOfWeek: [3], weeksOfMonth: [] },
  ],
  history: {}
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'home' | 'stamps' | 'settings'>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
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

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-all active:scale-90 ${
        activeTab === id ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-400'
      }`}
    >
      <Icon />
      <span className="text-[10px] mt-1 font-bold tracking-wider">{label}</span>
    </button>
  );

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 flex flex-col shadow-none sm:shadow-2xl font-sans">
      <header className="bg-white/90 backdrop-blur-lg px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 h-[72px]">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 p-1.5 rounded-xl text-white shadow-lg shadow-emerald-100">
            <Icons.Trash />
          </div>
          <h1 className="font-black text-xl text-slate-800 tracking-tighter">ごみしるべ</h1>
        </div>
        {/* 上部のバッジは削除しました */}
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && <Dashboard settings={settings} onUpdate={updateSettings} />}
        {activeTab === 'stamps' && <StampCardView settings={settings} />}
        {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={updateSettings} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around z-30 pb-safe pt-2">
        <NavItem id="home" icon={Icons.Calendar} label="ホーム" />
        <NavItem id="stamps" icon={Icons.Bot} label="スタンプ" />
        <NavItem id="settings" icon={Icons.Settings} label="設定" />
      </nav>
    </div>
  );
};

export default App;
