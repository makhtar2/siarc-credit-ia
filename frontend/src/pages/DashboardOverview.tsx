import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  MdShare,
  MdMoreHoriz,
  MdDownload,
  MdNotificationsNone,
  MdAdd,
  MdEdit,
  MdCheck,
  MdShowChart,
  MdArrowForward,
} from 'react-icons/md';
import { fmt } from '../lib/utils';

interface DashboardOverviewProps {
  overview: any;
  onNavigate: (tabId: string) => void;
}

const DONNEES_HEBDOMADAIRES = [
  { name: 'L', debourse: 42, amorti: 32 },
  { name: 'M', debourse: 65, amorti: 48 },
  { name: 'M', debourse: 58, amorti: 45 },
  { name: 'J', debourse: 72, amorti: 56 },
  { name: 'V', debourse: 85, amorti: 68 },
  { name: 'S', debourse: 98, amorti: 78 },
  { name: 'D', debourse: 74, amorti: 62 },
];

export function DashboardOverview({ overview, onNavigate }: DashboardOverviewProps) {
  const [objectifs, setObjectifs] = useState([
    { id: 1, titre: 'Taux de recouvrement > 80%', detail: 'Réalisé à 83.5%', valide: true },
    { id: 2, titre: 'Seuil PAR 30 sous les 10%', detail: 'Actuel: 16.5% (Vigilance)', valide: false },
    { id: 3, titre: 'Provisionnement des créances douteuses', detail: 'Conforme BCEAO', valide: true },
    { id: 4, titre: 'Audit des crédits commerciaux', detail: 'En cours de revue', valide: false },
  ]);

  const toggleObjectif = (id: number) => {
    setObjectifs((prev) =>
      prev.map((o) => (o.id === id ? { ...o, valide: !o.valide } : o))
    );
  };

  const nombreValides = objectifs.filter((o) => o.valide).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── LIGNE 1 : 3 Cartes Principales (Style Liquid Glass & Obsidian) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* 1. Vue d'ensemble du Portefeuille (Carte Sombre Obsidian) */}
        <div className="lg:col-span-4 glass-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Vue d'Ensemble du Portefeuille
              </h3>
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={() => onNavigate('portefeuille')}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Voir le registre complet"
                >
                  <MdShare size={16} />
                </button>
                <button
                  onClick={() => onNavigate('modele')}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Voir les métriques du modèle"
                >
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

          {/* 3 Cartes Pilules Blanches en Relief */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {/* Sains */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-base font-black font-mono-num leading-tight">
                {fmt(overview.statut_counts.Sain)}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
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
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
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
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                Contentieux
              </span>
            </div>
          </div>
        </div>

        {/* 2. Flux Hebdomadaires (Courbe Spline Monomatière) */}
        <div className="lg:col-span-4 glass-card-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Flux Hebdomadaires
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
              <AreaChart data={DONNEES_HEBDOMADAIRES} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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

        {/* 3. Qualité Prudentielle & PAR (Jauge Concentrique & Téléchargement) */}
        <div className="lg:col-span-4 glass-card-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Qualité du Portefeuille & PAR
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Conforme aux exigences réglementaires BCEAO
              </p>
            </div>
            <MdShowChart className="text-slate-500 text-lg" />
          </div>

          {/* Anneaux Concentriques */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                <span>Sains ({overview.taux_sain}%)</span>
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

            {/* Jauge Circulaire */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Anneau Extérieur (Sain 83.5%) */}
                <circle cx="50" cy="50" r="42" stroke="#E4E4E7" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="#18181B" strokeWidth="6" fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * overview.taux_sain) / 100}
                  strokeLinecap="round"
                />
                {/* Anneau Médian (Vigilance) */}
                <circle cx="50" cy="50" r="32" stroke="#F4F4F5" strokeWidth="5" fill="transparent" />
                <circle
                  cx="50" cy="50" r="32"
                  stroke="#A1A1AA" strokeWidth="5" fill="transparent"
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * (overview.taux_vigilance * 5)) / 100}
                  strokeLinecap="round"
                />
                {/* Anneau Intérieur (Défaut) */}
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
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Sains</span>
              </div>
            </div>
          </div>

          {/* Ligne d'action */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('portefeuille')}
              className="circle-btn !w-9 !h-9 text-slate-700"
              title="Consulter les détails du portefeuille"
            >
              <MdShare size={15} />
            </button>
            <a
              href="/RAPPORT_EXAMEN_CREDIT.md"
              target="_blank"
              rel="noreferrer"
              className="btn-pill-white flex-1 justify-center !py-2 text-slate-800"
            >
              <MdDownload size={15} />
              <span>Télécharger le Rapport</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── LIGNE 2 : Objectifs Réglementaires + Dossiers sous surveillance + Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* 1. Objectifs Réglementaires */}
        <div className="md:col-span-4 glass-card-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Objectifs Réglementaires :
                </h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {nombreValides}/{objectifs.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate('portefeuille')}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Modifier les critères d'évaluation"
              >
                <MdEdit size={15} />
              </button>
            </div>

            <div className="space-y-2.5">
              {objectifs.map((o) => (
                <div
                  key={o.id}
                  onClick={() => toggleObjectif(o.id)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-all ${
                      o.valide
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {o.valide && <MdCheck size={12} />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${o.valide ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {o.titre}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">{o.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2 & 3. Dossiers en Surveillance (2 tuiles d'alerte) */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tuile 1 */}
          <div className="glass-card-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono-num">
                #22
              </span>
              <button
                onClick={() => onNavigate('portefeuille')}
                className="hover:text-slate-800 cursor-pointer"
              >
                <MdMoreHoriz size={18} />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                Dossier #22847 (MECYD)
              </h4>
              <p className="text-[11px] text-slate-500 truncate font-medium">
                Commerce · 700 000 FCFA
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              <span>Échéance du Jour</span>
              <button
                onClick={() => onNavigate('simulateur')}
                className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm hover:bg-black transition-colors"
                title="Évaluer ce dossier"
              >
                <MdNotificationsNone size={13} />
              </button>
            </div>
          </div>

          {/* Tuile 2 */}
          <div className="glass-card-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono-num">
                #42
              </span>
              <button
                onClick={() => onNavigate('portefeuille')}
                className="hover:text-slate-800 cursor-pointer"
              >
                <MdMoreHoriz size={18} />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                Dossier #42001 (CEC Banlieue)
              </h4>
              <p className="text-[11px] text-slate-500 truncate font-medium">
                Consommation · 1 300 000 FCFA
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              <span>Échéance : 02.09.2026</span>
              <MdNotificationsNone size={15} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* 4. Action Rapide de Simulation */}
        <div
          onClick={() => onNavigate('simulateur')}
          className="md:col-span-3 glass-card-dashed group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-600 mb-2 shadow-inner">
            <MdAdd size={22} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
            + Simuler un Prêt
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Évaluer le risque en temps réel
          </span>
        </div>
      </div>

      {/* ── LIGNE 3 : Derniers Financements Octroyés */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold tracking-tight text-slate-900">
            Derniers Financements Octroyés
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="cursor-pointer hover:text-slate-900">Trier par date ▾</span>
            <button
              onClick={() => onNavigate('portefeuille')}
              className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              Voir l'ensemble du registre <MdArrowForward size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Prêt 1 */}
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
              <span>Sociétaire #2521 · CEC Plateau</span>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between font-mono-num">
              <span>Capital : 700 000 FCFA</span>
              <span className="text-emerald-400 font-bold">Crédit Sain</span>
            </div>
          </div>

          {/* Prêt 2 */}
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
              <span>Sociétaire #3776 · MECYD</span>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between font-mono-num">
              <span>Capital : 2 000 000 FCFA</span>
              <span className="text-amber-400 font-bold">Vigilance</span>
            </div>
          </div>

          {/* Prêt 3 */}
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
              <span>Sociétaire #9049 · MECREST</span>
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
