
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(10));
  const boostsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const offsets = new Array(BAR_COUNT).fill(0).map(() => Math.random() * Math.PI * 2);
    const speeds = new Array(BAR_COUNT).fill(0).map(() => 0.05 + Math.random() * 0.1);
    const multiOffsets = new Array(BAR_COUNT).fill(0).map(() => Math.random() * 50);

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Decay boosts
      for (let i = 0; i < BAR_COUNT; i++) {
        boostsRef.current[i] *= BOOST_DECAY;
        if (boostsRef.current[i] < 0.1) boostsRef.current[i] = 0;
      }

      const analyser = audioManager.getAnalyser();
      const audioCtx = audioManager.getAudioContext();
      const hasRealData = analyser && audioCtx && audioCtx.state === 'running';

      let isSilent = true;

      if (hasRealData) {
        if (!dataArrayRef.current) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataArrayRef.current);
        isSilent = dataArrayRef.current[5] === 0 && dataArrayRef.current[15] === 0 && dataArrayRef.current[30] === 0;

        if (!isSilent && isActive) {
          const bufferLength = dataArrayRef.current.length;
          const step = Math.floor(bufferLength / BAR_COUNT);
          
          for (let i = 0; i < BAR_COUNT; i++) {
            let sum = 0;
            const start = i * step;
            for (let j = 0; j < step; j++) {
              sum += dataArrayRef.current![start + j];
            }
            const avg = sum / step;
            const boost = type === SegmentType.SONG ? 1.6 : 1.3;
            const targetHeight = Math.max(8, (avg / 255) * 100 * boost) + boostsRef.current[i];
            barsRef.current[i] = barsRef.current[i] + (targetHeight - barsRef.current[i]) * 0.4;
          }
        }
      }

      if (!isActive || isSilent || !hasRealData) {
        for (let i = 0; i < BAR_COUNT; i++) {
          const t = Date.now() * 0.003;
          const s = speeds[i];
          const o = offsets[i];
          const combined = (Math.sin(t * s * 10 + o) * 0.5 + Math.sin(t * 15 + multiOffsets[i]) * 0.2 + Math.cos(t * 2 + i * 0.3) * 0.3);
          const baseHeight = type === SegmentType.SONG ? 20 : 15;
          const target = (isActive ? baseHeight : 5) + Math.abs(combined) * (isActive ? 60 : 10) + boostsRef.current[i];
          barsRef.current[i] = barsRef.current[i] + (target - barsRef.current[i]) * 0.15;
        }
      }

      // Draw to Canvas (Much faster than DOM)
      ctx2d.clearRect(0, 0, width, height);
      const barWidth = (width / BAR_COUNT);
      
      for (let i = 0; i < BAR_COUNT; i++) {
        const barHeight = (barsRef.current[i] / 100) * height;
        const boostFactor = boostsRef.current[i] / BOOST_STRENGTH;
        
        const r = Math.floor(34 + boostFactor * 210);
        const g = Math.floor(211 - boostFactor * 97);
        const b = Math.floor(238 - boostFactor * 56);
        const opacity = isActive ? 1 : 0.2;
        
        ctx2d.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        
        // Rounded bar top effect
        const x = i * barWidth + 1;
        const y = height - barHeight;
        const w = barWidth - 2;
        const h = barHeight;
        
        ctx2d.fillRect(x, y, w, h);
        
        if (isActive && barsRef.current[i] > 20) {
          ctx2d.shadowBlur = barsRef.current[i] / 5;
          ctx2d.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        } else {
          ctx2d.shadowBlur = 0;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, type]);

  return (
    <div className="w-full h-full bg-brand-bg/50 rounded-lg border border-brand-accent/10 relative overflow-hidden group select-none">
      <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-accent/10 transition-opacity duration-1000 ${isActive ? 'opacity-20' : 'opacity-0'}`} />
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        onClick={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            const index = Math.floor((x / rect.width) * BAR_COUNT);
            if (index >= 0 && index < BAR_COUNT) {
              boostsRef.current[index] = BOOST_STRENGTH;
            }
          }
        }}
      />
    </div>
  );
};

export default Visualizer;
