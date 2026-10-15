import React from 'react';

interface PageHeaderProps {
  title: string;
  accent?: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  accent,
  subtitle,
  badge,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60 mb-5">
      <div>
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            {badge}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {title}{' '}
          {accent && (
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
              {accent}
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
