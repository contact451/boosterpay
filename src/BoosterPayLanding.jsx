import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Heart,
  Upload,
  ChevronUp,
  Loader2,
  Euro,
  Calendar,
  User,
  HelpCircle
} from 'lucide-react';
import DeferredLeadCapture from './components/DeferredLeadCapture';
import MobileStickyCTA from './components/MobileStickyCTA';

// ============================================
// MOBILE DETECTION HOOK
// ============================================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

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

// === BOOKING MODAL COMPONENT ===
const BookingModal = ({ isOpen, onClose }) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const badges = [
    { icon: "✅", text: "100% Gratuit" },
    { icon: "⚡️", text: "Dispo aujourd'hui" },
    { icon: "🤝", text: "Sans engagement" },
    { icon: "🔒", text: "Données sécurisées" },
  ];

  // MOBILE VERSION
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[300] bg-black/90"
            />

            {/* Modal Mobile - Bottom sheet style */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 z-[301] bg-[#0f172a] rounded-t-3xl border-t border-x border-blue-500/30"
              style={{ maxHeight: '95vh' }}
            >
              {/* Header */}
              <div className="p-3 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-t-3xl">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🚀</span>
                      <span>Prêt à automatiser votre trésorerie ?</span>
                    </h2>
                    <p className="text-gray-300 text-xs mt-1">
                      Échangez 15 min avec un expert pour configurer votre IA.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Calendar iframe */}
              <div className="p-2" style={{ height: '70vh' }}>
                <div className="rounded-xl overflow-hidden bg-white h-full">
                  <iframe
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1a3ileaN1Jry5bswWVf9kB1YVlLPzjwXAbgOAgEJTCdva3yvBaTde-Wdt01MYcJNF3dYAAn-FP?gv=true"
                    className="w-full h-full border-0"
                    title="Réserver un appel"
                  />
                </div>
              </div>

              {/* Footer badges - compact */}
              <div className="p-2 border-t border-white/10 bg-[#0a0f1a]">
                <div className="flex justify-center gap-4 text-[10px] text-gray-400">
                  <span>✅ Gratuit</span>
                  <span>⚡️ Dispo aujourd&apos;hui</span>
                  <span>🔒 Sécurisé</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // DESKTOP VERSION
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Desktop - Centered with flexbox */}
          <div className="fixed inset-0 z-[301] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.2)] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span>🚀</span>
                      <span>Prêt à automatiser votre trésorerie ?</span>
                    </h2>
                    <p className="text-gray-300 mt-2">
                      Échangez 15 min avec un expert pour configurer votre IA.
                    </p>
                  </div>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Calendar iframe */}
              <div className="p-5">
                <div className="rounded-xl overflow-hidden bg-white">
                  <iframe
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1a3ileaN1Jry5bswWVf9kB1YVlLPzjwXAbgOAgEJTCdva3yvBaTde-Wdt01MYcJNF3dYAAn-FP?gv=true"
                    className="w-full border-0"
                    style={{ height: '450px' }}
                    title="Réserver un appel"
                  />
                </div>
              </div>

              {/* Footer badges */}
              <div className="px-6 pb-6">
                <div className="flex flex-wrap justify-center gap-6">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-lg">{badge.icon}</span>
                      <span className="text-gray-200 text-sm">{badge.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// === COMPOSANT BOOKING BUTTON ===
const BookingButton = ({ variant = 'default', className = '', openModal, icon, label }) => {
  const ctaMap = {
    'nav-compact': { icon: "📞", text: "Parler à un expert" },
    'hero': { icon: "📅", text: "Réserver mon audit gratuit (15 min)" },
    'how-it-works': { icon: "📞", text: "Des questions ? On vous rappelle" },
    'pricing': { icon: "📅", text: "Configurer mon IA avec un expert" },
    'footer-compact': { icon: "📞", text: "Discuter avec l'équipe" },
    'need-help': { icon: "📅", text: "Booker mon audit gratuit" },
  };

  const cta = ctaMap[variant] || { icon: icon || "📅", text: label || "Réserver un audit gratuit" };

  const variants = {
    'nav-compact': (
      <motion.button
        onClick={openModal}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500/20 border-2 border-purple-400/70 text-white overflow-hidden group hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all text-sm font-semibold ${className}`}
      >
        <motion.div
          className="absolute inset-0 bg-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        />
        <motion.span
          className="text-base relative z-10"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {cta.icon}
        </motion.span>
        <span className="relative z-10">{cta.text}</span>
      </motion.button>
    ),
    'hero': (
      <motion.button
        onClick={openModal}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.95 }}
        className={`relative group w-full sm:w-auto overflow-hidden ${className}`}
      >
        {/* Glow pulsant */}
        <motion.div
          className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 opacity-70 blur-xl"
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bordure animée arc-en-ciel */}
        <motion.div
          className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        />
        <div className="relative flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg sm:text-xl">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.span>
          <span>Réserver mon audit gratuit</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            →
          </motion.span>
        </div>
      </motion.button>
    ),
    'how-it-works': (
      <motion.button
        onClick={openModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all font-medium ${className}`}
      >
        <motion.span
          className="absolute inset-0 rounded-xl bg-purple-500/20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="relative">{cta.icon}</span>
        <span className="relative">{cta.text}</span>
      </motion.button>
    ),
    'pricing': (
      <motion.button
        onClick={openModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all font-medium ${className}`}
      >
        <motion.span
          className="absolute inset-0 rounded-xl bg-purple-500/20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="relative">{cta.icon}</span>
        <span className="relative">{cta.text}</span>
      </motion.button>
    ),
    'footer-compact': (
      <button
        onClick={openModal}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all text-sm font-medium ${className}`}
      >
        <span>{cta.icon}</span>
        <span>{cta.text}</span>
      </button>
    ),
    'need-help': (
      <motion.button
        onClick={openModal}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative group w-full ${className}`}
      >
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
        <div className="relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg">
          <span>{cta.icon}</span>
          <span>{cta.text}</span>
        </div>
      </motion.button>
    ),
  };

  // Fallback for legacy variant names
  if (variant === 'compact') return variants['nav-compact'];
  if (variant === 'default') return variants['how-it-works'];
  if (variant === 'large') return variants['need-help'];
  if (variant === 'text') return (
    <button
      onClick={openModal}
      className={`text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors ${className}`}
    >
      {"Parler à un expert →"}
    </button>
  );

  return variants[variant] || variants['how-it-works'];
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
  const isMobile = useIsMobile();
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
          className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/90 to-cyan-500/90 ${isMobile ? '' : 'backdrop-blur-md'} border-b border-white/10`}
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm md:text-base">
            <span className="text-yellow-300 animate-pulse">🔥</span>
            <span className="text-white">
              Rejoignez <span className="font-bold text-yellow-300">{count.toLocaleString()}+</span> entreprises qui ont déjà accéléré leur trésorerie
            </span>
            <motion.button
              onClick={(e) => scrollToSection(e, '#pricing')}
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
const Navigation = ({ onOpenDemo, onOpenBooking }) => {
  const isMobile = useIsMobile();
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
          isScrolled ? `bg-[#0a0f1a]/95 ${isMobile ? '' : 'backdrop-blur-lg'} border-b border-white/5` : ''
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
              {!isMobile && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500 rounded-full blur-md"
                />
              )}
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

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <BookingButton variant="nav-compact" openModal={onOpenBooking} />
            <MagneticButton onClick={(e) => scrollToSection(e, '#pricing')}>
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
            className="fixed inset-0 z-[9999] bg-[#0a0f1a]"
          >
            {/* Header avec bouton X */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <span className="text-2xl font-bold text-white">
                Booster<span className="text-blue-500">Pay</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-full bg-white/10 text-white active:bg-white/20 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8">
              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(e, link.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-3xl text-white font-semibold py-4 border-b border-white/10 hover:text-blue-400 transition-colors active:text-blue-400"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="p-6 space-y-3 border-t border-white/10">
              {/* Bouton Parler à un expert - Effet pulse */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenBooking();
                  setIsMobileMenuOpen(false);
                }}
                className="relative w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg flex items-center justify-center gap-2 overflow-hidden touch-manipulation"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <span>📞</span> Parler à un expert
                </span>
              </motion.button>

              {/* Bouton Essai Gratuit - Effet shimmer */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToSection(e, '#pricing');
                  setIsMobileMenuOpen(false);
                }}
                className="relative w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg flex items-center justify-center gap-2 overflow-hidden touch-manipulation"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <span>🎁</span> Essai Gratuit 10 Jours
                </span>
              </motion.button>
            </div>
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
  const isMobile = useIsMobile();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={isMobile ? {} : { scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={`relative px-8 py-4 font-bold rounded-xl overflow-hidden group ${
        secondary
          ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
          : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white'
      } ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {!secondary && !isMobile && (
        <>
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          {/* Glow */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59,130,246,0.5)",
                "0 0 40px rgba(34,211,238,0.6)",
                "0 0 20px rgba(59,130,246,0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}
    </motion.button>
  );
};

// Glassmorphism Card Component
const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover && !isMobile ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative p-6 rounded-2xl ${isMobile ? 'bg-white/[0.05]' : 'bg-white/[0.03] backdrop-blur-xl'} border border-white/[0.08] overflow-hidden group ${className}`}
    >
      {!isMobile && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      {!isMobile && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: 'inset 0 0 40px rgba(59,130,246,0.15), inset 0 0 80px rgba(6,182,212,0.08)' }}
        />
      )}
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
const HeroSection = ({ onOpenDemo, onOpenBooking }) => {
  const isMobile = useIsMobile();
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
            animate={isMobile ? {} : { scale: [1, 1.2, 1] }}
            transition={isMobile ? {} : { duration: 2, repeat: Infinity }}
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
              animate={isMobile ? {} : { opacity: [1, 0] }}
              transition={isMobile ? {} : { duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-blue-400 ml-1 align-middle"
            />
          )}
        </motion.p>

        {/* Hero CTA Buttons - Version Clean */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-10 mb-12"
        >
          {/* Bouton 1 - Essai Gratuit */}
          <motion.button
            onClick={(e) => scrollToSection(e, '#pricing')}
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/40 flex items-center justify-center gap-3 overflow-hidden"
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
              animate={{ x: ['-150%', '150%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
            />
            <span className="relative z-10">🚀</span>
            <span className="relative z-10">10 jours d'essai gratuit</span>
          </motion.button>

          {/* Bouton 2 - Appel Expert */}
          <motion.button
            onClick={onOpenBooking}
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(168,85,247,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-500/40 flex items-center justify-center gap-3"
          >
            <span>📞</span>
            <span>Appel expert · 15 min</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
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
          {!isMobile && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 bg-blue-500/30 rounded-full blur-[60px]" />
            </div>
          )}

          <motion.div
            animate={isMobile ? {} : { y: [-15, 15, -15] }}
            transition={isMobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
              <div className="bg-[#0a0f1a]/90 md:bg-[#0a0f1a]/80 md:backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg">
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

// ============================================
// TEST AI SECTION
// ============================================

const TestAISection = ({ onOpenBooking }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [formData, setFormData] = useState({ name: '', amount: '', dueDate: '' });
  const [isManualScanning, setIsManualScanning] = useState(false);
  const [manualScanText, setManualScanText] = useState('');
  const [isImportScanning, setIsImportScanning] = useState(false);
  const [importScanText, setImportScanText] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importedFile, setImportedFile] = useState(null);
  const [simulatedCount, setSimulatedCount] = useState(0);
  const fileInputRef = useRef(null);

  const isFormValid = formData.name && formData.amount && formData.dueDate;

  // Lock scroll quand modal ouvert
  useEffect(() => {
    if (showResultModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showResultModal]);

  const sanitizeInput = (value, type = 'text') => {
    let sanitized = value.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '');
    if (type === 'name') {
      sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '').slice(0, 100);
    } else if (type === 'amount') {
      sanitized = sanitized.replace(/[^0-9.]/g, '').slice(0, 10);
      const parts = sanitized.split('.');
      if (parts.length > 2) sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    return sanitized;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsManualScanning(true);
    setImportedFile(null);
    const steps = [
      'Analyse des données...',
      'Calcul du script optimal...',
      'Vérification des informations...',
      '✓ Prêt !'
    ];

    for (const step of steps) {
      setManualScanText(step);
      await new Promise((r) => setTimeout(r, 750));
    }

    setIsManualScanning(false);
    setShowResultModal(true);
  }, [isFormValid]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const runFileScan = useCallback(async (file) => {
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      setImportMessage('❌ Format non supporté. Utilisez un fichier CSV ou Excel.');
      setTimeout(() => setImportMessage(''), 3000);
      return;
    }

    setImportedFile({ name: file.name, size: file.size });
    setSimulatedCount(Math.floor(Math.random() * 21) + 5);

    setIsImportScanning(true);
    const steps = [
      'Lecture du fichier...',
      'Analyse des données...',
      'Extraction des factures...',
      '✓ Import terminé !'
    ];

    for (const step of steps) {
      setImportScanText(step);
      await new Promise((r) => setTimeout(r, 750));
    }

    setIsImportScanning(false);
    setShowResultModal(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) runFileScan(file);
  }, [runFileScan]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) runFileScan(file);
    e.target.value = '';
  }, [runFileScan]);

  const closeModal = useCallback(() => {
    setShowResultModal(false);
    setImportedFile(null);
    setSimulatedCount(0);
    setFormData({ name: '', amount: '', dueDate: '' });
  }, []);

  const exportGuides = [
    { name: 'Pennylane', steps: 'Ventes > Factures > Tout sélectionner > Exporter CSV' },
    { name: 'QuickBooks', steps: 'Ventes > Toutes les ventes > Icône Export > Excel' },
    { name: 'Sage / Cegid', steps: 'Journal des ventes > Actions > Exportation > CSV/Excel' },
    { name: 'Excel / Sheets', steps: 'Fichier > Enregistrer sous > .csv (Colonnes : Nom, Tel, Montant, Échéance)' },
  ];

  // Contenu partagé du modal résultat
  const resultContent = (
    <div className="p-6 space-y-5">
      {/* Icône succès */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-green-400" />
        </motion.div>
      </div>

      {importedFile ? (
        <>
          <h3 className="text-xl font-bold text-white text-center">
            {simulatedCount} factures prêtes à être relancées ! 🚀
          </h3>
          <p className="text-gray-400 text-sm text-center">
            Notre IA a analysé <span className="text-cyan-400 font-medium">{importedFile.name}</span> et préparé les scripts de relance optimisés pour chaque client.
          </p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Fichier</span>
              <span className="text-white font-medium truncate max-w-[180px]">{importedFile.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Factures détectées</span>
              <span className="text-white font-medium">{simulatedCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Scripts générés</span>
              <span className="text-green-400 font-medium">✓ {simulatedCount} prêts</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-white text-center">
            {formData.amount}€ prêts à être récupérés ! 🚀
          </h3>
          <p className="text-gray-400 text-sm text-center">
            Notre IA a préparé un script de relance optimisé pour {formData.name}. Elle est prête à passer l&apos;appel maintenant pour sécuriser votre paiement.
          </p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Nom</span>
              <span className="text-white font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2"><Euro className="w-3.5 h-3.5" /> Montant</span>
              <span className="text-white font-medium">{formData.amount}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Échéance</span>
              <span className="text-white font-medium">{new Date(formData.dueDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </>
      )}

      {/* CTAs */}
      <button
        onClick={() => { closeModal(); navigate('/onboarding/import'); }}
        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all active:scale-[0.98]"
      >
        {importedFile ? 'Lancer les appels IA maintenant' : 'Lancer l\'appel IA gratuitement'}
      </button>
      <button
        onClick={() => { closeModal(); onOpenBooking(); }}
        className="w-full py-3.5 rounded-xl font-semibold text-violet-400 border border-violet-500/50 hover:bg-violet-500/10 transition-all active:scale-[0.98]"
      >
        Parler à un expert (15 min)
      </button>

      {/* Badge réassurance */}
      <p className="text-center text-xs text-gray-500">
        🔒 Sans engagement • Essai 10 jours gratuit
      </p>
    </div>
  );

  // Variantes pour entrées staggerées
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <>
      <section id="test-ai" ref={sectionRef} className="relative py-20 md:py-28 px-4 overflow-hidden">
        {/* Fond spectaculaire */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isMobile ? (
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-transparent to-violet-950/20" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" />

              {/* Grille perspective */}
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                  transform: 'perspective(500px) rotateX(60deg)',
                  transformOrigin: 'center top',
                  maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                }}
              />

              {/* Orbe cyan */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Orbe violet */}
              <motion.div
                className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }}
                animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Ligne lumineuse */}
              <motion.div
                className="absolute top-1/2 left-0 right-0 h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' }}
                animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Particules */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`p-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-cyan-400"
                  style={{ left: `${10 + (i * 4.2) % 80}%`, top: `${5 + (i * 7.3) % 90}%`, opacity: 0.3 + (i % 5) * 0.08 }}
                  animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
                  transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: (i % 7) * 0.3, ease: 'easeInOut' }}
                />
              ))}
            </>
          )}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Titre section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <motion.span
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold mb-6"
              animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.2)', '0 0 40px rgba(6,182,212,0.4)', '0 0 20px rgba(6,182,212,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>⚡</motion.span>
              Testez maintenant — 100% gratuit
            </motion.span>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Testez l&apos;IA en{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">30 secondes</span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
            </h2>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Entrez une facture impayée et voyez la <span className="text-white font-medium">magie</span> opérer
            </p>
          </motion.div>

          {/* Grille 2 colonnes */}
          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {/* Colonne gauche : Formulaire / Scan */}
            <motion.div variants={cardVariants}>
              <div className="relative rounded-2xl p-[2px] overflow-hidden group">
                {/* Bordure gradient animée */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6, #EC4899, #06B6D4)',
                    backgroundSize: '400% 400%',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />

                {/* Glow externe au hover */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}
                />

                <div className="relative bg-[#0a0f1a]/90 backdrop-blur-xl rounded-2xl p-6 min-h-[350px]">
                  {/* Reflet interne */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                  <AnimatePresence mode="wait">
                    {isManualScanning ? (
                      /* Animation de scan MANUEL améliorée */
                      <motion.div
                        key="manual-scan"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative flex flex-col items-center justify-center h-full py-12 gap-8"
                      >
                        <div className="relative">
                          {/* Cercles concentriques */}
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute rounded-full border-2 border-cyan-500/30"
                              style={{ width: 96 + i * 40, height: 96 + i * 40, left: -(i * 20), top: -(i * 20) }}
                              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            />
                          ))}
                          {/* Cercle principal */}
                          <motion.div
                            className="relative w-24 h-24 rounded-full border-4 border-cyan-500 flex items-center justify-center bg-cyan-500/10"
                            animate={{
                              boxShadow: [
                                '0 0 20px rgba(6,182,212,0.3), inset 0 0 20px rgba(6,182,212,0.1)',
                                '0 0 50px rgba(6,182,212,0.6), inset 0 0 30px rgba(6,182,212,0.2)',
                                '0 0 20px rgba(6,182,212,0.3), inset 0 0 20px rgba(6,182,212,0.1)',
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                              <Loader2 className="w-10 h-10 text-cyan-400" />
                            </motion.div>
                          </motion.div>
                        </div>

                        <div className="text-center">
                          <motion.p
                            key={manualScanText}
                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            className="text-white font-semibold text-lg"
                          >
                            {manualScanText}
                          </motion.p>
                          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 3, ease: 'linear' }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* Formulaire */
                      <motion.div
                        key="manual-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Ajout rapide</h3>
                            <p className="text-xs text-gray-400">Entrez une facture pour tester</p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="relative group/input">
                            <label htmlFor="tai-name" className="block text-sm text-gray-300 mb-1.5 group-focus-within/input:text-cyan-400 transition-colors">Nom du client</label>
                            <div className="relative">
                              <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                              <input
                                id="tai-name"
                                type="text"
                                placeholder="Ex : Société Dupont"
                                value={formData.name}
                                onChange={(e) => setFormData((f) => ({ ...f, name: sanitizeInput(e.target.value, 'name') }))}
                                maxLength={100}
                                required
                                className="relative w-full h-[56px] bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/[0.08] transition-all duration-300"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="relative group/input">
                              <label htmlFor="tai-amount" className="block text-sm text-gray-300 mb-1.5 group-focus-within/input:text-cyan-400 transition-colors">Montant €</label>
                              <div className="relative">
                                <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                <input
                                  id="tai-amount"
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="1500"
                                  value={formData.amount}
                                  onChange={(e) => setFormData((f) => ({ ...f, amount: sanitizeInput(e.target.value, 'amount') }))}
                                  maxLength={10}
                                  required
                                  className="relative w-full h-[56px] bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/[0.08] transition-all duration-300"
                                />
                              </div>
                            </div>
                            <div className="relative group/input">
                              <label htmlFor="tai-duedate" className="block text-sm text-gray-300 mb-1.5 group-focus-within/input:text-cyan-400 transition-colors">Échéance</label>
                              <div className="relative">
                                <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                <div
                                  className="relative cursor-pointer"
                                  onClick={() => document.getElementById('tai-duedate').showPicker?.()}
                                >
                                  <input
                                    id="tai-duedate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))}
                                    required
                                    className="w-full h-[56px] bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/[0.08] transition-all duration-300 cursor-pointer [color-scheme:dark]"
                                  />
                                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bouton CTA spectaculaire */}
                          <motion.button
                            type="submit"
                            disabled={!isFormValid}
                            whileHover={isFormValid ? { scale: 1.02, y: -2 } : {}}
                            whileTap={isFormValid ? { scale: 0.98 } : {}}
                            className={`relative w-full h-[56px] rounded-xl font-bold text-white overflow-hidden transition-all duration-300 ${
                              isFormValid ? 'cursor-pointer' : 'bg-gray-800/50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {isFormValid && (
                              <>
                                <motion.div
                                  className="absolute inset-0"
                                  style={{ background: 'linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6, #3B82F6, #06B6D4)', backgroundSize: '200% 100%' }}
                                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                />
                                <motion.div
                                  className="absolute inset-0"
                                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', transform: 'skewX(-20deg)' }}
                                  animate={{ x: ['-200%', '200%'] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                />
                                <motion.div
                                  className="absolute -inset-1 rounded-xl"
                                  style={{ background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)', filter: 'blur(15px)' }}
                                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              </>
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              Lancer l&apos;Analyse IA
                              <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                              >
                                ⚡
                              </motion.span>
                            </span>
                          </motion.button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Colonne droite : Import CSV */}
            <motion.div variants={cardVariants}>
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 h-full min-h-[350px] group hover:border-violet-500/30 transition-all duration-500">
                {/* Glow au hover */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(25px)' }}
                />
                {/* Reflet interne */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />

                <AnimatePresence mode="wait">
                  {isImportScanning ? (
                    /* Animation de scan IMPORT améliorée */
                    <motion.div
                      key="import-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative flex-1 flex flex-col items-center justify-center gap-8 h-full"
                    >
                      <div className="relative">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute rounded-full border-2 border-violet-500/30"
                            style={{ width: 96 + i * 40, height: 96 + i * 40, left: -(i * 20), top: -(i * 20) }}
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          />
                        ))}
                        <motion.div
                          className="relative w-24 h-24 rounded-full border-4 border-violet-500 flex items-center justify-center bg-violet-500/10"
                          animate={{
                            boxShadow: [
                              '0 0 20px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.1)',
                              '0 0 50px rgba(139,92,246,0.6), inset 0 0 30px rgba(139,92,246,0.2)',
                              '0 0 20px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.1)',
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                            <Loader2 className="w-10 h-10 text-violet-400" />
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="text-center">
                        <motion.p
                          key={importScanText}
                          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          className="text-white font-semibold text-lg"
                        >
                          {importScanText}
                        </motion.p>
                        {importedFile && (
                          <p className="text-violet-400 text-sm mt-2 truncate max-w-[250px] mx-auto">📄 {importedFile.name}</p>
                        )}
                        <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                          <motion.div
                            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3, ease: 'linear' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* Zone d'import normale */
                    <motion.div
                      key="import-zone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative flex flex-col h-full"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Import en masse</h3>
                          <p className="text-xs text-gray-400">Importez toutes vos factures d&apos;un coup</p>
                        </div>
                      </div>

                      {/* Zone Drag & Drop améliorée */}
                      <motion.div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleImportClick}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImportClick(); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Importer un fichier CSV ou Excel"
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex-1 min-h-[160px] md:min-h-[180px] rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 overflow-hidden ${
                          isDragging
                            ? 'bg-violet-500/20 shadow-[0_0_40px_rgba(124,58,237,0.4)] border-2 border-violet-400'
                            : 'animated-border-dashed hover:bg-violet-500/5'
                        }`}
                      >
                        {/* Effet vagues drag */}
                        {isDragging && (
                          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="absolute inset-0 border-2 border-violet-400/30 rounded-xl"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                              />
                            ))}
                          </motion.div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xls,.xlsx"
                          onChange={handleFileSelect}
                          className="hidden"
                          aria-hidden="true"
                        />

                        <motion.div
                          className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center"
                          animate={isDragging ? { y: [0, -10, 0] } : {}}
                          transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                        >
                          <Upload className={`w-7 h-7 transition-colors duration-300 ${isDragging ? 'text-violet-300' : 'text-violet-400'}`} />
                        </motion.div>

                        <div className="text-center px-4">
                          <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-violet-200' : 'text-gray-300'}`}>
                            {isDragging ? 'Lâchez pour analyser !' : 'Glissez votre fichier CSV ou Excel'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">.csv, .xlsx, .xls</p>
                        </div>
                      </motion.div>

                      {/* Message feedback */}
                      <AnimatePresence>
                        {importMessage && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-3 text-sm text-center text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg py-2 px-3"
                          >
                            {importMessage}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Accordéon aide export */}
                      <div className="mt-4">
                        <button
                          onClick={() => setIsHelpOpen((o) => !o)}
                          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors w-full justify-start"
                          aria-expanded={isHelpOpen}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Comment exporter mes factures ?</span>
                          {isHelpOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                        </button>

                        <AnimatePresence>
                          {isHelpOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-2">
                                {exportGuides.map((g) => (
                                  <div key={g.name} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                                    <p className="text-sm font-semibold text-white">{g.name}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{g.steps}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Capture lead différée - sous le simulateur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <DeferredLeadCapture variant="compact" />
          </motion.div>
        </div>
      </section>

      {/* Modal résultat — Desktop */}
      <AnimatePresence>
        {showResultModal && !isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <div
                className="bg-[#0f172a] rounded-2xl border border-cyan-500/30 w-full max-w-md shadow-[0_0_60px_rgba(6,182,212,0.2)] relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {resultContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer résultat — Mobile */}
      <AnimatePresence>
        {showResultModal && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[201] bg-[#0f172a] rounded-t-3xl border-t border-cyan-500/30"
              style={{ maxHeight: '85vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
              </div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 32px)' }}>
                {resultContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 relative overflow-hidden"
    >
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/20 to-orange-500/10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <p className="text-white text-sm md:text-base flex flex-wrap items-center justify-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="text-lg"
          >
            🔥
          </motion.span>
          <span className="font-bold text-orange-400">Offre de lancement</span>
          <span>: Essai gratuit étendu à 10 jours —</span>
          <span className="font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/20">
            <motion.span
              key={timeLeft.seconds}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block"
            >
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </motion.span>
          </span>
        </p>
      </div>
    </motion.section>
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
    { name: "Ferme du Soleil", sector: "Agriculture" },
    { name: "Maçonnerie Dupont", sector: "Construction" },
    { name: "Auto Pièces 33", sector: "Auto" },
    { name: "Caves Bordelaises", sector: "Viticulteurs" },
    { name: "Charpentes Bois", sector: "Artisans" },
    { name: "Transport Express", sector: "Logistique" },
    { name: "Électricité Plus", sector: "Artisans" },
    { name: "Mécanique Générale", sector: "Auto" },
  ];

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-gray-500 text-sm mb-8 md:mb-10 uppercase tracking-wider">
          Ils nous font confiance
        </p>
        <div className="relative overflow-hidden">
          {/* CSS Animation - GPU accelerated, works smoothly on mobile */}
          <div className="animate-scroll-left flex gap-6 md:gap-8 whitespace-nowrap">
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center px-6 md:px-8 py-3 md:py-4 min-w-[140px] md:min-w-[180px]"
              >
                <span className="text-white font-semibold text-base md:text-lg tracking-tight">{logo.name}</span>
                <span className="text-gray-500 text-xs mt-1">{logo.sector}</span>
              </div>
            ))}
          </div>
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
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 300 } }}
            >
              <GlassCard className="text-center border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center"
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  <point.icon className="w-8 h-8 text-red-400" />
                </motion.div>
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
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                >
                  <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                </motion.div>
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
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                whileHover={{ x: -5, scale: 1.02 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                >
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                </motion.div>
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
              <span className="hidden md:inline">✨ Accessible à tous, même sans compétences techniques</span>
              <span className="md:hidden">✨ Simple, sans compétences techniques</span>
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
          {/* Connection Line - Animated */}
          <motion.div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent origin-left"
            />
          </motion.div>

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
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GlassCard className="text-center relative hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                  {/* Step Number Badge - Animated */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.2 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/50"
                  >
                    {step.number}
                  </motion.div>

                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center mt-6"
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
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <GlassCard className="h-full hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-shadow">
                {/* Author with Initials */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
                  >
                    <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                  </motion.div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                {/* Stars animées */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
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
const PricingSection = ({ onOpenBooking }) => {
  const isMobile = useIsMobile();
  const [isAnnual, setIsAnnual] = useState(false);
  const { count: companiesCount, ref: companiesRef } = useCountUp(847, 2000);

  const plans = [
    {
      name: "STARTER",
      tagline: "L'essentiel pour automatiser",
      monthlyPrice: 49,
      annualPrice: 39,
      highlight: "LE PLUS SIMPLE",
      icon: "\u{1F680}",
      features: [
        "Jusqu'\u00e0 20 factures/mois",
        "IA Vocale + SMS + Email",
        "Relances automatiques 24/7",
        "Tableau de bord temps r\u00e9el",
        "Support par email"
      ],
      cta: "Essayer 10 jours gratuit",
      ctaSubtext: "Sans CB \u2022 Sans engagement",
      popular: false,
      gradient: "from-slate-600 to-slate-700",
      commission: null
    },
    {
      name: "PRO",
      tagline: "La machine \u00e0 cash",
      monthlyPrice: 129,
      annualPrice: 103,
      highlight: "LE PLUS RENTABLE",
      icon: "\u2B50",
      features: [
        "Jusqu'\u00e0 100 factures/mois",
        "IA Vocale + SMS + Email",
        "Synchronisation comptable auto",
        "Statistiques avanc\u00e9es",
        "Support prioritaire"
      ],
      cta: "\u{1F4B0} Essayer 10 jours gratuit",
      ctaSubtext: "Sans CB \u2022 Sans engagement",
      popular: true,
      badge: "\u2B50 LE PLUS POPULAIRE",
      gradient: "from-blue-600 to-cyan-500",
      commission: {
        percent: "0,5%",
        context: "sur montants r\u00e9cup\u00e9r\u00e9s"
      }
    },
    {
      name: "BUSINESS",
      tagline: "L'arsenal complet",
      monthlyPrice: 299,
      annualPrice: 239,
      highlight: "LE PLUS PUISSANT",
      icon: "\u{1F48E}",
      features: [
        "Jusqu'\u00e0 500 factures/mois",
        "IA Vocale + SMS + Email",
        "Account Manager d\u00e9di\u00e9",
        "Int\u00e9grations illimit\u00e9es",
        "Support VIP 7j/7"
      ],
      cta: "Essayer 10 jours gratuit",
      ctaSubtext: "Sans CB \u2022 Sans engagement",
      popular: false,
      gradient: "from-purple-600 to-pink-500",
      commission: {
        percent: "0,3%",
        context: "sur montants r\u00e9cup\u00e9r\u00e9s"
      }
    }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Orbes lumineuses flottantes */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
              x: [0, -40, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            {"Transformez vos impay\u00e9s en "}
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              cash.
            </span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            {"Pendant que vous vous concentrez sur votre m\u00e9tier,"}
            <br/>
            <span className="text-white font-medium">{"l'IA r\u00e9cup\u00e8re ce qu'on vous doit."}</span>
          </p>
        </motion.div>

        {/* Toggle mensuel/annuel */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12">
          <span className={`text-sm md:text-base font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 md:w-16 h-7 md:h-8 rounded-full transition-colors ${isAnnual ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <motion.div
              className="absolute top-1 w-5 md:w-6 h-5 md:h-6 bg-white rounded-full shadow-md"
              animate={{ left: isAnnual ? 'calc(100% - 24px)' : '4px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm md:text-base font-medium transition-colors ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
            Annuel
          </span>
          <span className="ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] md:text-xs font-bold rounded-full">
            -20%
          </span>
        </div>

        {/* Grille des 3 cartes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto px-2 md:px-4 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={!isMobile ? { y: -12, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } } : {}}
              className={`relative group ${plan.popular ? 'md:scale-[1.05] md:z-20 order-first md:order-none' : 'md:z-10'}`}
            >
              {/* Badge 10 jours gratuits */}
              <motion.div
                className={`absolute -top-3 z-20 ${plan.popular ? 'left-4' : 'right-4'}`}
                animate={isMobile ? {} : { y: [-2, 2, -2] }}
                transition={isMobile ? {} : { duration: 2, repeat: Infinity }}
              >
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-white text-xs font-bold shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                  {"\u{1F381} 10 JOURS GRATUITS"}
                </span>
              </motion.div>

              {/* Glow PRO */}
              {plan.popular && (
                <>
                  <motion.div
                    className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 opacity-75 blur-lg"
                    animate={isMobile ? {} : {
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.02, 1]
                    }}
                    transition={isMobile ? {} : { duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -inset-[2px] rounded-3xl"
                    style={{
                      background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #8B5CF6, #3B82F6)',
                      backgroundSize: '300% 100%',
                    }}
                    animate={isMobile ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={isMobile ? {} : { duration: 4, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Badge flottant */}
                  <motion.div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 z-30"
                    animate={isMobile ? {} : { y: [-3, 3, -3] }}
                    transition={isMobile ? {} : { duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black text-[10px] md:text-xs font-bold whitespace-nowrap shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      <span>LE PLUS POPULAIRE</span>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Reflet lumineux au hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

              {/* Bordure gradient subtile (non-PRO) */}
              {!plan.popular && (
                <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-white/20 to-white/5">
                  <div className="h-full w-full rounded-3xl bg-slate-900/90 backdrop-blur-xl" />
                </div>
              )}

              {/* Carte */}
              <div className={`relative h-full rounded-3xl p-4 md:p-8 ${
                plan.popular ? 'bg-slate-900/95 backdrop-blur-xl' : ''
              }`}>

                {/* Header carte */}
                <div className="text-center mb-6">
                  <motion.span
                    className="text-4xl mb-3 block"
                    animate={isMobile ? {} : { rotate: [0, 10, -10, 0] }}
                    transition={isMobile ? {} : { duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {plan.icon}
                  </motion.span>

                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-gradient-to-r ${plan.gradient} text-white mb-3`}>
                    {plan.highlight}
                  </span>

                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.tagline}</p>
                </div>

                {/* Prix */}
                <div className="text-center mb-6">
                  <motion.div
                    key={isAnnual ? `${plan.name}-annual` : `${plan.name}-monthly`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative inline-block"
                  >
                    <div className={`absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r ${plan.gradient}`} />
                    <span className="relative text-4xl md:text-5xl font-bold text-white">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-lg md:text-xl text-gray-400">{"\u20AC"}</span>
                    <span className="text-gray-500 text-sm md:text-base">/mois HT</span>
                  </motion.div>

                  {isAnnual && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-green-400 text-sm mt-2 font-medium"
                    >
                      {"-20% sur l'ann\u00e9e"}
                    </motion.p>
                  )}
                </div>

                {/* Badge sans carte bancaire */}
                <div className="flex justify-center mt-3 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <span className="text-emerald-400 text-xs font-medium">Sans carte bancaire</span>
                  </div>
                </div>

                {/* Badge sans engagement */}
                <div className="text-center mb-6">
                  <motion.span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-xs font-semibold border border-green-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Sans engagement
                  </motion.span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.li>
                  ))}

                  {/* Commission comme dernière feature stylée */}
                  {plan.commission && (
                    <li className="flex items-start gap-3 pt-2 mt-2 border-t border-white/10">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-emerald-400 text-xs">%</span>
                      </div>
                      <span className="text-emerald-300 text-sm">
                        +{plan.commission.percent} {plan.commission.context}
                      </span>
                    </li>
                  )}
                </ul>

                {/* CTA */}
                {plan.popular ? (
                  <motion.div className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400"
                      animate={isMobile ? {} : {
                        boxShadow: [
                          '0 0 20px 0 rgba(59,130,246,0.5)',
                          '0 0 40px 10px rgba(6,182,212,0.3)',
                          '0 0 20px 0 rgba(59,130,246,0.5)'
                        ]
                      }}
                      transition={isMobile ? {} : { duration: 1.5, repeat: Infinity }}
                    />
                    <button
                      onClick={(e) => scrollToSection(e, '#pricing')}
                      className="relative w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-bold hover:from-blue-500 hover:to-cyan-400 transition-all"
                    >
                      {plan.cta}
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={(e) => scrollToSection(e, '#pricing')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    {plan.cta}
                  </motion.button>
                )}

                {/* Sous-texte CTA */}
                <p className="text-gray-500 text-xs mt-3 text-center flex items-center justify-center gap-1">
                  <span className="text-green-400">{"\u2713"}</span> {plan.ctaSubtext}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof animée */}
        <motion.div
          ref={companiesRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-500 text-sm">
            {"\u2713"} Rejoint par <span className="text-white font-bold">{companiesCount}</span> entreprises ce mois-ci
          </p>
        </motion.div>

        {/* Booking CTA sous les cartes */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">{"Besoin d'aide pour choisir la bonne formule ?"}</p>
          <BookingButton variant="pricing" openModal={onOpenBooking} className="mx-auto" />
        </div>
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
              >
                <motion.button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="w-full flex items-center justify-between text-left rounded-xl transition-colors min-h-[48px]"
                >
                  <span className="text-white font-semibold pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-400 mt-4 pt-4 border-t border-white/10 leading-relaxed">
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

// Need Help Section
const NeedHelpSection = ({ onOpenBooking }) => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <span className="text-purple-400 text-sm font-medium">{"💬 Besoin d'aide avant de vous lancer ?"}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {"L'IA vous impressionne mais vous avez des "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {"questions ?"}
            </span>
          </h2>

          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            {"R\u00e9servez 15 minutes avec un expert BoosterPay. 100% gratuit, sans engagement."}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "\u{1F50C}", title: "Compatibilit\u00e9", desc: "V\u00e9rifiez l'int\u00e9gration avec vos outils" },
              { icon: "\u{1F4CA}", title: "Simulation", desc: "Estimez votre gain de tr\u00e9sorerie" },
              { icon: "\u2699\uFE0F", title: "Configuration", desc: "Param\u00e9trez votre premi\u00e8re relance" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 rounded-xl p-5 border border-white/5 hover:border-purple-500/30 transition-colors"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-md mx-auto">
            <BookingButton variant="need-help" openModal={onOpenBooking} />
            <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
              <span className="text-emerald-400">{"\u2728"}</span>
              {"Cr\u00e9neaux disponibles sous 24h"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = ({ onOpenBooking }) => {
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

          {/* Social + Booking */}
          <div className="flex items-center gap-4">
            <BookingButton variant="footer-compact" openModal={onOpenBooking} />
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
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();

  const blueOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.3, 0.1]);
  const violetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [0.1, 0.4, 0.5]);
  const emeraldOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.6]);

  // VERSION MOBILE : Fond statique simple, pas d'animations
  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(59,130,246,0.3) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(16,185,129,0.25) 0%, transparent 40%)',
          }}
        />
      </div>
    );
  }

  // VERSION DESKTOP : Animations complètes
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 30% 10%, rgba(59,130,246,0.5) 0%, transparent 60%)',
          opacity: blueOpacity,
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 50% at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 55%)',
          opacity: violetOpacity,
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 85%, rgba(16,185,129,0.45) 0%, transparent 50%)',
          opacity: emeraldOpacity,
        }}
      />

      {/* Orbes avec blur - DESKTOP SEULEMENT */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
        animate={{ x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

// ============================================
// LOADER COMPONENT
// ============================================

const Loader = ({ onComplete }) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(onComplete, isMobile ? 1000 : 2000);
    return () => clearTimeout(timer);
  }, [onComplete, isMobile]);

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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const openBooking = () => setIsBookingModalOpen(true);

  // Fix: Force page to start at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <Navigation onOpenDemo={() => setIsAudioModalOpen(true)} onOpenBooking={openBooking} />

        {/* Main Content - Ordre optimisé PAS + AIDA */}
        <main>
          {/* 1. Hook immédiat */}
          <HeroSection onOpenDemo={() => setIsAudioModalOpen(true)} onOpenBooking={openBooking} />

          {/* 2. Social proof dès le début (crédibilité) */}
          <LogoCarousel />

          {/* 3. Créer la douleur / le malaise */}
          <ProblemSection />

          {/* 4. Amplifier l'urgence APRÈS les problèmes */}
          <UrgencyBanner />

          {/* 5. La lumière au bout du tunnel */}
          <SolutionSection />

          {/* 6. C'est simple, en 3 étapes */}
          <HowItWorksSection />

          {/* 7. CTA intermédiaire - Point de contact */}
          <div className="py-8 border-y border-white/5">
            <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400">{"🤔 Des questions sur le fonctionnement ?"}</p>
              <BookingButton variant="how-it-works" openModal={openBooking} />
            </div>
          </div>

          {/* 8. Preuve tangible AVANT l'engagement */}
          <AudioDemoSection isOpen={isAudioModalOpen} onClose={() => setIsAudioModalOpen(false)} />

          {/* 9. Engagement interactif (utilisateur "chaud") */}
          <TestAISection onOpenBooking={openBooking} />

          {/* 10. Crédibilité chiffrée */}
          <StatisticsSection />

          {/* 11. Validation sociale */}
          <TestimonialsSection />

          {/* 12. L'offre */}
          <PricingSection onOpenBooking={openBooking} />

          {/* 13. Lever les objections */}
          <FAQSection />

          {/* 14. Filet de sécurité final */}
          <NeedHelpSection onOpenBooking={openBooking} />
        </main>

        {/* Footer */}
        <Footer onOpenBooking={openBooking} />

        {/* Booking Modal */}
        <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

        {/* Mobile Sticky CTA */}
        <MobileStickyCTA
          onOpenBooking={openBooking}
          onScrollToPricing={() => {
            const element = document.querySelector('#pricing');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        />
      </div>
    </>
  );
};

export default BoosterPayLanding;
