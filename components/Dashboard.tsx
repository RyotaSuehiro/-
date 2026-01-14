
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
  const [weekSchedule, setWeekSchedule] = useState<{ dayIdx: number, rules: GarbageRule[] }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const todayGarbage = getGarbageForDate(settings.rules, today);

  useEffect(() => {
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

    const fetchGreeting = async () => {
      const g = await getMorningGreeting(settings.userName, todayGarbage.map(r => r.type));
      setGreeting(g);
    };
    fetchGreeting();

    // 今日の完了フラグをチェック
    const completedKey = `completed_${today.toDateString()}`;
    if (localStorage.getItem(completedKey)) {
      setIsCompleted(true);
    }
  }, [settings]);

  const handleCompleteClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const types = todayGarbage.map(r => r.type).join('、');
    const message = `【ゴミ出し完了！】\n${settings.userName}さんが「${types}」を捨ててきました！📸\n今日も一日頑張りましょう！`;

    // Web Share APIを使用してLINE等へシェア
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ゴミ出し完了報告',
          text: message,
          files: [file]
        });
        finalizeCompletion();
      } catch (err) {
        console.log('Share failed or cancelled', err);
        // キャンセルされてもプレビューは見せる
      }
    } else {
      // Fallback: LINE URL Scheme (テキストのみ)
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
      window.open(lineUrl, '_blank');
      finalizeCompletion();
    }
  };

  const finalizeCompletion = () => {
    setIsCompleted(true);
    localStorage.setItem(`completed_${today.toDateString()}`, 'true');
    setPreviewUrl(null);
  };

  return (
    <div className="px-5 py-6 animate-in fade-in duration-700">
      {/* AI Greeting Card */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Today's Message</h2>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-center">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
            <Icons.Bot />
          </div>
          <p className="text-slate-700 text-sm font-medium leading-relaxed">
            {greeting}
          </p>
        </div>
      </div>

      {/* Completion Report Action */}
      {todayGarbage.length > 0 && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Task</h2>
          <div className={`p-6 rounded-3xl shadow-lg transition-all border ${
            isCompleted 
              ? 'bg-emerald-50 border-emerald-100' 
              : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 tracking-tight">
                {isCompleted ? '今日のゴミ出しは完了！' : 'ゴミ出しは終わりましたか？'}
              </h3>
              <div className={isCompleted ? 'text-emerald-500' : 'text-slate-300'}>
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ) : (
                  <Icons.Trash />
                )}
              </div>
            </div>
            
            {!isCompleted && (
              <>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">
                  写真を撮って家族や自分のLINEへ完了報告を送りましょう。証拠を残すことで忘れ防止になります！
                </p>
                <button
                  onClick={handleCompleteClick}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  写真を撮って報告する
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {isCompleted && (
              <div className="text-center py-2 text-emerald-600 font-bold text-sm">
                お疲れ様でした！また明日も頑張りましょう。
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Schedule</h2>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">今週の予定</span>
        </div>
        
        <div className="grid gap-3">
          {weekSchedule.map(({ dayIdx, rules }) => {
            const isTodayItem = today.getDay() === dayIdx;
            return (
              <div 
                key={dayIdx} 
                className={`group relative overflow-hidden transition-all duration-300 ${
                  isTodayItem 
                    ? 'ring-2 ring-emerald-500 ring-offset-2' 
                    : ''
                }`}
              >
                <div className={`bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 ${isTodayItem && isCompleted ? 'opacity-60' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold transition-colors ${
                    isTodayItem ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <span className="text-xs opacity-80 leading-none mb-0.5">曜</span>
                    <span className="text-lg leading-none">{DAYS_JP[dayIdx]}</span>
                  </div>

                  <div className="flex-1 flex flex-wrap gap-2">
                    {rules.length > 0 ? (
                      rules.map(rule => (
                        <div
                          key={rule.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${GARBAGE_COLORS[rule.type]}`}
                        >
                          {rule.type}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-300 text-xs font-medium italic">なし</span>
                    )}
                  </div>

                  <div className={`transition-opacity ${rules.length > 0 ? 'opacity-100' : 'opacity-10'}`}>
                    <Icons.Trash />
                  </div>
                </div>
                {isTodayItem && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                      {isCompleted ? 'DONE' : 'TODAY'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
