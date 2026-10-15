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
  MdClose,
  MdWarningAmber,
  MdErrorOutline,
  MdCheckCircle,
  MdArrowForward,
  MdSecurity,
  MdAssessment,
  MdDownload,
} from 'react-icons/md';
import { DashboardOverview } from './pages/DashboardOverview';
import { DonneesPage } from './pages/DonneesPage';
import { ModelePage } from './pages/ModelePage';
import { PredictionPage } from './pages/PredictionPage';
import { fetchOverview } from './lib/api';
import { Spinner } from './components/ui/Spinner';
import { LogoBrand } from './components/ui/Logo';
import liquidBg from './assets/liquid-glass-bg.jpg';

const ELEMENTS_NAVIGATION = [
  { id: 'dashboard', label: "Vue d'Ensemble", Icon: MdDashboard },
  { id: 'portefeuille', label: 'Portefeuille & Prêts', Icon: MdTableChart },
  { id: 'modele', label: 'Modèle de Risque', Icon: MdAutoGraph },
  { id: 'simulateur', label: "Simulateur d'Octroi", Icon: MdBolt },
] as const;

type NavId = typeof ELEMENTS_NAVIGATION[number]['id'];

const CAISSES_RESEAU = [
  { code: 'ALL', label: 'Toutes les Caisses' },
  { code: 'CEC/PLATEAU', label: 'CEC Plateau' },
  { code: 'CEC_B', label: 'CEC Banlieue' },
  { code: 'MECYD', label: 'MECYD Yoff' },
  { code: 'MECREST', label: 'MECREST Thiès' },
  { code: 'MECZOR', label: 'MECZOR Ziguinchor' },
];

const STATUTS_PRUDENTIELS = [
  { code: 'Sain', label: 'Sains (83.5%)', color: 'bg-emerald-500' },
  { code: 'Vigilance', label: 'Vigilance (4.6%)', color: 'bg-amber-500' },
  { code: 'Défaut', label: 'Contentieux (11.9%)', color: 'bg-rose-500' },
];

export default function App() {
  const [ongletActif, setOngletActif] = useState<NavId>('dashboard');
  const [selectedAgence, setSelectedAgence] = useState<string>('ALL');
  const [filtreStatut, setFiltreStatut] = useState<string>('ALL');
  const [prefillSimulation, setPrefillSimulation] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
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

  const handleNavigate = (tab: string, payload?: any) => {
    if (payload?.filterAgence) setSelectedAgence(payload.filterAgence);
    if (payload?.filterStatut) setFiltreStatut(payload.filterStatut);
    if (payload?.numero_credit) setPrefillSimulation(payload);
    setOngletActif(tab as NavId);
  };

  const handleSelectCaisseSidebar = (code: string) => {
    setSelectedAgence(code);
    if (ongletActif !== 'dashboard') {
      setOngletActif('portefeuille');
    }
  };

  const handleSelectStatutSidebar = (code: string) => {
    setFiltreStatut(code);
    setOngletActif('portefeuille');
  };

  const handleDownloadRapportAcademique = () => {
    const contenu = `# RAPPORT DE PROJET D'EXAMEN - WARISCORE
## Plateforme de Pilotage & Scoring du Risque de Crédit en Microfinance
**Auteur :** Projet d'Examen — Module Data Science & Machine Learning Appliqué
**Jeu de Données :** DataSet_Credit.xlsx (15 188 dossiers réels SFD Sénégal)
**Institutions :** CEC Plateau, CEC Banlieue, MECYD, MECREST, MECZOR
**Modèle ML :** Random Forest (180 estimateurs · Accuracy 94.5% · F1-Macro 0.825)
**Supervision Réglementaire :** Directives BCEAO relatives aux Systèmes Financiers Décentralisés (SFD)
`;
    const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WariScore_Rapport_Academique.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-6 flex items-center justify-center relative selection:bg-black selection:text-white">
      {/* ── Fond d'écran 3D Verre Liquide & Rubans de Soie */}
      <div
        className="liquid-glass-background"
        style={{ backgroundImage: `url(${liquidBg})` }}
      />
      <div className="liquid-glass-overlay" />

      {/* ── Fenêtre Maître en Verre Dépoli (Conteneur Liquid Glass) */}
      <div className="liquid-glass-window max-w-[1460px] w-full min-h-[88vh] flex flex-col md:flex-row p-5 md:p-8 gap-6 md:gap-8 relative">

        {/* ── BARRE LATÉRALE GAUCHE ── */}
        <aside className="w-full md:w-56 flex-shrink-0 flex flex-col justify-between md:border-r border-slate-300/40 md:pr-6 pb-4 md:pb-0">
          <div className="space-y-6">
            {/* Logo de l'Institution */}
            <div className="px-1 pt-1">
              <LogoBrand />
            </div>

            {/* Menu de Navigation Principal */}
            <nav className="space-y-1.5 pt-2">
              {ELEMENTS_NAVIGATION.map(({ id, label, Icon }) => {
                const estActif = ongletActif === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      if (id === 'portefeuille') setFiltreStatut('ALL');
                      setOngletActif(id);
                    }}
                    className={`sidebar-item w-full ${estActif ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Réseau des Caisses & Mutuelles (Filtre Direct) */}
            <div className="pt-2 hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
                Réseau des Caisses
              </span>
              <div className="space-y-1 text-xs font-semibold text-slate-600 px-2">
                {CAISSES_RESEAU.map((c) => {
                  const isSelected = selectedAgence === c.code;
                  return (
                    <div
                      key={c.code}
                      onClick={() => handleSelectCaisseSidebar(c.code)}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#18181B] text-white shadow-sm font-bold'
                          : 'hover:bg-white/60 hover:text-black'
                      }`}
                      title={`Filtrer les données sur : ${c.label}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isSelected ? 'bg-emerald-400' : 'bg-slate-400'
                          }`}
                        />
                        <span className="truncate">{c.label}</span>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statuts Prudentiels BCEAO (Filtre Direct Registre) */}
            <div className="pt-1 hidden md:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-2">
                Classification BCEAO
              </span>
              <div className="space-y-1 text-xs font-semibold text-slate-600 px-2">
                {STATUTS_PRUDENTIELS.map((st) => {
                  const isSelected = filtreStatut === st.code;
                  return (
                    <div
                      key={st.code}
                      onClick={() => handleSelectStatutSidebar(st.code)}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-200 text-black font-bold shadow-sm'
                          : 'hover:bg-white/60 hover:text-black'
                      }`}
                      title={`Filtrer le registre sur le statut : ${st.label}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${st.color}`} />
                        <span>{st.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">Filtrer</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audit & Paramètres */}
          <div className="pt-4 border-t border-slate-200/50 hidden md:block">
            <button
              onClick={() => setOngletActif('modele')}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors w-full cursor-pointer rounded-xl ${
                ongletActif === 'modele'
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'text-slate-500 hover:text-black hover:bg-white/50'
              }`}
            >
              <MdSettings size={17} />
              <span>Audit & Validation</span>
            </button>
          </div>
        </aside>

        {/* ── ZONE DE CONTENU PRINCIPALE ── */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden relative">
          {/* Ligne d'En-tête */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/30">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                Plateforme de Pilotage du Risque de Crédit
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">
                {dateCourante || 'Session en cours'} · 15 188 Dossiers Réels SFD Sénégal
              </p>
            </div>

            {/* Boutons d'Action & Profil */}
            <div className="flex items-center gap-3 relative">
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

              {/* Bouton Circulaire des Notifications (Avec Popover Opérationnel) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className={`circle-btn relative ${showNotifications ? 'bg-slate-200' : ''}`}
                  title="Alertes réglementaires BCEAO"
                >
                  <MdNotificationsNone size={18} />
                  {unreadNotifications > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {/* Popover Centre d'Alertes Prudentielles */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#18181B] text-white flex items-center justify-center text-sm">
                          <MdNotificationsNone />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block leading-tight">
                            Centre d'Alertes Prudentielles
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Directives prudentielles BCEAO
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-black p-1 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <MdClose size={16} />
                      </button>
                    </div>

                    <div className="space-y-2.5 py-3 text-xs">
                      {/* Alerte 1 */}
                      <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200/60 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900 flex items-center gap-1">
                            <MdErrorOutline className="text-rose-600" /> PAR 30 Critique : 16.48%
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800">
                            Urgent
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700 leading-snug">
                          Dépassement du seuil maximal prudentiel BCEAO fixé à 5.0%.
                        </p>
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            handleNavigate('portefeuille', { filterStatut: 'Défaut' });
                          }}
                          className="self-end text-[10px] font-bold text-rose-900 hover:underline flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          Examiner le portefeuille <MdArrowForward size={12} />
                        </button>
                      </div>

                      {/* Alerte 2 */}
                      <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/60 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <MdWarningAmber className="text-amber-600" /> Provisionnement Requis
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
                            1,047 Md F
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-snug">
                          Dotation obligatoire à imputer au compte de résultat pour couvrir les 2 503 créances à risque.
                        </p>
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            handleNavigate('dashboard');
                          }}
                          className="self-end text-[10px] font-bold text-amber-900 hover:underline flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          Voir le calcul BCEAO <MdArrowForward size={12} />
                        </button>
                      </div>

                      {/* Alerte 3 */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <MdSecurity className="text-slate-700" /> 4 Défaillances &gt; 20M FCFA
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Recouvrement
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Dossier prioritaire : Crédit #10423 (Solde 23,2 M FCFA en contentieux).
                        </p>
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            if (vueEnsemble?.dossiers_prioritaires?.[0]) {
                              handleNavigate('simulateur', vueEnsemble.dossiers_prioritaires[0]);
                            } else {
                              handleNavigate('simulateur');
                            }
                          }}
                          className="self-end text-[10px] font-bold text-slate-900 hover:underline flex items-center gap-0.5 cursor-pointer mt-1"
                        >
                          Auditer au simulateur <MdArrowForward size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setUnreadNotifications(0);
                          setShowNotifications(false);
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-black cursor-pointer"
                      >
                        Marquer comme lues
                      </button>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] font-bold text-slate-900 hover:underline cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pastille de Profil Analyste (Avec Popover Opérationnel) */}
              <div className="relative">
                <div
                  onClick={() => setShowProfileModal((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-[#18181B] text-white flex items-center justify-center font-black text-xs ring-2 ring-white/80 shadow-sm flex-shrink-0 cursor-pointer tracking-wider hover:opacity-90 transition-opacity"
                  title="Profil Analyste Risque · WariScore"
                >
                  WS
                </div>

                {/* Popover Analyste */}
                {showProfileModal && (
                  <div className="absolute right-0 top-12 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in text-left">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center font-black text-xs shadow-sm">
                        WS
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          Analyste Risque Senior
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Session Active
                        </span>
                      </div>
                    </div>

                    <div className="py-3 text-[11px] space-y-1.5 text-slate-600">
                      <p>
                        <strong className="text-slate-900">Institution :</strong> SFD Sénégal
                      </p>
                      <p>
                        <strong className="text-slate-900">Périmètre :</strong> Direction du Risque
                      </p>
                      <p>
                        <strong className="text-slate-900">Accréditation :</strong> Superviseur BCEAO
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          setOngletActif('modele');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between"
                      >
                        <span>Audit du Modèle ML</span>
                        <MdArrowForward size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                          handleDownloadRapportAcademique();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between"
                      >
                        <span>Rapport d'Examen (.md)</span>
                        <MdDownload size={14} />
                      </button>
                      <button
                        onClick={() => setShowProfileModal(false)}
                        className="w-full text-center py-1.5 text-[11px] font-bold text-slate-400 hover:text-black cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
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
                  <DashboardOverview
                    overview={vueEnsemble}
                    selectedAgence={selectedAgence}
                    onAgenceChange={setSelectedAgence}
                    onNavigate={handleNavigate}
                  />
                )}
                {ongletActif === 'portefeuille' && (
                  <DonneesPage
                    initialAgence={selectedAgence}
                    initialStatut={filtreStatut}
                  />
                )}
                {ongletActif === 'modele' && <ModelePage />}
                {ongletActif === 'simulateur' && (
                  <PredictionPage
                    initialDossier={prefillSimulation}
                    onClearPrefill={() => setPrefillSimulation(null)}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
