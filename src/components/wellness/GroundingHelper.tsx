"use client";
import React, { useState } from 'react';

interface SenseStep {
  label: string; // e.g. "See"
  prompt: string; // instruction text
  target: number; // how many items to list
  color: string; // tailwind color utility fragment
}

const STEPS: SenseStep[] = [
  { label: 'See', prompt: 'Name 5 things you can see around you', target: 5, color: 'from-sky-500/30 to-blue-500/30' },
  { label: 'Feel', prompt: 'Name 4 things you can physically feel (touch, pressure, texture)', target: 4, color: 'from-emerald-500/30 to-teal-500/30' },
  { label: 'Hear', prompt: 'Name 3 distinct sounds you can hear', target: 3, color: 'from-amber-500/30 to-orange-500/30' },
  { label: 'Smell', prompt: 'Name 2 smells (or neutral scents / fresh air)', target: 2, color: 'from-fuchsia-500/30 to-purple-500/30' },
  { label: 'Taste / Affirm', prompt: 'Name 1 taste OR say one kind thought about yourself', target: 1, color: 'from-pink-500/30 to-rose-500/30' },
];

const GroundingHelper: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<string[][]>(STEPS.map(() => []));
  const [current, setCurrent] = useState(0);

  const step = STEPS[current];
  const progressSteps = STEPS.length;
  const completedSteps = entries.filter((arr, i) => arr.length >= STEPS[i].target).length;
  const overallProgress = (completedSteps / progressSteps) * 100;

  const addEntry = (value: string) => {
    if (!value.trim()) return;
    setEntries(prev => {
      const clone = prev.map(arr => [...arr]);
      if (clone[current].length < STEPS[current].target) {
        clone[current].push(value.trim());
      }
      return clone;
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = String(data.get('grounding') || '');
    addEntry(value);
    (e.currentTarget.elements.namedItem('grounding') as HTMLInputElement).value = '';
  };

  const nextIfComplete = () => {
    if (entries[current].length >= step.target && current < STEPS.length - 1) {
      setCurrent(c => c + 1);
    }
  };

  const reset = () => {
    setEntries(STEPS.map(() => []));
    setCurrent(0);
  };

  return (
    <div className={`rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 ${className}`}>      
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left rounded-2xl"
        aria-expanded={open}
      >
        <div>
          <h3 className="text-lg font-semibold">5-4-3-2-1 Grounding</h3>
          <p className="text-xs text-foreground/60 mt-0.5">A sensory reset technique to anchor you in the present.</p>
        </div>
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-600 text-white">{open ? 'Hide' : 'Open'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 space-y-5">
          <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-[width]" style={{ width: `${overallProgress}%` }} />
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px] font-medium">
            {STEPS.map((s, i) => {
              const done = entries[i].length >= s.target;
              const active = i === current;
              return (
                <div key={s.label} className={`px-2 py-1 rounded-full border ${done ? 'bg-green-600 text-white border-green-600' : active ? 'border-blue-600 text-blue-700 dark:text-blue-300' : 'border-black/10 dark:border-white/10 text-foreground/60'}`}>{s.label} {entries[i].length}/{s.target}</div>
              );
            })}
          </div>

          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-gradient-to-br ${step.color}">
            <div className="text-sm font-medium">{step.prompt}</div>
            <ul className="mt-3 space-y-1 text-xs list-disc list-inside text-foreground/70">
              {entries[current].map((v, idx) => <li key={idx}>{v}</li>)}
              {entries[current].length === 0 && <li className="italic opacity-60">Add an item below and press Enter</li>}
            </ul>
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                name="grounding"
                type="text"
                aria-label="Add grounding item"
                placeholder="Type an item and press Enter"
                className="flex-1 rounded-md border border-black/10 dark:border-white/10 bg-background/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                disabled={entries[current].length >= step.target}
                autoComplete="off"
              />
              <button type="submit" disabled={entries[current].length >= step.target} className="text-xs rounded-md px-3 py-2 bg-blue-600 text-white font-medium disabled:opacity-40">Add</button>
            </form>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={nextIfComplete}
                disabled={entries[current].length < step.target || current === STEPS.length - 1}
                className="text-xs rounded-full px-4 py-1.5 bg-amber-600 text-white disabled:opacity-40"
              >Next</button>
              {current === STEPS.length - 1 && entries[current].length >= step.target && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Completed • You grounded successfully</span>
              )}
            </div>
          </div>

          <div className="text-[11px] leading-relaxed text-foreground/60">
            Tip: Speak items out loud if you can. Naming sensory details signals safety to your brain. If a sense is hard (e.g. smell), you can substitute neutral observations (&quot;the air feels cool&quot;).
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={reset} className="text-[11px] rounded-full px-4 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/[.05] dark:hover:bg-white/[.07]">Reset</button>
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="text-[11px] rounded-full px-4 py-1.5 border border-black/10 dark:border-white/10 disabled:opacity-40">Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundingHelper;
