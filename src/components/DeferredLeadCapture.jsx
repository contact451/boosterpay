import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send, Check, AlertCircle, ChevronDown, ChevronLeft, User, Mail, Phone, Sparkles } from 'lucide-react';

// Liste des pays avec indicatifs
const COUNTRY_CODES = [
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+32', country: 'BE', flag: '🇧🇪' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
  { code: '+352', country: 'LU', flag: '🇱🇺' },
  { code: '+377', country: 'MC', flag: '🇲🇨' },
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
];

// Configuration des étapes
const STEPS = [
  {
    key: 'firstName',
    label: 'Prénom',
    placeholder: 'Votre prénom',
    icon: User,
    inputMode: 'text',
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'vous@exemple.com',
    icon: Mail,
    inputMode: 'email',
    type: 'email',
  },
  {
    key: 'phone',
    label: 'Mobile',
    placeholder: '06 12 34 56 78',
    icon: Phone,
    inputMode: 'tel',
    type: 'tel',
  },
];

// Animation variants ultra-fluides (60fps)
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

const DeferredLeadCapture = ({ variant = 'default', className = '' }) => {
  // États
  const [formData, setFormData] = useState({ firstName: '', email: '', phone: '' });
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef(null);
  const totalSteps = STEPS.length;

  // Fermer dropdown si clic ailleurs
  useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Formatage téléphone français
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (selectedCountry.code === '+33') {
      const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
      if (match) {
        return [match[1], match[2], match[3], match[4], match[5]].filter(Boolean).join(' ');
      }
    }
    return cleaned.slice(0, 15);
  };

  // Validation par étape
  const validateCurrentStep = () => {
    const value = formData[STEPS[currentStep].key];

    switch (currentStep) {
      case 0: // Prénom
        if (!value.trim() || value.length < 2) {
          return { valid: false, error: 'Entrez votre prénom (min. 2 caractères)' };
        }
        break;
      case 1: // Email
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return { valid: false, error: 'Adresse email invalide' };
        }
        break;
      case 2: // Phone
        const cleanedPhone = value.replace(/\D/g, '');
        if (selectedCountry.code === '+33') {
          if (!/^0[67]\d{8}$/.test(cleanedPhone)) {
            return { valid: false, error: 'Numéro mobile invalide (ex: 06 12 34 56 78)' };
          }
        } else if (cleanedPhone.length < 8) {
          return { valid: false, error: 'Numéro trop court' };
        }
        break;
    }
    return { valid: true };
  };

  // Valeur actuelle non vide ?
  const isCurrentStepFilled = () => {
    const value = formData[STEPS[currentStep].key];
    return value && value.trim().length > 0;
  };

  // Passer à l'étape suivante
  const goToNextStep = () => {
    const validation = validateCurrentStep();
    if (!validation.valid) {
      setStatus('error');
      setErrorMsg(validation.error);
      // Shake animation via CSS
      inputRef.current?.classList.add('animate-shake');
      setTimeout(() => {
        inputRef.current?.classList.remove('animate-shake');
        setStatus('idle');
      }, 600);
      return;
    }

    setStatus('idle');
    setErrorMsg('');

    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      // Dernière étape : soumettre
      handleSubmit();
    }
  };

  // Revenir en arrière
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      setStatus('idle');
      setErrorMsg('');
    }
  };

  // Gestion du clavier
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToNextStep();
    }
  };

  // Mise à jour de la valeur
  const handleInputChange = (e) => {
    let value = e.target.value;
    const key = STEPS[currentStep].key;

    // Formatage spécial pour le téléphone
    if (key === 'phone') {
      value = formatPhoneNumber(value);
    }

    // Limite de caractères
    if (key === 'firstName') value = value.slice(0, 30);
    if (key === 'email') value = value.slice(0, 100);

    setFormData(prev => ({ ...prev, [key]: value }));

    // Reset erreur quand l'utilisateur tape
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg('');
    }
  };

  // Soumission finale
  const handleSubmit = async () => {
    setStatus('loading');

    try {
      // TODO: Remplacer par ton API réelle
      // await fetch('/api/deferred-lead', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     firstName: formData.firstName,
      //     email: formData.email,
      //     phone: selectedCountry.code + formData.phone.replace(/\D/g, '').replace(/^0/, ''),
      //     source: window.location.pathname,
      //     timestamp: new Date().toISOString()
      //   })
      // });

      await new Promise(r => setTimeout(r, 1500));
      setStatus('success');

    } catch (err) {
      setStatus('error');
      setErrorMsg('Erreur réseau. Réessayez.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // Reset complet
  const handleReset = () => {
    setFormData({ firstName: '', email: '', phone: '' });
    setCurrentStep(0);
    setStatus('idle');
    setDirection(1);
  };

  // Styles
  const containerStyles = {
    default: 'bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700/50 hover:border-orange-500/30',
    floating: 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-orange-500/20 shadow-2xl shadow-orange-500/5',
    compact: 'bg-slate-900/30 backdrop-blur-xl border border-dashed border-slate-700/30',
  };

  const currentStepConfig = STEPS[currentStep];
  const StepIcon = currentStepConfig?.icon || User;

  // === RENDU SUCCESS ===
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 md:p-8 ${containerStyles[variant]} ${className}`}
      >
        <div className="text-center">
          {/* Confetti effect */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white mb-2"
          >
            C&apos;est dans la boîte, {formData.firstName} ! 🎉
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm mb-4"
          >
            Vérifiez vos SMS et emails pour votre accès VIP.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
          >
            Utiliser un autre numéro
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // === RENDU PRINCIPAL ===
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`rounded-2xl p-5 md:p-6 ${containerStyles[variant]} ${className} transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm md:text-base">
            Pas le temps maintenant ?
          </h3>
          <p className="text-gray-400 text-xs">
            Recevez votre lien et finalisez tranquillement depuis votre bureau ☕
          </p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-gray-500">
          <span>⏱️</span> 10 secondes
        </span>
      </div>

      {/* Barre de progression */}
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.key}
            className="flex-1 h-1 rounded-full overflow-hidden bg-slate-700/50"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              initial={{ width: '0%' }}
              animate={{
                width: index < currentStep ? '100%' : index === currentStep ? '50%' : '0%'
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Zone de saisie animée */}
      <div className="relative min-h-[120px] md:min-h-[100px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {/* Label de l'étape */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <StepIcon className="w-4 h-4 text-orange-400" />
                {currentStepConfig.label}
                <span className="text-gray-600 text-xs">({currentStep + 1}/{totalSteps})</span>
              </label>

              {/* Bouton retour */}
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="text-xs text-gray-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Retour
                </button>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              {/* Sélecteur de pays (uniquement pour téléphone) */}
              {currentStep === 2 && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={status === 'loading'}
                    className="h-12 px-3 bg-slate-800/50 border border-slate-600/50 rounded-xl flex items-center gap-2 text-white hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                  >
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600/50 rounded-xl overflow-hidden z-50 shadow-xl min-w-[140px]"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 flex items-center gap-2 hover:bg-slate-700/50 transition-colors text-left ${
                              selectedCountry.code === c.code ? 'bg-orange-500/10 text-orange-400' : 'text-white'
                            }`}
                          >
                            <span className="text-lg">{c.flag}</span>
                            <span className="text-sm">{c.code}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Champ de saisie */}
              <input
                ref={inputRef}
                type={currentStepConfig.type}
                inputMode={currentStepConfig.inputMode}
                value={formData[currentStepConfig.key]}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={currentStepConfig.placeholder}
                disabled={status === 'loading'}
                autoComplete={currentStep === 1 ? 'email' : currentStep === 2 ? 'tel' : 'given-name'}
                className={`
                  flex-1 h-12 bg-slate-800/50 border rounded-xl px-4 text-white text-base
                  placeholder-gray-500 focus:outline-none transition-all disabled:opacity-50
                  ${status === 'error'
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                    : 'border-slate-600/50 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30'
                  }
                `}
              />
            </div>

            {/* Message d'erreur */}
            <AnimatePresence>
              {status === 'error' && errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-2 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bouton d'action */}
      <motion.button
        type="button"
        onClick={goToNextStep}
        disabled={status === 'loading' || !isCurrentStepFilled()}
        whileHover={{ scale: isCurrentStepFilled() ? 1.02 : 1 }}
        whileTap={{ scale: isCurrentStepFilled() ? 0.98 : 1 }}
        className={`
          w-full h-12 mt-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
          ${status === 'loading'
            ? 'bg-slate-700 text-gray-400 cursor-wait'
            : isCurrentStepFilled()
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-400 hover:to-amber-400'
              : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
          }
        `}
        style={isCurrentStepFilled() && status !== 'loading' ? {
          animation: 'pulse-glow 2s ease-in-out infinite',
        } : {}}
      >
        {status === 'loading' ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Envoi en cours...</span>
          </>
        ) : currentStep < totalSteps - 1 ? (
          <>
            <span>Continuer</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>M&apos;envoyer mon accès magique</span>
            <span>✨</span>
          </>
        )}
      </motion.button>

      {/* Trust note */}
      <p className="text-center text-gray-600 text-[10px] mt-3">
        🔒 Aucun spam. Vos données restent confidentielles.
      </p>
    </motion.div>
  );
};

export default DeferredLeadCapture;
