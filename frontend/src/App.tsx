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
  MdAccountBalance,
  MdSecurity,
  MdFolderOpen,
} from 'react-icons/md';
import { DashboardOverview } from './pages/DashboardOverview';
import { DonneesPage } from './pages/DonneesPage';
import { ModelePage } from './pages/ModelePage';
import { PredictionPage } from './pages/PredictionPage';
import { fetchOverview } from './lib/api';
import { Spinner } from './components/ui/Spinner';
import liquidBg from './assets/liquid-glass-bg.jpg';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: MdDashboard },
  { id: 'portefeuille', label: 'Portefeuille', Icon: MdTableChart },
  { id: 'modele', label: 'Modèle ML', Icon: MdAutoGraph },
  { id: 'simulateur', label: 'Simulateur & Scoring', Icon: MdBolt },
] as const;

type NavId = typeof NAV_ITEMS[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavId>('dashboard');
  const [overview, setOverview] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    fetchOverview().then(setOverview).catch(console.error);

    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-6 flex items-center justify-center relative selection:bg-black selection:text-white">
      {/* ── 3D Liquid Glass & Silk Ribbon Wallpaper */}
      <div
        className="liquid-glass-background"
        style={{ backgroundImage: `url(${liquidBg})` }}
      />
      <div className="liquid-glass-overlay" />

      {/* ── Master Frosted Glass Window (The Container from the User Mockup) */}
      <div className="liquid-glass-window max-w-[1460px] w-full min-h-[88vh] flex flex-col md:flex-row p-5 md:p-8 gap-6 md:gap-8">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-full md:w-56 flex-shrink-0 flex flex-col justify-between md:border-r border-slate-300/40 md:pr-6 pb-4 md:pb-0">
          <div className="space-y-6">
            {/* Logo Brand */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  iDraft <span className="text-[10px] text-slate-400 font-semibold">Credit</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Microfinance SN
                </span>
              </div>
            </div>

            {/* Primary Navigation */}
            <nav className="space-y-1.5 pt-2">
              {NAV_ITEMS.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sub-Section 1: Réseau Agences */}
            <div className="pt-2 hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
                Réseau des Caisses
              </span>
              <div className="space-y-1 text-xs font-semibold text-slate-600 px-3">
                <div className="flex items-center gap-2 py-1 hover:text-black cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>CEC Plateau</span>
                </div>
                <div className="flex items-center gap-2 py-1 hover:text-black cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>CEC Banlieue</span>
                </div>
                <div className="flex items-center gap-2 py-1 hover:text-black cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>MECYD Yoff</span>
                </div>
                <div className="flex items-center gap-2 py-1 hover:text-black cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>MECREST Thiès</span>
                </div>
              </div>
            </div>

            {/* Sub-Section 2: Statuts Prudentiels */}
            <div className="pt-1 hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
                Statuts Prudentiels
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
                  <span>Défaut (11.9%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="pt-4 border-t border-slate-200/50 hidden md:block">
            <button
              onClick={() => setActiveTab('modele')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-black transition-colors w-full cursor-pointer"
            >
              <MdSettings size={17} />
              <span>Audit & Paramètres</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Header Row (Hi, Analyst! + Action buttons) */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/30">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                Bonjour, Analyste !
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Portefeuille de Microfinance · {currentDate || 'Octobre 2026'} · 15 188 Prêts
              </p>
            </div>

            {/* Right Action Icons & CTA Button */}
            <div className="flex items-center gap-3">
              {/* + Create / + Simuler Pill CTA */}
              <button
                onClick={() => setActiveTab('simulateur')}
                className="btn-pill-dark"
              >
                <MdAdd size={16} />
                <span>+ Nouveau Prêt</span>
              </button>

              {/* Circle Search */}
              <button
                onClick={() => setActiveTab('portefeuille')}
                className="circle-btn"
                title="Rechercher un dossier"
              >
                <MdSearch size={18} />
              </button>

              {/* Circle Notifications */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className="circle-btn relative"
                title="Notifications"
              >
                <MdNotificationsNone size={18} />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
              </button>

              {/* Avatar Circle */}
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm flex-shrink-0 cursor-pointer">
                AN
              </div>
            </div>
          </header>

          {/* Active View Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            {!overview ? (
              <Spinner message="Chargement des données du portefeuille..." />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardOverview overview={overview} onNavigate={(tab) => setActiveTab(tab as NavId)} />
                )}
                {activeTab === 'portefeuille' && <DonneesPage />}
                {activeTab === 'modele' && <ModelePage />}
                {activeTab === 'simulateur' && <PredictionPage />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
