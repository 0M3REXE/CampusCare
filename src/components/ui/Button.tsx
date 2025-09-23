function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'muted' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:opacity-50 disabled:pointer-events-none';

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-foreground',
  muted: 'bg-black/3 dark:bg-white/5 hover:bg-black/7 dark:hover:bg-white/10 text-foreground',
  outline: 'border border-black/10 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.06] text-foreground',
};

export default function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={cx(base, sizes[size], variants[variant], className)} {...props} />;
}
