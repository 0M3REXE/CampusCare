export default function Filters() {
  return (
    <div className="flex items-center justify-end gap-3">
      <button className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-3 py-2 text-sm">
        <span className="text-lg" aria-hidden>📅</span>
        <span>May 03 - May 18</span>
        <span aria-hidden>▾</span>
      </button>
      <button className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-3 py-2 text-sm">
        <span className="text-lg" aria-hidden>⏱️</span>
        <span>24h</span>
        <span aria-hidden>▾</span>
      </button>
    </div>
  );
}
