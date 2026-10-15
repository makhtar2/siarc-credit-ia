import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  MdTrackChanges,
  MdAutoGraph,
  MdDataset,
  MdGridOn,
  MdBarChart,
  MdAssessment,
  MdSecurity,
  MdCheckCircle,
} from 'react-icons/md';
import { Card, CardHeader } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/Badge';
import { fetchModelMetrics } from '../lib/api';
import { fmt, fmtDecimal } from '../lib/utils';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181B] text-white rounded-xl shadow-xl px-3.5 py-2 text-xs font-medium border border-slate-700">
      <p className="font-bold text-slate-200 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>Importance :</span>
          <span className="font-mono-num font-bold text-white">{(p.value * 100).toFixed(2)}%</span>
        </p>
      ))}
    </div>
  );
};

export function ModelePage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchModelMetrics().then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return <Spinner message="Évaluation des métriques du modèle de scoring..." />;

  const classes: string[] = metrics.classes;
  const matrix: number[][] = metrics.confusion_matrix;
  const maxMatrixVal = Math.max(...matrix.flat());

  const importanceData = [...metrics.feature_importances].reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Validation & Performance"
        accent="du Modèle ML"
        subtitle="Random Forest Classifier (180 estimateurs) avec pondération équilibrée des classes (Cost-Sensitive Learning)"
        badge="Évaluation Stratifiée"
      />

      {/* ── KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Accuracy Globale"
          value={`${(metrics.accuracy * 100).toFixed(1)}%`}
          sub="Précision d'attribution globale"
          icon={<MdTrackChanges />}
          iconColor="#18181B"
          iconBg="#F4F4F5"
          badge="Score Élevé"
          badgeColor="dark"
        />
        <KpiCard
          label="F1-Score Macro"
          value={fmtDecimal(metrics.f1_macro, 3)}
          sub="Moyenne non biaisée par les classes"
          icon={<MdAutoGraph />}
          iconColor="#18181B"
          iconBg="#F4F4F5"
          badge="Équilibré"
          badgeColor="dark"
        />
        <KpiCard
          label="Échantillon de Test"
          value={fmt(metrics.n_test)}
          sub="20% du jeu de données (stratifié)"
          icon={<MdDataset />}
          iconColor="#10B981"
          iconBg="#ECFDF5"
        />
        <KpiCard
          label="Base d'Entraînement"
          value={fmt(metrics.n_train)}
          sub="80% des dossiers réels"
          icon={<MdAssessment />}
          iconColor="#18181B"
          iconBg="#F4F4F5"
        />
      </div>

      {/* ── Core Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Confusion Matrix */}
        <Card>
          <CardHeader
            title="Matrice de Confusion (Échantillon Test)"
            subtitle="Confrontation des valeurs réelles vs prédictions du modèle"
            icon={<MdGridOn />}
            iconColor="#18181B"
            iconBg="#F4F4F5"
          />
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-center border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="text-left text-xs font-bold text-slate-400 p-2">
                    Réel \ Prédit
                  </th>
                  {classes.map((cls) => (
                    <th key={cls} className="text-xs font-bold text-slate-700 pb-2">
                      <StatusBadge status={cls} size="sm" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((actualClass, rowIdx) => {
                  const rowSum = matrix[rowIdx].reduce((a, b) => a + b, 0);

                  return (
                    <tr key={actualClass}>
                      <td className="text-left py-2 pr-3">
                        <StatusBadge status={actualClass} size="sm" />
                      </td>
                      {classes.map((predClass, colIdx) => {
                        const val = matrix[rowIdx][colIdx];
                        const isDiagonal = rowIdx === colIdx;
                        const pctOfRow = ((val / rowSum) * 100).toFixed(1);
                        const intensity = val / maxMatrixVal;

                        let cellBg = 'bg-white/60 text-slate-700 border border-slate-200/50';
                        if (isDiagonal) {
                          cellBg = intensity > 0.5 ? 'bg-[#18181B] text-white shadow-md' : 'bg-slate-200 text-slate-900 font-bold';
                        } else if (val > 25) {
                          cellBg = 'bg-rose-50 text-rose-800 font-medium border border-rose-200/80';
                        }

                        return (
                          <td
                            key={predClass}
                            className={`p-3 rounded-2xl transition-all duration-150 ${cellBg}`}
                          >
                            <span className="block text-sm font-mono-num font-black leading-tight">
                              {fmt(val)}
                            </span>
                            <span className={`text-[10px] block mt-0.5 opacity-80 ${isDiagonal && intensity > 0.5 ? 'text-slate-300' : 'text-slate-500'}`}>
                              {pctOfRow}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200/60 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#18181B] inline-block" />
              <span>Diagonale : Prédictions exactes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 inline-block" />
              <span>Hors diagonale : Erreurs d'affectation</span>
            </div>
          </div>
        </Card>

        {/* Feature Importance */}
        <Card>
          <CardHeader
            title="Importance des Variables Prédictives"
            subtitle="Contribution de chaque signal à la décision d'octroi (Gini Importance)"
            icon={<MdBarChart />}
            iconColor="#18181B"
            iconBg="#F4F4F5"
          />
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={importanceData}
              layout="vertical"
              barSize={13}
              margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#E4E4E7" strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 'auto']}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#A1A1AA' }}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={140}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#18181B' }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="importance" fill="#18181B" radius={[0, 6, 6, 0]}>
                {importanceData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.importance > 0.15 ? '#18181B' : entry.importance > 0.08 ? '#3F3F46' : '#A1A1AA'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Classification Report Table */}
      <Card>
        <CardHeader
          title="Rapport Détaillé de Classification"
          subtitle="Mesures de Précision, Rappel (Recall) et F1-Score par profil d'emprunteur"
          icon={<MdAssessment />}
          iconColor="#18181B"
          iconBg="#F4F4F5"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/40">
                <th className="py-3 px-4">Classe de Risque</th>
                <th className="py-3 px-4">Précision</th>
                <th className="py-3 px-4">Rappel (Recall)</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4 text-right">Support (Dossiers Test)</th>
                <th className="py-3 px-4 text-center">Score d'Efficacité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {metrics.report.map((item: any) => {
                const f1Pct = Math.round(item.f1 * 100);
                return (
                  <tr key={item.classe} className="hover:bg-white/80 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      <StatusBadge status={item.classe} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-slate-900">
                      {(item.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold text-slate-900">
                      {(item.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono-num font-black text-slate-900">
                      {fmtDecimal(item.f1, 3)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num text-slate-500 font-semibold">
                      {fmt(item.support)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center max-w-[120px] mx-auto">
                        <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#18181B]"
                            style={{ width: `${f1Pct}%` }}
                          />
                        </div>
                        <span className="font-mono-num text-[10px] text-slate-500 font-bold">{f1Pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Model Architecture & Academic Justification (Obsidian Card) */}
      <div className="glass-card-dark">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-white/10 text-white flex items-center justify-center text-lg shadow-inner">
            <MdSecurity />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Justification Méthodologique & Prudentielle (BCEAO)
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Conformité avec les normes d'audit et de gestion du risque de contrepartie
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 mt-4 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <MdCheckCircle className="text-emerald-400" /> Gestion du Déséquilibre
            </h4>
            <p>
              Les créances saines représentent 83.5% des données. L'application de <code className="text-white bg-white/15 px-1.5 py-0.5 rounded font-mono">class_weight='balanced'</code> pénalise fortement les erreurs sur les classes minoritaires (Défaut et Vigilance).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <MdCheckCircle className="text-emerald-400" /> Variables Déterminantes
            </h4>
            <p>
              L'ancienneté du dossier et le ratio de remboursement (<code className="text-white bg-white/15 px-1.5 py-0.5 rounded font-mono">Solde / Déboursé</code>) constituent plus de 55% du pouvoir discriminant global du modèle.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <MdCheckCircle className="text-emerald-400" /> Robustesse & Généralisation
            </h4>
            <p>
              La stratification lors du découpage 80/20 garantit que chaque pli conserve exactement les mêmes proportions de défaut que l'ensemble du portefeuille réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
