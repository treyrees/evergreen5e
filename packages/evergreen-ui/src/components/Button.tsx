import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Enable glow effect on hover */
  glow?: 'emerald' | 'blue' | false;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component with consistent styling.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-md transition-all';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  };

  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30',
    secondary: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
    ghost: 'text-slate-500 hover:text-slate-300 hover:bg-slate-800',
    outline: 'border border-dashed border-slate-600 text-slate-500 hover:border-emerald-500 hover:text-emerald-400',
  };

  const glowClasses = glow ? `btn-glow-${glow}` : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${glowClasses} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface ButtonGroupProps<T extends string | number> {
  /** Currently selected value */
  value: T;
  /** Available options */
  options: T[];
  /** Called when selection changes */
  onChange: (value: T) => void;
  /** Format option for display (default: adds + prefix for numbers) */
  formatOption?: (option: T) => string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Size of the buttons */
  size?: 'sm' | 'md';
}

/**
 * Button group for selecting from discrete options (e.g., +0/+1/+2/+3).
 */
export function ButtonGroup<T extends string | number>({
  value,
  options,
  onChange,
  formatOption,
  className = '',
  size = 'md',
}: ButtonGroupProps<T>) {
  const defaultFormat = (opt: T) =>
    typeof opt === 'number' ? `+${opt}` : String(opt);
  const format = formatOption || defaultFormat;

  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';

  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={String(option)}
          onClick={() => onChange(option)}
          className={`${sizeClasses} rounded-md font-medium transition-all ${
            value === option
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {format(option)}
        </button>
      ))}
    </div>
  );
}
