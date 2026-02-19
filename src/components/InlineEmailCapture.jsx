import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Shield, Clock, X, Mail, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { submitLead } from '../services/leadService';

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// Messages de succès contextualisés
const SUCCESS_MESSAGES = {
  hero: {
    title: "C'est parti ! 🎉",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Importer mon 1er impayé →"
  },
  simulateur: {
    title: "Estimation envoyée ! 📊",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Voir mon estimation →"
  },
  test_ai: {
    title: "IA activée ! 🤖",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Ajouter mes impayés →"
  },
  pricing_starter: {
    title: "Essai STARTER activé ! ✨",
    subtitle: "Vérifiez votre boîte mail pour les détails !",
    cta: "Importer mes impayés →"
  },
  pricing_pro: {
    title: "Essai PRO activé ! ✨",
    subtitle: "Vérifiez votre boîte mail pour les détails !",
    cta: "Importer mes impayés →"
  },
  pricing_business: {
    title: "Essai BUSINESS activé ! ✨",
    subtitle: "Vérifiez votre boîte mail pour les détails !",
    cta: "Importer mes impayés →"
  },
  exit_intent: {
    title: "Guide envoyé ! 📚",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: null
  },
  mobile_cta: {
    title: "C'est parti ! 🎉",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Importer mes impayés →"
  },
  audio_demo: {
    title: "C'est parti ! 🎧",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Importer mes impayés →"
  },
  testimonials: {
    title: "Inscription confirmée ! 🎉",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Importer mes impayés →"
  },
  intermediate_cta: {
    title: "C'est parti ! 🚀",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Importer mes impayés →"
  },
  deferred: {
    title: "Inscription confirmée ! ✅",
    subtitle: "Vérifiez votre boîte mail (et les spams au cas où) !",
    cta: "Importer mes impayés →"
  }
};

// Score map for lead qualification
const SCORE_MAP = {
  hero: 15,
  simulateur: 20,
  test_ai: 30,
  pricing_starter: 25,
  pricing_pro: 25,
  pricing_business: 25,
  mobile_cta: 10,
  deferred: 12,
};

// Confetti animation component
const SuccessConfetti = ({ isMobile }) => {
  const confettiColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
  const count = isMobile ? 12 : 20;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
            top: '50%',
          }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [0, -80 - Math.random() * 60, 150],
            x: (Math.random() - 0.5) * 150,
            opacity: [1, 1, 0],
            scale: [1, 1.2, 0.5],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.4,
            ease: 'easeOut',
            delay: Math.random() * 0.15,
          }}
        />
      ))}
    </div>
  );
};


const InlineEmailCapture = ({
  isVisible,
  email: initialEmail,
  source,
  onClose,
  onSuccess,
  enrichmentData = {},
  submitLabel = 'Démarrer gratuit',
  showEmailField = true
}) => {
  const [localEmail, setLocalEmail] = useState(initialEmail || '');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [entryDone, setEntryDone] = useState(false);
  const emailInputRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  // Get contextual success message
  const successMessage = SUCCESS_MESSAGES[source] || SUCCESS_MESSAGES.hero;

  // Reset overflow state when component closes
  useEffect(() => {
    if (!isVisible) setEntryDone(false);
  }, [isVisible]);

  // Sync localEmail with email prop
  useEffect(() => {
    if (initialEmail) setLocalEmail(initialEmail);
  }, [initialEmail]);

  // Auto-focus on email input when visible
  useEffect(() => {
    if (isVisible) {
      const delay = isMobile ? 400 : 100;
      const timer = setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
          if (isMobile) {
            emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMobile]);

  // Handle click outside to close (disabled on mobile)
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose, isMobile]);

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!localEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
      setError('Email invalide');
      return;
    }

    setStatus('loading');
    setError('');

    // Build payload - email only, no phone
    const searchParams = new URLSearchParams(window.location.search);
    const payload = {
      email: localEmail.trim().toLowerCase(),
      source: source,
      score: SCORE_MAP[source] || 10,
      timestamp: new Date().toISOString(),
      appareil: window.innerWidth < 768 ? 'mobile' : 'desktop',
      page: window.location.pathname,
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      ...enrichmentData
    };

    try {
      await submitLead({
        email: localEmail.trim().toLowerCase(),
        source: source,
        ...enrichmentData
      });

      setStatus('success');

      // Store for OnboardingStep2
      sessionStorage.setItem('bp_lead_email', localEmail.trim().toLowerCase());

      // Delay before calling onSuccess
      setTimeout(() => {
        onSuccess();
      }, 5000);

    } catch (err) {
      console.error('Error submitting lead:', err);
      setStatus('error');
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const isEmailValid = localEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{
            opacity: 1,
            height: 'auto',
            marginTop: 16
          }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          onAnimationComplete={(definition) => {
            if (definition.height === 'auto') {
              setEntryDone(true);
            }
          }}
          className={entryDone ? '' : 'overflow-hidden'}
        >
          <div className={`relative bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] ${isMobile ? 'p-4' : 'p-6'}`}>
            {status === 'success' ? (
              // Success state
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative text-center py-4"
              >
                <SuccessConfetti isMobile={isMobile} />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <Check className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {successMessage.title}
                </h3>

                <p className="text-gray-300 text-sm mb-3">
                  {successMessage.subtitle}
                </p>

                {/* Badge Email envoyé */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400 text-xs font-medium">Email envoyé</span>
                  </motion.div>
                </motion.div>

                {/* CTA vers Step 2 */}
                {successMessage.cta && (
                  <motion.a
                    href="/onboarding/step2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                  >
                    {successMessage.cta}
                  </motion.a>
                )}
              </motion.div>
            ) : (
              // Form state
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎯</span>
                    <div>
                      <span className="text-white font-semibold block">Divisez vos délais de paiement par 2</span>
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Résultats dès 48h — Sans carte bancaire
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Email input */}
                <div className="relative mb-3">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={localEmail}
                    onChange={(e) => { setLocalEmail(e.target.value); setError(''); }}
                    placeholder="votre@email.fr"
                    className={`w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border ${
                      error
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : isEmailValid
                          ? 'border-emerald-500 bg-emerald-500/5 focus:ring-emerald-500/20'
                          : 'border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
                    } text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all text-base`}
                    disabled={status === 'loading'}
                    autoComplete="email"
                  />

                  {/* Validity indicator */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {isEmailValid && (
                        <motion.div
                          key="valid"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', damping: 15 }}
                          className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                  whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                    isEmailValid
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25'
                  } text-white disabled:opacity-70`}
                  animate={isEmailValid && status === 'idle' ? {
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                      '0 10px 40px -5px rgba(16, 185, 129, 0.5)',
                      '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                    ],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {/* Shimmer (desktop only) */}
                  {!isMobile && isEmailValid && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <>
                      {isEmailValid ? (
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="flex items-center gap-2 relative z-10"
                        >
                          <Check className="w-5 h-5" />
                          <span>{submitLabel}</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <span className="relative z-10 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          {submitLabel}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>

                {/* Trust indicators */}
                <div className={`flex items-center justify-center mt-4 text-xs text-gray-400 ${isMobile ? 'flex-col gap-2' : 'flex-row gap-4'}`}>
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, y: -1 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                    </motion.div>
                    Sans engagement
                  </motion.span>
                  {!isMobile && <span className="text-gray-600">•</span>}
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, y: -1 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <Clock className="w-3 h-3 text-blue-400" />
                    </motion.div>
                    Résultats dès 48h
                  </motion.span>
                  {!isMobile && <span className="text-gray-600">•</span>}
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05, y: -1 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <Shield className="w-3 h-3 text-emerald-400" />
                    </motion.div>
                    100% sécurisé
                  </motion.span>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

InlineEmailCapture.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  email: PropTypes.string,
  source: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  enrichmentData: PropTypes.object,
  submitLabel: PropTypes.string,
  showEmailField: PropTypes.bool
};

InlineEmailCapture.defaultProps = {
  email: '',
  enrichmentData: {},
  submitLabel: 'Démarrer gratuit',
  showEmailField: true
};

export default InlineEmailCapture;
