import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Check, Loader2, Mail, Sparkles } from 'lucide-react';
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

// Confetti component for success state
const Confetti = () => {
  const particles = Array.from({ length: 50 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 5)]
          }}
          initial={{ y: -20, opacity: 1 }}
          animate={{
            y: 400,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 720,
            opacity: 0
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const LeadFormModal = ({
  isOpen,
  onClose,
  prefilledEmail = '',
  source = 'modal'
}) => {
  // Safeguard: ensure prefilledEmail is a string
  const safePrefilledEmail = typeof prefilledEmail === 'string' ? prefilledEmail : '';
  const [email, setEmail] = useState(safePrefilledEmail);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errors, setErrors] = useState({});
  const isMobile = useIsMobile();
  const emailInputRef = useRef(null);

  // Update email if prefilled changes
  useEffect(() => {
    if (prefilledEmail && typeof prefilledEmail === 'string') {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  // Auto-focus email field when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the modal open
      const timer = setTimeout(() => {
        // Always focus on email first
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrors({});
      if (!prefilledEmail) {
        setEmail('');
      }
    }
  }, [isOpen, prefilledEmail]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email requis';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus('loading');

    try {
      await submitLead({
        email,
        source
      });

      setStatus('success');

      // Store for OnboardingStep2
      sessionStorage.setItem('bp_lead_email', email.trim().toLowerCase());

      // Close modal after success animation
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail('');
      }, 3000);

    } catch (error) {
      console.error('Error submitting lead:', error);
      setStatus('error');
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = isMobile ? {
    hidden: { y: '100%', opacity: 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 30, stiffness: 300 }
    },
    exit: {
      y: '100%',
      transition: { duration: 0.2 }
    }
  } : {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const isValid = (field) => {
    if (field === 'email') {
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    return false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative z-10 w-full ${
              isMobile
                ? 'max-h-[90vh] rounded-t-3xl'
                : 'max-w-md mx-4 rounded-2xl'
            } bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] border border-white/10 shadow-2xl overflow-hidden`}
          >
            {/* Success confetti */}
            {status === 'success' && <Confetti />}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Content */}
            <div className={`p-6 ${isMobile ? 'pb-8' : 'p-8'}`}>
              {status === 'success' ? (
                // Success state
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">C'est parti !</h2>
                  <p className="text-gray-400">
                    Votre essai gratuit est activé.<br/>
                    On vous contacte sous 24h.
                  </p>
                </motion.div>
              ) : (
                // Form state
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      10 jours gratuits • Sans carte bancaire
                    </motion.div>
                    <h2 className="text-2xl md:text-2xl font-bold text-white">
                      Démarrez en 30 secondes
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">
                      Votre IA commence à appeler demain
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email field */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Email pro
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          ref={emailInputRef}
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          placeholder="vous@entreprise.fr"
                          className={`w-full pl-12 pr-10 py-3.5 md:py-3 rounded-xl bg-white/5 border ${
                            errors.email
                              ? 'border-red-500/50 focus:border-red-500'
                              : isValid('email')
                                ? 'border-emerald-500/50 focus:border-emerald-500'
                                : 'border-white/10 focus:border-blue-500/50'
                          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                            errors.email
                              ? 'focus:ring-red-500/20'
                              : isValid('email')
                                ? 'focus:ring-emerald-500/20'
                                : 'focus:ring-blue-500/20'
                          } transition-all`}
                          disabled={status === 'loading'}
                        />
                        {isValid('email') && (
                          <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
                      )}
                    </div>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={status === 'loading'}
                      whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                      whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Activation...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Activer mon essai gratuit
                        </>
                      )}
                    </motion.button>

                    {/* Trust badges */}
                    <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Sans carte bancaire
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Annulable en 1 clic
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Données sécurisées
                      </span>
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* Mobile safe area */}
            {isMobile && <div className="h-6" />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeadFormModal;
