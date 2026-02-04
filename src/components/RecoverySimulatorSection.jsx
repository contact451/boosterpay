import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Banknote, TrendingUp, Mail, ArrowRight, Check, Loader2, Minus, Plus, Euro, Sparkles } from 'lucide-react';

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

// Animated counter hook
const useAnimatedNumber = (value, duration = 1000) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
};

// Custom slider component
const CustomSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  label,
  formatValue,
  isMobile
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleIncrement = () => {
    const newValue = Math.min(value + step * 5, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step * 5, min);
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-bold text-lg">{formatValue(value)}</span>
      </div>

      <div className="flex items-center gap-3">
        {isMobile && (
          <motion.button
            type="button"
            onClick={handleDecrement}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </motion.button>
        )}

        <div className="flex-1 relative h-3">
          {/* Track background */}
          <div className="absolute inset-0 rounded-full bg-white/10" />

          {/* Track fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            style={{ width: `${percentage}%` }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          />

          {/* Slider input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg shadow-blue-500/30 border-2 border-blue-500 pointer-events-none"
            style={{ left: `calc(${percentage}% - 10px)` }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          />
        </div>

        {isMobile && (
          <motion.button
            type="button"
            onClick={handleIncrement}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

// Format number with spaces (French format)
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const RecoverySimulatorSection = ({ onOpenLeadForm, prefilledEmail = '' }) => {
  const [invoices, setInvoices] = useState(25);
  const [avgAmount, setAvgAmount] = useState(2000);
  const [email, setEmail] = useState(prefilledEmail);
  const [isRevealed, setIsRevealed] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Update prefilled email
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  // Calculate recovery
  const calculateRecovery = () => {
    const yearlyUnpaid = invoices * 12 * avgAmount;
    const recoveryRate = 0.73; // 73% recovery rate
    const recovered = Math.round(yearlyUnpaid * recoveryRate);
    const monthly = Math.round(recovered / 12);

    return {
      yearlyUnpaid,
      recovered,
      monthly
    };
  };

  const recovery = calculateRecovery();
  const animatedRecovered = useAnimatedNumber(recovery.recovered, 800);
  const animatedMonthly = useAnimatedNumber(recovery.monthly, 800);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleReveal = async (e) => {
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
      // Log for testing
      console.log('📊 SIMULATEUR - Contact capturé:', {
        email,
        source: 'simulator',
        donnees: {
          facturesParMois: invoices,
          montantMoyen: avgAmount,
          recuperationAnnuelle: recovery.recovered,
          recuperationMensuelle: recovery.monthly
        },
        timestamp: new Date().toISOString()
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus('success');
      setIsRevealed(true);

    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
      setError('Une erreur est survenue');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="simulateur"
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Banknote className="w-4 h-4" />
              Simulateur de récupération
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Combien pouvez-vous{' '}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                récupérer
              </span>{' '}
              ?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Estimez le montant que vous pourriez récupérer chaque année
            </p>
          </motion.div>

          {/* Calculator card */}
          <motion.div
            variants={itemVariants}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8 lg:p-10">
              {/* Sliders */}
              <div className="space-y-8 mb-10">
                {/* Invoices slider */}
                <CustomSlider
                  value={invoices}
                  onChange={setInvoices}
                  min={5}
                  max={500}
                  step={5}
                  label="Nombre de factures impayées par mois"
                  formatValue={(v) => v.toString()}
                  isMobile={isMobile}
                />

                {/* Amount slider */}
                <CustomSlider
                  value={avgAmount}
                  onChange={setAvgAmount}
                  min={100}
                  max={10000}
                  step={100}
                  label="Montant moyen d'une facture"
                  formatValue={(v) => `${formatNumber(v)} €`}
                  isMobile={isMobile}
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10" />

              {/* Results */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Avec BoosterPay, vous pourriez récupérer
                </p>

                {/* Main result */}
                <div className="relative mb-4">
                  <motion.div
                    className={`text-5xl md:text-6xl lg:text-7xl font-bold ${
                      isRevealed ? '' : 'blur-lg select-none'
                    }`}
                    animate={{ filter: isRevealed ? 'blur(0px)' : 'blur(12px)' }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                      {formatNumber(animatedRecovered)} €
                    </span>
                    <span className="text-gray-500 text-2xl md:text-3xl font-normal">
                      /an
                    </span>
                  </motion.div>

                  {!isRevealed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="text-gray-500 text-sm">
                        Entrez votre email pour voir le résultat
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Secondary result */}
                <motion.p
                  className={`text-lg text-gray-400 mb-8 ${
                    isRevealed ? '' : 'blur-md select-none'
                  }`}
                  animate={{ filter: isRevealed ? 'blur(0px)' : 'blur(8px)' }}
                  transition={{ duration: 0.5 }}
                >
                  Soit{' '}
                  <span className="text-emerald-400 font-semibold">
                    {formatNumber(animatedMonthly)} € / mois
                  </span>{' '}
                  de trésorerie en plus
                </motion.p>

                {/* Email capture or revealed state */}
                <AnimatePresence mode="wait">
                  {!isRevealed ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleReveal}
                      className="max-w-md mx-auto space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
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
                            } transition-all`}
                            disabled={status === 'loading'}
                          />
                        </div>
                        <motion.button
                          type="submit"
                          disabled={status === 'loading'}
                          whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                          whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                          className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow disabled:opacity-70 whitespace-nowrap"
                        >
                          {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Voir mon estimation
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </motion.button>
                      </div>
                      {error && (
                        <p className="text-red-400 text-xs text-left pl-1">{error}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Recevez votre estimation détaillée par email
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="revealed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Success badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm">
                        <Check className="w-4 h-4" />
                        Estimation envoyée à {email}
                      </div>

                      {/* Additional stats */}
                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-gray-400 text-xs mb-1">Taux de récupération</p>
                          <p className="text-emerald-400 font-bold text-xl">73%</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-gray-400 text-xs mb-1">Délai moyen</p>
                          <p className="text-blue-400 font-bold text-xl">-26 jours</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.button
                        onClick={() => onOpenLeadForm && onOpenLeadForm(email)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-6 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                      >
                        <Sparkles className="w-5 h-5" />
                        Activer mon essai gratuit
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-500"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Basé sur nos données réelles
              </span>
              <span className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-blue-500" />
                +8,7M € récupérés en 2024
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default RecoverySimulatorSection;
