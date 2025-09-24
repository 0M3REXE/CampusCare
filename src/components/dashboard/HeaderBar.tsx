export default function HeaderBar() {
  return (
    <header className="flex items-center justify-between h-16 rounded-xl border border-black/10 dark:border-white/10 bg-background/60 px-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-blue-600/90" />
        <div className="text-xl font-semibold tracking-tight">Wellife</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="size-10 grid place-items-center rounded-lg border border-black/10 dark:border-white/10">
          <span className="text-lg" aria-hidden>🔍</span>
          <span className="sr-only">Search</span>
        </button>
        <button className="size-10 grid place-items-center rounded-lg border border-black/10 dark:border-white/10">
          <span className="text-lg" aria-hidden>⚙️</span>
          <span className="sr-only">Settings</span>
        </button>
        <button className="size-10 relative grid place-items-center rounded-lg border border-black/10 dark:border-white/10">
          <span className="text-lg" aria-hidden>🔔</span>
          <span className="absolute -top-1 -right-1 size-4 grid place-items-center rounded-full bg-red-600 text-[10px] text-white">2</span>
          <span className="sr-only">Notifications</span>
        </button>
        <div className="size-10 rounded-full bg-foreground/20" />
      </div>
    </header>
  );
}
