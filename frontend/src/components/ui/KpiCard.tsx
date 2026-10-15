import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'dark';
}

export function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg = '#F4F4F5',
  iconColor = '#18181B',
  badge,
  badgeColor = 'dark',
}: KpiCardProps) {
  const badgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dark: 'bg-[#18181B] text-white border-black/20',
  }[badgeColor];

  return (
    <div className="glass-card-white hoverable flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-sm"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl md:text-2xl font-black text-slate-900 font-mono-num tracking-tight">
          {value}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {sub && (
        <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
          {sub}
        </p>
      )}
    </div>
  );
}
