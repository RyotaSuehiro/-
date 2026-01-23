
import React from 'react';
import { GarbageType } from './types';

export const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];

export const GARBAGE_COLORS: Record<GarbageType, string> = {
  [GarbageType.BURNABLE]: 'bg-rose-50 text-rose-600 border-rose-100',
  [GarbageType.NON_BURNABLE]: 'bg-slate-100 text-slate-600 border-slate-200',
  [GarbageType.PLASTIC]: 'bg-pink-50 text-pink-500 border-pink-100',
  [GarbageType.RECYCLABLE]: 'bg-blue-50 text-blue-600 border-blue-100',
  [GarbageType.PAPER]: 'bg-orange-50 text-orange-600 border-orange-100',
  [GarbageType.BOTTLES_CANS]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  [GarbageType.LARGE]: 'bg-violet-50 text-violet-600 border-violet-100',
  [GarbageType.OTHER]: 'bg-gray-50 text-gray-500 border-gray-200',
};

// ゴミの種類に応じた専用アイコン
export const GARBAGE_ICONS: Record<GarbageType, React.ReactNode> = {
  [GarbageType.BURNABLE]: <path d="M7 6V5c0-1 1-2 2-2h6c1 0 2 1 2 2v1M3 8h18M19 8l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8M10 11v6M14 11v6" />,
  [GarbageType.NON_BURNABLE]: <path d="M12 2v20M2 12h20M5.45 5.45l13.1 13.1M18.55 5.45l-13.1 13.1" />,
  [GarbageType.PLASTIC]: <path d="M7 2h10l3 7-8 13-8-13 3-7zM7 9h10" />,
  [GarbageType.RECYCLABLE]: <path d="M7 2h10l4 6-9 14-9-6 4-6zM12 22V11M8 11h8" />,
  [GarbageType.PAPER]: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />,
  [GarbageType.BOTTLES_CANS]: <path d="M18 20V10M12 20V4M6 20v-6M6 4l12 0" />,
  [GarbageType.LARGE]: <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0-5h18v5H3V4zM9 21v-5M15 21v-5" />,
  [GarbageType.OTHER]: <circle cx="12" cy="12" r="10" />
};

interface IconProps {
  className?: string;
}

export const Icons = {
  Trash: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 6V5c0-1 1-2 2-2h6c1 0 2 1 2 2v1" />
      <path d="M19 8.5c0 8-1.5 11.5-2 12.5s-2 1-3 1h-4c-1 0-2.5 0-3-1s-2-4.5-2-12.5" />
      <line x1="3" y1="8" x2="21" y2="8" />
    </svg>
  ),
  Settings: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Calendar: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  ),
  Bot: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
      <path d="M9 16c1.5 1 4.5 1 6 0" />
      <path d="M12 3v-1" />
      <circle cx="12" cy="2" r="0.5" fill="currentColor" />
    </svg>
  ),
  Bell: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Plus: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  ArrowRight: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Camera: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  ),
  Check: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Line: ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 10.304c0-5.232-5.385-9.488-12-9.488S0 5.072 0 10.304c0 4.689 4.274 8.604 10.05 9.351.391.084.924.258 1.058.591.121.303.079.777.039 1.083l-.171 1.027c-.052.311-.252 1.217 1.086.664 1.338-.553 7.21-4.246 9.839-7.269 1.933-2.22 3.107-4.47 3.107-5.503zm-15.885 4.39H6.012c-.378 0-.685-.307-.685-.685V8.125c0-.378.307-.685.685-.685.378 0 .685.307.685.685v5.195h1.418c.378 0 .685.307.685.685s-.307.684-.685.684zm2.66 0c-.378 0-.685-.307-.685-.685V8.125c0-.378.307-.685.685-.685.378 0 .685.307.685.685v5.884c0 .378-.307.685-.685.685zm6.545 0h-2.103c-.378 0-.685-.307-.685-.685V8.125c0-.378.307-.685.685-.685.18 0 .35.07.47.195l1.633 2.193V8.125c0-.378.307-.685.685-.685.378 0 .685.307.685.685v5.884c0 .378-.307.685-.685.685a.707.707 0 0 1-.47-.195l-1.633-2.193v1.684c0 .378-.307.685-.685.685zm4.331-1.37h-1.418v-1.246h1.418c.378 0 .685-.307.685-.685s-.307-.685-.685-.685h-1.418V8.81h1.418c.378 0 .685-.307.685-.685s-.307-.685-.685-.685h-2.103c-.378 0-.685.307-.685.685v5.884c0 .378.307.685.685.685h2.103c.378 0 .685-.307.685-.685s-.307-.684-.685-.684z"/>
    </svg>
  )
};
