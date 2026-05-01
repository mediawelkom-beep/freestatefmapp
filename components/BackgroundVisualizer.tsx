
import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from '../services/audioManager';

const BAR_COUNT = 50;

const BackgroundVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const heightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(10));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const offsets = new Array(BAR_COUNT).fill(0).map(() => Math.random() * 100);
    const speeds = new Array(BAR_COUNT).fill(0).map(() => 0.02 + Math.random() * 0.05);
    
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const analyser = audioManager.getAnalyser();
      const audioCtx = audioManager.getAudioContext();
      
      let useProcedural = true;

      if (analyser && audioCtx && audioCtx.state === 'running') {
        if (!dataArrayRef.current) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataArrayRef.current);
        const isSilent = dataArrayRef.current[10] === 0 && dataArrayRef.current[20] === 0 && dataArrayRef.current[40] === 0;
        
        if (!isSilent) {
          useProcedural = false;
          const step = Math.floor(dataArrayRef.current.length / BAR_COUNT);
          for (let i = 0; i < BAR_COUNT; i++) {
            const dataIndex = i * step;
            const value = dataArrayRef.current![dataIndex];
            const targetHeight = (value / 255) * 80 + 5;
            heightsRef.current[i] = heightsRef.current[i] + (targetHeight - heightsRef.current[i]) * 0.2; 
          }
        }
      }

      if (useProcedural) {
        const time = Date.now() * 0.001;
        for (let i = 0; i < BAR_COUNT; i++) {
          const base = 15;
          const amplitude = 25;
          const freq = speeds[i] * 5;
          const wave = Math.sin(time * freq + offsets[i]) * amplitude;
          const target = base + wave + (Math.sin(time * 2 + i * 0.1) * 10);
          heightsRef.current[i] = heightsRef.current[i] + (target - heightsRef.current[i]) * 0.1;
        }
      }

      // Draw to Canvas
      ctx2d.clearRect(0, 0, width, height);
      const barWidth = width / BAR_COUNT;
      
      const gradient = ctx2d.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.4)');
      gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.1)');
      gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');

      for (let i = 0; i < BAR_COUNT; i++) {
        const h = (heightsRef.current[i] / 100) * height;
        const x = i * barWidth + (barWidth * 0.1);
        const w = barWidth * 0.8;
        const y = height - h;
        
        ctx2d.fillStyle = gradient;
        ctx2d.fillRect(x, y, w, h);
        
        // Glow effect
        if (heightsRef.current[i] > 30) {
          ctx2d.shadowBlur = heightsRef.current[i] / 4;
          ctx2d.shadowColor = 'rgba(34, 211, 238, 0.2)';
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
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden opacity-20 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_100%,rgba(34,211,238,0.1)_0%,transparent_60%)]" />
    </div>
  );
};

export default BackgroundVisualizer;
