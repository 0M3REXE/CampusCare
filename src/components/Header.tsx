import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
          <span className="text-lg font-semibold tracking-tight">CampusCare</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-foreground/80">
          <Link className="hover:text-foreground transition-colors" href="/">Home</Link>
          <Link className="hover:text-foreground transition-colors" href="/chat">Chat</Link>
          <Link className="hover:text-foreground transition-colors" href="/peers">Peers</Link>
          <Link className="hover:text-foreground transition-colors" href="/media">Media</Link>
          <Link className="hover:text-foreground transition-colors" href="/voice">Voice</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#get-started" className="rounded-full border px-4 py-2 text-sm border-black/10 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-colors">
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
