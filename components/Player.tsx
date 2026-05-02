
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RadioSegment, SegmentType } from '../types';
import Visualizer from './Visualizer';
import Logo from './Logo';
import { Pause, Play, SkipForward, Radio, Music, Sparkles, Activity, X, Calendar, Clock as ClockIcon, Globe, ChevronUp, ChevronDown, User, Share2, Download } from 'lucide-react';
import { BROADCAST_SCHEDULE, APP_NAME } from '../constants';

interface PlayerProps {
  currentSegment: RadioSegment | null | undefined;
  isPlaying: boolean;
  isLoading?: boolean;
  onTogglePlay: () => void;
  onSkip: () => void;
  onExit: () => void;
}

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col items-center gap-1 animate-in fade-in duration-1000">
      <div className="flex items-center gap-2 text-brand-secondary font-bold tracking-[0.2em] uppercase text-[11px] italic">
        <Calendar className="w-3.5 h-3.5" />
        {formatDate(time)}
      </div>
      <div className="flex items-center gap-3 text-white font-display font-bold text-4xl tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
        <ClockIcon className="w-6 h-6 text-brand-accent animate-pulse" />
        {formatTime(time)}
      </div>
    </div>
  );
};

const Player: React.FC<PlayerProps> = ({ currentSegment, isPlaying, isLoading, onTogglePlay, onExit }) => {
  const [showSchedule, setShowSchedule] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: APP_NAME,
      text: `Listen to ${APP_NAME} Live - Digital Radio for the Free State`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const getCurrentShow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // First try to find a show for the specific day and time
    const specificShow = BROADCAST_SCHEDULE.find(item => {
      if (item.days && !item.days.includes(currentDay)) return false;
      
      const [startHour] = item.time.split(' - ')[0].split(':').map(Number);
      const [endHour] = item.time.split(' - ')[1].split(':').map(Number);
      
      if (endHour === 0 || endHour === 24) {
        return currentHour >= startHour || currentHour < endHour;
      }
      return currentHour >= startHour && currentHour < endHour;
    });

    if (specificShow) return specificShow;

    // Fallback to the default (which is now the last item in my list)
    return BROADCAST_SCHEDULE[BROADCAST_SCHEDULE.length - 1];
  };

  const currentShow = getCurrentShow();

  const formatGmt2Time = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false,
      timeZone: 'Africa/Johannesburg' 
    }) + ' GMT+2';
  };

  const [timeNow, setTimeNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!currentSegment) return null;

  return (
    <div className="w-full h-full flex flex-col bg-white text-brand-dark relative overflow-hidden">
        {/* Schedule Overlay */}
        <AnimatePresence>
          {showSchedule && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-white p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-extrabold uppercase tracking-tight text-brand-dark">
                  Broadcast<span className="text-brand-red">. Schedule</span>
                </h3>
                <button 
                  onClick={() => setShowSchedule(false)}
                  className="p-3 rounded-full bg-slate-100 text-slate-500 hover:text-brand-red transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {BROADCAST_SCHEDULE.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-brand-red/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 text-brand-red" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {item.time} • {item.days?.length === 7 ? "Daily" : item.days?.includes(0) && item.days.length === 1 ? "Sundays" : "Weekdays"}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-brand-dark group-hover:text-brand-red transition-colors">{item.show}</h4>
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                        <User className="w-3.5 h-3.5" />
                        {item.dj}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Radio className="w-5 h-5 text-brand-red" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">Signal Resolution Optimized</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between p-6 z-10 border-b border-brand-border bg-white/80 backdrop-blur-sm">
             <button onClick={onExit} className="text-[10px] font-bold text-slate-400 hover:text-brand-red transition-colors tracking-[0.2em] flex items-center gap-2 uppercase">
                 <X className="w-4 h-4" /> Disconnect
             </button>
             <div className="flex items-center space-x-3 px-4 py-1.5 rounded-full bg-brand-red/5 border border-brand-red/10">
                 <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-brand-red">Direct Stream Active</span>
             </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 z-10 overflow-y-auto">
            <div className="w-full max-w-lg space-y-12 flex flex-col items-center">
                <div className="w-full">
                    <DigitalClock />
                </div>
                
                <div className="w-full relative h-40 flex items-center justify-center overflow-hidden bg-slate-50 rounded-2xl border border-slate-100">
                    <Visualizer isActive={isPlaying} type={currentSegment.type} />
                </div>

                <div className="animate-in fade-in zoom-in duration-1000 delay-300">
                    <Logo className="items-center" />
                </div>

                <div className="text-center space-y-6 w-full">
                  <div className="p-4 bg-brand-red/5 border border-brand-red/10 rounded-2xl inline-flex flex-col items-center mb-2">
                    <p className="text-[9px] font-bold text-brand-red uppercase tracking-[0.3em] mb-1">On Air Now</p>
                    <p className="text-sm font-bold text-brand-dark uppercase tracking-tight">{currentShow.show}</p>
                    <p className="text-[10px] font-medium text-slate-400 capitalize">with {currentShow.dj}</p>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentSegment.title + currentSegment.artist}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="space-y-1"
                    >
                      <p className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] italic">Free State Digital Signal</p>
                      <h2 className="text-4xl md:text-5xl font-display font-extrabold leading-[0.9] uppercase tracking-tighter text-brand-dark italic">
                          {currentSegment.title === "Free State FM" ? currentShow.show : currentSegment.title}
                      </h2>
                      {currentSegment.artist && currentSegment.artist !== "LIVE_CLOCK_SIGNAL" ? (
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">{currentSegment.artist}</p>
                      ) : (
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">
                          {formatGmt2Time(timeNow)} <span className="opacity-40 mx-2">|</span> {currentShow.dj}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-[1px] flex-1 bg-slate-100" />
                    <Globe className="w-5 h-5 text-slate-300 animate-spin-custom" style={{ animationDuration: '20s' }} />
                    <div className="h-[1px] flex-1 bg-slate-100" />
                  </div>
                </div>
            </div>
        </div>

        <div className="p-10 flex flex-col items-center justify-center z-10 bg-slate-50/50 border-t border-brand-border">
            <button 
              onClick={() => setShowSchedule(true)}
              className="mb-8 px-5 py-2 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 hover:bg-white hover:text-brand-red hover:border-brand-red transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <Calendar className="w-3.5 h-3.5" /> View Broadcast Schedule
            </button>

            <motion.button 
              onClick={onTogglePlay} 
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              animate={{ 
                boxShadow: isPlaying ? "0 0 20px rgba(225, 29, 72, 0.3)" : "0 8px 15px rgba(225, 29, 72, 0.1)"
              }}
              className={`group relative w-24 h-24 rounded-2xl bg-brand-red text-white flex items-center justify-center hover:bg-black transition-all mb-6 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Radio className="w-10 h-10" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={isPlaying ? 'pause' : 'play'}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                    </motion.div>
                  )}
                </AnimatePresence>
            </motion.button>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-8">
              <Activity className="w-4 h-4" /> Signal Integrity 99.8%
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 hover:text-brand-red hover:bg-brand-red/5 transition-all text-[10px] font-bold uppercase tracking-widest"
               >
                 <Share2 className="w-3.5 h-3.5" /> Share
               </button>
               
               {canInstall && (
                 <button 
                  onClick={handleInstall}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red text-white hover:bg-black transition-all text-[10px] font-bold uppercase tracking-widest animate-pulse"
                 >
                   <Download className="w-3.5 h-3.5" /> Install App
                 </button>
               )}
            </div>
        </div>
    </div>
  );
};

export default Player;
