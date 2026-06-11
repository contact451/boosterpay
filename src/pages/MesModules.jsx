// ─────────────────────────────────────────────────────────────────
//  /espace/modules?id=BP-XXX — Espace de configuration des modules IA
//
//  Layout :
//   - EspaceLayout (sidebar persistante de l'espace)
//   - Dans le main : sub-sidebar 260px avec liste des 6 modules + panneau central
//
//  Modules :
//   1. Réception d'appels IA 24/7  (configuration automatique, pas de contacts)
//   2. Renouvellement de dossiers
//   3. Confirmation de RDV
//   4. Robot IA sur mesure
//   5. Impact Avis (Google Reviews)
//   6. Accélération de paiements (Stripe)
//
//  Chaque module accepte 1+ contacts en saisie manuelle ou import CSV,
//  puis envoie au CRM Apps Script via l'action "injectContacts".
// ─────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCachedAbonne, setCachedAbonne, mergeWithCache, rememberLastCommercantId, getLastCommercantId } from '../services/abonneCache';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall, RefreshCw, CalendarCheck, Bot, Star, Zap,
  ArrowRight, Plus, Trash2, Upload, FileSpreadsheet, MessageCircle, Check,
  ExternalLink, Sparkles, Copy, ChevronRight,
} from 'lucide-react';
import EspaceLayout from '../components/EspaceLayout';

const APPS_SCRIPT_URL = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL
  || 'https://script.google.com/macros/s/AKfycbzVONAGECRMxxx/exec';

// ─────────────────────────────────────────────────────────────────
//  Définitions des 6 modules — couleur Apple soft, icône lucide
// ─────────────────────────────────────────────────────────────────
// Palette unifiée emerald — cohérence visuelle 100% verte (Apple style)
const EMERALD = '#10B981';

const MODULES = [
  {
    id: 'reception-24-7',
    label: "Réception 24/7",
    sub: "L'IA répond et vous envoie le récap",
    icon: PhoneCall,
    color: EMERALD,
    type: 'always-on',
    status: 'actif',
    example: "Vous êtes en RDV. L'IA décroche, qualifie, vous envoie un SMS.",
    description: "Activé par défaut.",
  },
  {
    id: 'renouvellement',
    label: 'Renouvellement',
    sub: "L'IA rappelle pour renouveler contrats",
    icon: RefreshCw,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Contrat Dupont expire dans 30 j. L'IA appelle pour relancer.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'dateEcheance', label: "Date d'échéance", placeholder: '2026-06-15', type: 'date' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
  {
    id: 'confirmation-rdv',
    label: 'Confirmation RDV',
    sub: "L'IA confirme 24 h avant. Plus de no-show.",
    icon: CalendarCheck,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "RDV demain 14 h. L'IA appelle aujourd'hui pour confirmer.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'dateRdv', label: 'Date du RDV', placeholder: '2026-05-12 14:30' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
  {
    id: 'robot-mesure',
    label: 'Robot sur mesure',
    sub: "Une IA dédiée à votre métier sous 7 jours",
    icon: Bot,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Vos 12 questions de pré-diagnostic envoyées par SMS — entraînées sur mesure.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
  {
    id: 'impact-avis',
    label: 'Avis Google',
    sub: "L'IA collecte un avis 24 h après chaque client",
    icon: Star,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Mme Leroy satisfaite. L'IA appelle 24 h après — lien Google direct.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
  {
    id: 'paiements',
    label: 'Accélérer paiements',
    sub: "L'IA relance vos impayés pour vous",
    icon: Zap,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "FAC-2026-001 (1 200 €) en retard 15 j. L'IA relance pour vous.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'montant', label: 'Montant (€)', placeholder: '1200', type: 'number' },
      { key: 'refFacture', label: 'Réf. facture', placeholder: 'FAC-2026-001' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
];

// Helper : convertit un hex en rgba avec alpha
function hexToBg(hex, alpha = 0.12) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─────────────────────────────────────────────────────────────────
export default function MesModules() {
  const navigate = useNavigate();
  const commercantId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const fromUrl = new URLSearchParams(window.location.search).get('id') || '';
    if (fromUrl) return fromUrl;
    // PWA : fallback sur le dernier id mémorisé
    return getLastCommercantId();
  }, []);

  // Si on a récupéré l'id depuis le cache PWA, on met à jour l'URL
  useEffect(() => {
    if (!commercantId) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') !== commercantId) {
      params.set('id', commercantId);
      navigate(`${window.location.pathname}?${params.toString()}${window.location.hash}`, { replace: true });
    }
    rememberLastCommercantId(commercantId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commercantId]);

  const isDemoMode = /TEST|DEMO/i.test(commercantId);

  // ── Initialisation depuis le cache localStorage (affichage IMMEDIAT) ──
  // Avant : chaque navigation entre les pages de l'espace → flash de skeleton
  // → nom et numéro qui réapparaissent. Maintenant : on lit le cache au mount.
  const cachedAbonne = !isDemoMode ? getCachedAbonne(commercantId) : null;
  const [nomCommerce, setNomCommerce] = useState(
    isDemoMode ? 'Garage Dupont' : (cachedAbonne?.nom_commerce || '')
  );
  const [numeroVirtuel, setNumeroVirtuel] = useState(
    isDemoMode ? '+33489316691' : (cachedAbonne?.numero_virtuel || '')
  );
  const [mobilePerso, setMobilePerso] = useState(
    isDemoMode ? '+33612345678' : (cachedAbonne?.mobile_perso || '')
  );

  // Hydrate les données fresh depuis la sheet via getEspaceAbonne.
  // Background refresh — n'écrase pas l'affichage si la valeur fresh est vide.
  useEffect(() => {
    if (!commercantId || isDemoMode) return;
    const apiUrl = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';
    if (!apiUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getEspaceAbonne', commercant_id: commercantId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.ok && json.espace) {
          // Merge fresh + cache pour ne pas vider des champs en transition
          const merged = mergeWithCache(commercantId, json.espace);
          setCachedAbonne(commercantId, merged);
          if (merged.nom_commerce) setNomCommerce(merged.nom_commerce);
          if (merged.numero_virtuel) setNumeroVirtuel(merged.numero_virtuel);
        }
      } catch (_e) {
        // silent — le cache reste affiché
      }
    })();
    return () => { cancelled = true; };
  }, [commercantId, isDemoMode]);

  const [activeId, setActiveId] = useState(MODULES[0].id); // Réception 24/7 par défaut (always-on, premier vue client)

  // Si arrivée avec ancre #communiquer (depuis CTA Bienvenue), force la sélection
  // du module Réception 24/7 et scroll en douceur vers la section checklist.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#communiquer') {
      setActiveId(MODULES[0].id);
      // Attendre que le composant soit rendu puis scroller
      const t = setTimeout(() => {
        const el = document.getElementById('communiquer');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(t);
    }
  }, []);
  const [tab, setTab] = useState('manuelle'); // 'manuelle' | 'csv'
  const [contactsByModule, setContactsByModule] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [doneFor, setDoneFor] = useState(null); // module id qui vient d'être envoyé

  const active = MODULES.find((m) => m.id === activeId) || MODULES[0];
  const contacts = contactsByModule[activeId] || [{}];
  const validCount = contacts.filter((c) =>
    (c.nom && c.nom.trim()) || (c.telephone && c.telephone.trim())
  ).length;

  function setField(idx, key, value) {
    setContactsByModule((prev) => {
      const cur = prev[activeId] || [{}];
      const next = cur.map((c, i) => (i === idx ? { ...c, [key]: value } : c));
      return { ...prev, [activeId]: next };
    });
  }

  function addRow() {
    setContactsByModule((prev) => {
      const cur = prev[activeId] || [{}];
      return { ...prev, [activeId]: [...cur, {}] };
    });
  }

  function removeRow(idx) {
    setContactsByModule((prev) => {
      const cur = prev[activeId] || [{}];
      const next = cur.filter((_, i) => i !== idx);
      return { ...prev, [activeId]: next.length ? next : [{}] };
    });
  }

  async function handleLaunch() {
    if (submitting || validCount === 0) return;
    setSubmitting(true);
    const valids = contacts.filter((c) =>
      (c.nom && c.nom.trim()) || (c.telephone && c.telephone.trim())
    );
    try {
      if (!isDemoMode && commercantId) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'injectContacts',
            commercant_id: commercantId,
            module_id: activeId,
            contacts: valids,
          }),
        });
      } else {
        // Mode démo : simule un délai
        await new Promise((r) => setTimeout(r, 800));
      }
      setDoneFor(activeId);
      setContactsByModule((prev) => ({ ...prev, [activeId]: [{}] }));
      setTimeout(() => setDoneFor(null), 4000);
    } catch (err) {
      console.error('[MesModules] launch failed', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <EspaceLayout nomCommerce={nomCommerce} commercantId={commercantId} activeSection="modules">
      <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">

          {/* Titre de la section */}
          <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-emerald-700 mb-2">Modules</p>
              <h1 className="text-[26px] md:text-[30px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight">
                Vos modules IA
              </h1>
              <p className="text-[14px] text-gray-600 mt-1.5" style={{ maxWidth: '640px' }}>
                Activez plus de capacités à la demande.
              </p>
            </div>
            {/* Statut global : modules actifs */}
            <div
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 6px 14px rgba(16,185,129,0.30)',
                }}
              >
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-gray-900 leading-tight">
                  {MODULES.filter((m) => m.status === 'actif').length} module actif
                  <span className="text-gray-400 font-medium"> · {MODULES.length - MODULES.filter((m) => m.status === 'actif').length} disponibles</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Activez-en plus pour automatiser davantage</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 md:gap-7">

            {/* ════ SUB-SIDEBAR : liste des 6 modules ════ */}
            <aside>
              <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-3 px-1">Modules</p>
              <ul className="space-y-2">
                {MODULES.map((m) => {
                  const isActive = m.id === activeId;
                  const isSelected = isActive;
                  const isModuleActif = m.status === 'actif';
                  const Icon = m.icon;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => { setActiveId(m.id); setTab('manuelle'); }}
                        className="relative w-full text-left flex items-start gap-3 p-3 rounded-2xl transition-all duration-200"
                        style={{
                          background: isSelected ? '#FFFFFF' : 'transparent',
                          border: isSelected
                            ? `1.5px solid ${isModuleActif ? 'rgba(16,185,129,0.45)' : '#D1D5DB'}`
                            : '1px solid transparent',
                          boxShadow: isSelected
                            ? (isModuleActif
                                ? '0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 20px rgba(16,185,129,0.10), 0 2px 6px rgba(0,0,0,0.04)'
                                : '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)')
                            : 'none',
                          opacity: !isSelected && !isModuleActif ? 0.78 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Icône module : pleine emerald si actif, contour pour inactif */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isModuleActif
                              ? 'linear-gradient(135deg, #10B981, #059669)'
                              : '#F3F4F6',
                            boxShadow: isModuleActif
                              ? '0 6px 14px rgba(16,185,129,0.30)'
                              : 'none',
                          }}
                        >
                          <Icon
                            className="w-4 h-4"
                            strokeWidth={2.4}
                            style={{ color: isModuleActif ? '#FFFFFF' : '#9CA3AF' }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <p className="text-[13.5px] font-semibold text-gray-900 leading-tight">
                              {m.label}
                            </p>
                            {isModuleActif && (
                              <span
                                className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold"
                                style={{ background: '#F0FDF4', color: '#059669' }}
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                Actif
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] text-gray-500 leading-snug">{m.sub}</p>
                        </div>
                        {/* Chevron Apple iOS : signale qu'on peut sélectionner */}
                        {!isSelected && (
                          <ChevronRight
                            className="w-4 h-4 flex-shrink-0 self-center"
                            color="#D1D5DB"
                            strokeWidth={2.2}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* "Besoin d'aide" retiré (redondant avec sidebar globale + footer page) */}
            </aside>

            {/* ════ PANNEAU CENTRAL : module sélectionné ════ */}
            <AnimatePresence mode="wait">
              <motion.section
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-3xl p-6 md:p-9"
                style={{
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header du module — ultra épuré : icône fine + label + exemple inline */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: active.status === 'actif'
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : hexToBg(active.color, 0.12),
                      boxShadow: active.status === 'actif' ? '0 8px 20px rgba(16,185,129,0.30)' : 'none',
                    }}
                  >
                    <active.icon
                      className="w-5 h-5"
                      strokeWidth={2.4}
                      style={{ color: active.status === 'actif' ? '#FFFFFF' : active.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className="font-bold text-gray-900 tracking-[-0.025em] leading-tight"
                      style={{ fontSize: 'clamp(18px, 2vw, 22px)' }}
                    >
                      {active.label}
                    </h2>
                    {/* Sub-titre = exemple concret en une ligne (au lieu de la card emerald séparée) */}
                    <p className="text-[13.5px] text-gray-500 mt-1 leading-snug">
                      {active.example || active.sub}
                    </p>
                  </div>
                </div>

                {/* Toast succès */}
                <AnimatePresence>
                  {doneFor === active.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5 rounded-xl px-4 py-3 inline-flex items-center gap-2 text-[13.5px] font-semibold"
                      style={{ background: hexToBg(active.color, 0.10), color: active.color }}
                    >
                      <Check className="w-4 h-4" strokeWidth={2.6} />
                      Contacts envoyés. L'IA va prendre le relais.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Si module always-on (Réception 24/7) : pas de form, juste un état */}
                {active.type === 'always-on' ? (
                  <AlwaysOnPanel
                    module={active}
                    numeroVirtuel={numeroVirtuel}
                    mobilePerso={mobilePerso}
                    commercantId={commercantId}
                    nomCommerce={nomCommerce}
                  />
                ) : (
                  <>
                    {/* Tabs Saisie manuelle / Import CSV — emerald plein pour l'actif */}
                    <div className="inline-flex items-center gap-2 mb-6">
                      <TabButton active={tab === 'manuelle'} onClick={() => setTab('manuelle')}>Saisie manuelle</TabButton>
                      <TabButton active={tab === 'csv'} onClick={() => setTab('csv')}>Import CSV</TabButton>
                    </div>

                    {tab === 'manuelle' ? (
                      <ManualForm
                        module={active}
                        contacts={contacts}
                        setField={setField}
                        addRow={addRow}
                        removeRow={removeRow}
                      />
                    ) : (
                      <CsvImport module={active} />
                    )}

                    {/* Footer : compteur + bouton Lancer + texte explicatif si désactivé */}
                    <div className="mt-8 pt-5 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="text-[13px] text-gray-500">
                          {validCount} contact{validCount > 1 ? 's' : ''} à envoyer
                        </span>
                        <button
                          type="button"
                          onClick={handleLaunch}
                          disabled={validCount === 0 || submitting}
                          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-bold text-[14.5px] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: validCount > 0
                              ? `linear-gradient(135deg, ${active.color}, ${active.color}DD)`
                              : `linear-gradient(135deg, ${hexToBg(active.color, 0.45)}, ${hexToBg(active.color, 0.35)})`,
                            boxShadow: validCount > 0 ? `0 12px 28px -6px ${hexToBg(active.color, 0.45)}` : 'none',
                          }}
                        >
                          {submitting ? 'Envoi en cours…' : (
                            <>
                              Lancer le module
                              <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
                            </>
                          )}
                        </button>
                      </div>
                      {validCount === 0 && !submitting && (
                        <p className="mt-3 text-right text-[12.5px] text-gray-400">
                          Ajoutez au moins 1 contact pour lancer le module.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </motion.section>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </EspaceLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-all duration-150"
      style={{
        background: active ? '#10B981' : '#F3F4F6',
        color: active ? '#FFFFFF' : '#6B7280',
        boxShadow: active ? '0 4px 12px -2px rgba(16, 185, 129, 0.35)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
function ManualForm({ module: m, contacts, setField, addRow, removeRow }) {
  const fields = m.fields || [];
  return (
    <div className="space-y-5">
      {contacts.map((contact, idx) => (
        <div
          key={idx}
          className="relative rounded-2xl p-5"
          style={{ background: '#FAFBFC', border: '1px solid #EEF0F4' }}
        >
          {contacts.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Supprimer ce contact"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
            </button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={contact[f.key] || ''}
                onChange={(v) => setField(idx, f.key, v)}
                fullWidth={f.cols === 1}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
        Ajouter un contact
      </button>
    </div>
  );
}

function FieldInput({ field, value, onChange, fullWidth }) {
  return (
    <label className={`block ${fullWidth ? 'sm:col-span-3' : ''}`}>
      <div className="text-[13px] font-medium mb-1.5" style={{ color: '#374151', letterSpacing: 0 }}>
        {field.label}
      </div>
      <input
        type={field.type === 'date' || field.type === 'number' ? 'text' : field.type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3.5 py-2.5 rounded-[10px] bg-white text-[14px] text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none"
        style={{
          border: '1.5px solid #E5E7EB',
          fontSize: 16,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#10B981';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.10)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────
function CsvImport({ module: m }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ background: '#FAFBFC', border: '2px dashed #D1D5DB' }}
    >
      <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: hexToBg(m.color, 0.12) }}>
        <FileSpreadsheet className="w-5 h-5" strokeWidth={2.2} style={{ color: m.color }} />
      </div>
      <p className="text-[15px] font-semibold text-gray-900 mb-1">Importez votre fichier CSV</p>
      <p className="text-[12.5px] text-gray-500 mb-5 leading-relaxed">
        Colonnes attendues : {m.fields?.filter(f => f.required).map(f => f.label.toLowerCase()).join(', ')}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[13.5px] text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <Upload className="w-3.5 h-3.5" strokeWidth={2.4} />
        Choisir un fichier
      </button>
      {fileName && (
        <p className="mt-3 text-[12.5px] text-emerald-700 font-semibold">{fileName}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
//  AlwaysOnPanel — module Réception d'appels IA 24/7 (premium Apple)
//  Affiche le numéro dédié + schéma de transfert d'appel + checklist
//  gamifiée pour communiquer le nouveau numéro à ses clients.
// ─────────────────────────────────────────────────────────────────

const EMERALD_COLOR = '#10B981';
const EMERALD_DARK = '#059669';

function formatPhoneFR(e164) {
  if (!e164) return '';
  const m = String(e164).match(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (m) return `+33 ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
  return e164;
}

// Checklist de communication du numéro pro
const COMM_CHECKLIST = [
  {
    id: 'google_business',
    title: 'Mettre à jour votre fiche Google Business',
    description: "Remplacez l'ancien numéro par votre numéro BoosterPay. Vos clients vous trouveront via ce numéro.",
    cta: 'Ouvrir Google Business',
    href: 'https://business.google.com/',
  },
  {
    id: 'signature_email',
    title: 'Ajouter à votre signature email',
    description: 'Chaque email envoyé indique votre nouveau numéro pro. Aucune perte de contact.',
    cta: 'Voir comment faire',
    href: 'https://support.google.com/mail/answer/8395?hl=fr',
  },
  {
    id: 'site_web',
    title: 'Mettre à jour votre site web',
    description: "Page contact, footer, en-tête : remplacez l'ancien numéro partout. Les visiteurs appellent le bon.",
    cta: 'Marquer comme fait',
  },
  {
    id: 'reseaux_sociaux',
    title: 'Mettre à jour vos réseaux sociaux',
    description: "Facebook, Instagram, LinkedIn : le numéro doit être à jour pour qu'on vous joigne facilement.",
    cta: 'Marquer comme fait',
  },
  {
    id: 'cartes_visite',
    title: 'Imprimer de nouvelles cartes de visite',
    description: 'Distribuez votre nouveau numéro à chaque RDV. Les clients vous appellent dessus directement.',
    cta: 'Commander sur Moo',
    href: 'https://www.moo.com/fr/products/business-cards.html',
  },
  {
    id: 'vehicule',
    title: 'Floquer le véhicule professionnel',
    description: "Stickers ou impression vinyle sur votre voiture/camionnette. Visibilité maximum, prospects à l'arrêt.",
    cta: 'Marquer comme fait',
  },
];

function AlwaysOnPanel({ module: m, numeroVirtuel, mobilePerso, commercantId }) {
  const [copyStatus, setCopyStatus] = useState('idle');
  const [checked, setChecked] = useState({});

  const storageKey = commercantId ? `bp_comm_checklist_${commercantId}` : '';

  // Hydrate la checklist depuis localStorage (par commerçant)
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch (_e) {}
  }, [storageKey]);

  // Persiste la checklist
  function toggleCheck(id) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        if (storageKey) window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (_e) {}
      return next;
    });
  }

  const numeroAffichable = formatPhoneFR(numeroVirtuel);
  const checkedCount = COMM_CHECKLIST.filter((it) => checked[it.id]).length;
  const totalCount = COMM_CHECKLIST.length;
  const progressPct = Math.round((checkedCount / totalCount) * 100);

  async function copyNumero() {
    if (!numeroVirtuel) return;
    try {
      await navigator.clipboard.writeText(numeroVirtuel);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2200);
    } catch (_e) {}
  }

  return (
    <div className="space-y-8">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  1. Card numéro dédié (STAR de la page)                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative rounded-[28px] p-8 md:p-10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #ECFDF5 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.40)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 48px rgba(16, 185, 129, 0.16), 0 4px 12px rgba(16, 185, 129, 0.08)',
        }}
      >
        {/* Glow décoratif top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-[340px] h-[340px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)',
            transform: 'translate(40%, -40%)',
          }}
        />
        {/* Glow décoratif bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-[220px] h-[220px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 70%)',
            transform: 'translate(-40%, 40%)',
          }}
        />

        <div className="relative flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: '#FFFFFF',
                  color: EMERALD_DARK,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
                }}>
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: EMERALD_COLOR }} />
            </span>
            En ligne · 24/7
          </span>
        </div>

        <p className="relative text-[12.5px] font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">
          Votre numéro BoosterPay
        </p>

        <div className="relative flex items-baseline gap-4 flex-wrap">
          {numeroVirtuel ? (
            <>
              <div
                className="font-bold text-gray-900 leading-none tracking-tight"
                style={{
                  fontSize: 'clamp(32px, 5.5vw, 48px)',
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: '-0.025em',
                }}
              >
                {numeroAffichable}
              </div>
              <button
                type="button"
                onClick={copyNumero}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200"
                style={{
                  background: copyStatus === 'copied'
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFFFFF',
                  boxShadow: copyStatus === 'copied'
                    ? '0 6px 16px rgba(16,185,129,0.50), 0 2px 4px rgba(0,0,0,0.06)'
                    : '0 8px 20px rgba(16,185,129,0.40), 0 2px 6px rgba(0,0,0,0.06)',
                  transform: copyStatus === 'copied' ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (copyStatus !== 'copied') e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  if (copyStatus !== 'copied') e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {copyStatus === 'copied' ? (
                  <><Check className="w-4 h-4" strokeWidth={3} /> Numéro copié</>
                ) : (
                  <><Copy className="w-4 h-4" strokeWidth={2.6} /> Copier le numéro</>
                )}
              </button>
            </>
          ) : (
            <PhoneNumberSkeleton />
          )}
        </div>

        <p className="relative text-[13.5px] text-gray-700 mt-4 leading-relaxed max-w-2xl">
          C'est votre <strong className="text-gray-900">nouveau numéro professionnel</strong>.
          Communiquez-le partout (Google Business, site, signature, voiture…) — c'est lui qui décroche vos clients à votre place quand vous êtes occupé.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  2. Schéma transfert d'appel                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        className="rounded-[28px] p-8 md:p-10"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">
          Comment ça fonctionne
        </p>
        <h3 className="text-[22px] md:text-[26px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight mb-2">
          De l'appel client à la réponse
        </h3>
        <p className="text-[13.5px] text-gray-500 leading-relaxed mb-8 max-w-2xl">
          Votre client appelle votre nouveau numéro BoosterPay. Vous êtes alerté(e) sur votre mobile. Si vous ne décrochez pas en 10 secondes, votre IA prend le relais, qualifie l'appel et vous envoie le récap.
        </p>

        <CallFlowDiagram numeroVirtuel={numeroAffichable} />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  3. Checklist communication (gamifiée)                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        id="communiquer"
        className="rounded-[28px] p-8 md:p-10 scroll-mt-8"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-[0.10em] mb-2.5"
              style={{
                background: 'rgba(16,185,129,0.10)',
                color: EMERALD_DARK,
                border: '1px solid rgba(16,185,129,0.22)',
              }}
            >
              <Sparkles className="w-3 h-3" strokeWidth={2.8} />
              Étape suivante
            </div>
            <h3 className="text-[22px] md:text-[26px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight mb-1">
              Communiquez votre numéro
            </h3>
          </div>
          {checkedCount === 0 ? (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-bold"
              style={{
                background: 'rgba(16,185,129,0.10)',
                color: EMERALD_DARK,
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.6} />
              Commençons
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Progression</div>
                <div className="text-[16px] font-extrabold tabular-nums text-gray-900">
                  {checkedCount} <span className="text-gray-300">/ {totalCount}</span>
                </div>
              </div>
              {/* Cercle progress */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" stroke={EMERALD_COLOR} strokeWidth="4"
                    strokeDasharray={`${(progressPct / 100) * 125.66} 125.66`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-900 tabular-nums">
                  {progressPct}%
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-[13.5px] text-gray-500 leading-relaxed mb-7 max-w-2xl">
          {checkedCount === 0 ? (
            <>Commencez par <strong className="text-gray-900">l'étape 1</strong> — 5 minutes max. Chaque action installée = un canal de plus où vos clients vous trouvent.</>
          ) : checkedCount === totalCount ? (
            <>Bravo. Vos clients vont automatiquement utiliser votre nouveau numéro. Votre IA gère le reste.</>
          ) : (
            <><strong className="text-gray-900">{totalCount - checkedCount} action{(totalCount - checkedCount) > 1 ? 's' : ''}</strong> restantes pour finaliser votre déploiement. Continuez sur votre lancée.</>
          )}
        </p>

        <ul className="space-y-2.5">
          {COMM_CHECKLIST.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              done={!!checked[item.id]}
              onToggle={() => toggleCheck(item.id)}
            />
          ))}
        </ul>

        {progressPct === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-7 rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, rgba(16,185,129,0.08) 100%)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: EMERALD_COLOR, boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}
            >
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-gray-900 leading-tight">Bien joué — communication maîtrisée.</p>
              <p className="text-[13px] text-gray-600 mt-1">Vos clients vont automatiquement utiliser votre nouveau numéro. Votre IA gère le reste.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  Personnaliser mon IA — précisions custom envoyées à n8n     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <PersonnaliserMonIA commercantId={commercantId} />

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PersonnaliserMonIA — section dans MesModules > Réception 24/7
//
//  Le pro saisit des précisions custom (services, prix indicatifs,
//  contraintes...) qui sont injectées dans son prompt IA. Sync
//  immédiate via le webhook n8n.
// ─────────────────────────────────────────────────────────────────
function PersonnaliserMonIA({ commercantId }) {
  const [precisions, setPrecisions] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const apiUrl = import.meta.env.VITE_VONAGE_CRM_APPS_SCRIPT_URL || '';

  // Fetch initial : récupère les précisions + info catégorie
  useEffect(() => {
    if (!commercantId || !apiUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getIAPromptInfo', commercant_id: commercantId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json && json.ok) {
          setInfo(json);
          setPrecisions(json.precisions || '');
        }
      } catch (_e) {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [commercantId, apiUrl]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateIAPrecisions',
          commercant_id: commercantId,
          precisions: precisions,
        }),
      });
      const json = await res.json();
      if (json && json.ok) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2400);
      } else {
        setErrorMsg((json && json.error) || 'Erreur inconnue');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Réseau indisponible');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 md:p-7" style={{ border: '1px solid #F3F4F6' }}>
        <div className="bp-stat-skel h-5 w-40 rounded mb-3" />
        <div className="bp-stat-skel h-24 w-full rounded" />
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl bg-white p-6 md:p-8"
      style={{
        border: '1px solid #F3F4F6',
        boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 14px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 6px 14px rgba(16,185,129,0.30)',
          }}
        >
          <Sparkles className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Personnaliser mon IA
          </h3>
          <p className="text-[13px] text-gray-500 mt-0.5 leading-snug">
            Ajoutez vos spécificités. L'IA s'y adapte instantanément.
          </p>
        </div>
      </div>

      {/* Sub-info catégorie */}
      {info && info.category_label && (
        <p className="text-[11.5px] font-bold tracking-[0.10em] uppercase text-emerald-700 mb-3">
          Modèle de base · {info.category_label}
        </p>
      )}

      {/* Textarea */}
      <textarea
        value={precisions}
        onChange={(e) => setPrecisions(e.target.value.slice(0, 1500))}
        placeholder="Exemples : Tarif intervention 80€, déplacement Quimper et 20 km autour, urgences acceptées 7j/7 jusqu'à 22h, pas de chauffage électrique…"
        rows={5}
        className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
        style={{
          border: '1px solid #E5E7EB',
          fontSize: 16, /* anti-zoom iOS */
          color: '#0F172A',
          caretColor: '#10B981',
        }}
        maxLength={1500}
      />

      <div className="flex items-center justify-between mt-2 mb-5 text-[11.5px]">
        <p className="text-gray-400">
          Effectif dès la sauvegarde.
        </p>
        <p className="tabular-nums text-gray-400">
          {precisions.length}/1500
        </p>
      </div>

      {/* Bouton submit */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-bold transition-transform active:scale-[0.98] disabled:opacity-60"
        style={{
          background: '#0F172A',
          color: 'white',
          boxShadow: '0 6px 20px rgba(15,23,42,0.30), 0 2px 6px rgba(0,0,0,0.06)',
        }}
      >
        {saving ? (
          'Mise à jour…'
        ) : savedFlash ? (
          <>
            <Check size={16} strokeWidth={2.8} />
            IA mise à jour
          </>
        ) : (
          <>
            Mettre à jour mon IA
            <ArrowRight size={16} strokeWidth={2.6} />
          </>
        )}
      </button>

      {errorMsg && (
        <div
          className="mt-3 rounded-xl px-3 py-2 text-center text-[12.5px] font-medium"
          style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid rgba(220,38,38,0.20)' }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Schéma SVG du flow d'appel (client → numéro dédié → mobile → IA)
// Style Apple : minimal, lignes claires, animations subtiles
// ─────────────────────────────────────────────────────────────────
function CallFlowDiagram({ numeroVirtuel }) {
  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3 md:gap-6 items-start">

        {/* ÉTAPE 1 : Client */}
        <FlowNode
          step="1"
          title="Votre client"
          subtitle="Compose votre numéro"
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          }
          accent="#6B7280"
        />

        {/* ÉTAPE 2 : Numéro BoosterPay (au centre, mis en valeur) */}
        <FlowNode
          step="2"
          title="Votre numéro BoosterPay"
          subtitle={numeroVirtuel || 'Numéro dédié'}
          highlight
          icon={
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          }
          accent={EMERALD_COLOR}
        />

        {/* ÉTAPE 3 : Votre mobile */}
        <FlowNode
          step="3"
          title="Votre mobile"
          subtitle="Sonne 10 secondes"
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
              <line x1="12" y1="18" x2="12" y2="18.01"/>
            </svg>
          }
          accent="#6B7280"
        />
      </div>

      {/* Flèches entre étapes (animées) */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mt-3 mb-5">
        <div className="flex justify-end pr-2 md:pr-0">
          <FlowArrow />
        </div>
        <div className="flex justify-end pr-2 md:pr-0">
          <FlowArrow />
        </div>
        <div />
      </div>

      {/* Bloc IA fallback — moment-clé du schéma, fond emerald plus marqué */}
      <div className="relative rounded-[20px] p-5 md:p-6 mt-1"
           style={{
             background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)',
             border: '1.5px solid rgba(16,185,129,0.30)',
             boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 10px 24px rgba(16,185,129,0.12)',
           }}>
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: EMERALD_COLOR, boxShadow: '0 6px 18px rgba(16,185,129,0.3)' }}
          >
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-emerald-700">Sans réponse de votre part</p>
            </div>
            <p className="text-[15px] font-bold text-gray-900 leading-tight">Votre IA prend le relais</p>
            <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
              Elle décroche, parle à votre client, qualifie sa demande, et vous envoie un récap SMS+email. Vous rappelez quand vous voulez — un client qualifié vous attend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ step, title, subtitle, icon, accent, highlight }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="relative rounded-[20px] flex items-center justify-center"
        style={{
          // Le node central (highlight=true) est plus grand et en gradient emerald solide
          width: highlight ? '88px' : '64px',
          height: highlight ? '88px' : '64px',
          background: highlight
            ? `linear-gradient(135deg, ${accent} 0%, #059669 100%)`
            : 'rgba(243, 244, 246, 0.7)',
          border: highlight ? `none` : '1px solid #E5E7EB',
          boxShadow: highlight
            ? `0 1px 0 rgba(255,255,255,0.4) inset, 0 16px 32px -8px ${accent}60, 0 0 0 6px ${accent}10`
            : '0 1px 2px rgba(0,0,0,0.03)',
          color: highlight ? '#FFFFFF' : '#6B7280',
        }}
      >
        {icon}
        {highlight && (
          <span
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              color: accent,
              border: `1.5px solid ${accent}`,
              boxShadow: `0 6px 14px ${accent}40`,
            }}
          >
            {step}
          </span>
        )}
      </div>
      <p
        className="font-bold text-gray-900 mt-3 leading-tight"
        style={{
          fontSize: highlight ? '13.5px' : '12.5px',
        }}
      >
        {title}
      </p>
      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight" style={{ fontFeatureSettings: '"tnum"' }}>
        {subtitle}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <>
      <style>{`
        @keyframes bpArrowGlide {
          0%, 100% { transform: translateX(0); opacity: 0.55; }
          50%      { transform: translateX(6px); opacity: 1; }
        }
        .bp-arrow {
          animation: bpArrowGlide 2s ease-in-out infinite;
        }
      `}</style>
      <svg
        width="56" height="16" viewBox="0 0 56 16" fill="none"
        className="bp-arrow"
        style={{ color: '#10B981' }}
        aria-hidden
      >
        {/* Ligne continue (subtile dégradée) */}
        <defs>
          <linearGradient id="bpFlowGrad" x1="0" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path d="M0 8 L48 8" stroke="url(#bpFlowGrad)" strokeWidth="2" strokeLinecap="round" />
        {/* Pointe de flèche */}
        <path d="M44 3 L52 8 L44 13" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton loader pour le numéro et le bouton — affichage premium
// pendant le chargement async (évite le tiret "—" déprimant)
// ─────────────────────────────────────────────────────────────────
function PhoneNumberSkeleton() {
  return (
    <>
      <style>{`
        @keyframes bpShimmer {
          0%   { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .bp-skel {
          background: linear-gradient(
            90deg,
            rgba(16,185,129,0.08) 0%,
            rgba(16,185,129,0.18) 50%,
            rgba(16,185,129,0.08) 100%
          );
          background-size: 400px 100%;
          animation: bpShimmer 1.6s linear infinite;
        }
      `}</style>
      <div className="flex items-baseline gap-4 flex-wrap">
        <div
          className="bp-skel rounded-xl"
          style={{
            width: 'clamp(220px, 30vw, 320px)',
            height: 'clamp(36px, 6vw, 52px)',
          }}
          aria-hidden
        />
        <div
          className="bp-skel rounded-[12px]"
          style={{ width: '170px', height: '42px' }}
          aria-hidden
        />
      </div>
      <p className="text-[11px] text-emerald-700/70 mt-2 font-medium">
        Activation de votre numéro en cours…
      </p>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Item de checklist avec validation animée Apple-style
// ─────────────────────────────────────────────────────────────────
function ChecklistItem({ item, done, onToggle }) {
  return (
    <li>
      <div
        className="group rounded-2xl p-4 transition-all duration-200"
        style={{
          background: done ? 'rgba(16,185,129,0.05)' : '#FFFFFF',
          border: `1px solid ${done ? 'rgba(16,185,129,0.25)' : '#E5E7EB'}`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Checkbox custom Apple-style — bordure douce inactive, gradient emerald + checkmark animé au check */}
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={done}
            aria-label={done ? 'Décocher cette étape' : 'Marquer cette étape comme faite'}
            className="bp-checkbox flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: done
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : '#FFFFFF',
              border: done
                ? '1.5px solid #10B981'
                : '1.5px solid #D1D5DB',
              boxShadow: done
                ? '0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 14px rgba(16,185,129,0.42), 0 2px 4px rgba(16,185,129,0.18)'
                : '0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (!done) {
                e.currentTarget.style.borderColor = '#10B981';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.10)';
              }
            }}
            onMouseLeave={(e) => {
              if (!done) {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
              }
            }}
          >
            {/* Checkmark SVG animé — strokeDasharray pour draw */}
            <svg
              width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{
                opacity: done ? 1 : 0,
                transform: done ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              aria-hidden
            >
              <path
                d="M3 8.5 L6.5 12 L13 4.5"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                  strokeDasharray: 18,
                  strokeDashoffset: done ? 0 : 18,
                  transition: 'stroke-dashoffset 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s',
                }}
              />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <p
              className="text-[14.5px] font-semibold leading-snug"
              style={{
                color: done ? '#6B7280' : '#111827',
                textDecoration: done ? 'line-through' : 'none',
                textDecorationColor: 'rgba(16,185,129,0.5)',
                textDecorationThickness: '1.5px',
              }}
            >
              {item.title}
            </p>
            <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">
              {item.description}
            </p>
            {!done && (item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.stopPropagation(); }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  color: EMERALD_COLOR,
                  border: `1.5px solid ${EMERALD_COLOR}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = EMERALD_COLOR;
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(16,185,129,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = EMERALD_COLOR;
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                }}
              >
                {item.cta || 'Ouvrir'}
                <ExternalLink className="w-3 h-3" strokeWidth={2.6} />
              </a>
            ) : (
              // "Marquer comme fait" — différencié des liens externes :
              // coche EN PREMIER (à gauche), fond blanc, pas de bordure colorée,
              // accent ghost emerald — signal d'action interne.
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  color: EMERALD_DARK,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                  style={{ background: EMERALD_COLOR }}
                  aria-hidden
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.2} />
                </span>
                {item.cta || 'Marquer comme fait'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
