import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  Shield,
  Phone,
  Upload,
  Check,
  Star,
  ArrowRight,
  Lock,
  Heart,
  ChevronRight,
  Zap,
  BarChart3,
  FileSpreadsheet,
  UserPlus,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  Award,
  TrendingUp,
  Play,
  Users,
  Download,
} from 'lucide-react';
import Papa from 'papaparse';
import { submitLead } from '../services/leadService';

// ==================== DESIGN SYSTEM ====================
const ease = [0.22, 1, 0.36, 1];
const spring = { type: 'spring', stiffness: 300, damping: 30 };
const STRIPE_URL = 'https://buy.stripe.com/14A00l1FQ60vdTi8JIf3a01';

const SectionBadge = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6"
  >
    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
    <span className="text-[13px] font-semibold text-indigo-700 tracking-wide">{children}</span>
  </motion.div>
);

const SectionTitle = ({ children, className = '' }) => (
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, ease }}
    className={`text-4xl md:text-[56px] font-extrabold text-gray-900 tracking-tight leading-[1.08] ${className}`}
  >
    {children}
  </motion.h2>
);

const SectionSub = ({ children, className = '' }) => (
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1, duration: 0.6, ease }}
    className={`text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed mt-5 ${className}`}
  >
    {children}
  </motion.p>
);

// Animated counter
const AnimatedCounter = ({ end, suffix = '', prefix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={nodeRef}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  );
};

// Confetti particle
const ConfettiParticle = ({ delay, x, color }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{ backgroundColor: color, left: `${x}%`, top: '50%' }}
    initial={{ opacity: 1, y: 0, scale: 1 }}
    animate={{
      opacity: [1, 1, 0],
      y: [0, -120 - Math.random() * 100, -200],
      x: [0, (Math.random() - 0.5) * 150],
      scale: [1, 1.2, 0.5],
      rotate: [0, Math.random() * 360],
    }}
    transition={{ duration: 1.8, delay, ease: 'easeOut' }}
  />
);

// ==================== ANNOUNCEMENT BAR ====================
const AnnouncementBar = () => (
  <div className="bg-gray-900 text-white text-center py-2.5 text-[13px] font-medium fixed top-0 w-full z-50">
    <span className="opacity-80">+2 340 commerces utilisent Impact-Avis IA</span>
    <span className="mx-2 opacity-30">|</span>
    <a href="#import" className="text-indigo-300 hover:text-indigo-200 transition-colors font-semibold">
      10 avis offerts <ChevronRight className="w-3 h-3 inline" />
    </a>
  </div>
);

// ==================== NAVBAR ====================
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (v) => setScrolled(v > 20));
  }, [scrollY]);

  const navLinks = [
    { label: 'Fonctionnalites', href: '#features' },
    { label: 'Comment ca marche', href: '#how-it-works' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      className={`fixed top-[38px] left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-gray-100/50'
          : 'bg-transparent'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-1 font-bold text-xl">
          <span className="text-gray-900">Booster</span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pay</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <motion.a
            href="#import"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Essai gratuit <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 pb-6"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-3 text-[15px] font-medium text-gray-700 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#import"
              className="mt-4 block text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-3 rounded-full text-[14px] font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Essai gratuit
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ==================== HERO SECTION ====================
const HeroSection = () => {
  const [rating, setRating] = useState(3.8);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setRating((prev) => {
          if (prev >= 4.8) {
            clearInterval(interval);
            return 4.8;
          }
          return Math.round((prev + 0.05) * 100) / 100;
        });
      }, 60);
      return () => clearInterval(interval);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const stars = Math.round(rating);

  return (
    <section className="relative pt-[140px] pb-20 px-6 lg:px-8 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] opacity-[0.07] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #818cf8, transparent 60%)' }} />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <SectionBadge>+2 340 commerces nous font confiance</SectionBadge>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.05] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              Vos avis Google{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                sur pilote automatique
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-500 leading-relaxed max-w-lg mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              Notre IA appelle vos clients, collecte des avis 5 etoiles et les publie sur Google.
              Zero effort. Resultats en 48h.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
            >
              <motion.a
                href="#import"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-full text-[16px] font-bold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Recuperer mes 10 avis offerts <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-full text-[16px] font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="w-4 h-4" /> Voir comment ca marche
              </motion.a>
            </motion.div>
          </div>

          {/* Right - Hero visual: Google Business Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, ease }}
          >
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-8 max-w-md mx-auto">
              {/* Google Business card header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                  G
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Votre Commerce</h3>
                  <p className="text-sm text-gray-500">Google Business Profile</p>
                </div>
              </div>

              {/* Rating display */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-5">
                <div className="flex items-baseline gap-3 mb-2">
                  <motion.span
                    className="text-5xl font-extrabold text-gray-900"
                    key={rating.toFixed(1)}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                  >
                    {rating.toFixed(1)}
                  </motion.span>
                  <span className="text-lg text-gray-400">/5</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-6 h-6 transition-colors duration-300 ${
                        s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">Base sur 847 avis</p>
              </div>

              {/* Recent reviews preview */}
              <div className="space-y-3">
                {[
                  { name: 'Sophie L.', text: 'Service impeccable, je recommande!', stars: 5 },
                  { name: 'Marc D.', text: 'Tres professionnel, merci!', stars: 5 },
                ].map((review, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.4, duration: 0.5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {review.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                        <div className="flex gap-0.5">
                          {[...Array(review.stars)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{review.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-green-500/30"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, type: 'spring', stiffness: 400, damping: 15 }}
              >
                +312% d&apos;avis
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease }}
        >
          {[
            { value: 312, suffix: '%', label: "d'avis en 30j", prefix: '+' },
            { value: 4.8, suffix: '/5', label: 'Note moyenne', decimals: 1 },
            { value: 48, suffix: 'h', label: 'Resultats en' },
            { value: 97, suffix: '%', label: 'Satisfaction' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} decimals={stat.decimals || 0} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FEATURES SECTION ====================
const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Bouclier anti-avis negatif',
      description:
        'Intercepte automatiquement les avis 1, 2 et 3 etoiles avant publication. Vous les recevez en prive pour les gerer. Seuls les 4 et 5 etoiles apparaissent sur Google.',
      gradient: 'from-rose-500 to-orange-500',
      bgGradient: 'from-rose-50 to-orange-50',
    },
    {
      icon: Phone,
      title: 'IA vocale indetectable',
      description:
        "94% des clients pensent parler a un humain. L'IA appelle naturellement vos clients, se presente au nom de votre commerce et collecte un avis en 90 secondes.",
      gradient: 'from-indigo-500 to-violet-500',
      bgGradient: 'from-indigo-50 to-violet-50',
    },
    {
      icon: Upload,
      title: 'Import en 30 secondes',
      description:
        'Glissez-deposez votre fichier CSV ou ajoutez vos contacts manuellement. Zero configuration, zero prise de tete. Tout est automatique.',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
  ];

  return (
    <section id="features" className="py-28 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <SectionBadge>Tout pour dominer Google</SectionBadge>
          <SectionTitle className="mx-auto text-center">
            Un seul outil.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Trois armes redoutables.
            </span>
          </SectionTitle>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              whileHover={{ y: -4 }}
            >
              {/* Gradient border on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
                }} />

              <div className="relative z-10">
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={spring}
                >
                  <feature.icon className={`w-7 h-7 bg-gradient-to-r ${feature.gradient} bg-clip-text`}
                    style={{ color: feature.gradient.includes('rose') ? '#f43f5e' : feature.gradient.includes('indigo') ? '#6366f1' : '#10b981' }} />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== HOW IT WORKS ====================
const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      icon: FileSpreadsheet,
      title: 'Importez vos contacts',
      description: 'Glissez votre fichier CSV ou ajoutez vos clients manuellement. 30 secondes chrono.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      step: '02',
      icon: Phone,
      title: "L'IA appelle vos clients",
      description: "Notre IA vocale contacte chaque client naturellement, se presente et demande un avis.",
      color: 'from-indigo-500 to-violet-600',
    },
    {
      step: '03',
      icon: Star,
      title: 'Les avis 5 etoiles tombent',
      description: "Les avis positifs sont publies sur Google. Les negatifs sont interceptes et geres en prive.",
      color: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <SectionBadge>Comment ca marche</SectionBadge>
          <SectionTitle className="mx-auto text-center">
            3 etapes.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Zero effort.
            </span>
          </SectionTitle>
          <SectionSub className="mx-auto text-center">
            De l&apos;import de vos contacts aux avis 5 etoiles sur Google, tout est automatise.
          </SectionSub>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-[16.66%] right-[16.66%] h-[2px]">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-200 via-indigo-300 to-violet-200 rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6, ease }}
              >
                <motion.div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={spring}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </motion.div>

                <div className="text-xs font-bold text-indigo-400 tracking-widest mb-3">
                  ETAPE {step.step}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== IMPORT SECTION ====================
const ImportSection = () => {
  const [activeTab, setActiveTab] = useState('csv');
  const [flowState, setFlowState] = useState('idle'); // idle | uploading | success | redirecting
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [manualRows, setManualRows] = useState([
    { prenom: '', nom: '', telephone: '', email: '' },
  ]);
  const fileInputRef = useRef(null);

  // Countdown and redirect
  useEffect(() => {
    if (flowState !== 'redirecting') return;
    if (countdown <= 0) {
      window.location.href = STRIPE_URL;
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [flowState, countdown]);

  const handleFileUpload = useCallback((file) => {
    if (!file) return;
    setCsvFileName(file.name);
    setFlowState('uploading');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.slice(0, 50).map((row) => ({
          prenom: row.prenom || row.Prenom || row.firstName || row['First Name'] || row.first_name || '',
          nom: row.nom || row.Nom || row.lastName || row['Last Name'] || row.last_name || '',
          telephone: row.telephone || row.Telephone || row.phone || row.Phone || row.tel || '',
          email: row.email || row.Email || row.mail || row.Mail || '',
        }));
        setCsvData(rows);
        setFlowState('idle');
      },
      error: () => {
        setFlowState('idle');
      },
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const addManualRow = () => {
    setManualRows((prev) => [...prev, { prenom: '', nom: '', telephone: '', email: '' }]);
  };

  const removeManualRow = (index) => {
    if (manualRows.length <= 1) return;
    setManualRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateManualRow = (index, field, value) => {
    setManualRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = async () => {
    setFlowState('uploading');
    const contacts = activeTab === 'csv' ? csvData : manualRows.filter((r) => r.telephone || r.email);

    try {
      for (const contact of contacts) {
        await submitLead({
          email: contact.email,
          phone: contact.telephone,
          source: 'impact-avis-import',
          estimation: 0,
          factures_mois: 0,
          montant_moyen: 0,
        });
      }
    } catch (err) {
      // Non-blocking
    }

    setFlowState('success');
    setTimeout(() => {
      setFlowState('redirecting');
      setCountdown(3);
    }, 2000);
  };

  const hasData = activeTab === 'csv' ? csvData.length > 0 : manualRows.some((r) => r.telephone || r.email);

  // Confetti colors
  const confettiColors = ['#6366f1', '#8b5cf6', '#a78bfa', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];

  return (
    <section id="import" className="py-28 px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 60%)' }} />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 60%)' }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <SectionBadge>Commencez maintenant</SectionBadge>
          <SectionTitle className="mx-auto text-center">
            Commencez maintenant{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              — c&apos;est gratuit
            </span>
          </SectionTitle>
          <SectionSub className="mx-auto text-center">
            Importez vos contacts et recevez vos 10 premiers avis offerts.
          </SectionSub>
        </div>

        <AnimatePresence mode="wait">
          {(flowState === 'success' || flowState === 'redirecting') ? (
            <motion.div
              key="success"
              className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 border border-gray-100 p-12 text-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Confetti */}
              {confettiColors.flatMap((color, ci) =>
                [10, 25, 40, 55, 70, 85].map((x, xi) => (
                  <ConfettiParticle key={`${ci}-${xi}`} delay={ci * 0.05 + xi * 0.03} x={x + Math.random() * 10} color={color} />
                ))
              )}

              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h3
                className="text-3xl font-extrabold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Felicitations !
              </motion.h3>

              <motion.p
                className="text-lg text-gray-500 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Vos donnees ont ete envoyees avec succes.
              </motion.p>

              {flowState === 'redirecting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-indigo-600 font-semibold text-lg mb-2">
                    Redirection vers le paiement dans{' '}
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">
                      {countdown}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">Vous allez etre redirige automatiquement...</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="bg-white rounded-3xl shadow-2xl shadow-gray-100/60 border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'csv', label: 'Import CSV', icon: FileSpreadsheet },
                  { id: 'manual', label: 'Ajout manuel', icon: UserPlus },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-semibold transition-all relative ${
                      activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon className="w-4.5 h-4.5" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500"
                        layoutId="activeTab"
                        transition={spring}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'csv' ? (
                    <motion.div
                      key="csv"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Drop zone */}
                      <div
                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                          dragActive
                            ? 'border-indigo-400 bg-indigo-50/50'
                            : csvData.length > 0
                            ? 'border-green-300 bg-green-50/30'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".csv,.xlsx"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                        />

                        {flowState === 'uploading' ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Analyse en cours...</p>
                          </div>
                        ) : csvData.length > 0 ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                              <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{csvFileName}</p>
                              <p className="text-sm text-gray-500">{csvData.length} contacts importes</p>
                            </div>
                            <p className="text-xs text-indigo-500 font-medium">Cliquez pour changer de fichier</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                              <Download className="w-7 h-7 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-[15px] font-semibold text-gray-900">
                                Glissez votre fichier ici
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                ou cliquez pour parcourir &middot; CSV, XLSX
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CSV preview */}
                      {csvData.length > 0 && (
                        <motion.div
                          className="mt-6 rounded-2xl border border-gray-100 overflow-hidden"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="overflow-x-auto max-h-48">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                  <th className="px-4 py-3 text-left">Prenom</th>
                                  <th className="px-4 py-3 text-left">Nom</th>
                                  <th className="px-4 py-3 text-left">Telephone</th>
                                  <th className="px-4 py-3 text-left">Email</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {csvData.slice(0, 5).map((row, i) => (
                                  <tr key={i} className="text-gray-700">
                                    <td className="px-4 py-2.5">{row.prenom}</td>
                                    <td className="px-4 py-2.5">{row.nom}</td>
                                    <td className="px-4 py-2.5">{row.telephone}</td>
                                    <td className="px-4 py-2.5">{row.email}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {csvData.length > 5 && (
                            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 text-center">
                              +{csvData.length - 5} contacts supplementaires
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-3">
                        {manualRows.map((row, i) => (
                          <motion.div
                            key={i}
                            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <input
                              type="text"
                              placeholder="Prenom"
                              value={row.prenom}
                              onChange={(e) => updateManualRow(i, 'prenom', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                            <input
                              type="text"
                              placeholder="Nom"
                              value={row.nom}
                              onChange={(e) => updateManualRow(i, 'nom', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                            <input
                              type="tel"
                              placeholder="Telephone"
                              value={row.telephone}
                              onChange={(e) => updateManualRow(i, 'telephone', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={row.email}
                              onChange={(e) => updateManualRow(i, 'email', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                            <button
                              onClick={() => removeManualRow(i)}
                              className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                              disabled={manualRows.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      <button
                        onClick={addManualRow}
                        className="mt-4 flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Ajouter un contact
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!hasData || flowState === 'uploading'}
                  className={`w-full mt-8 py-4 rounded-2xl text-white font-bold text-[16px] flex items-center justify-center gap-2 transition-all ${
                    hasData
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30'
                      : 'bg-gray-200 cursor-not-allowed text-gray-400'
                  }`}
                  whileHover={hasData ? { scale: 1.01 } : {}}
                  whileTap={hasData ? { scale: 0.98 } : {}}
                >
                  {flowState === 'uploading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" /> Lancer mes 10 avis gratuits
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" /> Donnees securisees &middot; Conforme RGPD
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// ==================== TESTIMONIALS ====================
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Marie Duval',
      business: 'Restaurant Le Provencal',
      type: 'Restaurant',
      quote:
        "En 3 semaines, on est passe de 3.6 a 4.7 sur Google. L'IA est bluffante, mes clients pensent parler a ma receptionniste.",
      metric: '+47 avis en 30 jours',
      avatar: 'M',
    },
    {
      name: 'Thomas Petit',
      business: 'Garage Auto Service',
      type: 'Garage automobile',
      quote:
        "J'avais 12 avis en 3 ans. Avec Impact-Avis, j'en ai recu 38 en un mois. Mon telephone n'arrete plus de sonner.",
      metric: 'De 12 a 50 avis',
      avatar: 'T',
    },
    {
      name: 'Sophie Martin',
      business: 'Salon Beaute & Zen',
      type: 'Salon de beaute',
      quote:
        "Le bouclier anti-avis negatifs m'a sauve 2 fois. Une cliente mecontente a ete redirigee en prive. Ma note n'a pas bouge.",
      metric: 'Note 4.9 maintenue',
      avatar: 'S',
    },
  ];

  return (
    <section className="py-28 px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Temoignages</SectionBadge>
          <SectionTitle className="mx-auto text-center">
            Ils ont transforme{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              leur reputation
            </span>
          </SectionTitle>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              whileHover={{ y: -4 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Metric badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                {t.metric}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.type}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== PRICING ====================
const PricingSection = () => {
  const plans = [
    {
      name: "L'Essentiel",
      popular: true,
      price: '49',
      unit: 'HT/mois',
      description: 'Tout ce qu\'il faut pour dominer Google. Sans limites.',
      features: [
        'Appels IA illimites',
        'Bouclier anti-avis negatifs',
        'Dashboard en temps reel',
        'Support prioritaire',
        '10 avis offerts au demarrage',
        'Import CSV illimite',
      ],
    },
    {
      name: 'Au Succes',
      popular: false,
      price: '69',
      unit: 'HT / 15 avis',
      description: 'Payez au resultat. Zero engagement, zero risque.',
      features: [
        'Facturation a l\'avis',
        'Bouclier anti-avis negatifs',
        'Dashboard en temps reel',
        'Support prioritaire',
        'Sans engagement',
        'Annulation en 1 clic',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-28 px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <SectionBadge>Tarifs</SectionBadge>
          <SectionTitle className="mx-auto text-center">
            Simple.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Transparent.
            </span>
          </SectionTitle>
          <SectionSub className="mx-auto text-center">
            Pas de frais caches. Pas d&apos;engagement. Resultats garantis.
          </SectionSub>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-3xl p-8 transition-all duration-500 ${
                plan.popular
                  ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl shadow-gray-900/20 ring-1 ring-gray-700'
                  : 'bg-white border border-gray-200 hover:shadow-xl hover:shadow-gray-100/50'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              whileHover={{ y: -4 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-indigo-500/30">
                  Le plus populaire
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-5xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}&euro;
                </span>
                <span className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.unit}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.popular ? 'bg-indigo-500/20' : 'bg-indigo-50'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.a
                href={STRIPE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center py-4 rounded-2xl font-bold text-[15px] transition-all ${
                  plan.popular
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Commencer maintenant <ArrowRight className="w-4 h-4 inline ml-1" />
              </motion.a>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-[13px] text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Paiement securise Stripe</div>
          <span className="opacity-30">|</span>
          <div>Resiliation en 1 clic</div>
          <span className="opacity-30">|</span>
          <div>Satisfait ou rembourse 30 jours</div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== FAQ ====================
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Comment l'IA passe-t-elle les appels ?",
      a: "Notre IA utilise une synthese vocale ultra-naturelle. Elle appelle vos clients du lundi au samedi, entre 9h et 20h, en se presentant au nom de votre commerce. Chaque appel est personnalise avec le prenom du client.",
    },
    {
      q: 'Que se passe-t-il si un client donne 1 etoile ?',
      a: 'Notre bouclier intercepte automatiquement tout avis 1, 2 ou 3 etoiles. Vous recevez l\'avis en prive pour pouvoir le gerer. Seuls les 4 et 5 etoiles apparaissent sur Google.',
    },
    {
      q: 'Combien de temps pour voir les premiers avis ?',
      a: 'En moyenne 48 heures. Certains clients voient leurs premiers 5 etoiles des le jour meme.',
    },
    {
      q: 'Est-ce legal ? RGPD ?',
      a: 'Entierement conforme au RGPD et a la legislation francaise. Consentements geres, chaque appel peut etre refuse.',
    },
    {
      q: 'Puis-je annuler a tout moment ?',
      a: 'Oui, en 1 clic. Sans justification, sans frais. Remboursement sous 30 jours si insatisfait.',
    },
    {
      q: 'Ca marche pour mon type de commerce ?',
      a: 'Restaurants, salons, garages, dentistes, hotels, artisans, cliniques, boutiques... Si vous accueillez des clients, Impact-Avis peut vous aider.',
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 bg-gray-50/50 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>FAQ</SectionBadge>
        <SectionTitle className="mx-auto text-center">Questions frequentes</SectionTitle>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              className="w-full px-6 py-5 text-left font-semibold text-[15px] text-gray-900 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {faq.q}
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  className="px-6 pb-5 text-[14px] text-gray-600 leading-relaxed"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ==================== FINAL CTA ====================
const FinalCTASection = () => (
  <section className="py-28 px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
    {/* Gradient orbs */}
    <div
      className="absolute top-0 left-1/4 w-[500px] h-[500px] opacity-10 pointer-events-none"
      style={{ background: 'radial-gradient(circle, #818cf8, transparent 60%)' }}
    />
    <div
      className="absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-10 pointer-events-none"
      style={{ background: 'radial-gradient(circle, #a78bfa, transparent 60%)' }}
    />

    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <motion.div
        className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Award className="w-4 h-4 text-indigo-400" />
        <span className="text-[13px] font-semibold text-indigo-300">Vos 10 premiers avis sont offerts</span>
      </motion.div>

      <motion.h2
        className="text-4xl md:text-[52px] font-extrabold text-white tracking-tight leading-[1.1] mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
      >
        Pret a transformer votre reputation Google ?
      </motion.h2>

      <motion.p
        className="text-xl text-white/60 mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        Rejoignez les 2 340+ commerces qui recoltent des avis en automatique.
      </motion.p>

      <motion.a
        href="#import"
        className="inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, ease }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        Demarrer mon essai gratuit <ArrowRight className="w-5 h-5" />
      </motion.a>

      <motion.p
        className="text-white/40 text-sm mt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        10 avis offerts &middot; Sans carte bancaire &middot; Resultats garantis sous 48h
      </motion.p>
    </div>
  </section>
);

// ==================== FOOTER ====================
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-16 px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-1 font-bold text-lg mb-4">
            <span className="text-gray-900">Booster</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Pay
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            La solution n&deg;1 de gestion d&apos;avis Google pour commerces locaux.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Services</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li>
              <Link to="/impact-avis" className="hover:text-gray-900 transition-colors">
                Impact-Avis
              </Link>
            </li>
            <li>
              <Link to="/ia-vocale" className="hover:text-gray-900 transition-colors">
                IA Vocale
              </Link>
            </li>
            <li>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">
                Tarifs
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li>
              <Link to="/mentions-legales" className="hover:text-gray-900 transition-colors">
                Mentions legales
              </Link>
            </li>
            <li>
              <Link to="/cgv" className="hover:text-gray-900 transition-colors">
                CGV
              </Link>
            </li>
            <li>
              <Link to="/politique-confidentialite" className="hover:text-gray-900 transition-colors">
                Confidentialite
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Contact</h4>
          <a
            href="mailto:support@boosterpay.fr"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            support@boosterpay.fr
          </a>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 text-center text-[13px] text-gray-400">
        &copy; 2026 BoosterPay. Made with <Heart className="w-3.5 h-3.5 inline fill-red-500 text-red-500" /> in
        France
      </div>
    </div>
  </footer>
);

// ==================== MAIN COMPONENT ====================
export default function ImpactAvisLanding() {
  return (
    <div className="bg-white min-h-screen overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ImportSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
