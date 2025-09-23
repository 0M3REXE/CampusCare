import Button from './ui/Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  const content = (
    <div className="text-center">
      <div className="mx-auto size-16 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 9h16" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-foreground/70">{description}</p>}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a href={action.href}>
              <Button>{action.label}</Button>
            </a>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-8 bg-background/60">
      {content}
    </div>
  );
}
