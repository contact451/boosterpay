import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  FileText, Upload, Plus, Trash2, Phone, Calendar,
  Euro, ChevronDown, ChevronUp, Headphones, Rocket,
  CheckCircle, AlertCircle, X, HelpCircle, User, Check,
  Smartphone, Mail, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { submitOnboarding } from './services/leadService';

// === ANIMATIONS ===
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 }
};

// === SECTEURS ===
const SECTEURS = [
  'Électricien',
  'Plombier',
  'BTP / Construction',
  'Menuiserie / Charpente',
  'Peinture / Décoration',
  'Chauffage / Climatisation',
  'Commerce',
  'Services',
  'Transport / Logistique',
  'Agriculture',
  'Santé',
  'Restauration',
  'Consulting / Freelance',
  'Autre'
];

// === HOOK : COMPTEUR ANIMÉ ===
function useCountUp(target, duration = 600) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, target, { duration: duration / 1000, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target, duration, motionVal, rounded]);

  return display;
}

// === HOOK : DÉTECTION MOBILE ===
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// === VALIDATION TÉLÉPHONE FRANÇAIS ===
function validateFrenchPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return /^0[1-79]\d{8}$/.test(digits);
}

function isMobilePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return /^0[67]\d{8}$/.test(digits);
}

function isFixedPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return /^0[1-59]\d{8}$/.test(digits);
}

function formatPhoneInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}

function getPhoneStatus(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return 'empty';
  if (digits.length < 10) return 'incomplete';
  if (isMobilePhone(phone)) return 'mobile';
  if (isFixedPhone(phone)) return 'fixed';
  return 'invalid';
}

function getPhoneMessage(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length < 10) return `Encore ${10 - digits.length} chiffre${10 - digits.length > 1 ? 's' : ''}`;
  if (isMobilePhone(phone)) return 'Mobile — Idéal pour les appels IA';
  if (isFixedPhone(phone)) return 'Fixe accepté — Mobile recommandé';
  return 'Numéro invalide';
}

// === MASQUER TÉLÉPHONE ===
function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return digits.slice(0, 2) + ' ** ** ' + digits.slice(-2);
}

// === SÉCURITÉ FICHIERS ===
function validateFileSecure(file) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
  if (file.size > MAX_SIZE) {
    return { valid: false, message: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 10 Mo` };
  }

  const allowedExtensions = ['csv', 'xlsx', 'xls'];
  const parts = file.name.split('.');
  const ext = parts.pop().toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return { valid: false, message: `Extension .${ext} non autorisée. Formats acceptés : .csv, .xlsx, .xls` };
  }

  // Double extension (ex: factures.exe.csv)
  if (parts.length > 1) {
    const suspiciousExts = ['exe', 'bat', 'cmd', 'scr', 'pif', 'js', 'vbs', 'ps1', 'sh', 'php', 'html', 'htm'];
    for (const part of parts.slice(1)) {
      if (suspiciousExts.includes(part.toLowerCase())) {
        return { valid: false, message: 'Fichier suspect détecté (double extension). Veuillez vérifier votre fichier.' };
      }
    }
  }

  // Caractères dangereux dans le nom
  const dangerousChars = /[<>:"|?*\\]/;
  if (dangerousChars.test(file.name)) {
    return { valid: false, message: 'Le nom du fichier contient des caractères non autorisés.' };
  }

  return { valid: true };
}

function sanitizeCSVValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  // Bloque les formules injectées (CSV injection)
  if (/^[=+\-@]/.test(trimmed)) {
    return trimmed.replace(/^[=+\-@]+/, '');
  }
  return trimmed;
}

/**
 * Parse un montant depuis n'importe quel format (FR, EN, mixte).
 * Gère : 1500 | 1500.50 | 1500,50 | 1 500 | 1 500,00 | 1.500,50 | 1,500.50 | €1500 | 1500€
 * Retourne toujours un nombre >= 0 ou 0 si invalide.
 */
function parseAmount(raw) {
  if (raw === null || raw === undefined) return 0;
  let str = String(raw).trim();

  // Supprimer symboles monétaires, espaces, espaces insécables, lettres
  str = str.replace(/[€$£\s\u00A0]/g, '').replace(/EUR/gi, '').trim();

  // Si vide ou aucun chiffre
  if (!str || !/\d/.test(str)) return 0;

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Format FR : 1.500,50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Format EN : 1,500.50
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // 1500,50 → virgule décimale
      str = str.replace(',', '.');
    } else if (parts.length === 2 && parts[1].length === 3) {
      // 1,500 → virgule millier
      str = str.replace(',', '');
    } else {
      // 1,500,000 → milliers
      str = str.replace(/,/g, '');
    }
  } else if (hasDot) {
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // 1500.50 → point décimal, OK
    } else if (parts.length === 2 && parts[1].length === 3) {
      // 1.500 → point millier
      str = str.replace('.', '');
    } else {
      // 1.500.000 → milliers
      str = str.replace(/\./g, '');
    }
  }

  const num = parseFloat(str);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}

// === CONFETTI SIMPLE ===
function ConfettiEffect({ trigger }) {
  if (!trigger) return null;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: -(Math.random() * 150 + 50),
    color: ['#06B6D4', '#7C3AED', '#22C55E', '#F59E0B', '#EC4899'][i % 5],
    size: Math.random() * 6 + 4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0, rotate: Math.random() * 360 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// === FOND ANIMÉ ===
function AnimatedBackground() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(59,130,246,0.25) 0%, transparent 50%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(139,92,246,0.2) 0%, transparent 40%)' }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />

      {/* Orbe cyan/bleu en haut */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 60%)', filter: 'blur(60px)' }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe violet au centre */}
      <motion.div
        className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 60%)', filter: 'blur(50px)' }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe cyan en bas */}
      <motion.div
        className="absolute -bottom-32 left-1/4 w-[350px] h-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 60%)', filter: 'blur(50px)' }}
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// === BARRE DE PROGRESSION ===
function ProgressBar() {
  const steps = [
    { label: 'Inscription', done: true },
    { label: 'Import factures', active: true },
    { label: 'Lancement IA', done: false },
  ];

  return (
    <div className="flex items-center gap-1 md:gap-2 w-full max-w-md mx-auto mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className={`h-full rounded-full ${
                step.done
                  ? 'bg-green-500'
                  : step.active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-white/10'
              }`}
              initial={{ width: 0 }}
              animate={{ width: step.done || step.active ? '100%' : '0%' }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            />
          </div>
          <span className={`text-[11px] flex items-center gap-1 ${
            step.done ? 'text-green-400' : step.active ? 'text-cyan-400' : 'text-gray-500'
          }`}>
            {step.done && <Check className="w-3 h-3" />}
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// === SECTION PROFIL ===
function ProfileSection({ profile, setProfile, isCollapsed, setIsCollapsed }) {
  const isComplete = profile.prenom.trim() && profile.nom.trim() && profile.entreprise.trim() && profile.secteur;

  const handleValidate = () => {
    if (isComplete) setIsCollapsed(true);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.15 }}
      className="mb-8"
    >
      <div
        className={`bg-white/[0.03] backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 ${
          isCollapsed
            ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
            : 'border-white/[0.06] hover:border-cyan-500/20'
        }`}
      >
        {/* Header cliquable quand collapsé */}
        <button
          type="button"
          onClick={() => { if (isCollapsed) setIsCollapsed(false); }}
          className={`w-full flex items-center gap-3 p-5 md:p-6 text-left ${
            isCollapsed ? 'cursor-pointer' : 'cursor-default'
          }`}
          aria-expanded={!isCollapsed}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isCollapsed
              ? 'bg-green-500/20'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          }`}>
            {isCollapsed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
              </motion.div>
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">Complétez votre profil</h2>
            {isCollapsed ? (
              <p className="text-sm text-green-400 truncate">
                {profile.prenom} {profile.nom} — {profile.entreprise} — {profile.secteur}
              </p>
            ) : (
              <p className="text-xs text-gray-400">Nécessaire avant d&apos;ajouter vos factures</p>
            )}
          </div>
          {isCollapsed && (
            <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
          )}
        </button>

        {/* Formulaire */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Prénom */}
                  <div>
                    <label htmlFor="profile-prenom" className="block text-sm text-gray-300 mb-1.5">
                      Prénom
                    </label>
                    <div className="relative">
                      <input
                        id="profile-prenom"
                        type="text"
                        placeholder="Jean"
                        value={profile.prenom}
                        onChange={(e) => setProfile((p) => ({ ...p, prenom: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors pr-10"
                      />
                      {profile.prenom.trim() && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <label htmlFor="profile-nom" className="block text-sm text-gray-300 mb-1.5">
                      Nom
                    </label>
                    <div className="relative">
                      <input
                        id="profile-nom"
                        type="text"
                        placeholder="Dupont"
                        value={profile.nom}
                        onChange={(e) => setProfile((p) => ({ ...p, nom: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors pr-10"
                      />
                      {profile.nom.trim() && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Entreprise */}
                  <div>
                    <label htmlFor="profile-entreprise" className="block text-sm text-gray-300 mb-1.5">
                      Entreprise
                    </label>
                    <div className="relative">
                      <input
                        id="profile-entreprise"
                        type="text"
                        placeholder="BoosterPay SAS"
                        value={profile.entreprise}
                        onChange={(e) => setProfile((p) => ({ ...p, entreprise: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors pr-10"
                      />
                      {profile.entreprise.trim() && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Secteur */}
                  <div>
                    <label htmlFor="profile-secteur" className="block text-sm text-gray-300 mb-1.5">
                      Secteur d&apos;activité
                    </label>
                    <div className="relative">
                      <select
                        id="profile-secteur"
                        value={profile.secteur}
                        onChange={(e) => setProfile((p) => ({ ...p, secteur: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors appearance-none cursor-pointer pr-10"
                      >
                        <option value="" disabled className="bg-[#0a0f1a] text-gray-400">Sélectionnez...</option>
                        {SECTEURS.map((s) => (
                          <option key={s} value={s} className="bg-[#0a0f1a] text-white">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      {profile.secteur && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute right-9 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton valider profil */}
                <motion.button
                  type="button"
                  onClick={handleValidate}
                  disabled={!isComplete}
                  whileHover={isComplete ? { scale: 1.02 } : {}}
                  whileTap={isComplete ? { scale: 0.98 } : {}}
                  className={`w-full md:w-auto md:ml-auto md:flex py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    isComplete
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Valider mon profil
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// === PANNEAU AIDE EXPORT ===
function ExportHelpPanel({ isOpen, onToggle }) {
  const guides = [
    { name: 'Pennylane', steps: 'Ventes > Factures > Tout sélectionner > Exporter CSV' },
    { name: 'QuickBooks', steps: 'Ventes > Toutes les ventes > Icône Export > Excel' },
    { name: 'Sage / Cegid', steps: 'Journal des ventes > Actions > Exportation > CSV/Excel' },
    { name: 'Excel / Sheets', steps: 'Fichier > Enregistrer sous > Format .csv (Colonnes : Nom, Tel, Montant, Échéance)' },
  ];

  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-4 h-4" />
        <span>Besoin d&apos;aide pour exporter ?</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {guides.map((g) => (
                <div key={g.name} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <p className="text-sm font-semibold text-white mb-1">{g.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{g.steps}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === MODAL EXPERT ===
function ExpertModal({ isOpen, onClose }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/90"
          />

          {isMobile ? (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 z-[301] bg-[#0f172a] rounded-t-3xl border-t border-x border-violet-500/30"
              style={{ maxHeight: '85vh' }}
            >
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-pink-600/20 rounded-t-3xl">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-violet-400" />
                      <span>Import assisté par un expert</span>
                    </h2>
                    <p className="text-gray-300 text-xs mt-1">15 min pour configurer vos imports</p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full bg-white/10" aria-label="Fermer">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3" style={{ height: '55vh' }}>
                <div className="rounded-xl overflow-hidden bg-white h-full">
                  <iframe
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1a3ileaN1Jry5bswWVf9kB1YVlLPzjwXAbgOAgEJTCdva3yvBaTde-Wdt01MYcJNF3dYAAn-FP?gv=true"
                    className="w-full h-full border-0"
                    title="Réserver un appel expert"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[301] flex items-center justify-center p-8"
            >
              <div className="bg-[#0f172a] rounded-3xl border border-violet-500/30 w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(124,58,237,0.3)]">
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-pink-600/20 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-violet-400" />
                      Import assisté par un expert
                    </h2>
                    <p className="text-gray-300 text-sm mt-1">15 min pour configurer vos imports</p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Fermer">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="p-4" style={{ height: '500px' }}>
                  <div className="rounded-xl overflow-hidden bg-white h-full">
                    <iframe
                      src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1a3ileaN1Jry5bswWVf9kB1YVlLPzjwXAbgOAgEJTCdva3yvBaTde-Wdt01MYcJNF3dYAAn-FP?gv=true"
                      className="w-full h-full border-0"
                      title="Réserver un appel expert"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// === COLUMN HINTS POUR AUTO-MAPPING CSV ===
const COLUMN_HINTS = {
  name:    ['nom', 'client', 'débiteur', 'debiteur', 'société', 'societe', 'entreprise', 'raison', 'contact', 'name', 'destinataire'],
  phone:   ['tel', 'téléphone', 'telephone', 'mobile', 'portable', 'gsm', 'phone', 'tel1', 'telephone1'],
  amount:  ['montant', 'total', 'ttc', 'ht', 'somme', 'amount', 'prix', 'solde', 'reste', 'du', 'impaye', 'impayé'],
  email:   ['email', 'mail', 'courriel', 'e-mail'],
  phone2:  ['tel2', 'telephone2', 'téléphone2', 'fax', 'fixe', 'autre tel'],
  dueDate: ['échéance', 'echeance', 'date', 'due', 'limite', 'deadline', 'date facture', 'date paiement'],
};

const normalizeHeader = (str) => str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || '';

const REQUIRED_FIELDS = [
  { key: 'name', label: 'Client Débiteur', description: 'Nom du client qui doit payer' },
  { key: 'phone', label: 'Téléphone 1', description: 'Numéro principal du débiteur' },
  { key: 'amount', label: 'Montant €', description: 'Montant de la facture' },
];

const OPTIONAL_FIELDS = [
  { key: 'email', label: 'Email Débiteur', description: 'Email du client' },
  { key: 'phone2', label: 'Téléphone 2', description: '2ème numéro' },
  { key: 'dueDate', label: 'Date Échéance', description: 'Date limite de paiement' },
];

// === MODAL DE MAPPING CSV (Redesign intuitif "3 questions") ===
function CSVMappingModal({ csvMapping, columnMapping, setColumnMapping, onConfirm, onCancel }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  const { headers, preview, allData, fileName, rowCount } = csvMapping;

  // Colonnes déjà assignées (pour éviter doublons)
  const usedColumns = Object.values(columnMapping).filter(Boolean);

  // Suggestions auto-détectées (snapshot initial)
  const [autoDetected] = useState(() => {
    const auto = {};
    for (const [field, hints] of Object.entries(COLUMN_HINTS)) {
      const match = headers.find(h =>
        hints.some(hint => normalizeHeader(h).includes(normalizeHeader(hint)))
      );
      if (match) auto[field] = match;
    }
    return auto;
  });

  const requiredMapped = REQUIRED_FIELDS.filter(f => columnMapping[f.key]).length;
  const canConfirm = requiredMapped === REQUIRED_FIELDS.length;
  const allAutoDetected = REQUIRED_FIELDS.every(f =>
    autoDetected[f.key] && columnMapping[f.key] === autoDetected[f.key]
  );

  const handleSelect = (fieldKey, headerValue) => {
    setColumnMapping(prev => ({
      ...prev,
      [fieldKey]: headerValue || '',
    }));
  };

  // Premières valeurs d'aperçu pour un champ mappé (badges)
  const getPreviewValues = (fieldKey) => {
    const col = columnMapping[fieldKey];
    if (!col) return [];
    return preview.slice(0, 3)
      .map(row => row[col])
      .filter(v => v && String(v).trim())
      .map(v => String(v).substring(0, 25));
  };

  // Données d'une carte contact preview
  const getCardData = (rowIndex) => {
    const row = preview[rowIndex];
    if (!row) return null;
    return {
      name: columnMapping.name ? String(row[columnMapping.name] || '').trim() : '',
      phone: columnMapping.phone ? String(row[columnMapping.phone] || '').trim() : '',
      amount: columnMapping.amount ? String(row[columnMapping.amount] || '').trim() : '',
    };
  };

  // Texte contextuel du bouton
  const getButtonText = () => {
    const remaining = 3 - requiredMapped;
    if (remaining === 3) return 'Complétez les 3 champs';
    if (remaining === 2) return 'Encore 2 champs à compléter';
    if (remaining === 1) return 'Encore 1 champ à compléter';
    return `C\u2019est bon, importer mes ${rowCount} contacts !`;
  };

  const handleConfirm = () => {
    const mapped = allData
      .filter(row => {
        const name = columnMapping.name ? row[columnMapping.name] : '';
        const phone = columnMapping.phone ? row[columnMapping.phone] : '';
        const amount = columnMapping.amount ? row[columnMapping.amount] : '';
        return (name && String(name).trim()) && (phone && String(phone).trim()) && (amount && String(amount).trim());
      })
      .map(row => ({
        name: sanitizeCSVValue(String(columnMapping.name ? row[columnMapping.name] || '' : '').trim()),
        phone: sanitizeCSVValue(String(columnMapping.phone ? row[columnMapping.phone] || '' : '').trim()),
        phone2: sanitizeCSVValue(String(columnMapping.phone2 ? row[columnMapping.phone2] || '' : '').trim()),
        email: sanitizeCSVValue(String(columnMapping.email ? row[columnMapping.email] || '' : '').trim()),
        amount: String(parseAmount(columnMapping.amount ? row[columnMapping.amount] : 0)),
        dueDate: sanitizeCSVValue(String(columnMapping.dueDate ? row[columnMapping.dueDate] || '' : '').trim()),
        id: Date.now() + Math.random(),
        imported: true,
      }));
    onConfirm(mapped);
  };

  // Config des 3 steps obligatoires (labels humanisés)
  const STEPS = [
    { key: 'name', label: 'Nom du client', Icon: User, stepNum: 1 },
    { key: 'phone', label: 'Numéro de téléphone', Icon: Phone, stepNum: 2 },
    { key: 'amount', label: 'Montant de la facture', Icon: Euro, stepNum: 3 },
  ];

  // Labels humanisés pour les champs optionnels (basés sur OPTIONAL_FIELDS)
  const OPTIONAL_ICONS = { email: Mail, phone2: Phone, dueDate: Calendar };
  const OPTIONAL_LABELS = { email: 'Adresse email', phone2: '2ème numéro de téléphone', dueDate: "Date d\u2019échéance" };
  const OPTIONALS = OPTIONAL_FIELDS.map(f => ({
    key: f.key, label: OPTIONAL_LABELS[f.key] || f.label, Icon: OPTIONAL_ICONS[f.key] || FileText,
  }));

  // Rendu d'un step obligatoire
  const renderStep = (step, index) => {
    const availableHeaders = headers.filter(h =>
      !usedColumns.includes(h) || columnMapping[step.key] === h
    );
    const isAutoDetected = autoDetected[step.key] && columnMapping[step.key] === autoDetected[step.key];
    const previewValues = getPreviewValues(step.key);
    const isMapped = !!columnMapping[step.key];

    return (
      <motion.div
        key={step.key}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.15 }}
        className="flex gap-3"
      >
        {/* Step number */}
        <div className="flex flex-col items-center shrink-0">
          <motion.div
            animate={isMapped ? { scale: [1, 1.2, 1] } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              isMapped
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-gray-400 border border-white/20'
            }`}
          >
            {isMapped ? <Check className="w-4 h-4" /> : step.stepNum}
          </motion.div>
          {index < 2 && (
            <div className={`w-0.5 flex-1 mt-1 mb-1 transition-colors ${
              isMapped ? 'bg-emerald-500/40' : 'bg-white/10'
            }`} />
          )}
        </div>

        {/* Step content */}
        <div className="flex-1 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <step.Icon className={`w-4 h-4 ${isMapped ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold text-white">{step.label}</span>
            {isAutoDetected && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Auto
              </span>
            )}
          </div>
          <select
            value={columnMapping[step.key] || ''}
            onChange={(e) => handleSelect(step.key, e.target.value)}
            aria-label={step.label}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="" className="bg-[#0f172a] text-gray-400">Choisissez la colonne...</option>
            {availableHeaders.map(h => (
              <option key={h} value={h} className="bg-[#0f172a] text-white">{h}</option>
            ))}
          </select>
          {/* Preview values badges */}
          <AnimatePresence mode="wait">
            {previewValues.length > 0 && (
              <motion.div
                key={columnMapping[step.key]}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap gap-1.5 mt-2"
              >
                {previewValues.map((val, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10"
                  >
                    {val}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  // Rendu d'un champ optionnel (compact, toujours visible)
  const renderOptional = (field) => {
    const availableHeaders = headers.filter(h =>
      !usedColumns.includes(h) || columnMapping[field.key] === h
    );
    const isAutoDetected = autoDetected[field.key] && columnMapping[field.key] === autoDetected[field.key];
    const previewValues = getPreviewValues(field.key);

    return (
      <div key={field.key} className="space-y-1.5">
        <div className="flex items-center gap-2">
          <field.Icon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-300">{field.label}</span>
          {isAutoDetected && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Auto
            </span>
          )}
        </div>
        <select
          value={columnMapping[field.key] || ''}
          onChange={(e) => handleSelect(field.key, e.target.value)}
          aria-label={field.label}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        >
          <option value="" className="bg-[#0f172a] text-gray-400">Pas dans mon fichier</option>
          {availableHeaders.map(h => (
            <option key={h} value={h} className="bg-[#0f172a] text-white">{h}</option>
          ))}
        </select>
        {field.key === 'email' && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Mail className="w-3 h-3 text-cyan-400/50" />
            L&apos;email permet d&apos;envoyer un récapitulatif après l&apos;appel
          </p>
        )}
        {previewValues.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {previewValues.map((val, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                {val}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Contact card preview
  const ContactCard = ({ rowIndex, accentColor }) => {
    const data = getCardData(rowIndex);
    if (!data) return null;
    const borderColor = accentColor === 'cyan' ? 'border-l-cyan-500' : 'border-l-violet-500';
    return (
      <div className={`bg-white/[0.03] rounded-xl border border-white/10 border-l-2 ${borderColor} p-3 min-w-[200px]`}>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={data.name || 'empty-name'}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={data.name ? 'text-white font-medium' : 'text-gray-600'}
              >
                {data.name || '\u2014'}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={data.phone || 'empty-phone'}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={data.phone ? 'text-white' : 'text-gray-600'}
              >
                {data.phone || '\u2014'}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Euro className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={data.amount || 'empty-amount'}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={data.amount ? 'text-white' : 'text-gray-600'}
              >
                {data.amount ? `${data.amount} \u20AC` : '\u2014'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const modalContent = (
    <>
      {/* Header */}
      <div className={`border-b border-white/10 ${isMobile ? 'p-4 rounded-t-3xl' : 'p-6'} bg-gradient-to-r from-emerald-600/20 to-cyan-600/20`}>
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white flex items-center gap-2.5`}>
              <motion.div
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              >
                <FileText className="w-6 h-6 text-emerald-400" />
              </motion.div>
              On a trouvé {rowCount} contacts !
            </h2>
            <p className="text-gray-400 text-xs mt-1">{fileName}</p>
            {allAutoDetected && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                On a repéré vos colonnes automatiquement — vérifiez et c&apos;est parti !
              </motion.p>
            )}
          </div>
          <button onClick={onCancel} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Fermer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`${isMobile ? 'px-4 pt-4' : 'px-6 pt-5'}`}>
        <div className="flex items-center gap-1 mb-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center flex-1 gap-1">
              <div className={`w-full h-1.5 rounded-full transition-colors duration-400 ${
                i < requiredMapped ? 'bg-emerald-500' : 'bg-white/10'
              }`} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-right">{requiredMapped}/3</p>
      </div>

      {/* Scrollable body */}
      <div className={`overflow-y-auto ${isMobile ? 'p-4' : 'px-6 pb-4 pt-2'}`} style={{ maxHeight: isMobile ? '55vh' : '55vh' }}>

        {/* Contact cards preview */}
        <div className={`flex gap-3 mb-6 ${isMobile ? 'overflow-x-auto pb-2 -mx-1 px-1' : ''}`}>
          <ContactCard rowIndex={0} accentColor="cyan" />
          <ContactCard rowIndex={1} accentColor="violet" />
        </div>

        {/* 3 Steps obligatoires */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-4">Aidez-nous à comprendre vos données :</p>
          {STEPS.map((step, i) => renderStep(step, i))}
        </div>

        {/* Optionnels — toujours visibles */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-gray-500 mb-3">Complétez pour de meilleurs résultats</p>
          <div className="space-y-4">
            {OPTIONALS.map(f => renderOptional(f))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className={`border-t border-white/10 ${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between gap-3`}>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
        >
          Annuler
        </button>
        <motion.button
          onClick={handleConfirm}
          disabled={!canConfirm}
          whileHover={canConfirm ? { scale: 1.03 } : {}}
          whileTap={canConfirm ? { scale: 0.97 } : {}}
          animate={canConfirm ? { scale: [1, 1.02, 1] } : {}}
          transition={canConfirm ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
            canConfirm
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canConfirm ? <Rocket className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {getButtonText()}
        </motion.button>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-[300] bg-black/90"
      />

      {isMobile ? (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-0 left-0 right-0 z-[301] bg-[#0f172a] rounded-t-3xl border-t border-x border-emerald-500/30"
          style={{ maxHeight: '90vh' }}
        >
          {modalContent}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[301] flex items-center justify-center p-8"
        >
          <div className="bg-[#0f172a] rounded-3xl border border-emerald-500/30 w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.2)]">
            {modalContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === CARD FACTURE ===
function InvoiceCard({ invoice, onDelete, index }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      layout
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 flex items-center justify-between gap-4"
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold text-sm truncate">{invoice.name || 'Sans nom'}</p>
          {invoice.imported && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-violet-500/20 text-violet-400 rounded-full shrink-0">
              Importé
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            {invoice.phoneType === 'mobile' ? (
              <Smartphone className="w-3 h-3 text-cyan-400" />
            ) : (
              <Phone className="w-3 h-3 text-orange-400" />
            )}
            {maskPhone(invoice.phone)}
          </span>
          {invoice.phone2 && (
            <span className="flex items-center gap-1">
              {invoice.phone2Type === 'mobile' ? (
                <Smartphone className="w-3 h-3 text-cyan-400" />
              ) : (
                <Phone className="w-3 h-3 text-orange-400" />
              )}
              {maskPhone(invoice.phone2)}
            </span>
          )}
          {invoice.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-green-400" />
              <span className="truncate max-w-[140px]">{invoice.email}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Euro className="w-3 h-3" />
            {parseFloat(invoice.amount).toLocaleString('fr-FR')} €
          </span>
          {invoice.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      {confirmDelete ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDelete(index)}
            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1 rounded-lg bg-white/10 text-gray-400 text-xs hover:bg-white/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors shrink-0"
          aria-label={`Supprimer la facture de ${invoice.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// === COMPOSANT PRINCIPAL ===
export default function OnboardingStep2() {
  // Profile state
  const [profile, setProfile] = useState({ prenom: '', nom: '', entreprise: '', secteur: '' });
  const [profileCollapsed, setProfileCollapsed] = useState(false);

  // Invoice state
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', phone2: '', email: '', amount: '', dueDate: '' });
  const [showPhone2, setShowPhone2] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [formError, setFormError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [uploadState, setUploadState] = useState('default');
  const [uploadMessage, setUploadMessage] = useState('');
  const [hasImportedInvoices, setHasImportedInvoices] = useState(false);
  // Lire lid depuis l'URL (cas: lead arrive via lien SMS ou email)
  const urlSearchParams = new URLSearchParams(window.location.search);
  const leadIdFromUrl = urlSearchParams.get('lid') || '';

  const [leadEmail] = useState(() => sessionStorage.getItem('bp_lead_email') || '');
  const [leadPhone] = useState(() => sessionStorage.getItem('bp_lead_phone') || '');
  const [leadId] = useState(leadIdFromUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [csvMapping, setCsvMapping] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const canLaunch = invoices.length > 0 && profileCollapsed;
  const animatedCount = useCountUp(invoices.length);
  const animatedTotal = useCountUp(totalAmount);

  // Champs remplis dans le formulaire facture
  const fieldsCompleted = [formData.name, formData.phone, formData.amount, formData.dueDate].filter(Boolean).length;

  // Ajout facture
  const handleAddInvoice = useCallback((e) => {
    e.preventDefault();
    const { name, phone, amount, dueDate } = formData;

    if (!name.trim() || !validateFrenchPhone(phone) || !amount || !dueDate) {
      setFormError(true);
      setTimeout(() => setFormError(false), 500);
      return;
    }

    const invoice = {
      name: name.trim(),
      phone,
      amount,
      dueDate,
      id: Date.now(),
      phoneType: isMobilePhone(phone) ? 'mobile' : 'fixed',
    };

    // Champs optionnels
    if (formData.phone2 && validateFrenchPhone(formData.phone2)) {
      invoice.phone2 = formData.phone2;
      invoice.phone2Type = isMobilePhone(formData.phone2) ? 'mobile' : 'fixed';
    }
    if (formData.email && formData.email.trim()) {
      invoice.email = formData.email.trim();
    }

    setInvoices((prev) => [...prev, invoice]);
    setFormData({ name: '', phone: '', phone2: '', email: '', amount: '', dueDate: '' });
    setShowPhone2(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  }, [formData]);

  // Suppression facture
  const handleDeleteInvoice = useCallback((index) => {
    setInvoices((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setHasImportedInvoices(false);
      return updated;
    });
  }, []);

  // Parse CSV — mapping intelligent et permissif
  const processFile = useCallback((file) => {
    if (!file) return;

    // Validation sécurité
    const security = validateFileSecure(file);
    if (!security.valid) {
      setUploadState('error');
      setUploadMessage(security.message);
      setTimeout(() => setUploadState('default'), 4000);
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      setUploadState('error');
      setUploadMessage("Pour les fichiers Excel, exportez d'abord en CSV");
      setTimeout(() => setUploadState('default'), 4000);
      return;
    }

    setUploadState('uploading');
    setUploadMessage('Analyse du fichier en cours...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0 || results.data.length === 0) {
          setUploadState('error');
          setUploadMessage('Fichier vide ou format non reconnu');
          setTimeout(() => setUploadState('default'), 4000);
          return;
        }

        // Stocker les données brutes et ouvrir le modal de mapping
        setCsvMapping({
          headers: results.meta.fields,
          preview: results.data.slice(0, 3),
          allData: results.data,
          fileName: file.name,
          rowCount: results.data.length,
        });

        // Tenter l'auto-mapping
        const autoMap = {};
        for (const [field, hints] of Object.entries(COLUMN_HINTS)) {
          const match = results.meta.fields.find(h =>
            hints.some(hint => normalizeHeader(h).includes(normalizeHeader(hint)))
          );
          if (match) autoMap[field] = match;
        }
        setColumnMapping(autoMap);

        setUploadState('default');
        setUploadMessage('');
      },
      error: () => {
        setUploadState('error');
        setUploadMessage('Erreur lors de la lecture du fichier');
        setTimeout(() => setUploadState('default'), 3000);
      }
    });
  }, []);

  // Drag & Drop
  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);
  const handleFileInput = useCallback((e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  }, [processFile]);

  // Confirmation du mapping CSV
  const handleMappingConfirm = useCallback((mappedInvoices) => {
    setInvoices(prev => [...prev, ...mappedInvoices]);
    setHasImportedInvoices(true);
    setCsvMapping(null);
    setColumnMapping({});
    setUploadState('success');
    setUploadMessage(`${mappedInvoices.length} facture(s) importée(s) avec succès !`);
    setTimeout(() => setUploadState('default'), 4000);
  }, []);

  // Lancement IA
  const handleLaunch = useCallback(async () => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const urlParams = new URLSearchParams(window.location.search);

    const payload = {
      lead: {
        prenom: profile.prenom,
        nom: profile.nom,
        entreprise: profile.entreprise,
        secteur: profile.secteur,
      },
      email: leadEmail,
      telephone: leadPhone,
      factures: invoices.map((inv) => ({
        clientName: inv.name,
        phone: inv.phone,
        ...(inv.phone2 ? { phone2: inv.phone2 } : {}),
        ...(inv.email ? { email: inv.email } : {}),
        amount: parseFloat(inv.amount) || 0,
        dueDate: inv.dueDate,
        imported: inv.imported || false,
      })),
      totalInvoices: invoices.length,
      source: 'onboarding_step2',
      appareil: isMobileDevice ? 'mobile' : 'desktop',
      utm_source: urlParams.get('utm_source') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      leadId: leadId || '',
    };

    console.log('=== PAYLOAD ONBOARDING STEP 2 ===');
    console.log(JSON.stringify(payload, null, 2));

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await submitOnboarding(payload);

      if (result.success) {
        sessionStorage.removeItem('bp_lead_email');
        sessionStorage.removeItem('bp_lead_phone');
        navigate('/onboarding/success', {
          state: {
            leadId: result.leadId,
            prenom: profile.prenom,
            entreprise: profile.entreprise,
            nbFactures: invoices.length,
            totalAmount: totalAmount,
          }
        });
      } else {
        console.error('❌ Erreur onboarding:', result.error);
        setSubmitError(result.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setSubmitError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  }, [invoices, profile, navigate, leadEmail, leadPhone, leadId]);

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />

      <div className={`relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-8 ${isMobile ? 'pb-28' : 'pb-16'}`}>
        {/* Header : Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <a href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Booster<span className="text-blue-500">Pay</span>
          </a>
        </motion.div>

        {/* Progress bar + titre */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <ProgressBar />
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            Importez vos{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              factures impayées
            </span>
          </h1>
          <p className="text-gray-400 md:text-lg max-w-xl mx-auto">
            Notre IA va contacter vos clients pour récupérer vos paiements
          </p>
        </motion.div>

        {/* Section Profil */}
        <ProfileSection
          profile={profile}
          setProfile={setProfile}
          isCollapsed={profileCollapsed}
          setIsCollapsed={setProfileCollapsed}
        />

        {/* Compteur dynamique */}
        <AnimatePresence>
          {invoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-5 py-3 flex-wrap justify-center">
                <span className="text-cyan-400 font-bold text-lg">
                  {animatedCount} facture{invoices.length > 1 ? 's' : ''}
                </span>
                {hasImportedInvoices ? (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-orange-400 text-sm font-medium">
                      Vérifiez les données importées
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-white font-semibold">
                      {animatedTotal.toLocaleString('fr-FR')} € à récupérer
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2 colonnes : Ajout manuel + Import CSV */}
        <div className={`grid md:grid-cols-2 gap-6 mb-8 transition-opacity duration-300 ${
          !profileCollapsed ? 'opacity-40 pointer-events-none' : ''
        }`}>
          {/* Formulaire ajout manuel */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <ConfettiEffect trigger={showConfetti} />
            <motion.div
              animate={formError ? shake : {}}
              ref={formRef}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 md:p-6 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Ajout manuel</h2>
                  <p className="text-xs text-gray-400">Ajoutez une facture à la fois</p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Progression</span>
                  <span className="text-xs text-cyan-400 font-medium">{fieldsCompleted}/4 champs</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(fieldsCompleted / 4) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <form onSubmit={handleAddInvoice} className="space-y-4">
                <div>
                  <label htmlFor="client-name" className="block text-sm text-gray-300 mb-1">
                    Nom du client débiteur
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    placeholder="Ex : Société Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                  />
                </div>

                {/* Téléphone du client - AMÉLIORÉ */}
                <div>
                  <label htmlFor="client-phone" className="block text-sm text-gray-300 mb-1">
                    Téléphone du débiteur
                  </label>

                  {/* Indication priorité */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs text-cyan-400 font-medium">Mobile préféré</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500">Fixe accepté</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      id="client-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneInput(e.target.value);
                        setFormData((f) => ({ ...f, phone: formatted }));
                      }}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all pr-12 ${
                        getPhoneStatus(formData.phone) === 'mobile'
                          ? 'border-cyan-500/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30'
                          : getPhoneStatus(formData.phone) === 'fixed'
                          ? 'border-orange-500/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                          : getPhoneStatus(formData.phone) === 'invalid'
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/[0.1] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'
                      }`}
                    />

                    {/* Indicateur visuel à droite */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getPhoneStatus(formData.phone) === 'mobile' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                      {getPhoneStatus(formData.phone) === 'fixed' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"
                        >
                          <Phone className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                      {getPhoneStatus(formData.phone) === 'invalid' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                      {getPhoneStatus(formData.phone) === 'incomplete' && (
                        <span className="text-xs text-gray-500 font-medium">
                          {10 - formData.phone.replace(/\D/g, '').length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message de feedback */}
                  {formData.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs mt-1.5 flex items-center gap-1 ${
                        getPhoneStatus(formData.phone) === 'mobile'
                          ? 'text-cyan-400'
                          : getPhoneStatus(formData.phone) === 'fixed'
                          ? 'text-orange-400'
                          : getPhoneStatus(formData.phone) === 'invalid'
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {getPhoneMessage(formData.phone)}
                    </motion.p>
                  )}

                  {/* Info supplémentaire si fixe */}
                  {getPhoneStatus(formData.phone) === 'fixed' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20"
                    >
                      <p className="text-xs text-orange-300 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                          Le mobile (06/07) est recommandé pour de meilleurs résultats.
                          L&apos;IA peut quand même appeler sur un fixe.
                        </span>
                      </p>
                    </motion.div>
                  )}

                  {/* Bouton toggle 2ème numéro */}
                  <AnimatePresence>
                    {!showPhone2 ? (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhone2(true)}
                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Ajouter un 2ème numéro
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="client-phone2" className="text-sm text-gray-300">
                            2ème numéro <span className="text-gray-500">(optionnel)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPhone2(false);
                              setFormData((f) => ({ ...f, phone2: '' }));
                            }}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Retirer le 2ème numéro"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            id="client-phone2"
                            type="tel"
                            inputMode="numeric"
                            placeholder="01 23 45 67 89"
                            value={formData.phone2}
                            onChange={(e) => {
                              const formatted = formatPhoneInput(e.target.value);
                              setFormData((f) => ({ ...f, phone2: formatted }));
                            }}
                            className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all pr-12 ${
                              getPhoneStatus(formData.phone2) === 'mobile'
                                ? 'border-cyan-500/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30'
                                : getPhoneStatus(formData.phone2) === 'fixed'
                                ? 'border-orange-500/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30'
                                : getPhoneStatus(formData.phone2) === 'invalid'
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-white/[0.1] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {getPhoneStatus(formData.phone2) === 'mobile' && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                                <Smartphone className="w-3.5 h-3.5 text-white" />
                              </motion.div>
                            )}
                            {getPhoneStatus(formData.phone2) === 'fixed' && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                                <Phone className="w-3.5 h-3.5 text-white" />
                              </motion.div>
                            )}
                            {getPhoneStatus(formData.phone2) === 'invalid' && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                <X className="w-3.5 h-3.5 text-white" />
                              </motion.div>
                            )}
                            {getPhoneStatus(formData.phone2) === 'incomplete' && (
                              <span className="text-xs text-gray-500 font-medium">
                                {10 - formData.phone2.replace(/\D/g, '').length}
                              </span>
                            )}
                          </div>
                        </div>
                        {formData.phone2 && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs mt-1.5 flex items-center gap-1 ${
                              getPhoneStatus(formData.phone2) === 'mobile' ? 'text-cyan-400'
                                : getPhoneStatus(formData.phone2) === 'fixed' ? 'text-orange-400'
                                : getPhoneStatus(formData.phone2) === 'invalid' ? 'text-red-400'
                                : 'text-gray-500'
                            }`}
                          >
                            {getPhoneMessage(formData.phone2)}
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email du débiteur (optionnel) */}
                <div>
                  <label htmlFor="client-email" className="block text-sm text-gray-300 mb-1">
                    Email du débiteur <span className="text-gray-500">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="client-email"
                      type="email"
                      placeholder="client@exemple.fr"
                      value={formData.email}
                      onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                      className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all pr-12 ${
                        formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500/30'
                          : formData.email && formData.email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/[0.1] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                      {formData.email && formData.email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="invoice-amount" className="block text-sm text-gray-300 mb-1">
                      Montant €
                    </label>
                    <input
                      id="invoice-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="1 500"
                      value={formData.amount}
                      onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="invoice-due-date" className="block text-sm text-gray-300 mb-1">
                      Échéance
                    </label>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => document.getElementById('invoice-due-date')?.showPicker?.()}
                    >
                      <input
                        id="invoice-due-date"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {(() => {
                  const isFormValid = formData.name && validateFrenchPhone(formData.phone) && formData.amount && formData.dueDate;
                  return (
                    <motion.button
                      type="submit"
                      disabled={!isFormValid}
                      whileHover={isFormValid ? { scale: 1.02 } : {}}
                      whileTap={isFormValid ? { scale: 0.98 } : {}}
                      className={`
                        w-full py-3 rounded-xl font-semibold text-white transition-all
                        ${isFormValid
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                          : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter cette facture +
                      </span>
                    </motion.button>
                  );
                })()}
              </form>
            </motion.div>
          </motion.div>

          {/* Import CSV */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 md:p-6 h-full flex flex-col hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Import CSV / Excel</h2>
                  <p className="text-xs text-gray-400">Importez plusieurs factures d&apos;un coup</p>
                </div>
              </div>

              {/* Zone Drag & Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Zone de dépôt de fichier CSV"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                className={`
                  flex-1 min-h-[180px] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all relative
                  ${isDragging
                    ? 'bg-violet-500/20 shadow-[0_0_40px_rgba(124,58,237,0.4)] border-2 border-violet-400'
                    : uploadState === 'success'
                      ? 'border-2 border-green-500/50 bg-green-500/5'
                      : uploadState === 'error'
                        ? 'border-2 border-orange-500/50 bg-orange-500/5'
                        : 'animated-border-dashed hover:bg-violet-500/5'
                  }
                `}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  aria-hidden="true"
                />

                {uploadState === 'uploading' ? (
                  <>
                    <motion.div
                      className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-sm text-gray-300">{uploadMessage}</p>
                  </>
                ) : uploadState === 'success' ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <p className="text-sm text-green-400 font-semibold">{uploadMessage}</p>
                  </>
                ) : uploadState === 'error' ? (
                  <>
                    <AlertCircle className="w-8 h-8 text-orange-400" />
                    <p className="text-sm text-orange-400 text-center px-4">{uploadMessage}</p>
                    <p className="text-xs text-gray-500 mt-2">Essayez un autre format ou ajoutez manuellement</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <FileText className="w-7 h-7 text-violet-400" />
                    </motion.div>
                    <div className="text-center relative z-10">
                      <p className="text-sm text-gray-300">Plusieurs factures ?</p>
                      <p className="text-sm text-violet-400 font-semibold">Glissez votre fichier ici</p>
                      <p className="text-xs text-gray-500 mt-1">.csv, .xlsx — On s&apos;adapte à votre format !</p>
                    </div>
                  </>
                )}
              </div>

              <ExportHelpPanel isOpen={isHelpOpen} onToggle={() => setIsHelpOpen((o) => !o)} />
            </div>
          </motion.div>
        </div>

        {/* Liste des factures */}
        <AnimatePresence>
          {invoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-violet-400" />
                Factures prêtes pour l&apos;IA
              </h3>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {invoices.map((inv, i) => (
                    <InvoiceCard
                      key={inv.id}
                      invoice={inv}
                      onDelete={handleDeleteInvoice}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Final — inline sur desktop */}
        {!isMobile && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <motion.button
              onClick={handleLaunch}
              disabled={!canLaunch || isSubmitting}
              whileHover={canLaunch && !isSubmitting ? { scale: 1.03 } : {}}
              whileTap={canLaunch && !isSubmitting ? { scale: 0.97 } : {}}
              className={`
                inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all
                ${canLaunch && !isSubmitting
                  ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] btn-glow'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Lancer les appels IA maintenant 🚀
                </>
              )}
            </motion.button>
            {submitError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2 text-center"
              >
                {submitError}
              </motion.p>
            )}
            {!canLaunch && (
              <p className="text-gray-500 text-sm mt-3">
                {!profileCollapsed
                  ? 'Complétez votre profil et ajoutez au moins une facture'
                  : 'Ajoutez au moins une facture pour continuer'}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* CTA Sticky — mobile uniquement */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1a]/95 backdrop-blur-xl border-t border-white/[0.06] p-4 pb-safe">
          <motion.button
            onClick={handleLaunch}
            disabled={!canLaunch || isSubmitting}
            whileTap={canLaunch && !isSubmitting ? { scale: 0.97 } : {}}
            className={`
              w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all
              ${canLaunch && !isSubmitting
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] btn-glow'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
            style={{ minHeight: '52px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Lancer les appels IA 🚀
              </>
            )}
          </motion.button>
          {submitError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 text-center"
            >
              {submitError}
            </motion.p>
          )}
          {!canLaunch && (
            <p className="text-gray-500 text-xs mt-2 text-center">
              {!profileCollapsed
                ? 'Complétez votre profil + ajoutez une facture'
                : 'Ajoutez au moins une facture'}
            </p>
          )}
        </div>
      )}

      {/* Bouton flottant expert */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={() => setIsExpertModalOpen(true)}
        className={`
          fixed z-50 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all
          ${isMobile
            ? 'bottom-[88px] left-1/2 -translate-x-1/2 px-5 py-2.5 text-sm'
            : 'bottom-6 right-6 px-6 py-3'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Besoin d'aide ?"
      >
        <Headphones className="w-5 h-5" />
        <span>Besoin d&apos;aide ?</span>
      </motion.button>

      {/* Modal mapping CSV */}
      {csvMapping && (
        <CSVMappingModal
          csvMapping={csvMapping}
          columnMapping={columnMapping}
          setColumnMapping={setColumnMapping}
          onConfirm={handleMappingConfirm}
          onCancel={() => { setCsvMapping(null); setColumnMapping({}); }}
        />
      )}

      {/* Modal expert */}
      <ExpertModal isOpen={isExpertModalOpen} onClose={() => setIsExpertModalOpen(false)} />
    </div>
  );
}
