
import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from '../services/audioManager';
import { SegmentType } from '../types';

interface VisualizerProps {
  isActive: boolean;
  type: SegmentType;
}

const BAR_COUNT = 32;
const BOOST_DECAY = 0.92;
const BOOST_STRENGTH = 60;

const Visualizer: React.FC<VisualizerProps> = ({ isActive, type }) => {
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(10));
  const [boosts, setBoosts] = useState<number[]>(new Array(BAR_COUNT).fill(0));
  
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const boostsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  const handleBarClick = (index: number) => {
    boostsRef.current[index] = BOOST_STRENGTH;
  };

  useEffect(() => {
    // Local procedural offsets for high-fidelity fallback
    const offsets = new Array(BAR_COUNT).fill(0).map(() => Math.random() * Math.PI * 2);
    const speeds = new Array(BAR_COUNT).fill(0).map(() => 0.05 + Math.random() * 0.1);
    const multiOffsets = new Array(BAR_COUNT).fill(0).map(() => Math.random() * 50);

    const animate = () => {
      // Decay boosts every frame
      for (let i = 0; i < BAR_COUNT; i++) {
        boostsRef.current[i] *= BOOST_DECAY;
        if (boostsRef.current[i] < 0.1) boostsRef.current[i] = 0;
      }
      setBoosts([...boostsRef.current]);

      if (!isActive) {
        setBars(prev => prev.map((h, i) => Math.max(5 + boostsRef.current[i], h - 2)));
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const analyser = audioManager.getAnalyser();
      const ctx = audioManager.getAudioContext();
      const hasRealData = analyser && ctx && ctx.state === 'running';

      let isSilent = true;

      if (hasRealData) {
        if (!dataArrayRef.current) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataArrayRef.current);
        
        // Sample few bins to check if CORS is blocking data (returns all 0s)
        isSilent = dataArrayRef.current[5] === 0 && dataArrayRef.current[15] === 0 && dataArrayRef.current[30] === 0;

        if (!isSilent) {
          const bufferLength = dataArrayRef.current.length;
          const step = Math.floor(bufferLength / BAR_COUNT);
          
          setBars(prev => {
            const next = [...prev];
            for (let i = 0; i < BAR_COUNT; i++) {
              let sum = 0;
              const start = i * step;
              for (let j = 0; j < step; j++) {
                sum += dataArrayRef.current![start + j];
              }
              const avg = sum / step;
              const boost = type === SegmentType.SONG ? 1.6 : 1.3;
              const targetHeight = Math.max(8, (avg / 255) * 100 * boost) + boostsRef.current[i];
              next[i] = next[i] + (targetHeight - next[i]) * 0.4; // Responsive smoothing
            }
            return next;
          });
        }
      }

      // Procedural Fallback (if CORS blocked, analyser silent, or context not ready)
      if (isSilent || !hasRealData) {
        setBars(prev => prev.map((h, i) => {
          const t = Date.now() * 0.003;
          const s = speeds[i];
          const o = offsets[i];
          
          // Combine multiple sine waves for a complex "musical" feel
          const mainWave = Math.sin(t * s * 10 + o);
          const fastWave = Math.sin(t * 15 + multiOffsets[i]);
          const slowWave = Math.cos(t * 2 + i * 0.3);
          
          const combined = (mainWave * 0.5 + fastWave * 0.2 + slowWave * 0.3);
          const baseHeight = type === SegmentType.SONG ? 20 : 15;
          const target = baseHeight + Math.abs(combined) * 60 + boostsRef.current[i];
          
          return h + (target - h) * 0.15;
        }));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, type]);

  const getBarColor = (index: number) => {
    const opacity = isActive ? 1 : 0.2;
    const boostFactor = boosts[index] / BOOST_STRENGTH;
    
    // Cyan base, pink boosts
    const r = Math.floor(34 + boostFactor * 210); // 34 to 244
    const g = Math.floor(211 - boostFactor * 97); // 211 to 114
    const b = Math.floor(238 - boostFactor * 56); // 238 to 182
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="flex items-end justify-between w-full h-full px-2 bg-brand-bg/50 rounded-lg border border-brand-accent/10 relative overflow-hidden group select-none">
      <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-accent/10 transition-opacity duration-1000 ${isActive ? 'opacity-20' : 'opacity-0'}`} />
      
      {bars.map((height, i) => (
        <div 
          key={i} 
          className="relative flex-1 flex flex-col items-center cursor-pointer h-full group/bar mx-px" 
          onClick={() => handleBarClick(i)}
        >
          <div
            className="w-full transition-all duration-75 ease-out absolute bottom-0 group-hover/bar:bg-white"
            style={{ 
              height: `${Math.min(100, height)}%`, 
              backgroundColor: getBarColor(i),
              boxShadow: isActive || boosts[i] > 0 ? `0 0 ${height/4}px ${getBarColor(i)}` : 'none'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Visualizer;
