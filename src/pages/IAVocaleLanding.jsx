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
  Filter,
  MessageSquare,
  FileText,
  Play,
  Pause,
  Bot,
  Calendar,
  Wrench,
  Heart,
  Eye,
  Scissors,
  Activity,
  Volume2,
  ArrowDown,
  Gift,
} from 'lucide-react';

/* ── Apple-style scroll-reveal wrapper ────────────────────────── */
const ScrollReveal = ({ children, y = 40, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    viewport={{ once: true, margin: '-60px' }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── Section subtitle (centred) ───────────────────────────────── */
const SectionSub = ({ children }) => (
  <ScrollReveal y={30} delay={0.12}>
    <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed mt-5 mx-auto text-center">
      {children}
    </p>
  </ScrollReveal>
);

/* ── Parallax section wrapper ─────────────────────────────────── */
const ParallaxSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

export default function IAVocaleLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollBorder, setScrollBorder] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const countRef = useRef(null);
  const countInView = useInView(countRef, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  // Parallax for hero
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);

  // Count-up animation
  useEffect(() => {
    if (countInView && count < 40) {
      const interval = setInterval(() => {
        setCount((prev) => Math.min(prev + 1, 40));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [countInView, count]);

  // Scroll border on navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrollBorder(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const soundBarVariants = {
    animate: {
      y: [0, -8, 0],
      transition: { duration: 0.6, repeat: Infinity },
    },
  };

  return (
    <div className="w-full bg-white overflow-hidden font-sans">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full bg-white z-50 transition-all duration-300 ${
          scrollBorder ? 'border-b border-gray-200' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">Booster</span>
            <span className="text-2xl font-bold text-blue-500">Pay</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/impact-avis"
              className="text-gray-700 hover:text-gray-900 transition font-medium text-sm"
            >
              Impact-Avis IA
            </Link>
            <span className="text-gray-500 font-medium text-sm">IA Vocale</span>
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 transition font-medium text-sm"
            >
              Acc&eacute;l&eacute;ration Paiements
            </Link>
          </div>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="hidden md:inline-block px-6 py-2 text-gray-900 font-semibold text-sm hover:bg-gray-100 rounded-lg transition">
              Essai gratuit
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-gray-900" />
              ) : (
                <Menu size={24} className="text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                <Link
                  to="/impact-avis"
                  className="block text-gray-700 hover:text-gray-900 transition font-medium"
                >
                  Impact-Avis IA
                </Link>
                <span className="block text-gray-900 font-medium">IA Vocale</span>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-gray-900 transition font-medium"
                >
                  Acc&eacute;l&eacute;ration Paiements
                </Link>
                <button className="w-full px-6 py-2 text-gray-900 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  Essai gratuit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION — parallax fade */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Transformez vos dossiers oubli&eacute;s en Chiffre d&rsquo;Affaires imm&eacute;diat.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Notre IA appelle vos clients pour renouveler leurs dossiers, confirmer
            vos rendez-vous et relancer ceux qui vous oublient. Z&eacute;ro effort, Z&eacute;ro
            abonnement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition flex items-center gap-2 text-lg"
            >
              Lancer mon essai gratuit (100 appels)
              <ArrowRight size={20} />
            </motion.button>
          </div>

          <p className="text-gray-700 font-medium mb-12 text-sm sm:text-base">
            &#10003; Rentabilis&eacute; d&egrave;s le 1er rendez-vous
          </p>

          {/* Audio Demo Button */}
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto flex items-center gap-3 px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            <span>&Eacute;coutez l&rsquo;IA en action</span>
            <div className="flex items-center gap-1.5 ml-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  variants={soundBarVariants}
                  animate={isPlaying ? 'animate' : 'initial'}
                  transition={{ delay: i * 0.1 }}
                  className="w-1 h-6 bg-gray-900 rounded-full"
                />
              ))}
            </div>
          </motion.button>
        </motion.div>
      </section>

      {/* LE MOTEUR &Agrave; CASH — BENTO GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
              Deux leviers pour remplir votre agenda
            </h2>
          </ScrollReveal>
          <SectionSub>
            L&rsquo;IA travaille pour vous 24&nbsp;h/24 : elle r&eacute;active vos anciens clients
            et supprime les absences de votre planning.
          </SectionSub>

          {/* Two Large Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 mt-16">
            {/* Card 1 — R&eacute;activation */}
            <ScrollReveal delay={0.05}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <RefreshCw size={28} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      R&eacute;activation de fichiers clients
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  L&rsquo;IA rappelle vos clients dont le dossier expire, le contrat arrive
                  &agrave; terme, le contr&ocirc;le est d&ucirc;. Vos clients oublient, l&rsquo;IA n&rsquo;oublie
                  jamais.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Contrôle technique',
                    'Renouvellement mutuelle',
                    'Révision annuelle',
                    'Suivi médical',
                    'Rappel devis',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2 — Rappels de RDV */}
            <ScrollReveal delay={0.12}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CalendarCheck size={28} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Rappels de RDV automatiques
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  L&rsquo;IA appelle la veille pour confirmer le rendez-vous. Fini les
                  lapins et les cr&eacute;neaux perdus.
                </p>

                {/* ── BEFORE / AFTER visual ── */}
                <div ref={countRef} className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-[1fr_auto_1fr]">
                    {/* AVANT */}
                    <div className="bg-red-50 p-5 flex flex-col items-center justify-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400">Avant</span>
                      <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-400 flex items-center justify-center">
                        <span className="text-lg font-black text-red-600">43%</span>
                      </div>
                      <span className="text-sm font-semibold text-red-600">d&rsquo;absences</span>
                    </div>

                    {/* Arrow separator */}
                    <div className="flex items-center justify-center px-3 bg-gray-50">
                      <ArrowRight size={28} className="text-gray-400" />
                    </div>

                    {/* APR&Egrave;S */}
                    <div className="bg-emerald-50 p-5 flex flex-col items-center justify-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Apr&egrave;s</span>
                      <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center">
                        <span className="text-lg font-black text-emerald-600">8%</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">d&rsquo;absences</span>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 text-center border-t border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">
                      R&eacute;duction de <span className="font-bold text-emerald-600">&#8722;35 points</span> de rendez-vous manqu&eacute;s
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Three Smaller Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Filter,
                title: 'Qualification de leads',
                color: 'purple',
              },
              {
                icon: MessageSquare,
                title: 'Enquêtes de satisfaction',
                color: 'orange',
              },
              {
                icon: FileText,
                title: 'Relances de devis',
                color: 'red',
              },
            ].map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.06}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center h-full">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                      item.color === 'purple'
                        ? 'bg-purple-100'
                        : item.color === 'orange'
                          ? 'bg-orange-100'
                          : 'bg-red-100'
                    }`}
                  >
                    <item.icon
                      size={24}
                      className={
                        item.color === 'purple'
                          ? 'text-purple-600'
                          : item.color === 'orange'
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }
                    />
                  </div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center">
              Comment &ccedil;a marche
            </h2>
          </ScrollReveal>
          <SectionSub>
            Trois &eacute;tapes, z&eacute;ro prise de t&ecirc;te. Op&eacute;rationnel en 24&nbsp;h.
          </SectionSub>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: Upload,
                title: 'Déposez votre fichier clients',
                desc: 'CSV, Excel ou saisie manuelle',
              },
              {
                icon: Phone,
                title: 'L\u2019IA appelle et relance',
                desc: 'Appels naturels et personnalisés',
              },
              {
                icon: TrendingUp,
                title: 'Vos clients reviennent',
                desc: 'RDV confirmés, dossiers renouvelés',
              },
            ].map((step, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.15}>
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <step.icon size={32} className="text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CAS D'USAGE SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
              Quel que soit votre m&eacute;tier, l&rsquo;IA s&rsquo;adapte
            </h2>
          </ScrollReveal>
          <SectionSub>
            Garages, cabinets, salons, courtiers&hellip; chaque sc&eacute;nario t&eacute;l&eacute;phonique
            est configur&eacute; sur mesure pour votre activit&eacute;.
          </SectionSub>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Wrench,
                title: 'Garage auto',
                desc: 'Contrôles techniques à renouveler',
              },
              {
                icon: FileText,
                title: 'Courtier',
                desc: 'Contrats et mutuelles à échéance',
              },
              {
                icon: Heart,
                title: 'Dentiste',
                desc: 'Rappels détartrage et bilans',
              },
              {
                icon: Eye,
                title: 'Opticien',
                desc: 'Renouvellement de lunettes',
              },
              {
                icon: Scissors,
                title: 'Salon de coiffure',
                desc: 'Relance des clients inactifs',
              },
              {
                icon: Activity,
                title: 'Coach / Kiné',
                desc: 'Suivi et rappels de séances',
              },
            ].map((useCase, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.06}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <useCase.icon size={24} className="text-blue-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {useCase.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{useCase.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* RENTABILIT&Eacute; SECTION (ex-ROI) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="flex justify-center mb-4">
              <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">
                Rentabilit&eacute;
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center">
              Le r&eacute;sultat est imm&eacute;diat
            </h2>
          </ScrollReveal>
          <SectionSub>
            Rentabilit&eacute; moyenne : x6 d&egrave;s le premier pack.
            Comparez votre quotidien avec et sans l&rsquo;IA.
          </SectionSub>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* Without AI */}
            <ScrollReveal delay={0.05}>
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Sans l&rsquo;IA</h3>
                {[
                  '3 h/jour au téléphone à relancer',
                  'Des clients qui ne reviennent jamais',
                  '40 % de rendez-vous manqués dans l\u2019agenda',
                  'Du CA perdu chaque mois',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 pt-1">
                      <X size={20} className="text-red-500" />
                    </div>
                    <p className="text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* With AI */}
            <ScrollReveal delay={0.12}>
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Avec BoosterPay IA
                </h3>
                {[
                  '0 minute au téléphone',
                  'Vos clients relancés automatiquement',
                  '95 % de présence aux RDV',
                  'Le CA revient tout seul, chaque mois',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 pt-1">
                      <Check size={20} className="text-green-600" />
                    </div>
                    <p className="text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ROBOT SUR-MESURE SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="bg-white border-l-4 border-blue-500 rounded-2xl p-8 shadow-sm">
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 bg-blue-100 rounded-xl flex-shrink-0">
                  <Bot size={32} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Un besoin d&rsquo;appels sp&eacute;cifique&nbsp;? On vous cr&eacute;e votre IA
                    sur-mesure.
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Vous passez des appels r&eacute;p&eacute;titifs et chronophages propres &agrave; votre
                    m&eacute;tier&nbsp;? D&eacute;crivez-nous votre besoin, nos ing&eacute;nieurs param&egrave;trent
                    et personnalisent votre robot vocal.
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        1. D&eacute;crivez votre besoin par message
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-gray-400 hidden sm:block" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        2. Planifiez un appel avec notre &eacute;quipe
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition flex items-center gap-2 mb-3"
                  >
                    <Calendar size={20} />
                    Prendre rendez-vous avec un expert
                  </motion.button>
                  <p className="text-sm text-gray-600">Devis gratuit sous 24&nbsp;h</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
              Pas d&rsquo;abonnement obligatoire. Performance pure.
            </h2>
          </ScrollReveal>
          <SectionSub>
            Z&eacute;ro engagement, z&eacute;ro risque. Choisissez le pack adapt&eacute; &agrave; votre volume.
          </SectionSub>

          {/* Free trial banner */}
          <ScrollReveal delay={0.1}>
            <div className="mt-12 mb-10 flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 max-w-2xl mx-auto">
              <Gift size={22} className="text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-800 font-semibold text-center">
                Essai gratuit inclus quelle que soit la formule &mdash; 100 appels offerts pour d&eacute;marrer.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Essai D&eacute;couverte */}
            <ScrollReveal delay={0}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 h-full flex flex-col">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    Gratuit
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">0&euro;</p>
                <p className="text-gray-600 font-medium mb-6">100 appels offerts</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Testez la puissance de l&rsquo;IA</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Premiers rendez-vous sous 48&nbsp;h</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Essai gratuit inclus</span>
                  </li>
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  Commencer gratuitement
                </motion.button>
              </div>
            </ScrollReveal>

            {/* Pack Boost */}
            <ScrollReveal delay={0.06}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 h-full flex flex-col">
                <p className="text-4xl font-bold text-gray-900 mb-2">199&euro; HT</p>
                <p className="text-gray-600 font-medium mb-6">250 appels</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Impulsion imm&eacute;diate</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Videz votre pile de dossiers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Paiement unique, sans abonnement</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Essai gratuit inclus</span>
                  </li>
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition"
                >
                  Choisir ce pack
                </motion.button>
              </div>
            </ScrollReveal>

            {/* Pack Business — POPULAIRE */}
            <ScrollReveal delay={0.12}>
              <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 shadow-lg relative md:scale-105 h-full flex flex-col">
                <div className="absolute -top-3 left-6">
                  <span className="inline-block px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    Populaire
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2 mt-4">349&euro; HT</p>
                <p className="text-gray-600 font-medium mb-6">500 appels</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Meilleur rapport performance/prix</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Relance massive</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Paiement unique, sans abonnement</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Essai gratuit inclus</span>
                  </li>
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition"
                >
                  Choisir ce pack
                </motion.button>
              </div>
            </ScrollReveal>

            {/* Abonnement Croissance */}
            <ScrollReveal delay={0.18}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 h-full flex flex-col">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    Le + rentable
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">399&euro; HT</p>
                <p className="text-gray-600 font-medium mb-6">/mois &bull; 1&nbsp;000 appels</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Flux continu de clients chaque mois</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Saturez votre agenda</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Support d&eacute;di&eacute; et prioritaire</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Annulable &agrave; tout moment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Essai gratuit inclus</span>
                  </li>
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition"
                >
                  S&rsquo;abonner
                </motion.button>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15}>
            <div className="text-center">
              <p className="text-gray-700 font-medium">
                Volume sup&eacute;rieur&nbsp;? <span className="text-blue-500 cursor-pointer">Contactez-nous &rarr;</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* T&Eacute;MOIGNAGES SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center">
              T&eacute;moignages
            </h2>
          </ScrollReveal>
          <SectionSub>
            Ils utilisent d&eacute;j&agrave; l&rsquo;IA vocale BoosterPay au quotidien.
          </SectionSub>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                text: 'J\u2019ai récupéré 12 clients en une semaine sur un fichier que je pensais mort.',
                author: 'Pierre D.',
                role: 'Garagiste',
              },
              {
                text: 'Plus un seul lapin depuis qu\u2019on utilise les rappels IA.',
                author: 'Sophie M.',
                role: 'Ostéopathe',
              },
              {
                text: 'On a renouvelé 80 % de nos contrats arrivés à échéance sans passer un seul coup de fil.',
                author: 'Marc L.',
                role: 'Courtier',
              },
            ].map((testimonial, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                  <p className="text-gray-700 mb-6 italic">&laquo;&nbsp;{testimonial.text}&nbsp;&raquo;</p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-1 mb-6">
              <span className="text-2xl font-bold">Booster</span>
              <span className="text-2xl font-bold text-blue-400">Pay</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transformez vos dossiers oubli&eacute;s en chiffre d&rsquo;affaires.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-gray-100">Services</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a href="/" className="hover:text-white transition">
                  Acc&eacute;l&eacute;ration Paiements
                </a>
              </li>
              <li>
                <a href="/impact-avis" className="hover:text-white transition">
                  Impact-Avis IA
                </a>
              </li>
              <li>
                <a href="/ia-vocale" className="hover:text-white transition">
                  IA Vocale
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-gray-100">L&eacute;gal</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Mentions l&eacute;gales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Confidentialit&eacute;
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  CGU
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-gray-100">Contact</h4>
            <p className="text-gray-400 text-sm mb-2">contact@boosterpay.fr</p>
            <p className="text-gray-400 text-sm">+33 (0)2 XX XX XX XX</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm text-center">
            &copy; 2026 BoosterPay. Tous droits r&eacute;serv&eacute;s.
          </p>
        </div>
      </footer>
    </div>
  );
}
