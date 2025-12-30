import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text displayed next to the checkbox */
  label?: ReactNode;
  /** Use warning/amber styling for the checkbox */
  warning?: boolean;
}

/**
 * Checkbox with optional label.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', warning = false, ...props }, ref) => {
    const checkboxColor = warning
      ? 'text-amber-500'
      : 'text-emerald-600';

    if (!label) {
      return (
        <input
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 ${checkboxColor} rounded border-slate-600 bg-slate-900 focus:ring-emerald-500 ${className}`}
          {...props}
        />
      );
    }

    return (
      <label className="flex items-center cursor-pointer group">
        <input
          ref={ref}
          type="checkbox"
          className={`mr-2.5 h-4 w-4 ${checkboxColor} rounded border-slate-600 bg-slate-900 focus:ring-emerald-500`}
          {...props}
        />
        <span
          className={`text-sm text-slate-400 group-hover:text-slate-300 transition-colors ${className}`}
        >
          {label}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface SometimesToggleProps {
  /** Whether the toggle is checked */
  checked: boolean;
  /** Called when toggle changes */
  onChange: (checked: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Small "Sometimes" toggle used for partial bonuses (×0.5 multiplier).
 */
export function SometimesToggle({
  checked,
  onChange,
  className = '',
}: SometimesToggleProps) {
  return (
    <label
      className={`flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 text-amber-500 rounded border-slate-600 bg-slate-900"
      />
      <span className={checked ? 'text-amber-400' : ''}>Sometimes</span>
    </label>
  );
}
