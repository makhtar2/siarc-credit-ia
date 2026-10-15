import React, { useState, useEffect } from 'react';
import {
  MdDashboard,
  MdTableChart,
  MdAutoGraph,
  MdBolt,
  MdSearch,
  MdNotificationsNone,
  MdAdd,
  MdSettings,
} from 'react-icons/md';
import { DashboardOverview } from './pages/DashboardOverview';
import { DonneesPage } from './pages/DonneesPage';
import { ModelePage } from './pages/ModelePage';
import { PredictionPage } from './pages/PredictionPage';
import { fetchOverview } from './lib/api';
import { Spinner } from './components/ui/Spinner';
import liquidBg from './assets/liquid-glass-bg.jpg';

const ELEMENTS_NAVIGATION = [
  { id: 'dashboard', label: "Vue d'Ensemble", Icon: MdDashboard },
  { id: 'portefeuille', label: 'Portefeuille & Prêts', Icon: MdTableChart },
  { id: 'modele', label: 'Modèle de Risque', Icon: MdAutoGraph },
  { id: 'simulateur', label: "Simulateur d'Octroi", Icon: MdBolt },
] as const;

type NavId = typeof ELEMENTS_NAVIGATION[number]['id'];

export default function App() {
  const [ongletActif, setOngletActif] = useState<NavId>('dashboard');
  const [vueEnsemble, setVueEnsemble] = useState<any>(null);
  const [dateCourante, setDateCourante] = useState('');

  useEffect(() => {
    fetchOverview().then(setVueEnsemble).catch(console.error);

    const maintenant = new Date();
    setDateCourante(
      maintenant.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
  }, []);

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-6 flex items-center justify-center relative selection:bg-black selection:text-white">
      {/* ── Fond d'écran 3D Verre Liquide & Rubans de Soie */}
      <div
        className="liquid-glass-background"
        style={{ backgroundImage: `url(${liquidBg})` }}
      />
      <div className="liquid-glass-overlay" />

      {/* ── Fenêtre Maître en Verre Dépoli (Conteneur Liquid Glass) */}
      <div className="liquid-glass-window max-w-[1460px] w-full min-h-[88vh] flex flex-col md:flex-row p-5 md:p-8 gap-6 md:gap-8">

        {/* ── BARRE LATÉRALE GAUCHE ── */}
        <aside className="w-full md:w-56 flex-shrink-0 flex flex-col justify-between md:border-r border-slate-300/40 md:pr-6 pb-4 md:pb-0">
          <div className="space-y-6">
            {/* Logo de l'Institution */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  SFD <span className="text-[10px] text-slate-500 font-bold">CreditRisk</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Microfinance · Sénégal
                </span>
              </div>
            </div>

            {/* Menu de Navigation Principal */}
            <nav className="space-y-1.5 pt-2">
              {ELEMENTS_NAVIGATION.map(({ id, label, Icon }) => {
                const estActif = ongletActif === id;
                return (
                  <button
                    key={id}
                    onClick={() => setOngletActif(id)}
                    className={`sidebar-item w-full ${estActif ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Réseau des Caisses & Mutuelles */}
            <div className="pt-2 hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
                Réseau des Caisses
              </span>
              <div className="space-y-1 text-xs font-semibold text-slate-600 px-3">
                <div
                  onClick={() => setOngletActif('portefeuille')}
                  className="flex items-center gap-2 py-1 hover:text-black cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>CEC Plateau</span>
                </div>
                <div
                  onClick={() => setOngletActif('portefeuille')}
                  className="flex items-center gap-2 py-1 hover:text-black cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>CEC Banlieue</span>
                </div>
                <div
                  onClick={() => setOngletActif('portefeuille')}
                  className="flex items-center gap-2 py-1 hover:text-black cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>MECYD Yoff</span>
                </div>
                <div
                  onClick={() => setOngletActif('portefeuille')}
                  className="flex items-center gap-2 py-1 hover:text-black cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>MECREST Thiès</span>
                </div>
              </div>
            </div>

            {/* Statuts Prudentiels BCEAO */}
            <div className="pt-1 hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
                Classification BCEAO
              </span>
              <div className="space-y-1 text-xs font-semibold text-slate-600 px-3">
                <div className="flex items-center gap-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Sains (83.5%)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Vigilance (4.6%)</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Contentieux (11.9%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit & Paramètres */}
          <div className="pt-4 border-t border-slate-200/50 hidden md:block">
            <button
              onClick={() => setOngletActif('modele')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-black transition-colors w-full cursor-pointer"
            >
              <MdSettings size={17} />
              <span>Audit & Validation</span>
            </button>
          </div>
        </aside>

        {/* ── ZONE DE CONTENU PRINCIPALE ── */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Ligne d'En-tête */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/30">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                Plateforme d'Analyse du Risque de Crédit
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">
                {dateCourante || 'Session en cours'} · 15 188 Dossiers de Prêt Réels
              </p>
            </div>

            {/* Boutons d'Action & Profil */}
            <div className="flex items-center gap-3">
              {/* Bouton Pilule Noir CTA */}
              <button
                onClick={() => setOngletActif('simulateur')}
                className="btn-pill-dark"
              >
                <MdAdd size={16} />
                <span>+ Simuler un Prêt</span>
              </button>

              {/* Bouton Circulaire de Recherche */}
              <button
                onClick={() => setOngletActif('portefeuille')}
                className="circle-btn"
                title="Consulter le registre des crédits"
              >
                <MdSearch size={18} />
              </button>

              {/* Bouton Circulaire des Notifications */}
              <button
                onClick={() => setOngletActif('dashboard')}
                className="circle-btn relative"
                title="Alertes réglementaires"
              >
                <MdNotificationsNone size={18} />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
              </button>

              {/* Pastille de Profil Analyste */}
              <div
                onClick={() => setOngletActif('modele')}
                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm flex-shrink-0 cursor-pointer"
                title="Profil Analyste Risque"
              >
                SFD
              </div>
            </div>
          </header>

          {/* Conteneur de Vue Dynamique */}
          <div className="flex-1 overflow-y-auto pr-1">
            {!vueEnsemble ? (
              <Spinner message="Chargement des données du portefeuille..." />
            ) : (
              <>
                {ongletActif === 'dashboard' && (
                  <DashboardOverview overview={vueEnsemble} onNavigate={(tab) => setOngletActif(tab as NavId)} />
                )}
                {ongletActif === 'portefeuille' && <DonneesPage />}
                {ongletActif === 'modele' && <ModelePage />}
                {ongletActif === 'simulateur' && <PredictionPage />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
