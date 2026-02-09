import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Mail, ArrowRight, Check, Loader2, FileText, Phone } from 'lucide-react';
import { submitLead } from '../services/leadService';

// Hook to detect if keyboard is open (via visualViewport)
const useKeyboardOpen = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const handleResize = () => {
      // Keyboard is considered open if viewport shrinks significantly
      setIsKeyboardOpen(viewport.height < initialHeight * 0.75);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  return isKeyboardOpen;
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

// Custom hook for exit intent detection
const useExitIntent = (onExit, options = {}) => {
  const { triggerOnce = true, delay = 2000, mobileTimeout = 60000 } = options;
  const hasTriggered = useRef(false);
  const timeoutRef = useRef(null);
  const lastScrollY = useRef(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (hasTriggered.current && triggerOnce) return;

    // Wait for initial delay before activating
    timeoutRef.current = setTimeout(() => {
      if (isMobile) {
        // Mobile: trigger on scroll up (intention to leave) or after timeout
        let scrollUpCount = 0;

        const handleScroll = () => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < lastScrollY.current - 100 && currentScrollY > 500) {
            scrollUpCount++;
            if (scrollUpCount >= 2 && (!triggerOnce || !hasTriggered.current)) {
              hasTriggered.current = true;
              onExit();
            }
          } else if (currentScrollY > lastScrollY.current) {
            scrollUpCount = 0;
          }
          lastScrollY.current = currentScrollY;
        };

        // Also trigger after timeout on mobile
        const mobileTimer = setTimeout(() => {
          if (!hasTriggered.current) {
            hasTriggered.current = true;
            onExit();
          }
        }, mobileTimeout);

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
          window.removeEventListener('scroll', handleScroll);
          clearTimeout(mobileTimer);
        };
      } else {
        // Desktop: trigger on mouse leave
        const handleMouseLeave = (e) => {
          if (e.clientY <= 0 && (!triggerOnce || !hasTriggered.current)) {
            hasTriggered.current = true;
            onExit();
          }
        };

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          document.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onExit, triggerOnce, delay, mobileTimeout, isMobile]);
};

const ExitIntentPopup = ({ onEmailCapture, isLeadFormOpen = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = phone
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneStatus, setPhoneStatus] = useState('empty'); // empty | incomplete | invalid | valid
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const isMobile = useIsMobile();
  const isKeyboardOpen = useKeyboardOpen();
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Check if popup was already shown in this session
  useEffect(() => {
    const shown = sessionStorage.getItem('exitIntentShown');
    if (shown) {
      setHasShown(true);
    }
  }, []);

  const handleExitIntent = useCallback(() => {
    // Don't show if lead form is already open or popup was already shown
    if (isLeadFormOpen || hasShown) return;

    setIsOpen(true);
    setHasShown(true);
    sessionStorage.setItem('exitIntentShown', 'true');
  }, [isLeadFormOpen, hasShown]);

  useExitIntent(handleExitIntent, {
    triggerOnce: true,
    delay: 3000,
    mobileTimeout: 60000
  });

  // Auto-focus input when popup opens or step changes (with scroll on mobile)
  useEffect(() => {
    if (isOpen) {
      const delay = isMobile ? 400 : 300;
      setTimeout(() => {
        const targetRef = step === 1 ? emailInputRef : phoneInputRef;
        if (targetRef.current) {
          targetRef.current.focus();
          // Scroll input into view on mobile
          if (isMobile) {
            targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, delay);
    }
  }, [isOpen, step, isMobile]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Step 1: Validate email → move to step 2
  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email requis');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    setError('');
    setStep(2); // Move to phone step
  };

  // Step 2: Validate phone → final submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    // Validation STRICTE du téléphone
    if (!validateFrenchMobile(phone)) {
      const errorMsg = getPhoneErrorMessage(phone);
      setPhoneError(errorMsg);
      // Animation shake sur l'input
      if (phoneInputRef.current) {
        phoneInputRef.current.classList.add('animate-shake');
        setTimeout(() => phoneInputRef.current?.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setStatus('loading');
    setPhoneError('');

    try {
      await submitLead({
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        source: 'exit_intent'
      });

      setStatus('success');

      // Pass email to parent for later use
      if (onEmailCapture) {
        onEmailCapture(email);
      }

      // Close after success
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);

    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
      setPhoneError('Une erreur est survenue');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-md"
          >
            {/* Gradient border effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl opacity-50 blur-sm" />

            <div className="relative bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] rounded-2xl border border-white/10 overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className={`${isMobile && isKeyboardOpen ? 'p-4' : 'p-6 md:p-8'}`}>
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
                      transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Guide envoyé ! 📚
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Vérifiez votre boîte mail<br/>
                      (pensez aux spams)
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Header - compact when keyboard open */}
                    <div className={`text-center ${isMobile && isKeyboardOpen ? 'mb-3' : 'mb-6'}`}>
                      {/* Gift icon - hidden when keyboard open on mobile */}
                      {!(isMobile && isKeyboardOpen) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                        >
                          <Gift className="w-8 h-8 text-white" />
                        </motion.div>
                      )}

                      <h2 className={`font-bold text-white ${isMobile && isKeyboardOpen ? 'text-lg mb-1' : 'text-2xl mb-2'}`}>
                        Attendez !
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base">
                        Recevez notre guide gratuit :
                      </p>
                      {!(isMobile && isKeyboardOpen) && (
                        <p className="text-white font-semibold mt-1 flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          5 techniques pour récupérer vos factures impayées
                        </p>
                      )}
                    </div>

                    {/* Form */}
                    <form onSubmit={step === 1 ? handleEmailSubmit : handlePhoneSubmit} className="space-y-4">
                      {/* Step 1: Email input */}
                      {step === 1 && (
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            ref={emailInputRef}
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError('');
                            }}
                            placeholder="votre@email.fr"
                            className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border ${
                              error
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:border-blue-500/50'
                            } text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                              error ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
                            } transition-all text-base`}
                            disabled={status === 'loading'}
                          />
                          {error && (
                            <p className="text-red-400 text-xs mt-1.5 pl-1">{error}</p>
                          )}
                        </div>
                      )}

                      {/* Step 2: Phone input (slides in after email validation) */}
                      {step === 2 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                          <p className="text-emerald-400 text-sm mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Email validé !
                          </p>
                          <p className="text-white font-medium mb-3">
                            Dernière étape pour recevoir le guide :
                          </p>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              ref={phoneInputRef}
                              type="tel"
                              inputMode="numeric"
                              value={phone}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setPhone(formatted);
                                setPhoneStatus(getPhoneStatus(formatted));
                                setPhoneError('');
                              }}
                              placeholder="06 __ __ __ __"
                              className={`w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border transition-all text-base ${
                                phoneStatus === 'valid'
                                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                                  : phoneStatus === 'invalid'
                                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                  : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                              } text-white placeholder-gray-500 focus:outline-none focus:ring-2`}
                              disabled={status === 'loading'}
                              autoComplete="tel"
                            />

                            {/* Indicateur de validité à droite */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              {phoneStatus === 'valid' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                              {phoneStatus === 'invalid' && phone.replace(/\D/g, '').length > 0 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                              {phoneStatus === 'incomplete' && (
                                <span className="text-xs text-gray-500 font-medium">
                                  {10 - phone.replace(/\D/g, '').length}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Message d'aide en temps réel */}
                          {phoneStatus === 'invalid' && phone.replace(/\D/g, '').length > 0 && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-xs mt-1.5 pl-1"
                            >
                              {getPhoneErrorMessage(phone)}
                            </motion.p>
                          )}

                          {phoneError && (
                            <p className="text-red-400 text-xs mt-1.5 pl-1">{phoneError}</p>
                          )}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={status === 'loading'}
                        whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                        whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Envoi...
                          </>
                        ) : step === 1 ? (
                          <>
                            Continuer
                            <ArrowRight className="w-5 h-5" />
                          </>
                        ) : (
                          <>
                            Recevoir le guide
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>

                      {!(isMobile && isKeyboardOpen) && (
                        <p className="text-center text-xs text-gray-500">
                          Pas de spam • Désabonnement en 1 clic
                        </p>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
