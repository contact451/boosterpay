import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';

// ============ DESIGN SYSTEM ============
const ease = [0.22, 1, 0.36, 1];

const SectionBadge = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6"
  >
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

const SectionSub = ({ children }) => (
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1, duration: 0.6, ease }}
    className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed mt-5"
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

// ============ ANNOUNCEMENT BAR ============
const AnnouncementBar = () => (
  <div className="bg-gray-900 text-white text-center py-2.5 text-[13px] font-medium fixed top-0 w-full z-50">
    <span className="opacity-80">+2 340 commerces utilisent deja Impact-Avis IA</span>
    <span className="mx-2 opacity-30">|</span>
    <a href="#pricing" className="text-indigo-300 hover:text-indigo-200 transition-colors font-semibold">
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
    <nav className="fixed top-[38px] w-full z-40">
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
          <a href="#features" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalites</a>
          <a href="#how-it-works" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Comment ca marche</a>
          <a href="#pricing" className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <motion.a
            href="#pricing"
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
            className="md:hidden fixed inset-0 top-[90px] bg-white z-30 flex flex-col items-center pt-12 gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <a href="#features" className="text-lg font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>Fonctionnalites</a>
            <a href="#pricing" className="text-lg font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <motion.a href="#pricing" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold mt-4" whileTap={{ scale: 0.95 }}>
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
  const isInView = useInView(ref, { once: true, margin: '-60px' });
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
    <div ref={ref} className="relative">
      <motion.div
        className="absolute -inset-8 rounded-[40px] blur-3xl"
        animate={{
          background: isAfter
            ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.12) 0%, rgba(99,102,241,0.06) 50%, transparent 80%)'
            : 'radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, rgba(200,200,200,0.04) 50%, transparent 80%)',
        }}
        transition={{ duration: 1.2 }}
      />

      <motion.div
        className="relative bg-white rounded-3xl overflow-hidden"
        animate={{
          borderColor: isAfter ? 'rgba(34,197,94,0.3)' : 'rgba(229,231,235,0.8)',
          boxShadow: isAfter
            ? '0 25px 80px rgba(34,197,94,0.12), 0 8px 30px rgba(0,0,0,0.06)'
            : '0 20px 60px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.03)',
        }}
        transition={{ duration: 1 }}
        style={{ border: '1.5px solid' }}
      >
        <motion.div
          className="px-6 py-2.5 flex items-center justify-between text-[12px] font-semibold"
          animate={{
            backgroundColor: isAfter ? 'rgb(240, 253, 244)' : 'rgb(254, 242, 242)',
            color: isAfter ? 'rgb(22, 163, 74)' : 'rgb(185, 28, 28)',
          }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className="flex items-center gap-1.5">
            {isAfter ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}>{'\u2713'}</motion.span>
            ) : (
              <span>{'\u26A0'}</span>
            )}
            <span>{isAfter ? 'R\u00e9putation excellente' : 'R\u00e9putation \u00e0 risque'}</span>
          </motion.div>
          <motion.span animate={{ opacity: isAfter ? 1 : 0.7 }}>
            {isAfter ? '\u2191 Top 5% local' : '\u2193 En dessous de la moyenne'}
          </motion.span>
        </motion.div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
              animate={{
                background: isAfter
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #9ca3af, #6b7280)',
              }}
              transition={{ duration: 1 }}
            >
              <Star className="w-7 h-7 text-white fill-white" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={isAfter ? { x: '200%' } : { x: '-100%' }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </motion.div>
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

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <motion.span
                className="text-[42px] font-black leading-none"
                animate={{ color: isAfter ? '#111827' : '#6b7280' }}
                transition={{ duration: 0.8 }}
              >
                {rating.toFixed(1)}
              </motion.span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => {
                  const isFilled = i <= filledStars;
                  return (
                    <motion.div key={i}
                      animate={{ scale: isFilled ? [1, 1.3, 1] : 1, rotate: isFilled && i === filledStars ? [0, 15, -10, 0] : 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <Star className={`w-6 h-6 transition-colors duration-500 ${isFilled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">{Math.round(reviews)} avis Google</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: isAfter ? '92%' : '28%', backgroundColor: isAfter ? '#22c55e' : '#ef4444' }}
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            {['Itin\u00e9raire', 'Avis', 'Appeler'].map((label, i) => (
              <div key={i} className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-xl py-2 text-center text-xs font-semibold text-gray-600 border border-gray-100 transition-colors cursor-default">
                {label}
              </div>
            ))}
          </div>

          <div className="space-y-2.5 relative" style={{ minHeight: '180px' }}>
            <AnimatePresence mode="wait">
              {!isAfter ? (
                <motion.div key="before" className="space-y-2.5" exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.4 }}>
                  {beforeReviews.map((r, i) => (
                    <motion.div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                      initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + i * 0.15 }}
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
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {afterReviews.map((r, i) => (
                    <motion.div key={i}
                      className={`rounded-xl p-3.5 border ${i === 2 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600">{r.author.charAt(0)}</div>
                        <span className="text-xs font-semibold text-gray-700">{r.author}</span>
                        {r.isNew && (
                          <motion.span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, delay: 0.3 + i * 0.1 }}
                          >
                            Nouveau
                          </motion.span>
                        )}
                        <span className="text-[10px] text-gray-300 ml-auto">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, j) => (
                          <motion.div key={j} initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 + j * 0.03, type: 'spring', stiffness: 300 }}>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-[13px] text-gray-700 leading-snug font-medium">{r.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isAfter && (
              <motion.div
                className="mt-4 flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100"
                initial={{ opacity: 0, y: 10, height: 0, marginTop: 0, padding: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto', marginTop: 16, padding: '12px 16px' }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600 rotate-180" />
                  </div>
                  <span className="text-[13px] font-bold text-emerald-700">+312% d&apos;avis en 30 jours</span>
                </div>
                <motion.div
                  className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                >
                  Impact-Avis IA
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wider shadow-lg"
          animate={{
            backgroundColor: isAfter ? '#f0fdf4' : '#fef2f2',
            color: isAfter ? '#15803d' : '#b91c1c',
            borderColor: isAfter ? '#bbf7d0' : '#fecaca',
          }}
          transition={{ duration: 0.6 }}
          style={{ border: '1.5px solid' }}
        >
          {isAfter ? '\u2726 APR\u00c8S IMPACT-AVIS' : '\u2727 AVANT'}
        </motion.div>
      </motion.div>
    </div>
  );
};

// ============ HERO ============
const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="pt-44 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
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
            Notre IA appelle vos clients, recolte des avis 5 etoiles, et intercepte les mecontents avant qu&apos;ils ne nuisent a votre reputation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <motion.a
              href="#pricing"
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Demarrer gratuitement <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#how-it-works"
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2 hover:border-gray-300 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Comment ca marche
            </motion.a>
          </div>

          <div className="flex flex-wrap gap-6 text-[14px] text-gray-500">
            {['10 avis offerts', 'Sans carte bancaire', 'Resultats sous 48h'].map((t, i) => (
              <motion.div key={i} className="flex items-center gap-2" initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 + i * 0.1 }}>
                <Check className="w-4 h-4 text-emerald-500" /> {t}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hero visual — Animated Before/After Google Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
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
  const sectors = ['Restaurants', 'Garages auto', 'Salons de coiffure', 'Dentistes', 'Hotels', 'Artisans', 'Opticiens', 'Cliniques'];

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
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
    { value: 48, suffix: 'h', label: 'pour les premiers resultats' },
    { value: 97, suffix: '%', label: 'de clients satisfaits' },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
const ProblemSection = () => {
  const problems = [
    { icon: AlertTriangle, stat: '68%', text: "des consommateurs ne choisissent JAMAIS un commerce avec moins de 4 etoiles", color: 'red' },
    { icon: TrendingDown, stat: '30', text: "clients perdus pour chaque avis negatif non traite", color: 'orange' },
    { icon: Users, stat: '0', text: "avis pendant que vos concurrents en recoltent chaque semaine", color: 'amber' },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Le probleme</SectionBadge>
        <SectionTitle>
          Sans gestion d&apos;avis,
          <br />
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            votre commerce est invisible.
          </span>
        </SectionTitle>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {problems.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={i}
              className="group relative bg-white rounded-3xl border border-gray-200/60 p-8 hover:border-red-200 transition-all duration-500 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-[40px] font-extrabold text-gray-900 mb-2 leading-none">
                {p.stat}{p.stat !== '0' ? (p.stat === '68%' ? '' : ' clients') : ' avis'}
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">{p.text}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-center text-2xl font-bold text-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Il est temps de reprendre le controle.
      </motion.p>
    </section>
  );
};

// ============ FEATURES BENTO ============
const FeaturesSection = () => (
  <section id="features" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <SectionBadge>Fonctionnalites</SectionBadge>
      <SectionTitle>Tout pour dominer Google.</SectionTitle>
      <SectionSub>Un seul outil. Trois armes redoutables.</SectionSub>
    </div>

    <div className="grid md:grid-cols-4 gap-5">
      {/* Main card — Shield */}
      <motion.div
        className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-gray-900 text-white rounded-3xl p-10 flex flex-col justify-between"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
      >
        {/* Gradient orb */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 60%)' }} />

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/10">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Le Bouclier Anti-Avis Negatifs</h3>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Les avis 1, 2 et 3 etoiles sont interceptes et rediriges vers vous en prive. Votre fiche Google reste impeccable.
          </p>

          {/* Mini mockup */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm text-white/60">Avis 2 etoiles detecte</span>
              </div>
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md">Redirige</span>
            </div>
            <div className="h-px bg-white/10 mb-3" />
            <p className="text-xs text-white/40 italic">&quot;Decu du temps d&apos;attente...&quot;</p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Envoye en prive au responsable</p>
          </div>
        </div>
      </motion.div>

      {/* IA Vocale card */}
      <motion.div
        className="md:col-span-2 relative bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.7, ease }}
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
          <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">IA Vocale Indetectable</h3>
          <p className="text-gray-500 leading-relaxed mb-5">
            Conversations naturelles et humaines. 94% des clients pensent parler a une vraie personne.
          </p>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-[13px] font-bold">
            <Zap className="w-3.5 h-3.5" /> 94% taux de confusion humain/IA
          </div>
        </div>
      </motion.div>

      {/* Import card */}
      <motion.div
        className="md:col-span-2 relative bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.7, ease }}
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
    { num: '01', title: 'Importez vos contacts', desc: "CSV, Excel ou copier-coller. Meme un simple carnet d'adresses suffit.", icon: Upload },
    { num: '02', title: "L'IA appelle vos clients", desc: "Appels personnalises au nom de votre commerce. Chaque client se sent unique.", icon: Phone },
    { num: '03', title: "Les 5 etoiles tombent", desc: "Les mecontents sont rediriges vers vous en prive. Google ne voit que le meilleur.", icon: Star },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Simplicite</SectionBadge>
        <SectionTitle>3 minutes pour tout mettre en place.</SectionTitle>
      </div>

      <div className="space-y-6">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              className="group flex items-start gap-6 bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
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

// ============ TESTIMONIALS ============
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "En 3 semaines, je suis passe de 12 a 59 avis Google. Mes reservations ont explose de 40%.",
      author: 'Laurent M.',
      role: 'Restaurant Le Comptoir, Lyon',
      metric: '+47 avis en 21 jours',
    },
    {
      quote: "Le bouclier a intercepte 3 avis negatifs. Ma note est passee de 3.8 a 4.6.",
      author: 'Sarah B.',
      role: 'Salon Elegance, Paris',
      metric: 'De 3.8 a 4.6 etoiles',
    },
    {
      quote: "Je ne fais plus rien. L'IA gere mes avis pendant que je gere mon business.",
      author: 'Marc D.',
      role: 'Garage AutoPro, Bordeaux',
      metric: '156 avis en 2 mois',
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Temoignages</SectionBadge>
        <SectionTitle>Des resultats concrets.</SectionTitle>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease }}
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
  <section id="pricing" className="py-24 px-6 lg:px-8 bg-gray-50/50">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>Tarifs</SectionBadge>
        <SectionTitle>Investissez dans votre reputation.</SectionTitle>
        <SectionSub>Pas de surprise, pas d&apos;engagement. Resiliez quand vous voulez.</SectionSub>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Plan 1 */}
        <motion.div
          className="relative bg-white rounded-3xl border-2 border-gray-900 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
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
            {['Appels IA illimites', 'Bouclier anti-avis negatifs', 'Tableau de bord temps reel', 'Support prioritaire', 'Rapports hebdomadaires'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[14px] text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          <motion.button
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-[15px] hover:bg-gray-800 transition-colors shadow-sm"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Commencer maintenant <ArrowRight className="w-4 h-4 inline ml-1" />
          </motion.button>

          <p className="text-center text-xs text-gray-400 mt-3">10 avis offerts pour tester</p>
        </motion.div>

        {/* Plan 2 */}
        <motion.div
          className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
        >
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[12px] font-bold mb-4">
            <Shield className="w-3 h-3" /> Zero risque
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">Au Succes</h3>
          <p className="text-sm text-gray-500 mb-6">Payez uniquement aux resultats</p>

          <div className="mb-8">
            <span className="text-[52px] font-extrabold text-gray-900 leading-none">69&euro;</span>
            <span className="text-gray-500 ml-2">HT / 15 avis</span>
          </div>

          <div className="space-y-3 mb-8">
            {['Payez uniquement aux resultats', 'Memes fonctionnalites', 'Ideal pour tester', 'Aucun minimum de duree'].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[14px] text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          <motion.button
            className="w-full border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-semibold text-[15px] hover:border-gray-300 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Tester sans risque
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="flex items-center justify-center gap-6 mt-10 text-[13px] text-gray-400"
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

// ============ FAQ ============
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "Comment l'IA passe-t-elle les appels ?", a: "Notre IA utilise une synthese vocale ultra-naturelle. Elle appelle vos clients du lundi au samedi, entre 9h et 20h, en se presentant au nom de votre commerce. Chaque appel est personnalise avec le prenom du client." },
    { q: "Que se passe-t-il si un client donne 1 etoile ?", a: "Notre bouclier intercepte automatiquement tout avis 1, 2 ou 3 etoiles. Vous recevez l'avis en prive pour pouvoir le gerer. Seuls les 4 et 5 etoiles apparaissent sur Google." },
    { q: "Combien de temps pour voir les premiers avis ?", a: "En moyenne 48 heures. Certains clients voient leurs premiers 5 etoiles des le jour meme." },
    { q: "Est-ce legal ? RGPD ?", a: "Entierement conforme au RGPD et a la legislation francaise. Consentements geres, chaque appel peut etre refuse." },
    { q: "Puis-je annuler a tout moment ?", a: "Oui, en 1 clic. Sans justification, sans frais. Remboursement sous 30 jours si insatisfait." },
    { q: "Ca marche pour mon type de commerce ?", a: "Restaurants, salons, garages, dentistes, hotels, artisans, cliniques, boutiques... Si vous accueillez des clients, Impact-Avis peut vous aider." },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <SectionBadge>FAQ</SectionBadge>
        <SectionTitle>Questions frequentes</SectionTitle>
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
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
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
        href="#pricing"
        className="inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all"
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
            <li><a href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 text-[14px] mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li><Link to="/mentions-legales" className="hover:text-gray-900 transition-colors">Mentions legales</Link></li>
            <li><Link to="/cgv" className="hover:text-gray-900 transition-colors">CGV</Link></li>
            <li><Link to="/politique-confidentialite" className="hover:text-gray-900 transition-colors">Confidentialite</Link></li>
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
  return (
    <div className="bg-white min-h-screen overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <StatsSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
