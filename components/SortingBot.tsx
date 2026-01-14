
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AppSettings } from '../types';
import { Icons } from '../constants';
import { getSortingAdvice } from '../services/geminiService';

interface SortingBotProps {
  settings: AppSettings;
}

const SortingBot: React.FC<SortingBotProps> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `お疲れ様です、${settings.userName}さん！今日は何かお手伝いしましょうか？分別のことならなんでも聞いてくださいね。` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const advice = await getSortingAdvice(userText);
      setMessages(prev => [...prev, { role: 'model', text: advice }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'ごめんなさい、ちょっと考え込んでしまいました…もう一度送ってもらえますか？' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <Icons.Bot />
          </div>
          <div>
            <h2 className="font-black text-slate-800 tracking-tight">ごみしるべAI</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">お話しできます</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm shrink-0 mb-1">
                  <Icons.Bot />
                </div>
              )}
              
              <div
                className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-none shadow-emerald-100'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
            
            <span className="text-[9px] font-bold text-slate-300 mt-1 px-1">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shrink-0">
              <Icons.Bot />
            </div>
            <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-3 bg-slate-50 p-2 rounded-[24px] border border-slate-100 focus-within:border-emerald-200 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="これは何ゴミかな？"
            className="flex-1 bg-transparent border-none pl-4 py-2 text-slate-800 placeholder-slate-300 outline-none text-[15px] font-bold"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95' 
                : 'text-slate-200 bg-slate-100'
            }`}
          >
            <Icons.ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortingBot;
