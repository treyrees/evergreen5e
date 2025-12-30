import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  /** Badge color variant */
  variant?: 'default' | 'violet' | 'emerald' | 'amber' | 'sky' | 'slate';
  /** Badge size */
  size?: 'xs' | 'sm';
  /** Tooltip text */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Small badge for labels and indicators.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'xs',
  title,
  className = '',
}: BadgeProps) {
  const sizeClasses = size === 'xs' ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1';

  const variantClasses = {
    default: 'bg-slate-700 text-slate-300',
    violet: 'bg-violet-900/50 text-violet-300',
    emerald: 'bg-emerald-900/50 text-emerald-300',
    amber: 'bg-amber-900/50 text-amber-300',
    sky: 'bg-sky-900/50 text-sky-300',
    slate: 'bg-slate-700/50 text-slate-400',
  };

  return (
    <span title={title} className={`${sizeClasses} ${variantClasses[variant]} rounded ${className}`}>
      {children}
    </span>
  );
}

export interface AttunementBadgeProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pre-styled badge for attunement indicator.
 */
export function AttunementBadge({ className = '' }: AttunementBadgeProps) {
  return (
    <Badge variant="violet" title="Requires Attunement" className={className}>
      A
    </Badge>
  );
}
