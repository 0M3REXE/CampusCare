"use client";
import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  volumeLevel: number; // 0..1
  active: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ volumeLevel, active }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;
    const pulse = 1 + (active ? volumeLevel * 0.35 : 0);
    outerRef.current.style.transform = `scale(${pulse})`;
    innerRef.current.style.opacity = String(0.6 + volumeLevel * 0.4);
  }, [volumeLevel, active]);

  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <div
        ref={outerRef}
        className="size-[285px] md:size-[320px] lg:size-[340px] rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-indigo-500/30 blur-[2px] transition-transform duration-150 ease-out"
      />
      <div
        ref={innerRef}
        className="absolute size-[180px] md:size-[200px] lg:size-[220px] rounded-full bg-white/10 border border-white/15 backdrop-blur-sm shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)] transition-all duration-150 ease-out"
      />
    </div>
  );
};
