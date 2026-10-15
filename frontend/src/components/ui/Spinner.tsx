import React from 'react';

export function Spinner({ message = "Chargement des données en cours..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-center">
      <div className="w-9 h-9 border-3 border-slate-200 border-t-black rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
        {message}
      </p>
    </div>
  );
}
