"use client";
import React from 'react';

interface LoaderProps {
  label?: string;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Simple tailwind-based animated spinner with optional accessible text
export const Loader: React.FC<LoaderProps> = ({ label = 'Loading', inline = false, size = 'md', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-10 w-10 border-[3px]' : 'h-6 w-6 border-2';
  const content = (
    <div className={`flex items-center ${inline ? '' : 'justify-center'} gap-3 ${className}`}>      
      <div className={`animate-spin rounded-full border-current border-t-transparent ${sizeClasses}`} aria-hidden="true" />
      {label && <span className="text-sm text-foreground/70" aria-live="polite">{label}…</span>}
    </div>
  );
  if (inline) return content;
  return <div className="py-8" role="status" aria-label={label}>{content}</div>;
};

export const InlineLoader: React.FC<LoaderProps> = (props) => <Loader inline size={props.size || 'sm'} {...props} />;

export default Loader;