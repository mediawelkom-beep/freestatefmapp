import React from 'react';
import { RadioSegment, SegmentType, BroadcastShow } from '../types';
import { Music, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NowPlayingWidgetProps {
  currentSegment: RadioSegment | null | undefined;
  currentShow?: BroadcastShow;
  className?: string;
}

const NowPlayingWidget: React.FC<NowPlayingWidgetProps> = ({ currentSegment, currentShow, className = "" }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatGmt2Time = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false,
      timeZone: 'Africa/Johannesburg' 
    }) + ' GMT+2';
  };

  if (!currentSegment) return null;

  const isSong = currentSegment.type === SegmentType.SONG;

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm ${className}`}>
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-red/30 shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop" 
          alt="Host" 
          className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-brand-red/10 group-hover:bg-transparent transition-colors" />
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
                {currentSegment.artist === "LIVE_CLOCK_SIGNAL" && currentShow ? currentShow.show : currentSegment.title}
              </h3>
              {(currentSegment.artist || currentShow) && (
                <span className="text-sm text-slate-400 truncate whitespace-nowrap hidden sm:inline">
                  — {currentSegment.artist === "LIVE_CLOCK_SIGNAL" 
                      ? `${formatGmt2Time(time)}${currentShow ? ` | ${currentShow.dj}` : ''}` 
                      : currentSegment.artist}
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
