
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, GarbageRule, DayOfWeek } from '../types';
import { getGarbageForDate } from '../utils/garbageCalculator';
import { DAYS_JP, GARBAGE_COLORS, GARBAGE_ICONS, Icons } from '../constants';
import { getMorningGreeting } from '../services/geminiService';

interface DashboardProps {
  settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  const [greeting, setGreeting] = useState<string>('読み込み中...');
  const [isGreetingLoading, setIsGreetingLoading] = useState(false);
  const [weekSchedule, setWeekSchedule] = useState<{ dayIdx: number, rules: GarbageRule[] }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayGarbage = getGarbageForDate(settings.rules, today);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
      setShowInstallGuide(true);
    }

    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);
      schedule.push({
        dayIdx: targetDate.getDay() as number,
        rules: getGarbageForDate(settings.rules, targetDate)
      });
    }
    setWeekSchedule(schedule);

    fetchGreeting();

    const completedKey = `completed_${today.toDateString()}`;
    const savedImage = localStorage.getItem(`photo_${today.toDateString()}`);
    if (localStorage.getItem(completedKey)) {
      setIsCompleted(true);
      if (savedImage) setCapturedImage(savedImage);
    }
  }, [settings]);

  const fetchGreeting = async () => {
    if (isGreetingLoading) return;
    setIsGreetingLoading(true);
    try {
      const g = await getMorningGreeting(settings.userName, todayGarbage.map(r => r.type));
      setGreeting(g);
    } catch (e) {
      setGreeting("おはよう！ゴミ出しの準備はいいかな？");
    } finally {
      setIsGreetingLoading(false);
    }
  };

  const handleCompleteClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      localStorage.setItem(`photo_${today.toDateString()}`, base64);
    };
    reader.readAsDataURL(file);

    setIsCompleted(true);
    localStorage.setItem(`completed_${today.toDateString()}`, 'true');
  };

  return (
    <div className="px-5 py-6 animate-in fade-in duration-700 space-y-10">
      {/* 1. Install Guide */}
      {showInstallGuide && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icons.Plus className="w-5 h-5" />
            <p className="text-[11px] font-bold">ホーム画面に追加して通知を有効に</p>
          </div>
          <button onClick={() => setShowInstallGuide(false)}><Icons.Plus className="w-4 h-4 rotate-45 opacity-50" /></button>
        </div>
      )}

      {/* 2. Today's Task (Refined Minimalist Card) */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Today's Task</h2>
          <span className="text-[10px] font-bold text-slate-300">
            {today.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
        </div>

        {todayGarbage.length > 0 ? (
          <div className={`relative overflow-hidden rounded-[32px] transition-all duration-700 border ${
            isCompleted ? 'bg-white border-emerald-100' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/40'
          }`}>
            <div className="p-6 flex items-center gap-5">
              {/* Minimal Photo Circle / Placeholder */}
              <div 
                className={`relative w-16 h-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-emerald-50' : 'bg-slate-900 shadow-lg active:scale-95'
                }`}
                onClick={!isCompleted ? handleCompleteClick : undefined}
              >
                {capturedImage ? (
                  <img src={capturedImage} alt="Preview" className="w-full h-full object-cover animate-in fade-in" />
                ) : (
                  <div className="text-white">
                    {isCompleted ? <Icons.Check className="w-6 h-6 text-emerald-500" /> : <Icons.Camera className="w-6 h-6" />}
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {todayGarbage.map(r => (
                    <span key={r.id} className={`px-2 py-0.5 rounded-lg text-[8px] font-black border uppercase tracking-wider ${GARBAGE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                  ))}
                </div>
                <h3 className={`text-base font-black tracking-tight ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {isCompleted ? 'お疲れ様でした！' : '証拠を撮ってゴミ出し完了'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">
                  {isCompleted ? 'CLEARED' : 'TAP CAMERA TO UPLOAD'}
                </p>
              </div>
            </div>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[32px] p-8 flex flex-col items-center justify-center text-center">
            <div className="text-slate-200 mb-2">
              <Icons.Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xs font-black text-slate-400">今日はゴミ出しはありません</h3>
          </div>
        )}
      </section>

      {/* 3. AI Greeting */}
      <section className="bg-emerald-500 rounded-[32px] p-6 shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative z-10 flex gap-4">
          <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Icons.Bot />
          </div>
          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-emerald-200 uppercase tracking-widest">Guide</h4>
            <p className="text-white text-[13px] font-bold leading-relaxed">
              {greeting}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Weekly Schedule (Visual Recognition List) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Weekly Schedule</h2>
        </div>
        
        <div className="space-y-3">
          {weekSchedule.map(({ dayIdx, rules }) => {
            const isTodayItem = today.getDay() === dayIdx;
            return (
              <div 
                key={dayIdx} 
                className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${
                  isTodayItem 
                    ? 'bg-white shadow-xl shadow-slate-100 border border-emerald-100' 
                    : 'bg-white border border-slate-50'
                } ${isTodayItem && isCompleted ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Visual Day Marker */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs ${
                  isTodayItem ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400'
                }`}>
                  {DAYS_JP[dayIdx]}
                </div>

                {/* Garbage Icons & Labels */}
                <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {rules.length > 0 ? (
                    rules.map(rule => (
                      <div
                        key={rule.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border whitespace-nowrap ${GARBAGE_COLORS[rule.type]}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          {GARBAGE_ICONS[rule.type]}
                        </svg>
                        <span className="text-[10px] font-black tracking-tight">{rule.type}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-200 text-[10px] font-bold ml-1">---</span>
                  )}
                </div>

                {/* Small indicator */}
                {isTodayItem && !isCompleted && rules.length > 0 && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
