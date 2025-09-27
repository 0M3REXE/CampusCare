'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ensureDashboardChartsRegistered } from '@/lib/charts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CALORIES = [1820, 1940, 1760, 1895, 2010, 1955, 1880, 2055, 1990, 1875, 1740, 1930];

export default function NutritionCard() {
  ensureDashboardChartsRegistered();

  const data = useMemo(() => ({
    labels: MONTH_LABELS,
    datasets: [
      {
        label: 'Daily average calories',
        data: CALORIES,
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 34,
      },
    ],
  }), []);

  const maxValue = Math.max(...CALORIES);
  const options = useMemo(() => ({
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.18)', drawTicks: false },
        suggestedMax: maxValue + 200,
        ticks: {
          stepSize: 200,
          callback: (value: number | string) => `${value}`,
          color: '#64748b',
        },
      },
    },
  }), [maxValue]);

  return (
    <section className="rounded-2xl border border-black/10 bg-background/70 p-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Calorie balance</h3>
          <p className="text-xs text-foreground/50">Average intake over the last 12 months</p>
        </div>
        <button className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium text-foreground/70 transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10">
          Monthly
        </button>
      </div>
      <div className="mt-6 h-72">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}
