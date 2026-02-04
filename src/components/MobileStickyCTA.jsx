import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Phone, ChevronUp, Gift, ArrowRight, Shield, Check, Sparkles } from 'lucide-react';

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

// Composant pour le rainbow border animé
const RainbowBorder = ({ children }) => (
  <div className="relative p-[2px] rounded-xl overflow-hidden">
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6, #ec4899, #3b82f6)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
    <div className="relative bg-[#0a0f1a] rounded-[10px]">
      {children}
    </div>
  </div>
);

// Mode Compact
const CompactMode = ({ onExpand, onOpenBooking, onOpenLeadForm }) => (
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
      {/* Bouton principal - 10 jours gratuits */}
      <motion.button
        onClick={() => onOpenLeadForm()}
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

// Mode Expanded
const ExpandedMode = ({ onCollapse, onOpenBooking, onOpenLeadForm }) => (
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

    {/* Header */}
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
        Rejoignez 13 469+ entreprises qui récupèrent leurs créances
      </p>
    </div>

    {/* Stats en ligne */}
    <div className="flex justify-center gap-6 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="text-xl font-bold text-cyan-400">-26j</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Délai paiement</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="text-xl font-bold text-green-400">94%</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Taux succès</div>
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

    {/* CTA Principal avec Rainbow Border */}
    <RainbowBorder>
      <motion.button
        onClick={() => onOpenLeadForm()}
        className="relative w-full py-4 rounded-[10px] font-bold text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        <ShimmerEffect />
        <span className="relative z-10 flex items-center justify-center gap-2">
          Démarrer l'essai gratuit
          <ArrowRight className="w-5 h-5" />
        </span>
      </motion.button>
    </RainbowBorder>

    {/* CTA Secondaire */}
    <motion.button
      onClick={onOpenBooking}
      className="w-full mt-3 py-3 rounded-xl font-semibold text-purple-400 border border-purple-500/50 bg-purple-500/10 flex items-center justify-center gap-2"
      whileTap={{ scale: 0.98 }}
    >
      <Phone className="w-4 h-4" />
      Parler à un expert (gratuit)
    </motion.button>

    {/* Trust footer */}
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
  </motion.div>
);

const MobileStickyCTA = ({ onOpenBooking, onOpenLeadForm }) => {
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

  // Ne pas afficher sur desktop
  if (!isMobile) return null;

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
                  onOpenLeadForm={onOpenLeadForm}
                />
              ) : (
                <ExpandedMode
                  key="expanded"
                  onCollapse={() => setIsExpanded(false)}
                  onOpenBooking={onOpenBooking}
                  onOpenLeadForm={onOpenLeadForm}
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
