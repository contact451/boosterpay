import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Phone, ChevronUp, Gift, ArrowRight, Shield, Check, Sparkles, Mail, Loader2, X } from 'lucide-react';

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

// Composant pour le shimmer effect
const ShimmerEffect = () => (
  <motion.div
    className="absolute inset-0 overflow-hidden rounded-xl"
    initial={false}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
      animate={{ x: ['-200%', '200%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </motion.div>
);

// Composant pour le pulse effect du bouton téléphone
const PulseRing = () => (
  <motion.div
    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600"
    animate={{
      scale: [1, 1.5],
      opacity: [0.5, 0],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Confetti animation component (simplified for mobile)
const SuccessConfetti = () => {
  const confettiColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
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
            y: [0, -60 - Math.random() * 40, 100],
            x: (Math.random() - 0.5) * 100,
            opacity: [1, 1, 0],
            scale: [1, 1.2, 0.5],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 1 + Math.random() * 0.3,
            ease: 'easeOut',
            delay: Math.random() * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Mode Compact
const CompactMode = ({ onExpand, onOpenBooking }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="px-4 pt-2 pb-6"
    style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
  >
    {/* Chevron pour expand */}
    <motion.button
      onClick={onExpand}
      className="w-full flex justify-center mb-2"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronUp className="w-5 h-5 text-gray-400" />
      </motion.div>
    </motion.button>

    {/* Boutons */}
    <div className="flex gap-3">
      {/* Bouton principal - 10 jours gratuits → Expands to show form */}
      <motion.button
        onClick={onExpand}
        className="relative flex-1 py-3.5 rounded-xl font-semibold text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)',
        }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.5)',
            '0 0 40px rgba(59, 130, 246, 0.8)',
            '0 0 20px rgba(59, 130, 246, 0.5)',
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        <ShimmerEffect />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" />
          10 jours gratuits
        </span>
      </motion.button>

      {/* Bouton secondaire - Téléphone */}
      <motion.button
        onClick={onOpenBooking}
        className="relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
        }}
        whileTap={{ scale: 0.95 }}
      >
        <PulseRing />
        <Phone className="w-5 h-5 text-white relative z-10" />
      </motion.button>
    </div>

    {/* Trust badges mini */}
    <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-gray-400">
      <span className="flex items-center gap-1">
        <Check className="w-3 h-3 text-green-400" />
        Sans engagement
      </span>
      <span className="flex items-center gap-1">
        <Check className="w-3 h-3 text-green-400" />
        Résultats 48h
      </span>
      <span className="flex items-center gap-1">
        <Check className="w-3 h-3 text-green-400" />
        100% gratuit
      </span>
    </div>
  </motion.div>
);

// Mode Expanded with inline form
const ExpandedMode = ({ onCollapse, onOpenBooking }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneStatus, setPhoneStatus] = useState('empty');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null); // 'email' | 'phone' | null
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  // Auto-scroll input into view when focused
  const handleFocus = (field, ref) => {
    setFocusedField(field);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setPhoneStatus(getPhoneStatus(formatted));
    setError('');
  };

  const handleSubmit = async () => {
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide');
      return;
    }

    // Validation STRICTE du téléphone
    if (!validateFrenchMobile(phone)) {
      const errorMsg = getPhoneErrorMessage(phone);
      setError(errorMsg);
      // Animation shake sur l'input
      if (phoneRef.current) {
        phoneRef.current.classList.add('animate-shake');
        setTimeout(() => phoneRef.current?.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setStatus('loading');
    setError('');

    const payload = {
      email: email.trim().toLowerCase(),
      telephone: phone.replace(/\D/g, ''),
      source: 'mobile_cta',
      score: 10,
      timestamp: new Date().toISOString(),
      appareil: 'mobile',
    };

    console.log('📱 MOBILE CTA - Lead qualifié:', payload);

    await new Promise(r => setTimeout(r, 1000));
    setStatus('success');
  };

  const digits = phone.replace(/\D/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 pt-4 pb-6"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Chevron pour collapse */}
      <motion.button
        onClick={onCollapse}
        className="w-full flex justify-center mb-3"
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: 180 }}
          className="bg-white/10 rounded-full p-1"
        >
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center py-6"
        >
          {/* Confetti */}
          <SuccessConfetti />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white">C'est parti ! 🎉</h3>
          <p className="text-gray-400 text-sm mt-1">Notre équipe vous contacte sous 48h</p>
        </motion.div>
      ) : (
        <>
          {/* Header - hidden when input focused */}
          {!focusedField && (
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="text-2xl mb-1"
              >
                <Sparkles className="w-8 h-8 mx-auto text-yellow-400" />
              </motion.div>
              <h3 className="text-lg font-bold text-white">
                Récupérez votre argent maintenant
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Rejoignez 13 469+ entreprises
              </p>
            </div>
          )}

          {/* Stats en ligne - hidden when input focused */}
          {!focusedField && (
            <div className="flex justify-center gap-6 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-xl font-bold text-cyan-400">-26j</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Délai</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-xl font-bold text-green-400">94%</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Succès</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-xl font-bold text-purple-400">8.7M€</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Récupérés</div>
              </motion.div>
            </div>
          )}

          {/* Inline Form */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onFocus={() => handleFocus('email', emailRef)}
                onBlur={() => setFocusedField(null)}
                placeholder="votre@email.fr"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-base"
                disabled={status === 'loading'}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                onFocus={() => handleFocus('phone', phoneRef)}
                onBlur={() => setFocusedField(null)}
                placeholder="06 __ __ __ __"
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border transition-all text-base ${
                  phoneStatus === 'valid'
                    ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : phoneStatus === 'invalid'
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                } text-white placeholder-gray-500 focus:outline-none focus:ring-1`}
                disabled={status === 'loading'}
                autoComplete="tel"
              />

              {/* Indicateur de validité à droite */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {phoneStatus === 'valid' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                {phoneStatus === 'invalid' && digits.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                {phoneStatus === 'incomplete' && (
                  <span className="text-xs text-gray-500 font-medium">
                    {10 - digits.length}
                  </span>
                )}
              </div>
            </div>

            {/* Message d'aide en temps réel */}
            {phoneStatus === 'invalid' && digits.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs -mt-1 pl-1"
              >
                {getPhoneErrorMessage(phone)}
              </motion.p>
            )}

            {error && (
              <p className="text-red-400 text-xs pl-1">{error}</p>
            )}
          </div>

          {/* CTA Principal */}
          <motion.button
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className="relative w-full py-4 rounded-xl font-bold text-white overflow-hidden disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)',
            }}
            whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
            animate={phoneStatus === 'valid' ? {
              boxShadow: [
                '0 5px 15px -3px rgba(59, 130, 246, 0.3)',
                '0 5px 30px -3px rgba(59, 130, 246, 0.5)',
                '0 5px 15px -3px rgba(59, 130, 246, 0.3)',
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Démarrer l'essai gratuit
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </motion.button>

          {/* CTA Secondaire - hidden when input focused */}
          {!focusedField && (
            <motion.button
              onClick={onOpenBooking}
              className="w-full mt-3 py-3 rounded-xl font-semibold text-purple-400 border border-purple-500/50 bg-purple-500/10 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-4 h-4" />
              Parler à un expert (gratuit)
            </motion.button>
          )}

          {/* Trust footer - hidden when input focused */}
          {!focusedField && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Données sécurisées
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-400" />
                Sans engagement
              </span>
              <span>Made in France</span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

const MobileStickyCTA = ({ onOpenBooking, isHidden = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  // Détection mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Affichage après 500px de scroll + auto-collapse
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsVisible(latest > 500);

    // Auto-collapse si scroll rapide
    const delta = Math.abs(latest - lastScrollY.current);
    if (isExpanded && delta > 50) {
      setIsExpanded(false);
    }
    lastScrollY.current = latest;
  });

  // Ne pas afficher sur desktop ou si un modal est ouvert
  if (!isMobile || isHidden) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
        >
          {/* Gradient fade top */}
          <div className="h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none" />

          {/* Container */}
          <div className="bg-[#0a0f1a]/95 backdrop-blur-xl border-t border-white/10">
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <CompactMode
                  key="compact"
                  onExpand={() => setIsExpanded(true)}
                  onOpenBooking={onOpenBooking}
                />
              ) : (
                <ExpandedMode
                  key="expanded"
                  onCollapse={() => setIsExpanded(false)}
                  onOpenBooking={onOpenBooking}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileStickyCTA;
