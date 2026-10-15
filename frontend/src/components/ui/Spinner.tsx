import React from 'react';

export function Spinner({ message = "Chargement des données en cours..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-center">
      <div className="w-10 h-10 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
        {message}
      </p>
    </div>
  );
}
