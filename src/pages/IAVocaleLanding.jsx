import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Phone,
  Menu,
  X,
  ArrowRight,
  Check,
  RefreshCw,
  CalendarCheck,
  Upload,
  TrendingUp,
  FileText,
  Bot,
  Calendar,
  Wrench,
  Heart,
  Eye,
  Scissors,
  Activity,
  Gift,
  Users,
  Clock,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  Target,
  BarChart3,
  Timer,
  CheckCircle2,
  PhoneCall,
  CalendarDays,
  FileSpreadsheet,
  UserPlus,
  ArrowUpRight,
  HelpCircle,
  MessageSquare,
  Mail,
  MapPin,
  Search,
  Package,
  Quote,
} from 'lucide-react';
import { captureLeadFromSite } from '../services/leadService';
import Papa from 'papaparse';
import EmailCapturePopup from '../components/EmailCapturePopup';
import FloatingContact from '../components/FloatingContact';
import ExitIntentPopup from '../components/ExitIntentPopup';
import SignupModal from '../components/SignupModal';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const isMobileFR = (phone) => {
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  return /^(06|07|\+336|\+337|00336|00337)/.test(cleaned);
};

// Hook global : détecte mobile via matchMedia (perf > inline checks)
// Sert à désactiver les effets coûteux (parallax, springs, gros blurs) sur mobile
const useIsMobileDevice = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    // Safari < 14 fallback
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);
  return isMobile;
};

// Détecte si l'utilisateur préfère réduire les animations (accessibilité + perf)
const usePrefersReducedMotion = () => {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);
  return reduce;
};

/* ------------------------------------------------------------------ */
/*  Utility components                                                 */
/* ------------------------------------------------------------------ */

const ScrollReveal = ({ children, y = 30, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0.01, y }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    viewport={{ once: true, margin: '-60px' }}
    className={className}
    style={{ willChange: 'transform, opacity' }}
  >
    {children}
  </motion.div>
);

const SectionHeading = ({ tag, title, subtitle }) => (
  <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
    {tag && (
      <ScrollReveal y={16}>
        <span className="inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.12em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-3.5 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {tag}
        </span>
      </ScrollReveal>
    )}
    <ScrollReveal y={24} delay={0.05}>
      <h2 className="text-[34px] sm:text-[44px] md:text-[54px] lg:text-[60px] font-extrabold text-gray-900 leading-[1.02] tracking-[-0.025em]">
        {title}
      </h2>
    </ScrollReveal>
    {subtitle && (
      <ScrollReveal y={24} delay={0.12}>
        <p className="text-[16.5px] md:text-[18px] lg:text-[19px] text-gray-500 max-w-2xl leading-[1.55] mt-6 mx-auto font-normal">
          {subtitle}
        </p>
      </ScrollReveal>
    )}
  </div>
);

const GradientText = ({ children, className = '' }) => (
  <span className={`bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

/**
 * FinalCtaInline — CTA final avec email inline + bouton (capture directe).
 * Si l'email est valide, on déclenche le popup pré-rempli.
 */
const FinalCtaInline = ({ openPopup }) => {
  const [email, setEmail] = useState('');
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = (e) => {
    e.preventDefault();
    // On ouvre le popup avec l'email pré-rempli (le popup est la source de vérité)
    if (validEmail(email)) {
      try { sessionStorage.setItem('bp_prefill_email', email); } catch (e2) {}
      openPopup('cta-final', 'gratuit');
    } else {
      openPopup('cta-final', 'gratuit');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        autoComplete="email"
        inputMode="email"
        style={{ fontSize: 16 }}
        className="flex-1 px-5 py-4 rounded-full bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 border border-gray-200 transition-all"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-6 py-4 rounded-full transition-all whitespace-nowrap hover:scale-[1.02]"
        style={{ boxShadow: '0 12px 32px -8px rgba(16, 185, 129, 0.5)' }}
      >
        Démarrer mon essai 7 jours <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

/**
 * LiveCounter — Compteur live FOMO : "X appels traités par l'IA en ce moment".
 * Incrémente le compteur "cette semaine" toutes les 8-15 secondes pour donner
 * une sensation de plateforme vivante et active. Pulse vert animé.
 */
const LiveCounter = () => {
  const [liveNow, setLiveNow] = useState(() => Math.floor(Math.random() * 4) + 2); // 2-5
  const [weekTotal, setWeekTotal] = useState(() => 847 + Math.floor(Math.random() * 30));

  useEffect(() => {
    const tick = () => {
      // Légère variation aléatoire pour "live"
      setLiveNow(() => Math.floor(Math.random() * 5) + 1); // 1-5
      setWeekTotal((prev) => prev + Math.floor(Math.random() * 3) + 1); // +1-3
    };
    const id = setInterval(tick, 8000 + Math.random() * 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-fade hero-fade-4 mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-[12.5px] text-emerald-800 font-medium">
        <span className="font-bold tabular-nums">{liveNow}</span> appels traités par l'IA en ce moment
        <span className="text-emerald-600/70 mx-1.5">·</span>
        <span className="font-bold tabular-nums">{weekTotal.toLocaleString('fr-FR')}</span> cette semaine
      </span>
    </div>
  );
};

/**
 * MobileStickyCTA — Barre CTA collante en bas d'écran sur mobile uniquement.
 * Apparaît après un scroll initial (~300px) pour ne pas masquer le hero.
 */
const MobileStickyCTA = ({ openPopup }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      // Apparaît après 300px, masquée près du footer (-1000px du bas)
      const nearBottom = window.innerHeight + y >= document.body.offsetHeight - 200;
      setShow(y > 300 && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Toggle CSS var globale → FloatingContact lit `--bp-fab-bottom` pour se décaler
  // au-dessus du sticky CTA quand il est visible (évite collision en bas-droite).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (show) {
      document.body.style.setProperty('--bp-fab-bottom', '5.5rem');
    } else {
      document.body.style.removeProperty('--bp-fab-bottom');
    }
    return () => { document.body.style.removeProperty('--bp-fab-bottom'); };
  }, [show]);
  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-[55] transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)',
        paddingTop: '0.5rem',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <div className="px-4">
        <button
          type="button"
          onClick={() => openPopup('mobile-sticky', 'gratuit')}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_10px_24px_-8px_rgba(16,185,129,0.55)] active:scale-[0.98] transition-transform"
        >
          Démarrer mon essai 7 jours <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * HowItWorksTimeline — Animation Apple-style pour les 4 étapes.
 * - Ligne connectrice qui se dessine au scroll (SVG stroke-dashoffset)
 * - Chaque étape apparaît en cascade avec spring physics
 * - Icône : scale 0.6 → 1 + rotate -90 → 0 + opacity 0 → 1
 * - Numéro "Étape N" : pop-in après l'icône
 * - Titre + description : fade up séquentiel
 * - Hover : lift + ring + glow subtil
 */
const HowItWorksTimeline = ({ steps }) => {
  const ref = useRef(null);
  // Marge inView moins agressive (-20px) pour garantir le trigger même sur petits viewports
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const isMobile = useIsMobileDevice();
  const reduceMotion = usePrefersReducedMotion();

  // Easing Apple — cubic-bezier(0.16, 1, 0.3, 1) = easeOutExpo
  const appleEase = [0.16, 1, 0.3, 1];

  // Sur mobile : pas de spring rotate ni glow lourd → animations légères GPU-friendly
  const useLight = isMobile || reduceMotion;

  // Filet de sécurité : si après 800 ms inView est toujours false (rare bug
  // mobile / lazy hydration), on force l'affichage pour éviter une grosse
  // zone blanche entre les sections.
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 800);
    return () => clearTimeout(t);
  }, []);
  const shouldShow = inView || forceShow;

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto mt-4">
      {/* Connector line (desktop only) — se dessine progressivement */}
      <svg
        className="hidden sm:block absolute top-[44px] left-0 right-0 mx-auto pointer-events-none"
        viewBox="0 0 1000 4"
        preserveAspectRatio="none"
        style={{ width: 'calc(100% - 22%)', maxWidth: '700px', left: '50%', transform: 'translateX(-50%)' }}
      >
        <defs>
          <linearGradient id="hiw-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="50%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0" y1="2" x2="1000" y2="2"
          stroke="url(#hiw-line)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={shouldShow ? { pathLength: 1 } : {}}
          transition={{ duration: 1.4, ease: appleEase, delay: 0.2 }}
        />
      </svg>

      <div className="grid sm:grid-cols-3 gap-12 sm:gap-8 md:gap-12 lg:gap-16">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const baseDelay = useLight ? 0.05 + i * 0.08 : 0.35 + i * 0.18;
          return (
            <div key={i} className="text-center relative group">
              {/* Numéro géant en filigrane — fade simple sur mobile */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={shouldShow ? { opacity: 1 } : {}}
                transition={{ duration: useLight ? 0.4 : 0.9, ease: appleEase, delay: baseDelay - 0.05 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-[120px] font-black leading-none tracking-tighter text-gray-100 pointer-events-none select-none"
                style={{ willChange: 'opacity' }}
                aria-hidden="true"
              >
                0{i + 1}
              </motion.span>

              {/* Glow — désactivé sur mobile (keyframes lourds) */}
              {!useLight && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)', willChange: 'transform, opacity' }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={shouldShow ? { opacity: [0, 0.7, 0], scale: [0.4, 1.4, 1.6] } : {}}
                  transition={{ duration: 1.2, ease: appleEase, delay: baseDelay - 0.1, times: [0, 0.5, 1] }}
                />
              )}

              {/* Icône — fade + translate simple sur mobile, spring rotate sur desktop */}
              <motion.div
                initial={useLight ? { opacity: 0, y: 14 } : { opacity: 0, scale: 0.5, rotate: -90 }}
                animate={shouldShow ? (useLight ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, rotate: 0 }) : {}}
                transition={useLight
                  ? { duration: 0.45, ease: appleEase, delay: baseDelay }
                  : { type: 'spring', stiffness: 280, damping: 22, delay: baseDelay }}
                whileHover={useLight ? undefined : { scale: 1.08, rotate: 4, transition: { type: 'spring', stiffness: 400, damping: 16 } }}
                className="relative w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] mx-auto rounded-[24px] sm:rounded-[28px] flex items-center justify-center mb-7 sm:mb-8 z-10"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                  boxShadow: useLight
                    ? '0 12px 24px -8px rgba(16,185,129,0.4)'
                    : '0 20px 44px -10px rgba(16,185,129,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset',
                  willChange: 'transform, opacity',
                }}
              >
                <StepIcon className="w-9 h-9 sm:w-10 sm:h-10 text-white" strokeWidth={1.6} />
                {!useLight && (
                  <span
                    className="absolute inset-x-2 top-2 h-[20px] rounded-[20px] pointer-events-none opacity-40"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)' }}
                  />
                )}
              </motion.div>

              {/* Titre */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={shouldShow ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: useLight ? 0.4 : 0.65, ease: appleEase, delay: baseDelay + (useLight ? 0.06 : 0.22) }}
                className="text-[22px] sm:text-[24px] lg:text-[26px] font-extrabold text-gray-900 tracking-[-0.02em] mb-3 leading-[1.15]"
                style={{ willChange: 'transform, opacity' }}
              >
                {step.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={shouldShow ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: useLight ? 0.4 : 0.65, ease: appleEase, delay: baseDelay + (useLight ? 0.12 : 0.32) }}
                className="text-[15px] lg:text-[15.5px] text-gray-500 leading-[1.55] max-w-[280px] mx-auto"
                style={{ willChange: 'transform, opacity' }}
              >
                {step.desc}
              </motion.p>
            </div>
          );
        })}
      </div>
    </div>
  );
};


/**
 * SimplicityShowcase — Animation pédagogique 3 étapes :
 * 1. Réception 24/7 toujours active (badge ON)
 * 2. Le commerçant choisit + active les modules dont il a besoin
 * 3. Le robot vocal appelle les contacts injectés
 *
 * Cycle infini, illustre la simplicité du choix utilisateur.
 */
const SimplicityShowcase = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 3200);
    return () => clearInterval(id);
  }, []);

  const modules = [
    { id: 'rdv', label: 'Confirmation RDV', icon: CalendarCheck, color: 'blue', count: '8 contacts' },
    { id: 'paiements', label: 'Accélération paiements', icon: Zap, color: 'rose', count: '5 factures' },
  ];

  return (
    <div className="mb-16 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header — étape en cours */}
        <div className="px-6 sm:px-8 pt-7 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Étape {step + 1} sur 3
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-gray-900 tracking-tight leading-tight">
                {step === 0 && 'La Réception d\'appels 24/7 est déjà active.'}
                {step === 1 && 'Vous activez les modules dont vous avez besoin.'}
                {step === 2 && 'L\'IA appelle vos contacts. Vous récoltez les résultats.'}
              </h3>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === step ? 'w-8 bg-emerald-500' : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-3 gap-0">
          {/* Step 1 — Réception 24/7 */}
          <div
            className={`p-6 sm:p-7 border-r border-gray-100 transition-all duration-500 ${
              step === 0 ? 'bg-amber-50/40' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                step === 0
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
                  : 'bg-amber-100'
              }`}>
                <PhoneCall className={`w-5 h-5 ${step === 0 ? 'text-white' : 'text-amber-600'}`} strokeWidth={2} />
                {step === 0 && (
                  <span className="absolute inset-0 rounded-2xl animate-ping bg-amber-400/40" />
                )}
              </div>
              <div>
                <div className="text-[14px] font-bold text-gray-900">Réception 24/7</div>
                <div className="text-[11.5px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Toujours active
                </div>
              </div>
            </div>
            <p className="text-[12.5px] text-gray-600 leading-relaxed">
              C'est la base. Quand vous ne décrochez pas, l'IA répond, qualifie et vous envoie le lead par SMS.
            </p>
          </div>

          {/* Step 2 — Modules choisis */}
          <div
            className={`p-6 sm:p-7 border-r border-gray-100 transition-all duration-500 ${
              step === 1 ? 'bg-blue-50/40' : 'bg-white'
            }`}
          >
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Vos contacts injectés
            </div>
            <div className="space-y-2">
              {modules.map((m, i) => {
                const isShown = step >= 1;
                return (
                  <motion.div
                    key={m.id}
                    initial={false}
                    animate={{
                      opacity: isShown ? 1 : 0.3,
                      x: isShown ? 0 : -10,
                    }}
                    transition={{ delay: step === 1 ? i * 0.2 : 0, duration: 0.4 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isShown ? `bg-${m.color}-50 border-${m.color}-200` : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${m.color}-500`}>
                      <m.icon className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 truncate">{m.label}</div>
                      <div className="text-[11px] text-gray-500">{m.count}</div>
                    </div>
                    {isShown && step === 1 && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={3} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Step 3 — IA appelle */}
          <div
            className={`p-6 sm:p-7 transition-all duration-500 ${
              step === 2 ? 'bg-emerald-50/40' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                step === 2
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                  : 'bg-emerald-100'
              }`}>
                <Bot className={`w-5 h-5 ${step === 2 ? 'text-white' : 'text-emerald-600'}`} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-gray-900">Robot vocal</div>
                <div className="text-[11.5px] text-gray-500">{step === 2 ? 'Appelle vos contacts' : 'Prêt à démarrer'}</div>
              </div>
            </div>

            {/* Voiceform / waveform animée */}
            <div className="flex items-end gap-1 h-10 mb-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    background: step === 2
                      ? 'linear-gradient(180deg, #10B981, #14B8A6)'
                      : '#E5E7EB',
                    minHeight: 3,
                  }}
                  animate={
                    step === 2
                      ? { height: [`${20 + (i * 11) % 70}%`, `${30 + (i * 17) % 60}%`, `${15 + (i * 7) % 80}%`] }
                      : { height: '20%' }
                  }
                  transition={{ duration: 1.2 + (i % 4) * 0.2, repeat: step === 2 ? Infinity : 0, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <p className="text-[12.5px] text-gray-600 leading-relaxed">
              {step === 2
                ? '13 appels en cours · Transcription temps réel · Synthèse dans votre CRM.'
                : 'L\'IA appelle dès que vous avez injecté vos contacts.'}
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
          <p className="text-[12.5px] text-gray-500">
            <span className="font-semibold text-gray-900">Vous choisissez les modules.</span> L'IA fait le reste.
          </p>
        </div>
      </div>
    </div>
  );
};


/**
 * Bandeau de preuve sociale + urgence sous la navbar.
 * Affiche un compteur fictif réaliste qui varie au cours de la journée
 * (entre 7 et 22 selon l'heure) — donne une sensation de live sans backend.
 */
const UrgencyBanner = () => {
  const [count, setCount] = useState(12);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Compteur réaliste : 7 le matin → 22 en fin de journée
    const compute = () => {
      const h = new Date().getHours();
      const base = h < 9 ? 7 : h < 12 ? 11 : h < 15 ? 15 : h < 18 ? 19 : 22;
      // Petit jitter entre +0 et +2 pour donner une variation légère
      const jitter = Math.floor(Math.random() * 3);
      return base + jitter;
    };
    setCount(compute());
    const id = setInterval(() => setCount(compute()), 45000);
    return () => clearInterval(id);
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[51] bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-[12.5px] font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-center gap-3">
        <span className="relative flex w-2 h-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="text-center">
          <span className="font-bold tabular-nums">{count}</span>
          <span> professionnels ont activé leur IA vocale aujourd'hui</span>
          <span className="hidden sm:inline"> · Offre valable ce mois-ci</span>
        </span>
        <button
          onClick={() => setHidden(true)}
          aria-label="Fermer le bandeau"
          className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors shrink-0"
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

const IA_VOCALE_PLANS = [
  { id: 'decouverte', name: 'Essai 7 jours', price: '0€', desc: '7 jours offerts · Numéro local actif · Tous modules' },
  { id: 'boost', name: 'Pack Boost', price: '199€ HT', desc: '250 appels · Résultats immédiats', badge: null },
  { id: 'business', name: 'Pack Business', price: '349€ HT', desc: '500 appels · Manager dédié', badge: 'Le plus populaire' },
  { id: 'croissance', name: 'Croissance', price: '399€ HT/mois', desc: '1000 appels/mois · Support prioritaire' },
];
// Tous les CTAs landing pointent vers la page d'inscription trial qui collecte
// les 5 champs (nom, mobile, email, code postal, nom commerce) puis crée la
// session Stripe subscription (trial 7j + 99€ HT/mois ensuite).
const TRIAL_INSCRIPTION_URL = '/inscription-trial';
const STRIPE_CHECKOUT_URL = TRIAL_INSCRIPTION_URL;
const STRIPE_LINKS = {
  decouverte: TRIAL_INSCRIPTION_URL,
  boost: TRIAL_INSCRIPTION_URL,
  business: TRIAL_INSCRIPTION_URL,
  croissance: TRIAL_INSCRIPTION_URL,
  'ia-vocale': TRIAL_INSCRIPTION_URL,
  // Anciens plans (redirigés vers le même tunnel)
  'a-la-carte': TRIAL_INSCRIPTION_URL,
  pro: TRIAL_INSCRIPTION_URL,
};

// Nav Apple-minimal : 2 ancres essentielles, le reste se découvre en scrollant
const navLinks = [
  { label: 'Acheter des prospects', href: '#leads-rgpd' },
];

// Liens additionnels affichés uniquement dans le menu mobile (drawer plus tolérant)
const navLinksMobile = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Cas d\'usage', href: '#usecases' },
  { label: 'Acheter des prospects', href: '#leads-rgpd' },
  { label: 'FAQ', href: '#faq' },
];

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */
const AnimatedNumber = ({ value, suffix = '', prefix = '', duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const end = parseInt(value);
    const startTime = performance.now();
    const ms = duration * 1000;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - startTime) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(end * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
};

/* ------------------------------------------------------------------ */
/*  Hero — Services showcase animation                                 */
/* ------------------------------------------------------------------ */
// LA BASE de IA Vocale = Réception d'appels IA 24/7 (placée en première position).
// Les autres entrées sont des MODULES qui s'ajoutent à cette base.
// "short" = titre compact utilisé dans le mockup phone du hero (évite la troncature).
const services = [
  {
    icon: 'PhoneCall',
    title: 'Réception d\'appels IA 24/7',
    short: 'Réception 24/7',
    desc: "La base : quand vous ne décrochez pas, l'IA répond, qualifie et vous envoie le lead.",
    result: '0 appel manqué',
    example: 'Nouveau prospect — Fuite urgente qualifié',
    color: 'amber',
  },
  {
    icon: 'RefreshCw',
    title: 'Renouvellement de dossiers',
    short: 'Renouvellement',
    desc: "L'IA appelle vos clients pour renouveler leurs contrats, dossiers et abonnements.",
    result: '80% de renouvellements',
    example: 'Garage MaxMotors — CT renouvelé',
    color: 'emerald',
  },
  {
    icon: 'CalendarCheck',
    title: 'Confirmation de RDV',
    short: 'Confirmation RDV',
    desc: "Chaque RDV est confirmé par appel automatique. Fini les lapins.",
    result: '-35% de rendez-vous manqués',
    example: 'Salon Bella — RDV confirmé demain 14h',
    color: 'blue',
  },
  {
    icon: 'Bot',
    title: 'Robot IA sur mesure',
    short: 'Robot sur mesure',
    desc: "Un assistant vocal personnalisé pour votre métier, vos scripts, vos process.",
    result: 'Disponible 7j/7 24h/24',
    example: 'Courtier — 12 relances auto cette semaine',
    color: 'violet',
  },
  {
    icon: 'Star',
    title: 'Impact Avis',
    short: 'Impact Avis',
    desc: "L'IA appelle vos clients, qualifie leur ressenti. 4★+ → publication Google. Sinon, retour interne.",
    result: '+5 avis Google par mois',
    example: 'Salon Bella — 4,9/5 étoiles · 38 avis ce mois',
    color: 'yellow',
  },
  {
    icon: 'Zap',
    title: 'Accélération de paiements',
    short: 'Accélération paiements',
    desc: "L'IA relance vos impayés au bon moment, avec le bon ton. Vos délais de paiement raccourcissent.",
    result: 'Délais de paiement -40%',
    example: 'Cabinet Martin — 1 200€ réglés en 4 jours',
    color: 'rose',
  },
];

const iconMap = { RefreshCw, CalendarCheck, PhoneCall, Bot, Star, Zap };
// Toutes les "couleurs" pointent vers emerald — un seul langage visuel Apple sur le iPhone mockup
const _emeraldSet = { bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: 'text-emerald-600', accent: 'bg-emerald-500', light: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' };
const colorMap = {
  emerald: _emeraldSet,
  blue: _emeraldSet,
  amber: _emeraldSet,
  violet: _emeraldSet,
  orange: _emeraldSet,
  rose: _emeraldSet,
  yellow: _emeraldSet,
};

const HeroAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!isInView) return;
    // Boucle infinie sur les 6 services. Chaque slide reste affiché 2.4s,
    // puis une courte pause (600 ms) avant de reprendre du début.
    let cancelled = false;
    let i = 0;
    let timeoutId = null;
    const tick = () => {
      if (cancelled) return;
      setActive(i % services.length);
      i++;
      // Cycle complet : pause un peu plus longue avant de reboucler
      const delay = (i % services.length === 0) ? 3200 : 2400;
      timeoutId = setTimeout(tick, delay);
    };
    timeoutId = setTimeout(tick, 500);
    return () => { cancelled = true; if (timeoutId) clearTimeout(timeoutId); };
  }, [isInView]);

  const svc = active >= 0 ? services[active] : null;
  const Icon = svc ? iconMap[svc.icon] : null;
  const c = svc ? colorMap[svc.color] : null;

  return (
    <div ref={ref} className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto" style={{ willChange: 'transform' }}>
      {/* Phone */}
      <div className="relative bg-gray-950 rounded-[2.8rem] p-[3px] shadow-2xl shadow-gray-900/20">
        <div className="bg-white rounded-[2.6rem] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-4 pb-2">
            <span className="text-[11px] font-semibold text-gray-900">9:41</span>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-gray-950 rounded-b-[20px]" />
            <div className="flex items-center gap-1">
              <div className="w-4 h-2.5 border border-gray-400 rounded-sm relative">
                <div className="absolute inset-[1px] bg-gray-900 rounded-[1px]" style={{ width: '80%' }} />
              </div>
            </div>
          </div>

          <div className="px-5 pb-7 min-h-[460px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pt-1">
              <div>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">BoosterPay</p>
                <p className="text-[15px] font-bold text-gray-900 mt-0.5">Vos services IA</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* 6 service pills — always visible, active one highlighted */}
            <div className="grid grid-cols-2 gap-1.5 mb-5">
              {services.map((s, i) => {
                const SIcon = iconMap[s.icon];
                const sc = colorMap[s.color];
                const isActive = i === active;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all duration-500 ${
                      isActive
                        ? `${sc.bg} border-transparent ring-2 ${sc.ring} scale-[1.02]`
                        : i <= active
                          ? 'bg-gray-50 border-gray-100'
                          : 'bg-gray-50/50 border-gray-50 opacity-40'
                    }`}
                    style={{ transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
                  >
                    <SIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? sc.icon : 'text-gray-400'}`} />
                    <span className={`text-[9.5px] font-semibold leading-tight truncate ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {s.short || s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Active service detail card */}
            <div className="flex-1 flex flex-col justify-center">
              {svc && (
                <div
                  key={active}
                  className="space-y-4"
                  style={{
                    animation: 'heroServiceIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) both',
                  }}
                >
                  {/* Service icon + title */}
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <div>
                      <p className="text-[15px] font-extrabold text-gray-900">{svc.title}</p>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${c.badge}`}>
                        {svc.result}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-gray-600 leading-relaxed">{svc.desc}</p>

                  {/* Example result */}
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className={`w-7 h-7 rounded-lg ${c.accent} flex items-center justify-center shrink-0`}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900">{svc.example}</p>
                      <p className="text-[9px] text-gray-400">Il y a 2 min</p>
                    </div>
                  </div>
                </div>
              )}

              {!svc && (
                <div className="flex items-center justify-center h-full">
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                </div>
              )}
            </div>

            {/* Progress dots — vert uniforme Apple */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i <= active ? 'bg-emerald-500 w-5' : 'bg-emerald-100 w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating result badge */}
      <div
        className="absolute -right-2 top-32 bg-white rounded-2xl shadow-lg shadow-gray-900/8 border border-gray-100 px-3.5 py-2.5 transition-all duration-500 ease-out"
        style={{
          opacity: active >= 3 ? 1 : 0,
          transform: active >= 3 ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.95)',
          willChange: 'transform, opacity',
          transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        <p className="text-[10px] font-bold text-gray-900">6 services actifs</p>
        <p className="text-[9px] text-emerald-600 font-semibold">100% automatisé</p>
      </div>
    </div>
  );
};



/* ------------------------------------------------------------------ */
/*  Robot IA — Examples & Showcase                                     */
/* ------------------------------------------------------------------ */
const robotExamples = [
  { title: 'Relance devis en attente', desc: "L'IA rappelle vos prospects qui n'ont pas signé leur devis. Elle relance avec le bon timing et le bon message.", icon: 'FileText' },
  { title: 'Suivi post-intervention', desc: "Après chaque intervention, l'IA appelle pour vérifier la satisfaction et proposer un prochain RDV.", icon: 'Heart' },
  { title: 'Qualification de leads entrants', desc: "L'IA décroche, pose les bonnes questions, classe le lead (chaud/tiède/froid) et vous envoie le récap.", icon: 'Target' },
  { title: 'Rappel d\'échéances réglementaires', desc: "Contrôles techniques, certifications, formations obligatoires — l'IA rappelle avant expiration.", icon: 'Shield' },
  { title: 'Enquête de satisfaction', desc: "L'IA appelle vos clients après chaque prestation pour recueillir un avis et détecter les insatisfactions.", icon: 'Star' },
];

const robotColors = ['emerald', 'blue', 'amber', 'violet', 'rose'];

const robotIconMap = { FileText, Heart, Target, Shield, Star };

const RobotShowcase = () => {
  const [activeRobot, setActiveRobot] = useState(0);
  const [userClicked, setUserClicked] = useState(false);

  useEffect(() => {
    if (userClicked) return;
    const timer = setInterval(() => {
      setActiveRobot(prev => (prev + 1) % robotExamples.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [userClicked]);

  const handleRobotClick = (i) => {
    setActiveRobot(i);
    setUserClicked(true);
  };

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-8 mt-12">
      {/* Left — robot list */}
      <div className="space-y-2">
        {robotExamples.map((r, i) => {
          const RIcon = robotIconMap[r.icon];
          return (
            <button
              key={i}
              onClick={() => handleRobotClick(i)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                i === activeRobot
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              {RIcon && <RIcon className={`w-4 h-4 flex-shrink-0 ${i === activeRobot ? 'text-emerald-600' : 'text-gray-400'}`} />}
              <span className={`text-sm font-semibold truncate ${i === activeRobot ? 'text-gray-900' : 'text-gray-500'}`}>{r.title}</span>
            </button>
          );
        })}
      </div>

      {/* Right — active robot detail */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 flex flex-col justify-center min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRobot}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-xl font-bold text-gray-900 mb-3">{robotExamples[activeRobot].title}</h4>
            <p className="text-[15px] text-gray-500 leading-relaxed">{robotExamples[activeRobot].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};


/* ------------------------------------------------------------------ */
/*  Metiers data + MetierSelector component                            */
/* ------------------------------------------------------------------ */
const metiers = [
  { name: 'Garagiste', icon: Wrench, s1: 'Relance CT, vidanges, entretiens', s2: 'Confirmation RDV atelier J-1', s3: 'Réception appels pannes 24/7', s4: 'Robot accueil personnalisé', temps: '12h', clients: '+18', ca: '+8 500€', lapins: '-40%', s5: 'Avis Google après chaque réparation', s6: 'Relance factures clients' , rentabilite: '1 contrôle technique récupéré couvre 1 mois d\'abonnement' },
  { name: 'Courtier assurance', icon: Shield, s1: 'Renouvellement contrats auto/habitation', s2: 'Confirmation RDV signature', s3: 'Réception appels sinistres 24/7', s4: 'Robot qualification souscription', temps: '15h', clients: '+25', ca: '+12 000€', lapins: '-35%', s5: 'Avis post-souscription', s6: 'Relance primes en retard' , rentabilite: '1 contrat renouvelé = 2 mois d\'abonnement payés' },
  { name: 'Dentiste', icon: Heart, s1: 'Rappel détartrages & bilans', s2: 'Confirmation RDV patients J-1', s3: 'Réception appels urgences dentaires', s4: 'Robot triage patients', temps: '10h', clients: '+15', ca: '+6 500€', lapins: '-45%', s5: 'Avis post-soins', s6: 'Relance honoraires non réglés' , rentabilite: '2 RDV honorés grâce aux confirmations IA = abonnement remboursé' },
  { name: 'Opticien', icon: Eye, s1: 'Renouvellement lunettes/lentilles', s2: 'Confirmation RDV essayage', s3: 'Réception appels conseils optiques', s4: 'Robot prise de RDV auto', temps: '8h', clients: '+12', ca: '+7 000€', lapins: '-30%', s5: 'Avis après essayage lunettes', s6: 'Relance factures différées' , rentabilite: '1 paire de lunettes vendue = 2 mois d\'abonnement couverts' },
  { name: 'Salon coiffure', icon: Scissors, s1: 'Réactivation clients dormants 3 mois', s2: 'Confirmation RDV coiffure J-1', s3: 'Réception appels réservation', s4: 'Robot conseils personnalisés', temps: '10h', clients: '+20', ca: '+4 500€', lapins: '-50%', s5: 'Avis Google après prestation', s6: 'Relance forfaits impayés' , rentabilite: '5 RDV protégés des lapins = abonnement couvert' },
  { name: 'Kiné / Ostéopathe', icon: Activity, s1: 'Suivi parcours de soins', s2: 'Confirmation séances', s3: 'Réception appels nouveaux patients', s4: 'Robot orientation patients', temps: '8h', clients: '+10', ca: '+3 800€', lapins: '-35%', s5: 'Avis post-séance', s6: 'Relance honoraires patients' , rentabilite: '3 séances honorées = abonnement remboursé' },
  { name: 'Médecin généraliste', icon: Heart, s1: 'Rappel check-up & vaccins', s2: 'Confirmation consultations J-1', s3: 'Réception appels patients 24/7', s4: 'Robot triage & orientation', temps: '14h', clients: '+12', ca: '+5 000€', lapins: '-40%', s5: 'Avis Google patients satisfaits', s6: 'Relance dépassements honoraires' , rentabilite: '4 patients récupérés sur appels manqués = abonnement payé' },
  { name: 'Vétérinaire', icon: Heart, s1: 'Rappel vaccins & vermifuges', s2: 'Confirmation RDV consultations', s3: 'Réception appels urgences animales', s4: 'Robot conseil vétérinaire', temps: '10h', clients: '+14', ca: '+5 500€', lapins: '-35%', s5: 'Avis post-consultation', s6: 'Relance factures soins' , rentabilite: '2 consultations supplémentaires = abonnement couvert' },
  { name: 'Agent immobilier', icon: Users, s1: 'Relance mandats à échéance', s2: 'Confirmation visites acquéreurs', s3: 'Réception appels acquéreurs 24/7', s4: 'Robot qualification achat/location', temps: '14h', clients: '+30', ca: '+15 000€', lapins: '-25%', s5: 'Avis vendeurs/acquéreurs', s6: 'Relance honoraires d\'agence', rentabilite: '1 mandat signé = 30 mois d\'abonnement payés'},
  { name: 'Plombier', icon: Wrench, s1: 'Relance entretiens chaudière', s2: 'Confirmation interventions', s3: 'Réception appels urgences 24/7', s4: 'Robot devis automatique', temps: '12h', clients: '+22', ca: '+9 000€', lapins: '-30%', s5: 'Avis Google post-intervention', s6: 'Relance devis & factures' , rentabilite: '1 dépannage récupéré la nuit = abonnement remboursé' },
  { name: 'Coach sportif', icon: Activity, s1: 'Relance abonnements expirés', s2: 'Confirmation séances', s3: 'Réception appels inscription', s4: 'Robot programme personnalisé', temps: '6h', clients: '+15', ca: '+3 000€', lapins: '-40%', s5: 'Avis clients fidèles', s6: 'Relance abonnements impayés' , rentabilite: '2 nouveaux abonnés = abonnement couvert' },
  { name: 'Restaurant', icon: Gift, s1: 'Relance clients fidèles', s2: 'Confirmation réservations J-1', s3: 'Réception appels réservation 24/7', s4: 'Robot commande & réservation', temps: '8h', clients: '+25', ca: '+5 000€', lapins: '-55%', s5: 'Avis Google clients satisfaits', s6: 'Relance acomptes événements' , rentabilite: '10 couverts protégés des annulations = abonnement payé' },
  { name: 'Salon esthétique', icon: Sparkles, s1: 'Réactivation clientes dormantes', s2: 'Confirmation RDV soins', s3: 'Réception appels prise de RDV', s4: 'Robot conseil beauté', temps: '10h', clients: '+18', ca: '+4 800€', lapins: '-45%', s5: 'Avis post-soin', s6: 'Relance forfaits non réglés' , rentabilite: '4 RDV honorés grâce aux confirmations = abonnement couvert' },
  { name: 'Avocat', icon: Shield, s1: 'Relance dossiers en attente', s2: 'Confirmation RDV consultations', s3: 'Réception appels nouveaux clients', s4: 'Robot prise de brief juridique', temps: '12h', clients: '+10', ca: '+10 000€', lapins: '-30%', s5: 'Avis dossiers clos', s6: 'Relance honoraires en attente' , rentabilite: '1 dossier signé = 5 mois d\'abonnement payés' },
  { name: 'Expert-comptable', icon: FileText, s1: 'Relance bilans & déclarations', s2: 'Confirmation RDV clients', s3: 'Réception appels questions fiscales', s4: 'Robot collecte pièces', temps: '15h', clients: '+12', ca: '+8 000€', lapins: '-25%', s5: 'Avis clients après bilan', s6: 'Relance honoraires & frais' , rentabilite: '1 nouvelle mission = 4 mois d\'abonnement couverts' },
  { name: 'Auto-école', icon: Calendar, s1: 'Relance élèves inactifs', s2: 'Confirmation heures conduite', s3: 'Réception appels inscription', s4: 'Robot planning auto', temps: '10h', clients: '+20', ca: '+6 000€', lapins: '-40%', s5: 'Avis élèves diplômés', s6: 'Relance forfaits non payés' , rentabilite: '2 forfaits permis vendus = abonnement remboursé' },
  { name: 'Électricien', icon: Zap, s1: 'Relance contrôles électriques', s2: 'Confirmation interventions', s3: 'Réception appels dépannage', s4: 'Robot devis électrique', temps: '10h', clients: '+18', ca: '+7 500€', lapins: '-30%', s5: 'Avis Google post-intervention', s6: 'Relance devis & factures' , rentabilite: '1 dépannage récupéré la nuit = abonnement remboursé' },
  { name: 'Pharmacie', icon: Heart, s1: 'Rappel renouvellement ordonnances', s2: 'Confirmation préparations', s3: 'Réception appels conseils', s4: 'Robot suivi traitements', temps: '8h', clients: '+10', ca: '+4 500€', lapins: '-20%', s5: 'Avis clients fidèles', s6: 'Relance avances tiers payant' , rentabilite: '20 ordonnances renouvelées = abonnement couvert' },
  { name: 'Photographe', icon: Eye, s1: 'Relance séances anniversaires', s2: 'Confirmation shoots', s3: 'Réception appels devis', s4: 'Robot portfolio & tarifs', temps: '6h', clients: '+12', ca: '+3 500€', lapins: '-35%', s5: 'Avis clients après livraison', s6: 'Relance acomptes shootings' , rentabilite: '1 shooting récupéré sur appel manqué = abonnement payé' },
  { name: 'Serrurier', icon: Wrench, s1: 'Relance contrats maintenance', s2: 'Confirmation interventions', s3: 'Réception appels urgences 24/7', s4: 'Robot devis serrurerie', temps: '10h', clients: '+20', ca: '+8 000€', lapins: '-25%', s5: 'Avis Google post-dépannage', s6: 'Relance interventions urgences' , rentabilite: '1 dépannage urgence nuit = abonnement remboursé' },
  { name: 'Notaire', icon: FileText, s1: 'Relance signatures & dossiers', s2: 'Confirmation RDV actes', s3: 'Réception appels nouveaux dossiers', s4: 'Robot accueil étude', temps: '12h', clients: '+8', ca: '+10 000€', lapins: '-30%', s5: 'Avis clients post-acte', s6: 'Relance émoluments en attente' , rentabilite: '1 acte signé = plusieurs mois d\'abonnement couverts' },
  { name: 'Paysagiste', icon: Wrench, s1: 'Relance entretiens saisonniers', s2: 'Confirmation interventions', s3: 'Réception appels devis', s4: 'Robot conseil jardin', temps: '8h', clients: '+15', ca: '+5 500€', lapins: '-30%', s5: 'Avis post-aménagement', s6: 'Relance contrats annuels' , rentabilite: '1 chantier récupéré = abonnement remboursé' },
  { name: 'Consultant', icon: Users, s1: 'Relance propositions commerciales', s2: 'Confirmation RDV clients', s3: 'Réception appels prospects', s4: 'Robot qualification projet', temps: '10h', clients: '+8', ca: '+12 000€', lapins: '-20%', s5: 'Avis missions terminées', s6: 'Relance honoraires à échéance' , rentabilite: '1 mission gagnée = plusieurs mois d\'abonnement couverts' },
  { name: 'Centre formation', icon: Users, s1: 'Relance inscriptions', s2: 'Confirmation sessions', s3: 'Réception appels renseignements', s4: 'Robot orientation formation', temps: '10h', clients: '+20', ca: '+8 000€', lapins: '-35%', s5: 'Avis stagiaires diplômés', s6: 'Relance financements OPCO' , rentabilite: '1 inscription en formation = abonnement couvert' },
];


const serviceLabels = [
  { key: 's1', icon: RefreshCw, label: 'Renouvellement', color: 'emerald' },
  { key: 's2', icon: CalendarCheck, label: 'Confirmation RDV', color: 'blue' },
  { key: 's3', icon: PhoneCall, label: 'Réception 24/7', color: 'amber' },
  { key: 's4', icon: Bot, label: 'Robot sur mesure', color: 'violet' },
  { key: 's5', icon: Star, label: 'Impact Avis', color: 'yellow' },
  { key: 's6', icon: Zap, label: 'Accélération paiements', color: 'rose' },
];

const svcColors = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
};

const MetierSelector = ({ openPopup }) => {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState('');
  const [userPicked, setUserPicked] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);

  const featured = [0, 1, 3, 8, 9];
  useEffect(() => {
    if (userPicked || search) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % featured.length;
      setSelected(featured[idx]);
    }, 3500);
    return () => clearInterval(timer);
  }, [userPicked, search]);

  // Détection mobile pour limiter les pills affichés par défaut
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Top 8 métiers populaires affichés par défaut sur mobile
  const POPULAR_INDICES = [0, 1, 2, 3, 8, 9, 11, 16]; // Garagiste, Courtier, Dentiste, Opticien, Agent immo, Plombier, Restaurant, Électricien

  const baseFiltered = search
    ? metiers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : metiers;

  const filtered = (isMobile && !showAllMobile && !search)
    ? POPULAR_INDICES.map(i => metiers[i]).filter(Boolean)
    : baseFiltered;

  const m = selected !== null && selected < metiers.length ? metiers[selected] : null;

  return (
    <div className="mt-6">
      {/* Search */}
      <div className="max-w-md mx-auto mb-8 relative">
        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher votre métier..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(null); setUserPicked(true); }}
          className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm"
        />
      </div>

      {/* Metier pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-5xl mx-auto">
        {filtered.map((met, i) => {
          const realIdx = metiers.indexOf(met);
          const isActive = realIdx === selected;
          const MIcon = met.icon;
          return (
            <button
              key={realIdx}
              onClick={() => { setSelected(realIdx); setUserPicked(true); }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-[1.03]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <MIcon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
              {met.name}
            </button>
          );
        })}
      </div>

      {/* Bouton "Voir les X autres" sur mobile uniquement, si pas en mode recherche */}
      {isMobile && !search && !showAllMobile && (
        <div className="flex justify-center mb-8 -mt-6">
          <button
            type="button"
            onClick={() => setShowAllMobile(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            Voir les {metiers.length - POPULAR_INDICES.length} autres métiers
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Detail card */}
      <AnimatePresence mode="wait">
        {m && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="bg-white rounded-t-[28px] border border-b-0 border-gray-100/80 px-8 pt-8 pb-6 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <m.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{m.name}</h3>
                  <p className="text-sm text-gray-400">Votre combinaison IA optimale</p>
                </div>
              </div>
            </div>

            {/* 6 services grid (3×2 sur desktop, 2×3 sur tablet, 1 colonne sur mobile) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-gray-100/60 shadow-xl shadow-gray-200/30">
              {serviceLabels.map((svc, j) => {
                const sc = svcColors[svc.color];
                const SvcIcon = svc.icon;
                return (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: j * 0.08, duration: 0.3 }}
                    className={`bg-white p-6 ${j === 0 ? '' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* Tous les services en vert uniforme — cohérence Apple */}
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <SvcIcon className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">{svc.label}</span>
                      </div>
                    </div>
                    <p className="text-[14px] text-gray-700 font-medium leading-relaxed">{m[svc.key]}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* KPI bar — fond vert TRÈS CLAIR Apple (zéro fond sombre) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 rounded-b-[28px] overflow-hidden" style={{ backgroundColor: '#F0FDF4', borderTop: '1px solid rgba(16,185,129,0.15)' }}>
              {[
                { value: m.temps, label: 'gagnées/semaine', icon: Clock },
                { value: m.clients, label: 'nouveaux clients/mois', icon: UserPlus },
                { value: m.ca, label: 'de CA en plus/mois', icon: TrendingUp },
                { value: m.lapins, label: 'de lapins', icon: Target },
              ].map((kpi, k) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + k * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-center py-7 px-4 relative"
                  style={{ borderRight: k < 3 ? '1px solid rgba(16,185,129,0.15)' : 'none' }}
                >
                  <kpi.icon className="w-5 h-5 text-emerald-600 mx-auto mb-2" strokeWidth={2.2} />
                  <p className="text-[28px] font-extrabold text-emerald-600 tracking-tight">{kpi.value}</p>
                  <p className="text-[11px] text-gray-500 font-medium mt-1">{kpi.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Rentabilité — temps de retour sur investissement adapté au métier */}
            {m.rentabilite && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-emerald-50/40 px-6 py-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                  <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <div className="flex-1">
                  <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-emerald-700">
                    Vous récupérez votre investissement
                  </p>
                  <p className="text-[15.5px] font-bold text-gray-900 mt-1 leading-snug">
                    {m.rentabilite}
                  </p>
                </div>
              </motion.div>
            )}

            {/* CTA simple : un seul bouton centré, pas de card "6 modules" */}
            <div className="mt-8 flex justify-center">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); openPopup('metier-cta', 'gratuit'); }}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold px-7 py-3 rounded-full text-sm hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
              >
                Démarrer mon essai 7 jours <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



/* ------------------------------------------------------------------ */
/*  SERVICE SHOWCASES — détail visuel par service                      */
/*  Une section par service, alterne mockup/texte gauche/droite        */
/* ------------------------------------------------------------------ */
const buildShowcasesData = () => [
    {
      id: 'reception',
      tag: 'Service 1 — Appels entrants',
      tagColor: 'bg-amber-100 text-amber-800',
      title: 'Réception 24/7.',
      titleAccent: 'L\'IA décroche pour vous.',
      accentColor: 'text-amber-600',
      desc: 'Vous ne répondez pas ? L\'appel est transféré à l\'IA en 2 secondes. Elle qualifie le prospect, prend RDV, vous envoie le récap par SMS. Une machine à leads qui tourne jour et nuit.',
      stats: [
        { value: '24/7', label: 'Disponibilité' },
        { value: '2s', label: 'Décroché' },
        { value: '97%', label: 'Appels pris' },
        { value: '0', label: 'Appel manqué' },
      ],
      mockupSide: 'right',
      ctaBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      mockup: (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-amber-900/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-[14px]">Appels entrants</p>
                <p className="text-[12px] text-gray-400">Aujourd'hui · 12 leads</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">En direct</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Julien M.', topic: 'Devis isolation', time: '14:32', status: 'RDV pris' },
              { name: 'Claire B.', topic: 'Question contrat', time: '13:15', status: 'Rappel programmé' },
              { name: 'Marc D.', topic: 'Demande tarif', time: '11:58', status: 'Lead qualifié' },
              { name: 'Sophie L.', topic: 'Renseignement', time: '10:24', status: 'Info envoyée' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-[11.5px] text-gray-500 truncate">{c.topic} · {c.time}</p>
                </div>
                <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 ml-2 shrink-0">{c.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">12 appels traités</span>
            <span className="text-[12px] font-bold text-emerald-600">+8 leads chauds</span>
          </div>
        </div>
      ),
    },
    {
      id: 'renouvellement',
      tag: 'Service 2 — Appels sortants',
      tagColor: 'bg-emerald-100 text-emerald-800',
      title: 'Renouvellement de dossiers.',
      titleAccent: 'Zéro oubli.',
      accentColor: 'text-emerald-600',
      desc: 'L\'IA appelle chaque client dont le dossier arrive à échéance — contrôles techniques, assurances, bilans, abonnements. Tout est couvert, rien ne passe entre les mailles.',
      stats: [
        { value: '80%', label: 'Taux de renouvellement' },
        { value: '0', label: 'Dossier oublié' },
        { value: '2min', label: 'Par relance' },
        { value: '100%', label: 'Automatisé' },
      ],
      mockupSide: 'left',
      ctaBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
      mockup: (
        <div className="bg-emerald-50/40 rounded-3xl border border-emerald-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-[14px]">Relances automatiques</p>
              <p className="text-[12px] text-gray-400">Cette semaine</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Martin D.', topic: 'CT expiré dans 15j', status: 'Renouvelé', icon: 'check' },
              { name: 'Sophie L.', topic: 'Entretien annuel', status: 'RDV pris', icon: 'check' },
              { name: 'Lucas R.', topic: 'Vidange 20 000km', status: 'Renouvelé', icon: 'check' },
              { name: 'Claire M.', topic: 'Assurance à renouveler', status: 'Appel en cours…', icon: 'pending' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.icon === 'check' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {c.icon === 'check' ? <Check className="w-4 h-4 text-emerald-700" /> : <Clock className="w-4 h-4 text-amber-700" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{c.name} <span className="text-gray-400">— {c.topic}</span></p>
                  <p className={`text-[11.5px] font-medium ${c.icon === 'check' ? 'text-emerald-600' : 'text-amber-600'}`}>Appelé {c.icon === 'check' ? '→ ' : ''}{c.status}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 py-3 px-4 rounded-xl bg-emerald-600 text-white text-center text-[13px] font-bold">
            80% renouvelés cette semaine
          </div>
        </div>
      ),
    },
    {
      id: 'rdv',
      tag: 'Service 3 — Appels sortants',
      tagColor: 'bg-blue-100 text-blue-800',
      title: 'Confirmation de RDV.',
      titleAccent: 'Fini les lapins.',
      accentColor: 'text-blue-600',
      desc: 'L\'IA appelle la veille de chaque rendez-vous pour confirmer. Le client confirme, reporte ou annule — votre planning est fiable à 92%.',
      stats: [
        { value: '92%', label: 'Taux de présence' },
        { value: '−35%', label: 'De lapins' },
        { value: 'J−1', label: 'Appel automatique' },
        { value: '0min', label: 'De votre temps' },
      ],
      mockupSide: 'right',
      ctaBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      mockup: (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-gray-900 text-[14px]">Agenda du jour</p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">92% confirmés</span>
          </div>
          <div className="space-y-2">
            {[
              { time: '09:00', name: 'Martin D.', ok: true },
              { time: '10:30', name: 'Sophie L.', ok: true },
              { time: '11:00', name: 'Pierre B.', ok: true },
              { time: '14:00', name: 'Claire M.', ok: false },
              { time: '15:30', name: 'Lucas R.', ok: true },
              { time: '16:30', name: 'Emma T.', ok: true },
            ].map((c, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${c.ok ? 'bg-gray-50/50 border-gray-100' : 'bg-rose-50/40 border-rose-100'}`}>
                <span className="text-[13px] font-bold text-gray-700 tabular-nums w-12">{c.time}</span>
                <span className="text-[13.5px] font-semibold text-gray-900 flex-1">{c.name}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${c.ok ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {c.ok ? <Check className="w-4 h-4 text-emerald-700" /> : <X className="w-4 h-4 text-rose-600" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-[11.5px] font-medium mb-1.5">
              <span className="text-gray-400">Sans IA : 57%</span>
              <span className="text-emerald-600">Avec IA : 92%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'impact-avis',
      tag: 'Service 4 — Réputation',
      tagColor: 'bg-yellow-100 text-yellow-800',
      title: 'Impact Avis.',
      titleAccent: 'Plus d\'étoiles, sans risque.',
      accentColor: 'text-yellow-600',
      desc: 'L\'IA appelle vos clients après chaque prestation. Si c\'est positif, elle envoie le lien Google par SMS. Si c\'est négatif, le retour reste en interne — vous corrigez avant qu\'il devienne public.',
      stats: [
        { value: '4★+', label: '→ Google' },
        { value: '< 4★', label: '→ interne' },
        { value: '+38', label: 'Avis/2 mois' },
        { value: '4,7', label: 'Note moyenne' },
      ],
      mockupSide: 'left',
      ctaBg: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
      mockup: (
        <div className="bg-yellow-50/40 rounded-3xl border border-yellow-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-[14px]">Appels post-prestation</p>
              <p className="text-[12px] text-gray-400">Cette semaine</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'Marie D.', stars: 5, status: 'Avis Google publié', published: true },
              { name: 'Lucas R.', stars: 5, status: 'Avis Google publié', published: true },
              { name: 'Sophie L.', stars: 4, status: 'Avis Google publié', published: true },
              { name: 'Pierre M.', stars: 3, status: 'Retour interne — RDV à recaler', published: false },
              { name: 'Claire B.', stars: 5, status: 'Avis Google publié', published: true },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${c.published ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Star className={`w-4 h-4 ${c.published ? 'text-yellow-600' : 'text-gray-400'}`} fill={c.published ? 'currentColor' : 'none'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{c.name}  <span className="text-gray-500 font-normal">{c.stars}★</span></p>
                  <p className={`text-[11.5px] ${c.published ? 'text-yellow-700' : 'text-gray-500'}`}>{c.status}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center text-[13px] font-bold">
            4 avis Google publiés · 1 retour interne
          </div>
        </div>
      ),
    },
    {
      id: 'paiements',
      tag: 'Service 5 — Trésorerie',
      tagColor: 'bg-rose-100 text-rose-800',
      title: 'Accélération de paiements.',
      titleAccent: 'Vos délais raccourcissent.',
      accentColor: 'text-rose-600',
      desc: 'L\'IA appelle vos clients dont la facture est due, au bon moment, avec le bon ton. Pas de menace, pas de relance brutale — juste un rappel humain et professionnel qui fait toute la différence sur vos délais.',
      stats: [
        { value: '−40%', label: 'Délais de paiement' },
        { value: '+62%', label: 'Factures payées à J+0' },
        { value: '0min', label: 'De votre temps' },
        { value: '24/7', label: 'Tentatives intelligentes' },
      ],
      mockupSide: 'right',
      ctaBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
      mockup: (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-rose-900/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-gray-900 text-[14px]">Factures relancées</p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">8 réglées sur 10</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'SARL Dubois', amount: '850€', status: 'Réglée — J+2', ok: true },
              { name: 'Cabinet Martin', amount: '1 200€', status: 'Réglée — J+4', ok: true },
              { name: 'EURL Lefèvre', amount: '430€', status: 'Promesse — J+7', ok: 'pending' },
              { name: 'SAS Renaud', amount: '2 100€', status: 'Réglée — J+1', ok: true },
              { name: 'Pharmacie Bertin', amount: '680€', status: 'Réglée — J+3', ok: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${f.ok === true ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {f.ok === true ? <Check className="w-4 h-4 text-emerald-700" /> : <Clock className="w-4 h-4 text-amber-700" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{f.name}</p>
                  <p className={`text-[11.5px] font-medium ${f.ok === true ? 'text-emerald-600' : 'text-amber-600'}`}>{f.status}</p>
                </div>
                <span className="text-[13px] font-bold text-gray-700 tabular-nums shrink-0">{f.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-[11.5px] font-medium mb-1.5">
              <span className="text-gray-400">Sans IA : 28 jours</span>
              <span className="text-rose-600">Avec IA : 17 jours</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'robot',
      tag: 'Service 6 — Sur mesure',
      tagColor: 'bg-violet-100 text-violet-800',
      title: 'Robot IA sur mesure.',
      titleAccent: '100% adapté à vous.',
      accentColor: 'text-violet-600',
      desc: 'Un besoin spécifique ? On crée votre robot sur mesure : script personnalisé, voix naturelle, scénarios complexes, intégration CRM — une IA vocale taillée exactement pour vos processus.',
      stats: [
        { value: '100%', label: 'Personnalisé' },
        { value: '24h', label: 'Setup' },
        { value: '∞', label: 'Scénarios' },
        { value: 'Tout', label: 'CRM compatible' },
      ],
      mockupSide: 'left',
      ctaBg: 'bg-violet-600 hover:bg-violet-700',
      mockup: (
        <div className="bg-violet-50/40 rounded-3xl border border-violet-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-[14px]">Configuration sur mesure</p>
              <p className="text-[12px] text-gray-400">Robot IA personnalisé</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Script', value: 'Personnalisé selon votre métier' },
              { label: 'Voix', value: 'Naturelle (FR · 4 voix au choix)' },
              { label: 'Scénarios', value: 'Multi-branches conditionnelles' },
              { label: 'Intégration', value: 'CRM, agenda, Sheets, API' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-violet-700" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">{row.label}</p>
                  <p className="text-[13px] text-gray-700 font-medium">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 py-3 px-4 rounded-xl bg-violet-600 text-white text-center text-[13px] font-bold">
            On vous appelle dans l'heure
          </div>
        </div>
      ),
    },
  ];

const ServiceShowcases = ({ openPopup, showcases }) => {
  // Skip total sur mobile : pas de mount → pas de useScroll subscriptions inutiles
  const isMobile = useIsMobileDevice();
  if (isMobile) return null;
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background ambient gradients très subtils Apple-style */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-3xl"
             style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
             style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-3xl"
             style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="space-y-32 lg:space-y-44">
          {showcases.map((s, i) => (
            <ShowcaseBlock key={s.id} s={s} index={i} openPopup={openPopup} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  ShowcaseBlock — section premium Apple aérée + parallax scroll      */
/* ------------------------------------------------------------------ */
const ShowcaseBlock = ({ s, index, openPopup }) => {
  const blockRef = useRef(null);
  const inView = useInView(blockRef, { once: true, margin: '-20%' });
  const appleEase = [0.16, 1, 0.3, 1];
  const isMobile = useIsMobileDevice();

  // Parallax désactivé entièrement sur mobile (la section est hidden md:block, mais
  // useScroll subscribe quand même au scroll de la window → coûteux pour rien)
  // Note : on appelle quand même useScroll pour respecter les rules of hooks,
  // mais on jette le résultat sur mobile.
  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ['start end', 'end start'],
  });
  const mockupYRaw = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const mockupRotateRaw = useTransform(scrollYProgress, [0, 1], [1.5, -1.5]);
  const mockupY = isMobile ? 0 : mockupYRaw;
  const mockupRotate = isMobile ? 0 : mockupRotateRaw;

  const isReversed = s.mockupSide === 'left';

  return (
    <div ref={blockRef} id={`showcase-${s.id}`} className="scroll-mt-32 relative">
      {/* N° d'ordre géant en filigrane (signature premium) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: appleEase }}
        className={`absolute pointer-events-none select-none ${isReversed ? 'right-0' : 'left-0'} -top-12 lg:-top-16`}
        aria-hidden="true"
      >
        <span className="text-[140px] lg:text-[200px] font-black leading-none tracking-tighter text-gray-100">
          0{index + 1}
        </span>
      </motion.div>

      <div className={`relative grid lg:grid-cols-12 gap-10 lg:gap-16 items-center ${isReversed ? 'lg:[&>div:first-child]:col-start-7 lg:[&>div:first-child]:col-end-13 lg:[&>div:nth-child(2)]:col-start-1 lg:[&>div:nth-child(2)]:row-start-1 lg:[&>div:nth-child(2)]:col-end-7' : ''}`}>
        {/* Texte */}
        <div className="lg:col-span-6">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: appleEase, delay: 0.1 }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold ${s.tagColor} mb-7`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.accentColor.replace('text-', 'bg-')}`} />
            {s.tag}
          </motion.span>

          <motion.h3
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: appleEase, delay: 0.18 }}
            className="text-[40px] lg:text-[52px] font-extrabold tracking-[-0.02em] text-gray-900 leading-[1.02]"
          >
            {s.title}
            <br />
            <span className={s.accentColor}>{s.titleAccent}</span>
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: appleEase, delay: 0.3 }}
            className="text-[17px] lg:text-[18px] text-gray-500 leading-[1.55] mt-6 max-w-[520px]"
          >
            {s.desc}
          </motion.p>

          {/* Stats — grille aérée 2x2 grand format */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-7 mt-10 max-w-[460px]">
            {s.stats.map((stat, k) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, ease: appleEase, delay: 0.45 + k * 0.08 }}
              >
                <p className={`text-[36px] lg:text-[42px] font-black tracking-[-0.025em] ${s.accentColor} leading-none`}>
                  {stat.value}
                </p>
                <p className="text-[13px] text-gray-500 font-medium mt-2 tracking-tight">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: appleEase, delay: 0.85 }}
            type="button"
            onClick={() => openPopup(`showcase-${s.id}`, 'gratuit')}
            whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
            whileTap={{ scale: 0.97 }}
            className={`mt-10 inline-flex items-center justify-center gap-2.5 ${s.ctaBg} text-white font-semibold px-7 py-3.5 rounded-full text-[14px] tracking-wide transition-shadow duration-300 hover:shadow-xl`}
            style={{ boxShadow: '0 12px 32px -10px rgba(15, 23, 42, 0.2)' }}
          >
            Commencer gratuitement <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Mockup — en lévitation avec parallax + ombre douce */}
        <motion.div
          className="lg:col-span-6 relative"
          style={{ y: mockupY, rotate: mockupRotate }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: appleEase, delay: 0.25 }}
            className="relative"
          >
            {/* Glow soft derrière le mockup */}
            <div
              className="absolute -inset-6 lg:-inset-8 rounded-[40px] opacity-30 blur-2xl pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${getAccentRgba(s.accentColor, 0.18)}, transparent 70%)`,
              }}
              aria-hidden="true"
            />
            <div className="relative drop-shadow-[0_24px_48px_rgba(15,23,42,0.10)]">
              {s.mockup}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper pour le glow derrière le mockup (couleur accent)
function getAccentRgba(accentClass, alpha) {
  const map = {
    'text-amber-600':   `rgba(245, 158, 11, ${alpha})`,
    'text-emerald-600': `rgba(16, 185, 129, ${alpha})`,
    'text-blue-600':    `rgba(59, 130, 246, ${alpha})`,
    'text-yellow-600':  `rgba(234, 179, 8, ${alpha})`,
    'text-rose-600':    `rgba(244, 63, 94, ${alpha})`,
    'text-violet-600':  `rgba(139, 92, 246, ${alpha})`,
  };
  return map[accentClass] || `rgba(15, 23, 42, ${alpha})`;
}

/* ------------------------------------------------------------------ */
/*  MobileServiceDetail — mockup compact qui suit le service swipé     */
/* ------------------------------------------------------------------ */
const MobileServiceDetail = ({ activeIdx, openPopup, showcases }) => {
  const s = showcases[activeIdx] || showcases[0];
  return (
    <div className="md:hidden mt-3 px-1">
      {/* Connector vertical statique (pas d'anim) */}
      <div className="flex justify-center mb-3" aria-hidden="true">
        <div className={`w-[2px] h-6 rounded-full ${s.accentColor.replace('text-', 'bg-').replace('-600', '-300')}`} />
      </div>
      {/* Pas d'AnimatePresence — juste un fade rapide via CSS-like transition */}
      <div
        key={s.id}
        className="rounded-[28px] border border-gray-100 bg-white overflow-hidden mobile-detail-card"
        style={{
          boxShadow: '0 8px 20px -8px rgba(15, 23, 42, 0.08)',
          willChange: 'opacity',
          animation: 'mobileDetailFadeIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-6 pt-5 pb-3 border-b border-gray-100/60">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.1em] uppercase ${s.tagColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.accentColor.replace('text-', 'bg-')}`} />
            {s.tag}
          </span>
          <span className="text-[10.5px] font-bold tracking-wider text-gray-300 uppercase tabular-nums">
            {activeIdx + 1} / 6
          </span>
        </div>
        <div className="px-5 pt-5 pb-6">
          <h4 className="text-[20px] font-extrabold text-gray-900 tracking-[-0.02em] leading-[1.1] mb-2">
            {s.title} <span className={s.accentColor}>{s.titleAccent}</span>
          </h4>
          <p className="text-[13.5px] text-gray-500 leading-relaxed mb-5">{s.desc}</p>
          <div className="mb-5">{s.mockup}</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 mt-2">
            {s.stats.map((stat, k) => (
              <div key={k}>
                <p className={`text-[26px] font-black tracking-[-0.025em] leading-none ${s.accentColor}`}>{stat.value}</p>
                <p className="text-[11.5px] text-gray-500 font-medium mt-1.5 tracking-tight">{stat.label}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openPopup(`mobile-detail-${s.id}`, 'gratuit')}
            className={`w-full inline-flex items-center justify-center gap-2 ${s.ctaBg} text-white font-semibold px-5 py-3.5 rounded-full text-[14px] tracking-wide transition-shadow duration-300 hover:shadow-lg`}
          >
            Commencer gratuitement <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


/* ------------------------------------------------------------------ */
/*  TestimonialsCarousel — mobile : 1 carte centrée + dots + animations */
/*  Desktop : grid 3 cols classique                                    */
/* ------------------------------------------------------------------ */
const TestimonialsCarousel = ({ testimonials, svcColors }) => {
  const carouselRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const appleEase = [0.16, 1, 0.3, 1];

  // Scroll listener throttled (50ms) — suffisant pour le sync, peu coûteux
  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;

    let timerId = null;
    let lastIdx = -1;

    const compute = () => {
      timerId = null;
      const cards = Array.from(root.querySelectorAll('[data-testimonial-idx]'));
      if (!cards.length) return;
      const rootRect = root.getBoundingClientRect();
      const center = rootRect.left + rootRect.width / 2;
      let bestIdx = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs((rect.left + rect.width / 2) - center);
        if (dist < minDist) {
          minDist = dist;
          const dataIdx = parseInt(card.getAttribute('data-testimonial-idx'), 10);
          bestIdx = Number.isNaN(dataIdx) ? i : dataIdx;
        }
      });
      if (bestIdx !== lastIdx) {
        lastIdx = bestIdx;
        setActiveIdx(bestIdx);
      }
    };

    const onScroll = () => {
      if (timerId !== null) return;
      timerId = setTimeout(compute, 50);
    };

    const initTimer = setTimeout(compute, 100);
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(initTimer);
      if (timerId !== null) clearTimeout(timerId);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const avatarBgFor = (color) => ({
    emerald: 'from-emerald-400 to-teal-500',
    blue:    'from-blue-400 to-indigo-500',
    violet:  'from-violet-400 to-purple-500',
    yellow:  'from-yellow-400 to-amber-500',
    rose:    'from-rose-400 to-pink-500',
    amber:   'from-amber-400 to-orange-500',
  }[color] || 'from-emerald-400 to-teal-500');

  return (
    <>
      {/* Nudge swipe AU-DESSUS du carousel témoignages — l'user voit l'instruction
          AVANT d'arriver sur la card coupée à droite. Plus visible que le sub-text gris. */}
      <div className="sm:hidden flex items-center justify-center gap-2 mb-4 text-[12.5px] font-semibold text-emerald-700">
        <ArrowRight className="w-3.5 h-3.5 rotate-180" strokeWidth={2.6} />
        <span>Glissez pour voir tous les avis</span>
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.6} />
      </div>

      {/* Mobile : carousel snap-center — chaque carte fait 100vw - 5rem (80px) → ~40px peek de la 2e carte */}
      <div
        ref={carouselRef}
        className="sm:hidden -mx-6 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6"
        style={{ scrollPaddingLeft: '20px', scrollPaddingRight: '20px' }}
      >
        {/* Spacer début pour permettre snap propre du 1er */}
        <div aria-hidden="true" className="shrink-0 w-5" />
        {testimonials.map((t, i) => {
          const tc = svcColors[t.color] || svcColors.emerald;
          const isActive = i === activeIdx;
          return (
            <div
              key={i}
              data-testimonial-idx={i}
              className="snap-center shrink-0 w-[calc(100vw-5rem)] pr-3 last:pr-0"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.94,
                  opacity: isActive ? 1 : 0.55,
                }}
                transition={{ duration: 0.45, ease: appleEase }}
                className={`relative bg-white rounded-[24px] p-6 h-full flex flex-col border border-gray-100 ${
                  isActive ? 'shadow-xl shadow-gray-900/[0.07]' : 'shadow-sm'
                } transition-shadow duration-500 overflow-hidden`}
              >
                {/* Logo secteur en haut à droite — vert uniforme Apple */}
                {t.sectorIcon && (
                  <div className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <t.sectorIcon className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2} />
                  </div>
                )}

                {/* Étoiles */}
                <div className="relative flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" strokeWidth={1} />
                  ))}
                </div>

                {/* Result en GROS vert UNIFORME — cohérence Apple */}
                <div className="relative mb-3">
                  <div className="text-[24px] font-extrabold leading-tight text-emerald-600 tracking-tight">
                    {t.result}
                  </div>
                </div>

                {/* Quote (en gris, plus petite) */}
                <p className="relative text-[13.5px] text-gray-500 leading-relaxed font-normal break-words flex-1">
                  «&nbsp;{t.quote}&nbsp;»
                </p>

                <div className="relative h-px bg-gray-100 my-4" />

                {/* Auteur — minimaliste Apple : pas d'avatar, juste nom + métadonnées */}
                <div className="relative">
                  <p className="font-bold text-gray-900 text-[14px] tracking-tight">{t.name}</p>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">{t.role} · {t.city}</p>
                </div>
              </motion.div>
            </div>
          );
        })}
        {/* Spacer fin pour snap propre du dernier */}
        <div aria-hidden="true" className="shrink-0 w-5" />
      </div>

      {/* Mobile : Dots indicateurs — vert uniforme Apple */}
      <div className="sm:hidden flex justify-center gap-2 mt-3 mb-1">
        {testimonials.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 rounded-full transition-all duration-400 ${
              i === activeIdx ? 'w-8 bg-emerald-500' : 'w-2.5 bg-emerald-100'
            }`}
          />
        ))}
      </div>
      {/* Indication "Glissez" supprimée ici — désormais affichée AU-DESSUS du carousel */}

      {/* Desktop : grid 3 cols */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => {
          const tc = svcColors[t.color] || svcColors.emerald;
          return (
            <ScrollReveal key={i} delay={(i % 3) * 0.08}>
              <div className="relative bg-white rounded-2xl border border-gray-100 p-7 h-full flex flex-col hover:shadow-lg hover:shadow-gray-900/[0.04] transition-shadow">
                {/* Logo secteur en haut à droite — vert uniforme Apple */}
                {t.sectorIcon && (
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <t.sectorIcon className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  </div>
                )}
                {/* Étoiles */}
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400" fill="currentColor" strokeWidth={1} />
                  ))}
                </div>
                {/* Result en GROS vert UNIFORME au-dessus de la quote */}
                <div className="text-[28px] font-extrabold leading-tight text-emerald-600 tracking-tight mb-4">
                  {t.result}
                </div>
                {/* Quote en plus petit et gris */}
                <p className="text-[14px] text-gray-500 leading-relaxed flex-1">«&nbsp;{t.quote}&nbsp;»</p>

                <div className="h-px bg-gray-100 my-5" />
                {/* Auteur — minimaliste Apple : pas d'avatar, juste nom + métadonnées */}
                <div>
                  <p className="font-bold text-gray-900 text-[14.5px] tracking-tight">{t.name}</p>
                  <p className="text-[12.5px] text-gray-500 mt-0.5">{t.role} · {t.city}</p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </>
  );
};


/* ------------------------------------------------------------------ */
/*  RECEPTION FLAGSHIP SECTION — produit phare ÉPURÉ light Apple       */
/* ------------------------------------------------------------------ */
const ReceptionFlagshipSection = ({ openPopup }) => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-15%' });
  const appleEase = [0.16, 1, 0.3, 1];
  const isMobile = useIsMobileDevice();

  // Parallax léger sur le téléphone — désactivé sur mobile (perf)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const phoneYRaw = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const phoneY = isMobile ? 0 : phoneYRaw;

  // Conversation auto-cyclée — boucle infinie qui reset proprement
  // Sur mobile : on affiche directement la fin (pas de cycle = pas de re-renders répétés)
  const [convoStep, setConvoStep] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (isMobile) {
      // Mobile : juste révéler progressivement les bulles 1 fois, puis stop
      let s = 0;
      const tick = () => {
        s++;
        setConvoStep(s);
        if (s < 4) setTimeout(tick, 600);
      };
      const t = setTimeout(tick, 400);
      return () => clearTimeout(t);
    }
    // Desktop : cycle infini
    const id = setInterval(() => setConvoStep((s) => (s >= 5 ? 0 : s + 1)), 2200);
    return () => clearInterval(id);
  }, [inView, isMobile]);

  return (
    <section id="ia-reception" ref={sectionRef} className="relative pt-16 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-white scroll-mt-24">
      {/* Ambient warm très subtil — juste un effet d'aurore amber/rose en filigrane */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-[0.07] blur-[120px]"
             style={{ background: 'radial-gradient(ellipse, #F59E0B, transparent 60%)' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[100px]"
             style={{ background: 'radial-gradient(circle, #F43F5E, transparent 70%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Header centré, ultra épuré ── */}
        <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-28">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: appleEase }}
            className="inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full mb-7"
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Produit phare
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, ease: appleEase, delay: 0.1 }}
            className="text-[40px] sm:text-[56px] md:text-[68px] lg:text-[78px] font-semibold text-gray-900 leading-[0.98] tracking-[-0.03em]"
          >
            Vous ne décrochez pas&nbsp;?
            <br />
            <span className="text-emerald-600">
              L'IA prend le relais.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: appleEase, delay: 0.22 }}
            className="text-[17px] md:text-[19px] text-gray-500 max-w-2xl mt-7 mx-auto leading-[1.55] font-normal"
          >
            Un appel manqué, c'est un client perdu. Plus jamais. L'IA décroche en 2 secondes, qualifie le prospect, et vous envoie le RDV par SMS.
          </motion.p>
        </div>

        {/* ── PHONE seul, centré, hero ── */}
        <motion.div
          className="relative mx-auto"
          style={{ y: phoneY }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 1.1, ease: appleEase, delay: 0.3 }}
            className="relative w-[300px] sm:w-[330px] mx-auto"
          >
            {/* Glow ambient emerald doux derrière le phone */}
            <div className="absolute -inset-16 rounded-[80px] opacity-30 blur-[80px] pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5), transparent 70%)' }}
                 aria-hidden="true" />

            {/* Phone frame — plus light, premium silver */}
            <div className="relative rounded-[44px] p-[3px]"
                 style={{
                   background: 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 50%, #D1D5DB 100%)',
                   boxShadow: '0 80px 120px -40px rgba(16, 185, 129, 0.22), 0 40px 80px -20px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)',
                 }}>
              {/* Inner screen — gardé sombre car écran de téléphone */}
              <div className="rounded-[42px] bg-gradient-to-br from-[#0F1623] via-[#1F2937] to-[#0F1623] p-5 pt-12 pb-6 overflow-hidden relative">
                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" />
                </div>

                {/* Status bar */}
                <div className="absolute top-3 left-6 right-6 flex justify-between items-center text-[10px] text-white/50 font-semibold">
                  <span>9:41</span>
                  <span>•••</span>
                </div>

                {/* Caller header */}
                <div className="text-center mb-5 mt-2">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    {[0, 1, 2].map((j) => (
                      <motion.span
                        key={j}
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                        animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: j * 0.65, ease: 'easeOut' }}
                      />
                    ))}
                    <div className="relative w-full h-full rounded-full flex items-center justify-center"
                         style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)', boxShadow: '0 12px 28px -8px rgba(245, 158, 11, 0.6)' }}>
                      <PhoneCall className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-white">Appel entrant</p>
                  <p className="text-[11px] text-white/40">Martin Plomberie · 06 12 34 56 78</p>
                </div>

                {/* Conversation cyclée */}
                <div className="space-y-2 mb-4 min-h-[200px]">
                  {[
                    { side: 'left', label: 'IA BoosterPay', text: 'Bonjour, Martin Plomberie, que puis-je faire pour vous ?', step: 0 },
                    { side: 'right', label: 'Prospect', text: 'J\'ai une fuite dans ma salle de bain.', step: 1 },
                    { side: 'left', label: 'IA BoosterPay', text: 'Je peux vous proposer jeudi 9h ou vendredi 14h.', step: 2 },
                    { side: 'right', label: 'Prospect', text: 'Jeudi 9h, parfait.', step: 3 },
                    { side: 'success', text: '✓ RDV confirmé · Jeudi 9h', step: 4 },
                  ].map((b, j) => {
                    const visible = b.step <= convoStep;
                    const isSuccess = b.side === 'success';
                    return (
                      <motion.div
                        key={j}
                        initial={false}
                        animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.45, ease: appleEase }}
                        className={`flex ${b.side === 'right' || isSuccess ? 'justify-end' : 'justify-start'}`}
                      >
                        {isSuccess ? (
                          <div className="px-3 py-2 rounded-xl rounded-br-sm bg-emerald-500/20 border border-emerald-400/40 max-w-[80%]">
                            <p className="text-[11.5px] font-bold text-emerald-300">{b.text}</p>
                          </div>
                        ) : (
                          <div className={`px-3 py-2 rounded-xl ${b.side === 'left' ? 'rounded-bl-sm bg-amber-500/15 border border-amber-400/25' : 'rounded-br-sm bg-white/[0.06] border border-white/[0.08]'} max-w-[78%]`}>
                            <p className={`text-[10px] font-bold ${b.side === 'left' ? 'text-amber-300' : 'text-white/40'} mb-0.5`}>{b.label}</p>
                            <p className={`text-[12px] leading-snug ${b.side === 'left' ? 'text-white/95' : 'text-white/75'}`}>{b.text}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom recap */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[11px] text-emerald-200 font-semibold">Récap envoyé · SMS + Email</span>
                </div>
              </div>
            </div>

            {/* Une SEULE floating card subtile — SMS notification (la plus représentative) */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: -10, scale: 0.85 }}
              animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.9, ease: appleEase, delay: 1.2 }}
              className="hidden md:flex absolute top-12 -right-32 lg:-right-44 bg-white rounded-2xl border border-gray-100 px-4 py-3 items-center gap-3 max-w-[260px] z-10"
              style={{ boxShadow: '0 32px 64px -16px rgba(15, 23, 42, 0.18), 0 12px 24px -8px rgba(15, 23, 42, 0.08)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0"
                style={{ boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.5)' }}
              >
                <MessageSquare className="w-4 h-4 text-white" strokeWidth={2.4} />
              </motion.div>
              <div>
                <p className="text-[12px] font-bold text-gray-900">Lead qualifié reçu</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Fuite SDB · Jeudi 9h · Urgent</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── 4 features en row horizontal épuré ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: appleEase, delay: 0.7 }}
          className="mt-24 lg:mt-32 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-5xl mx-auto"
        >
          {[
            { icon: PhoneCall,    title: 'Décrochage 2s',     desc: 'Le prospect ne raccroche jamais.' },
            { icon: Target,       title: 'Qualification auto', desc: 'L\'IA pose les bonnes questions.' },
            { icon: CalendarDays, title: 'RDV pris',           desc: 'Direct dans votre agenda.' },
            { icon: Zap,          title: 'Récap SMS',          desc: 'En temps réel sur votre tél.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: appleEase, delay: 0.8 + i * 0.08 }}
              className="text-center lg:text-left"
            >
              {/* Icône uniforme verte — un seul langage visuel Apple */}
              <div className="inline-flex w-11 h-11 rounded-2xl items-center justify-center mb-4 border border-emerald-100" style={{ backgroundColor: '#F0FDF4' }}>
                <f.icon className="w-5 h-5 text-emerald-600" strokeWidth={2.2} />
              </div>
              <h4 className="text-[15.5px] font-bold text-gray-900 tracking-tight mb-1.5">{f.title}</h4>
              <p className="text-[13.5px] text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Stats massives ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, ease: appleEase, delay: 1.1 }}
          className="mt-20 lg:mt-28 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10 max-w-4xl mx-auto"
        >
          {[
            { value: '24/7', label: 'Disponibilité' },
            { value: '2s',   label: 'Décrochage' },
            { value: '97%',  label: 'Appels pris' },
            { value: '×3',   label: 'Leads qualifiés' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18, scale: 0.92 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, ease: appleEase, delay: 1.15 + i * 0.08 }}
              className="text-center"
            >
              <p className="text-[56px] lg:text-[72px] font-black tracking-[-0.035em] leading-none text-emerald-500">
                {s.value}
              </p>
              <p className="text-[12px] text-gray-400 font-bold mt-3 tracking-[0.12em] uppercase">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CTA hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: appleEase, delay: 1.5 }}
          className="mt-20 flex flex-col items-center"
        >
          <motion.button
            type="button"
            onClick={() => openPopup('cta-receptionia', 'gratuit')}
            whileHover={{ scale: 1.04, y: -2, transition: { type: 'spring', stiffness: 380, damping: 20 } }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-3 text-[15.5px] font-bold text-white px-10 py-5 rounded-full transition-shadow duration-300"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 16px 40px -8px rgba(16, 185, 129, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12) inset',
            }}
          >
            <PhoneCall className="w-5 h-5" strokeWidth={2.2} />
            Activer ma Réception 24/7 — gratuit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <p className="mt-5 text-[13px] text-gray-400 tracking-tight">
            7 jours gratuits · Annulation libre · 99 € HT/mois ensuite
          </p>
        </motion.div>
      </div>
    </section>
  );
};


/* ------------------------------------------------------------------ */
/*  TwoApproachesSection — REFONTE GRANDIOSE APPLE KEYNOTE              */
/*  Fond clair + ambient gradient orbs · Profondeur Apple keynote      */
/*  Section théâtrale : tag premium, titre XXL, cartes immersives      */
/* ------------------------------------------------------------------ */
const TwoApproachesSection = () => {
  return (
    <section className="relative pt-20 pb-20 md:pt-24 md:pb-24 overflow-hidden bg-white">
      {/* Ambient gradient orbs Apple-style — profondeur sans gris plat */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-[0.08] blur-3xl"
             style={{ background: 'radial-gradient(ellipse, #10B981 0%, transparent 60%)' }} />
        <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl"
             style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)' }} />
        <div className="absolute bottom-20 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-3xl"
             style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Header keynote — titre XXL impact maximal */}
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <ScrollReveal y={16}>
            <span className="inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full mb-7">
              <Sparkles className="w-3 h-3" strokeWidth={2.5} />
              Vos deux leviers
            </span>
          </ScrollReveal>
          <ScrollReveal y={20} delay={0.08}>
            <h2 className="text-[40px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-extrabold text-gray-900 leading-[0.98] tracking-[-0.035em]">
              Deux façons de remplir<br/>
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                votre agenda.
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal y={16} delay={0.18}>
            <p className="text-[18px] md:text-[20px] text-gray-500 mt-7 leading-[1.55] max-w-xl mx-auto">
              Choisissez ce qui vous correspond. Ou cumulez les deux pour multiplier l'impact.
            </p>
          </ScrollReveal>
        </div>

        {/* Grille 2 cartes — hiérarchie visuelle CLAIRE : IA verte = produit phare */}
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6 mb-6">
          {/* ═══ CARTE 01 — IA VOCALE (Produit phare, fond vert pâle) ═══ */}
          <ScrollReveal y={24} delay={0.12}>
            <div
              className="relative rounded-[28px] overflow-hidden h-full flex flex-col p-8 lg:p-10 transition-all duration-500 hover:-translate-y-1"
              style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #10B981',
                boxShadow: '0 20px 50px -15px rgba(16, 185, 129, 0.25), 0 4px 16px -8px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.06)',
              }}
            >
              {/* Barre verte vif top — signature produit recommandé */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

              {/* Badge "Produit phare" — top right */}
              <div className="absolute top-6 right-6 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10.5px] font-bold tracking-wider uppercase">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.6} />
                Produit phare
              </div>

              {/* Header */}
              <div className="mt-3 mb-5">
                <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-emerald-700 mb-2">
                  1 — IA Vocale
                </p>
                <h3 className="text-[28px] lg:text-[34px] font-semibold text-gray-900 tracking-[-0.03em] leading-[1.02]">
                  L'IA décroche<br />à votre place.
                </h3>
              </div>

              <p className="text-[15.5px] text-gray-600 leading-[1.55] mb-5">
                Quand vous ne décrochez pas, l'IA qualifie et prend le RDV.
              </p>

              {/* Pills horizontales sur fond white pour ressortir */}
              <div className="flex flex-wrap gap-1.5 mb-7 flex-1">
                {['24/7', 'Zéro appel perdu', 'Setup 5 min'].map((b, i) => (
                  <span key={i} className="inline-flex items-center bg-white rounded-full text-[12px] font-semibold text-emerald-800 px-3 py-1 border border-emerald-200">
                    {b}
                  </span>
                ))}
              </div>

              {/* CTA primaire vert plein avec ombre verte → ouvre le modal */}
              <button
                type="button"
                onClick={() => openPopup('two-approaches-ia', 'gratuit')}
                className="inline-flex items-center justify-center gap-1.5 text-[14.5px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-full transition-all hover:scale-[1.02]"
                style={{ boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)' }}
              >
                Essai gratuit 7 jours
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </ScrollReveal>

          {/* ═══ CARTE 02 — PROSPECTS (style miroir IA : fond bleu pâle + CTA plein) ═══ */}
          <ScrollReveal y={24} delay={0.18}>
            <div
              className="relative rounded-[28px] overflow-hidden h-full flex flex-col p-8 lg:p-10 transition-all duration-500 hover:-translate-y-1"
              style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #3B82F6',
                boxShadow: '0 20px 50px -15px rgba(59, 130, 246, 0.25), 0 4px 16px -8px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.06)',
              }}
            >
              {/* Barre bleue vif top — signature produit complémentaire */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />

              {/* Badge "Acquisition" — top right (miroir du "Produit phare") */}
              <div className="absolute top-6 right-6 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-[10.5px] font-bold tracking-wider uppercase">
                <Target className="w-2.5 h-2.5" strokeWidth={2.6} />
                Acquisition
              </div>

              <div className="mt-3 mb-5">
                <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-blue-700 mb-2">
                  2 — Prospects qualifiés
                </p>
                <h3 className="text-[28px] lg:text-[34px] font-semibold text-gray-900 tracking-[-0.03em] leading-[1.02]">
                  Des clients prêts à<br />acheter chez vous.
                </h3>
              </div>

              <p className="text-[15.5px] text-gray-600 leading-[1.55] mb-5">
                On vous livre des prospects qui cherchent activement <strong className="text-gray-900 font-semibold">votre service</strong>, dans votre zone. Ils attendent votre appel.
              </p>

              {/* Pills horizontales miroir IA */}
              <div className="flex flex-wrap gap-1.5 mb-7 flex-1">
                {['Exclusif/zone', 'CNIL conforme', 'Sans abonnement'].map((b, i) => (
                  <span key={i} className="inline-flex items-center bg-white rounded-full text-[12px] font-semibold text-blue-800 px-3 py-1 border border-blue-200">
                    {b}
                  </span>
                ))}
              </div>

              {/* CTA primaire bleu plein — hiérarchie égale à la card IA */}
              <a
                href="#leads-rgpd"
                className="inline-flex items-center justify-center gap-1.5 text-[14.5px] font-semibold text-white bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full transition-all hover:scale-[1.02]"
                style={{ boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)' }}
              >
                Réserver ma zone
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ POWER COMBO — chiffre XXL +22 ultra visible ═══ */}
        <ScrollReveal y={24} delay={0.24}>
          <div
            className="relative rounded-[28px] overflow-hidden p-8 lg:p-10"
            style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 40%, #E0E7FF 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.25)',
              boxShadow: '0 20px 50px -15px rgba(16, 185, 129, 0.18), 0 4px 16px -8px rgba(99, 102, 241, 0.1)',
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Texte gauche */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm mb-4 border border-emerald-200/60">
                  <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" strokeWidth={2.5} />
                  <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-emerald-700">
                    Power Combo
                  </span>
                </div>
                <h3 className="text-[22px] lg:text-[28px] font-semibold text-gray-900 leading-[1.1] tracking-[-0.025em] mb-2">
                  Activez les deux. L'IA appelle vos prospects dès livraison.
                </h3>
                <p className="text-[14.5px] text-gray-600 leading-relaxed">
                  Vous arrivez juste pour conclure.
                </p>
              </div>

              {/* Chiffre XXL vert — killer argument visible depuis le haut */}
              <div className="inline-flex flex-col items-center md:items-end shrink-0">
                <div className="text-[64px] lg:text-[88px] font-bold text-emerald-600 tracking-[-0.04em] leading-none">
                  +22
                </div>
                <div className="text-[12.5px] font-semibold text-gray-700 mt-1.5 tracking-tight">
                  nouveaux clients / mois
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  LeadsRGPDSection — Demande de leads qualifiés via partenaire        */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  LiveProspectsFeed — fiche prospect complète qui change en live      */
/*  Montre exactement ce que le commerçant recevra : nom, tel,         */
/*  email, adresse, motif. Universel à tous secteurs.                  */
/* ------------------------------------------------------------------ */
const LiveProspectsFeed = () => {
  const widgetRef = useRef(null);
  const inView = useInView(widgetRef, { once: false, margin: '-20%' });
  const appleEase = [0.16, 1, 0.3, 1];

  // Pool universel — aucun métier mentionné
  const POOL = useMemo(() => ({
    firsts: ['Marie', 'Pierre', 'Sophie', 'Thomas', 'Julie', 'Lucas', 'Emma', 'Hugo', 'Camille', 'Antoine', 'Alice', 'Maxime', 'Léa', 'Nicolas', 'Chloé', 'Romain', 'Sarah', 'Florian', 'Justine', 'Mathieu', 'Pauline', 'Olivier', 'Élise', 'Benjamin'],
    initials: ['L.', 'D.', 'M.', 'R.', 'B.', 'T.', 'G.', 'P.', 'V.', 'C.', 'F.', 'H.', 'S.', 'A.', 'K.', 'N.'],
    streets: ['rue Pasteur', 'avenue de la République', 'rue Victor Hugo', 'rue Jean Jaurès', 'avenue Charles de Gaulle', 'boulevard Voltaire', 'rue Émile Zola', 'rue de la Paix', 'avenue Foch', 'rue du Général Leclerc', 'place de la Mairie', 'allée des Tilleuls'],
    cities: [
      { name: 'Mâcon', cp: '71000' },
      { name: 'Strasbourg', cp: '67000' },
      { name: 'Nantes', cp: '44000' },
      { name: 'Lyon', cp: '69003' },
      { name: 'Paris', cp: '75011' },
      { name: 'Marseille', cp: '13008' },
      { name: 'Bordeaux', cp: '33000' },
      { name: 'Toulouse', cp: '31200' },
      { name: 'Lille', cp: '59000' },
      { name: 'Rennes', cp: '35000' },
      { name: 'Montpellier', cp: '34000' },
      { name: 'Nice', cp: '06000' },
      { name: 'Brest', cp: '29200' },
      { name: 'Reims', cp: '51100' },
      { name: 'Dijon', cp: '21000' },
      { name: 'Tours', cp: '37000' },
      { name: 'Angers', cp: '49000' },
      { name: 'Grenoble', cp: '38000' },
      { name: 'Aix-en-Provence', cp: '13100' },
      { name: 'Annecy', cp: '74000' },
    ],
    emailDomains: ['gmail.com', 'gmail.com', 'gmail.com', 'orange.fr', 'hotmail.fr', 'outlook.fr', 'free.fr', 'yahoo.fr'],
    intents: ['Demande de devis', 'Prise de RDV', 'Demande de rappel', 'Demande d\'information'],
  }), []);

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  // Tel masqué : "06 ** ** ** **" (look pro, démo, jamais une vraie ligne)
  const genPhoneMasked = () => `06 ${rand(10, 99)} ** ** **`;
  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  // Email masqué : garde 2 lettres + ***  pour donner l'impression d'une vraie adresse partiellement cachée
  const maskEmail = (first, lastLetter, domain) => {
    const slug = slugify(first);
    const visible = slug.substring(0, 2);
    return `${visible}****.${lastLetter}@${domain}`;
  };
  // Adresse masquée : "** rue ********, ***** Ville"
  const maskAddress = (city) => `** rue ********, ${city.cp.substring(0, 2)}*** ${city.name}`;
  const idCounter = useRef(100);

  const makeCard = () => {
    const first = pick(POOL.firsts);
    const initial = pick(POOL.initials);
    const city = pick(POOL.cities);
    const emailDomain = pick(POOL.emailDomains);
    const lastLetter = initial.replace('.', '').toLowerCase();
    return {
      id: idCounter.current++,
      name: `${first} ${initial}`,
      phone: genPhoneMasked(),
      email: maskEmail(first, lastLetter, emailDomain),
      address: maskAddress(city),
      city: city.name,
      intent: pick(POOL.intents),
      bornAt: Date.now(),
    };
  };

  const [cards, setCards] = useState(() => [makeCard(), makeCard()]);
  // Compteur corrélé aux cartes affichées : démarre à 4 (échelle commerce local)
  // et fait +1 à CHAQUE nouvelle carte qui défile → le visiteur voit le live progresser
  const [counter, setCounter] = useState(4);
  const [now, setNow] = useState(Date.now());

  // Nouvelle carte toutes les 6s — chaque arrivée = +1 sur le compteur
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setCards(prev => [makeCard(), ...prev.slice(0, 1)]);
      setCounter(c => c + 1);
    }, 6000);
    return () => clearInterval(id);
  }, [inView]);

  // Tick chaque seconde pour rafraîchir "il y a Xs"
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [inView]);

  const fmtAge = (bornAt) => {
    const sec = Math.floor((now - bornAt) / 1000);
    if (sec < 3) return 'à l\'instant';
    if (sec < 60) return `il y a ${sec}s`;
    return `il y a ${Math.floor(sec / 60)} min`;
  };

  return (
    <div ref={widgetRef} className="relative">
      {/* Halo gradient indigo très subtil */}
      <div className="absolute -inset-4 rounded-[40px] opacity-50 blur-2xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)' }}
           aria-hidden="true" />

      {/* Mini-header live indicator + Exclusif chip à droite */}
      <div className="relative flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2.5">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-[11.5px] font-bold tracking-[0.14em] uppercase text-gray-500">
            En direct · <span className="text-gray-900 tabular-nums">{counter}</span> reçus aujourd'hui
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <Shield className="w-3 h-3" strokeWidth={2.4} />
          Exclusif
        </span>
      </div>

      {/* Stack de 2 cartes prospect */}
      <div className="relative space-y-4 min-h-[480px]">
        <AnimatePresence initial={false} mode="popLayout">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: -28, scale: 0.95 }}
              animate={{
                opacity: i === 0 ? 1 : 0.55,
                y: 0,
                scale: i === 0 ? 1 : 0.985,
              }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{ duration: 0.6, ease: appleEase }}
              className="relative rounded-[24px] bg-white overflow-hidden"
              style={{
                border: '1px solid rgba(15, 23, 42, 0.06)',
                boxShadow: i === 0
                  ? '0 24px 48px -16px rgba(99, 102, 241, 0.18), 0 8px 16px -8px rgba(15, 23, 42, 0.06)'
                  : '0 8px 20px -8px rgba(15, 23, 42, 0.06)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                  </div>
                  <span className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-emerald-700">
                    Nouveau prospect
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium tabular-nums">
                  {fmtAge(card.bornAt)}
                </span>
              </div>

              {/* Card body — fiche prospect */}
              <div className="px-5 pb-5 space-y-3">
                {/* Nom + ville header */}
                <div>
                  <p className="text-[18px] font-extrabold text-gray-900 tracking-[-0.01em]">{card.name}</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">{card.city}</p>
                </div>

                {/* Coordonnées — liste épurée */}
                <div className="pt-3 border-t border-gray-100/80 space-y-2">
                  <div className="flex items-center gap-3 text-[13px]">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
                    <span className="text-gray-800 font-medium tabular-nums">{card.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
                    <span className="text-gray-700 truncate">{card.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-[13px]">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-gray-700 leading-snug">{card.address}</span>
                  </div>
                </div>

                {/* Motif — badge en bas */}
                <div className="pt-3 border-t border-gray-100/80">
                  <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-1">Motif</p>
                  <p className="text-[14px] font-bold text-emerald-700">{card.intent}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer trust strip — réassure ce qui défile au-dessus */}
      <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-gray-50/80 border border-gray-200/60 px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-gray-400 leading-none">Identité</p>
          <p className="text-[12px] font-bold text-gray-900 mt-1.5">Vérifiée</p>
        </div>
        <div className="text-center border-x border-gray-200/60">
          <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-gray-400 leading-none">Téléphone</p>
          <p className="text-[12px] font-bold text-gray-900 mt-1.5">Confirmé</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-gray-400 leading-none">RGPD</p>
          <p className="text-[12px] font-bold text-emerald-700 mt-1.5">CNIL ✓</p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  ProspectsTestimonials — Carousel mobile + grid desktop             */
/*  Même UX que TestimonialsCarousel : peek 2e carte, dots agrandis,   */
/*  scroll-snap, hint clair. Optimisé conversion mobile.                */
/* ------------------------------------------------------------------ */
const ProspectsTestimonials = () => {
  const carouselRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const appleEase = [0.16, 1, 0.3, 1];

  const testimonials = useMemo(() => ([
    {
      quote: "15 prospects reçus la première semaine, 6 sont devenus clients. À ce prix-là c'est dingue.",
      name: 'Olivier R.',
      role: 'Couvreur · Lyon',
    },
    {
      quote: "On a testé d'autres fichiers avant. Ici ce sont des vrais contacts qui rappellent vraiment.",
      name: 'Sophie M.',
      role: 'Salon de coiffure · Mâcon',
    },
    {
      quote: "22 prospects, 9 RDV et 4 ventes le premier mois. Et c'est exclusif à ma zone, donc pas de concurrence.",
      name: 'Mathieu B.',
      role: 'Conseiller énergie · Strasbourg',
    },
  ]), []);

  // Sync dots avec scroll (throttle 50ms)
  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;
    let timerId = null;
    let lastIdx = -1;

    const compute = () => {
      timerId = null;
      const cards = Array.from(root.querySelectorAll('[data-pro-testi-idx]'));
      if (!cards.length) return;
      const rootRect = root.getBoundingClientRect();
      const center = rootRect.left + rootRect.width / 2;
      let bestIdx = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs((rect.left + rect.width / 2) - center);
        if (dist < minDist) {
          minDist = dist;
          const dataIdx = parseInt(card.getAttribute('data-pro-testi-idx'), 10);
          bestIdx = Number.isNaN(dataIdx) ? i : dataIdx;
        }
      });
      if (bestIdx !== lastIdx) {
        lastIdx = bestIdx;
        setActiveIdx(bestIdx);
      }
    };
    const onScroll = () => {
      if (timerId !== null) return;
      timerId = setTimeout(compute, 50);
    };
    const initTimer = setTimeout(compute, 100);
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(initTimer);
      if (timerId !== null) clearTimeout(timerId);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const CardContent = ({ t, isActive }) => (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.6,
      }}
      transition={{ duration: 0.45, ease: appleEase }}
      className={`relative rounded-2xl bg-white border border-gray-200/70 p-6 lg:p-7 flex flex-col h-full ${
        isActive ? 'shadow-[0_16px_36px_-12px_rgba(15,23,42,0.1)]' : 'shadow-sm'
      } transition-shadow duration-500`}
    >
      <Quote className="w-4 h-4 text-indigo-300 mb-3" strokeWidth={2.4} />
      <p className="text-[14px] lg:text-[14.5px] text-gray-700 leading-[1.6] flex-1">{t.quote}</p>
      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-[13px] font-bold text-gray-900 tracking-[-0.01em]">{t.name}</p>
        <p className="text-[11.5px] text-gray-500 mt-0.5">{t.role}</p>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Mobile : carousel snap-center — peek ~40px de la 2e carte */}
      <div
        ref={carouselRef}
        className="md:hidden -mx-6 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollPaddingLeft: '20px', scrollPaddingRight: '20px' }}
      >
        <div aria-hidden="true" className="shrink-0 w-5" />
        {testimonials.map((t, i) => (
          <div
            key={i}
            data-pro-testi-idx={i}
            className="snap-center shrink-0 w-[calc(100vw-5rem)] pr-3 last:pr-0"
          >
            <CardContent t={t} isActive={i === activeIdx} />
          </div>
        ))}
        <div aria-hidden="true" className="shrink-0 w-5" />
      </div>

      {/* Mobile : Dots agrandis + hint clair */}
      <div className="md:hidden flex justify-center gap-2 mt-3 mb-1">
        {testimonials.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 rounded-full transition-all duration-400 ${
              i === activeIdx ? 'w-8 bg-gray-900' : 'w-2.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
      <p className="md:hidden text-center text-[12.5px] text-gray-500 font-semibold mt-3">
        ← Glissez pour voir d'autres avis →
      </p>

      {/* Desktop : grid 3 cols */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: appleEase, delay: 0.04 + i * 0.06 }}
            className="relative rounded-2xl bg-white border border-gray-200/70 p-6 lg:p-7 flex flex-col"
            style={{ boxShadow: '0 8px 24px -12px rgba(15, 23, 42, 0.06)' }}
          >
            <Quote className="w-4 h-4 text-indigo-300 mb-3" strokeWidth={2.4} />
            <p className="text-[13.5px] lg:text-[14px] text-gray-700 leading-[1.6] flex-1">{t.quote}</p>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[13px] font-bold text-gray-900 tracking-[-0.01em]">{t.name}</p>
              <p className="text-[11.5px] text-gray-500 mt-0.5">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

const LeadsRGPDSection = () => {
  const [form, setForm] = useState({
    entreprise: '',
    secteur: '',
    email: '',
    telephone: '',
    volume: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const appleEase = [0.16, 1, 0.3, 1];

  const sectorOptions = [
    'Choisir mon secteur',
    'Travaux / BTP',
    'Immobilier',
    'Assurance / Mutuelle',
    'Santé / Bien-être',
    'Automobile',
    'Énergie / Photovoltaïque',
    'Formation',
    'Conseil / Services pro',
    'Autre',
  ];

  const volumeOptions = [
    'Volume de prospects souhaité',
    '10 à 25 prospects / mois',
    '25 à 50 prospects / mois',
    '50 à 100 prospects / mois',
    '100 à 250 prospects / mois',
    '250+ prospects / mois',
    'Je ne sais pas, à discuter',
  ];

  const validate = () => {
    // 3 champs requis (étape 1) : nom + téléphone + secteur.
    // Les autres infos (entreprise, email, volume) sont collectées après le 1er clic.
    if (!form.entreprise.trim()) return 'Nom requis';
    if (!form.telephone.trim()) return 'Téléphone requis';
    if (!form.secteur.trim()) return 'Veuillez choisir un secteur';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStatus('loading');
    try {
      const { submitLeadsRequest } = await import('../services/leadService');
      const result = await submitLeadsRequest(form);
      if (result && result.success === false && result.error) {
        // L'Apps Script peut renvoyer success:true même avec un warning interne (CORS opaque)
        // → on considère success si pas d'erreur réseau dure
        console.warn('submitLeadsRequest:', result.error);
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Erreur lors de l\'envoi');
    }
  };

  return (
    <section id="leads-rgpd" className="relative py-20 md:py-28 overflow-hidden scroll-mt-24"
             style={{
               // Fond tinté vert très léger — charte unifiée
               background: 'linear-gradient(180deg, #F0FDF4 0%, #FAFEFB 30%, #F7FDF9 70%, #F0FDF4 100%)',
             }}>
      {/* Ambient gradients verts subtils — cohérence charte */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 left-1/4 w-[700px] h-[700px] rounded-full opacity-[0.08] blur-3xl"
             style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-3xl"
             style={{ background: 'radial-gradient(circle, #059669, transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200/70 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header centré (mobile + desktop) — typo premium */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <ScrollReveal y={16}>
            <span className="inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full mb-7 whitespace-nowrap">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              {/* Mobile : version courte qui tient sur 1 ligne */}
              <span className="sm:hidden">Prospects qualifiés</span>
              {/* Desktop : version complète */}
              <span className="hidden sm:inline">Service indépendant · Prospects qualifiés</span>
            </span>
          </ScrollReveal>
          <ScrollReveal y={24} delay={0.08}>
            <h2 className="text-[36px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-extrabold text-gray-900 leading-[0.98] tracking-[-0.03em]">
              Des clients qui veulent
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                déjà vous appeler.
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal y={20} delay={0.18}>
            <p className="text-[16.5px] md:text-[19px] text-gray-500 max-w-xl mx-auto mt-6 leading-[1.5]">
              Pas du fichier froid. Des contacts qui ont rempli un formulaire pour demander à être rappelés — pour votre métier, dans votre zone.
            </p>
          </ScrollReveal>
          {/* Trust strip — réduit l'anxiété AVANT le formulaire */}
          <ScrollReveal y={14} delay={0.24}>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-7">
              {[
                { icon: Shield, label: 'CNIL conforme' },
                { icon: Target, label: 'Exclusif par zone' },
                { icon: CheckCircle2, label: 'Sans engagement' },
              ].map(({ icon: Icon, label }, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-700">
                  <Icon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.4} />
                  {label}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA primaire visible dès le 1er écran — réserve la zone avant de scroller */}
          <ScrollReveal y={16} delay={0.32}>
            <div className="mt-8 flex flex-col items-center">
              <a
                href="#leads-form"
                onClick={(e) => {
                  e.preventDefault();
                  // Scroll smooth vers le formulaire situé plus bas dans la section
                  const section = document.getElementById('leads-rgpd');
                  if (section) {
                    const forms = section.querySelectorAll('form');
                    const target = forms.length ? forms[0] : section;
                    const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="group inline-flex items-center justify-center gap-2 text-[14.5px] font-bold text-white px-6 py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 16px 36px -10px rgba(16, 185, 129, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12) inset',
                }}
              >
                Réserver ma zone
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </a>
              <p className="text-[11.5px] text-gray-500 mt-2.5">
                Vérification de disponibilité sous 24 h ouvrées · Gratuit
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* 4 chiffres clés — bande unifiée, séparateurs verticaux desktop */}
        <ScrollReveal y={24} delay={0.22}>
          <div className="grid grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto mb-16 lg:mb-24 rounded-[28px] bg-white/85 backdrop-blur-md border border-gray-200/60 overflow-hidden"
               style={{ boxShadow: '0 24px 48px -20px rgba(15, 23, 42, 0.08), 0 8px 16px -8px rgba(15, 23, 42, 0.04)' }}>
            {[
              { value: '1 sur 3', label: 'Prospects qui deviennent clients', accent: 'from-emerald-600 to-teal-500' },
              { value: '24 h', label: 'Livraison après votre inscription', accent: 'from-emerald-600 to-teal-500' },
              { value: '0 €', label: 'D\'abonnement · Payez à l\'unité', accent: 'from-emerald-600 to-teal-500' },
              { value: '100%', label: 'Exclusivité dans votre zone', accent: 'from-emerald-600 to-teal-500' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.08 }}
                className={`text-center py-7 lg:py-9 px-4 ${
                  i > 0 ? 'border-t lg:border-t-0 lg:border-l border-gray-200/70' : ''
                } ${i === 1 ? 'border-l border-gray-200/70 lg:border-l' : ''}`}
              >
                <p className={`text-[40px] sm:text-[52px] lg:text-[60px] font-black tracking-[-0.035em] leading-none bg-gradient-to-br ${s.accent} bg-clip-text text-transparent`}>
                  {s.value}
                </p>
                <p className="text-[12px] lg:text-[13px] text-gray-500 font-medium mt-3 leading-tight tracking-tight max-w-[180px] mx-auto">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Process 4 étapes — Apple feature flow avec connecteurs animés desktop */}
        <ScrollReveal y={24} delay={0.05}>
          <div className="max-w-5xl mx-auto mb-14 lg:mb-20">
            <p className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-gray-400 text-center mb-10">
              Comment ça marche
            </p>
            <div className="relative">
              {/* Ligne de fond desktop qui relie les 4 étapes */}
              <div className="hidden lg:block absolute top-[64px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" aria-hidden="true" />

              <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4 lg:gap-x-6">
                {[
                  { num: '01', icon: Search,    title: 'On source',    desc: 'Campagnes ciblées sur votre secteur.' },
                  { num: '02', icon: Shield,    title: 'On qualifie',  desc: 'Identité, téléphone et RGPD vérifiés.' },
                  { num: '03', icon: Package,   title: 'On livre',     desc: 'Vos prospects sous 24 h max.' },
                  { num: '04', icon: PhoneCall, title: 'Vous appelez', desc: 'Avant qu\'ils ne perdent l\'envie.' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.1 }}
                      className="relative flex flex-col items-center text-center"
                    >
                      {/* Step number badge */}
                      <span className="mb-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 text-[11px] font-black tracking-tight text-gray-500 tabular-nums"
                            style={{ boxShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.08)' }}>
                        {s.num}
                      </span>
                      {/* Icon circle — anchor point sur la ligne de connexion desktop */}
                      <div className="relative w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center mb-4 z-10"
                           style={{ boxShadow: '0 12px 28px -10px rgba(99, 102, 241, 0.28), 0 4px 8px -4px rgba(99, 102, 241, 0.1)' }}>
                        <Icon className="w-6 h-6 text-emerald-600" strokeWidth={1.9} />
                        {/* Halo subtle */}
                        <div className="absolute inset-0 rounded-2xl opacity-50 blur-md pointer-events-none -z-10"
                             style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18), transparent 70%)' }} />
                      </div>
                      <p className="text-[15px] font-bold text-gray-900 tracking-[-0.01em] leading-tight">{s.title}</p>
                      <p className="text-[12.5px] text-gray-500 mt-2 leading-snug max-w-[180px]">{s.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bandeau prix transparent — ticket premium qui débloque la décision */}
        <ScrollReveal y={24} delay={0.08}>
          <div className="max-w-2xl mx-auto mb-16 lg:mb-24">
            <div className="relative rounded-[28px] bg-white overflow-hidden"
                 style={{
                   border: '1px solid rgba(15, 23, 42, 0.06)',
                   boxShadow: '0 24px 48px -20px rgba(15, 23, 42, 0.08), 0 8px 16px -8px rgba(15, 23, 42, 0.04)',
                 }}>
              {/* Subtle gradient orb décoratif */}
              <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
                   style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)' }} />
              <div className="relative px-7 py-7 lg:px-10 lg:py-9 text-center">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.18em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full mb-5">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Tarifs transparents
                </span>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="text-[14px] font-semibold text-gray-500">À partir de</span>
                  <span className="text-[52px] lg:text-[64px] font-black tracking-[-0.04em] leading-none bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">15&nbsp;€</span>
                </div>
                <p className="text-[14.5px] lg:text-[15.5px] font-bold text-gray-900 tracking-[-0.01em]">
                  le prospect qualifié
                </p>
                <p className="text-[12.5px] text-gray-500 mt-1.5">
                  selon votre secteur et votre zone
                </p>
                {/* Séparateur ticket-style */}
                <div className="my-5 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gray-200" />
                  <div className="flex-1 h-px border-t border-dashed border-gray-200" />
                  <span className="w-2 h-2 rounded-full bg-gray-200" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {['Pas d\'abonnement', 'Pas d\'engagement', 'Payez ce que vous recevez'].map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
                      <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bloc 2 colonnes : Live feed | Form — alignés en haut, même importance visuelle */}
        <div className="grid lg:grid-cols-[1fr_minmax(0,460px)] gap-10 lg:gap-16 items-start mb-16 lg:mb-24">

          {/* COL GAUCHE — Live feed (preuve visuelle de ce que l'user recevra) */}
          <div className="order-2 lg:order-1">
            <ScrollReveal y={24} delay={0.05}>
              <LiveProspectsFeed />
            </ScrollReveal>
          </div>

          {/* Formulaire — order-1 sur mobile, HERO du bloc */}
          <ScrollReveal y={30} delay={0.12} className="order-1 lg:order-2">
            <div
              className="relative rounded-[28px] bg-white p-7 lg:p-10"
              style={{
                border: '1px solid rgba(99, 102, 241, 0.12)',
                boxShadow: '0 50px 100px -20px rgba(99, 102, 241, 0.22), 0 20px 40px -16px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.06)',
              }}
            >
              {/* Halo gradient prononcé derrière — c'est le HERO de la section */}
              <div className="absolute -inset-2 -z-10 rounded-[36px] opacity-70 blur-3xl pointer-events-none"
                   style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28), transparent 70%)' }}
                   aria-hidden="true" />
              {status === 'success' ? (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 12px 28px -8px rgba(16, 185, 129, 0.45)',
                    }}
                  >
                    <Check className="w-7 h-7 text-white" strokeWidth={2.4} />
                  </motion.div>
                  <h3 className="text-[20px] font-extrabold text-gray-900 tracking-[-0.02em]">Demande envoyée</h3>
                  <p className="text-[14px] text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed">
                    Notre équipe vous rappelle sous <span className="font-semibold text-gray-900">24h ouvrées</span> pour discuter de votre besoin.
                  </p>
                  <div className="mt-5 mx-auto max-w-xs rounded-2xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 flex items-start gap-3 text-left">
                    <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-[12.5px] text-emerald-900 leading-snug">
                      <span className="font-semibold">Un email de confirmation vient de vous être envoyé.</span>
                      <br/>
                      <span className="text-emerald-700/80">Pensez à vérifier vos spams si vous ne le voyez pas.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full mb-4">
                    <Target className="w-3 h-3" strokeWidth={2.4} />
                    Réservez votre zone
                  </span>
                  <h3 className="text-[24px] sm:text-[28px] font-extrabold text-gray-900 tracking-[-0.025em] leading-[1.1] mb-2">
                    Recevez vos prospects
                    <br/>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">en 24 heures.</span>
                  </h3>
                  <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
                    On vous rappelle sous 24 h pour valider votre zone et vous livrer vos premiers prospects qualifiés.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Étape 1 simplifiée : 3 champs seulement (nom + téléphone + secteur).
                        Les autres infos (email, volume) seront collectées
                        lors de l'appel de confirmation sous 24h. */}
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={form.entreprise}
                      onChange={(e) => setForm(f => ({ ...f, entreprise: e.target.value }))}
                      autoComplete="name"
                      style={{ fontSize: 16 }}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <input
                      type="tel"
                      placeholder="Votre téléphone"
                      value={form.telephone}
                      onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))}
                      autoComplete="tel"
                      style={{ fontSize: 16 }}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    {/* Chips secteurs — flex-wrap : les chips passent à la ligne sur 2-3 rows,
                        AUCUN scroll horizontal donc impossible de déborder du viewport. */}
                    <div className="w-full">
                      <p className="text-[11.5px] font-semibold text-gray-600 mb-2 px-1">
                        Votre secteur
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sectorOptions.slice(1).map((s, i) => {
                          const isActive = form.secteur === s;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, secteur: s }))}
                              className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-all active:scale-95"
                              style={{
                                background: isActive ? '#10B981' : '#F9FAFB',
                                color: isActive ? '#FFFFFF' : '#374151',
                                border: isActive ? '1px solid #10B981' : '1px solid #E5E7EB',
                                boxShadow: isActive ? '0 4px 12px rgba(16,185,129,0.28)' : 'none',
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {error && (
                      <p className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 font-medium">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group w-full mt-3 inline-flex items-center justify-center gap-2 text-[15.5px] font-bold text-white px-5 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed tracking-tight"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 16px 40px -12px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12) inset',
                      }}
                    >
                      {status === 'loading' ? 'Envoi…' : (
                        <>
                          Je veux mes prospects
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                    {/* Trust badges intégrés sous le CTA */}
                    <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                      {[
                        'Sans engagement',
                        'Sans CB',
                        'Réponse 24 h',
                      ].map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </form>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Témoignages dédiés Prospects — preuve sociale spécifique */}
        <ScrollReveal y={20} delay={0.04}>
          <div className="text-center mb-10">
            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-gray-400">
              Ce qu'en disent les commerçants
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal y={24} delay={0.08}>
          <div className="max-w-5xl mx-auto mb-16 lg:mb-24">
            <ProspectsTestimonials />
          </div>
        </ScrollReveal>

        {/* 4 bénéfices — eyebrow centré + cards premium */}
        <ScrollReveal y={20} delay={0.04}>
          <div className="text-center mb-10">
            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-gray-400">
              Pourquoi ça convertit
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal y={24} delay={0.08}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {[
              { icon: Target,    title: 'Intention d\'achat',     desc: 'Ils ont rempli un formulaire pour être recontactés.' },
              { icon: Shield,    title: 'Exclusif par zone',       desc: 'Votre prospect n\'est jamais revendu ailleurs.' },
              { icon: Zap,       title: 'Livrés en 24 h',          desc: 'À appeler quand l\'envie est encore fraîche.' },
              { icon: CheckCircle2, title: '100% RGPD CNIL',       desc: 'Vous arrêtez quand vous voulez, sans frais.' },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.06 }}
                  className="relative rounded-2xl bg-white border border-gray-200/70 px-5 py-5 lg:px-6 lg:py-6 transition-all hover:border-emerald-200 hover:shadow-[0_12px_32px_-12px_rgba(16,185,129,0.18)]"
                >
                  <div className="inline-flex w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center mb-3">
                    <Icon className="w-[18px] h-[18px] text-emerald-600" strokeWidth={2.2} />
                  </div>
                  <p className="text-[14.5px] lg:text-[15.5px] font-bold text-gray-900 tracking-[-0.01em] leading-snug">{b.title}</p>
                  <p className="text-[12.5px] lg:text-[13.5px] text-gray-500 leading-relaxed mt-1.5">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};


/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function IAVocaleLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Données des 6 services détaillés (partagés desktop ServiceShowcases + mobile MobileServiceDetail)
  const showcasesData = useMemo(() => buildShowcasesData(), []);

  // Sync mobile carousel ↔ détail service en dessous
  // Stratégie : scroll listener throttled (50ms) — bien suffisant pour le sync visuel,
  // sans recalculer 60 fois/seconde pendant l'auto-scroll smooth.
  const servicesCarouselRef = useRef(null);
  const [activeMobileSvcIdx, setActiveMobileSvcIdx] = useState(0);
  useEffect(() => {
    const root = servicesCarouselRef.current;
    if (!root) return;

    let timerId = null;
    let lastIdx = -1;

    const compute = () => {
      timerId = null;
      const cards = Array.from(root.querySelectorAll('.mobile-service-card'));
      if (!cards.length) return;
      const rootRect = root.getBoundingClientRect();
      const center = rootRect.left + rootRect.width / 2;
      let bestIdx = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs((rect.left + rect.width / 2) - center);
        if (dist < minDist) {
          minDist = dist;
          const dataIdx = parseInt(card.getAttribute('data-svc-idx'), 10);
          bestIdx = Number.isNaN(dataIdx) ? i : dataIdx;
        }
      });
      if (bestIdx !== lastIdx) {
        lastIdx = bestIdx;
        setActiveMobileSvcIdx(bestIdx);
      }
    };

    // Throttle setTimeout 50ms — ~20 fps de check max, négligeable côté CPU
    const onScroll = () => {
      if (timerId !== null) return;
      timerId = setTimeout(compute, 50);
    };

    const initTimer = setTimeout(compute, 100);
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(initTimer);
      if (timerId !== null) clearTimeout(timerId);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // ─── Auto-scroll du carousel services mobile ───
  // Démarre 1.5s APRÈS que la section "Nos services" entre dans le viewport.
  // Avance 1 carte toutes les 3.5s. S'arrête définitivement au 1er touch/clic/swipe.
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  useEffect(() => {
    if (!autoScrollEnabled) return;
    const root = servicesCarouselRef.current;
    if (!root) return;
    // Mobile only — desktop affiche déjà tout en grid
    if (window.matchMedia && !window.matchMedia('(max-width: 1023px)').matches) return;

    const cards = Array.from(root.querySelectorAll('.mobile-service-card'));
    if (cards.length < 2) return;

    let currentIdx = 0;
    let interval = null;
    let startTimeout = null;
    let stopped = false;

    // Détecte interaction utilisateur → arrête définitivement l'auto-scroll
    const stopAuto = () => {
      stopped = true;
      setAutoScrollEnabled(false);
      if (interval) clearInterval(interval);
      if (startTimeout) clearTimeout(startTimeout);
    };
    root.addEventListener('touchstart', stopAuto, { passive: true });
    root.addEventListener('mousedown', stopAuto);
    root.addEventListener('wheel', stopAuto, { passive: true });

    const startAutoScroll = () => {
      if (stopped) return;
      // 1.5s d'attente après l'entrée en viewport pour laisser à l'œil le temps de se poser
      startTimeout = setTimeout(() => {
        if (stopped) return;
        interval = setInterval(() => {
          if (stopped) { clearInterval(interval); return; }
          currentIdx = (currentIdx + 1) % cards.length;
          const target = cards[currentIdx];
          if (!target) return;
          // scroll horizontal uniquement (pas de scroll vertical de la page)
          const rootRect = root.getBoundingClientRect();
          const cardRect = target.getBoundingClientRect();
          const delta = (cardRect.left + cardRect.width / 2) - (rootRect.left + rootRect.width / 2);
          root.scrollTo({
            left: root.scrollLeft + delta,
            behavior: 'smooth',
          });
        }, 3500);
      }, 1500);
    };

    // IntersectionObserver — déclenche l'auto-scroll quand le carousel entre dans le viewport
    let triggered = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.4 && !triggered && !stopped) {
          triggered = true;
          startAutoScroll();
        }
      });
    }, { threshold: [0.4, 0.6, 0.8] });
    io.observe(root);

    return () => {
      io.disconnect();
      if (startTimeout) clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
      root.removeEventListener('touchstart', stopAuto);
      root.removeEventListener('mousedown', stopAuto);
      root.removeEventListener('wheel', stopAuto);
    };
  }, [autoScrollEnabled]);

  // Popup capture email — TOUS les CTAs (gratuit ET plans payants) y passent.
  // L'essai gratuit 100 appels / 14 jours est offert à tous.
  // Depuis la page /configurer/:token, l'user peut ensuite upgrader vers
  // un plan payant (redirection Stripe) ou annuler son plan.
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSource, setPopupSource] = useState('hero');
  const [popupPlanIntent, setPopupPlanIntent] = useState('gratuit'); // plan d'intérêt (analytics)
  // ── Signup modal (remplace la redirection vers /inscription-trial) ──
  // La route /inscription-trial reste accessible pour les ads payantes
  // (Meta/Google Ads, retargeting, partage direct), mais tous les CTAs
  // landing ouvrent désormais le modal pour zéro friction.
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [signupModalSource, setSignupModalSource] = useState('hero');
  const [signupModalPlanIntent, setSignupModalPlanIntent] = useState('gratuit');
  const openPopup = (source = 'unknown', planIntent = 'gratuit') => {
    setSignupModalSource(source);
    setSignupModalPlanIntent(planIntent);
    setSignupModalOpen(true);
    // Backwards-compat : on garde le state legacy au cas où d'autres composants l'écoutent
    setPopupSource(source);
    setPopupPlanIntent(planIntent);
    // Tracking analytics (placeholder — branchable plus tard sur GA/Meta/etc.)
    try {
      if (typeof window !== 'undefined' && typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({ event: 'signup_modal_opened', source, planIntent });
      }
    } catch (_e) {
      /* swallow */
    }
  };

  // Import flow state
  const [importTab, setImportTab] = useState('manual');
  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvMapping, setCsvMapping] = useState({ nom: '', telephone: '', dateRdv: '' });
  const [csvMappingConfirmed, setCsvMappingConfirmed] = useState(false);
  const [manualRows, setManualRows] = useState([
    { prenom: '', telephone: '', dateRdv: '' },
  ]);
  const [importState, setImportState] = useState('idle'); // idle | uploading | info | plan | redirecting
  const [countdown, setCountdown] = useState(3);
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Service type (global for all contacts)
  const [serviceType, setServiceType] = useState('');
  const [csvHelpOpen, setCsvHelpOpen] = useState(false);

  // FAQ
  const [openFaq, setOpenFaq] = useState(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'IA Vocale — Confirmations de RDV et relances automatiques | BoosterPay';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', "L'IA décroche vos appels 24/7 quand vous êtes occupé. Tous les modules inclus pour 99€ HT/mois. Essai 7 jours gratuits, annulation libre.");
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "L'IA décroche vos appels 24/7 quand vous êtes occupé. Tous les modules inclus pour 99€ HT/mois. Essai 7 jours gratuits, annulation libre.";
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Countdown + redirect
  useEffect(() => {
    if (importState !== 'redirecting') return;
    if (countdown <= 0) {
      try { localStorage.setItem('bp_source', 'ia-vocale'); } catch(e) {}
      window.location.href = STRIPE_LINKS[selectedPlan] || STRIPE_LINKS.decouverte;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [importState, countdown]);

  /* ── CSV handling ─────────────────────────────────────────── */
  const handleCsvFile = (file) => {
    if (!file) return;
    setCsvFileName(file.name);
    setCsvMappingConfirmed(false);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        const autoMap = { nom: '', telephone: '', dateRdv: '' };
        headers.forEach((h) => {
          const lower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (!autoMap.nom && (lower.includes('nom') || lower.includes('name') || lower.includes('prenom') || lower.includes('client'))) autoMap.nom = h;
          if (!autoMap.telephone && (lower.includes('tel') || lower.includes('phone') || lower.includes('mobile') || lower.includes('numero'))) autoMap.telephone = h;
          if (!autoMap.dateRdv && (lower.includes('date') || lower.includes('rdv') || lower.includes('echeance'))) autoMap.dateRdv = h;
        });
        setCsvMapping(autoMap);
      },
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleCsvFile(file);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  /* ── Manual rows ──────────────────────────────────────────── */
  const updateRow = (idx, field, value) => {
    const updated = [...manualRows];
    updated[idx] = { ...updated[idx], [field]: value };
    setManualRows(updated);
  };
  const addRow = () =>
    setManualRows([...manualRows, { prenom: '', telephone: '', dateRdv: '' }]);
  const removeRow = (idx) => {
    if (manualRows.length <= 1) return;
    setManualRows(manualRows.filter((_, i) => i !== idx));
  };

  /* ── Submit ───────────────────────────────────────────────── */
  const scrollToImport = () => {
    setTimeout(() => {
      window.scrollTo({ top: document.getElementById('import')?.offsetTop - 80, behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = () => {
    setImportState('uploading');
    setTimeout(() => {
      setImportState('info');
      scrollToImport();
    }, 2000);
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (!companyName.trim() || !companyEmail.trim()) return;
    setImportState('plan');
    scrollToImport();
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setImportState('redirecting');
    setCountdown(3);

    // Fire-and-forget lead capture to CRM
    const planNames = { decouverte: 'Essai Découverte', boost: 'Pack Boost', business: 'Pack Business', croissance: 'Croissance' };
    const contactCount = csvData ? csvData.length : manualRows.filter(r => r.prenom || r.telephone).length;
    const contactsList = csvData
      ? csvData.map(r => ({ nom: r[csvMapping.nom] || '', telephone: r[csvMapping.telephone] || '', email: r[csvMapping.email] || '' }))
      : manualRows.filter(r => r.prenom || r.telephone);
    captureLeadFromSite({
      companyName,
      email: companyEmail,
      plan: planNames[planId] || planId,
      contactCount,
      source: 'ia-vocale',
      serviceType,
      contacts: contactsList,
      timestamp: new Date().toISOString(),
    });
  };

  /* ── Data ──────────────────────────────────────────────────── */
  const stats = [
    { value: '0', suffix: '', prefix: '', label: 'appel perdu' },
    { value: '35', suffix: '%', prefix: '+', label: 'de clients' },
    { value: '10', suffix: 'h', prefix: '', label: 'gagnées/sem.' },
    { value: '24', suffix: '/7', prefix: '', label: 'disponible' },
  ];

  const useCases = [
    { icon: Wrench, title: 'Garagiste', desc: 'Relance des contrôles techniques et entretiens annuels automatiquement.' },
    { icon: Shield, title: 'Courtier', desc: 'Renouvellements de contrats d\'assurance sans passer un seul appel.' },
    { icon: Heart, title: 'Dentiste / Médecin', desc: 'Rappels de bilans annuels, détartrages et contrôles périodiques.' },
    { icon: Eye, title: 'Opticien', desc: 'Renouvellement lunettes et lentilles quand l\'ordonnance expire.' },
    { icon: Scissors, title: 'Salon coiffure / beauté', desc: 'Réactivation des clients dormants qui n\'ont pas pris RDV depuis 3 mois.' },
    { icon: Activity, title: 'Coach / Kiné', desc: 'Suivi des séances et relance pour la continuité du parcours.' },
  ];

  const steps = [
    { icon: Sparkles, title: 'Activez en 5 minutes', desc: 'Vous renseignez votre email. On configure votre IA. C\'est tout.' },
    { icon: Bot, title: 'L\'IA travaille 24/7', desc: 'Elle passe vos appels sortants. Elle décroche les entrants. Sans pause, sans erreur.' },
    { icon: TrendingUp, title: 'Vous récoltez les résultats', desc: 'Agenda rempli, dossiers renouvelés, leads qualifiés. Vous ne perdez plus un client.' },
  ];

  const testimonials = [
    {
      name: 'Thomas Roux',
      role: 'Garagiste',
      city: 'Rennes',
      quote: '12 clients réactivés la première semaine, des contrôles techniques que j\'aurais perdus sans les relances IA.',
      result: '+3 200€ de CA / mois',
      avatar: 'T',
      color: 'emerald',
      sectorIcon: Wrench,
    },
    {
      name: 'Camille Durand',
      role: 'Ostéopathe',
      city: 'Nantes',
      quote: 'Zéro lapin depuis que les confirmations IA sont en place. Mon planning est enfin fiable, et j\'ai gagné 1h/jour.',
      result: 'No-show -42%',
      avatar: 'C',
      color: 'blue',
      sectorIcon: Activity,
    },
    {
      name: 'Marc Lefranc',
      role: 'Courtier en assurance',
      city: 'Brest',
      quote: '80% de contrats renouvelés sans passer un seul appel. Je me consacre à la prospection, l\'IA fait le reste.',
      result: '+8 700€ de CA / mois',
      avatar: 'M',
      color: 'violet',
      sectorIcon: Shield,
    },
    {
      name: 'Sophie Bernard',
      role: 'Salon de coiffure',
      city: 'Vannes',
      quote: 'Impact Avis a fait passer ma fiche Google de 4,1 à 4,7 étoiles en 2 mois. Je reçois 2× plus d\'appels qu\'avant.',
      result: '+38 avis Google',
      avatar: 'S',
      color: 'yellow',
      sectorIcon: Scissors,
    },
    {
      name: 'Pierre Martin',
      role: 'Cabinet d\'expertise comptable',
      city: 'Quimper',
      quote: 'Mes délais de paiement sont passés de 31 à 19 jours. La trésorerie n\'a jamais été aussi saine.',
      result: 'Délais -39%',
      avatar: 'P',
      color: 'rose',
      sectorIcon: FileText,
    },
    {
      name: 'Julie Lemaire',
      role: 'Cabinet dentaire',
      city: 'Saint-Malo',
      quote: 'L\'IA appelle la veille pour confirmer chaque RDV. Mes journées sont enfin remplies, sans temps mort.',
      result: 'Taux de présence 94%',
      avatar: 'J',
      color: 'amber',
      sectorIcon: Heart,
    },
  ];

  // Tarification — 1 plan unique, simple et lisible (99€ HT/mois, anchor 149€)
  const pricing = [
    {
      id: 'ia-vocale',
      name: 'BoosterPay IA Vocale',
      tagline: 'Tarif sécurisé — Verrouillez votre tarif aujourd\'hui',
      priceMensuel: 99,
      priceAnchor: 149,
      unit: 'HT / mois',
      calls: 'Appels illimités inclus',
      roiHint: '1 client récupéré = abonnement remboursé',
      socialProof: '+250 pros · ⭐ 4,8/5',
      features: [
        'Réception d\'appels IA 24/7 — l\'IA décroche en 2s à votre place',
        'Renouvellement de dossiers automatique (CT, assurances, entretiens)',
        'Confirmation de RDV J-1 (anti-lapins)',
        'Impact Avis Google (filtrage 4★+ vers Google, < 4★ en interne)',
        'Accélération de paiements (délais -40%)',
        'Robot IA sur mesure si besoin spécifique',
        'Facture mensuelle déductible en charges',
        'Annulation libre dans votre espace',
      ],
      cta: 'Démarrer gratuitement',
      popular: true,
      trialText: 'Rien débité avant J+8 · Annulation en 1 clic · Sans engagement',
    },
  ];

  const faqs = [
    {
      q: "Mes clients vont-ils raccrocher en entendant une IA ?",
      a: "Non — et c'est toute la différence avec les robots automatisés bas de gamme. Notre IA utilise une voix française naturelle, indistinguable d'un humain pour 94% des appelés selon nos tests. Elle se présente au nom de votre entreprise, écoute, s'adapte aux réponses, et reste polie en toutes circonstances. Aucune coupure brutale, aucune pression. Vos clients ressortent de l'appel avec une impression positive."
    },
    {
      q: "Et si l'IA donne une mauvaise info à mon client ?",
      a: "L'IA suit strictement le script que vous validez avant le lancement. Elle ne sort pas de son périmètre — si un client pose une question hors-script (par exemple un cas technique très spécifique), elle bascule automatiquement vers un rappel humain de votre part ou prend les coordonnées du client. Vous pouvez aussi écouter chaque appel + lire la transcription dans votre CRM, donc vous gardez 100% de contrôle."
    },
    {
      q: "Combien de temps ça prend vraiment à configurer ?",
      a: "5 minutes pour démarrer — vous remplissez 5 champs, vous validez votre carte (essai 7 jours), votre numéro local est activé immédiatement. Pour le module Réception 24/7, on vous accompagne par email pour configurer le transfert d'appel chez votre opérateur. C'est ce qui prend le plus de temps, mais on s'occupe de tout : vous donnez l'autorisation, on fait le reste."
    },
    {
      q: "Je suis [plombier/coiffeur/garagiste], pas tech — est-ce que je vais y arriver seul ?",
      a: "Oui. Tout passe par 2 actions simples : (1) remplir le formulaire d'inscription en 1 minute, (2) valider votre carte (essai 7 jours offerts). Votre numéro local est activé automatiquement. Aucun code, aucune installation logicielle, aucune intégration technique à faire vous-même. Et si vous bloquez sur quelque chose, on est joignable à contact@booster-pay.com — réponse en moins de 2h ouvrées."
    },
    {
      q: "Que se passe-t-il après mes 7 jours d'essai ?",
      a: "Si vous décidez de continuer, votre carte est débitée automatiquement de 99 € HT/mois à J+7 — pas d'autre action de votre part. Si vous préférez arrêter, vous annulez en 1 clic depuis votre espace avant le 7e jour : aucun débit n'est effectué. Vous serez prévenu par email 48h avant la fin de l'essai pour vous laisser le choix en toute transparence."
    },

    /* ── Questions Prospects (service indépendant) — placées dans le top 8 pour visibilité ── */
    {
      q: "Achat de prospects : ces contacts ont-ils vraiment demandé à être rappelés ?",
      a: "Oui. Chaque prospect a rempli un formulaire en ligne (Google Ads, Meta Ads, site spécialisé) en indiquant son besoin et en cochant explicitement la case « Je consens à être recontacté pour mon projet ». Vous recevez son téléphone vérifié, son email, son adresse et le motif exact de sa demande. Aucun fichier scrapé, aucune cold list. 100 % opt-in, 100 % RGPD CNIL."
    },
    {
      q: "Achat de prospects : et si je suis déçu d'un prospect livré ?",
      a: "Tous les prospects sont vérifiés (identité, téléphone valide, intention confirmée) avant livraison. Si un prospect s'avère faux numéro, doublon ou injoignable malgré 3 tentatives, il est automatiquement remplacé sans frais supplémentaire. Vous payez uniquement les prospects qualifiés que vous recevez."
    },
    {
      q: "Achat de prospects : ma zone géographique est-elle disponible ?",
      a: "Un seul commerce par secteur et par zone géographique (exclusivité totale). Quand vous remplissez le formulaire « Acheter des prospects », notre équipe vérifie sous 24 h ouvrées que votre zone est libre et vous rappelle. Si elle est déjà prise par un confrère, on vous met sur liste d'attente — sans engagement, sans frais."
    },

    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, en 1 clic depuis votre espace de configuration — sans justification, sans frais, sans période d'engagement. L'annulation prend effet à la fin du mois en cours, sans aucun frais de résiliation. Aucune reconduction tacite : si vous arrêtez, vous arrêtez."
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      a: "Hébergement en France et UE, chiffrement AES-256 au repos et TLS 1.3 en transit, conformité RGPD totale. Vos clients peuvent se désinscrire en 1 clic ou en disant simplement « stop » à l'IA. Vos transcriptions vous appartiennent et sont supprimables à tout moment depuis votre espace."
    },
    {
      q: "Et si l'IA n'arrive pas à joindre certains clients ?",
      a: "L'IA tente jusqu'à 3 rappels intelligemment espacés sur 5 jours, en variant les créneaux horaires (jamais avant 9h ni après 19h). Si malgré ça le client reste injoignable, le contact est marqué « injoignable » dans votre CRM avec toutes les transcriptions des tentatives. Vous pouvez ensuite décider de relancer plus tard ou d'archiver."
    },
  ];

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* Barre de navigation services supprimée — la page IA Vocale absorbe les 2 autres services */}

      {/* ── Bandeau urgence / preuve sociale live ── */}
      <UrgencyBanner />

      {/* ============================================ */}
      {/* NAVBAR                                       */}
      {/* ============================================ */}
      <nav className={`fixed top-7 sm:top-7 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            <GradientText>BoosterPay</GradientText>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              l.highlight ? (
                <a
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-full transition-all"
                >
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  {l.label}
                </a>
              ) : (
                <a key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                  {l.label}
                </a>
              )
            ))}
          </div>

          {/* CTA unique navbar — ultra-visible */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/connexion"
              className="text-[14px] font-medium text-gray-600 hover:text-emerald-700 transition-colors duration-200"
            >
              Se connecter
            </Link>
            <a
              href="#" onClick={(e) => { e.preventDefault(); openPopup('navbar', 'gratuit'); }}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-200"
            >
              Démarrer mon essai 7 jours <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile : pill CTA "Acheter prospects →" + hamburger
              Outlined emerald clair = signal "action commerciale", pas un lien de nav */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href="#leads-rgpd"
              className="inline-flex items-center gap-1 text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-full active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.30)' }}
              aria-label="Acheter des prospects"
            >
              Acheter prospects
              <ArrowRight className="w-3 h-3" strokeWidth={2.8} />
            </a>
            <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                {navLinksMobile.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 font-medium ${l.highlight ? 'text-indigo-700' : 'text-gray-700'}`}
                  >
                    {l.highlight && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 align-middle" />}
                    {l.label}
                  </a>
                ))}
                <button type="button" onClick={() => { setMobileMenuOpen(false); openPopup('mobile-menu', 'gratuit'); }} className="block w-full text-center text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 rounded-full font-semibold mt-2">
                  Essai gratuit
                </button>
                <Link
                  to="/connexion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center text-[14px] font-medium text-gray-600 hover:text-emerald-700 pt-2"
                >
                  J'ai déjà un compte — Se connecter
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ============================================ */}
      {/* HERO                                         */}
      {/* ============================================ */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/30 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* CSS keyframes for hero fade-in — zero JS overhead on mobile */}
          <style>{`
            @keyframes heroFadeUp {
              from { opacity: 0; transform: translateY(20px) translateZ(0); }
              to { opacity: 1; transform: translateY(0) translateZ(0); }
            }
            @keyframes heroServiceIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .hero-fade { 
              animation: heroFadeUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) both;
              will-change: opacity, transform;
            }
            .hero-fade-1 { animation-delay: 0s; }
            .hero-fade-2 { animation-delay: 0.08s; }
            .hero-fade-3 { animation-delay: 0.16s; }
            .hero-fade-4 { animation-delay: 0.24s; }
            .hero-fade-5 { animation-delay: 0.4s; }
          `}</style>
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Pure CSS animations, no framer-motion overhead */}
            <div>
              <div className="hero-fade hero-fade-1">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-7">
                  <Zap className="w-4 h-4" /> IA Vocale pour professionnels
                </span>
              </div>

              {/* Preuve sociale ENRICHIE au-dessus du titre — 5 avatars + 5 étoiles + 250 pros */}
              <div className="hero-fade hero-fade-1 flex items-center gap-3 mb-8">
                {/* Avatars empilés — tous en vert uniforme Apple */}
                <div className="flex -space-x-2">
                  {['T', 'S', 'M', 'J', 'C'].map((letter, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                      {letter}
                    </div>
                  ))}
                </div>
                {/* Étoiles + texte */}
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" strokeWidth={1} />
                    ))}
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700"><span className="font-bold">+250 pros</span> nous font confiance · 4,8/5</span>
                </div>
              </div>

              {/* Titre ultra-premium dans la police projet (Plus Jakarta Sans) — cohérence totale */}
              <h1 className="hero-fade hero-fade-2 mt-2">
                {/* Ligne 1 — Question d'intro, extrabold (cohérent), gris Apple chic */}
                <span
                  className="block text-[42px] sm:text-[56px] lg:text-[64px] font-extrabold leading-[1.04] tracking-[-0.035em]"
                  style={{ color: '#86868B' }}
                >
                  Occupé&nbsp;?
                </span>
                {/* Ligne 2 — Climax XXL, extrabold, tracking serré, gradient emerald + point signature */}
                <span
                  className="block mt-3 text-[60px] sm:text-[76px] lg:text-[92px] font-extrabold leading-[0.96] tracking-[-0.04em]"
                  style={{ color: '#1D1D1F' }}
                >
                  Votre IA{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    }}
                  >
                    décroche
                  </span>
                  <span style={{ color: '#10B981' }}>.</span>
                </span>
              </h1>

              <p className="hero-fade hero-fade-3 mt-7 text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl">
                Pendant que vous travaillez, elle qualifie, prend RDV, et vous envoie le récap par SMS.
              </p>

              {/* CTA — espace mesuré pour respiration Apple */}
              <div className="hero-fade hero-fade-4 mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
                  className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-full hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-200"
                  style={{ boxShadow: '0 16px 40px -8px rgba(16, 185, 129, 0.45)' }}
                >
                  Démarrer mon essai 7 jours <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <p className="hero-fade hero-fade-4 mt-3 text-sm text-gray-400">
                7 jours offerts · Annulation libre · Opérationnel en 5 minutes
              </p>

              {/* GAME CHANGER — Compteur live : FOMO immédiat */}
              <LiveCounter />

              {/* Lien discret Prospects */}
              <a
                href="#leads-rgpd"
                className="hero-fade hero-fade-4 group mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Ou achetez directement des prospects qualifiés
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </a>

              {/* Stats — sous un titre contextuel pour ancrer émotionnellement les chiffres */}
              <div className="hero-fade hero-fade-5 mt-12 pt-8 border-t border-gray-200">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 mb-1 text-center sm:text-left">
                  Ce que ça change concrètement
                </p>
                <p className="text-[13px] text-gray-500 mb-5 text-center sm:text-left">
                  Moyenne observée sur les commerçants BoosterPay après 30 jours.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
                  {stats.map((s, i) => (
                    <div key={i} className={`text-center sm:text-left px-4 ${i < stats.length - 1 ? 'sm:border-r sm:border-gray-200' : ''}`}>
                      <p className="text-3xl md:text-4xl font-extrabold text-emerald-500 tracking-tight">
                        <AnimatedNumber value={s.value} suffix={s.suffix} prefix={s.prefix || ''} />
                      </p>
                      <p className="text-[12.5px] font-medium text-gray-500 mt-1.5 tracking-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Hero animation (desktop only) */}
            <div className="hero-fade hero-fade-4" style={{ transform: 'translateZ(0)' }}>
              <HeroAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TWO APPROACHES — IA vs Prospects (positioning) */}
      {/* Posé tout de suite : visiteur comprend les 2 offres avant les deep dives */}
      {/* ============================================ */}
      <TwoApproachesSection />

      {/* ============================================ */}
      {/* RÉCEPTION D'APPELS IA — FLAGSHIP HERO        */}
      {/* ============================================ */}
      <ReceptionFlagshipSection openPopup={openPopup} />


      {/* ── Section Robot Personnalisé ── */}
      {/* ── Quatre services. Un seul outil. ── */}
      <section className="relative pt-16 pb-28 md:pt-24 md:pb-32 bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA] overflow-hidden">
        {/* Ambient gradients multicolores doux */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-[5%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
               style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)' }} />
          <div className="absolute top-40 right-[5%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
               style={{ background: 'radial-gradient(circle, #F43F5E, transparent 70%)' }} />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full opacity-[0.04] blur-3xl"
               style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Nos services"
            title="Votre secrétaire IA fait tout ça."
            subtitle="Une seule plateforme. La Réception d'appels 24/7 est toujours active. Vous activez les modules dont vous avez besoin — tous sont inclus."
          />

          {/* Nudge swipe AU-DESSUS du carousel (mobile only) — l'user comprend
              qu'il peut glisser AVANT de voir les cards qui débordent à droite */}
          <div className="lg:hidden flex items-center justify-center gap-2 mt-6 mb-3 text-[12px] font-semibold text-emerald-700">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" strokeWidth={2.6} />
            <span>Glissez pour voir les 6 services</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.6} />
          </div>

          {/* Carousel mobile (swipe horizontal) + Grid 3 cols desktop — 6 services unifiés */}
          <div ref={servicesCarouselRef} className="mt-2 lg:mt-6 -mx-6 px-6 lg:mx-0 lg:px-0 flex overflow-x-auto snap-x snap-mandatory gap-5 lg:grid lg:grid-cols-3 lg:gap-6 scrollbar-hide pb-6 lg:pb-0">
            {[
              {
                id: 'reception',
                icon: PhoneCall,
                title: 'Réception d\'appels IA 24/7',
                desc: 'Vous ne répondez pas ? L\'appel est transféré à l\'IA. Elle décroche en 2 secondes, qualifie le prospect, prend RDV, et vous envoie le lead par SMS.',
                details: ['Transfert auto', 'Qualification lead', 'Prise de RDV', 'Récap SMS instantané'],
                iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
                chipBg: 'bg-amber-50', chipText: 'text-amber-700', accentBorder: 'border-amber-100',
                cardBorder: 'border-gray-100/80',
                ctaBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
                badge: 'Appels entrants',
                badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
                action: () => openPopup('cta', 'gratuit'),
              },
              {
                id: 'renouvellement',
                icon: RefreshCw,
                title: 'Renouvellement de dossiers',
                desc: 'L\'IA relance automatiquement vos clients dont les dossiers arrivent à échéance. Zéro oubli, zéro effort.',
                details: ['Contrôles techniques', 'Assurances', 'Entretiens annuels', 'Bilans médicaux'],
                iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400',
                chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', accentBorder: 'border-emerald-100',
                cardBorder: 'border-gray-100/80',
                ctaBg: 'bg-gradient-to-br from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500',
                badge: 'Appels sortants',
                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                action: () => openPopup('cta', 'gratuit'),
              },
              {
                id: 'rdv',
                icon: CalendarCheck,
                title: 'Confirmation de RDV',
                desc: 'L\'IA appelle la veille pour confirmer chaque rendez-vous et supprimer les lapins. Planning fiable, CA protégé.',
                details: ['Appel J-1 automatique', 'SMS de rappel', 'Gestion des reports', 'Planning mis à jour'],
                iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
                chipBg: 'bg-blue-50', chipText: 'text-blue-700', accentBorder: 'border-blue-100',
                cardBorder: 'border-gray-100/80',
                ctaBg: 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
                badge: 'Appels sortants',
                badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
                action: () => openPopup('cta', 'gratuit'),
              },
              {
                id: 'impact-avis',
                icon: Star,
                title: 'Impact Avis',
                desc: 'L\'IA appelle vos clients, qualifie leur ressenti et leur envoie le lien direct vers Google Avis. Filtrage intelligent : 4★+ → Google, < 4★ → interne.',
                details: ['Appel post-prestation', 'Filtrage 4★+ → Google', 'Avis < 4★ → interne', 'Lien direct par SMS'],
                iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-400',
                chipBg: 'bg-yellow-50', chipText: 'text-yellow-700', accentBorder: 'border-yellow-100',
                cardBorder: 'border-gray-100/80',
                ctaBg: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
                badge: 'Réputation',
                badgeColor: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                action: () => openPopup('card-impact-avis', 'gratuit'),
              },
              {
                id: 'paiements',
                icon: Zap,
                title: 'Accélération de paiements',
                desc: 'L\'IA appelle vos clients dont la facture est due, au bon moment, avec le bon ton. Vos délais de paiement raccourcissent, sans relance manuelle.',
                details: ['Relance automatique', 'Ton humain & pro', 'Suivi multi-tentatives', 'Délais -40%'],
                iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
                chipBg: 'bg-rose-50', chipText: 'text-rose-700', accentBorder: 'border-rose-100',
                cardBorder: 'border-gray-100/80',
                ctaBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
                badge: 'Recouvrement',
                badgeColor: 'bg-rose-50 text-rose-700 border-rose-100',
                action: () => openPopup('card-paiements', 'gratuit'),
              },
              {
                id: 'robot',
                icon: Bot,
                title: 'Robot IA sur mesure',
                desc: 'Un besoin spécifique ? On crée votre robot sur mesure : script personnalisé, voix naturelle, scénarios complexes, intégration CRM.',
                details: ['Script personnalisé', 'Voix naturelle', 'Scénarios complexes', 'Intégration CRM'],
                iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
                chipBg: 'bg-violet-50', chipText: 'text-violet-700', accentBorder: 'border-violet-100',
                cardBorder: 'border-gray-100/80',
                ctaBg: 'bg-violet-600 hover:bg-violet-700',
                badge: 'Sur mesure',
                badgeColor: 'bg-violet-50 text-violet-700 border-violet-100',
                action: () => openPopup('cta', 'gratuit'),
              },
            ].map((service, i) => (
              <ScrollReveal key={service.id} delay={i * 0.08}>
                <motion.div
                  id={service.id}
                  data-svc-idx={i}
                  whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                  className={`relative h-full bg-white rounded-[28px] border ${service.cardBorder} p-7 sm:p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-gray-900/[0.06] transition-all duration-500 scroll-mt-24 snap-center min-w-[85%] sm:min-w-[60%] lg:min-w-0 mobile-service-card`}
                >
                  <div className="flex items-start justify-between mb-6 sm:mb-8">
                    {/* Icône uniforme vert Apple : un seul langage visuel sur toute la page */}
                    <div className="relative w-14 h-14 rounded-[16px] flex items-center justify-center"
                         style={{ backgroundColor: '#ECFDF5', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.18), 0 2px 4px rgba(0,0,0,0.04)' }}>
                      <service.icon className="w-7 h-7 text-emerald-600" strokeWidth={2} fill={service.id === 'impact-avis' ? 'currentColor' : 'none'} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">{service.badge}</span>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">{service.title}</h3>
                  <p className="text-[14.5px] sm:text-[15px] text-gray-500 leading-relaxed mb-8">{service.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-8 sm:mb-10 mt-auto">
                    {service.details.map((d, j) => (
                      <span key={j} className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-emerald-200/60">{d}</span>
                    ))}
                  </div>
                  {/* CTA uniforme vert — cohérence Apple : un seul style de bouton sur la page */}
                  <button
                    type="button"
                    onClick={service.action}
                    className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.02]"
                    style={{ boxShadow: '0 8px 24px -8px rgba(16, 185, 129, 0.4)' }}
                  >
                    Commencer gratuitement <ArrowRight className="w-4 h-4" />
                  </button>
                  {/* Lien discret vers la page dédiée du service */}
                  <Link
                    to={`/services/${service.id}`}
                    className="mt-3 inline-flex items-center justify-center gap-1 text-[12.5px] font-medium text-gray-500 hover:text-emerald-700 transition-colors group/more"
                  >
                    En savoir plus
                    <ArrowRight className="w-3 h-3 transition-transform group-hover/more:translate-x-0.5" strokeWidth={2.2} />
                  </Link>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
          {/* Dots de pagination — feedback de position dans le carousel */}
          <div className="lg:hidden flex justify-center mt-2">
            <div className="flex gap-1.5">
              {[0,1,2,3,4,5].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-400 ${
                    i === activeMobileSvcIdx ? 'w-6 bg-emerald-500' : 'w-1.5 bg-emerald-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Détail du service en dessous SUPPRIMÉ — chaque service a sa page dédiée /services/[id]
              accessible via le lien "En savoir plus →" sous chaque card. */}
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICE SHOWCASES — DÉSACTIVÉ                  */}
      {/* Les fiches détaillées sont migrées sur les     */}
      {/* pages /services/[id] (mini-landings dédiées).  */}
      {/* La landing principale reste épurée Apple-clean.*/}
      {/* ============================================ */}
      {/* <ServiceShowcases openPopup={openPopup} showcases={showcasesData} /> */}

      {/* ============================================ */}
      {/* RAPPEL CONTEXTUEL PROSPECTS                  */}
      {/* Évite que le visiteur croie BoosterPay = IA seulement */}
      {/* Style Apple : strip discret, élégant, light bg */}
      {/* ============================================ */}
      <section className="relative py-10 lg:py-14 bg-white overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6">
          <ScrollReveal y={16}>
            <a href="#leads-rgpd" className="group block">
              <div className="relative rounded-[20px] overflow-hidden transition-all duration-300 group-hover:translate-y-[-2px]"
                   style={{
                     background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                     border: '1px solid rgba(16, 185, 129, 0.18)',
                     boxShadow: '0 8px 24px -12px rgba(16, 185, 129, 0.15)',
                   }}>
                <div className="relative px-5 py-4 lg:px-7 lg:py-5 flex items-center gap-4">
                  <div className="shrink-0 inline-flex w-10 h-10 rounded-xl bg-white border border-emerald-100 items-center justify-center"
                       style={{ boxShadow: '0 4px 12px -4px rgba(16, 185, 129, 0.22)' }}>
                    <Target className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-emerald-700 mb-0.5">
                      Et aussi · Service indépendant
                    </p>
                    <p className="text-[14px] lg:text-[15px] font-bold text-gray-900 tracking-[-0.01em]">
                      Vous voulez aussi de nouveaux contacts ?
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 transition-all group-hover:gap-2">
                    <span className="hidden sm:inline">Voir l'offre Prospects</span>
                    <span className="sm:hidden">Prospects</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* MÉTIER SELECTOR — Votre métier. Votre IA.    */}
      {/* ============================================ */}
      <section id="metier" className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-white scroll-mt-24 overflow-hidden">
        {/* Ambient emerald subtle */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
               style={{ background: 'radial-gradient(ellipse, #10B981, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Votre métier. Votre IA."
            title="Découvrez comment l'IA s'adapte à votre quotidien."
            subtitle="👇 Cliquez sur votre métier — on vous dit exactement ce que l'IA va faire pour vous et combien ça vous rapporte."
          />
          <MetierSelector openPopup={openPopup} />
        </div>
      </section>

      {/* HOW IT WORKS — Animation Apple-style                       */}
      {/* Placé après les deep dives : "voilà comme c'est simple à démarrer" */}
      {/* Padding resserré : transition fluide MetierSelector → HowItWorks → Testimonials */}
      {/* ============================================ */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-24 bg-white overflow-hidden">
        {/* Ambient gradient teal subtle */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.04] blur-3xl"
               style={{ background: 'radial-gradient(ellipse, #10B981, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="IA Vocale · Comment ça marche"
            title="Trois étapes. Zéro friction."
            subtitle="Vous activez. L'IA travaille. Vous récoltez."
          />

          <HowItWorksTimeline steps={steps} />
        </div>
      </section>

      {/* TESTIMONIALS — preuve sociale juste avant la conversion    */}
      {/* Padding-bottom réduit pour resserrer la transition vers Pricing */}
      {/* ============================================ */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-gradient-to-b from-white via-gray-50/60 to-white overflow-hidden">
        {/* Ambient gradients premium */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-32 left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
               style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }} />
          <div className="absolute bottom-32 right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
               style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Témoignages"
            title="+250 professionnels font confiance à BoosterPay."
            subtitle="Garagistes, cabinets médicaux, courtiers, salons, plombiers, avocats — ils ont automatisé leurs appels avec l'IA."
          />

          {/* Trust strip — secteurs représentés */}
          <ScrollReveal>
            <div className="mb-14 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-gray-400 tracking-tight">
              {['Garagistes','Cabinets médicaux','Courtiers','Salons','Plombiers','Avocats','Restaurants','Experts-comptables'].map((s, i, arr) => (
                <span key={i} className="inline-flex items-center gap-x-6">
                  <span>{s}</span>
                  {i < arr.length - 1 && <span className="text-gray-200">·</span>}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <TestimonialsCarousel testimonials={testimonials} svcColors={svcColors} />

        </div>
      </section>

      {/* PRICING IA — vient juste après la preuve sociale (témoignages)         */}
      {/* Padding-top réduit : transition fluide depuis les témoignages          */}
      {/* ============================================ */}
      <section id="pricing" className="relative pt-16 pb-20 md:pt-20 md:pb-24 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden scroll-mt-24">
        {/* Ambient gradient cyan/blue */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-32 right-[15%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
               style={{ background: 'radial-gradient(circle, #06B6D4, transparent 70%)' }} />
          <div className="absolute bottom-32 left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl"
               style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Tarif"
            title="Un seul plan. Tout inclus."
            subtitle="L'IA Vocale BoosterPay au complet. Tous les modules, appels illimités, 7 jours pour tester."
          />

          {/* Plan unique 99€ HT/mois — card ultra premium border verte + ombre verte forte */}
          <div className="max-w-md mx-auto">
            {pricing.map((plan, i) => (
              <ScrollReveal key={plan.id} delay={i * 0.08}>
                <div
                  className="relative rounded-3xl bg-white p-8 lg:p-10 flex flex-col"
                  style={{
                    border: '2px solid #10B981',
                    boxShadow: '0 20px 60px -10px rgba(16, 185, 129, 0.25), 0 8px 24px -8px rgba(16, 185, 129, 0.12)',
                  }}
                >
                  {/* Badge "Le plus populaire" — top center, vert plein */}
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wider uppercase text-white bg-emerald-500 px-3.5 py-1 rounded-full shadow-md">
                    <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                    Le plus populaire
                  </span>

                  {/* Header */}
                  <div className="mb-2 text-center mt-2">
                    <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight">{plan.name}</h3>
                    <p className="text-[13px] text-gray-500 mt-1.5">{plan.tagline}</p>
                  </div>

                  {/* Prix XXL */}
                  <div className="my-7 text-center">
                    {plan.roiHint && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11.5px] font-semibold tracking-tight mb-4">
                        <Check className="w-3 h-3" strokeWidth={2.6} />
                        {plan.roiHint}
                      </div>
                    )}
                    {plan.priceAnchor && (
                      <div className="inline-flex items-center justify-center gap-2.5 mb-2">
                        <span
                          className="text-[20px] font-semibold text-gray-400"
                          style={{
                            textDecoration: 'line-through',
                            textDecorationColor: '#EF4444',
                            textDecorationThickness: '2px',
                          }}
                        >
                          {plan.priceAnchor}€
                        </span>
                        <span className="inline-flex items-center text-[12px] font-bold tracking-tight px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                          −{Math.round((1 - plan.priceMensuel / plan.priceAnchor) * 100)}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-[80px] font-extrabold tracking-[-0.045em] text-gray-900 leading-none">{plan.priceMensuel}€</span>
                      <span className="text-[18px] text-gray-500 font-medium">{plan.unit}</span>
                    </div>
                    <p className="text-[14px] text-emerald-700 font-semibold mt-3">{plan.calls}</p>
                    {plan.socialProof && (
                      <p className="text-[12.5px] text-gray-500 mt-1.5 font-medium">{plan.socialProof}</p>
                    )}
                  </div>

                  {/* Calcul ROI visible — argument décisif */}
                  <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200/70 p-4 text-center">
                    <div className="text-[12.5px] font-semibold text-emerald-800 leading-relaxed">
                      Nos clients récupèrent en moyenne <span className="font-bold">10h/semaine</span><br/>
                      + <span className="font-bold">4 nouveaux clients/mois</span>.<br/>
                      <span className="text-emerald-700">ROI moyen : <span className="font-bold text-[14px]">×8</span>.</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[13.5px] text-gray-700">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={2.4} />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 3 blocs reassurance avec icônes — fond emerald-50, lever objections */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { icon: Check, label: '7 jours\noffrets' },
                      { icon: Shield, label: 'Aucun débit\navant J+8' },
                      { icon: Sparkles, label: 'Annulation\nen 1 clic' },
                    ].map((r, idx) => {
                      const RIcon = r.icon || Check;
                      return (
                        <div key={idx} className="rounded-2xl bg-emerald-50 border border-emerald-100/60 p-2.5 text-center">
                          <RIcon className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" strokeWidth={2.4} />
                          <div className="text-[10.5px] font-semibold text-emerald-800 leading-tight whitespace-pre-line">
                            {r.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA — vert plein avec ombre verte signature → ouvre le modal */}
                  <button
                    type="button"
                    onClick={() => openPopup('pricing-' + plan.id, plan.id)}
                    className="w-full text-center inline-flex items-center justify-center gap-1.5 py-3.5 rounded-full font-semibold text-[14px] transition-all duration-200 text-white bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02]"
                    style={{ boxShadow: '0 12px 32px -8px rgba(16, 185, 129, 0.5)' }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="mt-10 text-center text-[12.5px] text-gray-400">
            Tarif HT. Annulation libre dans votre espace. Pas de frais cachés.
          </p>

          {/* Pont upsell vers Prospects — service indépendant mais complémentaire */}
          <ScrollReveal y={16}>
            <a href="#leads-rgpd" className="group block mt-10 lg:mt-12 max-w-3xl mx-auto">
              <div className="relative rounded-[20px] overflow-hidden transition-all duration-300 group-hover:translate-y-[-2px]"
                   style={{
                     background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                     border: '1px solid rgba(16, 185, 129, 0.18)',
                     boxShadow: '0 8px 24px -12px rgba(16, 185, 129, 0.15)',
                   }}>
                <div className="relative px-5 py-4 lg:px-7 lg:py-5 flex items-center gap-4">
                  <div className="shrink-0 inline-flex w-10 h-10 rounded-xl bg-white border border-emerald-100 items-center justify-center"
                       style={{ boxShadow: '0 4px 12px -4px rgba(16, 185, 129, 0.22)' }}>
                    <Target className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-emerald-700 mb-0.5">
                      Boostez encore · Service indépendant
                    </p>
                    <p className="text-[14px] lg:text-[15px] font-bold text-gray-900 tracking-[-0.01em]">
                      Achetez aussi des prospects qualifiés <span className="text-emerald-700">à partir de 15&nbsp;€</span>
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 transition-all group-hover:gap-2">
                    <span className="hidden sm:inline">Voir l'offre Prospects</span>
                    <span className="sm:hidden">Voir</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* ACHAT DE LEADS RGPD — service indépendant     */}
      {/* Placé APRÈS le pricing IA : signal visuel que c'est un service séparé */}
      {/* ============================================ */}
      <LeadsRGPDSection />

      {/* FAQ                                          */}
      {/* ============================================ */}
      <section id="faq" className="relative pt-16 pb-16 md:pt-20 md:pb-20 bg-gradient-to-b from-white via-gray-50/40 to-white overflow-hidden scroll-mt-24">
        {/* Ambient subtle */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.03] blur-3xl"
               style={{ background: 'radial-gradient(ellipse, #6366F1, transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6">
          <SectionHeading
            tag="FAQ"
            title="Questions fréquentes."
          />

          <div className="space-y-3">
            {(showAllFaqs ? faqs : faqs.slice(0, 8)).map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-base font-semibold text-gray-900 pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Bouton voir toutes les questions (si plus de 8) */}
          {!showAllFaqs && faqs.length > 8 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowAllFaqs(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Voir les {faqs.length - 8} autres questions
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA                                    */}
      {/* Padding top resserré : transition fluide FAQ → Close */}
      {/* ============================================ */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="relative rounded-[40px] p-12 md:p-20 overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 60%, #F0FDF4 100%)',
                   boxShadow: '0 30px 60px -15px rgba(16, 185, 129, 0.18), 0 0 0 1px rgba(16, 185, 129, 0.12)',
                 }}>
              {/* Background decoration premium clair */}
              <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11.5px] font-bold tracking-[0.12em] uppercase text-emerald-800 bg-white border border-emerald-200/70 mb-6 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  7 jours offerts
                </span>
                <h2 className="text-[40px] sm:text-[52px] md:text-[64px] font-extrabold text-gray-900 leading-[1.02] tracking-[-0.03em] mb-5">
                  Quand vous êtes occupé,<br/>
                  <span className="text-emerald-600">l'IA décroche à votre place.</span>
                </h2>
                <p className="text-[17px] md:text-[19px] text-gray-600 max-w-xl mx-auto mb-10 leading-[1.55] font-normal">
                  Pour ne plus jamais laisser filer un seul lead. 7 jours offerts pour tester.
                </p>

                {/* CTA inline : email + bouton */}
                <FinalCtaInline openPopup={openPopup} />

                {/* Micro-texte 3 objections levées — sous le formulaire, en ligne */}
                <p className="mt-4 text-[13px] text-gray-500 leading-relaxed">
                  Aucune carte de crédit requise · Opérationnel en 5 minutes · Annulation en 1 clic
                </p>

                {/* 3 preuves sociales temps réel — urgence + confiance */}
                <div className="mt-10 max-w-2xl mx-auto">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Thomas', role: 'Plombier · Lyon', time: 'il y a 4 min' },
                      { name: 'Sophie', role: 'Salon · Nantes', time: 'il y a 12 min' },
                      { name: 'Marc', role: 'Garagiste · Brest', time: 'il y a 18 min' },
                    ].map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-emerald-100/40">
                        {/* Avatar uniforme vert — cohérence Apple */}
                        <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white text-[11.5px] font-bold flex items-center justify-center">
                          {p.name[0]}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 truncate"><span className="font-bold">{p.name}</span> ({p.role})</p>
                          <p className="text-[10.5px] text-gray-500">a démarré {p.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Séparation + CTA Prospects — fond blanc + ombre violette */}
                <div className="mt-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-emerald-200/60" />
                    <span className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-gray-400">
                      Ou
                    </span>
                    <div className="flex-1 h-px bg-emerald-200/60" />
                  </div>
                  <a href="#leads-rgpd"
                     className="group inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-full bg-white border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-all hover:scale-[1.01]">
                    <Target className="w-4 h-4 text-emerald-600" strokeWidth={2.4} />
                    <span className="text-[14.5px] font-semibold">
                      Réserver votre zone Prospects
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </a>
                  <p className="text-[11.5px] text-gray-500 mt-2.5 text-center">
                    À partir de 15 € le prospect · Sans abonnement
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER                                       */}
      {/* ============================================ */}
      <footer className="py-16 border-t border-gray-200" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-xl font-bold mb-4 text-emerald-600 tracking-tight">
                BoosterPay
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                L'IA vocale qui décroche, relance, qualifie et convertit — automatiquement.
              </p>
              {/* Badge Made in France */}
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700">
                <span>Made in France</span>
                <span>🇫🇷</span>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Produit</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Fonctionnalités</a></li>
                <li><a href="#usecases" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Cas d'usage</a></li>
                <li><a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Légal</h5>
              <ul className="space-y-2">
                <li><Link to="/mentions-legales" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Mentions légales</Link></li>
                <li><Link to="/cgv" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">CGV</Link></li>
                <li><Link to="/politique-confidentialite" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Contact</h5>
              <ul className="space-y-2">
                <li><a href="mailto:contact@booster-pay.com" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">contact@booster-pay.com</a></li>
                <li><span className="text-sm text-gray-600">Bretagne, France</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} BoosterPay. Tous droits réservés.</p>
            <p className="text-xs text-gray-500">Fait avec passion en Bretagne 🇫🇷</p>
          </div>
        </div>
      </footer>

      {/* ── Popup capture email + bouton flottant Contact (phone + chat) ── */}
      {/* Toujours en mode "gratuit" : tout le monde commence par l'essai 100 appels.
          L'upgrade éventuel se fait depuis /configurer/:token. */}
      <MobileStickyCTA openPopup={openPopup} />
      <ExitIntentPopup />
      <EmailCapturePopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        source={popupSource + (popupPlanIntent !== 'gratuit' ? ':' + popupPlanIntent : '')}
        plan="gratuit"
      />
      {/* ─── Modal d'inscription Apple premium — déclenché par tous les CTAs ─── */}
      <SignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        source={signupModalSource}
        planIntent={signupModalPlanIntent}
      />
      <FloatingContact />
    </div>
  );
}
