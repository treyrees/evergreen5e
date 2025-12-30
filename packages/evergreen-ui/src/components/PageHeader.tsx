import { ReactNode } from 'react';

export interface NavLink {
  /** Link text */
  label: string;
  /** Link URL */
  href: string;
}

export interface PageHeaderProps {
  /** Main title */
  title: string;
  /** Optional badge/indicator next to title */
  badge?: ReactNode;
  /** Navigation links on the right */
  navLinks?: NavLink[];
  /** Link component to use (for Next.js Link compatibility) */
  LinkComponent?: React.ComponentType<{ href: string; className?: string; children: ReactNode }>;
}

/**
 * Page header with title and navigation links.
 */
export function PageHeader({
  title,
  badge,
  navLinks = [],
  LinkComponent = 'a' as unknown as React.ComponentType<{ href: string; className?: string; children: ReactNode }>,
}: PageHeaderProps) {
  const Link = LinkComponent;

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {badge}
      </div>
      {navLinks.length > 0 && (
        <div className="flex gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export interface PrivacyBadgeProps {
  /** Text to display */
  text?: string;
  /** Icon/emoji to show */
  icon?: string;
}

/**
 * Privacy indicator badge (e.g., "No AI Queries").
 */
export function PrivacyBadge({
  text = 'No AI Queries',
  icon = '🔒',
}: PrivacyBadgeProps) {
  return (
    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded">
      <span>{icon}</span> {text}
    </span>
  );
}
