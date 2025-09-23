import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <EmptyState
        title="Page not found"
        description="The page you’re looking for doesn’t exist or has moved."
        action={{ label: 'Go home', href: '/' }}
      />
      <div className="mt-4 text-center text-sm text-foreground/60">
        Or <Link className="underline" href="/media">browse media</Link> or <Link className="underline" href="/chat">open chat</Link>.
      </div>
    </div>
  );
}
