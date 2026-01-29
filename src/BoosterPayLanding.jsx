import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Menu,
  X,
  Check,
  ChevronDown,
  Play,
  Pause,
  Star,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Bot,
  Banknote,
  Lock,
  Globe,
  Mail,
  Smartphone,
  ArrowRight,
  Volume2,
  AlertCircle,
  Gift,
  Headphones,
  BarChart3,
  Heart
} from 'lucide-react';

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Smooth scroll to section
const scrollToSection = (e, href) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    const offset = 100; // Hauteur de la nav
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// ============================================
// UTILITY HOOKS
// ============================================

// Hook for counting animation
const useCountUp = (end, duration = 2000, startOnView = true, startValue = null) => {
  // Démarre à une valeur proche de la fin pour éviter le "0"
  const initialValue = startValue !== null ? startValue : Math.floor(end * 0.85);
  const [count, setCount] = useState(initialValue);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted) return;

    setHasStarted(true);
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Animation de initialValue vers end
      setCount(Math.floor(initialValue + (end - initialValue) * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, isInView, startOnView, hasStarted, initialValue]);

  return { count, ref };
};

// Hook for typing effect
const useTypingEffect = (text, speed = 50, startDelay = 500) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayedText, isComplete };
};

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const floatingAnimation = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================
// COMPONENTS
// ============================================

// Scroll Progress Bar
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 origin-left z-[100]"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// Sticky Top Bar
const StickyTopBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { count, ref } = useCountUp(15847, 2500);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ref}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/90 to-cyan-500/90 backdrop-blur-md border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm md:text-base">
            <span className="text-yellow-300 animate-pulse">🔥</span>
            <span className="text-white">
              Rejoignez <span className="font-bold text-yellow-300">{count.toLocaleString()}+</span> entreprises qui ont déjà accéléré leur trésorerie
            </span>
            <motion.button
              onClick={(e) => scrollToSection(e, '#cta-form')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:inline-flex items-center gap-1 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-300 transition-colors"
            >
              Essayer <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Navigation
const Navigation = ({ onOpenDemo }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Fonctionnement', href: '#how-it-works' },
    { label: 'Tarif', href: '#pricing' },
    { label: 'Témoignages', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-[#0a0f1a]/95 backdrop-blur-lg border-b border-white/5' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <Phone className="w-8 h-8 text-blue-500" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-md"
              />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Booster<span className="text-blue-500">Pay</span>
            </span>
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                whileHover={{ y: -2 }}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <MagneticButton onClick={(e) => scrollToSection(e, '#cta-form')}>
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Essai Gratuit
              </span>
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0f1a]/98 backdrop-blur-lg"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="h-full flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-bold text-white">
                  Booster<span className="text-blue-500">Pay</span>
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={(e) => {
                      scrollToSection(e, link.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-2xl text-white font-medium py-3 border-b border-white/10"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto"
              >
                <GlowButton
                  className="w-full"
                  onClick={(e) => {
                    scrollToSection(e, '#cta-form');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Gift className="w-5 h-5" />
                  Essai Gratuit 10 Jours
                </GlowButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Magnetic Button Component
const MagneticButton = ({ children, className = '', onClick }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * 0.15;
    const y = (e.clientY - centerY) * 0.15;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-full overflow-hidden group ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-shadow" />
    </motion.button>
  );
};

// Glow Button Component
const GlowButton = ({ children, className = '', secondary = false, onClick, disabled = false }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative px-8 py-4 font-bold rounded-xl overflow-hidden group ${
        secondary
          ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
          : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white'
      } ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {!secondary && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ opacity: 0.3 }}
          />
          <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.6)] group-hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all duration-300" />
        </>
      )}
    </motion.button>
  );
};

// Glassmorphism Card Component
const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: 'inset 0 0 40px rgba(59,130,246,0.15), inset 0 0 80px rgba(6,182,212,0.08)' }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// ============================================
// PHONE ANIMATION V2 - ULTRA LISIBLE
// ============================================

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    prevRef.current = value;
    if (start === value) return;
    const startTime = Date.now();
    const duration = 1500;
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString('fr-FR')}</span>;
};

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: i % 2 === 0 ? '#22c55e' : '#4ade80' }}
        initial={{ left: '50%', top: '35%', scale: 0, opacity: 1 }}
        animate={{
          left: `${50 + (Math.cos(i * 30 * Math.PI / 180)) * 40}%`,
          top: `${35 + (Math.sin(i * 30 * Math.PI / 180)) * 30}%`,
          scale: [0, 1.2, 0],
          opacity: [1, 1, 0],
        }}
        transition={{ duration: 1, delay: i * 0.04, ease: 'easeOut' }}
      />
    ))}
  </div>
);

const CallingScreen = ({ client, timer }) => {
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      key="calling"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="text-center flex flex-col items-center justify-center flex-1"
    >
      <motion.div
        className="w-16 h-16 mx-auto rounded-full bg-orange-500/30 flex items-center justify-center mb-5"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Phone className="w-8 h-8 text-orange-400" />
      </motion.div>

      <h3 className="text-2xl font-bold text-white mb-3">APPEL EN COURS</h3>

      <div className="flex justify-center gap-1 mb-5 h-10">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="w-2 bg-orange-400 rounded-full"
            animate={{ height: ['16px', '40px', '16px'] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <p className="text-gray-400 text-base mb-1">{client.name}</p>
      <p className="text-4xl font-extrabold text-orange-400 mb-4">
        {client.amount.toLocaleString('fr-FR')}€
      </p>

      <div className="text-2xl font-mono text-white/70">{formatTime(timer)}</div>
    </motion.div>
  );
};

const SuccessScreen = ({ client }) => (
  <motion.div
    key="success"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -20 }}
    className="text-center flex flex-col items-center justify-center flex-1 relative"
  >
    <Confetti />

    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.3, 1] }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-500 flex items-center justify-center"
    >
      <Check className="w-12 h-12 text-white" strokeWidth={3} />
    </motion.div>

    <motion.h3
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-2xl font-bold text-green-400 mb-3"
    >
      PAIEMENT REÇU !
    </motion.h3>

    <motion.p
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      className="text-5xl font-extrabold text-green-400 mb-2"
    >
      +{client.amount.toLocaleString('fr-FR')}€
    </motion.p>

    <p className="text-gray-400 text-base">{client.name}</p>
  </motion.div>
);

const CounterScreen = ({ total, added }) => (
  <motion.div
    key="counter"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="text-center flex flex-col items-center justify-center flex-1 w-full"
  >
    <p className="text-gray-400 text-sm mb-2">💰 RÉCUPÉRÉ CE MOIS</p>

    <div className="text-5xl font-extrabold text-white mb-3">
      <AnimatedCounter value={total} />€
    </div>

    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-5"
    >
      <span className="text-green-400 font-bold">+{added.toLocaleString('fr-FR')}€ ajoutés</span>
    </motion.div>

    <div className="w-full px-2">
      <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
        />
      </div>
      <p className="text-gray-400 text-sm">12/12 clients payés ✓</p>
    </div>
  </motion.div>
);

const PhoneAnimationV2 = ({ onStepChange }) => {
  const [step, _setStep] = useState(1);
  const setStep = (s) => { _setStep(s); onStepChange?.(s); };
  const [clientIndex, setClientIndex] = useState(0);
  const [totalAmount, setTotalAmount] = useState(12847);
  const [callTimer, setCallTimer] = useState(0);

  const clients = [
    { name: 'Ferme Dubourg', amount: 1250 },
    { name: 'Menuiserie Martin', amount: 2100 },
    { name: 'Garage Central', amount: 1850 },
    { name: 'Boulangerie Petit', amount: 980 },
  ];

  const currentClient = clients[clientIndex];

  useEffect(() => {
    if (step !== 1) return;
    setCallTimer(0);
    const timer = setInterval(() => setCallTimer(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [step, clientIndex]);

  useEffect(() => {
    let cancelled = false;

    const runCycle = async () => {
      setStep(1);
      await sleep(5000);
      if (cancelled) return;

      setStep(2);
      await sleep(3000);
      if (cancelled) return;

      setStep(3);
      setTotalAmount(prev => prev + clients[clientIndex].amount);
      await sleep(4000);
      if (cancelled) return;

      setClientIndex(prev => (prev + 1) % clients.length);
    };

    runCycle();
    return () => { cancelled = true; };
  }, [clientIndex]);

  const bgClass = step === 1
    ? 'bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-[#0a0f1a]'
    : step === 2
      ? 'bg-gradient-to-br from-green-500/20 via-green-500/10 to-[#0a0f1a]'
      : 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-[#0a0f1a]';

  return (
    <div className={`h-full flex flex-col items-center justify-center p-6 transition-colors duration-700 ${bgClass}`}>
      <AnimatePresence mode="wait">
        {step === 1 && <CallingScreen client={currentClient} timer={callTimer} />}
        {step === 2 && <SuccessScreen client={currentClient} />}
        {step === 3 && <CounterScreen total={totalAmount} added={currentClient.amount} />}
      </AnimatePresence>
    </div>
  );
};

// Hero Section
const HeroSection = ({ onOpenDemo }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 50]);
  const [phoneStep, setPhoneStep] = useState(1);

  const phoneGlow = phoneStep === 1
    ? '0 0 80px rgba(249, 115, 22, 0.4), 0 0 120px rgba(249, 115, 22, 0.2)'
    : phoneStep === 2
      ? '0 0 80px rgba(34, 197, 94, 0.5), 0 0 120px rgba(34, 197, 94, 0.2)'
      : '0 0 60px rgba(59, 130, 246, 0.4), 0 0 100px rgba(59, 130, 246, 0.2)'; // Réduit de 150 à 50

  const { displayedText, isComplete } = useTypingEffect(
    "Notre IA appelle vos clients avec une voix humaine, diplomate et efficace. Récupérez votre argent pendant que vous travaillez.",
    30,
    1000
  );

  const trustBadges = [
    { icon: Check, text: "Sans engagement" },
    { icon: Clock, text: "Résultats dès 48h" },
    { icon: Banknote, text: "+8,7 millions € récupérés" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-400"
          />
          <span className="text-sm text-blue-300">+127 entreprises inscrites cette semaine</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >
          <span className="block">Divisez par 2 vos délais</span>
          <span className="block">de paiement.</span>
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Sans décrocher votre téléphone.
          </span>
        </motion.h1>

        {/* Subtitle with typing effect */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 min-h-[60px]"
        >
          {displayedText}
          {!isComplete && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-blue-400 ml-1 align-middle"
            />
          )}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <GlowButton
            className="text-lg"
            onClick={(e) => scrollToSection(e, '#cta-form')}
          >
            <Gift className="w-5 h-5" />
            DÉMARRER MES 10 JOURS GRATUITS
          </GlowButton>
          <GlowButton secondary onClick={onOpenDemo} className="text-lg">
            <Play className="w-5 h-5" />
            Écouter une démo d'appel
          </GlowButton>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-6 md:gap-10"
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="flex items-center gap-2 text-gray-300"
            >
              <badge.icon className="w-5 h-5 text-green-400" />
              <span className="text-sm md:text-base">{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Phone Mockup - ENHANCED */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
          className="mt-20 relative"
        >
          {/* Glow behind phone */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 bg-blue-500/30 rounded-full blur-[60px]" />
          </div>

          <motion.div
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-64 md:w-72 lg:w-80"
          >
            {/* Badge gauche - Notification paiement */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
              className="hidden md:block absolute -left-4 md:-left-20 lg:-left-28 top-20 z-20"
            >
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-xl px-3 py-2 shadow-lg shadow-green-500/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                    <span className="text-green-300 text-sm">✓</span>
                  </div>
                  <div>
                    <div className="text-green-400 text-sm font-bold">+2 450€</div>
                    <div className="text-gray-500 text-[10px]">Reçu</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Badge droite - Taux de succès */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 2.8, type: "spring", stiffness: 200 }}
              className="hidden md:block absolute -right-4 md:-right-20 lg:-right-28 top-[60%] z-20"
            >
              <motion.div
                animate={{ y: [2, -2, 2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-xl px-3 py-2 shadow-lg shadow-blue-500/10"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">94%</div>
                  <div className="text-gray-500 text-[10px]">Succès</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Badge bottom - Live stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="bg-[#0a0f1a]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-xs font-medium">+12 847€ ce mois</span>
                  <span className="text-green-400 text-[10px] font-semibold">+34%</span>
                </div>
              </div>
            </motion.div>

            {/* Phone Frame */}
            <motion.div
              animate={{ boxShadow: phoneGlow }}
              transition={{ duration: 0.8 }}
              className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] p-2"
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-3xl z-20" />

              <div className="bg-[#0a0f1a] rounded-[2rem] overflow-hidden aspect-[9/18]">
                <PhoneAnimationV2 onStepChange={setPhoneStep} />
              </div>
            </motion.div>

            {/* Reflection */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-blue-500/15 rounded-full blur-xl" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Urgency Banner
const UrgencyBanner = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 47, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-4 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-white text-sm md:text-base">
          <span className="font-bold text-orange-400">Offre de lancement</span> :
          Essai gratuit étendu à 10 jours (au lieu de 7) — Expire dans{' '}
          <span className="font-mono font-bold text-white bg-white/10 px-2 py-1 rounded">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </p>
      </div>
    </section>
  );
};

// Logo Carousel
const LogoCarousel = () => {
  const logos = [
    { name: "Terravigne", sector: "Viticulteurs" },
    { name: "BTP Alliance", sector: "Construction" },
    { name: "Agri-Conseil 47", sector: "Agriculture" },
    { name: "Électrik Pro", sector: "Artisans" },
    { name: "Transports Duval", sector: "Logistique" },
    { name: "Menuiserie Martin", sector: "Artisans" },
    { name: "Garage Central", sector: "Auto" },
    { name: "Plomberie Express", sector: "Artisans" },
  ];

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-gray-500 text-sm mb-10 uppercase tracking-wider">
          Ils nous font confiance
        </p>
        <div className="relative">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 whitespace-nowrap"
          >
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center px-8 py-4 min-w-[180px]"
              >
                <span className="text-white font-semibold text-lg tracking-tight">{logo.name}</span>
                <span className="text-gray-500 text-xs mt-1">{logo.sector}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Problem Section
const ProblemSection = () => {
  const painPoints = [
    {
      icon: Phone,
      title: "Appels gênants",
      description: "Appeler un client pour réclamer de l'argent ? Gênant et chronophage.",
      color: "red"
    },
    {
      icon: TrendingDown,
      title: "Trésorerie en danger",
      description: "En attendant, votre trésorerie souffre. Les factures s'accumulent.",
      color: "orange"
    },
    {
      icon: AlertCircle,
      title: "Stress permanent",
      description: "Vous perdez des nuits à stresser pour des paiements qui n'arrivent pas.",
      color: "yellow"
    }
  ];

  const { count, ref } = useCountUp(44, 2000);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Les relances clients, c'est <span className="text-red-400">l'enfer</span>.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {painPoints.map((point, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <GlassCard className="text-center border-red-500/20 hover:border-red-500/40">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center`}>
                  <point.icon className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{point.title}</h3>
                <p className="text-gray-400">{point.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Stat choc */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block px-8 py-6 rounded-2xl bg-red-500/10 border border-red-500/30">
            <p className="text-gray-400 mb-2">En France, les TPE attendent en moyenne</p>
            <div className="text-6xl md:text-7xl font-bold text-red-400">
              {count} <span className="text-3xl">JOURS</span>
            </div>
            <p className="text-gray-400 mt-2">pour être payées</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Solution Section (Before/After)
const SolutionSection = () => {
  const comparisons = [
    { before: "Relances manuelles stressantes", after: "Appels 100% automatiques" },
    { before: "Délai moyen : 44 jours", after: "Délai moyen : 18 jours" },
    { before: "Relations clients tendues", after: "Ton professionnel et diplomate" },
    { before: "Trésorerie imprévisible", after: "Cash-flow optimisé" },
    { before: "Temps perdu au téléphone", after: "Vous travaillez, on relance" }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            BoosterPay appelle. <span className="text-green-400">Vous encaissez.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-4">
          {/* AVANT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 rounded-full bg-red-500/20 text-red-400 font-bold text-sm">
                ❌ AVANT BoosterPay
              </span>
            </div>
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
              >
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-gray-400 line-through">{item.before}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* APRÈS */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-2 rounded-full bg-green-500/20 text-green-400 font-bold text-sm">
                ✅ APRÈS BoosterPay
              </span>
            </div>
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20"
              >
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white font-medium">{item.after}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: FileText,
      title: "Envoyez vos factures",
      description: "Photo, email, PDF... Envoyez-nous vos factures comme vous voulez. On s'occupe du reste."
    },
    {
      number: "2",
      icon: Bot,
      title: "L'IA appelle vos clients",
      description: "Notre IA contacte vos clients avec une voix naturelle et professionnelle. Zéro stress pour vous."
    },
    {
      number: "3",
      icon: Banknote,
      title: "Vous êtes payé",
      description: "Recevez une notification à chaque paiement. L'argent arrive directement sur votre compte."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
              ✨ Accessible à tous, même sans compétences techniques
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Simple comme <span className="text-cyan-400">bonjour</span>.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pas besoin d'être un expert en informatique. Envoyez vos factures, on fait le reste.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -translate-y-1/2" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
              >
                <GlassCard className="text-center relative">
                  {/* Step Number Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, type: "spring" }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  >
                    {step.number}
                  </motion.div>

                  <motion.div
                    {...floatingAnimation}
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center mt-4"
                  >
                    <step.icon className="w-8 h-8 text-blue-400" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Méthodes d'envoi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Envoyez vos factures comme vous préférez</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { icon: "📸", label: "Photo" },
              { icon: "📧", label: "Email" },
              { icon: "💬", label: "WhatsApp" },
              { icon: "📄", label: "PDF" },
              { icon: "📊", label: "Excel" },
            ].map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
              >
                <span className="text-lg">{method.icon}</span>
                <span className="text-gray-300 text-sm font-medium">{method.label}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-6">
            Vous n'avez pas Excel ? <span className="text-blue-400">Aucun problème.</span> Une simple photo suffit.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Audio Demo Section
const AudioDemoSection = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 45; // seconds

  useEffect(() => {
    let interval;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (duration * 10));
          setCurrentTime(Math.floor((newProgress / 100) * duration));
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return newProgress;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (progress >= 100) {
      setProgress(0);
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section id="demo" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Écoutez. C'est <span className="text-cyan-400">bluffant</span>.
          </h2>
          <p className="text-gray-400 text-lg">
            Une vraie conversation entre notre IA et un client. Indiscernable d'un humain.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInScale}
        >
          <GlassCard className="p-8 md:p-12">
            {/* Waveform Visualization */}
            <div className="flex items-center justify-center gap-1 h-24 mb-8">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isPlaying ? [8, Math.random() * 80 + 8, 8] : 8,
                    backgroundColor: i < (progress / 2) ? '#22D3EE' : '#3B82F6'
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.02,
                  }}
                  className="w-1 md:w-1.5 rounded-full bg-blue-500"
                  style={{ minHeight: 8 }}
                />
              ))}
            </div>

            {/* Play Button */}
            <div className="flex justify-center mb-8">
              <motion.button
                onClick={togglePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500 rounded-full"
                />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <GlowButton>
            Convaincu ? Testez avec VOS clients
            <ArrowRight className="w-5 h-5" />
          </GlowButton>
        </motion.div>
      </div>
    </section>
  );
};

// Statistics Section
const StatisticsSection = () => {
  const stats = [
    { value: 26, suffix: " jours", prefix: "-", label: "Réduction moyenne des délais de paiement" },
    { value: 94, suffix: "%", prefix: "", label: "Taux de paiement obtenu" },
    { value: 8.7, suffix: "M €", prefix: "", label: "Récupérés pour nos clients", decimals: 1 },
    { value: 4.8, suffix: "/5", prefix: "", label: "Note de satisfaction", decimals: 1 }
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-cyan-600/10" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Des résultats. <span className="text-green-400">Pas des promesses.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, index }) => {
  const { count, ref } = useCountUp(
    stat.decimals ? stat.value * 10 : stat.value,
    2000
  );

  const displayValue = stat.decimals
    ? (count / 10).toFixed(stat.decimals)
    : count;

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
    >
      <GlassCard className="text-center py-8">
        <div className="text-5xl md:text-6xl font-bold mb-2">
          <span className="text-cyan-400">{stat.prefix}</span>
          <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">{displayValue}</span>
          <span className="text-cyan-400">{stat.suffix}</span>
        </div>
        <p className="text-gray-400 text-sm">{stat.label}</p>
      </GlassCard>
    </motion.div>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Jean-Pierre M.",
      role: "Agriculteur, Lot-et-Garonne",
      content: "J'ai récupéré 4 500€ en une semaine. Avant, j'attendais 3 mois minimum.",
      rating: 5,
      initials: "JP"
    },
    {
      name: "Marie D.",
      role: "Artisan électricienne, Lyon",
      content: "Je détestais relancer mes clients. Maintenant, c'est fait et bien fait.",
      rating: 5,
      initials: "MD"
    },
    {
      name: "François T.",
      role: "Gérant TPE BTP, Nantes",
      content: "Le ton des appels est parfait. Mes clients ne se sont même pas rendu compte que c'était une IA.",
      rating: 5,
      initials: "FT"
    },
    {
      name: "Sophie L.",
      role: "Vigneronne, Bourgogne",
      content: "ROI en 15 jours. Le meilleur investissement de l'année.",
      rating: 5,
      initials: "SL"
    },
    {
      name: "Antoine R.",
      role: "Consultant indépendant, Paris",
      content: "Je me concentre enfin sur mon métier. Fini le stress des impayés.",
      rating: 5,
      initials: "AR"
    },
    {
      name: "Isabelle C.",
      role: "Gérante restaurant, Marseille",
      content: "Simple, efficace, et mes relations clients sont préservées.",
      rating: 5,
      initials: "IC"
    }
  ];

  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Ils l'ont testé. <span className="text-blue-400">Ils l'ont adopté.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
            >
              <GlassCard className="h-full">
                {/* Author with Initials */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white text-lg leading-relaxed">
                  <span className="text-5xl text-blue-500/30 font-serif leading-none">&ldquo;</span>
                  {testimonial.content}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Pricing Section - ULTRA CONVERSION
const PricingSection = () => {
  const features = [
    { text: "Appels illimités", highlight: true },
    { text: "Voix IA indiscernable", highlight: true },
    { text: "Dashboard temps réel", highlight: false },
    { text: "Intégrations (Sage, QuickBooks...)", highlight: false },
    { text: "Support prioritaire 7j/7", highlight: false },
    { text: "Sans engagement - Annulez quand vous voulez", highlight: true }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30"
      >
        <div className="absolute inset-0 rounded-full border border-blue-500/20" />
        <div className="absolute inset-8 rounded-full border border-cyan-500/20" />
        <div className="absolute inset-16 rounded-full border border-blue-500/20" />
      </motion.div>

      <div className="max-w-lg mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold border border-green-500/30">
              Rentabilisé dès le 1er mois
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Un tarif simple.<br/><span className="text-cyan-400">Zéro surprise.</span>
          </h2>
          <p className="text-gray-400">
            Pas de frais cachés. Pas d'engagement. Résiliez quand vous voulez.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-[3px] rounded-3xl opacity-75"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #22D3EE, #8B5CF6, #3B82F6)',
              backgroundSize: '300% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute -inset-[3px] rounded-3xl blur-md opacity-50"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #22D3EE, #8B5CF6, #3B82F6)',
              backgroundSize: '300% 100%',
            }}
          />

          <div className="relative bg-[#0a0f1a]/90 backdrop-blur-xl rounded-3xl p-8 md:p-10">
            {/* Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ y: [-3, 3, -3], scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-white font-bold shadow-lg shadow-blue-500/30"
              >
                10 JOURS GRATUITS
              </motion.div>
            </div>

            <div className="text-center pt-6">
              {/* Price */}
              <div className="mb-2">
                <span className="text-gray-500 text-lg line-through mr-2">99€</span>
                <span className="text-green-400 text-sm font-semibold">-50%</span>
              </div>
              <div className="mb-1">
                <span className="relative text-7xl md:text-8xl font-bold text-white">
                  <span className="absolute inset-0 blur-lg text-white/40">50</span>
                  50
                </span>
                <span className="text-3xl text-white font-bold">€</span>
                <span className="text-gray-400 text-xl">/mois HT</span>
              </div>
              <p className="text-gray-500 text-sm mb-8">Soit moins de 2€/jour</p>

              {/* Features */}
              <ul className="space-y-4 mb-8 text-left">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feature.highlight
                        ? 'bg-green-500/30 border border-green-500/50'
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      <Check className={`w-3.5 h-3.5 ${feature.highlight ? 'text-green-400' : 'text-gray-400'}`} />
                    </div>
                    <span className={feature.highlight ? 'text-white font-medium' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <GlowButton
                className="w-full text-lg py-5"
                onClick={(e) => scrollToSection(e, '#cta-form')}
              >
                <Gift className="w-5 h-5" />
                DÉMARRER MON ESSAI GRATUIT
              </GlowButton>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4" /> Paiement sécurisé
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Sans CB pour l'essai
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social proof under pricing */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Rejoint par <span className="text-white font-semibold">+200 entreprises</span> ce mois-ci
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Est-ce que mes clients vont savoir que c'est une IA ?",
      answer: "Non. Notre technologie de voix est indiscernable d'un humain. Et le ton est toujours professionnel et respectueux."
    },
    {
      question: "Comment ça s'intègre avec mon logiciel comptable ?",
      answer: "On se connecte à la plupart des outils : Sage, QuickBooks, Cegid, ou simple import Excel."
    },
    {
      question: "Et si un client veut parler à un humain ?",
      answer: "L'IA peut transférer l'appel ou vous envoyer une notification pour rappeler vous-même."
    },
    {
      question: "C'est légal ?",
      answer: "100% conforme RGPD. Vos données sont hébergées en France et sécurisées."
    },
    {
      question: "Combien de temps avant de voir des résultats ?",
      answer: "En moyenne, nos clients récupèrent leurs premiers paiements sous 48h."
    },
    {
      question: "Je peux annuler quand je veux ?",
      answer: "Oui. Sans engagement, sans frais cachés. Vous arrêtez, c'est fini."
    }
  ];

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Vos questions. <span className="text-blue-400">Nos réponses.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
            >
              <GlassCard
                className="cursor-pointer"
                hover={false}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-400 mt-4 pt-4 border-t border-white/10">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTASection = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const trustElements = [
    { icon: Lock, text: "Données sécurisées" },
    { icon: Zap, text: "Activation en 2 min" },
    { icon: Shield, text: "Pas de CB requise" }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    if (!phone || phone.replace(/\s/g, '').length < 10) {
      newErrors.phone = 'Téléphone invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simule un envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section id="cta-form" className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-green-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Merci ! 🎉</h2>
          <p className="text-gray-400 text-lg">
            Nous vous contactons dans les 24h pour activer votre essai gratuit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="cta-form" className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-violet-600/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-30" />

      {/* Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px]"
      />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Prêt à récupérer <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">votre argent</span> ?
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Vos 10 premiers jours sont 100% gratuits. Sans engagement. Sans CB.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 rounded-3xl blur-xl" />
            <GlassCard className="relative p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email professionnel</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500' : 'border-white/10 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Téléphone</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-white/10 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <GlowButton className="w-full text-lg py-5" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    ENVOI EN COURS...
                  </>
                ) : (
                  <>
                    DÉMARRER MAINTENANT
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </GlowButton>
            </form>

            {/* Trust Elements */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/10">
              {trustElements.map((element, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <element.icon className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{element.text}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const links = [
    { label: "Mentions légales", href: "#" },
    { label: "CGV", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Contact", href: "#" }
  ];

  return (
    <footer className="py-12 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Phone className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">
              Booster<span className="text-blue-500">Pay</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            © 2025 BoosterPay - Made with
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            in France
          </p>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// ANIMATED BACKGROUND - AURORA FLOW
// ============================================

const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll();

  const blueOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.3, 0.1]);
  const cyanOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0.4, 0.5, 0.2]);
  const violetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [0.1, 0.4, 0.5]);
  const emeraldOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.6]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />

      {/* ZONE HAUTE - Dominante BLEUE (Hero) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 30% 10%, rgba(59,130,246,0.5) 0%, transparent 60%)',
          opacity: blueOpacity,
        }}
      />

      {/* ZONE HAUTE-MILIEU - CYAN qui pulse */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 70% 25%, rgba(6,182,212,0.45) 0%, transparent 60%)',
          opacity: cyanOpacity,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ZONE MILIEU - VIOLET qui apparaît au scroll */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 50% at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 55%)',
          opacity: violetOpacity,
        }}
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ZONE MILIEU-DROITE - VIOLET secondaire */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 85% 55%, rgba(167,139,250,0.35) 0%, transparent 60%)',
          opacity: violetOpacity,
        }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* ZONE BASSE - EMERALD dominant (CTA, conversion) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 85%, rgba(16,185,129,0.45) 0%, transparent 50%)',
          opacity: emeraldOpacity,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ZONE BASSE - Touches de CYAN */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 90%, rgba(6,182,212,0.3) 0%, transparent 50%)',
          opacity: emeraldOpacity,
        }}
      />

      {/* Orbe bleu - haut gauche */}
      <motion.div
        className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe violet - milieu */}
      <motion.div
        className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 60%)',
          filter: 'blur(70px)',
        }}
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe emerald - bas */}
      <motion.div
        className="absolute -bottom-32 left-1/4 w-[800px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.4) 0%, transparent 60%)',
          filter: 'blur(90px)',
        }}
        animate={{ x: [0, 80, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe cyan - bas droite */}
      <motion.div
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{ y: [0, -40, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grain subtil */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// ============================================
// LOADER COMPONENT
// ============================================

const Loader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] bg-[#0a0f1a] flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-2xl font-bold text-white">
            Booster<span className="text-blue-500">Pay</span>
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const BoosterPayLanding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="min-h-screen text-white overflow-x-hidden">
        {/* Aurora Flow Animated Background */}
        <AnimatedBackground />

        {/* Scroll Progress */}
        <ScrollProgress />

        {/* Sticky Top Bar */}
        <StickyTopBar />

        {/* Navigation */}
        <Navigation onOpenDemo={() => setIsAudioModalOpen(true)} />

        {/* Main Content */}
        <main>
          <HeroSection onOpenDemo={() => setIsAudioModalOpen(true)} />
          <UrgencyBanner />
          <LogoCarousel />
          <ProblemSection />
          <SolutionSection />
          <HowItWorksSection />
          <AudioDemoSection isOpen={isAudioModalOpen} onClose={() => setIsAudioModalOpen(false)} />
          <StatisticsSection />
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <FinalCTASection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default BoosterPayLanding;
