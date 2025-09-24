export default function MeditationCard() {
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meditation</h3>
        <button className="size-6 rounded-full border border-black/10 dark:border-white/10" aria-label="Options" />
      </div>
      <div className="mt-4 rounded-xl bg-gradient-to-br from-purple-400/20 to-indigo-500/20 h-64 grid place-items-center">
        <div className="size-16 grid place-items-center rounded-full bg-white/90 text-blue-700 shadow">▶</div>
      </div>
      <div className="mt-4">
        <div className="font-medium">Good vibes, good life</div>
        <div className="text-sm text-foreground/60">Positive thinking | 27min</div>
      </div>
    </section>
  );
}
