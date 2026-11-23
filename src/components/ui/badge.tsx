import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-primary-container text-surface-container-high border-transparent',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    outline: 'bg-transparent text-on-surface-variant border-outline-variant',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-full font-semibold border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase().replace(/\s+/g, '_');

  switch (norm) {
    case 'AVAILABLE':
    case 'CONFIRMED':
    case 'PAID':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'SETTLED':
      return <Badge variant="success">{status.replace('_', ' ')}</Badge>;
    case 'RENTED':
    case 'PICKED_UP':
    case 'PARTIALLY_PAID':
    case 'OFFER_RECEIVED':
    case 'OFFER_ACCEPTED':
    case 'HELD':
      return <Badge variant="info">{status.replace('_', ' ')}</Badge>;
    case 'MAINTENANCE':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
    case 'PARTNER_LOAN':
    case 'PENDING':
    case 'UNPAID':
      return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
    case 'OVERDUE':
    case 'CANCELLED':
    case 'FORFEITED':
    case 'INACTIVE':
      return <Badge variant="error">{status.replace('_', ' ')}</Badge>;
    default:
      return <Badge variant="outline">{status.replace('_', ' ')}</Badge>;
  }
}
