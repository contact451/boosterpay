import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, FileText, Calendar, Hash, StickyNote, AlertTriangle, CreditCard, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import TimelineRelance from './TimelineRelance';
import { getEffectiveStatus, formatMontant, formatDateLong } from '../../services/dashboardService';

function InfoRow({ icon: Icon, label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
      <div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm text-white">{value}</div>
      </div>
    </div>
  );
}

export default function DossierDetail({ dossier, onClose, isMobile }) {
  if (!dossier) return null;

  const status = getEffectiveStatus(dossier);
  const modeLabels = { card: 'Carte bancaire', '3x': 'Paiement en 3x', differe_30j: 'Différé 30 jours' };

  const content = (
    <div className="h-full flex flex-col bg-[#0d1424] border-l border-white/[0.06]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d1424]/95 backdrop-blur-lg border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
              {dossier.clientDebiteur?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white truncate">{dossier.clientDebiteur}</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                {dossier.numeroFacture && (
                  <span className="text-xs text-gray-500">#{dossier.numeroFacture}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Section 1 - Infos */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informations du dossier</h4>
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Montant</span>
              <span className="text-lg font-bold text-white">{formatMontant(dossier.montant)}</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <InfoRow icon={User} label="Débiteur" value={dossier.clientDebiteur} />
            <InfoRow icon={Mail} label="Email" value={dossier.emailDebiteur} />
            <InfoRow icon={Phone} label="Téléphone" value={dossier.telephone1 ? `${dossier.telephone1}${dossier.typeTel1 ? ` (${dossier.typeTel1})` : ''}` : null} />
            {dossier.telephone2 && <InfoRow icon={Phone} label="Téléphone 2" value={`${dossier.telephone2}${dossier.typeTel2 ? ` (${dossier.typeTel2})` : ''}`} />}
            <InfoRow icon={Hash} label="N° Facture" value={dossier.numeroFacture} />
            <InfoRow icon={Calendar} label="Échéance" value={formatDateLong(dossier.dateEcheance)} />
            <InfoRow icon={Calendar} label="Ajouté le" value={formatDateLong(dossier.dateAjout)} />
            <InfoRow icon={Clock} label="Retard" value={dossier.joursRetard ? `${dossier.joursRetard} jours` : null} />
            <InfoRow icon={FileText} label="Source" value={dossier.sourceImport} />
            {dossier.notes && <InfoRow icon={StickyNote} label="Notes" value={dossier.notes} />}
          </div>
        </section>

        {/* Section 2 - Timeline */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Timeline des relances ({dossier.relances?.length || 0})
          </h4>
          <div className="glass-card rounded-xl p-4">
            <TimelineRelance relances={dossier.relances} contestation={dossier.contestation} paiement={dossier.paiement} />
          </div>
        </section>

        {/* Section 3 - Contestation */}
        {dossier.contestation?.motif && (
          <section className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contestation</h4>
            <div className="glass-card rounded-xl p-4 border-l-2 border-red-500/50 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-red-300">{dossier.contestation.motif}</div>
                  {dossier.contestation.precisions && (
                    <p className="text-sm text-gray-400 mt-1">{dossier.contestation.precisions}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {dossier.contestation.date && <span>Reçue le {formatDateLong(dossier.contestation.date)}</span>}
                {dossier.contestation.statut && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{dossier.contestation.statut}</span>
                )}
              </div>
              {dossier.contestation.fichiers && (
                <a
                  href={dossier.contestation.fichiers}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Voir les justificatifs
                </a>
              )}
            </div>
          </section>
        )}

        {/* Section 4 - Paiement */}
        {dossier.paiement?.date && (
          <section className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paiement</h4>
            <div className="glass-card rounded-xl p-4 border-l-2 border-green-500/50 space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <CreditCard className="w-4 h-4" />
                <span className="font-semibold">{formatMontant(dossier.paiement.montantPaye)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Mode</span><div className="text-white">{modeLabels[dossier.paiement.mode] || dossier.paiement.mode || '—'}</div></div>
                <div><span className="text-gray-500">Date</span><div className="text-white">{formatDateLong(dossier.paiement.date)}</div></div>
                {dossier.paiement.commission > 0 && (
                  <div><span className="text-gray-500">Frais de transactions + Commission BP</span><div className="text-white">{formatMontant(dossier.paiement.commission)}</div></div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Section 5 - Prochaine action */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prochaine action</h4>
          <div className="glass-card rounded-xl p-4">
            {status === 'PAYÉ' ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CreditCard className="w-4 h-4" />
                Dossier clos — Payé le {formatDateLong(dossier.paiement?.date || dossier.dateRecuperation)}
              </div>
            ) : status === 'Contentieux' ? (
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Dossier transmis au service contentieux
              </div>
            ) : dossier.relances?.length > 0 ? (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Clock className="w-4 h-4" />
                {dossier.relances[dossier.relances.length - 1]?.prochaineAction || 'En cours de traitement'}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Clock className="w-4 h-4" />
                Premier appel IA en attente de programmation
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {dossier && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed top-0 right-0 z-40 h-full ${isMobile ? 'w-full' : 'w-[480px] max-w-full'}`}
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
