'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ensureDashboardChartsRegistered } from '@/lib/charts';

const COMPLETION = 72;

export default function DailyProgress() {
  ensureDashboardChartsRegistered();

  const chartData = useMemo(() => ({
    labels: ['Complete', 'Remaining'],
    datasets: [
      {
        data: [COMPLETION, 100 - COMPLETION],
        backgroundColor: ['#6366f1', 'rgba(99, 102, 241, 0.12)'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }), []);

  const chartOptions = useMemo(() => ({
    cutout: '72%',
  }), []);

  return (
    <section className="rounded-2xl border border-black/10 bg-background/70 p-5 text-center shadow-sm dark:border-white/10">
      <h3 className="text-lg font-semibold">Daily progress</h3>
      <p className="mt-1 text-xs uppercase tracking-wide text-foreground/50">Wellbeing checklist</p>
      <div className="relative mx-auto mt-6 h-48 w-48">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <div className="text-3xl font-semibold text-foreground">{COMPLETION}%</div>
            <div className="text-xs uppercase tracking-wider text-foreground/50">completed</div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-2 text-sm text-foreground/70">
        <p>Strong nutrition and movement habits today.</p>
        <p className="text-foreground/60">Focus on sleep hygiene to complete the ring.</p>
      </div>
    </section>
  );
}
