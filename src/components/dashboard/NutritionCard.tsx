export default function NutritionCard() {
  const months = [
    { label: 'Jan', h: 136 },
    { label: 'Feb', h: 91 },
    { label: 'Mar', h: 153 },
    { label: 'Apr', h: 120 },
    { label: 'May', h: 91 },
    { label: 'Jun', h: 136 },
    { label: 'Jul', h: 153 },
    { label: 'Sep', h: 197 },
    { label: 'Aug', h: 120 },
    { label: 'Oct', h: 161 },
    { label: 'Nov', h: 86 },
    { label: 'Dec', h: 120 },
  ];
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Calories</h3>
        <button className="text-sm rounded-full border border-black/10 dark:border-white/10 px-3 py-1">Month ▾</button>
      </div>
      <div className="mt-4 grid grid-cols-[34px_1fr] gap-4 items-end">
        <div className="flex flex-col justify-between text-xs text-foreground/60 h-[222px]">
          {[2000, 1000, 500, 100, 0].map(v => (
            <div key={v}>{v}</div>
          ))}
        </div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-[22px] h-px bg-black/10 dark:bg-white/10" />
          <div className="flex items-end gap-6 h-[233px] pl-4">
            {months.map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-2">
                <div className="w-8 rounded-md bg-blue-600/70" style={{ height: m.h }} />
                <div className="text-xs text-foreground/60">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
