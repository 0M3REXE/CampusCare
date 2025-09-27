'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Activity, Flame, Footprints, HeartPulse } from 'lucide-react';
import { ensureDashboardChartsRegistered } from '@/lib/charts';
import { Skeleton } from '@/components/ui/Skeleton';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STEP_SERIES = [5200, 5800, 6100, 6600, 7200, 8400, 7900];

export default function ActivityWidget({ loading = false }: { loading?: boolean }) {
  ensureDashboardChartsRegistered();

  const chartData = useMemo(() => ({
    labels: WEEK_LABELS,
    datasets: [
      {
        data: STEP_SERIES,
        borderColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 0,
        borderWidth: 3,
        fill: {
          target: 'origin',
          above: 'rgba(129, 140, 248, 0.25)',
        },
        tension: 0.35,
      },
    ],
  }), []);

  const chartOptions = useMemo(() => ({
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.18)', drawTicks: false },
        ticks: {
          stepSize: 1000,
          callback: (value: number | string) => `${Number(value) / 1000}k`,
          color: '#94a3b8',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: { raw: number }) => `${ctx.raw.toLocaleString()} steps`,
        },
      },
    },
  }), []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-black/10 bg-background/70 p-5 shadow-sm dark:border-white/10">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="30%" className="h-6" />
          <Skeleton variant="button" width="68px" />
        </div>
        <div className="mt-6 h-40">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
              <Skeleton variant="text" width="40%" className="h-4 mb-2" />
              <Skeleton variant="text" width="60%" className="h-5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const highlights = [
    { icon: HeartPulse, label: 'Avg heart rate', value: '128 bpm' },
    { icon: Footprints, label: 'Steps this week', value: '46,500' },
    { icon: Flame, label: 'Calories burnt', value: '3,180 kcal' },
  ];

  return (
    <section className="rounded-2xl border border-black/10 bg-background/70 p-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-600">
          <Activity className="size-4" aria-hidden />
          Activity trends
        </div>
        <button className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium text-foreground/70 transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10">
          Weekly
        </button>
      </div>
      <div className="mt-5 h-44">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {highlights.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/30 text-indigo-500">
              <Icon className="size-5" aria-hidden />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
              <div className="text-sm font-semibold text-foreground">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
