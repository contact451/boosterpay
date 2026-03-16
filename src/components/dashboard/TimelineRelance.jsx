import { motion } from 'framer-motion';
import { Phone, MessageSquare, Mail, CreditCard, AlertTriangle, Gavel, Sparkles } from 'lucide-react';
import { formatDateTime } from '../../services/dashboardService';
import StatusBadge from './StatusBadge';

function TimelineItem({ icon: Icon, iconBg, title, subtitle, time, children }) {
  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-[13px] top-8 bottom-0 w-px bg-white/10 last:hidden" />
      {/* Dot */}
      <div className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-white">{title}</div>
            {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
          </div>
          <span className="text-[11px] text-gray-500 shrink-0">{time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TimelineRelance({ relances, contestation, paiement }) {
  if ((!relances || relances.length === 0) && !paiement?.date) {
    return (
      <div className="text-center py-8">
        <Phone className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Aucune relance effectuée pour le moment</p>
      </div>
    );
  }

  const events = [];

  (relances || []).forEach((r) => {
    events.push({
      type: 'appel',
      date: r.date,
      data: r,
    });
  });

  if (paiement?.date) {
    events.push({
      type: 'paiement',
      date: paiement.date,
      data: paiement,
    });
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        if (event.type === 'appel') {
          const r = event.data;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TimelineItem
                icon={Phone}
                iconBg="bg-blue-500/20 text-blue-400"
                title="Appel IA"
                subtitle={r.telephone ? `Tel: ${r.telephone}` : undefined}
                time={formatDateTime(r.date)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={r.statutRelance} />
                  {r.prochaineAction && (
                    <span className="text-[11px] text-gray-500">
                      Prochaine action : {r.prochaineAction}
                    </span>
                  )}
                </div>
                {r.resumeAppel && (
                  <div className="mt-2 flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-purple-200/90 leading-relaxed">{r.resumeAppel}</p>
                  </div>
                )}
              </TimelineItem>
            </motion.div>
          );
        }

        if (event.type === 'paiement') {
          const p = event.data;
          const modeLabels = { card: 'Carte bancaire', '3x': 'Paiement en 3x', 'differe_30j': 'Différé 30 jours' };
          return (
            <motion.div
              key="paiement"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TimelineItem
                icon={CreditCard}
                iconBg="bg-green-500/20 text-green-400"
                title="Paiement reçu"
                time={formatDateTime(p.date)}
              >
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Montant</span>
                    <span className="text-green-400 font-bold">{p.montantPaye?.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mode</span>
                    <span className="text-white">{modeLabels[p.mode] || p.mode || '—'}</span>
                  </div>
                </div>
              </TimelineItem>
            </motion.div>
          );
        }

        return null;
      })}
    </div>
  );
}
