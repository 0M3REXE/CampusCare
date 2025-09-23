function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'primary' | 'secondary' | 'muted' | 'outline';
};

const base = 'inline-flex items-center rounded-full text-xs px-2.5 py-1';
const variants = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-black/5 dark:bg-white/10 text-foreground',
  muted: 'bg-black/3 dark:bg-white/5 text-foreground/80',
  outline: 'border border-black/10 dark:border-white/15 text-foreground',
};

export default function Badge({ variant = 'secondary', className, ...props }: BadgeProps) {
  return <span className={cx(base, variants[variant], className)} {...props} />;
}
