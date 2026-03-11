import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Shield, Lock,
  CalendarDays, CreditCard, Clock, Hash, Building2, AlertCircle, User
} from 'lucide-react';
import DebtorLayout, { useIsMobile } from './components/DebtorLayout';

const ease = [0.22, 1, 0.36, 1];

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

const STRIPE_WEBHOOK = import.meta.env.VITE_STRIPE_WEBHOOK_URL
  || 'https://hook.eu2.make.com/VOTRE_WEBHOOK_STRIPE';

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function FacturePage() {
  const [params] = useSearchParams();
  const id = params.get('id') || 'F-DEMO-001';
  const ref = params.get('ref') || 'FAC-2024-1234';
  const montant = params.get('montant') || '1 226,00';
  const isMobile = useIsMobile();
  const companiesCount = useCountUp(13247, 1800, 800);

  const deadlineParam = params.get('deadline');
  const deadline = deadlineParam || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const [paymentLoading, setPaymentLoading] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  async function handlePayment(mode) {
    setPaymentLoading(mode);
    setPaymentError('');
    try {
      const res = await fetch(STRIPE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ref, mode, montant, return_url: window.location.href }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setPaymentError('Impossible de créer la session de paiement.');
      }
    } catch {
      setPaymentError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setPaymentLoading(null);
    }
  }

  const infoRows = [
    ...(montant ? [{ icon: CreditCard, label: 'Montant', value: montant + ' €', mono: false, highlight: true }] : []),
    ...(ref ? [{ icon: FileText, label: 'Référence facture', value: ref, mono: false }] : []),
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
            <p className="text-sm text-gray-500">Dossier en attente de règlement</p>
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

      {/* Bandeau d'urgence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18, ease }}
        className="flex items-center gap-2.5 mb-4 py-2.5 px-4 bg-orange-500/[0.06] border border-orange-500/[0.15] rounded-xl"
      >
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Clock className="w-4 h-4 text-orange-400" />
        </motion.div>
        <p className="text-xs text-gray-400">
          Réglez avant le{' '}
          <motion.span
            animate={{ color: ['#fdba74', '#fb923c', '#fdba74'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-semibold"
          >
            {deadline}
          </motion.span>{' '}
          pour éviter les frais de relance
        </p>
      </motion.div>

      {/* Paiement card */}
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
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(16px)' }}
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

        {/* CTA 1 — Régler maintenant */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease }}
          className="relative mb-1.5"
        >
          {!isMobile && (
            <motion.div
              className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 opacity-40 blur-lg"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <motion.button
            onClick={() => handlePayment('instant')}
            disabled={!!paymentLoading}
            whileHover={isMobile || !!paymentLoading ? {} : { scale: 1.02 }}
            whileTap={!!paymentLoading ? {} : { scale: 0.98 }}
            className="relative overflow-hidden flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white font-bold text-base disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Régler maintenant"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ['-150%', '150%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            />
            {paymentLoading === 'instant' ? (
              <>
                <Spinner />
                <span className="relative z-10">Redirection sécurisée...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={isMobile ? {} : { rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <CreditCard className="w-5 h-5" />
                </motion.div>
                <span className="relative z-10 text-lg">Régler maintenant</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Réassurance sous CTA principal */}
        <p className="text-center text-[11px] text-gray-500 mb-4">
          Paiement sécurisé par carte bancaire
        </p>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.45, ease }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs text-gray-500 bg-[#0a0f1a] px-3 shrink-0">
            ou choisissez une facilité de paiement
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </motion.div>

        {/* Deux cards particulier / pro */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Card Particulier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.5, ease }}
            whileHover={isMobile ? {} : { y: -3, boxShadow: '0 8px 30px rgba(139,92,246,0.15)' }}
            className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-violet-500/30 hover:bg-violet-500/[0.03] transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <motion.div
                animate={isMobile ? {} : { y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <User className="w-3.5 h-3.5 text-violet-400" />
              </motion.div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Particulier</span>
            </div>
            <button
              onClick={() => handlePayment('installments')}
              disabled={!!paymentLoading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600/80 to-purple-500/80 border border-violet-500/30 text-white font-semibold text-sm hover:from-violet-600 hover:to-purple-500 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading === 'installments' ? (
                <>
                  <Spinner />
                  Redirection...
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4" />
                  Payer en 3×
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2">3 mensualités</p>
          </motion.div>

          {/* Card Professionnel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.55, ease }}
            whileHover={isMobile ? {} : { y: -3, boxShadow: '0 8px 30px rgba(59,130,246,0.15)' }}
            className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <motion.div
                animate={isMobile ? {} : { y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
              </motion.div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Professionnel</span>
            </div>
            <button
              onClick={() => handlePayment('deferred')}
              disabled={!!paymentLoading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600/80 to-cyan-500/80 border border-blue-500/30 text-white font-semibold text-sm hover:from-blue-600 hover:to-cyan-500 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading === 'deferred' ? (
                <>
                  <Spinner />
                  Redirection...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Payer dans 30 j.
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2">Vérification instantanée</p>
          </motion.div>
        </div>

        {/* Erreur paiement */}
        {paymentError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{paymentError}</p>
          </motion.div>
        )}

        {/* Social proof — dans la card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease }}
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
        transition={{ duration: 0.5, delay: 0.45 }}
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
