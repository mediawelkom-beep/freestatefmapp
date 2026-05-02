import React from 'react';
import { RadioSegment, SegmentType } from '../types';
import { Music, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NowPlayingWidgetProps {
  currentSegment: RadioSegment | null | undefined;
  className?: string;
}

const NowPlayingWidget: React.FC<NowPlayingWidgetProps> = ({ currentSegment, className = "" }) => {
  if (!currentSegment) return null;

  const isSong = currentSegment.type === SegmentType.SONG;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-red/20 text-brand-red">
        {isSong ? <Music className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
      </div>
      
      <div className="flex flex-col min-w-0 pr-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSegment.title}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
              {isSong ? 'Now Playing' : 'Live Show'}
            </span>
            <div className="flex items-center gap-2 overflow-hidden">
               <h3 className="text-sm font-bold text-white truncate whitespace-nowrap">
                {currentSegment.title}
              </h3>
              {currentSegment.artist && (
                <span className="text-sm text-slate-400 truncate whitespace-nowrap hidden sm:inline">
                  — {currentSegment.artist}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {isSong && (
        <div className="flex gap-0.5 items-end h-3 mb-1">
          <motion.div 
            animate={{ height: ["20%", "100%", "20%"] }} 
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
            className="w-0.5 bg-brand-red rounded-full" 
          />
          <motion.div 
            animate={{ height: ["40%", "80%", "40%"] }} 
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.1 }}
            className="w-0.5 bg-brand-red rounded-full" 
          />
          <motion.div 
            animate={{ height: ["30%", "100%", "30%"] }} 
            transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.2 }}
            className="w-0.5 bg-brand-red rounded-full" 
          />
        </div>
      )}
    </div>
  );
};

export default NowPlayingWidget;
