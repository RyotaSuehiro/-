
import React from 'react';
import { AppSettings, GarbageHistoryRecord } from '../types';
import { DAYS_JP } from '../constants';
import { getGarbageForDate } from '../utils/garbageCalculator';
import { formatLocalDate } from '../utils/dateUtils';

interface StampCardViewProps {
  settings: AppSettings;
}

const StampCardView: React.FC<StampCardViewProps> = ({ settings }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 月の日数を計算
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIdx = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  // 空白埋め
  for (let i = 0; i < firstDayIdx; i++) calendarDays.push(null);
  // 日付埋め
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getRecordForDay = (day: number | null) => {
    if (!day) return null;
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatLocalDate(date);
    return settings.history[dateStr];
  };

  const hasGarbageOnDay = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return getGarbageForDate(settings.rules, date).length > 0;
  };

  return (
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-bottom-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {currentYear}年 {currentMonth + 1}月
        </h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shiny Collection</p>
      </div>

      <div className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-100 border border-slate-50">
        <div className="grid grid-cols-7 gap-y-6 text-center">
          {DAYS_JP.map(d => (
            <div key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</div>
          ))}

          {calendarDays.map((day, idx) => {
            const record = getRecordForDay(day);
            const isToday = day === today.getDate();
            const needsGarbage = hasGarbageOnDay(day);

            return (
              <div key={idx} className="relative flex flex-col items-center justify-center aspect-square">
                {day && (
                  <>
                    <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-emerald-500 underline decoration-2' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      record?.status === 'completed' 
                        ? 'bg-emerald-50 text-2xl animate-in zoom-in' 
                        : needsGarbage && day < today.getDate() 
                          ? 'bg-slate-50 border border-dashed border-slate-200 opacity-50' 
                          : ''
                    }`}>
                      {record?.status === 'completed' ? (
                        <span className="animate-pulse">✨</span>
                      ) : needsGarbage && day < today.getDate() && record?.status !== 'completed' ? (
                        <span className="text-slate-200 text-lg">×</span>
                      ) : null}
                    </div>

                    {needsGarbage && !record && (
                      <div className="absolute bottom-1 w-1 h-1 bg-slate-200 rounded-full"></div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 rounded-[32px] p-8 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span className="text-6xl">✨</span>
        </div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Shiny Stamps</h4>
        <div className="text-5xl font-black tracking-tighter text-emerald-400">
          {(Object.values(settings.history) as GarbageHistoryRecord[]).filter(h => h.status === 'completed').length}
        </div>
      </div>
    </div>
  );
};

export default StampCardView;
