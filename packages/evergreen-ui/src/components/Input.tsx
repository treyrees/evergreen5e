import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Text input with consistent styling.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', size = 'md', ...props }, ref) => {
    const sizeClasses =
      size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5';

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full ${sizeClasses} border border-slate-600 rounded-md bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
