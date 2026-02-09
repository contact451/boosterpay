import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, Phone, ArrowRight,
  Zap, MessageSquare, Mail
} from 'lucide-react';

// Hook mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// === FOND ANIMÉ AURORA (identique à BoosterPayLanding) ===
function AnimatedBackground() {
  const isMobile = useIsMobile();

  // VERSION MOBILE : Fond statique simple, ultra fluide
  if (isMobile) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />
        {/* Lueur verte succès en haut */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 150% 80% at 50% 0%, rgba(34,197,94,0.25) 0%, transparent 50%)',
          }}
        />
        {/* Lueur bleue en bas */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(59,130,246,0.2) 0%, transparent 40%)',
          }}
        />
        {/* Lueur violette subtile au centre */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 50%)',
          }}
        />
      </div>
    );
  }

  // VERSION DESKTOP : Animations Aurora complètes
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0a0f1a] to-[#050608]" />

      {/* Couche 1 : Lueur verte succès (dominante) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 50% 20%, rgba(34,197,94,0.35) 0%, transparent 60%)',
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Couche 2 : Lueur bleue */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 50% at 20% 80%, rgba(59,130,246,0.3) 0%, transparent 55%)',
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Couche 3 : Lueur violette */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 80% 60%, rgba(139,92,246,0.25) 0%, transparent 50%)',
        }}
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Couche 4 : Lueur cyan en bas */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(6,182,212,0.2) 0%, transparent 40%)',
        }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe vert flottant (succès) */}
      <motion.div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe bleu flottant */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbe violet flottant */}
      <motion.div
        className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Particules flottantes subtiles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${10 + (i * 6) % 80}%`,
            top: `${15 + (i * 7) % 70}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Ligne lumineuse horizontale subtile */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)',
        }}
        animate={{ opacity: [0, 0.5, 0], scaleX: [0.3, 1, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// Confetti explosion
function ConfettiExplosion() {
  const isMobile = useIsMobile();
  const colors = ['#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#10B981'];
  const count = isMobile ? 30 : 60;

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * (isMobile ? 300 : 500),
    y: -(Math.random() * 400 + 150),
    rotate: Math.random() * 720 - 360,
    color: colors[i % colors.length],
    size: Math.random() * 10 + 4,
    delay: Math.random() * 0.4,
    duration: 2 + Math.random() * 1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 1,
            x: '50vw',
            y: '35vh',
            scale: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: `calc(50vw + ${p.x}px)`,
            y: `calc(35vh + ${p.y}px)`,
            scale: [0, 1.2, 0.5],
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// Checkmark animé
function AnimatedCheckmark() {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      className="relative"
    >
      {/* Cercles pulsants */}
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500/30"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500/20"
        animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />

      {/* Étoiles orbitantes - Desktop uniquement */}
      {!isMobile && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-green-400"
          style={{
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: Math.cos((i * 60 * Math.PI) / 180) * 80,
            y: Math.sin((i * 60 * Math.PI) / 180) * 80,
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Cercle principal */}
      <motion.div
        className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
        animate={isMobile ? {} : {
          boxShadow: [
            '0 0 40px rgba(34,197,94,0.4)',
            '0 0 80px rgba(34,197,94,0.6)',
            '0 0 40px rgba(34,197,94,0.4)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <CheckCircle className="w-14 h-14 md:w-20 md:h-20 text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Timeline des prochaines étapes
function NextStepsTimeline() {
  const steps = [
    { icon: Zap, title: 'Analyse en cours', desc: "Notre IA prépare les scripts d'appel", time: 'Maintenant', active: true },
    { icon: Phone, title: 'Premiers appels', desc: 'Vos clients seront contactés', time: 'Sous 24h', active: false },
    { icon: MessageSquare, title: 'Suivi SMS', desc: 'Rappels automatiques envoyés', time: 'J+2', active: false },
    { icon: Mail, title: 'Rapport complet', desc: 'Récapitulatif par email', time: 'J+7', active: false },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-bold text-white mb-6 text-center">Ce qui va se passer</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + index * 0.15 }}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
              step.active
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              step.active
                ? 'bg-green-500/20'
                : 'bg-white/[0.05]'
            }`}>
              <step.icon className={`w-5 h-5 ${step.active ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold ${step.active ? 'text-green-400' : 'text-white'}`}>
                  {step.title}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  step.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/[0.05] text-gray-500'
                }`}>
                  {step.time}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Composant principal
export default function OnboardingSuccess() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />
      {showConfetti && <ConfettiExplosion />}

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <a href="/" className="text-xl font-bold tracking-tight">
            Booster<span className="text-blue-500">Pay</span>
          </a>
        </motion.div>

        {/* Checkmark central */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <AnimatedCheckmark />
        </motion.div>

        {/* Message principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              C&apos;est parti !
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
            Vos factures sont en route vers notre IA.
            <br className="hidden md:block" />
            On s&apos;occupe de tout.
          </p>
        </motion.div>

        {/* Stats rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-6 md:gap-10 mb-12"
        >
          {[
            { value: '24h', label: 'Premier appel', highlight: false },
            { value: '94%', label: 'Taux de succès', highlight: true },
            { value: '0€', label: 'Si pas de résultat', highlight: false },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="text-center relative"
            >
              {/* Glow derrière le stat highlight */}
              {stat.highlight && (
                <motion.div
                  className="absolute inset-0 -m-4 rounded-2xl bg-green-500/20 blur-xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <p className={`text-3xl md:text-4xl font-bold relative ${stat.highlight ? 'text-green-400' : 'text-white'}`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 relative">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-12"
        >
          <NextStepsTimeline />
        </motion.div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center"
        >
          <motion.a
            href="/"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-shadow"
          >
            Retour à l&apos;accueil
            <ArrowRight className="w-5 h-5" />
          </motion.a>

          <p className="text-gray-500 text-sm mt-4">
            Vous recevrez un email de confirmation sous peu
          </p>
        </motion.div>
      </div>
    </div>
  );
}
