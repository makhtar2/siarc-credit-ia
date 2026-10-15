import React, { useEffect, useState } from 'react';
import {
  MdCalculate,
  MdLocationCity,
  MdCategory,
  MdPayments,
  MdAccountBalance,
  MdPerson,
  MdHistory,
  MdCalendarMonth,
  MdCheckCircle,
  MdWarningAmber,
  MdErrorOutline,
  MdTrendingUp,
  MdGavel,
  MdSecurity,
  MdLightbulb,
  MdArrowForward,
} from 'react-icons/md';
import { Card, CardHeader } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchOptions, predictCredit, PredictPayload } from '../lib/api';
import { fmt, fmtFCFA, statusColor } from '../lib/utils';

export function PredictionPage() {
  const [options, setOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<PredictPayload>({
    agence: 'CEC_B',
    secteur_activite: 'COMMERCE',
    type_groupe: 'Trésorerie',
    annee_ouverture: 2026,
    mois_ouverture: 6,
    age: 45,
    nb_credits_anterieurs: 3,
    montant_debourse: 1_000_000,
    solde_credit: 350_000,
  });

  useEffect(() => {
    fetchOptions()
      .then((opts) => {
        setOptions(opts);
        setFormData((prev) => ({
          ...prev,
          agence: opts.agences[0] || 'CEC_B',
          secteur_activite: opts.secteurs[0] || 'COMMERCE',
          type_groupe: opts.types_groupe[0] || 'Trésorerie',
        }));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictCredit(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutMontant = (val: number) => {
    setFormData((prev) => ({
      ...prev,
      montant_debourse: val,
      solde_credit: Math.min(prev.solde_credit, val),
    }));
  };

  if (!options) return <Spinner message="Initialisation du moteur de scoring..." />;

  const isPredictDone = result !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Simulateur d'Octroi"
        accent="& Scoring Crédit"
        subtitle="Aide à la décision en temps réel pour le comité d'engagement et de gestion du risque"
        badge="Scoring Temps Réel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Form Section (7/12 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Paramètres de la Demande"
              subtitle="Renseignez le profil sociodémographique et financier du sociétaire"
              icon={<MdCalculate />}
              iconColor="#18181B"
              iconBg="#F4F4F5"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Agence */}
                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <MdLocationCity className="text-slate-400" /> Agence / Caisse
                  </label>
                  <select
                    value={formData.agence}
                    onChange={(e) => setFormData({ ...formData, agence: e.target.value })}
                    className="custom-select"
                  >
                    {options.agences.map((ag: string) => (
                      <option key={ag} value={ag}>
                        {ag}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Secteur d'activité */}
                <div>
                  <label className="input-label flex items-center gap-1.5">
                    <MdCategory className="text-slate-400" /> Secteur d'Activité
                  </label>
                  <select
                    value={formData.secteur_activite}
                    onChange={(e) => setFormData({ ...formData, secteur_activite: e.target.value })}
                    className="custom-select"
                  >
                    {options.secteurs.map((sec: string) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type de produit */}
              <div>
                <label className="input-label flex items-center gap-1.5">
                  <MdPayments className="text-slate-400" /> Famille de Financement
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {options.types_groupe.map((tg: string) => {
                    const isSelected = formData.type_groupe === tg;
                    return (
                      <button
                        type="button"
                        key={tg}
                        onClick={() => setFormData({ ...formData, type_groupe: tg })}
                        className={`px-3 py-2 rounded-full text-xs font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#18181B] text-white border-black shadow-sm'
                            : 'bg-white/70 text-slate-700 border-slate-200 hover:bg-white'
                        }`}
                      >
                        {tg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdPayments className="text-slate-400" /> Montant Déboursé (FCFA)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={50000}
                    step={50000}
                    value={formData.montant_debourse}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        montant_debourse: Number(e.target.value),
                        solde_credit: Math.min(formData.solde_credit, Number(e.target.value)),
                      })
                    }
                    className="custom-input font-mono-num font-bold"
                  />
                  {/* Quick Shortcuts */}
                  <div className="flex gap-1.5 mt-2">
                    {[500_000, 1_000_000, 2_000_000, 5_000_000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleShortcutMontant(v)}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-[#18181B] hover:text-white text-slate-700 transition-colors cursor-pointer"
                      >
                        {v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1_000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdAccountBalance className="text-slate-400" /> Solde Restant Dû (FCFA)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-num font-normal">
                      {Math.round((formData.solde_credit / (formData.montant_debourse || 1)) * 100)}% restant
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={formData.montant_debourse}
                    step={25000}
                    value={formData.solde_credit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        solde_credit: Number(e.target.value),
                      })
                    }
                    className="custom-input font-mono-num font-bold"
                  />
                  <input
                    type="range"
                    min={0}
                    max={formData.montant_debourse}
                    step={25000}
                    value={formData.solde_credit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        solde_credit: Number(e.target.value),
                      })
                    }
                    className="w-full mt-2 accent-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Profil Emprunteur */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdPerson className="text-slate-400" /> Âge
                    </span>
                    <span className="font-mono-num text-slate-900 font-bold">{formData.age} ans</span>
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={75}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full accent-slate-900 mt-1 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdHistory className="text-slate-400" /> Crédits Antérieurs
                    </span>
                    <span className="font-mono-num text-slate-900 font-bold">{formData.nb_credits_anterieurs}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formData.nb_credits_anterieurs}
                    onChange={(e) =>
                      setFormData({ ...formData, nb_credits_anterieurs: Number(e.target.value) })
                    }
                    className="w-full accent-slate-900 mt-1 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="input-label flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdCalendarMonth className="text-slate-400" /> Mois d'Octroi
                    </span>
                    <span className="font-mono-num text-slate-900 font-bold">Mois {formData.mois_ouverture}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={formData.mois_ouverture}
                    onChange={(e) => setFormData({ ...formData, mois_ouverture: Number(e.target.value) })}
                    className="w-full accent-slate-900 mt-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill-dark w-full justify-center !py-3.5 text-xs uppercase tracking-wider"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <MdTrendingUp size={18} />
                      <span>Calculer le Score & Évaluer le Risque</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* ── Scoring Result Section (5/12 cols) */}
        <div className="lg:col-span-5">
          {!isPredictDone ? (
            <div className="glass-card-dashed h-full min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm text-slate-800 flex items-center justify-center text-2xl mb-3">
                <MdSecurity />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                En Attente d'Évaluation
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Renseignez les données du dossier ci-contre puis cliquez sur{' '}
                <strong className="text-slate-900">Calculer le Score</strong> pour générer l'avis officiel du comité.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Main Decision Banner (Matching Obsidian Style) */}
              <div className="glass-card-dark">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {result.prediction === 'Sain' && <MdCheckCircle className="text-2xl text-emerald-400" />}
                    {result.prediction === 'Vigilance' && <MdWarningAmber className="text-2xl text-amber-400" />}
                    {result.prediction === 'Défaut' && <MdErrorOutline className="text-2xl text-rose-400" />}
                    <h3 className="text-base font-black tracking-tight text-white">
                      {result.statut_label}
                    </h3>
                  </div>
                  <span
                    className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
                    style={{
                      backgroundColor: statusColor(result.prediction),
                      color: '#FFFFFF',
                    }}
                  >
                    Risque {result.niveau_risque}
                  </span>
                </div>

                {/* Score Circular Metric */}
                <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-sm flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Score de Solvabilité
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black font-mono-num text-slate-900">
                        {result.score_credit}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Indice de Confiance
                    </span>
                    <p className="text-lg font-black font-mono-num text-slate-900">
                      {(result.confiance * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                  <MdGavel className="text-base text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5 text-white">Avis du Comité d'Engagement :</span>
                    {result.recommandation}
                  </div>
                </div>
              </div>

              {/* Probabilities Distribution */}
              <Card>
                <CardHeader
                  title="Probabilités par Profil de Risque"
                  subtitle="Distribution bayésienne calculée sur l'ensemble des arbres"
                  icon={<MdTrendingUp />}
                  iconColor="#18181B"
                  iconBg="#F4F4F5"
                />

                <div className="space-y-3 pt-1">
                  {Object.entries(result.probabilites as Record<string, number>).map(
                    ([classe, proba]) => {
                      const color = statusColor(classe);
                      const pct = Math.round(proba * 100);

                      return (
                        <div key={classe} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{classe}</span>
                            <span className="font-mono-num font-bold" style={{ color }}>
                              {(proba * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </Card>

              {/* Explanatory Factors (Tiles Matching Mockup) */}
              {result.facteurs && result.facteurs.length > 0 && (
                <Card>
                  <CardHeader
                    title="Facteurs d'Explicabilité"
                    subtitle="Principaux signaux ayant guidé l'arbitrage"
                    icon={<MdLightbulb />}
                    iconColor="#18181B"
                    iconBg="#F4F4F5"
                  />

                  <div className="space-y-2">
                    {result.facteurs.map((f: any, idx: number) => {
                      const isPositive = f.impact === 'Positif';
                      const isNegative = f.impact === 'Négatif';

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 border border-slate-200/60 text-xs shadow-sm"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{f.facteur}</span>
                            <span className="text-slate-500 text-[11px] font-medium">{f.detail}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : isNegative
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {f.impact}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
