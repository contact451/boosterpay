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
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall, RefreshCw, CalendarCheck, Bot, Star, Zap,
  ArrowRight, Plus, Trash2, Upload, FileSpreadsheet, MessageCircle, Check,
  ExternalLink, Sparkles,
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
    label: "Réception d'appels IA 24/7",
    sub: "La base : l'IA répond, qualifie, vous envoie le lead",
    icon: PhoneCall,
    color: EMERALD,
    type: 'always-on',
    status: 'actif',
    example: "Ex : Un client appelle pendant que vous êtes en rendez-vous. L'IA décroche, qualifie sa demande et vous envoie un récap SMS.",
    description: "Activé par défaut. L'IA décroche quand vous ne pouvez pas répondre, qualifie le besoin, et vous envoie le récap par SMS et email.",
  },
  {
    id: 'renouvellement',
    label: 'Renouvellement de dossiers',
    sub: "L'IA rappelle vos clients pour renouveler contrats, abonnements, prestations",
    icon: RefreshCw,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Ex : Votre client Dupont a un contrat qui expire dans 30 jours. L'IA l'appelle automatiquement pour proposer le renouvellement.",
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
    label: 'Confirmation de RDV',
    sub: "L'IA confirme chaque RDV 24h avant. Plus de no-show.",
    icon: CalendarCheck,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Ex : Vous avez un RDV demain à 14h avec M. Martin. L'IA l'appelle aujourd'hui pour confirmer ou reporter si besoin.",
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
    label: 'Robot IA sur mesure',
    sub: "On entraîne un robot dédié à votre métier en moins d'une semaine",
    icon: Bot,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Ex : Vous voulez une IA qui pose vos 12 questions de pré-diagnostic et envoie le formulaire par SMS — on l'entraîne sur mesure.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
  {
    id: 'impact-avis',
    label: 'Impact Avis',
    sub: "L'IA appelle vos clients satisfaits pour un avis Google",
    icon: Star,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Ex : Mme Leroy vient de récupérer sa voiture, satisfaite. L'IA l'appelle 24h après pour solliciter un avis Google avec lien direct.",
    fields: [
      { key: 'nom', label: 'Nom du client', placeholder: 'Marie Dupont', required: true },
      { key: 'telephone', label: 'Téléphone', placeholder: '06 12 34 56 78', required: true, type: 'tel' },
      { key: 'email', label: 'Email', placeholder: 'marie@exemple.fr', type: 'email' },
      { key: 'notes', label: 'Notes', placeholder: 'Précisions…', cols: 1 },
    ],
  },
  {
    id: 'paiements',
    label: 'Accélération de paiements',
    sub: "L'IA rappelle vos impayés et accélère vos délais de paiement",
    icon: Zap,
    color: EMERALD,
    type: 'contacts',
    status: 'pret',
    example: "Ex : La facture FAC-2026-001 (1 200 €) est en retard de 15 jours. L'IA appelle votre client pour rappeler l'impayé et le motiver à régler rapidement.",
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
    return new URLSearchParams(window.location.search).get('id') || '';
  }, []);

  const isDemoMode = /TEST|DEMO/i.test(commercantId);
  const [nomCommerce, setNomCommerce] = useState(isDemoMode ? 'Garage Dupont' : '');

  // Hydrate nom_commerce depuis la sheet via getEspaceAbonne
  // (pour que la sidebar affiche le vrai nom au lieu du fallback "Mon espace")
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
        if (json.ok && json.espace?.nom_commerce) {
          setNomCommerce(json.espace.nom_commerce);
        }
      } catch (_e) {
        // silent
      }
    })();
    return () => { cancelled = true; };
  }, [commercantId, isDemoMode]);

  const [activeId, setActiveId] = useState(MODULES[1].id); // Renouvellement par défaut (1er module avec contacts)
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
          <div className="mb-8">
            <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-emerald-700 mb-2">Mon espace · Modules</p>
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight">
              Vos modules IA
            </h1>
            <p className="text-[14px] text-gray-500 mt-1.5">
              Activez et lancez vos campagnes IA en quelques clics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 md:gap-7">

            {/* ════ SUB-SIDEBAR : liste des 6 modules ════ */}
            <aside>
              <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-3 px-1">Modules</p>
              <ul className="space-y-1.5">
                {MODULES.map((m) => {
                  const isActive = m.id === activeId;
                  const Icon = m.icon;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => { setActiveId(m.id); setTab('manuelle'); }}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl transition-all duration-150`}
                        style={{
                          background: isActive ? '#FFFFFF' : 'transparent',
                          border: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
                          boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: hexToBg(m.color, 0.12) }}
                        >
                          <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: m.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{m.label}</p>
                            {m.status === 'actif' && (
                              <span
                                className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold"
                                style={{ background: '#F0FDF4', color: '#10B981' }}
                              >
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                Actif
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] text-gray-500 leading-snug line-clamp-2">{m.sub}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href="mailto:contact@booster-pay.com"
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.2} />
                  Besoin d'aide ?
                </a>
              </div>
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
                {/* Header du module */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: hexToBg(active.color, 0.12) }}
                  >
                    <active.icon className="w-6 h-6" strokeWidth={2.2} style={{ color: active.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase" style={{ color: active.color }}>
                        Module
                      </p>
                      {active.status === 'actif' ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: '#F0FDF4', color: '#10B981' }}
                        >
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          Actif
                        </span>
                      ) : (
                        // CTA action — pas un état mais une invitation
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: '#FEF3C7', color: '#92400E' }}
                        >
                          Ajoutez vos contacts pour démarrer
                        </span>
                      )}
                    </div>
                    <h2 className="text-[24px] md:text-[28px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight">
                      {active.label}
                    </h2>
                    <p className="text-[14px] text-gray-500 mt-1.5 leading-relaxed">
                      {active.sub}
                    </p>
                  </div>
                </div>

                {/* Exemple concret — ce que ça fait dans la vraie vie */}
                {active.example && (
                  <div
                    className="rounded-xl p-4 mb-7"
                    style={{ background: '#F0FDF4', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                  >
                    <p className="text-[13px] text-emerald-900 leading-relaxed">
                      {active.example}
                    </p>
                  </div>
                )}

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
                  <AlwaysOnPanel module={active} />
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
function AlwaysOnPanel({ module: m }) {
  return (
    <div
      className="rounded-2xl p-6 flex items-start gap-4"
      style={{
        background: hexToBg(m.color, 0.06),
        border: `1px solid ${hexToBg(m.color, 0.25)}`,
      }}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: hexToBg(m.color, 0.15) }}
      >
        <Sparkles className="w-4 h-4" strokeWidth={2.4} style={{ color: m.color }} />
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-bold text-gray-900 mb-1.5">
          Ce module est activé en permanence.
        </p>
        <p className="text-[13.5px] text-gray-600 leading-relaxed">
          {m.description}
        </p>
      </div>
    </div>
  );
}
