import { CalendarDays, Clock3, ChevronDown } from 'lucide-react';

export default function Filters() {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-black/10 bg-background/80 px-4 py-2 text-sm font-medium text-foreground/70 shadow-sm transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10"
      >
        <CalendarDays className="size-4" aria-hidden />
        <span>May 03 – May 18</span>
        <ChevronDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-black/10 bg-background/80 px-4 py-2 text-sm font-medium text-foreground/70 shadow-sm transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10"
      >
        <Clock3 className="size-4" aria-hidden />
        <span>24h</span>
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </div>
  );
}
