import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Shield, Lock,
  CalendarDays, CreditCard, Clock, Hash, Building2, AlertCircle, User,
  CheckCircle, ArrowRight, Sparkles, Timer, BadgePercent
} from 'lucide-react';
import DebtorLayout, { useIsMobile } from './components/DebtorLayout';

const ease = [0.22, 1, 0.36, 1];

// ============================================
// CONFIG
// ============================================
const STRIPE_API_URL = import.meta.env.VITE_STRIPE_API_URL
  || 'https://boosterpay-stripe-server-production.up.railway.app';

const BNPL_MARKUP_RATE = 0.07; // 7% frais de dossier

// ============================================
// HOOKS
// ============================================

function useCountUp(target, duration = 1800, delay = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return count;
}

function useCountdown(deadlineStr) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    let target;
    try {
      target = new Date(deadlineStr);
      if (isNaN(target.getTime())) {
        const months = {
          'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
          'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
        };
        const parts = deadlineStr.trim().split(/\s+/);
        if (parts.length >= 3) {
          const day = parseInt(parts[0]);
          const month = months[parts[1].toLowerCase()];
          const year = parseInt(parts[2]);
          if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            target = new Date(year, month, day, 23, 59, 59);
          }
        }
      }
    } catch {
      target = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    if (!target || isNaN(target.getTime())) {
      target = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    const update = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadlineStr]);

  return remaining;
}

// ============================================
// COMPONENTS
// ============================================

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CountdownBlock({ countdown }) {
  if (countdown.expired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2.5 py-3 px-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl"
      >
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <p className="text-xs text-red-300 font-medium">
          Le délai de règlement est dépassé. <span className="text-red-400 font-bold">Des frais de relance supplémentaires</span> peuvent s'appliquer.
        </p>
      </motion.div>
    );
  }

  const blocks = [
    { value: countdown.days, label: 'j' },
    { value: countdown.hours, label: 'h' },
    { value: countdown.minutes, label: 'min' },
    { value: countdown.seconds, label: 's' },
  ];

  return (
    <div className="flex items-center gap-2.5 py-2.5 px-4 bg-orange-500/[0.06] border border-orange-500/[0.15] rounded-xl">
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <Timer className="w-4 h-4 text-orange-400 shrink-0" />
      </motion.div>
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-gray-400 shrink-0">Délai restant :</p>
        <div className="flex items-center gap-1">
          {blocks.map(({ value, label }) => (
            <div key={label} className="flex items-center">
              <motion.span
                key={`${label}-${value}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 bg-orange-500/10 border border-orange-500/20 rounded text-orange-300 text-xs font-bold font-mono"
              >
                {String(value).padStart(2, '0')}
              </motion.span>
              <span className="text-[10px] text-gray-500 ml-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendedBadge({ text = 'Le + choisi', color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-500/20 border-violet-500/30 text-violet-300',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    green: 'bg-green-500/20 border-green-500/30 text-green-300',
  };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}
    >
      <Sparkles className="w-2.5 h-2.5" />
      {text}
    </motion.span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function FacturePage() {
  const [params] = useSearchParams();
  const id = params.get('id') || 'F-DEMO-001';
  const ref = params.get('ref') || 'FAC-2024-1234';
  const montantRaw = params.get('montant') || '1 226,00';
  const nom = params.get('nom') || '';
  const entreprise = params.get('entreprise') || '';
  const isMobile = useIsMobile();
  const companiesCount = useCountUp(13247, 1800, 800);

  const bnplRefused = params.get('bnpl_refused') === '1';

  const deadlineParam = params.get('deadline');
  const deadline = deadlineParam || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  })();
  const countdown = useCountdown(deadline);

  const [paymentLoading, setPaymentLoading] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [showBnplRefused, setShowBnplRefused] = useState(bnplRefused);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const amounts = useMemo(() => {
    const cleaned = String(montantRaw).replace(/\s/g, '').replace(/€/g, '').replace(',', '.');
    const montant = parseFloat(cleaned) || 0;
    const markup = Math.round(montant * BNPL_MARKUP_RATE * 100) / 100;
    const totalBnpl = Math.round((montant + markup) * 100) / 100;
    const monthly = Math.round((totalBnpl / 3) * 100) / 100;
    return { montant, markup, totalBnpl, monthly };
  }, [montantRaw]);

  const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function handlePayment(mode) {
    setPaymentLoading(mode);
    setPaymentError('');
    setShowBnplRefused(false);
    try {
      const res = await fetch(`${STRIPE_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ref,
          mode,
          montant: montantRaw,
          deadline,
          nom,
          entreprise,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setPaymentError(data.error || 'Impossible de créer la session de paiement.');
      }
    } catch {
      setPaymentError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setPaymentLoading(null);
    }
  }

  const infoRows = [
    ...(montantRaw ? [{ icon: CreditCard, label: 'Montant dû', value: montantRaw + ' €', mono: false, highlight: true }] : []),
    ...(ref ? [{ icon: FileText, label: 'Référence facture', value: ref, mono: false }] : []),
    ...(entreprise ? [{ icon: Building2, label: 'Émise par', value: entreprise, mono: false }] : []),
    ...(nom ? [{ icon: User, label: 'Débiteur', value: nom, mono: false }] : []),
    { icon: Hash, label: 'N° de dossier', value: id, mono: true },
  ];

  return (
    <DebtorLayout>
      {/* Hero heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            {!isMobile && (
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg" />
            )}
            <motion.div
              className="relative w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
              animate={isMobile ? {} : { y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FileText className="w-5 h-5 text-blue-400" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {ref ? 'Détail de votre facture' : 'Détail de votre impayé'}
            </h1>
            <p className="text-sm text-gray-500">{entreprise ? `Facture émise par ${entreprise}` : 'Dossier en attente de règlement'}</p>
          </div>
        </div>
      </motion.div>

      {/* Dossier card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        whileHover={isMobile ? {} : { y: -4, scale: 1.005 }}
        className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 mb-4 overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] transition-shadow"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent rounded-2xl pointer-events-none" />
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informations du dossier</h2>
        <div>
          {infoRows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease }}
              className="flex items-center justify-between py-2.5 border-b border-white/[0.06]"
            >
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <row.icon className="w-3.5 h-3.5 text-gray-600" />
                {row.label}
              </div>
              <span className={`font-semibold ${row.mono ? 'font-mono' : ''} ${row.highlight ? 'text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent' : 'text-sm text-white'}`}>
                {row.value}
              </span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + infoRows.length * 0.1, ease }}
            className="flex items-center justify-between py-2.5"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              Statut
            </div>
            <motion.span
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              En attente de règlement
            </motion.span>
          </motion.div>
        </div>
      </motion.div>

      {/* Countdown d'urgence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18, ease }}
        className="mb-4"
      >
        <CountdownBlock countdown={countdown} />
        {!countdown.expired && (
          <p className="text-[11px] text-gray-600 mt-1.5 pl-1">
            Réglez avant le <span className="text-orange-400 font-semibold">{deadline}</span> pour éviter les frais de relance
          </p>
        )}
      </motion.div>

      {/* BNPL Refusé */}
      <AnimatePresence>
        {showBnplRefused && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-start gap-2.5 py-3 px-4 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-300 font-medium mb-1">
                  Dossier non éligible au paiement en plusieurs fois
                </p>
                <p className="text-xs text-gray-400">
                  Merci de régulariser par carte bancaire pour éviter les frais de relance.
                </p>
              </div>
              <button
                onClick={() => setShowBnplRefused(false)}
                className="text-gray-500 hover:text-white text-xs ml-auto shrink-0"
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD PAIEMENT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease }}
        whileHover={isMobile ? {} : { y: -4, scale: 1.005 }}
        className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 mb-4 overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] transition-shadow"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent rounded-2xl pointer-events-none" />

        {/* Background orbs */}
        {!isMobile && (
          <>
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(16px)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease }}
        >
          <h2 className="text-lg font-bold mb-1">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Régulariser</span>
            <span className="text-white"> mon impayé</span>
          </h2>
          <p className="text-sm text-gray-400 mb-5">Choisissez le mode de règlement qui vous convient.</p>
        </motion.div>

        {/* SECTION 1 : FACILITÉS DE PAIEMENT (BNPL) — EN PREMIER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.33, ease }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <BadgePercent className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-gray-300">Facilités de paiement</span>
            <RecommendedBadge text="Le + choisi" color="violet" />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Card Particulier — Klarna 3x */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.38, ease }}
              whileHover={isMobile ? {} : { y: -3, boxShadow: '0 8px 30px rgba(139,92,246,0.15)' }}
              className="flex-1 relative bg-white/[0.02] border border-violet-500/20 rounded-xl p-4 hover:border-violet-500/40 hover:bg-violet-500/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <motion.div
                  animate={isMobile ? {} : { y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <User className="w-3.5 h-3.5 text-violet-400" />
                </motion.div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Particulier</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-2 ml-5">Je paie avec ma carte personnelle</p>

              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-white">
                  {fmt(amounts.monthly)} <span className="text-sm text-gray-400 font-normal">€/mois</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  soit {fmt(amounts.totalBnpl)} € en 3 mensualités
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  dont {fmt(amounts.markup)} € de frais de dossier
                </p>
              </div>

              <motion.button
                onClick={() => handlePayment('installments')}
                disabled={!!paymentLoading}
                whileHover={isMobile || !!paymentLoading ? {} : { scale: 1.02 }}
                whileTap={!!paymentLoading ? {} : { scale: 0.98 }}
                className="relative overflow-hidden flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 border border-violet-500/30 text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                  animate={{ x: ['-150%', '150%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                />
                {paymentLoading === 'installments' ? (
                  <><Spinner /><span className="relative z-10">Redirection...</span></>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Payer en 3×</span>
                  </>
                )}
              </motion.button>
              <p className="text-center text-[10px] text-gray-500 mt-2">3 mensualités par carte bancaire</p>
            </motion.div>

            {/* Card Professionnel — Paiement différé 30j */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.42, ease }}
              whileHover={isMobile ? {} : { y: -3, boxShadow: '0 8px 30px rgba(59,130,246,0.15)' }}
              className="flex-1 bg-white/[0.02] border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <motion.div
                  animate={isMobile ? {} : { y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                </motion.div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Professionnel</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-2 ml-5">Je paie avec une carte entreprise</p>

              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-white">
                  {fmt(amounts.totalBnpl)} <span className="text-sm text-gray-400 font-normal">€</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Débité dans 30 jours
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  dont {fmt(amounts.markup)} € de frais de dossier
                </p>
              </div>

              <button
                onClick={() => handlePayment('deferred')}
                disabled={!!paymentLoading}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600/80 to-cyan-500/80 border border-blue-500/30 text-white font-semibold text-sm hover:from-blue-600 hover:to-cyan-500 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading === 'deferred' ? (
                  <><Spinner />Redirection...</>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    Payer dans 30 jours
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-500 mt-2">Vérification instantanée (SIRET)</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.48, ease }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-gray-500 bg-[#0a0f1a] px-3 shrink-0">ou réglez en une fois</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </motion.div>

        {/* SECTION 2 : PAIEMENT CB 1x — SECONDAIRE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease }}
        >
          <motion.button
            onClick={() => handlePayment('instant')}
            disabled={!!paymentLoading}
            whileHover={isMobile || !!paymentLoading ? {} : { scale: 1.01 }}
            whileTap={!!paymentLoading ? {} : { scale: 0.99 }}
            className="relative overflow-hidden flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.07] hover:border-white/[0.15] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {paymentLoading === 'instant' ? (
              <><Spinner /><span className="relative z-10">Redirection sécurisée...</span></>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span>Régler {montantRaw} € maintenant</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </>
            )}
          </motion.button>
          <p className="text-center text-[11px] text-gray-600 mt-1.5">
            Paiement sécurisé par carte bancaire — sans frais de dossier</p>
          {entreprise && <p className="text-center text-[11px] text-gray-500 mt-0.5">Votre paiement sera versé à <span className="font-semibold text-gray-300">{entreprise}</span></p>}
        </motion.div>

        {/* Erreur paiement */}
        <AnimatePresence>
          {paymentError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-3"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{paymentError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease }}
          className="flex flex-col items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              {['bg-blue-500', 'bg-cyan-500', 'bg-violet-500'].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.6 + i * 0.08 }}
                  className={`w-5 h-5 rounded-full ${c} border-2 border-[#0a0f1a]`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <span className="text-white font-semibold">+{companiesCount.toLocaleString('fr-FR')}</span>{' '}
              entreprises font confiance à BoosterPay
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Remboursement sous 48h si erreur</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <motion.span
              animate={isMobile ? {} : { rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              ⭐
            </motion.span>
            4.8/5 — Paiement sécurisé et rapide
          </div>
        </motion.div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mt-4 pt-4 border-t border-white/[0.06]">
          {[
            { icon: Shield, label: 'Paiement sécurisé' },
            { icon: Lock, label: 'SSL chiffré' },
            { icon: Building2, label: 'Hébergé en France' },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 + i * 0.08, ease }}
              className="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <motion.div
                animate={isMobile ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
              >
                <Icon className="w-3.5 h-3.5 text-green-400" />
              </motion.div>
              {label}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contestation link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center text-xs text-gray-600"
      >
        Un problème avec cette facture ?{' '}
        <a
          href={`/contestation?id=${id}${ref ? `&ref=${ref}` : ''}`}
          className="text-gray-400 underline hover:text-white transition-colors"
        >
          Nous contacter
        </a>
      </motion.p>
    </DebtorLayout>
  );
}
