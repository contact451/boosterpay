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
const STRIPE_LINKS = {
  decouverte: 'https://buy.stripe.com/bJedRbfwG88D6qQ9NMf3a05',
  boost: 'https://buy.stripe.com/bJedRbfwG88D6qQ9NMf3a05',
  business: 'https://buy.stripe.com/bJedRbfwG88D6qQ9NMf3a05',
  croissance: 'https://buy.stripe.com/bJedRbfwG88D6qQ9NMf3a05',
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
/*  Hero appointment animation                                         */
/* ------------------------------------------------------------------ */
const HeroAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  const appointments = [
    { name: 'Martin D.', time: '09:00', type: 'Renouvellement' },
    { name: 'Sophie L.', time: '10:30', type: 'Confirmation RDV' },
    { name: 'Pierre B.', time: '14:00', type: 'Renouvellement' },
    { name: 'Claire M.', time: '15:30', type: 'Confirmation RDV' },
    { name: 'Lucas R.', time: '16:45', type: 'Renouvellement' },
  ];

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto" style={{ willChange: 'transform' }}>
      {/* Phone frame */}
      <div className="relative bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 pt-10 overflow-hidden" style={{ transform: 'translateZ(0)' }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6 mt-2"
        >
          <div>
            <p className="text-xs text-gray-400 font-medium">Aujourd\u2019hui</p>
            <p className="text-lg font-bold text-gray-900">Mon agenda</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        {/* Appointments — staggered with simple easing, no springs */}
        <div className="space-y-3">
          {appointments.map((apt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="text-sm font-semibold text-gray-400 w-12">{apt.time}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{apt.name}</p>
                <p className="text-xs text-gray-400">{apt.type}</p>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-emerald-600" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-6 flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span>5 confirmations automatiques</span>
        </motion.div>
      </div>

      {/* Floating badges — simpler easing, no heavy springs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2"
        style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <PhoneCall className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">100% automatique</p>
          <p className="text-[10px] text-gray-400">L\u2019IA appelle pour vous</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.4, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute -top-2 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2"
        style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      >
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">-35% de lapins</p>
          <p className="text-[10px] text-gray-400">En moyenne</p>
        </div>
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function IAVocaleLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    { value: '35', suffix: '%', prefix: '-', label: 'de lapins' },
    { value: '80', suffix: '%', label: 'renouvellements' },
    { value: '6', suffix: 'x', label: 'rentabilité', prefix: '' },
    { value: '24', suffix: 'h', label: 'opérationnel' },
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
    { icon: FileSpreadsheet, title: 'Importez vos contacts', desc: 'CSV, Excel ou saisie manuelle. En 2 minutes, vos contacts sont prêts.' },
    { icon: PhoneCall, title: 'L\'IA appelle à votre place', desc: 'Appels naturels et professionnels. Renouvellements, confirmations, relances.' },
    { icon: CalendarDays, title: 'Votre agenda se remplit', desc: 'Les RDV confirmés apparaissent. Les renouvellements sont relancés. Vous gérez, on appelle.' },
  ];

  const testimonials = [
    { name: 'Thomas R.', role: 'Garagiste, Rennes', quote: '12 clients réactivés en 1 semaine. Des contrôles techniques que j\'aurais perdus sans les relances IA.', avatar: 'T' },
    { name: 'Camille D.', role: 'Ostéopathe, Nantes', quote: 'Zéro lapin depuis que les confirmations IA sont en place. Mon planning est enfin fiable.', avatar: 'C' },
    { name: 'Marc L.', role: 'Courtier, Brest', quote: '80% de contrats renouvelés sans passer un seul appel. La rentabilité est immédiate.', avatar: 'M' },
  ];

  const pricing = [
    { name: 'Essai Découverte', price: '0', unit: '', calls: '100 appels gratuits', features: ['Import CSV', 'Appels IA naturels', 'Tableau de bord', 'Support email'], popular: false },
    { name: 'Pack Boost', price: '199', unit: 'HT', calls: '250 appels', features: ['Tout de l\'essai', 'Reporting avancé', 'Relances multi-canaux', 'Support prioritaire'], popular: false },
    { name: 'Pack Business', price: '349', unit: 'HT', calls: '500 appels', features: ['Tout du Boost', 'API & intégrations', 'Manager dédié', 'Onboarding personnalisé'], popular: true },
    { name: 'Croissance', price: '399', unit: 'HT/mois', calls: '1 000 appels/mois', features: ['Tout du Business', 'Appels illimités*', 'Priorité support 24/7', 'Compte multi-utilisateurs'], popular: false },
  ];

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

      {/* ── Service Navigation Bar ── */}
      <div className="bg-gray-950 text-white text-center py-2 text-[13px] font-medium fixed top-0 w-full z-[60]">
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <Link to="/impact-avis" className="opacity-70 hover:opacity-100 transition-opacity">Impact Avis</Link>
          <span className="opacity-20">|</span>
          <Link to="/ia-vocale" className="text-emerald-400 font-semibold">IA Vocale</Link>
          <span className="opacity-20">|</span>
          <Link to="/" className="opacity-70 hover:opacity-100 transition-opacity">Accélération de paiements</Link>
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
              href="#import"
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
                <a href="#import" onClick={() => setMobileMenuOpen(false)} className="block text-center text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 rounded-full font-semibold mt-2">
                  Essai gratuit
                </a>
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Pure CSS animations, no framer-motion overhead */}
            <div>
              <div className="hero-fade hero-fade-1">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-6">
                  <Bot className="w-4 h-4" /> IA Vocale pour professionnels
                </span>
              </div>

              <h1 className="hero-fade hero-fade-2 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Renouvelez vos dossiers et{' '}
                <GradientText>sécurisez vos RDV.</GradientText>{' '}
                Automatiquement.
              </h1>

              <p className="hero-fade hero-fade-3 mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl">
                Notre IA appelle vos clients à votre place pour relancer les renouvellements, confirmer chaque rendez-vous et supprimer les lapins.
              </p>

              <div className="hero-fade hero-fade-4 mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="#import"
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

      {/* ── Trois services. Un seul outil. ── */}
      <section className="py-32 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Nos services"
            title="Trois services. Un seul outil."
            subtitle="Chaque service s'adapte à votre métier et à vos besoins."
          />
          <div className="grid md:grid-cols-3 gap-10 mt-4">
            {[
              {
                icon: RefreshCw,
                title: 'Renouvellement de dossiers',
                desc: 'L\'IA relance automatiquement vos clients dont les dossiers arrivent à échéance. Zéro oubli, zéro effort.',
                details: ['Contrôles techniques', 'Assurances', 'Entretiens annuels', 'Bilans médicaux'],
                accentBg: 'bg-emerald-50',
                accentText: 'text-emerald-600',
                accentBorder: 'border-emerald-100',
                iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400',
                chipBg: 'bg-emerald-50',
                chipText: 'text-emerald-700',
                ctaBg: 'bg-gray-900 hover:bg-gray-800',
              },
              {
                icon: CalendarCheck,
                title: 'Confirmation de RDV',
                desc: 'L\'IA appelle la veille pour confirmer chaque rendez-vous et supprimer les lapins. Planning fiable, CA protégé.',
                details: ['Appel J-1 automatique', 'SMS de rappel', 'Gestion des reports', 'Planning mis à jour'],
                accentBg: 'bg-blue-50',
                accentText: 'text-blue-600',
                accentBorder: 'border-blue-100',
                iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
                chipBg: 'bg-blue-50',
                chipText: 'text-blue-700',
                ctaBg: 'bg-gray-900 hover:bg-gray-800',
              },
              {
                icon: Bot,
                title: 'Robot IA sur mesure',
                desc: 'On configure une IA vocale 100% adaptée à vos processus et à votre métier. Du script à l\'intégration CRM.',
                details: ['Script personnalisé', 'Voix naturelle', 'Scénarios complexes', 'Intégration CRM'],
                accentBg: 'bg-violet-50',
                accentText: 'text-violet-600',
                accentBorder: 'border-violet-100',
                iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
                chipBg: 'bg-violet-50',
                chipText: 'text-violet-700',
                ctaBg: 'bg-violet-600 hover:bg-violet-700',
                isCustom: true,
              },
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                  className="relative h-full bg-white rounded-[28px] border border-gray-100/80 p-10 flex flex-col group shadow-sm hover:shadow-2xl hover:shadow-gray-900/[0.08] transition-all duration-500"
                >
                  {/* Large icon area */}
                  <div className={`relative w-20 h-20 rounded-3xl ${service.iconBg} flex items-center justify-center mb-10 shadow-lg`}>
                    <service.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight mb-3 leading-tight">{service.title}</h3>

                  {/* Description */}
                  <p className="text-[15px] text-gray-500 leading-relaxed mb-8">{service.desc}</p>

                  {/* Detail chips */}
                  <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                    {service.details.map((d, j) => (
                      <span key={j} className={`text-xs font-semibold ${service.chipText} ${service.chipBg} rounded-full px-4 py-2 border ${service.accentBorder}`}>
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {service.isCustom ? (
                    <a
                      href="https://calendar.app.google/GHtu4ymohWhAXJTG8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2.5 ${service.ctaBg} text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Réserver un appel découverte
                    </a>
                  ) : (
                    <a
                      href="#import"
                      className={`inline-flex items-center justify-center gap-2.5 ${service.ctaBg} text-white font-semibold px-7 py-3.5 rounded-full text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}
                    >
                      Commencer gratuitement
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ============================================ */}
      {/* TWO CORE VALUE PROPS                         */}
      {/* ============================================ */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Fonctionnalités"
            title="Deux leviers. Un objectif : remplir votre agenda."
            subtitle="L'IA appelle vos clients pour renouveler leurs dossiers et confirmer leurs rendez-vous. Automatiquement."
          />

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 — Renouvellement */}
            <ScrollReveal delay={0}>
              <div className="group relative bg-white rounded-[24px] border border-gray-100/60 p-10 md:p-12 hover:shadow-2xl hover:shadow-gray-900/[0.06] transition-all duration-500 h-full">
                {/* Metric highlight */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
                    <RefreshCw className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Renouvellement de dossiers</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Relance automatique avant expiration</p>
                  </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-emerald-50/60 rounded-2xl p-4 text-center border border-emerald-100/50">
                    <div className="text-3xl font-black text-emerald-600 tracking-tight">0</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-1">Dossiers oubliés</div>
                  </div>
                  <div className="bg-emerald-50/60 rounded-2xl p-4 text-center border border-emerald-100/50">
                    <div className="text-3xl font-black text-emerald-600 tracking-tight">100%</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-1">Couverture relance</div>
                  </div>
                </div>

                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                  Importez vos dossiers clients à renouveler — l’IA appelle chaque contact pour relancer les échéances. Tout est couvert, rien ne passe entre les mailles.
                </p>

                <div className="flex flex-wrap gap-2">
                  {['Contrôles techniques', 'Assurances', 'Entretiens annuels', 'Bilans médicaux', 'Devis en attente'].map((tag) => (
                    <span key={tag} className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2 — Confirmation RDV */}
            <ScrollReveal delay={0.15}>
              <div className="group relative bg-white rounded-[24px] border border-gray-100/60 p-10 md:p-12 hover:shadow-2xl hover:shadow-gray-900/[0.06] transition-all duration-500 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <CalendarCheck className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Confirmation de RDV</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Appel automatique J-1</p>
                  </div>
                </div>

                {/* Key stat - large */}
                <div className="flex items-end gap-3 mb-8">
                  <div className="bg-blue-50/60 rounded-2xl px-6 py-4 border border-blue-100/50 flex-1 text-center">
                    <div className="text-4xl font-black text-blue-600 tracking-tight">92%</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-1">Taux de présence</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 text-center">
                    <div className="text-lg font-bold text-gray-400 line-through">57%</div>
                    <div className="text-[11px] font-medium text-gray-400 mt-1">Avant IA</div>
                  </div>
                </div>

                {/* Polished appointment animation */}
                <div className="bg-gray-50/80 rounded-2xl border border-gray-100/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-bold text-gray-800 tracking-tight">Agenda du jour</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ delay: 0.3, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full"
                    >
                      92% confirmés
                    </motion.span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { time: '09:00', name: 'Martin D.', status: 'confirmed' },
                      { time: '10:30', name: 'Sophie L.', status: 'confirmed' },
                      { time: '11:00', name: 'Pierre B.', status: 'confirmed' },
                      { time: '14:00', name: 'Claire M.', status: 'noshow' },
                      { time: '15:30', name: 'Lucas R.', status: 'confirmed' },
                    ].map((slot, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white border border-gray-100/40"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <span className="text-[11px] font-semibold text-gray-400 w-10 tabular-nums">{slot.time}</span>
                        <span className="text-[13px] font-medium text-gray-800 flex-1">{slot.name}</span>
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ delay: 0.25 + i * 0.08, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          {slot.status === 'confirmed' ? (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                              <X className="w-4 h-4 text-red-400" />
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Animated progress bar */}
                  <div className="mt-4 pt-4 border-t border-gray-100/60">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 mb-2">
                      <span>Avant IA : 57%</span>
                      <span className="text-emerald-600">Avec IA : 92%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '57%' }}
                        whileInView={{ width: '92%' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                        className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                        style={{ willChange: 'width' }}
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
      <section id="usecases" className="py-24 md:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Cas d'usage"
            title="Adapté à votre métier."
            subtitle="Quel que soit votre secteur, l'IA s'adapte à vos besoins de renouvellement et de confirmation."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-emerald-900/5 transition-shadow duration-300 h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
                    <uc.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{uc.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{uc.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS — 3 STEPS                       */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Comment ça marche"
            title="Trois étapes. Zéro friction."
            subtitle="De l'import à l'agenda rempli, tout est automatisé."
          />

          <div className="relative max-w-4xl mx-auto">
            {/* Connector line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200" />

            <div className="grid md:grid-cols-3 gap-10">
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
      {/* IMPORT & DATA INJECTION                      */}
      {/* ============================================ */}
      <section id="import" className="py-24 md:py-32 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            tag="Lancez-vous"
            title="Activez votre boost gratuit."
            subtitle="100 appels offerts. Importez vos contacts et laissez l'IA faire le reste."
          />

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
                      { icon: Star, text: 'Vous gérez, l\'IA appelle', stat: null },
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


      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* PRICING                                      */}
      {/* ============================================ */}
      <section id="pricing" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            tag="Tarifs"
            title="Simple. Transparent. Sans engagement."
            subtitle="Commencez gratuitement, évoluez quand vous le souhaitez."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className={`relative rounded-2xl border p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-emerald-300 bg-gradient-to-b from-emerald-50 to-white shadow-lg shadow-emerald-900/5'
                    : 'border-gray-100 bg-white hover:shadow-emerald-900/5'
                }`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-1 rounded-full">
                      POPULAIRE
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-emerald-600 font-medium mb-4">{plan.calls}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                    {plan.unit && <span className="text-sm text-gray-400 ml-1">{plan.unit}</span>}
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#import"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.popular
                        ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]'
                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {plan.price === '0' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                  </a>
                </div>
              </ScrollReveal>
            ))}
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
          <ScrollReveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendar.app.google/GHtu4ymohWhAXJTG8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-105 text-lg"
              >
                <CalendarCheck className="w-5 h-5" />
                Réserver un appel découverte
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">Gratuit · 15 min · Sans engagement</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================ */}
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

      {/* ============================================ */}
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
                  href="#import"
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
    </div>
  );
}
