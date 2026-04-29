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
const services = [
  {
    icon: 'PhoneCall',
    title: 'Réception d\'appels IA 24/7',
    desc: "La base : quand vous ne décrochez pas, l'IA répond, qualifie et vous envoie le lead.",
    result: '0 appel manqué',
    example: 'Nouveau prospect — Fuite urgente qualifié',
    color: 'amber',
  },
  {
    icon: 'RefreshCw',
    title: 'Renouvellement de dossiers',
    desc: "L'IA appelle vos clients pour renouveler leurs contrats, dossiers et abonnements.",
    result: '80% de renouvellements',
    example: 'Garage MaxMotors — CT renouvelé',
    color: 'emerald',
  },
  {
    icon: 'CalendarCheck',
    title: 'Confirmation de RDV',
    desc: "Chaque RDV est confirmé par appel automatique. Fini les lapins.",
    result: '-35% de rendez-vous manqués',
    example: 'Salon Bella — RDV confirmé demain 14h',
    color: 'blue',
  },
  {
    icon: 'Bot',
    title: 'Robot IA sur mesure',
    desc: "Un assistant vocal personnalisé pour votre métier, vos scripts, vos process.",
    result: 'Disponible 7j/7 24h/24',
    example: 'Courtier — 12 relances auto cette semaine',
    color: 'violet',
  },
  {
    icon: 'Star',
    title: 'Impact Avis',
    desc: "L'IA appelle vos clients satisfaits et leur envoie le lien direct vers Google Avis par SMS.",
    result: '+5 avis Google par mois',
    example: 'Salon Bella — 4,9/5 étoiles · 38 avis ce mois',
    color: 'orange',
  },
  {
    icon: 'Zap',
    title: 'Accélération de paiements',
    desc: "L'IA relance vos impayés, propose un règlement en 1 clic via Stripe, Klarna ou Billie.",
    result: '+62% de récupération',
    example: 'Cabinet Martin — 1 200€ régularisés en 24h',
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
};

const HeroAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const show = () => {
      setActive(i);
      i++;
      if (i < 4) setTimeout(show, 2400);
    };
    const t = setTimeout(show, 500);
    return () => clearTimeout(t);
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

            {/* 4 service pills — always visible, active one highlighted */}
            <div className="grid grid-cols-2 gap-1.5 mb-5">
              {services.map((s, i) => {
                const SIcon = iconMap[s.icon];
                const sc = colorMap[s.color];
                const isActive = i === active;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-500 ${
                      isActive
                        ? `${sc.bg} border-transparent ring-2 ${sc.ring} scale-[1.02]`
                        : i <= active
                          ? 'bg-gray-50 border-gray-100'
                          : 'bg-gray-50/50 border-gray-50 opacity-40'
                    }`}
                    style={{ transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
                  >
                    <SIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? sc.icon : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-semibold leading-tight ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {s.title.length > 20 ? s.title.split(' ').slice(0, 2).join(' ') : s.title}
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
        <p className="text-[10px] font-bold text-gray-900">4 services actifs</p>
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
  { name: 'Garagiste', icon: Wrench, s1: 'Relance CT, vidanges, entretiens', s2: 'Confirmation RDV atelier J-1', s3: 'Réception appels pannes 24/7', s4: 'Robot accueil personnalisé', temps: '12h', clients: '+18', ca: '+8 500€', lapins: '-40%' },
  { name: 'Courtier assurance', icon: Shield, s1: 'Renouvellement contrats auto/habitation', s2: 'Confirmation RDV signature', s3: 'Réception appels sinistres 24/7', s4: 'Robot qualification souscription', temps: '15h', clients: '+25', ca: '+12 000€', lapins: '-35%' },
  { name: 'Dentiste', icon: Heart, s1: 'Rappel détartrages & bilans', s2: 'Confirmation RDV patients J-1', s3: 'Réception appels urgences dentaires', s4: 'Robot triage patients', temps: '10h', clients: '+15', ca: '+6 500€', lapins: '-45%' },
  { name: 'Opticien', icon: Eye, s1: 'Renouvellement lunettes/lentilles', s2: 'Confirmation RDV essayage', s3: 'Réception appels conseils optiques', s4: 'Robot prise de RDV auto', temps: '8h', clients: '+12', ca: '+7 000€', lapins: '-30%' },
  { name: 'Salon coiffure', icon: Scissors, s1: 'Réactivation clients dormants 3 mois', s2: 'Confirmation RDV coiffure J-1', s3: 'Réception appels réservation', s4: 'Robot conseils personnalisés', temps: '10h', clients: '+20', ca: '+4 500€', lapins: '-50%' },
  { name: 'Kiné / Ostéopathe', icon: Activity, s1: 'Suivi parcours de soins', s2: 'Confirmation séances', s3: 'Réception appels nouveaux patients', s4: 'Robot orientation patients', temps: '8h', clients: '+10', ca: '+3 800€', lapins: '-35%' },
  { name: 'Médecin généraliste', icon: Heart, s1: 'Rappel check-up & vaccins', s2: 'Confirmation consultations J-1', s3: 'Réception appels patients 24/7', s4: 'Robot triage & orientation', temps: '14h', clients: '+12', ca: '+5 000€', lapins: '-40%' },
  { name: 'Vétérinaire', icon: Heart, s1: 'Rappel vaccins & vermifuges', s2: 'Confirmation RDV consultations', s3: 'Réception appels urgences animales', s4: 'Robot conseil vétérinaire', temps: '10h', clients: '+14', ca: '+5 500€', lapins: '-35%' },
  { name: 'Agent immobilier', icon: Users, s1: 'Relance mandats à échéance', s2: 'Confirmation visites acquéreurs', s3: 'Réception appels acquéreurs 24/7', s4: 'Robot qualification achat/location', temps: '14h', clients: '+30', ca: '+15 000€', lapins: '-25%' },
  { name: 'Plombier', icon: Wrench, s1: 'Relance entretiens chaudière', s2: 'Confirmation interventions', s3: 'Réception appels urgences 24/7', s4: 'Robot devis automatique', temps: '12h', clients: '+22', ca: '+9 000€', lapins: '-30%' },
  { name: 'Coach sportif', icon: Activity, s1: 'Relance abonnements expirés', s2: 'Confirmation séances', s3: 'Réception appels inscription', s4: 'Robot programme personnalisé', temps: '6h', clients: '+15', ca: '+3 000€', lapins: '-40%' },
  { name: 'Restaurant', icon: Gift, s1: 'Relance clients fidèles', s2: 'Confirmation réservations J-1', s3: 'Réception appels réservation 24/7', s4: 'Robot commande & réservation', temps: '8h', clients: '+25', ca: '+5 000€', lapins: '-55%' },
  { name: 'Salon esthétique', icon: Sparkles, s1: 'Réactivation clientes dormantes', s2: 'Confirmation RDV soins', s3: 'Réception appels prise de RDV', s4: 'Robot conseil beauté', temps: '10h', clients: '+18', ca: '+4 800€', lapins: '-45%' },
  { name: 'Avocat', icon: Shield, s1: 'Relance dossiers en attente', s2: 'Confirmation RDV consultations', s3: 'Réception appels nouveaux clients', s4: 'Robot prise de brief juridique', temps: '12h', clients: '+10', ca: '+10 000€', lapins: '-30%' },
  { name: 'Expert-comptable', icon: FileText, s1: 'Relance bilans & déclarations', s2: 'Confirmation RDV clients', s3: 'Réception appels questions fiscales', s4: 'Robot collecte pièces', temps: '15h', clients: '+12', ca: '+8 000€', lapins: '-25%' },
  { name: 'Auto-école', icon: Calendar, s1: 'Relance élèves inactifs', s2: 'Confirmation heures conduite', s3: 'Réception appels inscription', s4: 'Robot planning auto', temps: '10h', clients: '+20', ca: '+6 000€', lapins: '-40%' },
  { name: 'Électricien', icon: Zap, s1: 'Relance contrôles électriques', s2: 'Confirmation interventions', s3: 'Réception appels dépannage', s4: 'Robot devis électrique', temps: '10h', clients: '+18', ca: '+7 500€', lapins: '-30%' },
  { name: 'Pharmacie', icon: Heart, s1: 'Rappel renouvellement ordonnances', s2: 'Confirmation préparations', s3: 'Réception appels conseils', s4: 'Robot suivi traitements', temps: '8h', clients: '+10', ca: '+4 500€', lapins: '-20%' },
  { name: 'Photographe', icon: Eye, s1: 'Relance séances anniversaires', s2: 'Confirmation shoots', s3: 'Réception appels devis', s4: 'Robot portfolio & tarifs', temps: '6h', clients: '+12', ca: '+3 500€', lapins: '-35%' },
  { name: 'Serrurier', icon: Wrench, s1: 'Relance contrats maintenance', s2: 'Confirmation interventions', s3: 'Réception appels urgences 24/7', s4: 'Robot devis serrurerie', temps: '10h', clients: '+20', ca: '+8 000€', lapins: '-25%' },
  { name: 'Notaire', icon: FileText, s1: 'Relance signatures & dossiers', s2: 'Confirmation RDV actes', s3: 'Réception appels nouveaux dossiers', s4: 'Robot accueil étude', temps: '12h', clients: '+8', ca: '+10 000€', lapins: '-30%' },
  { name: 'Paysagiste', icon: Wrench, s1: 'Relance entretiens saisonniers', s2: 'Confirmation interventions', s3: 'Réception appels devis', s4: 'Robot conseil jardin', temps: '8h', clients: '+15', ca: '+5 500€', lapins: '-30%' },
  { name: 'Consultant', icon: Users, s1: 'Relance propositions commerciales', s2: 'Confirmation RDV clients', s3: 'Réception appels prospects', s4: 'Robot qualification projet', temps: '10h', clients: '+8', ca: '+12 000€', lapins: '-20%' },
  { name: 'Centre formation', icon: Users, s1: 'Relance inscriptions', s2: 'Confirmation sessions', s3: 'Réception appels renseignements', s4: 'Robot orientation formation', temps: '10h', clients: '+20', ca: '+8 000€', lapins: '-35%' },
];


const serviceLabels = [
  { key: 's1', icon: RefreshCw, label: 'Renouvellement', color: 'emerald' },
  { key: 's2', icon: CalendarCheck, label: 'Confirmation RDV', color: 'blue' },
  { key: 's3', icon: PhoneCall, label: 'Réception 24/7', color: 'amber' },
  { key: 's4', icon: Bot, label: 'Robot sur mesure', color: 'violet' },
];

const svcColors = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
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

            {/* 4 services grid */}
            <div className="grid sm:grid-cols-2 gap-[1px] bg-gray-100/60 shadow-xl shadow-gray-200/30">
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

            {/* CTA — Two clear paths */}
            <div className="mt-10 max-w-2xl mx-auto">
              {/* Path 1: Renouvellement & Confirmation → Import */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/80 mb-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex -space-x-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center ring-2 ring-white"><RefreshCw className="w-4 h-4 text-white" /></div>
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center ring-2 ring-white"><CalendarCheck className="w-4 h-4 text-white" /></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-tight">Renouvellement & Confirmation RDV</p>
                      <p className="text-xs text-gray-500">Appels sortants — 100 appels offerts</p>
                    </div>
                  </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold px-6 py-3 rounded-full text-sm hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap flex-shrink-0">
                    Démarrer gratuitement <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Path 2: Réception & Robot → Calendar */}
              <div className="bg-gradient-to-r from-amber-50 to-violet-50 rounded-2xl p-5 border border-amber-100/80">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex -space-x-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center ring-2 ring-white"><PhoneCall className="w-4 h-4 text-white" /></div>
                      <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center ring-2 ring-white"><Bot className="w-4 h-4 text-white" /></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-tight">Réception d'appels 24/7 & Robot sur mesure</p>
                      <p className="text-xs text-gray-500">Solution personnalisée</p>
                    </div>
                  </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }} className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-full text-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 whitespace-nowrap flex-shrink-0">
                    <CalendarCheck className="w-4 h-4" /> Planifier un call
                  </a>
                </div>
              </div>
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
    { name: 'Thomas R.', role: 'Garagiste, Rennes', quote: '12 clients réactivés en 1 semaine. Des contrôles techniques que j\'aurais perdus sans les relances IA.', avatar: 'T' },
    { name: 'Camille D.', role: 'Ostéopathe, Nantes', quote: 'Zéro lapin depuis que les confirmations IA sont en place. Mon planning est enfin fiable.', avatar: 'C' },
    { name: 'Marc L.', role: 'Courtier, Brest', quote: '80% de contrats renouvelés sans passer un seul appel. La rentabilité est immédiate.', avatar: 'M' },
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
      features: [
        'Tous les modules activés',
        'Sans CB · Sans engagement',
        'Configuration en 5 minutes',
        'Annulation en 1 clic',
      ],
      cta: 'Démarrer gratuitement',
      popular: false,
    },
    {
      id: 'a-la-carte',
      name: 'À la carte',
      tagline: 'Tester sans abonnement',
      priceMensuel: 97,
      priceAnnuel: 97,
      unit: 'HT · paiement unique',
      calls: '300 appels · 30 jours',
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
      tagline: 'Le plus populaire',
      priceMensuel: 97,
      priceAnnuel: 77,
      unit: 'HT / mois',
      calls: '500 appels par mois',
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
    { q: 'Comment l\'IA passe-t-elle les appels ?', a: 'Notre IA utilise une synthèse vocale de dernière génération avec une voix naturelle, fluide et professionnelle. Elle suit un script entièrement personnalisé selon votre métier (garagiste, courtier, praticien de santé, etc.) et adapte la conversation en fonction des réponses du client. À la fin de chaque appel, le résultat (confirmé, reporté, injoignable) est mis à jour automatiquement dans votre tableau de bord en temps réel.' },
    { q: 'Mes clients vont-ils savoir que c\'est une IA ?', a: 'L\'IA est spécialement conçue pour être indiscernable d\'un appel humain. Elle se présente au nom de votre entreprise, utilise un ton chaleureux et professionnel, et suit un script personnalisé à votre activité. La grande majorité des clients ne font aucune différence avec un appel passé par votre secrétaire ou assistant(e). Vous gardez le contrôle total sur le ton et le contenu des appels.' },
    { q: 'Quels formats de fichiers sont acceptés ?', a: 'Vous pouvez importer vos contacts via CSV, Excel (.xlsx), ou les saisir manuellement directement depuis l\'interface. Notre système détecte automatiquement les colonnes (nom, téléphone, type, date) et formate les données pour vous. Aucune compétence technique n\'est requise.' },
    { q: 'Combien de temps pour être opérationnel ?', a: 'Moins de 24 heures, et souvent beaucoup moins. Il suffit d\'importer vos contacts (CSV ou saisie manuelle), et les appels démarrent immédiatement. Aucune installation technique, aucun logiciel à configurer : vous importez, l\'IA appelle, votre agenda se remplit.' },
    { q: 'Est-ce conforme au RGPD ?', a: 'Absolument, la conformité RGPD est au c\u0153ur de notre solution. Toutes les données sont hébergées en France sur des serveurs sécurisés, chiffrées en transit et au repos (AES-256). Vos clients peuvent exercer leur droit d\'opposition et se désinscrire à tout moment via un simple mécanisme d\'opt-out intégré à chaque appel. Nous ne revendons jamais vos données et respectons strictement le Règlement Général sur la Protection des Données.' },
    { q: 'Puis-je annuler à tout moment ?', a: 'Oui, vous êtes totalement libre. Les packs (Boost et Business) sont des achats ponctuels sans abonnement ni reconduction automatique : vous payez une fois, vous utilisez vos appels. Le plan Croissance est un abonnement mensuel résiliable à tout moment, sans frais de résiliation ni période d\'engagement.' },
  ];

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Service Navigation Bar ── (renvoie vers les sections internes) */}
      <div className="bg-gray-950 text-white text-center py-2 text-[13px] font-medium fixed top-0 w-full z-[60]">
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <a href="#impact-avis" className="opacity-70 hover:opacity-100 transition-opacity">Impact Avis</a>
          <span className="opacity-20">|</span>
          <span className="text-emerald-400 font-semibold">IA Vocale</span>
          <span className="opacity-20">|</span>
          <a href="#paiements" className="opacity-70 hover:opacity-100 transition-opacity">Accélération de paiements</a>
        </div>
      </div>

      {/* ============================================ */}
      {/* NAVBAR                                       */}
      {/* ============================================ */}
      <nav className={`fixed top-8 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
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

          <div className="hidden md:block">
            <a
              href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-200"
            >
              Essai gratuit <ArrowRight className="w-4 h-4" />
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

              <h1 className="hero-fade hero-fade-2 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Gagnez du temps.{' '}
                <GradientText>Gagnez des clients.</GradientText>
              </h1>

              <p className="hero-fade hero-fade-3 mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl">
                L’IA qui relance vos clients, confirme vos RDV, décroche quand vous êtes occupé et qualifie chaque prospect — 7j/7, 24h/24. Zéro appel perdu, zéro temps perdu.
              </p>

              <div className="hero-fade hero-fade-4 mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="#" onClick={(e) => { e.preventDefault(); openPopup('cta', 'gratuit'); }}
                  className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 rounded-full hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-200"
                >
                  Essayer gratuitement — 100 appels offerts <ArrowRight className="w-5 h-5" />
                </a>
              </div>

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

      {/* ── Quatre services. Un seul outil. ── */}
      <section className="py-32 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Nos services"
            title="6 services. Une seule plateforme."
            subtitle="La base : la Réception d'appels IA 24/7. En plus, 5 modules à activer selon vos besoins — tous inclus dès l'essai gratuit."
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
                ctaBg: 'bg-gray-900 hover:bg-gray-800',
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
                ctaBg: 'bg-gray-900 hover:bg-gray-800',
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
                  <CalendarCheck className="w-4 h-4" />
                  Réserver un appel découverte
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
                  <CalendarCheck className="w-4 h-4" />
                  Réserver un appel découverte
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
                className="relative h-full bg-white rounded-[28px] border border-orange-200/60 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-orange-900/[0.06] transition-all duration-500 scroll-mt-24"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <Star className="w-8 h-8 text-white" strokeWidth={1.5} fill="white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-100">Réputation</span>
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">Impact Avis</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">L'IA appelle vos clients satisfaits, leur demande leur ressenti et leur envoie le lien direct vers Google Avis par SMS. Plus d'avis 5 étoiles, sans relancer une seule personne à la main.</p>
                <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                  {['Appel post-prestation', 'Filtrage 4★+ uniquement', 'Lien Google par SMS', 'Tirage mensuel'].map((d, j) => (
                    <span key={j} className="text-xs font-semibold text-orange-700 bg-orange-50 rounded-full px-4 py-2 border border-orange-100">{d}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openPopup('card-impact-avis', 'gratuit')}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
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
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">L'IA relance vos impayés avec finesse, qualifie chaque dossier (promesse, litige, injoignable) et envoie au débiteur un lien de paiement Stripe en 1 clic — carte, Klarna 3× ou Billie 30 jours.</p>
                <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                  {['Appel + transcription IA', 'Lien Stripe en 1 clic', 'Klarna & Billie inclus', 'Mise en demeure auto'].map((d, j) => (
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
      {/* USE CASES BY PROFESSION                      */}
      {/* ============================================ */}
      <section id="usecases" className="py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Cas d'usage"
            title="Votre métier. Votre IA."
            subtitle="Découvrez comment nos 4 services IA s'adaptent à votre quotidien — et combien vous allez gagner."
          />

          <MetierSelector openPopup={openPopup} />
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

      {/* TESTIMONIALS                                 */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Témoignages"
            title="Ils utilisent BoosterPay."
            subtitle="Des professionnels comme vous qui ont automatisé leurs relances et confirmations."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="bg-white rounded-2xl border border-gray-100 p-8 h-full flex flex-col">
                  <p className="text-gray-600 leading-relaxed flex-1">“{t.quote}”</p>
                  <div className="h-px bg-gray-100 my-6" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORT & DATA INJECTION                      */}
      {/* ============================================ */}
      <section id="import" className="py-24 md:py-32 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            tag="Renouvellement & Confirmation RDV"
            title="Activez votre boost gratuit."
            subtitle="100 appels offerts pour vos relances de dossiers et confirmations de RDV. Importez vos contacts, l'IA appelle pour vous."
          />

          {/* Service badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 -mt-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
              <RefreshCw className="w-4 h-4" /> Renouvellement de dossiers
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
              <CalendarCheck className="w-4 h-4" /> Confirmation de RDV
            </span>
          </div>

          {/* Multi-step overlay: info → plan → redirect */}
          <AnimatePresence>
            {(importState === 'info' || importState === 'plan' || importState === 'redirecting') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
              >
                {/* Step: Info (société + email) */}
                {importState === 'info' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], damping: 20 }}
                    className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                      className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Données reçues !</h3>
                    <p className="text-gray-500 mb-6 text-center">Plus qu'une étape : dites-nous qui vous êtes.</p>
                    <form onSubmit={handleInfoSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la société</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex: Garage Martin"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Votre email</label>
                        <input
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="votre@email.fr"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                      >
                        Continuer
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Step: Plan selection */}
                {importState === 'plan' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], damping: 20 }}
                    className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Choisissez votre plan</h3>
                    <p className="text-gray-500 mb-8 text-center">Sélectionnez l'offre adaptée à vos besoins.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {IA_VOCALE_PLANS.map((plan) => (
                        <motion.button
                          key={plan.id}
                          whileHover={{ y: -4 }}
                          onClick={() => handlePlanSelect(plan.id)}
                          className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                            plan.badge
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                          }`}
                        >
                          {plan.badge && (
                            <span className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              {plan.badge}
                            </span>
                          )}
                          <div className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">{plan.name}</div>
                          <div className="text-xs text-gray-500">{plan.desc}</div>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-[13px] text-gray-400 text-center mt-6 leading-relaxed max-w-md mx-auto">
                      La formule choisie sera activée à la fin de votre essai gratuit. Vous serez notifié à 80% de votre essai. Transparence totale, aucune surprise.
                    </p>
                  </motion.div>
                )}

                {/* Step: Redirecting */}
                {importState === 'redirecting' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], damping: 20 }}
                    className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                      className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Félicitations !</h3>
                    <p className="text-gray-500 mb-4">Redirection vers la vérification de carte sécurisée...</p>
                    <p className="text-xs text-gray-400 mb-6">Un prélèvement de 0,50€ HT sera effectué pour vérifier votre carte, puis remboursé sous quelques minutes.</p>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400">
                      <p>Redirection dans <span className="font-bold text-emerald-600 text-lg">{countdown}</span>...</p>
                      <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 3, ease: 'linear' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploading overlay */}
          <AnimatePresence>
            {importState === 'uploading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-600 rounded-full mb-6"
                  />
                  <p className="text-lg font-semibold text-gray-900">Envoi en cours...</p>
                  <p className="text-sm text-gray-400 mt-2">Préparation de vos appels gratuits</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import card */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-emerald-900/5 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {[
                  { key: 'manual', label: 'Ajout manuel', icon: UserPlus },
                  { key: 'csv', label: 'Import CSV', icon: FileSpreadsheet },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setImportTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                      importTab === tab.key
                        ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                {/* CSV Tab */}
                {importTab === 'csv' && (
                  <div>
                    <div
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? 'border-emerald-400 bg-emerald-50'
                          : csvData
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={(e) => handleCsvFile(e.target.files?.[0])}
                      />

                      {csvData ? (
                        <div>
                          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                          <p className="text-lg font-semibold text-gray-900">{csvFileName}</p>
                          <p className="text-sm text-emerald-600 mt-1">{csvData.length} contacts détectés</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-lg font-semibold text-gray-700">Glissez votre fichier ici</p>
                          <p className="text-sm text-gray-400 mt-1">ou cliquez pour parcourir — CSV, XLSX</p>
                        </div>
                      )}
                    </div>

                    {/* CSV Export Help */}
                    <div className="mt-4">
                      <button
                        onClick={() => setCsvHelpOpen(!csvHelpOpen)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Comment exporter en CSV ?</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${csvHelpOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {csvHelpOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileSpreadsheet className="w-4 h-4 text-green-700" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">Microsoft Excel</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Fichier → Enregistrer sous → Format : CSV UTF-8 (délimité par des virgules)</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">Google Sheets</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Fichier → Télécharger → Valeurs séparées par des virgules (.csv)</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">Numbers (Mac)</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Fichier → Exporter vers → CSV</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Wrench className="w-4 h-4 text-amber-700" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">Logiciel métier</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Cherchez « Export » ou « Télécharger » dans votre outil. La plupart proposent un export CSV ou Excel.</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* CSV Column Mapping */}
                    {csvData && csvData.length > 0 && !csvMappingConfirmed && (
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-1">Associez vos colonnes</h4>
                        <p className="text-xs text-gray-400 mb-4">Indiquez quelle colonne correspond à chaque champ requis.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: 'nom', label: 'Nom', required: true },
                            { key: 'telephone', label: 'Téléphone', required: true },
                            { key: 'dateRdv', label: 'Date RDV', required: false },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                {field.label} {field.required ? <span className="text-red-400">*</span> : <span className="text-gray-300">(facultatif)</span>}
                              </label>
                              <select
                                value={csvMapping[field.key]}
                                onChange={(e) => setCsvMapping((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
                              >
                                <option value="">-- Sélectionner --</option>
                                {csvHeaders.map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>

                        {/* Preview first 3 rows with mapping */}
                        {csvMapping.nom && csvMapping.telephone && (
                          <div className="mt-4 overflow-x-auto">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Aperçu (3 premières lignes)</p>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Nom</th>
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Téléphone</th>
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Date RDV</th>
                                </tr>
                              </thead>
                              <tbody>
                                {csvData.slice(0, 3).map((row, i) => (
                                  <tr key={i} className="border-b border-gray-50">
                                    <td className="py-2 px-3 text-gray-700 font-medium">{row[csvMapping.nom] || '—'}</td>
                                    <td className="py-2 px-3 text-gray-600">{row[csvMapping.telephone] || '—'}</td>
                                    <td className="py-2 px-3 text-gray-600">{csvMapping.dateRdv ? (row[csvMapping.dateRdv] || '—') : '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {csvData && csvMapping.telephone && csvData.some(r => r[csvMapping.telephone] && !isMobileFR(r[csvMapping.telephone])) && (
                          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                            <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>Certains numéros sont des fixes. L'IA appellera sur le fixe directement.</span>
                          </div>
                        )}

                        <button
                          onClick={() => setCsvMappingConfirmed(true)}
                          disabled={!csvMapping.nom || !csvMapping.telephone}
                          className="w-full mt-4 py-3 rounded-xl text-white font-semibold bg-gray-900 hover:bg-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                          Valider le mapping
                        </button>
                      </div>
                    )}

                    {/* Confirmed mapping summary + submit */}
                    {csvData && csvMappingConfirmed && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-semibold text-gray-800">{csvData.length} contacts prêts</span>
                          <button onClick={() => setCsvMappingConfirmed(false)} className="ml-auto text-xs text-emerald-600 hover:text-emerald-700 font-medium">Modifier le mapping</button>
                        </div>
                        {/* Service type selector */}
                        <div className="mt-4 mb-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-1">Ce fichier concerne...</h4>
                          <p className="text-xs text-gray-400 mb-3">Choisissez le type de service pour tous les contacts</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => setServiceType('renouvellement')}
                              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                                serviceType === 'renouvellement'
                                  ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10'
                                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                serviceType === 'renouvellement' ? 'bg-emerald-100' : 'bg-gray-100'
                              }`}>
                                <RefreshCw className={`w-5 h-5 ${serviceType === 'renouvellement' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className={`font-semibold text-sm ${serviceType === 'renouvellement' ? 'text-emerald-700' : 'text-gray-800'}`}>Renouvellement de dossiers</p>
                                <p className="text-xs text-gray-400 mt-0.5">Relance des dossiers arrivant à échéance</p>
                              </div>
                            </button>
                            <button
                              onClick={() => setServiceType('confirmation')}
                              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                                serviceType === 'confirmation'
                                  ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10'
                                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                serviceType === 'confirmation' ? 'bg-emerald-100' : 'bg-gray-100'
                              }`}>
                                <CalendarCheck className={`w-5 h-5 ${serviceType === 'confirmation' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className={`font-semibold text-sm ${serviceType === 'confirmation' ? 'text-emerald-700' : 'text-gray-800'}`}>Confirmation de RDV</p>
                                <p className="text-xs text-gray-400 mt-0.5">Appel J-1 pour confirmer les rendez-vous</p>
                              </div>
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={handleSubmit}
                          disabled={importState !== 'idle' || !serviceType}
                          className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.01] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          Lancer mes 100 appels gratuits
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Tab */}
                {importTab === 'manual' && (
                  <div>
                    {manualRows.some(r => r.telephone && !isMobileFR(r.telephone)) && (
                      <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>Certains numéros sont des fixes. L'IA appellera sur le fixe directement.</span>
                      </div>
                    )}
                    <div className="space-y-4">
                      {manualRows.map((row, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                        >
                          <div className="sm:col-span-4">
                            {idx === 0 && <label className="block text-xs font-semibold text-gray-500 mb-1">Prénom client</label>}
                            <input
                              type="text"
                              value={row.prenom}
                              onChange={(e) => updateRow(idx, 'prenom', e.target.value)}
                              placeholder="Jean"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            {idx === 0 && <label className="block text-xs font-semibold text-gray-500 mb-1">Téléphone</label>}
                            <input
                              type="tel"
                              value={row.telephone}
                              onChange={(e) => updateRow(idx, 'telephone', e.target.value)}
                              placeholder="06 12 34 56 78"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            {idx === 0 && <label className="block text-xs font-semibold text-gray-500 mb-1">Date RDV</label>}
                            <input
                              type="date"
                              value={row.dateRdv}
                              onChange={(e) => updateRow(idx, 'dateRdv', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-center">
                            <button
                              onClick={() => removeRow(idx)}
                              disabled={manualRows.length <= 1}
                              className="p-2.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={addRow}
                      className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Ajouter un contact
                    </button>
                    {/* Service type selector */}
                    <div className="mt-6 mb-2">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">Ce fichier concerne...</h4>
                      <p className="text-xs text-gray-400 mb-3">Choisissez le type de service pour tous les contacts</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => setServiceType('renouvellement')}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                            serviceType === 'renouvellement'
                              ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            serviceType === 'renouvellement' ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <RefreshCw className={`w-5 h-5 ${serviceType === 'renouvellement' ? 'text-emerald-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${serviceType === 'renouvellement' ? 'text-emerald-700' : 'text-gray-800'}`}>Renouvellement de dossiers</p>
                            <p className="text-xs text-gray-400 mt-0.5">Relance des dossiers arrivant à échéance</p>
                          </div>
                        </button>
                        <button
                          onClick={() => setServiceType('confirmation')}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                            serviceType === 'confirmation'
                              ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            serviceType === 'confirmation' ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <CalendarCheck className={`w-5 h-5 ${serviceType === 'confirmation' ? 'text-emerald-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${serviceType === 'confirmation' ? 'text-emerald-700' : 'text-gray-800'}`}>Confirmation de RDV</p>
                            <p className="text-xs text-gray-400 mt-0.5">Appel J-1 pour confirmer les rendez-vous</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={manualRows.every((r) => !r.prenom || !r.telephone) || importState !== 'idle' || !serviceType}
                      className="w-full mt-6 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.01] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Lancer mes 100 appels gratuits
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PRICING                                      */}
      {/* ============================================ */}
      <section id="pricing" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Tarifs"
            title="Une seule plateforme. Tous les modules. Toujours inclus."
            subtitle="Le commerce local moyen consomme 130 appels par mois. Choisissez le plan qui vous donne 4× cette marge — vous ne stressez jamais le quota."
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
                      {plan.annualNote && pricingAnnual && (
                        <p className="text-[11.5px] text-emerald-700/80 font-medium mt-0.5">{plan.annualNote}</p>
                      )}
                    </div>
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
                L'IA vocale qui renouvelle vos dossiers et sécurise vos rendez-vous. Automatiquement.
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
