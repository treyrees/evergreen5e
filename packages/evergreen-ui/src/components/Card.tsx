import { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Enable hover lift effect */
  hover?: boolean;
}

/**
 * Card container with consistent styling.
 * Used for form sections, result panels, and content grouping.
 */
export function Card({ children, className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'card-hover-lift' : '';

  return (
    <div
      className={`bg-slate-800 rounded-lg p-5 border border-slate-700 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card header with section title styling.
 */
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <h2
      className={`text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 ${className}`}
    >
      {children}
    </h2>
  );
}
