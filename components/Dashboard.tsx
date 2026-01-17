
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
      console.error("Dashboard Greeting Error:", e);
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

  // LINE/Share共有機能
  const handleShareToLine = async () => {
    if (!capturedImage) return;

    try {
      // base64をBlobに変換
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], `garbage_photo_${today.toISOString().split('T')[0]}.jpg`, { type: 'image/jpeg' });

      // Web Share APIを使用して共有メニューを開く
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'ゴミ出し完了報告',
          text: `【ごみしるべ】${settings.userName}です。今日のゴミ出し（${todayGarbage.map(r => r.type).join('、')}）を完了しました！`,
        });
      } else {
        // フォールバック: LINE URL Scheme (テキストのみ)
        const text = encodeURIComponent(`【ごみしるべ】${settings.userName}です。今日のゴミ出しを完了しました！`);
        window.location.href = `line://msg/text/${text}`;
      }
    } catch (err) {
      console.error("Sharing failed", err);
      alert('共有に失敗しました。');
    }
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

      {/* 2. Today's Task */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Today's Task</h2>
          <span className="text-[10px] font-bold text-slate-300">
            {today.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
        </div>

        {todayGarbage.length > 0 ? (
          <div className="space-y-3">
            <div className={`relative overflow-hidden rounded-[32px] transition-all duration-700 border ${
              isCompleted ? 'bg-white border-emerald-100' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/40'
            }`}>
              <div className="p-6 flex items-center gap-5">
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
                    {isCompleted ? 'TASK COMPLETED' : 'TAP CAMERA TO UPLOAD'}
                  </p>
                </div>
              </div>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>

            {/* LINE Share Button (Visible only when completed) */}
            {isCompleted && (
              <button
                onClick={handleShareToLine}
                className="w-full bg-[#06C755] text-white py-4 rounded-[24px] flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-[0.98] transition-all animate-in slide-in-from-bottom-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 10.304c0-5.231-5.373-9.47-12-9.47s-12 4.239-12 9.47c0 4.69 4.263 8.591 10.015 9.344.39.082.92.258 1.054.59.12.302.079.774.038 1.079l-.164 1.026c-.05.305-.238 1.196 1.023.652 1.261-.543 6.811-4.011 9.289-6.864 1.7-1.956 2.745-3.877 2.745-5.827zm-14.819 3.123h-1.597V8.506h1.597v4.921zm4.49 0h-1.603V8.506h1.603v4.921zM20.25 10.1h-2.181V8.506h3.784V10.1h-1.603v3.325h1.603v1.594h-3.784V13.425h2.181v-3.325z" />
                </svg>
                <span className="text-xs font-black tracking-wider uppercase">LINEで報告する</span>
              </button>
            )}
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

      {/* 4. Weekly Schedule */}
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
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs ${
                  isTodayItem ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400'
                }`}>
                  {DAYS_JP[dayIdx]}
                </div>

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
