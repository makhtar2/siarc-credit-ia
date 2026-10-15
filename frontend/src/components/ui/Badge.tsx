import React from 'react';
import { MdCheckCircle, MdWarningAmber, MdErrorOutline } from 'react-icons/md';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = null;

  if (status === 'Sain') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    icon = <MdCheckCircle className="text-emerald-600" />;
  } else if (status === 'Vigilance') {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    icon = <MdWarningAmber className="text-amber-600" />;
  } else if (status === 'Défaut') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    icon = <MdErrorOutline className="text-rose-600" />;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} select-none whitespace-nowrap`}>
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
}

interface TagBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function TagBadge({ children, icon, className = '' }: TagBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-lg font-medium ${className}`}>
      {icon && <span className="text-slate-400">{icon}</span>}
      {children}
    </span>
  );
}
