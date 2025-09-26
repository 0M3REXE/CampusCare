"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PatternKey = 'box' | 'calm' | 'resonant';

interface BreathingPattern { key: PatternKey; name: string; phases: { label: string; seconds: number }[]; description: string; }

const PATTERNS: BreathingPattern[] = [
  { key: 'box', name: 'Box 4-4-4-4', description: 'Balances and stabilizes – equal inhale, hold, exhale, hold.', phases: [
    { label: 'Inhale', seconds: 4 }, { label: 'Hold', seconds: 4 }, { label: 'Exhale', seconds: 4 }, { label: 'Hold', seconds: 4 }
  ]},
  { key: 'calm', name: '4-7-8 Calm', description: 'Relaxation pattern – lengthens exhale to engage parasympathetic response.', phases: [
    { label: 'Inhale', seconds: 4 }, { label: 'Hold', seconds: 7 }, { label: 'Exhale', seconds: 8 }
  ]},
  { key: 'resonant', name: 'Resonant 4-6', description: 'Coherent breathing around ~6 breaths/min for steady calm.', phases: [
    { label: 'Inhale', seconds: 4 }, { label: 'Exhale', seconds: 6 }
  ]},
];

interface BreathingExerciseProps { className?: string; }

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ className = '' }) => {
  const [patternKey, setPatternKey] = useState<PatternKey>('box');
  const pattern = useMemo(()=> PATTERNS.find(p => p.key === patternKey)!, [patternKey]);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedPhase, setElapsedPhase] = useState(0); // seconds in current phase
  const [cycleCount, setCycleCount] = useState(0);
  const [goalCycles, setGoalCycles] = useState(5); // user target for session progress
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const totalPhaseSeconds = pattern.phases[phaseIndex].seconds;
  const phaseLabel = pattern.phases[phaseIndex].label;
  const cycleDuration = useMemo(() => pattern.phases.reduce((s,p)=>s+p.seconds,0), [pattern]);
  const elapsedInCycle = useMemo(() => {
    const prior = pattern.phases.slice(0, phaseIndex).reduce((s,p)=>s+p.seconds,0);
    return prior + elapsedPhase;
  }, [pattern, phaseIndex, elapsedPhase]);
  const phaseProgress = totalPhaseSeconds === 0 ? 0 : Math.min(1, elapsedPhase / totalPhaseSeconds);
  const cycleFraction = cycleDuration === 0 ? 0 : Math.min(1, elapsedInCycle / cycleDuration);
  const overallCycleProgress = (cycleCount + cycleFraction) / goalCycles; // 0..N/goalCycles
  const boundedCycleProgress = Math.min(1, overallCycleProgress);

  // Update live region when phase changes
  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = `${phaseLabel}`;
  }, [phaseLabel]);

  const advancePhase = useCallback(() => {
    setPhaseIndex(idx => {
      const next = idx + 1;
      if (next >= pattern.phases.length) {
        setCycleCount(c => c + 1);
        return 0;
      }
      return next;
    });
    setElapsedPhase(0);
  }, [pattern.phases.length]);

  const tick = useCallback((ts: number) => {
    if (!running) return;
    if (lastTsRef.current == null) { lastTsRef.current = ts; }
    const delta = (ts - lastTsRef.current) / 1000; // seconds
    lastTsRef.current = ts;
    setElapsedPhase(prev => {
      const next = prev + delta;
      if (next >= totalPhaseSeconds) {
        // phase complete
        requestAnimationFrame(() => advancePhase());
        return 0; // will be reset
      }
      return next;
    });
    rafRef.current = requestAnimationFrame(tick);
  }, [advancePhase, running, totalPhaseSeconds]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, tick]);

  // Restart cycles when pattern changes
  useEffect(() => {
    setPhaseIndex(0); setElapsedPhase(0); setCycleCount(0); lastTsRef.current = null;
  }, [patternKey]);

  const toggle = () => setRunning(r => !r);
  const reset = () => { setRunning(false); setPhaseIndex(0); setElapsedPhase(0); setCycleCount(0); lastTsRef.current = null; };

  // Easing helper (cubic ease in-out)
  const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Visual scale mapping with a restrained range for better aesthetics.
  // Base scale range: 1.0 (rest) -> 1.35 (peak)
  const INHALE_MIN = 1.0;
  const INHALE_MAX = 1.35;
  const EXHALE_MIN = 1.0; // end of exhale
  const EXHALE_START = 1.35; // start of exhale

  const targetScale = (() => {
    if (phaseLabel === 'Inhale') {
      const eased = easeInOut(phaseProgress);
      return INHALE_MIN + (INHALE_MAX - INHALE_MIN) * eased;
    }
    if (phaseLabel === 'Exhale') {
      const eased = easeInOut(phaseProgress);
      return EXHALE_START - (EXHALE_START - EXHALE_MIN) * eased;
    }
    // Hold: keep the last reached boundary (peak after inhale, base after exhale)
    const prevLabel = pattern.phases[(phaseIndex - 1 + pattern.phases.length) % pattern.phases.length].label;
    if (prevLabel === 'Inhale') return INHALE_MAX;
    if (prevLabel === 'Exhale') return EXHALE_MIN;
    return 1.17; // neutral midpoint fallback
  })();

  const smoothScale = reducedMotion ? 1 : targetScale;

  return (
    <div className={`rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 p-5 ${className}`}>      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4 min-w-[260px]">
          <h3 className="text-lg font-semibold">Guided Breathing</h3>
          <p className="text-sm text-foreground/70">Use slow, deliberate breathing to help ease anxiety or a rising panic response. Choose a pattern and press Start.</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {PATTERNS.map(p => (
              <button
                key={p.key}
                onClick={() => setPatternKey(p.key)}
                disabled={running && p.key !== patternKey}
                className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${p.key === patternKey ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'} disabled:opacity-50`}
              >{p.name}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] uppercase tracking-wide text-foreground/50">Goal Cycles:</span>
            {[3,5,10].map(g => (
              <button
                key={g}
                disabled={running}
                onClick={() => setGoalCycles(g)}
                className={`text-[10px] px-2 py-1 rounded-full border ${goalCycles === g ? 'bg-indigo-600 text-white border-indigo-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.05] dark:hover:bg-white/[.08]'} disabled:opacity-40`}
              >{g}</button>
            ))}
          </div>
          <div className="text-xs text-foreground/60 mt-1 leading-relaxed">{pattern.description}</div>
          <div className="mt-4 flex gap-3">
            <button onClick={toggle} className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${running ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>{running ? 'Pause' : 'Start'}</button>
            <button onClick={reset} disabled={running && phaseIndex !== 0} className="rounded-full px-5 py-2 text-sm border border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-40">Reset</button>
          </div>
          <div className="mt-2 text-sm flex gap-6">
            <div><span className="text-foreground/50">Phase:</span> {phaseLabel}</div>
            <div><span className="text-foreground/50">Time:</span> {Math.ceil(totalPhaseSeconds - elapsedPhase)}s</div>
            <div><span className="text-foreground/50">Cycles:</span> {cycleCount}/{goalCycles}</div>
          </div>
          <div className="mt-2 relative h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-[width] duration-300" style={{ width: `${boundedCycleProgress*100}%` }} />
            {boundedCycleProgress >= 1 && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white/80">Goal Reached</div>}
          </div>
          <div ref={liveRef} aria-live="polite" className="sr-only" />
          {reducedMotion && <div className="mt-2 text-xs text-foreground/50">Reduced motion enabled: animation simplified.</div>}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            className="relative size-60 md:size-72 lg:size-80 rounded-full bg-gradient-to-br from-blue-500/30 via-indigo-500/30 to-purple-500/30 flex items-center justify-center shadow-inner"
            style={{ transform: `scale(${smoothScale})`, transition: reducedMotion ? 'none' : 'transform 0.9s ease-in-out' }}
          >
            <div className="absolute inset-0 rounded-full backdrop-blur-sm border border-white/15" />
            <div className="text-sm font-medium text-white drop-shadow-sm select-none">{phaseLabel}</div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-xs text-foreground/60 leading-relaxed">
        Feeling overwhelmed? Let your shoulders drop. Notice where your body touches the chair or floor. Slow, steady breathing calms your nervous system.
      </div>
    </div>
  );
};

export default BreathingExercise;