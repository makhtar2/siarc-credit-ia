import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  MdShare,
  MdMoreHoriz,
  MdDownload,
  MdCheckCircle,
  MdWarningAmber,
  MdErrorOutline,
  MdNotificationsNone,
  MdAdd,
  MdEdit,
  MdCheck,
  MdTrendingUp,
  MdShowChart,
  MdArrowForward,
  MdAccountBalance,
} from 'react-icons/md';
import { fmt, fmtFCFA, C } from '../lib/utils';

interface DashboardOverviewProps {
  overview: any;
  onNavigate: (tabId: string) => void;
}

const WEEKLY_DATA = [
  { name: 'M', debourse: 42, amorti: 32 },
  { name: 'T', debourse: 65, amorti: 48 },
  { name: 'W', debourse: 58, amorti: 45 },
  { name: 'T', debourse: 72, amorti: 56 },
  { name: 'F', debourse: 85, amorti: 68 },
  { name: 'S', debourse: 98, amorti: 78 },
  { name: 'S', debourse: 74, amorti: 62 },
];

export function DashboardOverview({ overview, onNavigate }: DashboardOverviewProps) {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Taux de recouvrement > 80%', detail: 'Réalisé à 83.5%', done: true },
    { id: 2, title: 'Seuil PAR 30 sous les 10%', detail: 'Actuel: 16.5% (Vigilance)', done: false },
    { id: 3, title: 'Provisionnement créances douteuses', detail: 'Conforme BCEAO', done: true },
    { id: 4, title: 'Audit des crédits commerciaux', detail: 'En cours de revue', done: false },
  ]);

  const toggleGoal = (id: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  };

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── ROW 1: 3 Core Hero Cards (Matching Image Exactly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* 1. Overall Information (Dark Obsidian Card) */}
        <div className="lg:col-span-4 glass-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Overall Information
              </h3>
              <div className="flex items-center gap-2 text-slate-400">
                <button className="hover:text-white transition-colors cursor-pointer">
                  <MdShare size={16} />
                </button>
                <button className="hover:text-white transition-colors cursor-pointer">
                  <MdMoreHoriz size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-6 mb-6">
              <div>
                <span className="text-3xl font-black font-mono-num text-white tracking-tight">
                  {fmt(overview.total_credits)}
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Dossiers de crédit au total
                </p>
              </div>

              <div>
                <span className="text-3xl font-black font-mono-num text-white tracking-tight">
                  {fmt(overview.statut_counts.Défaut)}
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Dossiers en contentieux
                </p>
              </div>
            </div>
          </div>

          {/* 3 Embedded White Pills */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {/* Sain */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-base font-black font-mono-num leading-tight">
                {fmt(overview.statut_counts.Sain)}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                Sains
              </span>
            </div>

            {/* Vigilance */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-base font-black font-mono-num leading-tight">
                {fmt(overview.statut_counts.Vigilance)}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                Vigilance
              </span>
            </div>

            {/* Défaut */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center mb-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <span className="text-base font-black font-mono-num leading-tight">
                {fmt(overview.statut_counts.Défaut)}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                Défaut
              </span>
            </div>
          </div>
        </div>

        {/* 2. Weekly progress (Smooth Monochromatic Area Chart) */}
        <div className="lg:col-span-4 glass-card-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Weekly progress
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-900" /> Déboursé
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Amorti
                </span>
              </div>
            </div>

            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-sm">
              +24%
            </span>
          </div>

          <div className="h-40 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientBlack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#71717A' }}
                />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg border border-slate-700">
                        Flux : {payload[0].value}M FCFA
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="debourse"
                  stroke="#18181B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradientBlack)"
                />
                <Area
                  type="monotone"
                  dataKey="amorti"
                  stroke="#A1A1AA"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Month progress (Concentric Radial Rings & Download) */}
        <div className="lg:col-span-4 glass-card-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Month progress
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                +20% compared to last month*
              </p>
            </div>
            <MdShowChart className="text-slate-500 text-lg" />
          </div>

          {/* Concentric Circle Simulation */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                <span>Sain ({overview.taux_sain}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Vigilance ({overview.taux_vigilance}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Défaut ({overview.taux_defaut}%)</span>
              </div>
            </div>

            {/* Visual Circular Gauge with concentric rings */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Outer Track & Ring (Sain 83.5%) */}
                <circle cx="50" cy="50" r="42" stroke="#E4E4E7" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="#18181B" strokeWidth="6" fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * overview.taux_sain) / 100}
                  strokeLinecap="round"
                />
                {/* Middle Ring (Vigilance) */}
                <circle cx="50" cy="50" r="32" stroke="#F4F4F5" strokeWidth="5" fill="transparent" />
                <circle
                  cx="50" cy="50" r="32"
                  stroke="#A1A1AA" strokeWidth="5" fill="transparent"
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * (overview.taux_vigilance * 5)) / 100}
                  strokeLinecap="round"
                />
                {/* Inner Ring (Défaut) */}
                <circle cx="50" cy="50" r="23" stroke="#F4F4F5" strokeWidth="4.5" fill="transparent" />
                <circle
                  cx="50" cy="50" r="23"
                  stroke="#EF4444" strokeWidth="4.5" fill="transparent"
                  strokeDasharray="144"
                  strokeDashoffset={144 - (144 * (overview.taux_defaut * 3)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black font-mono-num text-slate-900 leading-none">
                  {overview.taux_sain}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Sain</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button className="circle-btn !w-9 !h-9 text-slate-700">
              <MdShare size={15} />
            </button>
            <a
              href="/RAPPORT_EXAMEN_CREDIT.md"
              target="_blank"
              rel="noreferrer"
              className="btn-pill-white flex-1 justify-center !py-2 text-slate-800"
            >
              <MdDownload size={15} />
              <span>Download Report</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Month goals + Task in process + Dashed Add Task */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* 1. Month goals (Checklist card) */}
        <div className="md:col-span-4 glass-card-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Month goals:
                </h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {doneCount}/{goals.length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <MdEdit size={15} />
              </button>
            </div>

            <div className="space-y-2.5">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-all ${
                      g.done
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {g.done && <MdCheck size={12} />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${g.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {g.title}
                    </p>
                    <span className="text-[10px] text-slate-400">{g.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2 & 3. Task in process (2) (Two Clean Tiles) */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1 */}
          <div className="glass-card-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                🎁
              </span>
              <MdMoreHoriz size={18} />
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                Dossier #22847 (MECYD)
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                Commerce · 700 000 FCFA
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              <span>Échéance Aujourd'hui</span>
              <button className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <MdNotificationsNone size={13} />
              </button>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="glass-card-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                🏥
              </span>
              <MdMoreHoriz size={18} />
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                Dossier #42001 (CEC Banlieue)
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                Consommation · 1 300 000 FCFA
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              <span>02.09.2026</span>
              <MdNotificationsNone size={15} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* 4. Dashed "+ Add task" / "+ Simuler un Prêt" */}
        <div
          onClick={() => onNavigate('prediction')}
          className="md:col-span-3 glass-card-dashed group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-600 mb-2 shadow-inner">
            <MdAdd size={22} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
            + Simuler un Prêt
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Évaluer le risque en 1 clic
          </span>
        </div>
      </div>

      {/* ── ROW 3: Last Projects (Recent Loans & Projects Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold tracking-tight text-slate-900">
            Derniers Financements & Projets
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="cursor-pointer hover:text-slate-900">Trier par date ▾</span>
            <button
              onClick={() => onNavigate('donnees')}
              className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              Voir tous les dossiers <MdArrowForward size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Project 1 */}
          <div className="glass-card-dark flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white tracking-tight">
                Crédit Trésorerie AFSSEF
              </h4>
              <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-[10px] font-mono-num font-bold">
                80%
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Membre #2521 · CEC Plateau</span>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between font-mono-num">
              <span>Capital : 700 000 FCFA</span>
              <span className="text-emerald-400 font-bold">Crédit Sain</span>
            </div>
          </div>

          {/* Project 2 */}
          <div className="glass-card-dark flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white tracking-tight">
                Crédit Équipement DER/PAM
              </h4>
              <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-[10px] font-mono-num font-bold">
                50%
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Membre #3776 · MECYD</span>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between font-mono-num">
              <span>Capital : 2 000 000 FCFA</span>
              <span className="text-amber-400 font-bold">Vigilance</span>
            </div>
          </div>

          {/* Project 3 */}
          <div className="glass-card-dark flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white tracking-tight">
                Micro-Entrepreneurs Yeumbeul
              </h4>
              <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-[10px] font-mono-num font-bold">
                100%
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Membre #9049 · MECREST</span>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between font-mono-num">
              <span>Capital : 1 300 000 FCFA</span>
              <span className="text-emerald-400 font-bold">Clôturé Sain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
