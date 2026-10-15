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

      {/* Emblème Géométrique Moderne 'Wari' : Trame entrelacée stylisée */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5/6 h-5/6 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      >
        {/* Branche gauche W */}
        <path
          d="M6 9L11 23L14.5 14L11 9H6Z"
          fill="url(#wariGrad1)"
        />
        {/* Branche droite W */}
        <path
          d="M26 9L21 23L17.5 14L21 9H26Z"
          fill="url(#wariGrad2)"
        />
        {/* Nœud central / Losange protecteur de crédit */}
        <path
          d="M16 11.5L19 19L16 24L13 19L16 11.5Z"
          fill="#FFFFFF"
          opacity="0.95"
        />
        {/* Pastille émeraude de solvabilité bancaire */}
        <circle cx="16" cy="7" r="2.2" fill="#10B981" />

        <defs>
          <linearGradient id="wariGrad1" x1="6" y1="9" x2="14.5" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A1A1AA" />
            <stop offset="1" stopColor="#52525B" />
          </linearGradient>
          <linearGradient id="wariGrad2" x1="26" y1="9" x2="17.5" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E4E4E7" />
            <stop offset="1" stopColor="#71717A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function LogoBrand({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} />
      <div className="flex flex-col">
        <span className="text-base font-black tracking-tight text-slate-900 leading-none flex items-center gap-1">
          Wari<span className="text-slate-500 font-semibold tracking-normal">Score</span>
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          SFD · Sénégal
        </span>
      </div>
    </div>
  );
}
