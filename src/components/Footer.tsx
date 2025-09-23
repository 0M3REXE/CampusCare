export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 text-sm text-foreground/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusCare. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <a className="hover:text-foreground transition-colors" href="#privacy">Privacy</a>
            <a className="hover:text-foreground transition-colors" href="#terms">Terms</a>
            <a className="hover:text-foreground transition-colors" href="#contact">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
