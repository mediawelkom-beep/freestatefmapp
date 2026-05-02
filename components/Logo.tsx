
import React from 'react';
import { Mic2 } from 'lucide-react';

const Logo: React.FC<{ className?: string; onClick?: () => void }> = ({ className = "", onClick }) => {
  return (
    <div 
      className={`flex flex-col items-start leading-none group select-none transition-all ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-slate-100 via-slate-400 to-slate-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg border-t border-l border-white/60 border-b border-r border-slate-700/30 relative overflow-hidden">
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          <Mic2 className="text-slate-900 w-6 h-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]" />
        </div>
        <h1 className="text-2xl font-display font-extrabold italic tracking-tighter text-brand-dark uppercase leading-none group-hover:text-brand-red transition-all">
          FreeState<span className="text-brand-red">FM</span>
        </h1>
      </div>
      <p className="text-[10px] font-bold text-slate-400 italic mt-1.5 tracking-[0.3em] uppercase ml-1 opacity-70">
        Digital radio
      </p>
    </div>
  );
};

export default Logo;
