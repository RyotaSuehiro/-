
import React, { useRef, useState, useEffect } from 'react';
import { AppSettings, GarbageHistoryRecord, GarbageType } from '../types';
import { getGarbageForDate, getNextOccurrences } from '../utils/garbageCalculator';
import { GARBAGE_COLORS, GARBAGE_ICONS, Icons } from '../constants';
import { calculatePoints } from '../utils/pointCalculator';

interface DashboardProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStampPop, setShowStampPop] = useState(false);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayGarbage = getGarbageForDate(settings.rules, today);
  const nextOccurrences = getNextOccurrences(settings.rules, today, 7);
  
  const todayRecord = settings.history[todayStr];
  const isCompleted = todayRecord?.status === 'completed';
  const { currentPoints, isGameOver } = calculatePoints(settings);

  const handleCompleteClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newHistory = { ...settings.history };
      newHistory[todayStr] = {
        date: todayStr,
        status: 'completed',
        photo: base64
      };
      onUpdate({ ...settings, history: newHistory });
      
      // 完了アニメーション開始
      setShowStampPop(true);
      setTimeout(() => setShowStampPop(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-5 py-6 space-y-8 animate-in fade-in duration-700 relative">
      
      {/* 完了ポップアップエフェクト */}
      {showStampPop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm inset-0 absolute"></div>
          <div className="relative animate-in zoom-in spin-in-12 duration-500 flex flex-col items-center">
             <div className="text-8xl filter drop-shadow-2xl mb-4">✨</div>
             <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-xl shadow-xl">
               GREAT JOB!
             </div>
          </div>
        </div>
      )}

      {/* 1. Welcome & Point Status */}
      <section className="relative px-2">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {settings.userName}さん、<br/>おはよう！
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              {isGameOver ? '⚠️ ポイントがリセットされました' : '今日も一日、気持ちよく。'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Current</div>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-5xl font-black text-emerald-500 tracking-tighter">{currentPoints}</span>
              <span className="text-[11px] font-black text-slate-400">PTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Today's Main Garbage Card */}
      <section>
        {todayGarbage.length > 0 ? (
          <div className={`rounded-[40px] p-1 border-2 transition-all duration-500 ${
            isCompleted ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/50'
          }`}>
            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div 
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-white' : 'bg-slate-900 shadow-2xl active:scale-95 cursor-pointer ring-8 ring-slate-50'
                }`}
                onClick={!isCompleted ? handleCompleteClick : undefined}
              >
                {todayRecord?.photo ? (
                  <img src={todayRecord.photo} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-white animate-in zoom-in" />
                ) : (
                  <div className="text-white flex flex-col items-center">
                    <Icons.Camera className="w-8 h-8 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Click!</span>
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute -bottom-1 -right-1 bg-white text-emerald-500 w-11 h-11 rounded-full flex items-center justify-center border-4 border-emerald-50 shadow-lg animate-bounce">
                    <span className="text-2xl">✨</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-center gap-2 mb-3">
                  {todayGarbage.map(r => (
                    <span key={r.id} className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${GARBAGE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                  ))}
                </div>
                <h3 className={`text-2xl font-black ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {isCompleted ? 'スタンプ獲得済！' : '今日はゴミを出す日です'}
                </h3>
                {!isCompleted && <p className="text-[11px] text-slate-400 font-bold mt-2">写真を撮って「✨」をGET！</p>}
              </div>
            </div>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="bg-slate-100/50 rounded-[40px] p-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
            <div className="text-slate-300 mb-2 opacity-30">
              <Icons.Trash className="w-10 h-10" />
            </div>
            <h3 className="text-xs font-black text-slate-400">今日はゴミ出しの予定はありません</h3>
          </div>
        )}
      </section>

      {/* 3. Upcoming Schedule */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Next 7 Days</h2>
          <div className="h-[1px] flex-1 bg-slate-100 ml-4"></div>
        </div>
        
        <div className="space-y-3">
          {nextOccurrences.slice(1).map(({ date, rules }, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 flex items-center justify-between border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-center w-10">
                  <p className="text-[8px] font-black text-slate-300 uppercase">{date.toLocaleDateString('ja-JP', { weekday: 'short' })}</p>
                  <p className="text-lg font-black text-slate-800 leading-none">{date.getDate()}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rules.map(r => (
                    <span key={r.id} className={`px-3 py-1 rounded-xl text-[9px] font-black border ${GARBAGE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-slate-200">
                <Icons.ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Streak Rule Explanation */}
      <section className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
        <div className="flex gap-4">
          <div className="bg-emerald-500 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stamp Rule</h4>
            <p className="text-[12px] font-bold leading-relaxed mt-1 text-slate-200">
              予定日を<span className="text-emerald-400 underline decoration-2">2回連続</span>で忘れるとポイント失効。キラキラスタンプでお部屋も心もスッキリさせましょう！
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
