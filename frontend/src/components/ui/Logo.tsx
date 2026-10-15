import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function LogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dim = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div
      className={`${dim} rounded-2xl bg-[#18181B] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(24,24,27,0.25)] relative overflow-hidden flex-shrink-0 group ${className}`}
    >
      {/* Reflet subtil de verre liquide */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none" />

      {/* Emblème Géométrique Moderne 'SIARC' : Réseau de neurones & Bouclier Prudentiel */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5/6 h-5/6 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      >
        {/* Lignes de connexion neuronales */}
        <line x1="8" y1="10" x2="16" y2="6" stroke="#52525B" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="24" y1="10" x2="16" y2="6" stroke="#52525B" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="8" y1="10" x2="16" y2="16" stroke="#71717A" strokeWidth="1.5" />
        <line x1="24" y1="10" x2="16" y2="16" stroke="#71717A" strokeWidth="1.5" />
        <line x1="16" y1="16" x2="10" y2="24" stroke="#A1A1AA" strokeWidth="1.5" />
        <line x1="16" y1="16" x2="22" y2="24" stroke="#A1A1AA" strokeWidth="1.5" />
        <line x1="10" y1="24" x2="16" y2="27" stroke="#E4E4E7" strokeWidth="1.5" />
        <line x1="22" y1="24" x2="16" y2="27" stroke="#E4E4E7" strokeWidth="1.5" />

        {/* Nœuds décisionnels périphériques */}
        <circle cx="8" cy="10" r="2.2" fill="#71717A" />
        <circle cx="24" cy="10" r="2.2" fill="#71717A" />
        <circle cx="10" cy="24" r="2.2" fill="#A1A1AA" />
        <circle cx="22" cy="24" r="2.2" fill="#A1A1AA" />

        {/* Nœud sommital d'inférence */}
        <circle cx="16" cy="6" r="2.5" fill="#FFFFFF" />

        {/* Nœud Central / Cœur d'arbitrage IA (Émeraude Solvabilité) */}
        <circle cx="16" cy="16" r="4.2" fill="#10B981" />
        <circle cx="16" cy="16" r="2" fill="#FFFFFF" />

        {/* Ancrage institutionnel inférieur */}
        <circle cx="16" cy="27" r="1.8" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function LogoBrand({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} />
      <div className="flex flex-col min-w-0 text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-base font-black tracking-tight text-slate-900">
            SIARC
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#18181B] text-emerald-400 tracking-wider font-mono uppercase shadow-xs">
            IA
          </span>
        </div>
        <span
          className="text-[9px] font-bold text-slate-400 tracking-tight mt-1 truncate max-w-[150px]"
          title="Système d'Intelligence Artificielle pour l'Évaluation des Risques de Crédit"
        >
          Évaluation Risque Crédit
        </span>
      </div>
    </div>
  );
}
