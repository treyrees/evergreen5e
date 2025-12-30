import { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Icon or emoji to display */
  icon?: ReactNode;
  /** Main message */
  title: string;
  /** Description text */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Empty state placeholder for when no content is available.
 */
export function EmptyState({
  icon = '⚔️',
  title,
  description,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center z-10 ${className}`}
    >
      <div className="text-center px-8 py-12">
        <div className="text-4xl mb-4 opacity-30">{icon}</div>
        <div className="text-lg font-medium text-slate-400 mb-2">{title}</div>
        {description && (
          <div className="text-sm text-slate-500">{description}</div>
        )}
      </div>
    </div>
  );
}
