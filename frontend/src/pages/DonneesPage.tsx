import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  MdAccountBalance,
  MdPayments,
  MdAssignmentLate,
  MdPercent,
  MdLocationCity,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
  MdBarChart,
  MdTableRows,
  MdCategory,
  MdShowChart,
  MdDownload,
  MdRefresh,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { Card, CardHeader } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge, TagBadge } from '../components/ui/Badge';
import { fetchOverview, fetchCredits } from '../lib/api';
import { fmt, statusColor, C } from '../lib/utils';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181B] text-white rounded-xl shadow-xl px-3.5 py-2 text-xs font-medium border border-slate-700">
      <p className="font-bold text-slate-200 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#FFFFFF' }} />
          <span>{p.name}:</span>
          <span className="font-mono-num font-bold text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

interface DonneesPageProps {
  initialAgence?: string;
  initialStatut?: string;
}

export function DonneesPage({ initialAgence, initialStatut }: DonneesPageProps = {}) {
  const [overview, setOverview] = useState<any>(null);
  const [creditsData, setCreditsData] = useState<any>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  // Filters for credits table
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [filterAgence, setFilterAgence] = useState(initialAgence || 'ALL');
  const [filterStatut, setFilterStatut] = useState(initialStatut || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialAgence) setFilterAgence(initialAgence);
    if (initialStatut) setFilterStatut(initialStatut);
  }, [initialAgence, initialStatut]);

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

  const handleExportCSV = () => {
    if (!creditsData?.data?.length) return;
    const headers = [
      'N° Crédit',
      'N° Membre',
      'Agence',
      'Secteur Activité',
      'Montant Déboursé (FCFA)',
      'Solde Crédit (FCFA)',
      'Taux Amortissement (%)',
      'Retard',
      'Statut Risque',
    ];
    const rows = creditsData.data.map((c: any) => [
      c.numero_credit,
      c.numero_membre,
      `"${c.agence}"`,
      `"${c.secteur_activite}"`,
      c.montant_debourse,
      c.solde_credit,
      Math.round(c.taux_amortissement * 100),
      `"${c.retard_brut}"`,
      c.statut,
    ]);
    const csvContent = [headers.join(';'), ...rows.map((r: any) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WariScore_Credits_${filterAgence}_${filterStatut}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setFilterAgence('ALL');
    setFilterStatut('ALL');
    setSearchQuery('');
    setPage(1);
  };

  if (!overview) return <Spinner message="Chargement du registre de crédit..." />;

  // Chart data preparations
  const statutChartData = [
    { name: 'Sain', value: overview.statut_counts.Sain, color: '#10B981' },
    { name: 'Vigilance', value: overview.statut_counts.Vigilance, color: '#F59E0B' },
    { name: 'Défaut', value: overview.statut_counts.Défaut, color: '#EF4444' },
  ];

  const agencesChartData = overview.agences.map((ag: any) => ({
    name: ag.agence,
    credits: ag.total_credits,
    solde: Math.round(ag.solde_restant / 1_000_000),
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
        accent="& Analyse Détaillée"
        subtitle="Exploration analytique des crédits octroyés par les Caisses et Mutuelles d'Épargne et de Crédit (Sénégal)"
        badge="15 188 Dossiers Réels"
        action={
          <div className="flex items-center gap-2">
            <TagBadge icon={<MdLocationCity />}>{overview.agences.length} Réseaux</TagBadge>
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
          iconColor="#18181B"
          iconBg="#F4F4F5"
        />
        <KpiCard
          label="Capital Déboursé"
          value={fmt(Math.round(overview.total_debourse / 1_000_000)) + ' M FCFA'}
          sub={`Moyenne : ${fmt(overview.montant_moyen_debourse)} FCFA`}
          icon={<MdPayments />}
          iconColor="#18181B"
          iconBg="#F4F4F5"
        />
        <KpiCard
          label="Encours Restant Dû"
          value={fmt(Math.round(overview.total_solde / 1_000_000)) + ' M FCFA'}
          sub={`Amortissement moyen : ${overview.taux_remboursement_moyen}%`}
          icon={<MdPercent />}
          iconColor="#10B981"
          iconBg="#ECFDF5"
        />
        <KpiCard
          label="Taux de Défaut Global"
          value={`${overview.taux_defaut}%`}
          sub={`PAR 30 (Vigilance + Défaut) : ${overview.par_30}%`}
          icon={<MdAssignmentLate />}
          iconColor="#EF4444"
          iconBg="#FEF2F2"
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
            subtitle="Répartition selon les 3 statuts prudentiels de risque (BCEAO)"
            icon={<MdShowChart />}
            iconColor="#18181B"
            iconBg="#F4F4F5"
          />
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Sains</span>
              <p className="text-base font-black text-slate-900 font-mono-num mt-0.5">{fmt(overview.statut_counts.Sain)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{overview.taux_sain}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Vigilance</span>
              <p className="text-base font-black text-slate-900 font-mono-num mt-0.5">{fmt(overview.statut_counts.Vigilance)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{overview.taux_vigilance}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Défaut</span>
              <p className="text-base font-black text-slate-900 font-mono-num mt-0.5">{fmt(overview.statut_counts.Défaut)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{overview.taux_defaut}%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statutChartData} barSize={44} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E4E4E7" strokeDasharray="3 3" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#71717A' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
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
            subtitle="Volume des dossiers gérés par caisse d'épargne et de crédit"
            icon={<MdLocationCity />}
            iconColor="#18181B"
            iconBg="#F4F4F5"
          />
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={agencesChartData} layout="vertical" barSize={14} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#E4E4E7" strokeDasharray="3 3" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#18181B' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="credits" name="Dossiers de Crédit" fill="#18181B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sector breakdown */}
        <Card>
          <CardHeader
            title="Distribution par Secteur Économique"
            subtitle="Nombre de crédits déboursés selon l'activité"
            icon={<MdCategory />}
            iconColor="#18181B"
            iconBg="#F4F4F5"
          />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={secteursChartData} barSize={24} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
              <CartesianGrid vertical={false} stroke="#E4E4E7" strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717A' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Nombre de Prêts" fill="#3F3F46" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Raw Delinquency Buckets from the Bank */}
        <Card>
          <CardHeader
            title="Paliers de Jours de Retard"
            subtitle="Décomposition selon les tranches de maturité de l'institution"
            icon={<MdAssignmentLate />}
            iconColor="#18181B"
            iconBg="#F4F4F5"
          />
          <div className="space-y-3 pt-1">
            {retardOriginalData.map((item) => {
              const pct = (item.value / overview.total_credits) * 100;
              const isZero = item.name === '0 JOUR';
              const isLong = item.name.includes('181');
              const barColor = isZero ? '#10B981' : isLong ? '#EF4444' : '#F59E0B';

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-slate-500 font-mono-num font-semibold">
                      {fmt(item.value)} dossiers ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
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
          title="Registre des Dossiers Crédit"
          subtitle="Recherche instantanée et filtrage des opérations de prêt"
          icon={<MdTableRows />}
          iconColor="#18181B"
          iconBg="#F4F4F5"
          action={
            <div className="flex items-center gap-2">
              {creditsData && (
                <span className="text-xs font-bold text-slate-700 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                  {fmt(creditsData.total_records)} résultats
                </span>
              )}
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn-pill-dark !py-1 !px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90"
                title="Exporter les crédits filtrés en fichier CSV"
              >
                <MdDownload size={14} />
                <span>Exporter CSV</span>
              </button>
            </div>
          }
        />

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 p-3 bg-white/60 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3.5 top-3 text-slate-400 text-base" />
              <input
                type="text"
                placeholder="Rechercher N° Crédit, Membre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
              />
            </div>

            <div className="custom-select-wrapper">
              <select
                value={filterAgence}
                onChange={(e) => {
                  setFilterAgence(e.target.value);
                  setPage(1);
                }}
                className="custom-select"
              >
                <option value="ALL">Toutes les agences</option>
                {overview.agences.map((ag: any) => (
                  <option key={ag.agence} value={ag.agence}>
                    {ag.agence === 'CEC/PLATEAU'
                      ? 'CEC Plateau'
                      : ag.agence === 'CEC_B'
                      ? 'CEC Banlieue'
                      : ag.agence === 'MECYD'
                      ? 'MECYD Yoff'
                      : ag.agence === 'MECREST'
                      ? 'MECREST Thiès'
                      : ag.agence === 'MECZOR'
                      ? 'MECZOR Ziguinchor'
                      : ag.agence}
                  </option>
                ))}
              </select>
              <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>

            <div className="custom-select-wrapper">
              <select
                value={filterStatut}
                onChange={(e) => {
                  setFilterStatut(e.target.value);
                  setPage(1);
                }}
                className="custom-select"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="Sain">Sain</option>
                <option value="Vigilance">Vigilance</option>
                <option value="Défaut">Défaut</option>
              </select>
              <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
          </div>

          {(filterAgence !== 'ALL' || filterStatut !== 'ALL' || searchQuery !== '') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-600 hover:text-black flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex-shrink-0"
              title="Réinitialiser tous les filtres"
            >
              <MdRefresh size={15} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        {/* Table Content */}
        {loadingCredits ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : creditsData?.data?.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            Aucun dossier ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/40">
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
                  <tr key={credit.numero_credit} className="hover:bg-white/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono-num font-bold text-slate-900">
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
                      <span className="font-mono-num text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-bold">
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
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500 font-medium">
              Page <span className="font-bold text-slate-900">{creditsData.page}</span> sur{' '}
              <span className="font-bold text-slate-900">{creditsData.total_pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-xs shadow-sm transition-all"
              >
                <MdChevronLeft size={16} /> Précédent
              </button>
              <button
                disabled={page >= creditsData.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 rounded-full bg-[#18181B] text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-xs shadow-sm transition-all"
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
