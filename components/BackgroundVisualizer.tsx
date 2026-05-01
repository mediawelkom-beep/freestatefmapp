
import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from '../services/audioManager';

const BAR_COUNT = 50;

const BackgroundVisualizer: React.FC = () => {
  const [heights, setHeights] = useState<number[]>(new Array(BAR_COUNT).fill(10));
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    // Local procedural values for fallback
    const offsets = new Array(BAR_COUNT).fill(0).map(() => Math.random() * 100);
    const speeds = new Array(BAR_COUNT).fill(0).map(() => 0.02 + Math.random() * 0.05);
    
    const animate = () => {
      const analyser = audioManager.getAnalyser();
      const ctx = audioManager.getAudioContext();
      
      let useProcedural = true;

      if (analyser && ctx && ctx.state === 'running') {
        if (!dataArrayRef.current) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataArrayRef.current);
        
        // Sample data to see if it's all zeros (CORS block)
        const isSilent = dataArrayRef.current[10] === 0 && dataArrayRef.current[20] === 0 && dataArrayRef.current[40] === 0;
        
        if (!isSilent) {
          useProcedural = false;
          const step = Math.floor(dataArrayRef.current.length / BAR_COUNT);
          setHeights(prev => {
            const next = [...prev];
            for (let i = 0; i < BAR_COUNT; i++) {
              const dataIndex = i * step;
              const value = dataArrayRef.current![dataIndex];
              const targetHeight = (value / 255) * 80 + 5;
              next[i] = next[i] + (targetHeight - next[i]) * 0.2; 
            }
            return next;
          });
        }
      }

      if (useProcedural) {
        setHeights(prev => {
          const time = Date.now() * 0.001;
          return prev.map((h, i) => {
            const base = 15;
            const amplitude = 25;
            const freq = speeds[i] * 5;
            const wave = Math.sin(time * freq + offsets[i]) * amplitude;
            const target = base + wave + (Math.sin(time * 2 + i * 0.1) * 10);
            return h + (target - h) * 0.1;
          });
        });
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden opacity-20 pointer-events-none flex items-end justify-around px-2 py-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className="relative group/bar h-full flex items-end"
          style={{ width: `${100 / BAR_COUNT}%`, maxWidth: '20px' }}
        >
          <div
            className="w-full mx-1 bg-gradient-to-t from-brand-accent/40 via-brand-accent/10 to-transparent rounded-sm"
            style={{ 
              height: `${h}%`,
              boxShadow: `0 0 ${h/3}px rgba(34, 211, 238, 0.1)`
            }}
          />
          <div 
            className="absolute bottom-0 left-0 w-full bg-brand-accent/5 blur-2xl rounded-full"
            style={{ height: '100px', opacity: h / 100 }}
          />
        </div>
      ))}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_100%,rgba(34,211,238,0.1)_0%,transparent_60%)]" />
    </div>
  );
};

export default BackgroundVisualizer;
