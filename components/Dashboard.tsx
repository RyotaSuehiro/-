
import React, { useRef, useState } from 'react';
import { AppSettings } from '../types';
import { getGarbageForDate, getNextOccurrences } from '../utils/garbageCalculator';
import { GARBAGE_COLORS, Icons } from '../constants';
import { calculatePoints } from '../utils/pointCalculator';
import { formatLocalDate } from '../utils/dateUtils';

interface DashboardProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ settings, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStampPop, setShowStampPop] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const today = new Date();
  const todayStr = formatLocalDate(today);
  
  const todayGarbage = getGarbageForDate(settings.rules, today);
  const nextOccurrences = getNextOccurrences(settings.rules, today, 7);
  
  const todayRecord = settings.history[todayStr];
  const isCompleted = todayRecord?.status === 'completed';
  
  const { currentPoints, isGameOver } = calculatePoints(settings);

  const handleCompleteClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 写真付きで共有（Web Share API）
   * iPhoneの場合、システム共有シートが開くので、そこからLINEを選択すると写真付きで送れます。
   */
  const handleShare = async () => {
    const garbageNames = todayGarbage.map(r => r.type).join('、');
    const shareText = `【ごみしるべ】今日のゴミ出し（${garbageNames}）を完了しました！✨\n現在：${currentPoints} PTS 獲得中！ #ごみしるべ`;

    if (navigator.share && todayRecord?.photo) {
      try {
        // base64をBlobに変換してファイルとして共有
        const response = await fetch(todayRecord.photo);
        const blob = await response.blob();
        const file = new File([blob], 'garbage-done.jpg', { type: 'image/jpeg' });

        await navigator.share({
          files: [file],
          title: 'ごみしるべ',
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // 失敗した場合は従来のテキストのみLINE共有へフォールバック
          openLineTextOnly(shareText);
        }
      }
    } else {
      openLineTextOnly(shareText);
    }
  };

  const openLineTextOnly = (text: string) => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  /**
   * iPhoneのホワイトアウト（メモリ制限）を回避するための超軽量リサイズ
   */
  const resizeImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        // メモリ解放のタイミングを確保
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          // 保存サイズをさらに最適化（320px: スタンプとして十分、かつメモリに優しい）
          const MAX_SIZE = 320; 
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Canvas failure"));
            return;
          }
          
          // 低負荷な描画設定
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
          ctx.drawImage(img, 0, 0, width, height);
          
          const result = canvas.toDataURL('image/jpeg', 0.5);
          
          // 使用済みリソースの即時解放
          canvas.width = 0;
          canvas.height = 0;
          img.src = ""; 
          
          resolve(result);
        }, 50);
      };
      img.onerror = () => reject(new Error("Load error"));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // システムのメモリ整理を待つ
    await new Promise(resolve => setTimeout(resolve, 500));

    const objectUrl = URL.createObjectURL(file);

    try {
      const compressedBase64 = await resizeImage(objectUrl);
      
      const newHistory = { ...settings.history };
      newHistory[todayStr] = {
        date: todayStr,
        status: 'completed',
        photo: compressedBase64
      };
      
      onUpdate({ ...settings, history: newHistory });
      
      URL.revokeObjectURL(objectUrl);
      
      setIsProcessing(false);
      setShowStampPop(true);
      setTimeout(() => setShowStampPop(false), 2000);
    } catch (error) {
      console.error("Critical Image Error:", error);
      alert("申し訳ありません、処理中にメモリが不足しました。もう一度試すか、少し画質を下げて撮影してください。");
      URL.revokeObjectURL(objectUrl);
      setIsProcessing(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="px-5 py-6 space-y-8 animate-in fade-in duration-700 relative">
      
      {isProcessing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-emerald-600 font-black text-xs tracking-widest animate-pulse text-center">
              メモリを節約しながら<br/>スタンプを作成中...
            </p>
          </div>
        </div>
      )}

      {showStampPop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-500">
          <div className="bg-emerald-500/10 inset-0 absolute animate-in fade-in"></div>
          <div className="relative animate-in zoom-in spin-in-12 duration-500 flex flex-col items-center">
             <div className="text-8xl filter drop-shadow-2xl mb-4">✨</div>
             <div className="bg-emerald-500 text-white px-8 py-3 rounded-full font-black text-xl shadow-2xl shadow-emerald-500/40">
               GREAT JOB!
             </div>
          </div>
        </div>
      )}

      <section className="relative px-2">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {settings.userName}さん、<br/>おはよう！
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              {isGameOver ? '⚠️ 連続忘れでポイントがリセットされました' : '今日も一日、気持ちよく。'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Current</div>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-5xl font-black text-emerald-500 tracking-tighter transition-all duration-500">
                {currentPoints}
              </span>
              <span className="text-[11px] font-black text-slate-400">PTS</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        {todayGarbage.length > 0 ? (
          <div className={`rounded-[40px] p-1 border-2 transition-all duration-500 ${
            isCompleted ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/50'
          }`}>
            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div 
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-white overflow-hidden ring-4 ring-emerald-200 shadow-inner' : 'bg-slate-900 shadow-2xl active:scale-95 cursor-pointer ring-8 ring-slate-50'
                }`}
                onClick={!isCompleted && !isProcessing ? handleCompleteClick : undefined}
              >
                {todayRecord?.photo ? (
                  <img src={todayRecord.photo} alt="Preview" className="w-full h-full object-cover animate-in zoom-in" />
                ) : (
                  <div className="text-white flex flex-col items-center">
                    <Icons.Camera className="w-8 h-8 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">撮影する</span>
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
                {!isCompleted ? (
                  <p className="text-[11px] text-slate-400 font-bold mt-2">写真を撮って「✨」をGET！</p>
                ) : (
                  <button
                    onClick={handleShare}
                    className="mt-6 flex items-center gap-2 bg-[#06C755] text-white px-8 py-3 rounded-full text-[12px] font-black shadow-lg shadow-emerald-200/50 active:scale-95 transition-all animate-in slide-in-from-bottom-2"
                  >
                    <Icons.Line className="w-4 h-4" />
                    写真付きで共有する
                  </button>
                )}
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />
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
