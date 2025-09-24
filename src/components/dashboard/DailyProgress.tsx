export default function DailyProgress() {
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 p-5">
      <h3 className="text-lg font-semibold text-center">Daily progress</h3>
      <div className="mt-6 grid place-items-center">
        <div className="size-52 rounded-full border-[10px] border-blue-600/30 relative">
          <div className="absolute inset-0 rounded-full border-[10px] border-blue-600 clip-path-[polygon(0_0,100%_0,100%_50%,0_50%)]" />
          <div className="absolute inset-0 grid place-items-center text-xl font-semibold">72%</div>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-foreground/70">Keep working on your nutrition and sleep</p>
    </section>
  );
}
