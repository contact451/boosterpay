import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Euro, TrendingUp, Activity, Phone, CheckCircle } from 'lucide-react';
import { getEffectiveStatus, formatMontant } from '../../services/dashboardService';

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.5 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString('fr-FR')}{suffix}</>;
}

function CircularGauge({ percentage }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="70" height="70" className="shrink-0">
      <circle cx="35" cy="35" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="none" />
      <motion.circle
        cx="35" cy="35" r={radius}
        stroke="url(#gaugeGrad)" strokeWidth="5" fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        transform="rotate(-90 35 35)"
      />
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <text x="35" y="35" textAnchor="middle" dominantBaseline="central" className="fill-white text-sm font-bold">
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

export default function KPICards({ dossiers }) {
  const kpis = useMemo(() => {
    const totalDossiers = dossiers.length;
    const montantTotal = dossiers.reduce((s, d) => s + (d.montant || 0), 0);
    const montantRecupere = dossiers.reduce((s, d) => {
      if (d.paiement?.montantPaye) return s + d.paiement.montantPaye;
      if (d.montantRecupere) return s + d.montantRecupere;
      return s;
    }, 0);
    const tauxRecup = montantTotal > 0 ? (montantRecupere / montantTotal) * 100 : 0;
    const dossiersActifs = dossiers.filter((d) => {
      const s = getEffectiveStatus(d);
      return s !== 'PAYÉ' && s !== 'Contentieux';
    }).length;
    const appelsIA = dossiers.reduce((s, d) => s + (d.relances?.length || 0), 0);

    return { totalDossiers, montantTotal, montantRecupere, tauxRecup, dossiersActifs, appelsIA };
  }, [dossiers]);

  const cards = [
    { icon: FileText, label: 'Dossiers déposés', value: kpis.totalDossiers, suffix: '', color: 'blue' },
    { icon: Euro, label: 'Montant total', value: kpis.montantTotal, isMoney: true, color: 'cyan' },
    { icon: CheckCircle, label: 'Montant récupéré', value: kpis.montantRecupere, isMoney: true, color: 'green' },
    { icon: TrendingUp, label: 'Taux de récupération', gauge: kpis.tauxRecup, color: 'green' },
    { icon: Activity, label: 'Dossiers actifs', value: kpis.dossiersActifs, color: 'orange' },
    { icon: Phone, label: 'Appels IA passés', value: kpis.appelsIA, color: 'blue' },
  ];

  const glowMap = { blue: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]', green: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]', orange: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' };
  const iconBgMap = { blue: 'bg-blue-500/15 text-blue-400', cyan: 'bg-cyan-500/15 text-cyan-400', green: 'bg-green-500/15 text-green-400', orange: 'bg-orange-500/15 text-orange-400' };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`glass-card rounded-2xl p-4 min-w-[150px] lg:min-w-0 flex flex-col gap-3 ${glowMap[card.color]}`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgMap[card.color]}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              {card.gauge !== undefined && <CircularGauge percentage={card.gauge} />}
            </div>
            {card.gauge === undefined && (
              <div className="text-2xl font-bold text-white">
                {card.isMoney ? (
                  <AnimatedNumber value={card.value} suffix=" €" />
                ) : (
                  <AnimatedNumber value={card.value} />
                )}
              </div>
            )}
            <div className="text-xs text-gray-400 font-medium">{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
