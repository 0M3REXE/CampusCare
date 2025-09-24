export default function ActivityWidget() {
  const rows = [
    { label: 'Move', pct: 73 },
    { label: 'Exercise', pct: 90 },
    { label: 'Steps', pct: 47 },
  ];
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity</h3>
        <button className="text-sm rounded-full border border-black/10 dark:border-white/10 px-3 py-1">Week ▾</button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[{t:'Heart rate',v:'130 bpm'},{t:'Total steps',v:'5500'},{t:'Kcal burn',v:'503 kCal'}].map(x => (
          <div key={x.t} className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-foreground/10" />
            <div>
              <div className="text-sm text-foreground/60">{x.t}</div>
              <div className="font-medium">{x.v}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {rows.map(r => (
          <div key={r.label}>
            <div className="text-sm mb-2">{r.label}</div>
            <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
