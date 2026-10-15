import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  MdAccountBalance,
  MdPayments,
  MdAssignmentLate,
  MdPercent,
  MdLocationCity,
  MdFilterList,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
  MdPieChart,
  MdBarChart,
  MdTableRows,
  MdCategory,
} from 'react-icons/md';
import { Card, CardHeader } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge, TagBadge } from '../components/ui/Badge';
import { fetchOverview, fetchCredits } from '../lib/api';
import { fmt, fmtFCFA, fmtPct, statusColor, C, CHART_PALETTE } from '../lib/utils';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3.5 py-2.5 text-xs font-medium border border-slate-700">
      <p className="font-bold text-slate-200 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || C.indigo500 }} />
          <span>{p.name}:</span>
          <span className="font-mono-num font-bold text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export function DonneesPage() {
  const [overview, setOverview] = useState<any>(null);
  const [creditsData, setCreditsData] = useState<any>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  // Filters for credits table
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [filterAgence, setFilterAgence] = useState('ALL');
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOverview().then(setOverview).catch(console.error);
  }, []);

  useEffect(() => {
    setLoadingCredits(true);
    fetchCredits({
      page,
      pageSize,
      agence: filterAgence,
      statut: filterStatut,
      search: searchQuery,
    })
      .then(setCreditsData)
      .catch(console.error)
      .finally(() => setLoadingCredits(false));
  }, [page, pageSize, filterAgence, filterStatut, searchQuery]);

  if (!overview) return <Spinner message="Chargement des données du portefeuille crédit..." />;

  // Chart data preparations
  const statutChartData = [
    { name: 'Sain', value: overview.statut_counts.Sain, color: C.success },
    { name: 'Vigilance', value: overview.statut_counts.Vigilance, color: C.warning },
    { name: 'Défaut', value: overview.statut_counts.Défaut, color: C.danger },
  ];

  const agencesChartData = overview.agences.map((ag: any) => ({
    name: ag.agence,
    credits: ag.total_credits,
    solde: Math.round(ag.solde_restant / 1_000_000), // En millions FCFA
    taux_defaut: ag.taux_defaut,
  }));

  const secteursChartData = overview.secteurs.map((s: any) => ({
    name: s.secteur.length > 18 ? s.secteur.substring(0, 16) + '…' : s.secteur,
    complet: s.secteur,
    count: s.count,
    taux_defaut: s.taux_defaut,
  }));

  const retardOriginalData = Object.entries(overview.retard_distribution as Record<string, number>).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header */}
      <PageHeader
        title="Portefeuille de Crédits"
        accent="& Analyse du Risque"
        subtitle="Exploration analytique des crédits octroyés par les Caisses et Mutuelles d'Épargne et de Crédit (Sénégal)"
        badge="Dataset Actif · 15 188 Dossiers"
        action={
          <div className="flex items-center gap-2">
            <TagBadge icon={<MdLocationCity />}>{overview.agences.length} Réseaux & Agences</TagBadge>
            <TagBadge icon={<MdCategory />}>{overview.secteurs.length} Secteurs</TagBadge>
          </div>
        }
      />

      {/* ── KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Dossiers Crédit"
          value={fmt(overview.total_credits)}
          sub={`${overview.annee_min} – ${overview.annee_max} · ${fmt(overview.nb_membres_uniques)} membres`}
          icon={<MdAccountBalance />}
          iconColor={C.indigo600}
          iconBg={C.indigo50}
        />
        <KpiCard
          label="Capital Déboursé"
          value={fmt(Math.round(overview.total_debourse / 1_000_000)) + ' M FCFA'}
          sub={`Moyenne : ${fmt(overview.montant_moyen_debourse)} FCFA`}
          icon={<MdPayments />}
          iconColor="#0284C7"
          iconBg="#F0F9FF"
        />
        <KpiCard
          label="Encours Restant Dû"
          value={fmt(Math.round(overview.total_solde / 1_000_000)) + ' M FCFA'}
          sub={`Amortissement moyen : ${overview.taux_remboursement_moyen}%`}
          icon={<MdPercent />}
          iconColor={C.success}
          iconBg={C.successLight}
        />
        <KpiCard
          label="Taux de Défaut Global"
          value={`${overview.taux_defaut}%`}
          sub={`PAR 30 (Vigilance + Défaut) : ${overview.par_30}%`}
          icon={<MdAssignmentLate />}
          iconColor={C.danger}
          iconBg={C.dangerLight}
          badge={`${fmt(overview.statut_counts.Défaut)} contentieux`}
          badgeColor="rose"
        />
      </div>

      {/* ── Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Statut Distribution Chart */}
        <Card>
          <CardHeader
            title="Classification Réglementaire des Créances"
            subtitle="Répartition selon les 3 statuts prudentiels de risque"
            icon={<MdPieChart />}
            iconColor={C.indigo600}
            iconBg={C.indigo50}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Crédits Sains</span>
              <p className="text-lg font-black text-emerald-900 font-mono-num">{fmt(overview.statut_counts.Sain)}</p>
              <p className="text-[11px] text-emerald-700">{overview.taux_sain}% du portefeuille</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Vigilance (1-90j)</span>
              <p className="text-lg font-black text-amber-900 font-mono-num">{fmt(overview.statut_counts.Vigilance)}</p>
              <p className="text-[11px] text-amber-700">{overview.taux_vigilance}% du portefeuille</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 uppercase">Défaut (&gt;90j)</span>
              <p className="text-lg font-black text-rose-900 font-mono-num">{fmt(overview.statut_counts.Défaut)}</p>
              <p className="text-[11px] text-rose-700">{overview.taux_defaut}% du portefeuille</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={statutChartData} barSize={48} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statutChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Agency Breakdown */}
        <Card>
          <CardHeader
            title="Activité & Risque par Agence"
            subtitle="Nombre de crédits et taux de défaut par caisse"
            icon={<MdBarChart />}
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
          />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agencesChartData} layout="vertical" barSize={16} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="credits" name="Nombre de Crédits" fill="#4F46E5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sector breakdown */}
        <Card>
          <CardHeader
            title="Top Secteurs d'Activité Économique"
            subtitle="Distribution des prêts par domaine d'activité"
            icon={<MdCategory />}
            iconColor="#059669"
            iconBg="#ECFDF5"
          />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={secteursChartData} barSize={28} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Nombre de Crédits" fill="#0D9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Raw Delinquency Buckets from the Bank */}
        <Card>
          <CardHeader
            title="Analyse Détaillée des Tranches de Retard"
            subtitle="Décomposition selon les paliers de jours de retard de la banque"
            icon={<MdAssignmentLate />}
            iconColor="#D97706"
            iconBg="#FFFBEB"
          />
          <div className="space-y-3 pt-2">
            {retardOriginalData.map((item) => {
              const pct = (item.value / overview.total_credits) * 100;
              const isZero = item.name === '0 JOUR';
              const isLong = item.name.includes('181');
              const barColor = isZero ? '#059669' : isLong ? '#DC2626' : '#D97706';

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="text-slate-500 font-mono-num font-medium">
                      {fmt(item.value)} dossiers ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Interactive Credits Data Table */}
      <Card>
        <CardHeader
          title="Registre Individuel des Dossiers Crédit"
          subtitle="Recherche, filtrage et consultation des prêts du portefeuille"
          icon={<MdTableRows />}
          iconColor={C.indigo600}
          iconBg={C.indigo50}
          action={
            creditsData && (
              <span className="text-xs font-semibold text-slate-500">
                {fmt(creditsData.total_records)} résultats trouvés
              </span>
            )
          }
        />

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="relative sm:col-span-2">
            <MdSearch className="absolute left-3 top-3 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Rechercher par N° Crédit, Membre..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <select
              value={filterAgence}
              onChange={(e) => {
                setFilterAgence(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="ALL">Toutes les agences</option>
              {overview.agences.map((ag: any) => (
                <option key={ag.agence} value={ag.agence}>
                  {ag.agence}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatut}
              onChange={(e) => {
                setFilterStatut(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="Sain">Sain</option>
              <option value="Vigilance">Vigilance</option>
              <option value="Défaut">Défaut</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loadingCredits ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : creditsData?.data?.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Aucun dossier ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">N° Crédit</th>
                  <th className="py-3 px-3">Membre</th>
                  <th className="py-3 px-3">Agence</th>
                  <th className="py-3 px-3">Secteur</th>
                  <th className="py-3 px-3 text-right">Montant Déboursé</th>
                  <th className="py-3 px-3 text-right">Solde Restant</th>
                  <th className="py-3 px-3 text-center">Amorti %</th>
                  <th className="py-3 px-3">Retard Constaté</th>
                  <th className="py-3 px-3 text-center">Statut Risque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {creditsData?.data?.map((credit: any) => (
                  <tr key={credit.numero_credit} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono-num font-bold text-indigo-700">
                      #{credit.numero_credit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-num text-slate-500">
                      ID {credit.numero_membre}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900">{credit.agence}</span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[140px] truncate" title={credit.secteur_activite}>
                      {credit.secteur_activite}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num font-semibold">
                      {fmt(credit.montant_debourse)} F
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num text-slate-600">
                      {fmt(credit.solde_credit)} F
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono-num text-[11px] px-2 py-0.5 rounded bg-slate-100">
                        {Math.round(credit.taux_amortissement * 100)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {credit.retard_brut}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={credit.statut} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {creditsData && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Page <span className="font-bold text-slate-800">{creditsData.page}</span> sur{' '}
              <span className="font-bold text-slate-800">{creditsData.total_pages}</span>
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all"
              >
                <MdChevronLeft size={16} /> Précédent
              </button>
              <button
                disabled={page >= creditsData.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all"
              >
                Suivant <MdChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
