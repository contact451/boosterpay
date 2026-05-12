import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Mail, ArrowRight, Check, Loader2, FileText } from 'lucide-react';
import { submitLead } from '../services/leadService';
import { trackExitIntentShown, trackExitIntentEmail } from '../services/analytics';

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
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const isMobile = useIsMobile();
  const isKeyboardOpen = useKeyboardOpen();
  const emailInputRef = useRef(null);

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
    trackExitIntentShown();
  }, [isLeadFormOpen, hasShown]);

  useExitIntent(handleExitIntent, {
    triggerOnce: true,
    delay: 3000,
    mobileTimeout: 60000
  });

  // Auto-focus input when popup opens
  useEffect(() => {
    if (isOpen) {
      const delay = isMobile ? 400 : 300;
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
          if (isMobile) {
            emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, delay);
    }
  }, [isOpen, isMobile]);

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

  // Submit email directly
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email requis');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      await submitLead({
        email: email.trim().toLowerCase(),
        source: 'exit_intent'
      });

      setStatus('success');
      trackExitIntentEmail(email);

      // Store for OnboardingStep2
      sessionStorage.setItem('bp_lead_email', email.trim().toLowerCase());

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
      setError('Une erreur est survenue');
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

  const appleEase = [0.16, 1, 0.3, 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Overlay light glassmorphism */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: appleEase }}
            className="absolute inset-0"
            style={{
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={handleClose}
          />

          {/* Modal — light Apple style */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-[440px]"
          >
            <div
              className="relative bg-white rounded-[28px] overflow-hidden"
              style={{
                border: '1px solid rgba(15, 23, 42, 0.06)',
                boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.25), 0 16px 32px -12px rgba(15, 23, 42, 0.1)',
              }}
            >
              {/* Ambient glow subtle en haut */}
              <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-50"
                   style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245, 158, 11, 0.18), transparent 70%)' }}
                   aria-hidden="true" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-20"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-gray-600" strokeWidth={2.4} />
              </button>

              <div className={`relative ${isMobile && isKeyboardOpen ? 'p-5' : 'p-7 md:p-9'}`}>
                {status === 'success' ? (
                  /* Success state */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: appleEase }}
                    className="relative text-center py-2"
                  >
                    <SuccessConfetti isMobile={isMobile} />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                      className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 16px 32px -8px rgba(16, 185, 129, 0.5)',
                      }}
                    >
                      <Check className="w-8 h-8 text-white" strokeWidth={2.4} />
                    </motion.div>
                    <h3 className="text-[22px] font-extrabold text-gray-900 tracking-[-0.02em] mb-2">
                      Guide envoyé !
                    </h3>
                    <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                      Vérifiez votre boîte mail<br/>
                      <span className="text-gray-400">(pensez à regarder dans les spams)</span>
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Header */}
                    <div className={`text-center ${isMobile && isKeyboardOpen ? 'mb-4' : 'mb-7'}`}>
                      {/* Tag pill — Guide offert */}
                      {!(isMobile && isKeyboardOpen) && (
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: appleEase, delay: 0.1 }}
                          className="inline-flex items-center gap-2 text-[10.5px] font-bold tracking-[0.16em] uppercase text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full mb-5"
                        >
                          <Gift className="w-3 h-3" />
                          Guide offert
                        </motion.span>
                      )}

                      <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: appleEase, delay: 0.18 }}
                        className={`font-extrabold text-gray-900 tracking-[-0.025em] leading-[1.05] ${
                          isMobile && isKeyboardOpen ? 'text-[20px] mb-2' : 'text-[26px] md:text-[30px] mb-3'
                        }`}
                      >
                        Une dernière chose.
                      </motion.h2>

                      {!(isMobile && isKeyboardOpen) && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: appleEase, delay: 0.26 }}
                          className="text-[14.5px] text-gray-500 leading-relaxed max-w-[340px] mx-auto"
                        >
                          Recevez gratuitement notre guide :{' '}
                          <span className="text-gray-900 font-semibold">
                            « Comment ne plus jamais perdre un client à cause d'un appel manqué »
                          </span>
                        </motion.p>
                      )}
                    </div>

                    {/* Form */}
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: appleEase, delay: 0.34 }}
                      onSubmit={handleEmailSubmit}
                      className="space-y-3"
                    >
                      {/* Email input */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.2} />
                        <input
                          ref={emailInputRef}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="votre@email.fr"
                          style={{ fontSize: 16 }}
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:bg-white ${
                            error
                              ? 'border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-gray-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10'
                          }`}
                          disabled={status === 'loading'}
                        />
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 font-medium"
                        >
                          {error}
                        </motion.p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={status === 'loading'}
                        whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                        whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                        className="w-full py-3.5 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                          boxShadow: '0 12px 32px -10px rgba(245, 158, 11, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                        }}
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Envoi…
                          </>
                        ) : (
                          <>
                            Recevoir mon guide
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>

                      {!(isMobile && isKeyboardOpen) && (
                        <p className="text-center text-[11.5px] text-gray-400 font-medium pt-1">
                          Pas de spam · Désabonnement en 1 clic
                        </p>
                      )}
                    </motion.form>
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
