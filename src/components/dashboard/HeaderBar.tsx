import { Bell, Search, Settings, UserCircle2 } from 'lucide-react';

export default function HeaderBar() {
  return (
    <header className="flex h-16 items-center justify-between rounded-xl border border-black/10 bg-background/70 px-5 shadow-sm backdrop-blur dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-inner">
          <span className="text-sm font-semibold">CC</span>
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">CampusCare</div>
          <p className="text-xs text-foreground/50">Student wellbeing dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="group flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-foreground/70 transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10"
        >
          <Search className="size-4 text-foreground/50 transition group-hover:text-foreground" aria-hidden />
          <span>Search</span>
        </button>
        <button
          type="button"
          className="size-10 grid place-items-center rounded-lg border border-black/10 text-foreground/60 transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10"
          aria-label="Settings"
        >
          <Settings className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          className="relative size-10 grid place-items-center rounded-lg border border-black/10 text-foreground/60 transition hover:border-blue-500/40 hover:text-foreground dark:border-white/10"
          aria-label="Notifications"
        >
          <Bell className="size-5" aria-hidden />
          <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-medium text-white">2</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-blue-500/40 dark:border-white/10"
        >
          <UserCircle2 className="size-5" aria-hidden />
          <span>Layla Morgan</span>
        </button>
      </div>
    </header>
  );
}
