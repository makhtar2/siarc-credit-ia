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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 mb-6">
      <div>
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {badge}
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {title} {accent && <span className="text-slate-500 font-semibold">{accent}</span>}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
