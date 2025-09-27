interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'avatar' | 'card' | 'button';
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', variant = 'default', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variantClasses = {
    default: 'h-4 w-full',
    text: 'h-4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full rounded-lg',
    button: 'h-10 w-24 rounded-lg'
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Preset skeleton components for common patterns
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '75%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <Skeleton variant="button" className={className} />;
}

export function SkeletonAvatar({ className = '' }: { className?: string }) {
  return <Skeleton variant="avatar" className={className} />;
}