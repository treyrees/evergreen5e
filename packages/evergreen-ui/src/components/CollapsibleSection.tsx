'use client';

import { ReactNode, useState } from 'react';

export interface CollapsibleSectionProps {
  /** Section title */
  title: ReactNode;
  /** Optional subtitle text */
  subtitle?: string;
  /** Section content */
  children: ReactNode;
  /** Initial expanded state */
  defaultExpanded?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Collapsible section with button toggle (for primary sections).
 */
export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  className = '',
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`bg-slate-800 rounded-lg border border-slate-700 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
      >
        <div>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            {title}
          </span>
          {subtitle && (
            <span className="ml-2 text-xs text-slate-500">{subtitle}</span>
          )}
        </div>
        <span className="text-slate-500 text-lg">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

export interface DetailsBoxProps {
  /** Summary/title text */
  summary: ReactNode;
  /** Content revealed when expanded */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Details box using native HTML details/summary (for nested sections).
 */
export function DetailsBox({
  summary,
  children,
  className = '',
}: DetailsBoxProps) {
  return (
    <details
      className={`bg-slate-700/30 border border-slate-600 rounded-md font-sans ${className}`}
    >
      <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-300 hover:bg-slate-700/50 rounded-md select-none">
        {summary}
      </summary>
      <div className="px-3 pb-3 pt-2 border-t border-slate-600">{children}</div>
    </details>
  );
}
