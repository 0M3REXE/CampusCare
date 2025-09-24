import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="CampusCare logo" width={28} height={28} priority />
          <span className="text-lg font-semibold tracking-tight">CampusCare</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-foreground/80">
          <Link className="hover:text-foreground transition-colors" href="/">Home</Link>
          <a
            className="hover:text-foreground transition-colors"
            href="https://ai-agentchatbot.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat
          </a>
          <a
            className="hover:text-foreground transition-colors"
            href="https://campuscare-alpha.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wellness Media Hub
          </a>
          <a
            className="hover:text-foreground transition-colors"
            href="https://student-and-dashboard.vercel.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            Student Dashboard
          </a>
          <a
            className="hover:text-foreground transition-colors"
            href="https://student-and-dashboard.vercel.app/student_matching"
            target="_blank"
            rel="noopener noreferrer"
          >
            Student Matching
          </a>
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
