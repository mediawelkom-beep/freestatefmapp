
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, SegmentType, RadioSegment } from './types';
import { audioManager } from './services/audioManager';
import Player from './components/Player';
import BackgroundVisualizer from './components/BackgroundVisualizer';
import Logo from './components/Logo';
import { AboutUs, ContactUs, Advertise } from './components/InfoPages';
import { LIVE_STREAM_URL, BROADCAST_SCHEDULE } from './constants';
import { Play, Pause, Zap, Calendar, Clock, Menu, X, Activity, Headphones, Radio, Volume2, Globe } from 'lucide-react';

type ViewMode = 'HOME' | 'ABOUT' | 'CONTACT' | 'ADVERTISE';

const LIVE_SEGMENT: RadioSegment = {
  type: SegmentType.SONG,
  title: "Free State FM",
  artist: "LIVE_CLOCK_SIGNAL",
  duration: 3600
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const liveAudioRef = useRef<HTMLAudioElement | null>(null);
  const isCancelledRef = useRef(false);
  const retryCountRef = useRef(0);
  const useWebAudioRef = useRef(true);

  const getCurrentShow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const specificShow = BROADCAST_SCHEDULE.find(item => {
      if (item.days && !item.days.includes(currentDay)) return false;
      const [startHour] = item.time.split(' - ')[0].split(':').map(Number);
      const [endHour] = item.time.split(' - ')[1].split(':').map(Number);
      if (endHour === 0 || endHour === 24) return currentHour >= startHour || currentHour < endHour;
      return currentHour >= startHour && currentHour < endHour;
    });
    return specificShow || BROADCAST_SCHEDULE[BROADCAST_SCHEDULE.length - 1];
  };

  const currentShow = getCurrentShow();

  useEffect(() => {
    const handleFirstInteraction = () => {
      audioManager.forceUnlock();
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const getStreamUrl = (retryStep: number) => {
    const base = LIVE_STREAM_URL;
    const t = Date.now();
    // Detect if base URL already has query parameters to use '&' instead of '?'
    const separator = base.includes('?') ? '&' : '?';
    
    // PHP Proxy wrappers often need specific hints to correctly stream to certain browsers
    switch(retryStep) {
        case 0: return `${base}${separator}_t=${t}`; 
        case 1: return `${base}${separator}type=mp3&_t=${t}`; // Hint for MP3 type
        case 2: return `${base}${separator}format=mpeg&_t=${t}`; // Alternative hint
        case 3: return `${base}${separator};&_t=${t}`; // Shoutcast ';' suffix trick
        case 4: return `${base}${separator}cache=${t}&ext=.mp3`; // Force extension suffix
        default: return `${base}${separator}retry=${retryStep}`;
    }
  };

  useEffect(() => {
    // Initialize the audio element once and keep it
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    liveAudioRef.current = audio;
    
    const handleError = (e: Event) => {
      // Access current state via refs if needed, but here we can use the closure if we're careful
      // However, it's better to check the ref for the latest state
      if (!liveAudioRef.current || isCancelledRef.current) return;
      
      const target = e.target as HTMLAudioElement;
      const error = target.error;
      
      const errorDetails = error ? {
        code: error.code,
        message: error.message,
      } : "Unknown Error";

      console.error("Live Stream Error State:", JSON.stringify(errorDetails));

      // We only want to retry if we are actually trying to play live
      // Since this is a stable effect, we need to check if we're in live mode
      // We can't use isLiveMode from state here easily without adding it to deps
      // So we'll check the appState or a ref.
    };

    const handleCanPlay = () => {
      // Same here, check ref/state
    };

    // We'll move the event listeners to a separate effect or handle them differently
    // to avoid dependency on isLiveMode
    
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Separate effect for live stream event listeners to handle state changes
  useEffect(() => {
    const audio = liveAudioRef.current;
    if (!audio) return;

    const handleError = (e: Event) => {
      if (isCancelledRef.current) return;
      
      const target = e.target as HTMLAudioElement;
      const error = target.error;
      
      console.log(`Live Stream: Error detected. Code: ${error?.code}, Message: ${error?.message}`);

      if (retryCountRef.current < 15) {
          retryCountRef.current++;
          
          if (error && (error.code === 4 || error.code === 2)) {
            console.log("Live Stream: Playback issue detected. Dropping CORS and Web Audio for stability.");
            audio.removeAttribute('crossOrigin');
            useWebAudioRef.current = false;
          }

          if (retryCountRef.current === 1) {
              audio.removeAttribute('crossOrigin');
          }

          const delay = Math.min(retryCountRef.current * 2000, 10000); // Gradual backoff
          console.log(`Live Stream: Attempting retry ${retryCountRef.current}/15 in ${delay}ms...`);

          setTimeout(() => {
            if (isCancelledRef.current) return;
            audio.pause();
            const newUrl = getStreamUrl(retryCountRef.current);
            audio.src = newUrl;
            audio.load();
            audio.play().catch(pErr => console.warn("Live Stream: Retry play blocked:", pErr));
          }, delay); 
      } else {
          console.error("Live Stream: Critical failure after 15 retries - Giving up.");
          setAppState(AppState.ERROR);
          setIsLivePlaying(false);
      }
    };

    const handleCanPlay = () => {
      if (!isCancelledRef.current) {
        console.log("Live Stream: Ready to play. useWebAudio:", useWebAudioRef.current);
        setAppState(AppState.PLAYING);
        setIsLivePlaying(true);
        setIsConnecting(false);
        
        // Reset retry count on success
        retryCountRef.current = 0;

        if (useWebAudioRef.current) {
          audioManager.connectMediaElement(audio);
        }
      }
    };

    const handleStalled = () => {
      if (isLivePlaying && !isCancelledRef.current) {
        console.log("Live Stream: Stalled detected. Attempting soft keep-alive...");
        // Sometimes just calling play() again wakes it up
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleStalled);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleStalled);
    };
  }, []);

  const toggleLiveStream = async () => {
    setIsMenuOpen(false); // Close menu if open
    if (!liveAudioRef.current) return;
    
    console.log("App: Initializing Live Stream...");
    handleExit();
    
    // CRITICAL: Resume context in the direct call stack of the user gesture
    await audioManager.forceUnlock();

    setAppState(AppState.PLAYING); 
    setIsConnecting(true);
    setViewMode('HOME');
    isCancelledRef.current = false;
    retryCountRef.current = 0;
    useWebAudioRef.current = true; // Reset

    // Start the audio loading/playing
    try {
      const audio = liveAudioRef.current;
      if (!audio) return;
      
      audio.crossOrigin = "anonymous"; 
      audio.src = getStreamUrl(0);
      audio.load();
      await audio.play();
      console.log("App: Live stream play() called successfully.");
    } catch (err) {
      console.warn("App: Initial play failed, waiting for error handler retry.", err);
    }
  };

  const handleTogglePlay = () => {
    const ctx = audioManager.getAudioContext();
    console.log("App: Toggle Play. Current state:", appState, "AudioContext state:", ctx?.state);
    
    audioManager.resume();
    if (isLivePlaying) {
      liveAudioRef.current?.pause();
      setIsLivePlaying(false);
      setAppState(AppState.PAUSED);
    } else {
      liveAudioRef.current?.play().catch((e) => console.error("App: Live play failed:", e));
      setIsLivePlaying(true);
      setAppState(AppState.PLAYING);
    }
  };

  const handleExit = () => {
      console.log("App: Cleaning up audio session.");
      isCancelledRef.current = true;
      audioManager.stop();
      if (liveAudioRef.current) {
          liveAudioRef.current.pause();
          liveAudioRef.current.src = ""; 
          try { liveAudioRef.current.load(); } catch(e) {}
      }
      setIsLivePlaying(false);
      setIsConnecting(false);
      setAppState(AppState.SETUP);
      setViewMode('HOME'); 
  };

  const currentPlayerSegment = LIVE_SEGMENT;

  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col relative overflow-hidden font-sans">
      <BackgroundVisualizer />

      <header className="w-full py-5 border-b border-brand-border bg-white/90 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Logo onClick={() => setViewMode('HOME')} className="cursor-pointer" />
            <nav className="hidden lg:flex items-center gap-10">
              <button onClick={() => setViewMode('HOME')} className={`text-[11px] font-bold uppercase tracking-[0.25em] transition-colors ${viewMode === 'HOME' ? 'text-brand-red' : 'text-slate-400 hover:text-brand-red'}`}>Home</button>
              <button onClick={() => setViewMode('ABOUT')} className={`text-[11px] font-bold uppercase tracking-[0.25em] transition-colors ${viewMode === 'ABOUT' ? 'text-brand-red' : 'text-slate-400 hover:text-brand-red'}`}>About Us</button>
              <button onClick={() => setViewMode('ADVERTISE')} className={`text-[11px] font-bold uppercase tracking-[0.25em] transition-colors ${viewMode === 'ADVERTISE' ? 'text-brand-red' : 'text-slate-400 hover:text-brand-red'}`}>Advertise</button>
              <button onClick={() => setViewMode('CONTACT')} className={`text-[11px] font-bold uppercase tracking-[0.25em] transition-colors ${viewMode === 'CONTACT' ? 'text-brand-red' : 'text-slate-400 hover:text-brand-red'}`}>Contact</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={toggleLiveStream} 
              animate={{ 
                boxShadow: ["0 0 0px rgba(225, 29, 72, 0)", "0 0 20px rgba(225, 29, 72, 0.4)", "0 0 0px rgba(225, 29, 72, 0)"] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="hidden sm:flex px-6 py-2.5 bg-brand-red text-white font-bold uppercase text-[10px] rounded-full tracking-[0.2em] items-center gap-2 hover:bg-black transition-all active:scale-95 group"
            >
              <Radio className="w-3.5 h-3.5 group-hover:animate-pulse" /> Tune In Live
            </motion.button>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-slate-400 hover:text-brand-red transition-colors bg-slate-50 rounded-full border border-slate-100 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="hidden lg:flex p-2 text-brand-dark hover:text-brand-red transition-colors border border-transparent hover:border-brand-border rounded-full">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-white border-l border-brand-border p-8 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-16">
                <Logo onClick={() => { setViewMode('HOME'); setIsMenuOpen(false); }} className="scale-75 origin-left" />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-brand-red hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={toggleLiveStream}
                  className="flex items-center justify-center gap-3 p-5 rounded-xl bg-brand-red text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-brand-red/20 mb-4 hover:bg-black transition-all transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" /> Listen Now
                </button>

                {[
                  { mode: 'HOME', icon: Radio, label: 'Station Home' },
                  { mode: 'ABOUT', icon: Activity, label: 'Our Mission' },
                  { mode: 'ADVERTISE', icon: Headphones, label: 'Advertise' },
                  { mode: 'CONTACT', icon: Zap, label: 'Get in Touch' },
                ].map((item) => (
                  <button 
                    key={item.mode}
                    onClick={() => { setViewMode(item.mode as ViewMode); setIsMenuOpen(false); }} 
                    className={`flex items-center justify-between p-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                      viewMode === item.mode ? 'bg-brand-red text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-brand-dark'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-5 h-5 ${viewMode === item.mode ? 'text-white' : 'text-brand-red'}`} /> 
                      {item.label}
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${viewMode === item.mode ? 'bg-white' : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>

              <div className="mt-auto space-y-8">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Currently on Air</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-brand-dark group-hover:text-brand-red transition-colors">{currentShow.show}</p>
                    <p className="text-[10px] font-medium text-slate-400">with {currentShow.dj}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 px-2">
                  Free State FM • Regional Digital Radio
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16">
        {viewMode !== 'HOME' ? (
          <div className="glass p-8 md:p-16 rounded-2xl relative animate-in fade-in zoom-in-95 duration-500">
            <button onClick={() => setViewMode('HOME')} className="absolute top-8 right-8 p-2 hover:text-brand-accent transition-colors"><X className="w-6 h-6" /></button>
            {viewMode === 'ABOUT' && <AboutUs />}
            {viewMode === 'CONTACT' && <ContactUs />}
            {viewMode === 'ADVERTISE' && <Advertise />}
          </div>
        ) : (
          <div className="space-y-24">
            {appState === AppState.SETUP && (
              <section className="relative flex flex-col lg:flex-row items-center gap-16 py-8 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex-1 space-y-10 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-brand-red/10 bg-brand-red/5 text-brand-red text-[11px] font-bold tracking-[0.25em] uppercase">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                      </span>
                      Welcome to Free State FM
                  </div>
                  <h1 className="text-5xl md:text-[5rem] lg:text-[6.5rem] font-display font-extrabold uppercase tracking-tight leading-[0.85] text-brand-dark">
                    Connecting you<br />
                    with the <span className="text-brand-red">stars.</span>
                  </h1>
                  <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0 text-balance leading-relaxed">
                    Regional hits, soul serenade, and crystal-clear digital audio. Experience the evolution of radio across the Free State and beyond.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                    <motion.button 
                      onClick={toggleLiveStream} 
                      animate={{ 
                        scale: [1, 1.02, 1],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="w-full sm:w-auto px-12 py-5 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-[0.3em] hover:bg-brand-red transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                    >
                      <Play className="w-5 h-5 fill-current" /> Listen Now
                    </motion.button>
                    <div className="flex items-center gap-6">
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                             <img src={`https://i.pravatar.cc/100?u=${i}`} alt="listener" className="w-full h-full object-cover" />
                           </div>
                         ))}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-brand-dark">20.4k+ Live</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Listeners Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                    <img 
                      src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
                      alt="Modern Radio Studio" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl border-white/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                          <Volume2 className="w-6 h-6 text-brand-red" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-red mb-0.5">Live Stream</p>
                          <p className="text-sm font-bold text-brand-dark">High Quality Digital Signal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-red rounded-full opacity-5 blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-slate-100 rounded-full opacity-50 z-[-1]" />
                </div>
              </section>
            )}

            {(appState === AppState.PLAYING || appState === AppState.PAUSED) && (
              <div className="fixed inset-0 z-[120] bg-brand-dark/40 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-in zoom-in-95 duration-500">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full h-full max-w-2xl max-h-[750px] shadow-2xl rounded-none md:rounded-[2.5rem] overflow-hidden border-0 md:border border-slate-200 relative bg-white"
                >
                   <Player 
                      currentSegment={currentPlayerSegment}
                      isPlaying={isLivePlaying}
                      isLoading={isConnecting}
                      onTogglePlay={handleTogglePlay}
                      onSkip={() => {}}
                      onExit={handleExit}
                   />
                </motion.div>
              </div>
            )}

            {appState === AppState.ERROR && (
               <div className="flex flex-col items-center justify-center py-24 text-center space-y-12 animate-in zoom-in-90 duration-500">
                  <div className="w-32 h-32 rounded-full bg-brand-secondary/10 flex items-center justify-center border border-brand-secondary/30">
                    <Zap className="w-16 h-16 text-brand-secondary animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-display font-bold uppercase">Signal Failure</h3>
                    <p className="text-slate-500 text-lg">Unable to establish connection to the primary stream cluster.</p>
                  </div>
                  <button onClick={handleExit} className="px-12 py-5 border border-brand-secondary text-brand-secondary font-bold uppercase rounded-none tracking-[0.3em] hover:bg-brand-secondary hover:text-white transition-all active:scale-95">Re-initialize</button>
               </div>
            )}
          </div>
        )}
      </main>

      <footer className="w-full py-16 border-t border-brand-border bg-brand-bg/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 opacity-60">
           <Logo className="grayscale brightness-200" />
           <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500">© 2026 Free State FM • Digital Radio</p>
           <div className="flex gap-8 text-slate-500">
              <Clock className="w-5 h-5 hover:text-brand-accent transition-colors" />
              <Calendar className="w-5 h-5 hover:text-brand-accent transition-colors" />
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
