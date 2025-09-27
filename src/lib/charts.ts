import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

let registered = false;

export function ensureDashboardChartsRegistered() {
  if (registered) return;

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
  );

  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
  ChartJS.defaults.font.family = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont';
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.color = '#4b5563';
  ChartJS.defaults.plugins.legend.display = false;
  ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.92)';
  ChartJS.defaults.plugins.tooltip.titleColor = '#f8fafc';
  ChartJS.defaults.plugins.tooltip.bodyColor = '#e2e8f0';

  registered = true;
}
