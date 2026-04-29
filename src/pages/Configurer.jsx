import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import {
  PhoneCall, RefreshCw, CalendarCheck, Bot, Star, Zap, Check, ChevronRight,
  Upload, Plus, Trash2, FileSpreadsheet, ExternalLink, Sparkles, Phone,
  AlertCircle, Loader2, HelpCircle, X, Download, ChevronDown, MessageCircle,
} from 'lucide-react';
import { fetchEssaiByToken, injectContacts, cancelTrial, requestPlanChange } from '../services/leadService';
import FloatingContact from '../components/FloatingContact';

const PHONE_DISPLAY = '+33 1 77 38 17 11';
const PHONE_TEL = '+33177381711';
const CALENDAR_RECEPTION = 'https://calendar.app.google/M3BbtZaQGTbzp2cF7';
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/bJedRbfwG88D6qQ9NMf3a05';

/* ════════════════════════════════════════════════════════════════════
   /configurer/:token
   Espace personnel (sans login, lien tokenisé) pour le lead :
    - Activer Réception d'appels IA 24/7 (Calendar)
    - Importer ou ajouter manuellement des contacts pour 5 modules
   Style Apple/Qonto, mobile-first.
   ════════════════════════════════════════════════════════════════════ */

const MODULES = [
  {
    id: 'reception-24-7',
    label: 'Réception d\'appels IA 24/7',
    sub: 'La base : l\'IA répond, qualifie, vous envoie le lead',
    icon: PhoneCall,
    color: '#F59E0B',
    type: 'calendar', // pas d'injection contacts
  },
  {
    id: 'renouvellement',
    label: 'Renouvellement de dossiers',
    sub: 'L\'IA rappelle vos clients pour renouveler contrats, abonnements, prestations',
    icon: RefreshCw,
    color: '#10B981',
    type: 'contacts',
    fields: ['nom', 'telephone', 'email', 'dateEcheance', 'notes'],
    sample: { nom: 'Marie Dupont', telephone: '0612345678', email: 'marie@example.fr', dateEcheance: '2026-06-15' },
    sampleHelp: 'Date d\'échéance du contrat ou de la prestation à renouveler.',
  },
  {
    id: 'confirmation-rdv',
    label: 'Confirmation de RDV',
    sub: 'L\'IA confirme chaque RDV 24h avant. Plus de no-show.',
    icon: CalendarCheck,
    color: '#3B82F6',
    type: 'contacts',
    fields: ['nom', 'telephone', 'email', 'dateRdv', 'notes'],
    sample: { nom: 'Pierre Martin', telephone: '0612345678', dateRdv: '2026-05-12 14:30', notes: 'Consultation suivi' },
    sampleHelp: 'Format date : 2026-05-12 14:30 (AAAA-MM-JJ HH:MM)',
  },
  {
    id: 'robot-mesure',
    label: 'Robot IA sur mesure',
    sub: 'On entraîne un robot dédié à votre métier en moins d\'une semaine',
    icon: Bot,
    color: '#8B5CF6',
    type: 'contacts',
    fields: ['nom', 'telephone', 'email', 'notes'],
    sample: { nom: 'Sophie L.', telephone: '0612345678', notes: 'Cas particulier — voir brief' },
    sampleHelp: 'Note libre — cas spécifique, contexte, demande.',
  },
  {
    id: 'impact-avis',
    label: 'Impact Avis',
    sub: 'L\'IA appelle vos clients satisfaits pour un avis Google',
    icon: Star,
    color: '#F97316',
    type: 'contacts',
    fields: ['nom', 'telephone', 'email', 'notes'],
    sample: { nom: 'Lucas R.', telephone: '0612345678', notes: 'Client habitué — coupe le 22/04' },
    sampleHelp: 'Précisez le contexte (date prestation, type de service rendu).',
  },
  {
    id: 'paiements',
    label: 'Accélération de paiements',
    sub: 'L\'IA relance vos impayés et envoie le lien de paiement Stripe en 1 clic',
    icon: Zap,
    color: '#F43F5E',
    type: 'contacts',
    fields: ['nom', 'telephone', 'email', 'montant', 'refFacture', 'notes'],
    sample: { nom: 'SARL Beta', telephone: '0145678901', email: 'compta@beta.fr', montant: '1200', refFacture: 'FAC-2026-001' },
    sampleHelp: 'Montant en € (sans le symbole) et référence facture.',
  },
];

export default function Configurer() {
  const { token } = useParams();
  const [trial, setTrial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModule, setActiveModule] = useState('reception-24-7');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Configurer mon espace BoosterPay';
    if (!token) { setError('Token manquant'); setLoading(false); return; }
    let mounted = true;
    fetchEssaiByToken(token).then(res => {
      if (!mounted) return;
      if (res.success) setTrial(res.data);
      else setError(res.error || 'Lien invalide');
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [token]);

  const active = MODULES.find(m => m.id === activeModule) || MODULES[0];
  const modulesActives = trial?.modules_actives || [];

  if (loading) return <SplashScreen text="Chargement de votre espace…" />;
  if (error || !trial) return <ErrorScreen error={error} />;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
            aria-label="Menu"
          >
            <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
              <Zap className="w-4 h-4 text-white" strokeWidth={2.4} />
            </div>
            <span className="text-[16px] font-bold tracking-tight">Booster<span className="text-blue-500">Pay</span></span>
            <span className="ml-2 text-[10.5px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 hidden sm:inline">Espace de configuration</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {trial.entreprise && (
              <span className="hidden sm:inline text-[13px] text-gray-500 truncate max-w-[200px]">
                {trial.entreprise}
              </span>
            )}
            <a href={`tel:${PHONE_TEL}`} className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] text-gray-500 hover:text-gray-900 transition-colors">
              <Phone className="w-3.5 h-3.5" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* TRIAL STATUS BAR */}
        <TrialStatusBar
          trial={trial}
          onChangePlan={() => setPlanModalOpen(true)}
          onCancelPlan={() => setCancelModalOpen(true)}
        />

        <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-6 sm:gap-10">
          {/* SIDEBAR (desktop) */}
          <aside className="hidden lg:block">
            <ModuleNav
              active={activeModule}
              onSelect={setActiveModule}
              modulesActives={modulesActives}
            />
          </aside>

          {/* SIDEBAR (mobile drawer) */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden p-5 overflow-y-auto"
                  initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-auto block p-2 -mr-2 rounded-lg hover:bg-gray-100"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <ModuleNav
                    active={activeModule}
                    onSelect={(id) => { setActiveModule(id); setSidebarOpen(false); }}
                    modulesActives={modulesActives}
                  />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* MAIN PANEL */}
          <main>
            {/* Mobile : pill module switcher */}
            <div className="lg:hidden -mx-4 sm:mx-0 mb-5 overflow-x-auto">
              <div className="flex gap-2 px-4 sm:px-0 pb-2 min-w-max">
                {MODULES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all ${
                      activeModule === m.id
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" style={{ color: activeModule === m.id ? 'white' : m.color }} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {active.type === 'calendar' ? (
              <ReceptionPanel trial={trial} token={token} onUpdate={setTrial} />
            ) : (
              <ModulePanel
                key={active.id}
                module={active}
                token={token}
                trial={trial}
                onActivated={(modId) => {
                  setTrial({
                    ...trial,
                    modules_actives: [...new Set([...(trial.modules_actives || []), modId])],
                    statut: trial.statut === 'en_attente_config' ? 'configure' : trial.statut,
                  });
                }}
              />
            )}
          </main>
        </div>
      </div>

      <FloatingContact />

      {/* MODALE — Changement de plan */}
      <PlanChangeModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        currentPlan={trial.plan}
        token={token}
      />

      {/* MODALE — Annulation */}
      <CancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        token={token}
        currentPlan={trial.plan}
        onCancelled={() => setTrial({ ...trial, statut: 'annule' })}
      />
    </div>
  );
}

/* ─── Sidebar nav ─── */

function ModuleNav({ active, onSelect, modulesActives }) {
  return (
    <nav className="space-y-1">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Modules</div>
      {MODULES.map(m => {
        const isActive = m.id === active;
        const isConfigured = m.type === 'contacts' && modulesActives.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${
              isActive
                ? 'bg-white border border-gray-200 shadow-sm'
                : 'border border-transparent hover:bg-white/60'
            }`}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${m.color}15`,
                border: `1px solid ${m.color}30`,
              }}
            >
              <m.icon className="w-4 h-4" style={{ color: m.color }} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className={`text-[13.5px] leading-snug truncate ${isActive ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {m.label}
                </div>
                {isConfigured && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100">
                    <Check className="w-2.5 h-2.5 text-emerald-700" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-gray-500 leading-snug truncate mt-0.5">{m.sub}</div>
            </div>
          </button>
        );
      })}

      <div className="pt-3 mt-4 border-t border-gray-100">
        <a href={`mailto:contact@booster-pay.com`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] text-gray-500 hover:text-gray-900 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" /> Besoin d'aide ?
        </a>
      </div>
    </nav>
  );
}

/* ─── Trial status bar ─── */

function TrialStatusBar({ trial, onChangePlan, onCancelPlan }) {
  const planLabels = { gratuit: 'Essai gratuit', 'a-la-carte': 'À la carte', pro: 'Pro', business: 'Business' };
  const expiresDate = trial.expires_at ? new Date(trial.expires_at) : null;
  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / 86400000)) : 0;
  const pct = trial.appels_offerts > 0 ? Math.min(100, (trial.appels_consommes / trial.appels_offerts) * 100) : 0;
  const isCancelled = trial.statut === 'annule';

  return (
    <div className={`bg-white border rounded-3xl p-5 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
      isCancelled ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100'
    }`}>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
        {/* Plan + actions */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider">Mon plan</div>
            {isCancelled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                Annulé
              </span>
            )}
          </div>
          <div className="text-[20px] font-semibold text-gray-900 leading-tight">{planLabels[trial.plan] || trial.plan}</div>
          {!isCancelled && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onChangePlan}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Changer de plan
              </button>
              <button
                type="button"
                onClick={onCancelPlan}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                Annuler mon plan
              </button>
            </div>
          )}
          {isCancelled && (
            <p className="mt-2 text-[12.5px] text-rose-700">
              Notre équipe finalise l'annulation côté Stripe et vous confirme par email.
            </p>
          )}
        </div>

        {/* Appels */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider">Appels consommés</div>
            <div className="text-[12.5px] tabular-nums">
              <span className="font-semibold text-gray-900">{trial.appels_consommes}</span>
              <span className="text-gray-400"> / {trial.appels_offerts}</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }}
              initial={{ width: 0 }}
              animate={{ width: pct + '%' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>

        {/* Reste */}
        <div>
          <div className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider">Reste</div>
          <div className="text-[18px] font-semibold text-gray-900 mt-0.5">
            {daysLeft} jour{daysLeft > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Plan change modal ─── */

function PlanChangeModal({ open, onClose, currentPlan, token }) {
  const [busy, setBusy] = useState(false);

  // Bloque le scroll page
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Échap → ferme
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const PLANS = [
    {
      id: 'gratuit',
      name: 'Essai gratuit',
      price: '0€',
      sub: '100 appels · 14 jours',
      paid: false,
    },
    {
      id: 'a-la-carte',
      name: 'À la carte',
      price: '97€ HT',
      sub: '300 appels · 30 jours · paiement unique',
      paid: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '97€ HT/mois',
      sub: '500 appels/mois · annuel : 77€/mois',
      paid: true,
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: '249€ HT/mois',
      sub: '2 000 appels/mois · multi-sites',
      paid: true,
    },
  ];

  const handlePick = async (planId) => {
    if (planId === currentPlan) { onClose(); return; }
    if (planId === 'gratuit') { onClose(); return; }
    setBusy(true);
    // Log l'intention côté GAS
    try { await requestPlanChange({ token, plan_demande: planId, source: 'configurer-modal' }); } catch (e) {}
    // Redirection Stripe (pour l'instant 1 seule URL pour tous les plans payants)
    try { localStorage.setItem('bp_plan_demande', planId); } catch (e) {}
    window.location.href = STRIPE_CHECKOUT_URL;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Changer de plan"
            className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'min(720px, calc(100dvh - 4rem))' }}
            initial={{ y: 32, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 sm:px-8 pt-7 pb-3">
              <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Changement de plan</div>
              <h2 className="text-[22px] sm:text-[26px] font-semibold text-gray-900 tracking-tight">Choisissez votre nouveau plan</h2>
              <p className="text-[13.5px] text-gray-500 mt-1">
                Pour les plans payants, vous serez redirigé vers Stripe pour le paiement sécurisé.
              </p>
            </div>

            <div className="px-6 sm:px-8 pb-7 pt-2 flex-1 min-h-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="grid sm:grid-cols-2 gap-3">
                {PLANS.map((p) => {
                  const isCurrent = p.id === currentPlan;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={busy || isCurrent}
                      onClick={() => handlePick(p.id)}
                      className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-300 bg-blue-50/40 cursor-not-allowed'
                          : p.popular
                            ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${busy ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      {p.popular && !isCurrent && (
                        <span className="absolute -top-2.5 left-4 text-[10px] font-bold tracking-wider uppercase text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-2.5 py-0.5 rounded-full">
                          Le plus populaire
                        </span>
                      )}
                      {isCurrent && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          <Check className="w-3 h-3" /> Plan actuel
                        </span>
                      )}
                      <div className="text-[15px] font-semibold text-gray-900">{p.name}</div>
                      <div className="text-[22px] font-semibold tracking-tight text-gray-900 mt-1">{p.price}</div>
                      <div className="text-[12.5px] text-gray-500 mt-1.5 leading-relaxed">{p.sub}</div>
                      {p.paid && !isCurrent && (
                        <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600">
                          Continuer vers Stripe <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-[11.5px] text-gray-400 leading-relaxed">
                Tous les prix sont HT. Annulation en 1 clic. Aucun frais caché.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Cancel modal ─── */

function CancelModal({ open, onClose, token, currentPlan, onCancelled }) {
  const [step, setStep] = useState('confirm'); // 'confirm' | 'sending' | 'success' | 'error'
  const [raison, setRaison] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep('confirm'); setRaison(''); setErrorMsg('');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const planLabels = { gratuit: 'Essai gratuit', 'a-la-carte': 'À la carte', pro: 'Plan Pro', business: 'Plan Business' };

  const handleConfirm = async () => {
    setStep('sending'); setErrorMsg('');
    const res = await cancelTrial({ token, raison: raison || '' });
    if (res.success) {
      setStep('success');
      onCancelled?.();
    } else {
      setStep('error');
      setErrorMsg(res.error || 'Erreur lors de l\'annulation');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={step === 'success' ? onClose : undefined} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label="Annuler le plan"
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
            initial={{ y: 32, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {step !== 'sending' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {(step === 'confirm' || step === 'sending' || step === 'error') && (
              <div className="p-7 sm:p-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-5 h-5 text-rose-600" strokeWidth={2} />
                </div>
                <h2 className="text-[20px] sm:text-[22px] font-semibold text-gray-900 tracking-tight">
                  Annuler votre <strong>{planLabels[currentPlan] || currentPlan}</strong> ?
                </h2>
                <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
                  Cette action arrêtera votre plan et désactivera vos modules actifs.
                  Vous receverez un email de confirmation et notre équipe finalisera l'annulation côté Stripe sous 24h.
                </p>

                <div className="mt-5">
                  <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Pourquoi annuler ? <span className="text-gray-300 normal-case font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    value={raison}
                    onChange={(e) => setRaison(e.target.value)}
                    placeholder="Trop cher, fonctionnalité manquante, autre raison…"
                    rows={3}
                    style={{ fontSize: 16 }}
                    className="w-full px-3.5 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 resize-none focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="mt-3 text-[12.5px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                    {errorMsg}
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={step === 'sending'}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px] font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-60"
                  >
                    {step === 'sending'
                      ? (<><Loader2 className="w-4 h-4 animate-spin" /> Annulation…</>)
                      : 'Oui, annuler mon plan'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={step === 'sending'}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-60"
                  >
                    Garder mon plan
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.4} />
                </motion.div>
                <h3 className="text-[20px] font-semibold text-gray-900 tracking-tight">Annulation prise en compte</h3>
                <p className="text-[14px] text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
                  Vous recevez un email de confirmation. Notre équipe finalise l'annulation côté Stripe sous 24h.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Réception d'appels — calendar booking ─── */

function ReceptionPanel({ trial, token, onUpdate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
        >
          <PhoneCall className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Service de base · Inclus</div>
          <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 tracking-tight leading-tight">
            Réception d'appels IA 24/7
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-2">
            La base de votre espace BoosterPay : quand vous ne décrochez pas, l'IA répond
            en moins de 2 secondes, qualifie le prospect, prend RDV si c'est chaud, et vous
            envoie un récap par SMS.
          </p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {[
          { icon: Phone, t: 'Numéro virtuel ou transfert', d: 'Vous gardez votre numéro existant ou on vous en fournit un dédié.' },
          { icon: Sparkles, t: 'Voix française naturelle', d: 'Vos clients ne se doutent pas qu\'ils parlent à une IA.' },
          { icon: FileSpreadsheet, t: 'Transcription + résumé IA', d: 'Chaque appel est transcrit, résumé et envoyé dans votre CRM.' },
          { icon: CalendarCheck, t: 'Prise de RDV automatique', d: 'L\'IA propose des créneaux selon votre agenda Google ou Outlook.' },
        ].map((f, i) => (
          <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-start gap-3">
              <f.icon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={2} />
              <div>
                <div className="text-[14px] font-semibold text-gray-900">{f.t}</div>
                <div className="text-[12.5px] text-gray-500 mt-0.5 leading-relaxed">{f.d}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 sm:p-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" strokeWidth={2} />
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-gray-900">
              Ce module nécessite un appel de paramétrage
            </h3>
            <p className="text-[13.5px] text-gray-600 leading-relaxed mt-1">
              Notre équipe configure le transfert d'appel depuis votre opérateur (5 minutes
              au téléphone) puis valide la voix et le script avec vous. C'est rapide et c'est
              ce qui garantit zéro coupure côté client.
            </p>
            <a
              href={CALENDAR_RECEPTION}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              Planifier mon appel de paramétrage
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[12.5px] text-gray-400 text-center">
        En attendant, vous pouvez configurer les autres modules dans la barre latérale →
      </div>
    </div>
  );
}

/* ─── Module panel (5 services contacts) ─── */

function ModulePanel({ module, token, trial, onActivated }) {
  const [tab, setTab] = useState('manual'); // 'manual' | 'csv'
  const [manualRows, setManualRows] = useState([blankRow(module.fields)]);
  const [csvHelpOpen, setCsvHelpOpen] = useState(false);
  const [submitState, setSubmitState] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [submitMsg, setSubmitMsg] = useState('');

  function blankRow(fields) {
    const r = {};
    fields.forEach(f => r[f] = '');
    return r;
  }

  // CSV state
  const [csvFileName, setCsvFileName] = useState('');
  const [csvContacts, setCsvContacts] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvMapping, setCsvMapping] = useState({});
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Reset à chaque changement de module
  useEffect(() => {
    setManualRows([blankRow(module.fields)]);
    setCsvFileName(''); setCsvContacts(null); setCsvHeaders([]); setCsvMapping({});
    setSubmitState('idle'); setSubmitMsg('');
  }, [module.id]); // eslint-disable-line

  // ─── Manual rows ───
  const updateRow = (i, field, value) => {
    const next = [...manualRows];
    next[i] = { ...next[i], [field]: value };
    setManualRows(next);
  };
  const addRow = () => setManualRows([...manualRows, blankRow(module.fields)]);
  const removeRow = (i) => setManualRows(manualRows.length > 1 ? manualRows.filter((_, j) => j !== i) : manualRows);

  const validManualRows = useMemo(() => {
    return manualRows.filter(r => (r.nom && r.nom.trim()) || (r.telephone && r.telephone.trim()));
  }, [manualRows]);

  // ─── CSV ───
  const handleFile = (file) => {
    if (!file) return;
    setCsvFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields || [];
        setCsvHeaders(headers);
        // Auto-map
        const auto = {};
        const norm = h => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        module.fields.forEach(f => {
          const match = headers.find(h => {
            const n = norm(h);
            if (f === 'nom') return n.includes('nom') || n.includes('name') || n.includes('client') || n.includes('prenom');
            if (f === 'telephone') return n.includes('tel') || n.includes('phone') || n.includes('mobile');
            if (f === 'email') return n.includes('mail') || n.includes('email');
            if (f === 'dateRdv' || f === 'dateEcheance') return n.includes('date') || n.includes('rdv') || n.includes('echeance');
            if (f === 'montant') return n.includes('montant') || n.includes('amount') || n.includes('prix');
            if (f === 'refFacture') return n.includes('ref') || n.includes('facture');
            if (f === 'notes') return n.includes('note') || n.includes('comment');
            return false;
          });
          if (match) auto[f] = match;
        });
        setCsvMapping(auto);
        setCsvContacts(res.data);
      },
      error: () => {
        setSubmitState('error');
        setSubmitMsg('Impossible de lire le fichier CSV. Vérifiez le format.');
      }
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const csvMappedContacts = useMemo(() => {
    if (!csvContacts) return [];
    return csvContacts.map(row => {
      const obj = {};
      module.fields.forEach(f => {
        if (csvMapping[f]) obj[f] = String(row[csvMapping[f]] || '').trim();
      });
      return obj;
    }).filter(r => (r.nom && r.nom.trim()) || (r.telephone && r.telephone.trim()));
  }, [csvContacts, csvMapping, module.fields]);

  // ─── Submit ───
  const submit = async () => {
    setSubmitState('sending'); setSubmitMsg('');
    const contacts = tab === 'manual' ? validManualRows : csvMappedContacts;
    // Mapping clés pour back GAS
    const payload = contacts.map(c => ({
      nom: c.nom || '',
      telephone: c.telephone || '',
      email: c.email || '',
      dateRdv: c.dateRdv || c.dateEcheance || '',
      montant: c.montant || '',
      refFacture: c.refFacture || '',
      notes: c.notes || '',
    }));
    if (payload.length === 0) {
      setSubmitState('error');
      setSubmitMsg('Aucun contact valide. Renseignez au moins un nom ou un téléphone.');
      return;
    }
    const res = await injectContacts({ token, module: module.id, contacts: payload });
    if (res.success) {
      setSubmitState('success');
      setSubmitMsg(`${res.inserted} contact${res.inserted > 1 ? 's' : ''} envoyé${res.inserted > 1 ? 's' : ''} à l'IA.`);
      onActivated?.(module.id);
      // Reset après 3s
      setTimeout(() => {
        setManualRows([blankRow(module.fields)]);
        setCsvFileName(''); setCsvContacts(null); setCsvHeaders([]); setCsvMapping({});
        setSubmitState('idle'); setSubmitMsg('');
      }, 4000);
    } else {
      setSubmitState('error');
      setSubmitMsg(res.error || 'Une erreur est survenue. Réessayez.');
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${module.color}15`, border: `1px solid ${module.color}30` }}>
          <module.icon className="w-5 h-5" style={{ color: module.color }} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: module.color }}>Module</div>
          <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-900 tracking-tight leading-tight">{module.label}</h2>
          <p className="text-[14.5px] text-gray-500 leading-relaxed mt-1.5">{module.sub}</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mt-7 inline-flex p-1 rounded-full bg-gray-100 border border-gray-200">
        <button
          onClick={() => setTab('manual')}
          className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all ${
            tab === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Saisie manuelle
        </button>
        <button
          onClick={() => setTab('csv')}
          className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all ${
            tab === 'csv' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Import CSV
        </button>
      </div>

      {/* Manual */}
      {tab === 'manual' && (
        <div className="mt-5">
          <div className="space-y-2.5">
            {manualRows.map((row, i) => (
              <ManualRow
                key={i}
                row={row}
                fields={module.fields}
                onChange={(f, v) => updateRow(i, f, v)}
                onRemove={manualRows.length > 1 ? () => removeRow(i) : null}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter un contact
          </button>
        </div>
      )}

      {/* CSV */}
      {tab === 'csv' && (
        <div className="mt-5 space-y-4">
          {!csvContacts ? (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`p-8 sm:p-10 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-gray-500" strokeWidth={1.8} />
                </div>
                <div className="text-[14.5px] font-semibold text-gray-900">Déposez votre fichier CSV ici</div>
                <div className="text-[12.5px] text-gray-500 mt-1">ou cliquez pour parcourir · CSV uniquement, max 5 Mo</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => setCsvHelpOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-[13px] font-medium text-gray-700">Comment exporter mes contacts en CSV ?</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${csvHelpOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {csvHelpOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <CsvHelp module={module} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <CsvMappingView
              fileName={csvFileName}
              headers={csvHeaders}
              mapping={csvMapping}
              fields={module.fields}
              count={csvMappedContacts.length}
              onChange={setCsvMapping}
              onReset={() => { setCsvFileName(''); setCsvContacts(null); setCsvHeaders([]); setCsvMapping({}); }}
            />
          )}
        </div>
      )}

      {/* Submit */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[13px] text-gray-500">
          {tab === 'manual' ? (
            <>{validManualRows.length} contact{validManualRows.length > 1 ? 's' : ''} à envoyer</>
          ) : csvContacts ? (
            <>{csvMappedContacts.length} contact{csvMappedContacts.length > 1 ? 's' : ''} prêt{csvMappedContacts.length > 1 ? 's' : ''} à envoyer</>
          ) : (
            <>Importez un fichier ou saisissez vos contacts à la main</>
          )}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={submitState === 'sending' || (tab === 'manual' ? validManualRows.length === 0 : csvMappedContacts.length === 0)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${module.color}, ${module.color}dd)`,
            boxShadow: `0 10px 24px -8px ${module.color}55`,
          }}
        >
          {submitState === 'sending' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
          ) : (
            <>Lancer le module <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {submitState === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-800 flex items-center gap-2"
          >
            <Check className="w-4 h-4" strokeWidth={2.4} /> {submitMsg}
          </motion.div>
        )}
        {submitState === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-800 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" /> {submitMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── ManualRow ─── */

function ManualRow({ row, fields, onChange, onRemove }) {
  const labels = {
    nom: 'Nom du client',
    telephone: 'Téléphone',
    email: 'Email',
    dateRdv: 'Date du RDV',
    dateEcheance: 'Date d\'échéance',
    montant: 'Montant (€)',
    refFacture: 'Réf. facture',
    notes: 'Notes',
  };
  const placeholders = {
    nom: 'Marie Dupont',
    telephone: '06 12 34 56 78',
    email: 'marie@exemple.fr',
    dateRdv: '2026-05-12 14:30',
    dateEcheance: '2026-06-15',
    montant: '1200',
    refFacture: 'FAC-2026-001',
    notes: 'Précisions…',
  };

  return (
    <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {fields.map(f => (
          <div key={f}>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {labels[f]}
            </label>
            <input
              type={f === 'email' ? 'email' : 'text'}
              inputMode={f === 'telephone' ? 'tel' : f === 'email' ? 'email' : f === 'montant' ? 'decimal' : 'text'}
              autoComplete="off"
              value={row[f] || ''}
              onChange={(e) => onChange(f, e.target.value)}
              placeholder={placeholders[f]}
              style={{ fontSize: 16 }}
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
            />
          </div>
        ))}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="self-start sm:self-end mt-1 sm:mt-0 p-2.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label="Supprimer la ligne"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ─── CSV mapping view ─── */

function CsvMappingView({ fileName, headers, mapping, fields, count, onChange, onReset }) {
  const labels = {
    nom: 'Nom',
    telephone: 'Téléphone',
    email: 'Email',
    dateRdv: 'Date du RDV',
    dateEcheance: 'Date d\'échéance',
    montant: 'Montant',
    refFacture: 'Réf. facture',
    notes: 'Notes',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-gray-900 truncate">{fileName}</div>
          <div className="text-[12px] text-gray-500">{count} contact{count > 1 ? 's' : ''} détecté{count > 1 ? 's' : ''} sur {headers.length} colonne{headers.length > 1 ? 's' : ''}</div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Mapping des colonnes</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f}>
              <label className="block text-[11.5px] font-medium text-gray-600 mb-1">{labels[f]}</label>
              <select
                value={mapping[f] || ''}
                onChange={(e) => onChange({ ...mapping, [f]: e.target.value })}
                style={{ fontSize: 16 }}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              >
                <option value="">— Ne pas importer —</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CSV help block ─── */

function CsvHelp({ module }) {
  const sampleHeaders = module.fields;
  const headerLine = sampleHeaders.map(f => f).join(',');
  const sampleLine = sampleHeaders.map(f => module.sample[f] || '').join(',');
  const csvText = `${headerLine}\n${sampleLine}`;

  const downloadModel = () => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boosterpay_modele_${module.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="text-[13.5px] font-semibold text-gray-900 mb-3">3 manières d'exporter votre fichier CSV</div>

      <div className="space-y-4 text-[13px] text-gray-600 leading-relaxed">
        <div>
          <div className="font-semibold text-gray-900 mb-1">📊 Depuis Excel ou Google Sheets</div>
          <ol className="list-decimal list-inside space-y-0.5 pl-1">
            <li>Ouvrez votre fichier de contacts</li>
            <li>Fichier → <strong>Enregistrer sous</strong> (Excel) ou <strong>Télécharger</strong> (Sheets)</li>
            <li>Choisissez le format <strong>CSV (.csv)</strong></li>
          </ol>
        </div>

        <div>
          <div className="font-semibold text-gray-900 mb-1">📇 Depuis votre CRM</div>
          <p>La plupart des CRM (HubSpot, Pipedrive, Salesforce, Sellsy, Axonaut, Brevo…) permettent l'export CSV depuis le menu <strong>Contacts → Exporter</strong>.</p>
        </div>

        <div>
          <div className="font-semibold text-gray-900 mb-1">📱 Depuis votre téléphone (contacts)</div>
          <p>iOS : Contacts.app n'exporte pas en CSV nativement. Utilisez <a href="https://www.icloud.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">iCloud.com</a> → Contacts → engrenage → <em>Exporter vCard</em>, puis convertissez en CSV via <a href="https://www.vcardtocsv.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">vcardtocsv.com</a>.</p>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-200/80">
        <div className="text-[12.5px] font-semibold text-gray-900 mb-2">Modèle CSV pour ce module</div>
        <pre className="text-[11.5px] bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto font-mono text-gray-700 whitespace-pre">
{csvText}
        </pre>
        <p className="text-[12px] text-gray-500 mt-2">{module.sampleHelp}</p>
        <button
          type="button"
          onClick={downloadModel}
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Télécharger le modèle
        </button>
      </div>
    </div>
  );
}

/* ─── Splash / Error ─── */

function SplashScreen({ text }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] px-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      </div>
      <div className="text-[14px] text-gray-500">{text}</div>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-rose-600" />
      </div>
      <h1 className="text-[20px] font-semibold text-gray-900">Lien invalide ou expiré</h1>
      <p className="text-[14px] text-gray-500 mt-2 max-w-md">
        {error || 'Ce lien de configuration n\'est plus valide.'} Si vous pensez que c'est une erreur, contactez-nous.
      </p>
      <a
        href={`mailto:contact@booster-pay.com`}
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg transition-all"
      >
        Nous contacter
      </a>
      <a href={`tel:${PHONE_TEL}`} className="mt-3 text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
        ou nous appeler au {PHONE_DISPLAY}
      </a>
    </div>
  );
}
