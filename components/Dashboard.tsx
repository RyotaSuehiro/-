
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, GarbageRule, DayOfWeek } from '../types';
import { getGarbageForDate } from '../utils/garbageCalculator';
import { DAYS_JP, GARBAGE_COLORS, Icons } from '../constants';
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

  const fetchGreeting = async (force: boolean = false) => {
    if (isGreetingLoading) return;
    setIsGreetingLoading(true);
    if (force) setGreeting('考え中...');
    
    try {
      const g = await getMorningGreeting(settings.userName, todayGarbage.map(r => r.type));
      setGreeting(g);
    } catch (e) {
      setGreeting("おはよう！今日も一日、自分のペースで頑張ろう。");
    } finally {
      setIsGreetingLoading(false);
    }
  };

  useEffect(() => {
    // PWAチェック
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
      try {
        localStorage.setItem(`photo_${today.toDateString()}`, base64);
      } catch (e) { console.error("Storage full"); }
    };
    reader.readAsDataURL(file);

    const types = todayGarbage.map(r => r.type).join('、');
    const message = `【ゴミ出し完了！】\n${settings.userName}さんが「${types}」を捨ててきました！📸`;

    if (navigator.share && file) {
      try {
        await navigator.share({ title: '完了報告', text: message, files: [file] });
        finalizeCompletion();
      } catch (err) { finalizeCompletion(); }
    } else {
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
      window.open(lineUrl, '_blank');
      finalizeCompletion();
    }
  };

  const finalizeCompletion = () => {
    setIsCompleted(true);
    localStorage.setItem(`completed_${today.toDateString()}`, 'true');
  };

  return (
    <div className="px-5 py-6 animate-in fade-in duration-700 space-y-8">
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

      {/* 2. Today's Mission (Minimalist Camera Action) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Mission</h2>
          <span className="text-[10px] font-bold text-slate-300">
            {today.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
        </div>

        {todayGarbage.length > 0 ? (
          <div className={`relative group overflow-hidden rounded-[32px] transition-all duration-500 border ${
            isCompleted ? 'bg-emerald-50 border-emerald-100 shadow-emerald-50' : 'bg-white border-slate-100 shadow-xl shadow-slate-100'
          }`}>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-2">
                  {todayGarbage.map(r => (
                    <span key={r.id} className={`px-3 py-1 rounded-xl text-[10px] font-black border ${GARBAGE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                  ))}
                </div>
                {isCompleted && (
                  <div className="bg-emerald-500 text-white p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div 
                  className="relative w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
                  onClick={!isCompleted ? handleCompleteClick : undefined}
                >
                  {capturedImage ? (
                    <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Icons.Plus className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-black tracking-tight ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {isCompleted ? 'ゴミ出しを完了しました！' : '証拠写真を撮って報告'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                    {isCompleted ? '今日も一日気持ちよく過ごしましょう。' : 'カメラをタップして写真を撮ろう'}
                  </p>
                </div>
              </div>

              {!isCompleted && (
                <button
                  onClick={handleCompleteClick}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-slate-200 active:scale-[0.98] transition-all"
                >
                  カメラを起動して報告
                </button>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400">
              <Icons.Bot />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">今日はゴミ出しがありません</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">ゆっくりリラックスしてくださいね。</p>
            </div>
          </div>
        )}
      </section>

      {/* 3. AI Greeting */}
      <section className="bg-emerald-500 rounded-[32px] p-6 shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="relative z-10 flex gap-4">
          <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Icons.Bot />
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Greeting</h4>
            <p className="text-white text-[13px] font-bold leading-relaxed">
              {greeting}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Weekly Schedule (Restored UI) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Schedule</h2>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">今週の予定</span>
        </div>
        
        <div className="space-y-3">
          {weekSchedule.map(({ dayIdx, rules }) => {
            const isTodayItem = today.getDay() === dayIdx;
            return (
              <div 
                key={dayIdx} 
                className={`bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all ${
                  isTodayItem ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                } ${isTodayItem && isCompleted ? 'opacity-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                  isTodayItem ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <span className="text-sm">{DAYS_JP[dayIdx]}</span>
                </div>

                <div className="flex-1 flex flex-wrap gap-1.5">
                  {rules.length > 0 ? (
                    rules.map(rule => (
                      <span
                        key={rule.id}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${GARBAGE_COLORS[rule.type]}`}
                      >
                        {rule.type}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-200 text-[10px] font-medium tracking-tight">予定なし</span>
                  )}
                </div>

                {rules.length > 0 && (
                  <div className={isTodayItem ? 'text-emerald-500' : 'text-slate-200'}>
                    <Icons.Trash className="w-5 h-5" />
                  </div>
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
