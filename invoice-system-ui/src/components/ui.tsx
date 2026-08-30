import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-navy-600 text-white hover:bg-navy-700 active:bg-navy-800 shadow-sm disabled:bg-navy-300',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-ink',
  outline: 'border border-line2 bg-white text-ink hover:bg-canvas hover:border-navy-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  subtle: 'bg-navy-50 text-navy-700 hover:bg-navy-100',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
  lg: 'text-sm px-5 py-2.5 gap-2 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface FieldProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      {label && <label className="label-base">{label}</label>}
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-kufi text-xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
