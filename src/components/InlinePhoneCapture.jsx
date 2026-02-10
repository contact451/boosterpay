import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Loader2, Check, Shield, Clock, X, Mail, ArrowRight } from 'lucide-react';
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

// VALIDATION STRICTE - Mobile français UNIQUEMENT
const validateFrenchMobile = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return /^0[67]\d{8}$/.test(digits);
};

// Message d'erreur contextuel
const getPhoneErrorMessage = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return 'Numéro requis';
  if (digits.length < 10) return `Encore ${10 - digits.length} chiffre${10 - digits.length > 1 ? 's' : ''}`;
  if (!digits.startsWith('06') && !digits.startsWith('07')) return 'Mobile uniquement (06 ou 07)';
  if (digits.length > 10) return 'Maximum 10 chiffres';
  return '';
};

// Statut visuel
const getPhoneStatus = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return 'empty';
  if (digits.length < 10) return 'incomplete';
  if (!digits.startsWith('06') && !digits.startsWith('07')) return 'invalid';
  if (digits.length === 10 && /^0[67]\d{8}$/.test(digits)) return 'valid';
  return 'invalid';
};

// Auto-format phone number as user types
const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
};

// Messages de succès contextualisés
const SUCCESS_MESSAGES = {
  hero: {
    title: "C'est parti ! 🚀",
    subtitle: "Notre équipe vous contacte sous 48h pour activer votre essai."
  },
  simulateur: {
    title: "Estimation envoyée ! 📊",
    subtitle: "Consultez votre boîte mail pour voir les détails."
  },
  test_ai: {
    title: "Impressionnant, non ? 🤖",
    subtitle: "Un expert vous contacte pour une démo personnalisée."
  },
  pricing_starter: {
    title: "Excellent choix ! ✨",
    subtitle: "Votre essai STARTER est en cours d'activation."
  },
  pricing_pro: {
    title: "Excellent choix ! ✨",
    subtitle: "Votre essai PRO est en cours d'activation."
  },
  pricing_business: {
    title: "Excellent choix ! ✨",
    subtitle: "Votre essai BUSINESS est en cours d'activation."
  },
  exit_intent: {
    title: "Guide envoyé ! 📚",
    subtitle: "Vérifiez votre boîte mail (pensez aux spams)."
  },
  mobile_cta: {
    title: "C'est parti ! 🎉",
    subtitle: "Notre équipe vous contacte sous 48h."
  },
  booking: {
    title: "Rendez-vous confirmé ! 📅",
    subtitle: "Vous recevrez un email de confirmation."
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
  booking: 35
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


const InlinePhoneCapture = ({
  isVisible,
  email,
  source,
  onClose,
  onSuccess,
  enrichmentData = {},
  submitLabel = 'Accélérer mes paiements — Gratuit',
  showEmailField = false
}) => {
  const [localEmail, setLocalEmail] = useState(email);
  const [phone, setPhone] = useState('');
  const [phoneStatus, setPhoneStatus] = useState('empty'); // empty | incomplete | invalid | valid
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  // Get contextual success message
  const successMessage = SUCCESS_MESSAGES[source] || SUCCESS_MESSAGES.hero;

  // Sync localEmail with email prop
  useEffect(() => {
    setLocalEmail(email);
  }, [email]);

  // Auto-focus on first input when visible (with scroll on mobile)
  useEffect(() => {
    if (isVisible) {
      const delay = isMobile ? 400 : 100;
      const timer = setTimeout(() => {
        const targetRef = showEmailField ? emailInputRef : phoneInputRef;
        if (targetRef.current) {
          targetRef.current.focus();
          // Scroll input into view on mobile
          if (isMobile) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, showEmailField, isMobile]);

  // Handle click outside to close (disabled on mobile to prevent accidental closes)
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

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setPhoneStatus(getPhoneStatus(formatted));
    setError(''); // Clear submit error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email if showEmailField
    if (showEmailField) {
      if (!localEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
        setError('Email invalide');
        return;
      }
    }

    // Validation STRICTE du téléphone
    if (!validateFrenchMobile(phone)) {
      const errorMsg = getPhoneErrorMessage(phone);
      setError(errorMsg);
      // Animation shake sur l'input
      if (phoneInputRef.current) {
        phoneInputRef.current.classList.add('animate-shake');
        setTimeout(() => phoneInputRef.current?.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setStatus('loading');
    setError('');

    // Build payload - use localEmail which may have been edited
    const emailToUse = showEmailField ? localEmail : email;
    const searchParams = new URLSearchParams(window.location.search);
    const payload = {
      // Core
      email: emailToUse.trim().toLowerCase(),
      telephone: phone.replace(/\D/g, ''),
      source: source,

      // Scoring
      score: SCORE_MAP[source] || 10,

      // Metadata
      timestamp: new Date().toISOString(),
      appareil: window.innerWidth < 768 ? 'mobile' : 'desktop',
      page: window.location.pathname,

      // UTM (if present)
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',

      // Enrichment data (optional)
      ...enrichmentData
    };

    try {
      await submitLead({
        email: emailToUse.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        source: source,
        ...enrichmentData
      });

      setStatus('success');

      // Stocker pour OnboardingStep2
      if (emailToUse) sessionStorage.setItem('bp_lead_email', emailToUse.trim().toLowerCase());
      if (phone) sessionStorage.setItem('bp_lead_phone', phone.replace(/\D/g, ''));

      // Auto-close after success
      setTimeout(() => {
        onSuccess();
      }, 2500);

    } catch (err) {
      console.error('Error submitting lead:', err);
      setStatus('error');
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const digits = phone.replace(/\D/g, '');

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
          className="overflow-hidden"
        >
          <div className={`relative bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] ${isMobile ? 'p-4' : 'p-6'}`}>
            {status === 'success' ? (
              // Success state with confetti
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative text-center py-4"
              >
                {/* Confetti animation */}
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
                <h3 className="text-xl font-bold text-white mb-2">
                  {successMessage.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {successMessage.subtitle}
                </p>
              </motion.div>
            ) : (
              // Form state
              <form onSubmit={handleSubmit}>
                {/* Header avec indication de rapidité */}
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

                {/* Progress bar - montre qu'on est presque fini */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span className="text-emerald-400 font-medium">
                      {showEmailField
                        ? (localEmail && phoneStatus === 'valid' ? '100%' : localEmail ? '66%' : '33%')
                        : (phoneStatus === 'valid' ? '100%' : '50%')}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                      initial={{ width: showEmailField ? '33%' : '50%' }}
                      animate={{
                        width: showEmailField
                          ? (localEmail && phoneStatus === 'valid' ? '100%' : localEmail ? '66%' : '33%')
                          : (phoneStatus === 'valid' ? '100%' : digits.length > 0 ? `${Math.min(50 + digits.length * 4, 90)}%` : '50%')
                      }}
                      transition={{ type: 'spring', damping: 20 }}
                    />
                  </div>
                </div>

                {/* Email input (conditional) */}
                {showEmailField && (
                  <div className="relative mb-3">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={localEmail}
                      onChange={(e) => { setLocalEmail(e.target.value); setError(''); }}
                      placeholder="votre@email.fr"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border ${
                        error && error.includes('Email')
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/20 focus:border-blue-500'
                      } text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        error && error.includes('Email') ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                      } transition-all text-base`}
                      disabled={status === 'loading'}
                      autoComplete="email"
                    />
                  </div>
                )}

                {/* Phone input avec animation de récompense quand valide */}
                <div className="relative mb-3">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="06 __ __ __ __"
                    className={`w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border transition-all text-base ${
                      phoneStatus === 'valid'
                        ? 'border-emerald-500 bg-emerald-500/5 focus:ring-emerald-500/20'
                        : phoneStatus === 'invalid'
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
                    } text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                    disabled={status === 'loading'}
                    autoComplete="tel"
                  />

                  {/* Indicateur de validité avec animation */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                      {phoneStatus === 'valid' && (
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
                      {phoneStatus === 'invalid' && digits.length > 2 && (
                        <motion.div
                          key="invalid"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      {phoneStatus === 'incomplete' && (
                        <motion.span
                          key="incomplete"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-gray-400 font-mono bg-white/5 px-2 py-1 rounded"
                        >
                          {10 - digits.length}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Message d'encouragement dynamique */}
                <AnimatePresence mode="wait">
                  {phoneStatus === 'incomplete' && digits.length >= 2 && (
                    <motion.p
                      key="encouragement"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-blue-400 text-xs mb-3 -mt-1 pl-1 flex items-center gap-1"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        👍
                      </motion.span>
                      Plus que {10 - digits.length} chiffres !
                    </motion.p>
                  )}
                  {phoneStatus === 'valid' && (
                    <motion.p
                      key="valid-msg"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-400 text-xs mb-3 -mt-1 pl-1 flex items-center gap-1"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        ✨
                      </motion.span>
                      Parfait ! Cliquez pour continuer
                    </motion.p>
                  )}
                  {phoneStatus === 'invalid' && digits.length > 2 && (
                    <motion.p
                      key="error-msg"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-xs mb-3 -mt-1 pl-1"
                    >
                      {getPhoneErrorMessage(phone)}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Error message from submit */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit button - pulse quand le formulaire est valide */}
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                  whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                    phoneStatus === 'valid'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25'
                  } text-white disabled:opacity-70`}
                  animate={phoneStatus === 'valid' && status === 'idle' ? {
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
                  {!isMobile && phoneStatus === 'valid' && (
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
                      {phoneStatus === 'valid' ? (
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="flex items-center gap-2 relative z-10"
                        >
                          <Check className="w-5 h-5" />
                          <span>{submitLabel === 'Accélérer mes paiements — Gratuit' ? '⚡ Lancer mon essai gratuit' : submitLabel}</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <span className="relative z-10 flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          {submitLabel === 'Accélérer mes paiements — Gratuit'
                            ? (showEmailField && !localEmail
                              ? '🚀 Accélérer mes paiements — Gratuit'
                              : '📱 Plus qu\'une étape...')
                            : submitLabel}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>

                {/* Trust indicators avec micro-animations */}
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

InlinePhoneCapture.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  email: PropTypes.string,
  source: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  enrichmentData: PropTypes.object,
  submitLabel: PropTypes.string,
  showEmailField: PropTypes.bool
};

InlinePhoneCapture.defaultProps = {
  email: '',
  enrichmentData: {},
  submitLabel: 'Accélérer mes paiements — Gratuit',
  showEmailField: false
};

export default InlinePhoneCapture;
