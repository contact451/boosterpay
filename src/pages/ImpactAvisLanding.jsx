import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Papa from 'papaparse';
import {
  Menu,
  X,
  ChevronDown,
  Shield,
  AlertTriangle,
  TrendingDown,
  Users,
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
  MessageSquare,
  Eye,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  Wrench,
  Trash2,
} from 'lucide-react';
import { captureLeadFromSite } from '../services/leadService';

// ============ DESIGN SYSTEM ============
const ease = [0.22, 1, 0.36, 1];

const SectionBadge = ({ children }) => (
  <motion.div
    initial={{ opacity: 0.01, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    style={{ willChange: 'opacity, transform' }}
    className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6"
  >
    <span className="text-[13px] font-semibold text-indigo-700 tracking-wide">{children}</span>
  </motion.div>
);

const SectionTitle = ({ children, className = '' }) => (
  <motion.h2
    initial={{ opacity: 0.01, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, ease }}
    style={{ willChange: 'opacity, transform' }}
    className={`text-4xl md:text-[56px] font-extrabold text-gray-900 tracking-tight leading-[1.08] ${className}`}
  >
    {children}
  </motion.h2>
);

const SectionSub = ({ children }) => (
  <motion.p
    initial={{ opacity: 0.01, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: 0.1, duration: 0.6, ease }}
    style={{ willChange: 'opacity, transform' }}
    className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mt-5 text-center"
  >
    {children}
  </motion.p>
);

// Animated counter
const AnimatedCounter = ({ end, suffix = '', prefix = '' }) => {
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
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return <span ref={nodeRef}>{prefix}{typeof end === 'number' && end % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}{suffix}</span>;
};

// ============ SERVICE NAVIGATION BAR ============
const ServiceNavBar = () => (
  <div className="bg-gray-950 text-white text-center py-2 text-[13px] font-medium fixed top-0 w-full z-[60]">
    <div className="flex items-center justify-center gap-6 md:gap-10">
      <Link to="/impact-avis" className="text-indigo-400 font-semibold">Impact Avis</Link>
      <span className="opacity-20">|</span>
      <Link to="/ia-vocale" className="opacity-70 hover:opacity-100 transition-opacity">IA Vocale</Link>
      <span className="opacity-20">|</span>
      <Link to="/" className="opacity-70 hover:opacity-100 transition-opacity">Accélération de paiements</Link>
    </div>
  </div>
);

// ============ ANNOUNCEMENT BAR ============
const AnnouncementBar = () => (
  <div className="bg-gray-900 text-white text-center py-2.5 text-[13px] font-medium fixed top-[32px] w-full z-50">
    <span className="opacity-80">+2 340 commerces utilisent déjà Impact-Avis IA</span>
    <span className="mx-2 opacity-30">|</span>
    <a href="#tarifs" className="text-indigo-300 hover:text-indigo-200 transition-colors font-semibold">
      Voir les tarifs <ChevronRight className="w-3 h-3 inline" />
    </a>
  </div>
);

// ============ NAVBAR ============
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0.5, 0.95]);

  return (
    <nav className="fixed top-[70px] w-full z-40">
      <motion.div
        className="absolute inset-0 bg-white border-b border-gray-200/50 backdrop-blur-2xl"
        style={{ opacity: bgOpacity }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 font-bold text-xl">
          <span className="text-gray-900">Booster</span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pay</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#fonctionnalites" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
          <a href="#comment-ca-marche" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Comment ça marche</a>
          <a href="#tarifs" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
          <a href="#faq" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <motion.a
            href="#import"
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Essai gratuit
          </motion.a>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-[122px] bg-white z-30 flex flex-col items-center pt-12 gap-8"
            initial={{ opacity: 0.01, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <a href="#fonctionnalites" className="text-lg font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#comment-ca-marche" className="text-lg font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
            <a href="#tarifs" className="text-lg font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <a href="#faq" className="text-lg font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <motion.a href="#import" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold mt-4" whileTap={{ scale: 0.95 }}>
              Essai gratuit
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ============ GOOGLE CARD BEFORE/AFTER ANIMATION ============
const GoogleCardAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [phase, setPhase] = useState('before'); // 'before' | 'transitioning' | 'after'

  useEffect(() => {
    if (!isInView) return;
    const t1 = setTimeout(() => setPhase('transitioning'), 1800);
    const t2 = setTimeout(() => setPhase('after'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isInView]);

  const useAnimNum = (from, to, active, duration = 1400) => {
    const [val, setVal] = useState(from);
    useEffect(() => {
      if (!active) { setVal(from); return; }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, [active]);
    return val;
  };

  const rating = useAnimNum(3.8, 4.8, phase === 'transitioning' || phase === 'after', 1600);
  const reviews = useAnimNum(12, 247, phase === 'transitioning' || phase === 'after', 2000);
  const isAfter = phase === 'after' || phase === 'transitioning';
  const filledStars = Math.round(rating);

  const beforeReviews = [
    { stars: 3, text: "Bof, rien de sp\u00e9cial...", author: 'Paul R.', date: 'il y a 3 mois', avatar: '\ud83d\ude10' },
    { stars: 2, text: "Pas terrible, long temps d'attente.", author: 'Marc D.', date: 'il y a 5 mois', avatar: '\ud83d\ude12' },
  ];

  const afterReviews = [
    { stars: 5, text: 'Service excellent, je recommande vivement\u00a0!', author: 'Sophie M.', date: 'il y a 2 jours', avatar: '\ud83d\ude0a', isNew: true },
    { stars: 5, text: '\u00c9quipe au top, parfait de A \u00e0 Z.', author: 'Marie T.', date: 'il y a 1 jour', avatar: '\ud83e\udd29', isNew: true },
    { stars: 5, text: 'Incroyable\u00a0! Jamais vu un tel service.', author: 'Lucas B.', date: "\u00e0 l'instant", avatar: '\ud83d\udd25', isNew: true },
  ];

  return (
    <div ref={ref} className="relative" style={{ willChange: 'transform' }}>
      {/* Simplified background glow — NO blur-3xl on mobile (very expensive) */}
      <div
        className="absolute -inset-8 rounded-[40px] transition-all duration-1000 ease-out"
        style={{
          background: isAfter
            ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.10) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(239,68,68,0.06) 0%, transparent 70%)',
          opacity: 0.8,
        }}
      />

      <div
        className="relative bg-white rounded-3xl overflow-hidden transition-all duration-700 ease-out"
        style={{
          border: '1.5px solid',
          borderColor: isAfter ? 'rgba(34,197,94,0.3)' : 'rgba(229,231,235,0.8)',
          boxShadow: isAfter
            ? '0 25px 60px rgba(34,197,94,0.10), 0 8px 24px rgba(0,0,0,0.05)'
            : '0 20px 50px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
          willChange: 'border-color, box-shadow',
          transform: 'translateZ(0)',
        }}
      >
        {/* Status bar — CSS transition instead of framer motion animate */}
        <div
          className="px-6 py-2.5 flex items-center justify-between text-[12px] font-semibold transition-colors duration-700 ease-out"
          style={{
            backgroundColor: isAfter ? 'rgb(240, 253, 244)' : 'rgb(254, 242, 242)',
            color: isAfter ? 'rgb(22, 163, 74)' : 'rgb(185, 28, 28)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="transition-transform duration-300" style={{ display: 'inline-block', transform: isAfter ? 'scale(1)' : 'scale(0.8)' }}>
              {isAfter ? '\u2713' : '\u26A0'}
            </span>
            <span>{isAfter ? 'R\u00e9putation excellente' : 'R\u00e9putation \u00e0 risque'}</span>
          </div>
          <span style={{ opacity: isAfter ? 1 : 0.7 }} className="transition-opacity duration-500">
            {isAfter ? '\u2191 Top 5% local' : '\u2193 En dessous de la moyenne'}
          </span>
        </div>

        <div className="p-6">
          {/* Business info row */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden transition-all duration-800 ease-out"
              style={{
                background: isAfter
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                transform: 'translateZ(0)',
              }}
            >
              <Star className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Votre Commerce</h3>
              <p className="text-sm text-gray-400">Commerce local &middot; Ouvert</p>
            </div>
            <div className="w-20 h-14 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md relative">
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Rating + stars */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-[42px] font-black leading-none transition-colors duration-700"
                style={{ color: isAfter ? '#111827' : '#6b7280' }}
              >
                {rating.toFixed(1)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => {
                  const isFilled = i <= filledStars;
                  return (
                    <span
                      key={i}
                      className="transition-transform duration-300 ease-out inline-block"
                      style={{ transform: isFilled ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      <Star className={`w-6 h-6 transition-colors duration-400 ${isFilled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">{Math.round(reviews)} avis Google</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1500 ease-out"
                  style={{
                    width: isAfter ? '92%' : '28%',
                    backgroundColor: isAfter ? '#22c55e' : '#ef4444',
                    transform: 'translateZ(0)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2 mb-5">
            {['Itin\u00e9raire', 'Avis', 'Appeler'].map((label, i) => (
              <div key={i} className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-xl py-2 text-center text-xs font-semibold text-gray-600 border border-gray-100 transition-colors cursor-default">
                {label}
              </div>
            ))}
          </div>

          {/* Review cards — simplified transitions */}
          <div className="space-y-2.5 relative" style={{ minHeight: '180px' }}>
            <AnimatePresence mode="wait">
              {!isAfter ? (
                <motion.div key="before" className="space-y-2.5" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  {beforeReviews.map((r, i) => (
                    <motion.div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                      initial={{ opacity: 0.01, x: -15 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600">{r.author.charAt(0)}</div>
                        <span className="text-xs font-semibold text-gray-700">{r.author}</span>
                        <span className="text-[10px] text-gray-300 ml-auto">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < r.stars ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-[13px] text-gray-500 leading-snug">{r.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="after" className="space-y-2.5"
                  initial={{ opacity: 0.01, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {afterReviews.map((r, i) => (
                    <motion.div key={i}
                      className={`rounded-xl p-3.5 border ${i === 2 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}
                      initial={{ opacity: 0.01, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600">{r.author.charAt(0)}</div>
                        <span className="text-xs font-semibold text-gray-700">{r.author}</span>
                        {r.isNew && (
                          <motion.span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                          >
                            Nouveau
                          </motion.span>
                        )}
                        <span className="text-[10px] text-gray-300 ml-auto">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-[13px] text-gray-700 leading-snug font-medium">{r.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom success bar */}
          <AnimatePresence>
            {isAfter && (
              <motion.div
                className="mt-4 flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600 rotate-180" />
                  </div>
                  <span className="text-[13px] font-bold text-emerald-700">+312% d&apos;avis en 30 jours</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                  Impact-Avis IA
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top badge — AVANT / APRÈS */}
      <motion.div
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0.01, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className="px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wider shadow-lg transition-colors duration-600"
          style={{
            backgroundColor: isAfter ? '#f0fdf4' : '#fef2f2',
            color: isAfter ? '#15803d' : '#b91c1c',
            border: '1.5px solid',
            borderColor: isAfter ? '#bbf7d0' : '#fecaca',
          }}
        >
          {isAfter ? '\u2726 APR\u00c8S IMPACT-AVIS' : '\u2727 AVANT'}
        </div>
      </motion.div>
    </div>
  );
};

// ============ HERO ============// ============ HERO ============
const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="pt-52 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0.01, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[13px] font-semibold text-emerald-700">N&deg;1 de la gestion d&apos;avis en France</span>
          </div>

          <h1 className="text-[48px] lg:text-[64px] font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-6">
            Vos avis Google
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              sur pilote automatique.
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-lg mb-10 leading-relaxed">
            Notre IA appelle vos clients, récolte des avis 5 étoiles, et intercepte les mécontents avant qu&apos;ils ne nuisent à votre réputation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <motion.a
              href="#import"
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Démarrer gratuitement <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#comment-ca-marche"
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2 hover:border-gray-300 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Comment ça marche
            </motion.a>
          </div>

          <div className="flex flex-wrap gap-6 text-[14px] text-gray-500">
            {['10 avis offerts', 'Sans carte bancaire', 'Résultats sous 48h'].map((t, i) => (
              <motion.div key={i} className="flex items-center gap-2" initial={{ opacity: 0.01 }}
                animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 + i * 0.1 }}>
                <Check className="w-4 h-4 text-emerald-500" /> {t}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hero visual — Animated Before/After Google Card */}
        <motion.div
          initial={{ opacity: 0.01, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
        >
          <GoogleCardAnimation />
        </motion.div>
      </div>
    </section>
  );
};

// ============ SOCIAL PROOF ============
const SocialProofBar = () => {
  const sectors = ['Restaurants', 'Garages auto', 'Salons de coiffure', 'Dentistes', 'Hôtels', 'Artisans', 'Opticiens', 'Cliniques'];

  return (
    <section className="py-16 px-6 lg:px-8 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[13px] font-medium text-gray-400 uppercase tracking-widest mb-8">
          Ils nous font confiance
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {sectors.map((s, i) => (
            <motion.span key={i}
              className="px-4 py-2 bg-white border border-gray-200/60 rounded-full text-[13px] font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-default"
              initial={{ opacity: 0.01, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.04 }}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ STATS ============
const StatsSection = () => {
  const stats = [
    { value: 312, suffix: '%', label: "d'augmentation moyenne des avis" },
    { value: 4.8, suffix: '/5', label: 'note moyenne obtenue' },
    { value: 48, suffix: 'h', label: 'pour les premiers résultats' },
    { value: 97, suffix: '%', label: 'de clients satisfaits' },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0.01, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.08, duration: 0.6, ease }}
          >
            <div className="text-[48px] md:text-[56px] font-extrabold bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent leading-none mb-2">
              <AnimatedCounter end={s.value} suffix={s.suffix} prefix={s.value === 312 ? '+' : ''} />
            </div>
            <p className="text-[14px] text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ============ PROBLEM ============
const problemStats = [
  {
    stat: '72',
    suffix: '%',
    description: 'des clients refusent un commerce noté sous 4 étoiles.',
  },
  {
    stat: '×30',
    suffix: '',
    description: "Un seul avis négatif fait fuir jusqu'à 30 clients potentiels.",
  },
  {
    stat: '8',
    suffix: '/10',
    description: 'des clients comparent les avis avant de pousser la porte.',
  },
];

const ProblemStatCard = ({ stat, suffix, description, index }) => (
  <motion.div
    initial={{ opacity: 0.01, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ delay: index * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    className="group relative bg-white border border-gray-200 rounded-2xl p-10 md:p-12
               transition-all duration-500 ease-out
               hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1"
  >
    <div className="flex flex-col items-center text-center">
      <div className="mb-6">
        <span className="text-7xl md:text-8xl font-extrabold tracking-tighter text-black leading-none">
          {stat}
        </span>
        {suffix && (
          <span className="text-4xl md:text-5xl font-bold text-gray-400 tracking-tight">
            {suffix}
          </span>
        )}
      </div>
      <div className="w-12 h-px bg-gray-200 mb-6" />
      <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-[280px]">
        {description}
      </p>
    </div>
  </motion.div>
);

const ProblemSection = () => (
  <section className="py-32 md:py-40 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0.01, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-6">
            Le constat
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0.01, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black tracking-tight leading-[1.1] max-w-3xl mx-auto"
        >
          Vos avis Google décident
          <br />
          <span className="text-gray-300">pour vos clients.</span>
        </motion.h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {problemStats.map((item, i) => (
          <ProblemStatCard key={i} index={i} {...item} />
        ))}
      </div>
    </div>
  </section>
);

// ============ FEATURES BENTO ============
const FeaturesSection = () => (
  <section id="fonctionnalites" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <SectionBadge>Fonctionnalités</SectionBadge>
      <SectionTitle className="text-center">Tout pour dominer Google.</SectionTitle>
      <SectionSub>Un seul outil. Trois armes redoutables.</SectionSub>
    </div>

    <div className="grid md:grid-cols-4 gap-5">
      {/* Main card — Shield */}
      <motion.div
        className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-gray-900 text-white rounded-3xl p-10 flex flex-col justify-between"
        initial={{ opacity: 0.01, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease }}
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
      >
        {/* Gradient orb */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 60%)' }} />

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/10">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Le Bouclier Anti-Avis Négatifs</h3>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Les avis 1, 2 et 3 étoiles sont interceptés et redirigés vers vous en privé. Votre fiche Google reste impeccable.
          </p>

          {/* Mini mockup */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm text-white/60">Avis 2 étoiles détecté</span>
              </div>
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md">Redirigé</span>
            </div>
            <div className="h-px bg-white/10 mb-3" />
            <p className="text-xs text-white/40 italic">&quot;Déçu du temps d&apos;attente...&quot;</p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Envoyé en privé au responsable</p>
          </div>
        </div>
      </motion.div>

      {/* IA Vocale card */}
      <motion.div
        className="md:col-span-2 relative bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
        initial={{ opacity: 0.01, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.15, duration: 0.7, ease }}
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 60%)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Phone className="w-7 h-7 text-indigo-600" />
              <motion.div className="absolute inset-0 rounded-2xl border-2 border-indigo-300"
                animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">IA Vocale Indétectable</h3>
          <p className="text-gray-500 leading-relaxed mb-5">
            Conversations naturelles et humaines. 94% des clients pensent parler à une vraie personne.
          </p>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-[13px] font-bold">
            <Zap className="w-3.5 h-3.5" /> 94% taux de confusion humain/IA
          </div>
        </div>
      </motion.div>

      {/* Import card */}
      <motion.div
        className="md:col-span-2 relative bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
        initial={{ opacity: 0.01, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.3, duration: 0.7, ease }}
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
      >
        <div className="relative z-10">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="w-7 h-7 text-violet-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Import en 30 secondes</h3>
          <p className="text-gray-500 leading-relaxed">
            Glissez votre fichier de contacts. L&apos;IA fait le reste. Pas de config, pas de formation.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============ HOW IT WORKS ============
const HowItWorksSection = () => {
  const steps = [
    { num: '01', title: 'Importez vos contacts', desc: "CSV, Excel ou copier-coller. Même un simple carnet d'adresses suffit.", icon: Upload },
    { num: '02', title: "L'IA appelle vos clients", desc: "Appels personnalisés au nom de votre commerce. Chaque client se sent unique.", icon: Phone },
    { num: '03', title: "Les 5 étoiles tombent", desc: "Les mécontents sont redirigés vers vous en privé. Google ne voit que le meilleur.", icon: Star },
  ];

  return (
    <section id="comment-ca-marche" className="py-24 px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Simplicité</SectionBadge>
        <SectionTitle className="text-center">3 minutes pour tout mettre en place.</SectionTitle>
      </div>

      <div className="space-y-6">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              className="group flex items-start gap-6 bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500"
              initial={{ opacity: 0.01, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease }}
              whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg tabular-nums">{s.num}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">{s.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">{s.desc}</p>
              </div>
              <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl items-center justify-center">
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// ============ IMPORT SECTION ============
const ImportSection = () => {
  const isMobileFR = (phone) => {
    const cleaned = phone.replace(/[\s.\-()]/g, '');
    return /^(06|07|\+336|\+337|00336|00337)/.test(cleaned);
  };

  const [activeTab, setActiveTab] = useState('manual');
  const [manualRows, setManualRows] = useState([{ prenom: '', telephone: '', email: '' }]);
  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [flowState, setFlowState] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [csvMapping, setCsvMapping] = useState({});
  const [csvHeaders, setCsvHeaders] = useState([]);
  const fileInputRef = useRef(null);
  const [csvHelpOpen, setCsvHelpOpen] = useState(false);

  const addRow = () => setManualRows([...manualRows, { prenom: '', telephone: '', email: '' }]);
  const removeRow = (i) => setManualRows(manualRows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) => {
    const updated = [...manualRows];
    updated[i][field] = value;
    setManualRows(updated);
  };

  const handleFile = (file) => {
    if (!file) return;
    setCsvFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        const headers = Object.keys(results.data[0] || {});
        setCsvHeaders(headers);
        // Auto-detect obvious columns
        const autoMapping = {};
        headers.forEach((h) => {
          const lower = h.toLowerCase();
          if (lower.includes('nom') || lower.includes('name')) autoMapping.nom = h;
          if (lower.includes('tel') || lower.includes('phone') || lower.includes('mobile')) autoMapping.telephone = h;
          if (lower.includes('email') || lower.includes('mail') || lower.includes('courriel')) autoMapping.email = h;
        });
        setCsvMapping(autoMapping);
      },
    });
  };

  const STRIPE_LINKS = {
    essentiel: 'https://buy.stripe.com/aFabJ31FQgF9cPe7FEf3a04',
    succes: 'https://buy.stripe.com/aFabJ31FQgF9cPe7FEf3a04',
  };

  const scrollToImport = () => {
    setTimeout(() => {
      window.scrollTo({ top: document.getElementById('import')?.offsetTop - 80, behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = () => {
    setFlowState('uploading');
    setTimeout(() => { setFlowState('info'); scrollToImport(); }, 1500);
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (companyName && companyEmail) { setFlowState('plan'); scrollToImport(); }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFlowState('redirecting');

    // Fire-and-forget lead capture to CRM
    const planNames = { essentiel: "L'Essentiel", succes: 'Au Succès' };
    const contactCount = csvData ? csvData.length : manualRows.filter(r => r.prenom || r.telephone).length;
    const contactsList = csvData
      ? csvData.map(r => ({ nom: r[csvMapping.nom] || '', telephone: r[csvMapping.telephone] || '', email: r[csvMapping.email] || '' }))
      : manualRows.filter(r => r.prenom || r.telephone);
    captureLeadFromSite({
      companyName,
      email: companyEmail,
      plan: planNames[plan] || plan,
      contactCount,
      source: 'impact-avis',
      contacts: contactsList,
    });

    let c = 3;
    setCountdown(3);
    const timer = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timer);
        try { localStorage.setItem('bp_source', 'impact-avis'); } catch(e) {}
        window.location.href = STRIPE_LINKS[plan];
      }
    }, 1000);
  };

  if (flowState === 'info') {
    return (
      <section id="import" className="py-24 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-md mx-auto px-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
              <Check className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h3 initial={{ opacity: 0.01, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-bold text-gray-900 mb-2">
            Félicitations !
          </motion.h3>
          <motion.p initial={{ opacity: 0.01 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-500 mb-8">
            Vos contacts ont été importés. Dernière étape avant de lancer votre campagne.
          </motion.p>
          <motion.form initial={{ opacity: 0.01, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} onSubmit={handleInfoSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de votre société</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Mon Commerce" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre email</label>
              <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-900 placeholder:text-gray-400" />
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-indigo-200 transition-all">
              Continuer →
            </button>
          </motion.form>
        </div>
      </section>
    );
  }

  if (flowState === 'plan') {
    return (
      <section id="import" className="py-24 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.h3 initial={{ opacity: 0.01, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gray-900 mb-2">
            Choisissez votre formule
          </motion.h3>
          <motion.p initial={{ opacity: 0.01 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-10">
            Quelle que soit la formule, vous commencez gratuitement. Vous ne serez débité qu'à la fin de votre essai.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { id: 'essentiel', name: "L'Essentiel", price: '49€ HT/mois', desc: 'Appels IA illimités · Bouclier anti-avis · Dashboard temps réel', badge: 'Le plus populaire' },
              { id: 'succes', name: 'Au Succès', price: '69€ HT / 15 avis', desc: 'Payez uniquement aux résultats · Mêmes fonctionnalités', badge: null },
            ].map((plan, i) => (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0.01, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => handlePlanSelect(plan.id)}
                className="relative p-8 rounded-2xl border-2 border-gray-200 hover:border-indigo-400 bg-white text-left transition-all duration-300 hover:shadow-lg group"
              >
                {plan.badge && <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>}
                <h4 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h4>
                <p className="text-2xl font-extrabold text-indigo-600 mb-3">{plan.price}</p>
                <p className="text-gray-500 text-sm">{plan.desc}</p>
                <div className="mt-4 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0.01, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500 bg-gray-50 rounded-xl px-5 py-3 max-w-xl mx-auto"
          >
            <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>La formule choisie sera activée à la fin de votre essai gratuit. Vous serez notifié à 80% de votre essai pour garder le contrôle. Aucune surprise.</span>
          </motion.div>
        </div>
      </section>
    );
  }

  if (flowState === 'redirecting') {
    return (
      <section id="import" className="py-24 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-lg mx-auto px-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
              <Check className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Parfait !</h3>
          <p className="text-gray-500 text-lg mb-6">Redirection vers l'empreinte bancaire sécurisée...</p>
          <span className="text-4xl font-bold text-indigo-600">{countdown}</span>
          <p className="text-gray-400 text-sm mt-6 max-w-md mx-auto">
            Aucun prélèvement immédiat. Votre carte est enregistrée pour activer votre formule après l&apos;essai gratuit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="import" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <SectionBadge>Machine à avis Google</SectionBadge>
          <SectionTitle className="text-center">Lancez votre première campagne</SectionTitle>
          <SectionSub>Importez vos contacts et l&apos;IA commence à collecter vos avis en 48h.</SectionSub>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {[{ id: 'manual', label: 'Ajout manuel' }, { id: 'csv', label: 'Import CSV' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
              <motion.div key="manual" initial={{ opacity: 0.01, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-4">
                  {manualRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>}
                        <input type="text" value={row.prenom} onChange={(e) => updateRow(i, 'prenom', e.target.value)} placeholder="Nom du contact" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all text-gray-900 placeholder:text-gray-400" />
                      </div>
                      <div>
                        {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>}
                        <input type="tel" value={row.telephone} onChange={(e) => updateRow(i, 'telephone', e.target.value)} placeholder="06 12 34 56 78" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all text-gray-900 placeholder:text-gray-400" />
                      </div>
                      <div>
                        {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1.5">{row.telephone && !isMobileFR(row.telephone) ? <>Email <span className="text-red-500">*</span></> : 'Email (facultatif)'}</label>}
                        <input type="email" value={row.email} onChange={(e) => updateRow(i, 'email', e.target.value)} placeholder="jean@email.com" className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all text-gray-900 placeholder:text-gray-400 ${row.telephone && !isMobileFR(row.telephone) && !row.email ? 'border-red-300' : 'border-gray-200'}`} />
                      </div>
                      <div>
                        {manualRows.length > 1 && (
                          <button onClick={() => removeRow(i)} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addRow} className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center"><span className="text-lg leading-none">+</span></span>
                  Ajouter un contact
                </button>
              </motion.div>
            ) : (
              <motion.div key="csv" initial={{ opacity: 0.01, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    dragOver ? 'border-indigo-400 bg-indigo-50' : csvData ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
                  {csvData ? (
                    <>
                      <Upload className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900">{csvFileName}</p>
                      <p className="text-sm text-green-600 mt-1">{csvData.length} contacts détectés</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium text-gray-600">Glissez votre fichier ici</p>
                      <p className="text-sm text-gray-400 mt-1">CSV ou Excel · 10 Mo max</p>
                    </>
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
                </div>                {csvData && csvData.length > 0 && csvHeaders.length > 0 && (
                  <div className="mt-6 space-y-5">
                    {/* Column mapping UI */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">Associez vos colonnes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: 'nom', label: 'Nom', required: true },
                          { key: 'telephone', label: 'Téléphone', required: true },
                          { key: 'email', label: 'Email (facultatif)', required: false },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                              {field.label} {field.required && <span className="text-red-400">*</span>}
                            </label>
                            <select
                              value={csvMapping[field.key] || ''}
                              onChange={(e) => setCsvMapping({ ...csvMapping, [field.key]: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-900"
                            >
                              <option value="">-- Sélectionner --</option>
                              {csvHeaders.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview with mapped columns */}
                    {(csvMapping.nom || csvMapping.telephone) && (
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">Aperçu (3 premiers contacts)</div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50/50">
                            <tr>
                              {csvMapping.nom && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nom</th>}
                              {csvMapping.telephone && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Téléphone</th>}
                              {csvMapping.email && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {csvData.slice(0, 3).map((row, i) => (
                              <tr key={i} className="border-t border-gray-50">
                                {csvMapping.nom && <td className="px-4 py-2 text-gray-700">{String(row[csvMapping.nom] || '')}</td>}
                                {csvMapping.telephone && <td className="px-4 py-2 text-gray-700">{String(row[csvMapping.telephone] || '')}</td>}
                                {csvMapping.email && <td className="px-4 py-2 text-gray-500">{String(row[csvMapping.email] || '')}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 text-center">{csvData.length} contacts détectés au total</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            disabled={flowState === 'uploading' || (activeTab === 'manual' && manualRows.some(r => r.telephone && !isMobileFR(r.telephone) && !r.email))}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {flowState === 'uploading' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Lancer mes 10 avis gratuits <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

// ============ TESTIMONIALS ============
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "En 3 semaines, je suis passé de 12 à 59 avis Google. Mes réservations ont explosé de 40%.",
      author: 'Laurent M.',
      role: 'Restaurant Le Comptoir, Lyon',
      metric: '+47 avis en 21 jours',
    },
    {
      quote: "Le bouclier a intercepté 3 avis négatifs. Ma note est passée de 3.8 à 4.6.",
      author: 'Sarah B.',
      role: 'Salon Élégance, Paris',
      metric: 'De 3.8 à 4.6 étoiles',
    },
    {
      quote: "Je ne fais plus rien. L'IA gère mes avis pendant que je gère mon business.",
      author: 'Marc D.',
      role: 'Garage AutoPro, Bordeaux',
      metric: '156 avis en 2 mois',
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Témoignages</SectionBadge>
        <SectionTitle className="text-center">Des résultats concrets.</SectionTitle>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col"
            initial={{ opacity: 0.01, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.15, duration: 0.6, ease }}
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-5">
              {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>

            <p className="text-[16px] text-gray-800 font-medium leading-relaxed mb-6 flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>

            <div className="border-t border-gray-100 pt-5">
              <p className="font-bold text-gray-900 text-[15px]">{t.author}</p>
              <p className="text-sm text-gray-500 mb-3">{t.role}</p>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[12px] font-bold">
                <BarChart3 className="w-3 h-3" /> {t.metric}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ============ PRICING ============
const PricingSection = () => (
  <section id="tarifs" className="py-24 px-6 lg:px-8 bg-gray-50/50">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Tarifs</SectionBadge>
        <SectionTitle className="text-center">Investissez dans votre réputation.</SectionTitle>
        <SectionSub>Pas de surprise, pas d&apos;engagement. Résiliez quand vous voulez.</SectionSub>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Plan 1 */}
        <motion.div
          className="relative bg-white rounded-3xl border-2 border-gray-900 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
          initial={{ opacity: 0.01, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease }}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
        >
          <div className="absolute -top-3.5 left-8 bg-gray-900 text-white px-4 py-1 rounded-full text-[12px] font-bold tracking-wide">
            Le + populaire
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">L&apos;Essentiel</h3>
          <p className="text-sm text-gray-500 mb-6">Pour les commerces ambitieux</p>

          <div className="mb-8">
            <span className="text-[52px] font-extrabold text-gray-900 leading-none">49&euro;</span>
            <span className="text-gray-500 ml-2">HT/mois</span>
          </div>

          <div className="space-y-3 mb-8">
            {['Appels IA illimités', 'Bouclier anti-avis négatifs', 'Tableau de bord temps réel', 'Support prioritaire', 'Rapports hebdomadaires'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[14px] text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          <motion.a
            href="#import"
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-[15px] hover:bg-gray-800 transition-colors shadow-sm block text-center"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Commencer maintenant <ArrowRight className="w-4 h-4 inline ml-1" />
          </motion.a>

          <p className="text-center text-xs text-gray-400 mt-3">10 avis offerts pour tester</p>
        </motion.div>

        {/* Plan 2 */}
        <motion.div
          className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0.01, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.3 } }}
        >
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[12px] font-bold mb-4">
            <Shield className="w-3 h-3" /> Zéro risque
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">Au Succès</h3>
          <p className="text-sm text-gray-500 mb-6">Payez uniquement aux résultats</p>

          <div className="mb-8">
            <span className="text-[52px] font-extrabold text-gray-900 leading-none">69&euro;</span>
            <span className="text-gray-500 ml-2">HT / 15 avis</span>
          </div>

          <div className="space-y-3 mb-8">
            {['Payez uniquement aux résultats', 'Mêmes fonctionnalités', 'Idéal pour tester', 'Aucun minimum de durée'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[14px] text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          <motion.a
            href="#import"
            className="w-full border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-semibold text-[15px] hover:border-gray-300 transition-colors block text-center"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Tester sans risque
          </motion.a>

          <p className="text-center text-xs text-gray-400 mt-3">10 avis offerts pour tester</p>
        </motion.div>
      </div>

      <motion.div
        className="flex items-center justify-center gap-6 mt-10 text-[13px] text-gray-400"
        initial={{ opacity: 0.01 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Empreinte sécurisée Stripe</div>
        <span className="opacity-30">|</span>
        <div>Résiliation en 1 clic</div>
        <span className="opacity-30">|</span>
        <div>Satisfait ou remboursé 30 jours</div>
      </motion.div>

      {/* Pricing comparison guide */}
      <motion.div
        className="mt-16 max-w-3xl mx-auto"
        initial={{ opacity: 0.01, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Quelle offre me convient ?</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">L&apos;Essentiel</h4>
                <span className="text-sm text-indigo-600 font-semibold">49€/mois</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vous avez un flux régulier de clients et voulez des avis en continu. Idéal pour les commerces avec plus de 50 clients/mois. Tout illimité, un seul prix fixe.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Au Succès</h4>
                <span className="text-sm text-emerald-600 font-semibold">69€/15 avis</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vous préférez payer uniquement quand ça marche. Idéal pour tester ou pour les petites structures. Vous ne payez que les avis réellement obtenus.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============ FAQ ============
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Comment fonctionne Impact Avis ?",
      a: "Impact Avis fonctionne en 3 étapes simples. D\u2019abord, vous importez votre liste de clients (CSV, Excel ou saisie manuelle). Ensuite, notre IA vocale appelle chacun de vos clients de manière personnalisée, en se présentant au nom de votre commerce. Si le client est satisfait, l\u2019IA le guide directement vers votre fiche Google pour laisser un avis 5 étoiles. Si le client exprime un mécontentement, l\u2019avis est intercepté et redirigé vers vous en privé, protégeant ainsi votre réputation en ligne.",
    },
    {
      q: "Est-ce légal ? Conforme au RGPD ?",
      a: "Oui, Impact Avis est 100% conforme au RGPD et à la législation française. Toutes les données de vos clients sont hébergées en France sur des serveurs sécurisés. Chaque client peut refuser l\u2019appel ou demander la suppression de ses données à tout moment (opt-out). Nous ne créons jamais de faux avis : seuls de vrais clients laissent de vrais avis sur Google. Le consentement est géré de manière transparente et traçable pour vous protéger juridiquement.",
    },
    {
      q: "Combien d\u2019avis puis-je obtenir ?",
      a: "Le nombre d\u2019avis dépend directement du volume de clients que vous nous transmettez. En moyenne, nos utilisateurs obtiennent un taux de conversion de 25 à 35% : sur 100 clients contactés, 25 à 35 laissent un avis Google. Plus vous importez de contacts réguliers, plus vos avis augmentent. Certains commerces avec un fort flux de clients récoltent plus de 50 nouveaux avis par mois.",
    },
    {
      q: "Que se passe-t-il si un client laisse un avis négatif ?",
      a: "C\u2019est là qu\u2019intervient notre Bouclier Anti-Avis Négatifs. Lorsqu\u2019un client exprime une insatisfaction (note de 1, 2 ou 3 étoiles), l\u2019avis n\u2019est PAS publié sur Google. Au lieu de cela, vous recevez une notification privée avec le détail du retour client, ce qui vous permet de résoudre le problème en direct. Seuls les avis 4 et 5 étoiles sont guidés vers votre fiche Google, ce qui protège votre note moyenne.",
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Absolument, il n\u2019y a aucun engagement de durée. Vous pouvez résilier votre abonnement en 1 clic depuis votre tableau de bord, sans justification et sans frais cachés. Si vous n\u2019êtes pas satisfait dans les 30 premiers jours, nous vous remboursons intégralement. Nous croyons en la qualité de notre service et ne voulons garder que des clients convaincus.",
    },
    {
      q: "Comment fonctionne l\u2019essai gratuit ?",
      a: "Votre essai gratuit comprend 10 avis offerts pour tester le service sans risque. Lors de l\u2019inscription, votre carte bancaire est enregistrée (empreinte sécurisée via Stripe) mais aucun prélèvement n\u2019est effectué pendant l\u2019essai. Vous recevrez une notification à 80% de consommation de votre essai pour garder le contrôle total. À la fin de l\u2019essai, votre formule choisie s\u2019active automatiquement, ou vous pouvez annuler sans frais avant.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>FAQ</SectionBadge>
        <SectionTitle className="text-center">Questions fréquentes</SectionTitle>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            initial={{ opacity: 0.01, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              className="w-full px-6 py-5 text-left font-semibold text-[15px] text-gray-900 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {faq.q}
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  className="bg-gray-50 mx-4 mb-4 rounded-xl px-5 py-4 text-[14px] text-gray-600 leading-relaxed"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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

// ============ FINAL CTA ============
const FinalCTASection = () => (
  <section className="py-28 px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
    {/* Gradient orbs */}
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] opacity-10"
      style={{ background: 'radial-gradient(circle, #818cf8, transparent 60%)' }} />
    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-10"
      style={{ background: 'radial-gradient(circle, #a78bfa, transparent 60%)' }} />

    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <motion.h2
        className="text-4xl md:text-[52px] font-extrabold text-white tracking-tight leading-[1.1] mb-6"
        initial={{ opacity: 0.01, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease }}
      >
        Prêt à transformer votre réputation Google ?
      </motion.h2>

      <motion.p
        className="text-xl text-white/60 mb-10"
        initial={{ opacity: 0.01 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.1 }}
      >
        Rejoignez les 2 340+ commerces qui récoltent des avis en automatique.
      </motion.p>

      <motion.a
        href="#import"
        className="inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all"
        initial={{ opacity: 0.01, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.2, ease }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        Démarrer mon essai gratuit <ArrowRight className="w-5 h-5" />
      </motion.a>

      <motion.p
        className="text-white/40 text-sm mt-6"
        initial={{ opacity: 0.01 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.3 }}
      >
        10 avis offerts &middot; Sans carte bancaire &middot; Résultats garantis sous 48h
      </motion.p>
    </div>
  </section>
);

// ============ FOOTER ============
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-16 px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-1 font-bold text-lg mb-4">
            <span className="text-gray-900">Booster</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pay</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            La meilleure solution de gestion d&apos;avis pour commerces locaux.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Services</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li><Link to="/impact-avis" className="hover:text-gray-900 transition-colors">Impact-Avis</Link></li>
            <li><Link to="/ia-vocale" className="hover:text-gray-900 transition-colors">IA Vocale</Link></li>
            <li><a href="#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Légal</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li><Link to="/mentions-legales" className="hover:text-gray-900 transition-colors">Mentions légales</Link></li>
            <li><Link to="/cgv" className="hover:text-gray-900 transition-colors">CGV</Link></li>
            <li><Link to="/politique-confidentialite" className="hover:text-gray-900 transition-colors">Confidentialité</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Contact</h4>
          <a href="mailto:support@boosterpay.fr" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            support@boosterpay.fr
          </a>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 text-center text-[13px] text-gray-400">
        &copy; 2026 BoosterPay. Made with <Heart className="w-3.5 h-3.5 inline fill-red-500 text-red-500" /> in France
      </div>
    </div>
  </footer>
);

// ============ MAIN ============
export default function ImpactAvisLanding() {
  useEffect(() => {
    document.title = 'Impact Avis \u2014 Boostez vos avis Google automatiquement | BoosterPay';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', "Obtenez des avis Google 5 \u00e9toiles automatiquement. L'IA appelle vos clients satisfaits et les guide vers votre fiche Google. 10 avis offerts pour tester.");
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = "Obtenez des avis Google 5 \u00e9toiles automatiquement. L'IA appelle vos clients satisfaits et les guide vers votre fiche Google. 10 avis offerts pour tester.";
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="bg-white min-h-screen overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Service Navigation Bar ── */}
      <ServiceNavBar />
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <StatsSection />
      <ProblemSection />
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
