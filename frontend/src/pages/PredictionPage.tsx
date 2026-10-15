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
  MdKeyboardArrowDown,
  MdDownload,
  MdRefresh,
} from 'react-icons/md';
import { Card, CardHeader } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchOptions, predictCredit, PredictPayload } from '../lib/api';
import { fmt, fmtFCFA, statusColor, formatAgence } from '../lib/utils';

interface PredictionPageProps {
  initialDossier?: any;
  onClearPrefill?: () => void;
}

export function PredictionPage({ initialDossier, onClearPrefill }: PredictionPageProps = {}) {
  const [options, setOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [importedCredit, setImportedCredit] = useState<any>(initialDossier || null);

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
        if (!initialDossier) {
          const initData: PredictPayload = {
            agence: opts.agences[0] || 'CEC_B',
            secteur_activite: opts.secteurs[0] || 'COMMERCE',
            type_groupe: opts.types_groupe[0] || 'Trésorerie',
            annee_ouverture: 2026,
            mois_ouverture: 6,
            age: 45,
            nb_credits_anterieurs: 3,
            montant_debourse: 1_000_000,
            solde_credit: 350_000,
          };
          setFormData(initData);
          setLoading(true);
          predictCredit(initData)
            .then(setResult)
            .catch(console.error)
            .finally(() => setLoading(false));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (initialDossier) {
      setImportedCredit(initialDossier);
      const prefilled: PredictPayload = {
        agence: initialDossier.agence || 'CEC_B',
        secteur_activite: initialDossier.secteur || 'COMMERCE',
        type_groupe: initialDossier.type_groupe || 'Trésorerie',
        annee_ouverture: initialDossier.annee || 2026,
        mois_ouverture: initialDossier.mois || 6,
        age: initialDossier.age || 45,
        nb_credits_anterieurs: initialDossier.nb_credits_anterieurs || 0,
        montant_debourse: initialDossier.montant_debourse || Math.max(initialDossier.solde_credit * 1.25, 500000),
        solde_credit: initialDossier.solde_credit || 350000,
      };
      setFormData(prefilled);
      // Auto-trigger scoring for imported dossier
      setLoading(true);
      predictCredit(prefilled)
        .then(setResult)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [initialDossier]);

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

  const handleResetSimulation = () => {
    setImportedCredit(null);
    if (onClearPrefill) onClearPrefill();
    if (options) {
      const resetData: PredictPayload = {
        agence: options.agences[0] || 'CEC_B',
        secteur_activite: options.secteurs[0] || 'COMMERCE',
        type_groupe: options.types_groupe[0] || 'Trésorerie',
        annee_ouverture: 2026,
        mois_ouverture: 6,
        age: 45,
        nb_credits_anterieurs: 3,
        montant_debourse: 1_000_000,
        solde_credit: 350_000,
      };
      setFormData(resetData);
      setLoading(true);
      predictCredit(resetData)
        .then(setResult)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  const handleExportAvis = () => {
    if (!result) return;
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const contenu = `# FICHE DÉCISIONNELLE D'OCTROI DE CRÉDIT - COMITÉ D'ENGAGEMENT
**Plateforme :** WariScore · Notation & Prévention du Risque de Contrepartie
**Date d'évaluation :** ${dateStr}

---

## 1. CARACTÉRISTIQUES DE LA DEMANDE
- **Agence / Caisse :** ${formData.agence}
- **Secteur d'Activité :** ${formData.secteur_activite}
- **Famille de Crédit :** ${formData.type_groupe}
- **Montant Déboursé :** ${formData.montant_debourse.toLocaleString('fr-FR')} FCFA
- **Solde Restant Dû :** ${formData.solde_credit.toLocaleString('fr-FR')} FCFA (${Math.round(
      (formData.solde_credit / (formData.montant_debourse || 1)) * 100
    )}% d'encours)
- **Âge de l'Emprunteur :** ${formData.age} ans
- **Nombre de Crédits Antérieurs :** ${formData.nb_credits_anterieurs}

---

## 2. ARBITRAGE DU MODÈLE DE SCORING ML (RANDOM FOREST)
- **Statut Prédit :** ${result.statut_label} (Risque ${result.niveau_risque})
- **Score de Solvabilité :** ${result.score_credit} / 100
- **Indice de Confiance de la Prédiction :** ${(result.confiance * 100).toFixed(1)}%
- **Distribution des Probabilités :**
${Object.entries(result.probabilites || {})
  .map(([c, p]: any) => `  * ${c} : ${(p * 100).toFixed(1)}%`)
  .join('\n')}

---

## 3. AVIS OFFICIEL DU COMITÉ D'ENGAGEMENT
> ${result.recommandation}

---

## 4. FACTEURS CLÉS D'EXPLICABILITÉ
${(result.facteurs || []).map((f: any) => `- [${f.impact}] ${f.facteur} : ${f.detail}`).join('\n')}

---
*Document certifié conforme aux normes prudentielles de la BCEAO · WariScore SFD Sénégal.*
`;
    const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Avis_Comite_Credit_${formData.agence}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSimulation}
              className="btn-pill-white text-xs cursor-pointer shadow-sm hover:shadow transition-all"
              title="Réinitialiser les paramètres du dossier"
            >
              <MdRefresh size={15} />
              <span>Réinitialiser</span>
            </button>
            {result && (
              <button
                type="button"
                onClick={handleExportAvis}
                className="btn-pill-dark text-xs cursor-pointer shadow-sm hover:shadow transition-all"
                title="Télécharger l'avis officiel du comité en Markdown"
              >
                <MdDownload size={15} />
                <span>Exporter l'Avis</span>
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Form Section (7/12 cols) */}
        <div className="lg:col-span-7">
          {importedCredit && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#18181B] text-white flex items-center justify-between text-xs shadow-md border border-slate-700 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <div>
                  <span className="font-bold block">
                    Dossier importé depuis le Cockpit : Crédit #{importedCredit.numero_credit} ({importedCredit.agence})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Solde en souffrance : {fmt(importedCredit.solde_credit)} FCFA · {importedCredit.retard}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
          )}

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
                <div className="min-w-0">
                  <label className="input-label">
                    <MdLocationCity className="text-slate-400" /> Agence / Caisse
                  </label>
                  <div className="custom-select-wrapper">
                    <select
                      value={formData.agence}
                      onChange={(e) => setFormData({ ...formData, agence: e.target.value })}
                      className="custom-select"
                      title={formData.agence}
                    >
                      {options.agences.map((ag: string) => (
                        <option key={ag} value={ag}>
                          {formatAgence(ag)}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  </div>
                </div>

                {/* Secteur d'activité */}
                <div className="min-w-0">
                  <label className="input-label">
                    <MdCategory className="text-slate-400" /> Secteur d'Activité
                  </label>
                  <div className="custom-select-wrapper">
                    <select
                      value={formData.secteur_activite}
                      onChange={(e) => setFormData({ ...formData, secteur_activite: e.target.value })}
                      className="custom-select"
                      title={formData.secteur_activite}
                    >
                      {options.secteurs.map((sec: string) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  </div>
                </div>
              </div>

              {/* Type de produit */}
              <div>
                <label className="input-label">
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
                        className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#18181B] text-white border-black shadow-sm'
                            : 'bg-white/80 text-slate-700 border-slate-200/80 hover:bg-white hover:border-slate-300'
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
                <div className="min-w-0">
                  <label className="input-label justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdPayments className="text-slate-400" /> Montant Déboursé
                    </span>
                    <span className="text-[10px] font-mono-num font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                      {fmt(formData.montant_debourse)} FCFA
                    </span>
                  </label>
                  <div className="relative">
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
                      className="custom-input font-mono-num font-bold pr-14"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                      FCFA
                    </span>
                  </div>
                  {/* Quick Shortcuts */}
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5">
                    {[500_000, 1_000_000, 2_000_000, 5_000_000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleShortcutMontant(v)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                          formData.montant_debourse === v
                            ? 'bg-[#18181B] text-white shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs'
                        }`}
                      >
                        {v >= 1_000_000 ? `${v / 1_000_000}M FCFA` : `${v / 1_000}k FCFA`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="input-label justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdAccountBalance className="text-slate-400" /> Solde Restant Dû
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-num font-semibold">
                      {Math.round((formData.solde_credit / (formData.montant_debourse || 1)) * 100)}% restant
                    </span>
                  </label>
                  <div className="relative">
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
                      className="custom-input font-mono-num font-bold pr-14"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                      FCFA
                    </span>
                  </div>
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
                    className="custom-range mt-3"
                  />
                </div>
              </div>

              {/* Jauge d'Amortissement Dynamique du Capital */}
              <div className="p-3.5 bg-white/70 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-bold gap-1">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    Capital Amorti : {fmt(Math.max(0, formData.montant_debourse - formData.solde_credit))} FCFA ({Math.round(Math.max(0, (1 - formData.solde_credit / (formData.montant_debourse || 1)) * 100))}%)
                  </span>
                  <span className="text-slate-900 font-mono-num flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#18181B] flex-shrink-0" />
                    Encours Dû : {fmt(formData.solde_credit)} FCFA ({Math.round((formData.solde_credit / (formData.montant_debourse || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden flex shadow-inner">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{
                      width: `${Math.max(0, Math.min(100, Math.round((1 - formData.solde_credit / (formData.montant_debourse || 1)) * 100)))}%`
                    }}
                    title="Partie du capital déjà remboursée"
                  />
                  <div
                    className="h-full bg-[#18181B] transition-all duration-200"
                    style={{
                      width: `${Math.max(0, Math.min(100, Math.round((formData.solde_credit / (formData.montant_debourse || 1)) * 100)))}%`
                    }}
                    title="Solde restant dû"
                  />
                </div>
              </div>

              {/* Profil Emprunteur */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="min-w-0 bg-white/60 p-3 rounded-2xl border border-slate-200/70 shadow-xs">
                  <label className="input-label justify-between">
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
                    className="custom-range mt-1.5"
                  />
                </div>

                <div className="min-w-0 bg-white/60 p-3 rounded-2xl border border-slate-200/70 shadow-xs">
                  <label className="input-label justify-between">
                    <span className="flex items-center gap-1.5">
                      <MdHistory className="text-slate-400" /> Précédents
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
                    className="custom-range mt-1.5"
                  />
                </div>

                <div className="min-w-0 bg-white/60 p-3 rounded-2xl border border-slate-200/70 shadow-xs">
                  <label className="input-label justify-between">
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
                    className="custom-range mt-1.5"
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

              {/* Barre d'Actions Décisionnelles */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleExportAvis}
                  className="flex-1 btn-pill-dark !py-2.5 text-xs justify-center cursor-pointer shadow-sm hover:opacity-90 flex items-center gap-1.5"
                  title="Télécharger l'avis officiel du comité en Markdown"
                >
                  <MdDownload size={16} />
                  <span>Exporter l'Avis Décisionnel (MD)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="btn-pill-white !py-2.5 !px-3.5 text-xs justify-center cursor-pointer shadow-sm hover:bg-slate-100 flex items-center gap-1.5"
                  title="Réinitialiser pour un nouveau dossier"
                >
                  <MdRefresh size={16} />
                  <span>Nouvelle</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
