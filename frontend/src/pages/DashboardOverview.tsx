import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import {
  MdShare,
  MdDownload,
  MdCheckCircle,
  MdWarningAmber,
  MdErrorOutline,
  MdAdd,
  MdShowChart,
  MdArrowForward,
  MdFilterList,
  MdSecurity,
  MdAssessment,
  MdAccountBalance,
  MdCalculate,
} from 'react-icons/md';
import { fmt, fmtFCFA } from '../lib/utils';
import { fetchOverview } from '../lib/api';

interface DashboardOverviewProps {
  overview: any;
  selectedAgence?: string;
  onAgenceChange?: (agence: string) => void;
  onNavigate: (tabId: string, prefill?: any) => void;
}

export function DashboardOverview({
  overview: initialOverview,
  selectedAgence: parentSelectedAgence,
  onAgenceChange,
  onNavigate,
}: DashboardOverviewProps) {
  const [data, setData] = useState<any>(initialOverview);
  const [selectedAgence, setSelectedAgence] = useState<string>(parentSelectedAgence || 'ALL');
  const [fluxMode, setFluxMode] = useState<'mensuel' | 'annuel'>('mensuel');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(initialOverview);
  }, [initialOverview]);

  useEffect(() => {
    if (parentSelectedAgence && parentSelectedAgence !== selectedAgence) {
      handleAgenceChange(parentSelectedAgence);
    }
  }, [parentSelectedAgence]);

  const handleAgenceChange = async (ag: string) => {
    setSelectedAgence(ag);
    if (onAgenceChange) onAgenceChange(ag);
    setLoading(true);
    try {
      const updated = await fetchOverview(ag);
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAuditReport = () => {
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const nomCaisse = selectedAgence === 'ALL' ? 'Toutes Caisses Réunies' : selectedAgence;
    const contenu = `# RAPPORT D'AUDIT PRUDENTIEL DU RISQUE DE CRÉDIT - BCEAO
**Plateforme :** WariScore · Microfinance Sénégal
**Périmètre audité :** ${nomCaisse}
**Date d'émission :** ${dateStr}
**Norme réglementaire de référence :** Instructions BCEAO relatives à la classification des créances et au provisionnement des SFD

---

## 1. SYNTHÈSE DU PORTEFEUILLE SOUS GESTION
- **Volume Total Déboursé :** ${Math.round(data.total_debourse).toLocaleString('fr-FR')} FCFA
- **Encours Restant Dû :** ${Math.round(data.total_solde).toLocaleString('fr-FR')} FCFA
- **Nombre Total de Dossiers de Prêt :** ${data.total_credits.toLocaleString('fr-FR')} dossiers
- **Taux d'Amortissement Moyen du Capital :** ${data.taux_remboursement_moyen}%
- **Portefeuille à Risque (PAR 30) :** ${data.par_30}% (Seuil prudentiel BCEAO fixé à 5.0%)
- **Taux de Défaut Avéré (> 90 jours) :** ${data.taux_defaut}% (${data.statut_counts?.Défaut || 0} dossiers)
- **Crédits Sains :** ${data.statut_counts?.Sain || 0} dossiers (${data.taux_sain}%)
- **Crédits en Vigilance (1-90j) :** ${data.statut_counts?.Vigilance || 0} dossiers (${data.taux_vigilance}%)

---

## 2. PROVISIONS RÉGLEMENTAIRES OBLIGATOIRES (BCEAO)
- **Dotations Globales aux Provisions Requises :** ${Math.round(data.provisions_bceao).toLocaleString('fr-FR')} FCFA
- **Barème Prudentiel Appliqué :**
  * Retard 1 à 30 jours : 5% de provision
  * Retard 31 à 90 jours : 20% de provision
  * Retard 91 à 180 jours : 50% de provision
  * Retard > 180 jours (Créances irrécouvrables) : 100% de dépréciation
- **Statut Prudentiel :** Dotation obligatoire à inscrire au compte d'exploitation de la caisse.

---

## 3. DOSSIERS EN SOUFFRANCE PRIORITAIRES (CONTENTIEUX IMMÉDIAT)
${(data.dossiers_prioritaires || [])
  .map(
    (d: any, i: number) =>
      `${i + 1}. Crédit N°${d.numero_credit} | Agence : ${d.agence} | Solde Restant : ${Math.round(d.solde_credit).toLocaleString('fr-FR')} FCFA | Retard : ${d.retard} | Secteur : ${d.secteur} (${d.type_groupe})`
  )
  .join('\n')}

---
*Rapport certifié généré par la plateforme WariScore · Audit & Gestion du Risque de Crédit.*
`;
    const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Audit_BCEAO_${selectedAgence}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!data) return null;

  const chartData = fluxMode === 'mensuel' ? data.flux_mensuels : data.flux_annuels;
  const xKey = fluxMode === 'mensuel' ? 'mois' : 'annee';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── BARRE DE CONTRÔLE OPÉRATIONNELLE DU DASHBOARD ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#18181B] text-white flex items-center justify-center text-sm shadow-sm">
            <MdFilterList />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Périmètre d'Analyse
            </span>
            <span className="text-xs font-black text-slate-900">
              {selectedAgence === 'ALL' ? 'Portefeuille Global (5 Caisses Réunies)' : `Caisse locale : ${selectedAgence}`}
            </span>
          </div>
        </div>

        {/* Sélecteur de Caisses / Agences Interactif */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => handleAgenceChange('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedAgence === 'ALL'
                ? 'bg-[#18181B] text-white shadow-sm'
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-black border border-slate-200/60'
            }`}
          >
            Toutes les Caisses
          </button>
          {data.agences?.map((ag: any) => (
            <button
              key={ag.agence}
              onClick={() => handleAgenceChange(ag.agence)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedAgence === ag.agence
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-black border border-slate-200/60'
              }`}
            >
              {ag.agence}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIGNE 1 : 3 CARTES MAÎTRESSES LIQUID GLASS & OBSIDIAN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* 1. Carte Sombre Obsidian : Portefeuille sous gestion */}
        <div className="lg:col-span-4 glass-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Portefeuille Sous Gestion
                </h3>
              </div>
              <button
                onClick={() => onNavigate('portefeuille', { filterAgence: selectedAgence })}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                title="Consulter le registre filtré sur cette sélection"
              >
                <span>Détails</span>
                <MdArrowForward size={14} />
              </button>
            </div>

            <div className="flex items-baseline gap-6 mb-5">
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono-num text-white tracking-tight">
                  {fmt(Math.round(data.total_solde / 1_000_000))} M
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Encours Restant Dû (FCFA)
                </p>
              </div>

              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono-num text-slate-300 tracking-tight">
                  {fmt(data.total_credits)}
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Prêts Actifs Réels
                </p>
              </div>
            </div>
          </div>

          {/* 3 Cartes Pilules Blanches en Relief avec Volumétrie Réelle */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
            {/* Sains */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center justify-between">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-sm font-black font-mono-num leading-tight">
                {fmt(data.statut_counts?.Sain || 0)}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                {data.taux_sain}% Sains
              </span>
            </div>

            {/* Vigilance */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center justify-between">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-sm font-black font-mono-num leading-tight">
                {fmt(data.statut_counts?.Vigilance || 0)}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                {data.taux_vigilance}% Vig.
              </span>
            </div>

            {/* Contentieux */}
            <div className="bg-white rounded-2xl p-2.5 text-center text-slate-900 shadow-sm flex flex-col items-center justify-between">
              <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              </div>
              <span className="text-sm font-black font-mono-num leading-tight text-rose-700">
                {fmt(data.statut_counts?.Défaut || 0)}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                {data.taux_defaut}% Défaut
              </span>
            </div>
          </div>
        </div>

        {/* 2. Flux Financiers Réels Déboursé vs Amorti (Graphique Interactif) */}
        <div className="lg:col-span-4 glass-card-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Flux de Financement Réels
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" /> Déboursé
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Amorti
                </span>
              </div>
            </div>

            {/* Toggle Mois / Année */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                onClick={() => setFluxMode('mensuel')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  fluxMode === 'mensuel' ? 'bg-white text-black shadow-sm' : 'text-slate-500'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setFluxMode('annuel')}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  fluxMode === 'annuel' ? 'bg-white text-black shadow-sm' : 'text-slate-500'
                }`}
              >
                Année
              </button>
            </div>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="fluxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181B" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#18181B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey={xKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#71717A' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#A1A1AA' }}
                  tickFormatter={(v) => `${v}M`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#18181B] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl border border-slate-700">
                        <p className="font-bold text-white mb-1">
                          {fluxMode === 'mensuel' ? `Mois : ${d.mois}` : `Année : ${d.annee}`}
                        </p>
                        <p className="text-slate-300">Déboursé : {d.debourse} M FCFA</p>
                        <p className="text-slate-400">Solde restant : {d.solde} M FCFA</p>
                        <p className="text-slate-400">Dossiers : {d.credits} crédits</p>
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
                  fill="url(#fluxGradient)"
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

        {/* 3. Qualité Prudentielle & Provisions BCEAO */}
        <div className="lg:col-span-4 glass-card-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Portefeuille à Risque (PAR)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Normes prudentielles UEMOA / BCEAO
              </p>
            </div>
            <MdSecurity className="text-slate-700 text-lg" />
          </div>

          {/* Anneaux Concentriques & Provisions */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
                <span>Sains ({data.taux_sain}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>PAR 30-90j ({data.taux_vigilance}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Défaut &gt;90j ({data.taux_defaut}%)</span>
              </div>
            </div>

            {/* Jauge Circulaire */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Anneau Sain */}
                <circle cx="50" cy="50" r="42" stroke="#E4E4E7" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="#18181B" strokeWidth="6" fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * data.taux_sain) / 100}
                  strokeLinecap="round"
                />
                {/* Anneau Vigilance */}
                <circle cx="50" cy="50" r="32" stroke="#F4F4F5" strokeWidth="5" fill="transparent" />
                <circle
                  cx="50" cy="50" r="32"
                  stroke="#F59E0B" strokeWidth="5" fill="transparent"
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * Math.min(100, data.taux_vigilance * 5)) / 100}
                  strokeLinecap="round"
                />
                {/* Anneau Défaut */}
                <circle cx="50" cy="50" r="23" stroke="#F4F4F5" strokeWidth="4.5" fill="transparent" />
                <circle
                  cx="50" cy="50" r="23"
                  stroke="#EF4444" strokeWidth="4.5" fill="transparent"
                  strokeDasharray="144"
                  strokeDashoffset={144 - (144 * Math.min(100, data.taux_defaut * 3)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black font-mono-num text-slate-900 leading-none">
                  {data.par_30}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">PAR 30</span>
              </div>
            </div>
          </div>

          {/* Provisions Requises & Téléchargement */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Provisions Requises</span>
              <span className="text-xs font-black font-mono-num text-rose-700">
                {fmt(Math.round(data.provisions_bceao / 1_000_000))} M FCFA
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadAuditReport}
              className="btn-pill-white !py-1.5 !px-3 text-xs cursor-pointer shadow-sm hover:shadow transition-all"
              title="Télécharger l'audit prudentiel complet en Markdown"
            >
              <MdDownload size={14} />
              <span>Rapport d'Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── LIGNE 2 : OBJECTIFS PRUDENTIELS + TOP CRÉANCES EN CONTENTIEUX REELLES ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* 1. Objectifs Prudentiels & Indicateurs BCEAO */}
        <div className="md:col-span-5 glass-card-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MdAssessment className="text-slate-800 text-lg" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Ratios Prudentiels BCEAO
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono-num">
                {data.annee_max}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {/* Ratio 1 : Amortissement */}
              <div className="p-3 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Taux d'Amortissement du Capital</span>
                  <span className="text-[10px] text-slate-500 font-medium">Part de capital déjà recouvrée</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono-num text-emerald-700 block">
                    {data.taux_remboursement_moyen}%
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 uppercase">Solvable</span>
                </div>
              </div>

              {/* Ratio 2 : Ratio NPL (PAR 30) */}
              <div className="p-3 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Portefeuille à Risque (PAR 30)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Seuil d'alerte réglementaire &lt; 5%</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono-num text-amber-700 block">
                    {data.par_30}%
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 uppercase">Sous Surveillance</span>
                </div>
              </div>

              {/* Ratio 3 : Encours sous risque critique */}
              <div className="p-3 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Encours en Défaut (&gt;90 jours)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Capital en risque de perte avérée</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono-num text-rose-700 block">
                    {fmt(Math.round(data.encours_defaut / 1_000_000))} M FCFA
                  </span>
                  <span className="text-[9px] font-bold text-rose-800 uppercase">{data.statut_counts?.Défaut} crédits</span>
                </div>
              </div>

              {/* Ratio 4 : Ticket moyen */}
              <div className="p-3 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Montant Moyen Déboursé</span>
                  <span className="text-[10px] text-slate-500 font-medium">Moyenne par dossier financé</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono-num text-slate-900 block">
                    {fmt(data.montant_moyen_debourse)} F
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Microfinance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Créances en Contentieux Réelles (Action Immédiate de Recouvrement) */}
        <div className="md:col-span-7 glass-card-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Dossiers Prioritaires à Recouvrer
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Plus fortes expositions en souffrance extraites du dataset
                </p>
              </div>
              <button
                onClick={() => onNavigate('portefeuille', { filterStatut: 'Défaut', filterAgence: selectedAgence })}
                className="text-xs font-bold text-slate-900 hover:text-black flex items-center gap-1 cursor-pointer"
                title="Afficher les dossiers au contentieux dans le portefeuille"
              >
                Voir registre <MdArrowForward size={14} />
              </button>
            </div>

            {/* Grille des plus grandes défaillances réelles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.dossiers_prioritaires?.slice(0, 4).map((dossier: any) => (
                <div
                  key={dossier.numero_credit}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-mono-num text-[11px] font-bold border border-rose-200/80">
                      #{dossier.numero_credit}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {dossier.agence}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-black text-slate-900 font-mono-num block">
                      {fmt(dossier.solde_credit)} FCFA
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block mt-0.5 font-medium">
                      {dossier.secteur} · {dossier.type_groupe}
                    </span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-rose-600 font-bold">{dossier.retard}</span>
                    <button
                      onClick={() => onNavigate('simulateur', dossier)}
                      className="text-slate-900 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      title="Pré-remplir le simulateur avec ce dossier"
                    >
                      <span>Auditer</span>
                      <MdArrowForward size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bannière Action Simulation */}
          <div
            onClick={() => onNavigate('simulateur')}
            className="mt-4 p-3 rounded-2xl bg-[#18181B] text-white flex items-center justify-between cursor-pointer hover:bg-black transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                <MdCalculate />
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight">Simulateur d'Octroi en Temps Réel</span>
                <span className="text-[10px] text-slate-400">Calculer le score de solvabilité pour un nouveau sociétaire</span>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-black shadow-sm">
              Ouvrir
            </span>
          </div>
        </div>
      </div>

      {/* ── LIGNE 3 : PERFORMANCE COMPARATIVE DES CAISSES (RÉSEAU SÉNÉGAL) ── */}
      <div className="glass-card-white">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Benchmark Régional des Caisses & Mutuelles
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Comparatif du volume d'octroi, des encours restants et du taux de défaut
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700">
            5 Caisses Répertoriées
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {data.agences?.map((ag: any) => (
            <div
              key={ag.agence}
              onClick={() => handleAgenceChange(ag.agence)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedAgence === ag.agence
                  ? 'bg-[#18181B] text-white border-black shadow-md'
                  : 'bg-white/70 hover:bg-white text-slate-900 border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-black ${selectedAgence === ag.agence ? 'text-white' : 'text-slate-900'}`}>
                  {ag.agence}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ag.taux_defaut > 15
                    ? 'bg-rose-100 text-rose-800'
                    : ag.taux_defaut > 8
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {ag.taux_defaut}% déf.
                </span>
              </div>

              <div>
                <span className="text-base font-black font-mono-num block">
                  {fmt(Math.round(ag.montant_debourse / 1_000_000))} M
                </span>
                <span className={`text-[10px] font-medium block ${selectedAgence === ag.agence ? 'text-slate-400' : 'text-slate-500'}`}>
                  {fmt(ag.total_credits)} dossiers financés
                </span>
              </div>

              <div className={`mt-2 pt-2 border-t text-[10px] flex justify-between font-mono-num ${
                selectedAgence === ag.agence ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span>Solde :</span>
                <span className="font-bold">{fmt(Math.round(ag.solde_restant / 1_000_000))} M F</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
