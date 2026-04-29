import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { captureLeadFromSite } from '../services/leadService';
import Papa from 'papaparse';
import EmailCapturePopup from '../components/EmailCapturePopup';
import FloatingContact from '../components/FloatingContact';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const isMobileFR = (phone) => {
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  return /^(06|07|\+336|\+337|00336|00337)/.test(cleaned);
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
  <div className="text-center max-w-3xl mx-auto mb-16">
    {tag && (
      <ScrollReveal y={20}>
        <span className="inline-block text-sm font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full mb-4">
          {tag}
        </span>
      </ScrollReveal>
    )}
    <ScrollReveal y={30} delay={0.05}>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        {title}
      </h2>
    </ScrollReveal>
    {subtitle && (
      <ScrollReveal y={30} delay={0.06}>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed mt-5 mx-auto">
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
  { id: 'decouverte', name: 'Essai Découverte', price: '0€', desc: '100 appels gratuits · Import CSV · Dashboard' },
  { id: 'boost', name: 'Pack Boost', price: '199€ HT', desc: '250 appels · Résultats immédiats', badge: null },
  { id: 'business', name: 'Pack Business', price: '349€ HT', desc: '500 appels · Manager dédié', badge: 'Le plus populaire' },
  { id: 'croissance', name: 'Croissance', price: '399€ HT/mois', desc: '1000 appels/mois · Support prioritaire' },
];
// URL de checkout Stripe — pour l'instant 1 seule URL pour les 3 plans payants
// (Stripe capture l'email + les infos du client sur sa page de paiement)
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/bJedRbfwG88D6qQ9NMf3a05';
const STRIPE_LINKS = {
  decouverte: STRIPE_CHECKOUT_URL,
  boost: STRIPE_CHECKOUT_URL,
  business: STRIPE_CHECKOUT_URL,
  croissance: STRIPE_CHECKOUT_URL,
  // Nouveaux plans (alignés sur la grille tarifaire)
  'a-la-carte': STRIPE_CHECKOUT_URL,
  pro: STRIPE_CHECKOUT_URL,
};

const navLinks = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Cas d\'usage', href: '#usecases' },
  { label: 'Tarifs', href: '#pricing' },
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
const colorMap = {
  emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: 'text-emerald-600', accent: 'bg-emerald-500', light: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  blue: { bg: 'bg-blue-50', ring: 'ring-blue-200', icon: 'text-blue-600', accent: 'bg-blue-500', light: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  amber: { bg: 'bg-amber-50', ring: 'ring-amber-200', icon: 'text-amber-600', accent: 'bg-amber-500', light: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  violet: { bg: 'bg-violet-50', ring: 'ring-violet-200', icon: 'text-violet-600', accent: 'bg-violet-500', light: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
  orange: { bg: 'bg-orange-50', ring: 'ring-orange-200', icon: 'text-orange-600', accent: 'bg-orange-500', light: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  rose: { bg: 'bg-rose-50', ring: 'ring-rose-200', icon: 'text-rose-600', accent: 'bg-rose-500', light: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
  yellow: { bg: 'bg-yellow-50', ring: 'ring-yellow-200', icon: 'text-yellow-600', accent: 'bg-yellow-500', light: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
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

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i <= active ? `${colorMap[services[i].color].accent} w-5` : 'bg-gray-200 w-1.5'
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
  { name: 'Garagiste', icon: Wrench, s1: 'Relance CT, vidanges, entretiens', s2: 'Confirmation RDV atelier J-1', s3: 'Réception appels pannes 24/7', s4: 'Robot accueil personnalisé', temps: '12h', clients: '+18', ca: '+8 500€', lapins: '-40%', s5: 'Avis Google après chaque réparation', s6: 'Relance factures clients' },
  { name: 'Courtier assurance', icon: Shield, s1: 'Renouvellement contrats auto/habitation', s2: 'Confirmation RDV signature', s3: 'Réception appels sinistres 24/7', s4: 'Robot qualification souscription', temps: '15h', clients: '+25', ca: '+12 000€', lapins: '-35%', s5: 'Avis post-souscription', s6: 'Relance primes en retard' },
  { name: 'Dentiste', icon: Heart, s1: 'Rappel détartrages & bilans', s2: 'Confirmation RDV patients J-1', s3: 'Réception appels urgences dentaires', s4: 'Robot triage patients', temps: '10h', clients: '+15', ca: '+6 500€', lapins: '-45%', s5: 'Avis post-soins', s6: 'Relance honoraires non réglés' },
  { name: 'Opticien', icon: Eye, s1: 'Renouvellement lunettes/lentilles', s2: 'Confirmation RDV essayage', s3: 'Réception appels conseils optiques', s4: 'Robot prise de RDV auto', temps: '8h', clients: '+12', ca: '+7 000€', lapins: '-30%', s5: 'Avis après essayage lunettes', s6: 'Relance factures différées' },
  { name: 'Salon coiffure', icon: Scissors, s1: 'Réactivation clients dormants 3 mois', s2: 'Confirmation RDV coiffure J-1', s3: 'Réception appels réservation', s4: 'Robot conseils personnalisés', temps: '10h', clients: '+20', ca: '+4 500€', lapins: '-50%', s5: 'Avis Google après prestation', s6: 'Relance forfaits impayés' },
  { name: 'Kiné / Ostéopathe', icon: Activity, s1: 'Suivi parcours de soins', s2: 'Confirmation séances', s3: 'Réception appels nouveaux patients', s4: 'Robot orientation patients', temps: '8h', clients: '+10', ca: '+3 800€', lapins: '-35%', s5: 'Avis post-séance', s6: 'Relance honoraires patients' },
  { name: 'Médecin généraliste', icon: Heart, s1: 'Rappel check-up & vaccins', s2: 'Confirmation consultations J-1', s3: 'Réception appels patients 24/7', s4: 'Robot triage & orientation', temps: '14h', clients: '+12', ca: '+5 000€', lapins: '-40%', s5: 'Avis Google patients satisfaits', s6: 'Relance dépassements honoraires' },
  { name: 'Vétérinaire', icon: Heart, s1: 'Rappel vaccins & vermifuges', s2: 'Confirmation RDV consultations', s3: 'Réception appels urgences animales', s4: 'Robot conseil vétérinaire', temps: '10h', clients: '+14', ca: '+5 500€', lapins: '-35%', s5: 'Avis post-consultation', s6: 'Relance factures soins' },
  { name: 'Agent immobilier', icon: Users, s1: 'Relance mandats à échéance', s2: 'Confirmation visites acquéreurs', s3: 'Réception appels acquéreurs 24/7', s4: 'Robot qualification achat/location', temps: '14h', clients: '+30', ca: '+15 000€', lapins: '-25%', s5: 'Avis vendeurs/acquéreurs', s6: 'Relance honoraires d\'agence'},
  { name: 'Plombier', icon: Wrench, s1: 'Relance entretiens chaudière', s2: 'Confirmation interventions', s3: 'Réception appels urgences 24/7', s4: 'Robot devis automatique', temps: '12h', clients: '+22', ca: '+9 000€', lapins: '-30%', s5: 'Avis Google post-intervention', s6: 'Relance devis & factures' },
  { name: 'Coach sportif', icon: Activity, s1: 'Relance abonnements expirés', s2: 'Confirmation séances', s3: 'Réception appels inscription', s4: 'Robot programme personnalisé', temps: '6h', clients: '+15', ca: '+3 000€', lapins: '-40%', s5: 'Avis clients fidèles', s6: 'Relance abonnements impayés' },
  { name: 'Restaurant', icon: Gift, s1: 'Relance clients fidèles', s2: 'Confirmation réservations J-1', s3: 'Réception appels réservation 24/7', s4: 'Robot commande & réservation', temps: '8h', clients: '+25', ca: '+5 000€', lapins: '-55%', s5: 'Avis Google clients satisfaits', s6: 'Relance acomptes événements' },
  { name: 'Salon esthétique', icon: Sparkles, s1: 'Réactivation clientes dormantes', s2: 'Confirmation RDV soins', s3: 'Réception appels prise de RDV', s4: 'Robot conseil beauté', temps: '10h', clients: '+18', ca: '+4 800€', lapins: '-45%', s5: 'Avis post-soin', s6: 'Relance forfaits non réglés' },
  { name: 'Avocat', icon: Shield, s1: 'Relance dossiers en attente', s2: 'Confirmation RDV consultations', s3: 'Réception appels nouveaux clients', s4: 'Robot prise de brief juridique', temps: '12h', clients: '+10', ca: '+10 000€', lapins: '-30%', s5: 'Avis dossiers clos', s6: 'Relance honoraires en attente' },
  { name: 'Expert-comptable', icon: FileText, s1: 'Relance bilans & déclarations', s2: 'Confirmation RDV clients', s3: 'Réception appels questions fiscales', s4: 'Robot collecte pièces', temps: '15h', clients: '+12', ca: '+8 000€', lapins: '-25%', s5: 'Avis clients après bilan', s6: 'Relance honoraires & frais' },
  { name: 'Auto-école', icon: Calendar, s1: 'Relance élèves inactifs', s2: 'Confirmation heures conduite', s3: 'Réception appels inscription', s4: 'Robot planning auto', temps: '10h', clients: '+20', ca: '+6 000€', lapins: '-40%', s5: 'Avis élèves diplômés', s6: 'Relance forfaits non payés' },
  { name: 'Électricien', icon: Zap, s1: 'Relance contrôles électriques', s2: 'Confirmation interventions', s3: 'Réception appels dépannage', s4: 'Robot devis électrique', temps: '10h', clients: '+18', ca: '+7 500€', lapins: '-30%', s5: 'Avis Google post-intervention', s6: 'Relance devis & factures' },
  { name: 'Pharmacie', icon: Heart, s1: 'Rappel renouvellement ordonnances', s2: 'Confirmation préparations', s3: 'Réception appels conseils', s4: 'Robot suivi traitements', temps: '8h', clients: '+10', ca: '+4 500€', lapins: '-20%', s5: 'Avis clients fidèles', s6: 'Relance avances tiers payant' },
  { name: 'Photographe', icon: Eye, s1: 'Relance séances anniversaires', s2: 'Confirmation shoots', s3: 'Réception appels devis', s4: 'Robot portfolio & tarifs', temps: '6h', clients: '+12', ca: '+3 500€', lapins: '-35%', s5: 'Avis clients après livraison', s6: 'Relance acomptes shootings' },
  { name: 'Serrurier', icon: Wrench, s1: 'Relance contrats maintenance', s2: 'Confirmation interventions', s3: 'Réception appels urgences 24/7', s4: 'Robot devis serrurerie', temps: '10h', clients: '+20', ca: '+8 000€', lapins: '-25%', s5: 'Avis Google post-dépannage', s6: 'Relance interventions urgences' },
  { name: 'Notaire', icon: FileText, s1: 'Relance signatures & dossiers', s2: 'Confirmation RDV actes', s3: 'Réception appels nouveaux dossiers', s4: 'Robot accueil étude', temps: '12h', clients: '+8', ca: '+10 000€', lapins: '-30%', s5: 'Avis clients post-acte', s6: 'Relance émoluments en attente' },
  { name: 'Paysagiste', icon: Wrench, s1: 'Relance entretiens saisonniers', s2: 'Confirmation interventions', s3: 'Réception appels devis', s4: 'Robot conseil jardin', temps: '8h', clients: '+15', ca: '+5 500€', lapins: '-30%', s5: 'Avis post-aménagement', s6: 'Relance contrats annuels' },
  { name: 'Consultant', icon: Users, s1: 'Relance propositions commerciales', s2: 'Confirmation RDV clients', s3: 'Réception appels prospects', s4: 'Robot qualification projet', temps: '10h', clients: '+8', ca: '+12 000€', lapins: '-20%', s5: 'Avis missions terminées', s6: 'Relance honoraires à échéance' },
  { name: 'Centre formation', icon: Users, s1: 'Relance inscriptions', s2: 'Confirmation sessions', s3: 'Réception appels renseignements', s4: 'Robot orientation formation', temps: '10h', clients: '+20', ca: '+8 000€', lapins: '-35%', s5: 'Avis stagiaires diplômés', s6: 'Relance financements OPCO' },
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

  const filtered = search
    ? metiers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : metiers;

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
                      <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}>
                        <SvcIcon className={`w-5 h-5 ${sc.icon}`} />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${sc.badge} px-2 py-0.5 rounded-full`}>{svc.label}</span>
                      </div>
                    </div>
                    <p className="text-[14px] text-gray-700 font-medium leading-relaxed">{m[svc.key]}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* KPI bar — Apple-style gradient */}
            <div className="grid grid-cols-2 sm:grid-cols-4 rounded-b-[28px] overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600">
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
                  className="text-center py-7 px-4 border-r border-white/20 last:border-r-0 relative"
                >
                  <div className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors duration-300" />
                  <kpi.icon className="w-5 h-5 text-white/80 mx-auto mb-2 relative z-10" />
                  <p className="text-[28px] font-black text-white relative z-10 tracking-tight">{kpi.value}</p>
                  <p className="text-[11px] text-white/70 font-medium mt-1 relative z-10">{kpi.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA simple : un seul bouton centré, pas de card "6 modules" */}
            <div className="mt-10 flex justify-center">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); openPopup('metier-cta', 'gratuit'); }}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold px-7 py-3 rounded-full text-sm hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
              >
                Démarrer mes 100 appels offerts <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



/*  MAIN COMPONENT                                                     *//* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function IAVocaleLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Popup capture email — TOUS les CTAs (gratuit ET plans payants) y passent.
  // L'essai gratuit 100 appels / 14 jours est offert à tous.
  // Depuis la page /configurer/:token, l'user peut ensuite upgrader vers
  // un plan payant (redirection Stripe) ou annuler son plan.
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSource, setPopupSource] = useState('hero');
  const [popupPlanIntent, setPopupPlanIntent] = useState('gratuit'); // plan d'intérêt (analytics)
  const openPopup = (source = 'unknown', planIntent = 'gratuit') => {
    setPopupSource(source);
    setPopupPlanIntent(planIntent);
    setPopupOpen(true);
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

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'IA Vocale — Confirmations de RDV et relances automatiques | BoosterPay';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', "L'IA appelle vos clients pour confirmer les RDV et relancer les dossiers à renouveler. Divisez vos lapins par 5. 100 appels offerts pour tester.");
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "L'IA appelle vos clients pour confirmer les RDV et relancer les dossiers à renouveler. Divisez vos lapins par 5. 100 appels offerts pour tester.";
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
    { icon: FileSpreadsheet, title: 'Importez vos contacts', desc: 'CSV, Excel ou saisie manuelle. En 2 minutes, vos contacts sont prêts pour les appels sortants.' },
    { icon: Phone, title: "L'IA appelle pour vous", desc: 'Renouvellements, confirmations de RDV — l\'IA passe les appels avec une voix naturelle et professionnelle.' },
    { icon: PhoneCall, title: "L'IA décroche pour vous", desc: 'Appels entrants 24/7 — l\'IA répond, qualifie le prospect et prend RDV dans votre agenda.' },
    { icon: TrendingUp, title: 'Vous récoltez les résultats', desc: 'Agenda rempli, dossiers renouvelés, leads qualifiés — vous ne perdez plus un seul client.' },
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
    },
    {
      name: 'Camille Durand',
      role: 'Ostéopathe',
      city: 'Nantes',
      quote: 'Zéro lapin depuis que les confirmations IA sont en place. Mon planning est enfin fiable, et j\'ai gagné 1h/jour.',
      result: 'No-show -42%',
      avatar: 'C',
      color: 'blue',
    },
    {
      name: 'Marc Lefranc',
      role: 'Courtier en assurance',
      city: 'Brest',
      quote: '80% de contrats renouvelés sans passer un seul appel. Je me consacre à la prospection, l\'IA fait le reste.',
      result: '+8 700€ de CA / mois',
      avatar: 'M',
      color: 'violet',
    },
    {
      name: 'Sophie Bernard',
      role: 'Salon de coiffure',
      city: 'Vannes',
      quote: 'Impact Avis a fait passer ma fiche Google de 4,1 à 4,7 étoiles en 2 mois. Je reçois 2× plus d\'appels qu\'avant.',
      result: '+38 avis Google',
      avatar: 'S',
      color: 'yellow',
    },
    {
      name: 'Pierre Martin',
      role: 'Cabinet d\'expertise comptable',
      city: 'Quimper',
      quote: 'Mes délais de paiement sont passés de 31 à 19 jours. La trésorerie n\'a jamais été aussi saine.',
      result: 'Délais -39%',
      avatar: 'P',
      color: 'rose',
    },
    {
      name: 'Julie Lemaire',
      role: 'Cabinet dentaire',
      city: 'Saint-Malo',
      quote: 'L\'IA appelle la veille pour confirmer chaque RDV. Mes journées sont enfin remplies, sans temps mort.',
      result: 'Taux de présence 94%',
      avatar: 'J',
      color: 'amber',
    },
  ];

  // Tarification définitive — alignée sur la consommation réelle (130 appels/mois en moyenne)
  const pricing = [
    {
      id: 'gratuit',
      name: 'Essai gratuit',
      tagline: 'Voir les résultats avant de payer',
      priceMensuel: 0,
      priceAnnuel: 0,
      unit: '',
      calls: '100 appels offerts · 14 jours',
      noCardBig: true,
      features: [
        'Tous les modules activés',
        'Configuration en 5 minutes',
        'Annulation en 1 clic',
      ],
      cta: 'Démarrer gratuitement',
      popular: false,
    },
    {
      id: 'a-la-carte',
      name: 'Pack découverte',
      tagline: 'Tester sans abonnement',
      priceMensuel: 97,
      priceAnnuel: 97,
      unit: 'HT · paiement unique',
      calls: '300 appels · 30 jours',
      pricePerCall: '0,32€/appel',
      features: [
        'Tous les modules inclus',
        'Pas de renouvellement automatique',
        'Idéal pour valider l\'usage',
        'Support email',
      ],
      cta: 'Acheter mes 300 appels',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Choisi par 73% de nos clients',
      priceMensuel: 97,
      priceAnnuel: 77,
      unit: 'HT / mois',
      calls: '500 appels par mois',
      pricePerCall: '0,19€/appel',
      pricePerCallAnnuel: '0,15€/appel',
      features: [
        'Renouvelés automatiquement',
        'Tous les modules inclus',
        'Rapport ROI hebdomadaire',
        'Intégration agenda',
        'Support prioritaire',
      ],
      cta: 'Choisir Pro',
      popular: true,
      annualNote: '2 mois offerts',
    },
    {
      id: 'business',
      name: 'Business',
      tagline: 'Volumes & multi-sites',
      priceMensuel: 249,
      priceAnnuel: 199,
      unit: 'HT / mois',
      calls: '2 000 appels par mois',
      pricePerCall: '0,12€/appel',
      pricePerCallAnnuel: '0,10€/appel',
      features: [
        'Tout le plan Pro',
        'Multi-sites & multi-utilisateurs',
        'Intégration CRM',
        'Account manager dédié',
        'Onboarding personnalisé',
      ],
      cta: 'Choisir Business',
      popular: false,
      annualNote: '2 mois offerts',
    },
  ];

  // Toggle annuel/mensuel pour la grille tarifaire
  const [pricingAnnual, setPricingAnnual] = useState(false);

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
      a: "5 minutes pour démarrer l'essai gratuit — vous renseignez votre email, vous recevez le lien de votre espace, vous importez un CSV de contacts. Pour le module Réception 24/7, on planifie un appel de 15 min avec notre équipe pour configurer le transfert d'appel chez votre opérateur. C'est ce qui prend le plus de temps, mais on s'occupe de tout : vous donnez l'autorisation, on fait le reste."
    },
    {
      q: "Je suis [plombier/coiffeur/garagiste], pas tech — est-ce que je vais y arriver seul ?",
      a: "Oui. Tout passe par 2 actions simples : (1) un email pour démarrer, (2) un fichier de contacts à uploader (votre liste clients exportée depuis votre logiciel ou même une feuille Excel). Aucun code, aucune installation logicielle, aucune intégration technique à faire vous-même. Et si vous bloquez sur quelque chose, on est joignable au +33 1 77 38 17 11 — réponse en moins de 2h ouvrées."
    },
    {
      q: "Que se passe-t-il après mes 100 appels offerts ?",
      a: "Rien d'automatique. On vous envoie un email à 80% de votre essai pour vous prévenir, et un autre à 100%. Vous décidez ensuite : passer en Pack découverte (97€ pour 300 appels, paiement unique), Pro (97€/mois pour 500 appels), Business (249€/mois), ou simplement ne rien faire. Aucun prélèvement automatique tant que vous n'avez pas explicitement choisi un plan payant."
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, en 1 clic depuis votre espace de configuration — sans justification, sans frais, sans période d'engagement. Pour les plans mensuels (Pro, Business), l'annulation prend effet à la fin du mois en cours. Pour le Pack découverte (paiement unique), il n'y a rien à annuler : pas de reconduction."
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
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA unique navbar — ultra-visible */}
          <div className="hidden md:block">
            <a
              href="#" onClick={(e) => { e.preventDefault(); openPopup('navbar', 'gratuit'); }}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-200"
            >
              Essayer gratuitement — 100 appels offerts <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">
                    {l.label}
                  </a>
                ))}
                <button type="button" onClick={() => { setMobileMenuOpen(false); openPopup('mobile-menu', 'gratuit'); }} className="block w-full text-center text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 rounded-full font-semibold mt-2">
                  Essai gratuit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ============================================ */}
      {/* HERO                                         */}
      {/* ============================================ */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
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
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-6">
                  <Zap className="w-4 h-4" /> IA Vocale pour professionnels
                </span>
              </div>

              <h1 className="hero-fade hero-fade-2 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                Occupé ?<br />
                <GradientText>Votre IA décroche.</GradientText>
              </h1>

              <p className="hero-fade hero-fade-3 mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl">
                Pendant que vous travaillez, elle qualifie, prend RDV, et vous envoie le récap par SMS.
              </p>

              <div className="hero-fade hero-fade-4 mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
                  className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 rounded-full hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-200"
                >
                  Essayer gratuitement — 100 appels offerts <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <p className="hero-fade hero-fade-4 mt-3 text-sm text-gray-400">
                Sans carte bancaire · Sans engagement · Opérationnel en 5 minutes
              </p>

              {/* Stats */}
              <div className="hero-fade hero-fade-5 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      <AnimatedNumber value={s.value} suffix={s.suffix} prefix={s.prefix || ''} />
                    </p>
                    <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Hero animation (desktop only) */}
            <div className="hero-fade hero-fade-4" style={{ transform: 'translateZ(0)' }}>
              <HeroAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS                                 */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Témoignages"
            title="+250 professionnels font confiance à BoosterPay."
            subtitle="Garagistes, cabinets médicaux, courtiers, salons, plombiers, avocats — ils ont automatisé leurs appels avec l'IA."
          />

          {/* Trust strip — secteurs représentés (en tête de section, cadre les témoignages) */}
          <ScrollReveal>
            <div className="mb-12 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] font-medium text-gray-500">
              <span>Garagistes</span>
              <span className="text-gray-300">·</span>
              <span>Cabinets médicaux</span>
              <span className="text-gray-300">·</span>
              <span>Courtiers</span>
              <span className="text-gray-300">·</span>
              <span>Salons</span>
              <span className="text-gray-300">·</span>
              <span>Plombiers</span>
              <span className="text-gray-300">·</span>
              <span>Avocats</span>
              <span className="text-gray-300">·</span>
              <span>Restaurants</span>
              <span className="text-gray-300">·</span>
              <span>Experts-comptables</span>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => {
              const tc = svcColors[t.color] || svcColors.emerald;
              const avatarBg = {
                emerald: 'from-emerald-400 to-teal-500',
                blue:    'from-blue-400 to-indigo-500',
                violet:  'from-violet-400 to-purple-500',
                yellow:  'from-yellow-400 to-amber-500',
                rose:    'from-rose-400 to-pink-500',
                amber:   'from-amber-400 to-orange-500',
              }[t.color] || 'from-emerald-400 to-teal-500';
              return (
                <ScrollReveal key={i} delay={(i % 3) * 0.08}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-7 h-full flex flex-col hover:shadow-lg hover:shadow-gray-900/[0.04] transition-shadow">
                    {/* Étoiles */}
                    <div className="flex gap-0.5 mb-4">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className="w-4 h-4 text-amber-400" fill="currentColor" strokeWidth={1} />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-[15px] text-gray-700 leading-relaxed flex-1">«&nbsp;{t.quote}&nbsp;»</p>

                    {/* Result chip */}
                    <div className={`mt-5 inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full ${tc.bg} border ${tc.border}`}>
                      <Sparkles className={`w-3 h-3 ${tc.icon}`} />
                      <span className={`text-[11.5px] font-bold ${tc.icon}`}>{t.result}</span>
                    </div>

                    <div className="h-px bg-gray-100 my-5" />

                    {/* Auteur */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-[14px]">{t.name}</p>
                        <p className="text-[12.5px] text-gray-500">{t.role} · {t.city}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS — 3 STEPS                       */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Comment ça marche"
            title="Quatre étapes. Zéro friction."
            subtitle="De l’import aux leads qualifiés — appels sortants ET entrants, tout est automatisé."
          />

          <div className="relative max-w-4xl mx-auto">
            {/* Connector line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200" />

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="text-center relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-6 relative z-10"
                    >
                      <step.icon className="w-9 h-9 text-white" />
                    </motion.div>
                    <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">
                      Étape {i + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ============================================ */}
      {/* RÉCEPTION D'APPELS IA — SECTION DÉDIÉE       */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            title="Vous ne décrochez pas ? L'IA prend le relais."
            subtitle="Transfert automatique quand vous êtes occupé. L'IA qualifie, prend RDV, et vous envoie le lead prêt à closer."
          />

          <div className="grid lg:grid-cols-2 gap-16 items-center mt-8">
            {/* Left — Phone animation / Visual */}
            <ScrollReveal delay={0.1}>
              <div className="relative">
                {/* Phone mockup */}
                <div className="bg-gray-900 rounded-[2.5rem] p-6 pt-10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />

                  {/* Incoming call screen */}
                  <div className="text-center mb-6 mt-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                      <PhoneCall className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white font-bold text-lg">Appel entrant</p>
                    <p className="text-gray-400 text-sm">06 12 34 56 78</p>
                  </div>

                  {/* AI conversation simulation */}
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-2">
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-[12px] text-amber-200 font-medium">IA BoosterPay</p>
                        <p className="text-[13px] text-white mt-0.5">Bonjour, entreprise Martin Plomberie, que puis-je faire pour vous ?</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-white/10 border border-white/10 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-[12px] text-gray-400 font-medium">Prospect</p>
                        <p className="text-[13px] text-gray-200 mt-0.5">J'ai une fuite dans ma salle de bain, vous pouvez intervenir cette semaine ?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-[12px] text-amber-200 font-medium">IA BoosterPay</p>
                        <p className="text-[13px] text-white mt-0.5">Bien sûr ! Je peux vous proposer un créneau jeudi à 9h ou vendredi à 14h. Quelle option vous convient ?</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[70%]">
                        <p className="text-[13px] text-emerald-300 font-semibold">✓ RDV confirmé — Jeudi 9h</p>
                      </div>
                    </div>
                  </div>

                  {/* Notification bar */}
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-[12px] text-emerald-300 font-semibold">Récap envoyé par SMS + Email</span>
                  </div>
                </div>

                {/* Floating notification card */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 flex items-center gap-3 max-w-[260px]">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Lead qualifié</p>
                    <p className="text-[10px] text-gray-400">Fuite SDB — Jeudi 9h — Urgent</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right — Features list */}
            <div>
              <ScrollReveal delay={0.05}>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  Votre secrétaire IA,<br />
                  <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">disponible 24h/24.</span>
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-10">
                  Un prospect appelle et vous ne décrochez pas ? L'appel est automatiquement transféré à votre IA. Elle répond en 2 secondes, comprend le besoin, qualifie l'urgence, propose un créneau, et vous envoie le lead complet par SMS. Chaque appel manqué devient un lead qualifié.
                </p>
              </ScrollReveal>

              <div className="space-y-5">
                {[
                  {
                    icon: PhoneCall,
                    title: 'Transfert automatique',
                    desc: 'Vous ne répondez pas après 3 sonneries ? L\'appel bascule sur votre IA. Le prospect ne raccroche jamais.',
                    color: 'amber',
                  },
                  {
                    icon: Target,
                    title: 'Qualifie le lead automatiquement',
                    desc: 'Type de travaux, urgence, localisation, budget — l\'IA pose les bonnes questions et classe le lead.',
                    color: 'emerald',
                  },
                  {
                    icon: CalendarDays,
                    title: 'Prend RDV dans votre agenda',
                    desc: 'Si le prospect est chaud, l\'IA propose un créneau et confirme. Vous n\'avez qu\'à vous pointer.',
                    color: 'blue',
                  },
                  {
                    icon: Zap,
                    title: 'Récap instantané par SMS',
                    desc: 'Nom, besoin, urgence, créneau choisi — tout vous arrive en temps réel sur votre téléphone.',
                    color: 'violet',
                  },
                ].map((feature, i) => (
                  <ScrollReveal key={i} delay={0.1 + i * 0.08}>
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className={`w-11 h-11 rounded-xl bg-${feature.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-[13px] text-gray-500 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* CTA */}
              <ScrollReveal delay={0.4}>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => openPopup('cta-receptionia', 'gratuit')}
                    className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 rounded-full hover:shadow-xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-200"
                  >
                    <CalendarCheck className="w-5 h-5" /> Démarrer mes 100 appels
                  </button>
                </div>
              </ScrollReveal>

              {/* Stats bar */}
              <ScrollReveal delay={0.5}>
                <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-black text-gray-900">97%</p>
                    <p className="text-[11px] text-gray-400 mt-1">Appels décrochés</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">×3</p>
                    <p className="text-[11px] text-gray-400 mt-1">Leads qualifiés</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">2s</p>
                    <p className="text-[11px] text-gray-400 mt-1">Temps de réponse</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>


      {/* ── Section Robot Personnalisé ── */}
      {/* ── Quatre services. Un seul outil. ── */}
      <section className="py-32 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Nos services"
            title="Votre secrétaire IA fait tout ça."
            subtitle="Une seule plateforme. La Réception d'appels 24/7 est toujours active. Vous activez les modules dont vous avez besoin — tous sont inclus."
          />

          {/* Top row — 2 core services side by side */}
          <div className="grid md:grid-cols-2 gap-8 mt-4">
            {[
              {
                icon: RefreshCw,
                title: 'Renouvellement de dossiers',
                desc: 'L\'IA relance automatiquement vos clients dont les dossiers arrivent à échéance. Zéro oubli, zéro effort.',
                details: ['Contrôles techniques', 'Assurances', 'Entretiens annuels', 'Bilans médicaux'],
                iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400',
                chipBg: 'bg-emerald-50',
                chipText: 'text-emerald-700',
                accentBorder: 'border-emerald-100',
                ctaBg: 'bg-gradient-to-br from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500',
                badge: 'Appels sortants',
                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              },
              {
                icon: CalendarCheck,
                title: 'Confirmation de RDV',
                desc: 'L\'IA appelle la veille pour confirmer chaque rendez-vous et supprimer les lapins. Planning fiable, CA protégé.',
                details: ['Appel J-1 automatique', 'SMS de rappel', 'Gestion des reports', 'Planning mis à jour'],
                iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
                chipBg: 'bg-blue-50',
                chipText: 'text-blue-700',
                accentBorder: 'border-blue-100',
                ctaBg: 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
                badge: 'Appels sortants',
                badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
              },
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                  className="relative h-full bg-white rounded-[28px] border border-gray-100/80 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-gray-900/[0.08] transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className={`relative w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center shadow-lg`}>
                      <service.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${service.badgeColor}`}>{service.badge}</span>
                  </div>
                  <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">{service.title}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed mb-8">{service.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                    {service.details.map((d, j) => (
                      <span key={j} className={`text-xs font-semibold ${service.chipText} ${service.chipBg} rounded-full px-4 py-2 border ${service.accentBorder}`}>{d}</span>
                    ))}
                  </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }} className={`inline-flex items-center justify-center gap-2.5 ${service.ctaBg} text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}>
                    Commencer gratuitement <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Bottom row — 2 premium services */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Réception d'appels IA */}
            <ScrollReveal delay={0.2}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                className="relative h-full bg-white rounded-[28px] border border-amber-200/60 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-amber-900/[0.06] transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <PhoneCall className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-100">Appels entrants</span>
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">Réception d'appels IA 24/7</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">Vous ne répondez pas ? L'appel est transféré automatiquement à l'IA. Elle décroche en 2 secondes, qualifie le prospect, prend RDV si c'est chaud, et vous envoie le lead par SMS. Une machine à leads qui tourne 24h/24.</p>
                <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                  {['Transfert auto', 'Qualification lead', 'Prise de RDV', 'Récap SMS instantané'].map((d, j) => (
                    <span key={j} className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-4 py-2 border border-amber-100">{d}</span>
                  ))}
                </div>
                <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  Démarrer gratuitement <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </ScrollReveal>

            {/* Robot IA sur mesure */}
            <ScrollReveal delay={0.3}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                className="relative h-full bg-white rounded-[28px] border border-violet-200/60 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-violet-900/[0.06] transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Bot className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-100">Sur mesure</span>
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">Robot IA sur mesure</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-3">Un besoin spécifique ? On crée votre robot sur mesure.</p>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">Script personnalisé, voix naturelle, scénarios complexes, intégration CRM — une IA vocale 100% adaptée à vos processus et à votre métier.</p>
                <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                  {['Script personnalisé', 'Voix naturelle', 'Scénarios complexes', 'Intégration CRM'].map((d, j) => (
                    <span key={j} className="text-xs font-semibold text-violet-700 bg-violet-50 rounded-full px-4 py-2 border border-violet-100">{d}</span>
                  ))}
                </div>
                <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
                  className="inline-flex items-center justify-center gap-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  Démarrer gratuitement <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Third row — Impact Avis + Accélération de paiements (intégrés depuis les anciennes pages dédiées) */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Impact Avis */}
            <ScrollReveal delay={0.1}>
              <motion.div
                id="impact-avis"
                whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                className="relative h-full bg-white rounded-[28px] border border-yellow-200/60 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-yellow-900/[0.06] transition-all duration-500 scroll-mt-24"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center shadow-lg">
                    <Star className="w-8 h-8 text-white" strokeWidth={1.5} fill="white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-100">Réputation</span>
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">Impact Avis</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-4">L'IA appelle vos clients, qualifie leur ressenti et leur envoie le lien direct vers Google Avis. Tout en filtrant intelligemment.</p>
                <div className="mb-8 p-3.5 rounded-2xl bg-yellow-50/60 border border-yellow-100">
                  <div className="flex items-start gap-2 text-[13px] text-yellow-900 leading-relaxed">
                    <Star className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" fill="currentColor" />
                    <div>
                      <span className="font-semibold">4 étoiles ou plus</span> &rarr; le client publie sur Google.<br/>
                      <span className="font-semibold">Moins de 4</span> &rarr; le ressenti reste en interne pour vous permettre d'agir.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                  {['Appel post-prestation', 'Filtrage 4★+ → Google', 'Avis < 4★ → interne', 'Lien direct par SMS'].map((d, j) => (
                    <span key={j} className="text-xs font-semibold text-yellow-700 bg-yellow-50 rounded-full px-4 py-2 border border-yellow-100">{d}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openPopup('card-impact-avis', 'gratuit')}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </ScrollReveal>

            {/* Accélération de paiements */}
            <ScrollReveal delay={0.2}>
              <motion.div
                id="paiements"
                whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                className="relative h-full bg-white rounded-[28px] border border-rose-200/60 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-rose-900/[0.06] transition-all duration-500 scroll-mt-24"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-rose-50 text-rose-700 border-rose-100">Recouvrement</span>
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">Accélération de paiements</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">L'IA appelle vos clients dont la facture est due, au bon moment, avec le bon ton. Vos délais de paiement raccourcissent, sans relance manuelle.</p>
                <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                  {['Relance automatique', 'Ton humain & professionnel', 'Suivi multi-tentatives', 'Délais de paiement -40%'].map((d, j) => (
                    <span key={j} className="text-xs font-semibold text-rose-700 bg-rose-50 rounded-full px-4 py-2 border border-rose-100">{d}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openPopup('card-paiements', 'gratuit')}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICE DÉDIÉ — RENOUVELLEMENT                    */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Visual */}
            <ScrollReveal delay={0.1}>
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[28px] p-8 border border-emerald-100">
                  {/* Animated timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">Relances automatiques</p>
                        <p className="text-[11px] text-gray-400">Cette semaine</p>
                      </div>
                    </div>
                    {[
                      { name: 'Martin D. — CT expiré dans 15j', status: 'Appelé → Renouvelé', done: true },
                      { name: 'Sophie L. — Entretien annuel', status: 'Appelé → RDV pris', done: true },
                      { name: 'Lucas R. — Vidange 20 000km', status: 'Appelé → Renouvelé', done: true },
                      { name: 'Claire M. — Assurance à renouveler', status: 'Appel en cours...', done: false },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                        className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          {item.done ? <Check className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className={`text-[10px] font-medium ${item.done ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Bottom stat */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-5 bg-emerald-500 rounded-2xl py-3 text-center"
                  >
                    <p className="text-sm font-bold text-white">80% renouvelés cette semaine</p>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right — Text */}
            <div>
              <ScrollReveal>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-6">
                  <RefreshCw className="w-4 h-4" /> Service 1 — Appels sortants
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  Renouvellement de dossiers.{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Zéro oubli.</span>
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  L’IA appelle chaque client dont le dossier arrive à échéance — contrôles techniques, assurances, bilans, abonnements. Tout est couvert, rien ne passe entre les mailles.
                </p>
              </ScrollReveal>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { val: '80%', label: 'Taux de renouvellement' },
                  { val: '0', label: 'Dossier oublié' },
                  { val: '2min', label: 'Par relance' },
                  { val: '100%', label: 'Automatisé' },
                ].map((s, i) => (
                  <ScrollReveal key={i} delay={0.1 + i * 0.06}>
                    <div className="bg-emerald-50/60 rounded-2xl p-4 text-center border border-emerald-100/50">
                      <p className="text-2xl font-black text-emerald-600">{s.val}</p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1">{s.label}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal delay={0.3}>
                <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }} className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </a>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICE DÉDIÉ — CONFIRMATION RDV                  */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div>
              <ScrollReveal>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full mb-6">
                  <CalendarCheck className="w-4 h-4" /> Service 2 — Appels sortants
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  Confirmation de RDV.{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Fini les lapins.</span>
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  L’IA appelle la veille de chaque rendez-vous pour confirmer. Le client confirme, reporte ou annule — votre planning est fiable à 92%.
                </p>
              </ScrollReveal>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { val: '92%', label: 'Taux de présence' },
                  { val: '-35%', label: 'De lapins' },
                  { val: 'J-1', label: 'Appel automatique' },
                  { val: '0min', label: 'De votre temps' },
                ].map((s, i) => (
                  <ScrollReveal key={i} delay={0.1 + i * 0.06}>
                    <div className="bg-blue-50/60 rounded-2xl p-4 text-center border border-blue-100/50">
                      <p className="text-2xl font-black text-blue-600">{s.val}</p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1">{s.label}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal delay={0.3}>
                <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }} className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </a>
              </ScrollReveal>
            </div>

            {/* Right — Visual */}
            <ScrollReveal delay={0.15}>
              <div className="relative">
                <div className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-xl shadow-gray-900/[0.04]">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[13px] font-bold text-gray-900">Agenda du jour</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full"
                    >
                      92% confirmés
                    </motion.span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '09:00', name: 'Martin D.', ok: true },
                      { time: '10:30', name: 'Sophie L.', ok: true },
                      { time: '11:00', name: 'Pierre B.', ok: true },
                      { time: '14:00', name: 'Claire M.', ok: false },
                      { time: '15:30', name: 'Lucas R.', ok: true },
                      { time: '16:30', name: 'Emma T.', ok: true },
                    ].map((slot, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100/40"
                      >
                        <span className="text-[11px] font-semibold text-gray-400 w-10 tabular-nums">{slot.time}</span>
                        <span className="text-[13px] font-medium text-gray-800 flex-1">{slot.name}</span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${slot.ok ? 'bg-emerald-100' : 'bg-red-50'}`}>
                          {slot.ok ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-400" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 mb-2">
                      <span>Sans IA : 57%</span>
                      <span className="text-emerald-600">Avec IA : 92%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '57%' }}
                        whileInView={{ width: '92%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICE DÉDIÉ — IMPACT AVIS                       */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Visual : timeline d'appels avec filtrage 4★+ */}
            <ScrollReveal delay={0.1}>
              <div className="relative order-2 lg:order-1">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-[28px] p-8 border border-yellow-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center shadow-lg">
                      <Star className="w-5 h-5 text-white" fill="white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">Appels post-prestation</p>
                      <p className="text-[11px] text-gray-400">Cette semaine</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Marie D.', note: 5, action: 'Avis Google publié', publish: true },
                      { name: 'Lucas R.', note: 5, action: 'Avis Google publié', publish: true },
                      { name: 'Sophie L.', note: 4, action: 'Avis Google publié', publish: true },
                      { name: 'Pierre M.', note: 3, action: 'Retour interne — RDV à recaler', publish: false },
                      { name: 'Claire B.', note: 5, action: 'Avis Google publié', publish: true },
                    ].map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                        className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.publish ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                          <Star className={`w-4 h-4 ${c.publish ? 'text-yellow-600' : 'text-slate-500'}`} fill={c.publish ? 'currentColor' : 'none'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[12.5px] font-semibold text-gray-900 truncate">{c.name}</p>
                            <span className="text-[11px] font-bold tabular-nums text-yellow-700">{c.note}★</span>
                          </div>
                          <p className={`text-[10.5px] font-medium ${c.publish ? 'text-yellow-700' : 'text-slate-500'}`}>{c.action}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 }}
                    className="mt-5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl py-3 text-center"
                  >
                    <p className="text-sm font-bold text-white">4 avis Google publiés · 1 retour interne</p>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right — Text */}
            <div className="order-1 lg:order-2">
              <ScrollReveal>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-700 bg-yellow-100 px-4 py-1.5 rounded-full mb-6">
                  <Star className="w-4 h-4" fill="currentColor" /> Service 5 — Réputation
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  Impact Avis.{' '}
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Plus d'étoiles, sans risque.</span>
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed mb-6">
                  L'IA appelle vos clients après chaque prestation. Elle qualifie le ressenti. Si c'est positif, elle envoie le lien Google par SMS. Si c'est négatif, le retour reste en interne pour vous permettre d'agir.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-yellow-50/60 border border-yellow-100/80">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">4 étoiles ou plus</p>
                      <p className="text-[13px] text-gray-600 leading-relaxed">L'IA envoie le lien direct vers votre fiche Google par SMS. Le client publie en 30 secondes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100/80">
                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">Moins de 4 étoiles</p>
                      <p className="text-[13px] text-gray-600 leading-relaxed">Le retour reste confidentiel et arrive dans votre CRM. Vous corrigez avant que l'avis ne devienne public.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <button
                  type="button"
                  onClick={() => openPopup('section-impact-avis', 'gratuit')}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                >
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </button>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICE DÉDIÉ — ACCÉLÉRATION DE PAIEMENTS         */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div>
              <ScrollReveal>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 bg-rose-100 px-4 py-1.5 rounded-full mb-6">
                  <Zap className="w-4 h-4" /> Service 6 — Trésorerie
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  Accélération de paiements.{' '}
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Vos délais raccourcissent.</span>
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  L'IA appelle vos clients dont la facture est due, au bon moment, avec le bon ton. Pas de menace, pas de relance brutale — juste un rappel humain et professionnel qui fait toute la différence sur vos délais.
                </p>
              </ScrollReveal>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { val: '-40%', label: 'Délais de paiement' },
                  { val: '+62%', label: 'Factures payées à J+0' },
                  { val: '0min', label: 'De votre temps' },
                  { val: '24/7', label: 'Tentatives intelligentes' },
                ].map((s, i) => (
                  <ScrollReveal key={i} delay={0.1 + i * 0.06}>
                    <div className="bg-rose-50/60 rounded-2xl p-4 text-center border border-rose-100/50">
                      <p className="text-2xl font-black text-rose-600">{s.val}</p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1">{s.label}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal delay={0.3}>
                <button
                  type="button"
                  onClick={() => openPopup('section-paiements', 'gratuit')}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                >
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </button>
              </ScrollReveal>
            </div>

            {/* Right — Visual : factures en cours de relance */}
            <ScrollReveal delay={0.15}>
              <div className="relative">
                <div className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-xl shadow-gray-900/[0.04]">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[13px] font-bold text-gray-900">Factures relancées</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full"
                    >
                      8 réglées sur 10
                    </motion.span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { ref: 'FAC-2026-008', client: 'SARL Dubois', amount: '850 €', status: 'Réglée — J+2', ok: true },
                      { ref: 'FAC-2026-012', client: 'Cabinet Martin', amount: '1 200 €', status: 'Réglée — J+4', ok: true },
                      { ref: 'FAC-2026-015', client: 'EURL Lefèvre', amount: '430 €', status: 'Promesse — J+7', ok: 'pending' },
                      { ref: 'FAC-2026-019', client: 'SAS Renaud', amount: '2 100 €', status: 'Réglée — J+1', ok: true },
                      { ref: 'FAC-2026-022', client: 'Pharmacie Bertin', amount: '680 €', status: 'Réglée — J+3', ok: true },
                    ].map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100/40"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${f.ok === true ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          {f.ok === true ? <Check className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[12.5px] font-semibold text-gray-900 truncate">{f.client}</p>
                            <p className="text-[12px] font-bold text-gray-900 tabular-nums">{f.amount}</p>
                          </div>
                          <p className={`text-[10.5px] font-medium ${f.ok === true ? 'text-emerald-600' : 'text-amber-700'}`}>{f.status}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 mb-2">
                      <span>Sans IA : 28 jours</span>
                      <span className="text-rose-600">Avec IA : 17 jours</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '90%' }}
                        whileInView={{ width: '54%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Sur mesure</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Un besoin spécifique ?{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                On crée votre robot sur mesure.
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mt-6 leading-relaxed">
              Appels chronophages, processus répétitifs, scénarios complexes — notre équipe configure une IA vocale 100% adaptée à votre métier et à vos workflows.
            </p>
          </ScrollReveal>
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <RobotShowcase />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => openPopup('cta-robot-mesure', 'gratuit')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-105 text-lg"
              >
                <CalendarCheck className="w-5 h-5" />
                Démarrer gratuitement
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4">Gratuit · 15 min · Sans engagement</p>
          </ScrollReveal>
        </div>
      </section>



      {/* ============================================ */}
      {/* USE CASES BY PROFESSION                      */}
      {/* ============================================ */}
      <section id="usecases" className="py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Cas d'usage"
            title="Votre métier. Votre IA."
            subtitle="Découvrez comment l'IA s'adapte à votre quotidien — et combien ça vous rapporte."
          />

          {/* Phrase d'invitation active */}
          <ScrollReveal>
            <p className="text-center text-[15px] sm:text-[16px] text-gray-700 font-medium max-w-2xl mx-auto -mt-6 mb-10">
              👇 Cliquez sur votre métier — on vous dit exactement ce que l'IA va faire pour vous et combien ça vous rapporte.
            </p>
          </ScrollReveal>

          <MetierSelector openPopup={openPopup} />
        </div>
      </section>

      {/* ── Avant / Après ── */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            tag="Impact sur votre activité"
            title="Avant / Après BoosterPay"
            subtitle="Comparez votre quotidien sans et avec l'IA vocale."
          />
          <div className="relative grid md:grid-cols-[1fr,auto,1fr] gap-0 max-w-5xl mx-auto items-stretch">

            {/* Sans IA — Dark card */}
            <ScrollReveal delay={0.1}>
              <div className="relative bg-gray-900 rounded-[24px] p-10 md:p-12 overflow-hidden h-full">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900 rounded-[24px]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    Sans IA
                  </div>
                  <div className="space-y-5">
                    {[
                      { icon: Clock, text: '3h/jour au téléphone', stat: '3h' },
                      { icon: Calendar, text: '43% de lapins non anticipés', stat: '43%' },
                      { icon: TrendingUp, text: 'CA perdu sur dossiers non renouvelés', stat: null },
                      { icon: Timer, text: 'Temps perdu, stress, oublis', stat: null },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.01, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ delay: 0.15 + i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[14px] text-gray-300 font-medium">{item.text}</span>
                        </div>
                        {item.stat && (
                          <span className="text-xl font-black text-red-400/80 tabular-nums">{item.stat}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Central VS divider */}
            <div className="hidden md:flex flex-col items-center justify-center px-6">
              <div className="w-px h-16 bg-gradient-to-b from-transparent to-gray-200" />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.4, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center my-3"
              >
                <span className="text-sm font-black text-gray-900 tracking-tight">VS</span>
              </motion.div>
              <div className="w-px h-16 bg-gradient-to-b from-gray-200 to-transparent" />
            </div>
            {/* Mobile VS */}
            <div className="flex md:hidden items-center justify-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.3, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center"
              >
                <span className="text-xs font-black text-gray-900">VS</span>
              </motion.div>
            </div>

            {/* Avec BoosterPay — White elevated card */}
            <ScrollReveal delay={0.25}>
              <div className="relative bg-white rounded-[24px] p-10 md:p-12 overflow-hidden shadow-2xl shadow-emerald-900/[0.08] border border-emerald-100/50 h-full">
                <div className="relative">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-8">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Avec BoosterPay
                  </div>
                  <div className="space-y-5">
                    {[
                      { icon: Zap, text: '0 minute au téléphone', stat: '0min' },
                      { icon: CheckCircle2, text: 'Seulement 8% de lapins', stat: '8%' },
                      { icon: BarChart3, text: 'Agenda rempli, dossiers renouvelés', stat: null },
                      { icon: PhoneCall, text: '97% des appels décrochés par l\'IA', stat: '97%' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.01, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ delay: 0.2 + i * 0.12 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[14px] text-gray-800 font-medium">{item.text}</span>
                        </div>
                        {item.stat && (
                          <span className="text-xl font-black text-emerald-600 tabular-nums">{item.stat}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom accent stats */}
                  <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-gray-900 tracking-tight">+35%</div>
                      <div className="text-[11px] font-medium text-gray-400 mt-1">Dossiers renouvelés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-gray-900 tracking-tight">3h</div>
                      <div className="text-[11px] font-medium text-gray-400 mt-1">Gagnées par jour</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      {/* Section "Activez votre boost gratuit" supprimée — flow remplacé par le popup email + page /configurer */}


      {/* PRICING                                      */}
      {/* ============================================ */}
      <section id="pricing" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Tarifs"
            title="Une seule plateforme. Tous les modules. Toujours inclus."
            subtitle="Choisissez le plan adapté à votre volume — tous incluent les 6 modules sans restriction."
          />

          {/* Toggle annuel / mensuel */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => setPricingAnnual(false)}
                className={`px-5 py-2 rounded-full text-[13.5px] font-semibold transition-all ${
                  !pricingAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setPricingAnnual(true)}
                className={`px-5 py-2 rounded-full text-[13.5px] font-semibold transition-all flex items-center gap-1.5 ${
                  pricingAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annuel
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  −2 mois
                </span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan, i) => {
              const price = pricingAnnual ? plan.priceAnnuel : plan.priceMensuel;
              return (
                <ScrollReveal key={plan.id} delay={i * 0.08}>
                  <div className={`relative rounded-3xl border p-7 h-full flex flex-col transition-all duration-300 ${
                    plan.popular
                      ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/60 to-white shadow-xl shadow-emerald-900/5 lg:-mt-3'
                      : 'border-gray-100 bg-white hover:shadow-lg hover:shadow-gray-900/[0.04]'
                  }`}>
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10.5px] font-bold tracking-wider uppercase text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-1 rounded-full shadow-md">
                        Le plus populaire
                      </span>
                    )}
                    <div className="mb-1">
                      <h3 className="text-[15px] font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">{plan.tagline}</p>
                    </div>
                    <div className="my-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[40px] font-semibold tracking-tight text-gray-900">{price}€</span>
                        {plan.unit && <span className="text-[12.5px] text-gray-400 font-medium">{plan.unit}</span>}
                      </div>
                      <p className="text-[13px] text-emerald-600 font-medium mt-1">{plan.calls}</p>
                      {plan.pricePerCall && (
                        <p className="text-[11.5px] text-gray-500 font-medium mt-0.5">
                          soit <span className="font-semibold text-gray-700">{(pricingAnnual && plan.pricePerCallAnnuel) ? plan.pricePerCallAnnuel : plan.pricePerCall}</span>
                        </p>
                      )}
                      {plan.annualNote && pricingAnnual && (
                        <p className="text-[11.5px] text-emerald-700/80 font-medium mt-0.5">{plan.annualNote}</p>
                      )}
                    </div>
                    {/* Bandeau "Sans CB" massif uniquement pour l'essai gratuit */}
                    {plan.noCardBig && (
                      <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                        <div className="text-[13px] font-bold text-emerald-700 tracking-tight leading-tight">
                          Sans CB · Zéro engagement · Annulation en 1 clic
                        </div>
                      </div>
                    )}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-[13.5px] text-gray-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-1 flex-shrink-0" strokeWidth={2.4} />
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => openPopup('pricing-' + plan.id, plan.id)}
                      className={`w-full text-center py-3 rounded-full font-semibold text-[13.5px] transition-all duration-200 ${
                        plan.popular
                          ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <p className="mt-10 text-center text-[12.5px] text-gray-400">
            Tous les prix sont HT. Annulation en 1 clic. Pas de frais cachés.
          </p>
        </div>
      </section>

      {/* FAQ                                          */}
      {/* ============================================ */}
      <section id="faq" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeading
            tag="FAQ"
            title="Questions fréquentes."
          />

          <div className="space-y-3">
            {faqs.map((faq, i) => (
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
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
        </div>
      </section>

      {/* FINAL CTA                                    */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-10 md:p-16 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                  100 appels offerts.<br />Zéro engagement.
                </h2>
                <p className="text-lg text-emerald-100 max-w-xl mx-auto mb-8">
                  Testez l'IA vocale BoosterPay sans risque. Importez vos contacts, lancez vos premiers appels, et constatez les résultats.
                </p>
                <a
                  href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
                  className="inline-flex items-center gap-2 text-base font-semibold text-emerald-700 bg-white px-8 py-4 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Activer mes 100 appels gratuits <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER                                       */}
      {/* ============================================ */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-xl font-bold mb-4">
                <GradientText>BoosterPay</GradientText>
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                L'IA vocale qui décroche, relance, qualifie et convertit — automatiquement.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Produit</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#usecases" className="text-sm text-gray-400 hover:text-white transition-colors">Cas d'usage</a></li>
                <li><a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Légal</h5>
              <ul className="space-y-2">
                <li><Link to="/mentions-legales" className="text-sm text-gray-400 hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link to="/cgv" className="text-sm text-gray-400 hover:text-white transition-colors">CGV</Link></li>
                <li><Link to="/politique-confidentialite" className="text-sm text-gray-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Contact</h5>
              <ul className="space-y-2">
                <li><a href="mailto:contact@booster-pay.com" className="text-sm text-gray-400 hover:text-white transition-colors">contact@booster-pay.com</a></li>
                <li><span className="text-sm text-gray-400">Bretagne, France</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} BoosterPay. Tous droits réservés.</p>
            <p className="text-xs text-gray-500">Fait avec passion en Bretagne.</p>
          </div>
        </div>
      </footer>

      {/* ── Popup capture email + bouton flottant Contact (phone + chat) ── */}
      {/* Toujours en mode "gratuit" : tout le monde commence par l'essai 100 appels.
          L'upgrade éventuel se fait depuis /configurer/:token. */}
      <EmailCapturePopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        source={popupSource + (popupPlanIntent !== 'gratuit' ? ':' + popupPlanIntent : '')}
        plan="gratuit"
      />
      <FloatingContact />
    </div>
  );
}
