
import React from 'react';
import { Mic } from 'lucide-react';

const Logo: React.FC<{ className?: string; onClick?: () => void }> = ({ className = "", onClick }) => {
  return (
    <div 
      className={`flex flex-col items-start leading-none group select-none transition-all ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-linear-to-br from-slate-100 via-slate-300 to-slate-500 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-500 shadow-2xl border-t-2 border-l-2 border-white/80 border-b-2 border-r-2 border-slate-700/50 relative overflow-hidden ring-1 ring-slate-400/30">
          {/* Animated Mirror Shine */}
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
          
          {/* Retro Ribbon Microphone SVG */}
          <svg className="w-8 h-8 text-slate-800 z-10 drop-shadow-[0_2px_2px_rgba(255,255,255,0.7)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
            <path d="M8 8h8M8 5h8M8 11h8" strokeWidth="1" strokeOpacity="0.5" />
          </svg>
          
          {/* Reflections */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-white/30 to-transparent pointer-events-none" />
        </div>
        <div className="flex flex-col -gap-1">
          <h1 className="text-2xl font-display font-black tracking-tighter text-slate-900 uppercase leading-none group-hover:text-brand-red transition-all">
            FreeState<span className="text-brand-red">FM</span>
          </h1>
          <div className="h-1 w-full bg-linear-to-r from-brand-red to-transparent rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
};

export default Logo;
