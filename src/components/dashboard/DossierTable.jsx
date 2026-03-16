import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Phone } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getEffectiveStatus, formatMontant, formatDate } from '../../services/dashboardService';

function DesktopTable({ dossiers, onSelect }) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Client Débiteur', 'N° Facture', 'Montant', 'Ajouté le', 'Retard', 'Statut', 'Relances', 'Récupéré', ''].map((h) => (
              <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-3 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {dossiers.map((d, i) => {
              const status = getEffectiveStatus(d);
              const recup = d.paiement?.montantPaye || d.montantRecupere;
              return (
                <motion.tr
                  key={d.idImpaye}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelect(d)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 first:pl-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-gray-400 shrink-0">
                        {d.clientDebiteur?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-white">{d.clientDebiteur}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-400">{d.numeroFacture || '—'}</td>
                  <td className="py-3 px-3 text-white font-semibold">{formatMontant(d.montant)}</td>
                  <td className="py-3 px-3 text-gray-400">{formatDate(d.dateAjout)}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium ${d.joursRetard > 60 ? 'text-red-400' : d.joursRetard > 30 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {d.joursRetard}j
                    </span>
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={status} /></td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{d.relances?.length || 0}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {recup > 0 ? (
                      <span className="text-green-400 font-semibold">{formatMontant(recup)}</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({ dossiers, onSelect }) {
  return (
    <div className="lg:hidden space-y-3">
      <AnimatePresence>
        {dossiers.map((d, i) => {
          const status = getEffectiveStatus(d);
          const recup = d.paiement?.montantPaye || d.montantRecupere;
          return (
            <motion.div
              key={d.idImpaye}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(d)}
              className="glass-card rounded-xl p-4 cursor-pointer hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-400 shrink-0">
                    {d.clientDebiteur?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{d.clientDebiteur}</div>
                    <div className="text-xs text-gray-500">
                      {d.numeroFacture ? `#${d.numeroFacture}` : '—'} · {formatDate(d.dateAjout)}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-white">{formatMontant(d.montant)}</div>
                  {recup > 0 && <div className="text-xs text-green-400">{formatMontant(recup)}</div>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className={`text-xs ${d.joursRetard > 60 ? 'text-red-400' : 'text-gray-500'}`}>
                    {d.joursRetard}j retard
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  {d.relances?.length || 0}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function DossierTable({ dossiers, onSelect }) {
  if (dossiers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-7 h-7 text-gray-600" />
        </div>
        <p className="text-gray-400 text-sm">Aucun dossier ne correspond à votre recherche</p>
      </div>
    );
  }

  return (
    <>
      <DesktopTable dossiers={dossiers} onSelect={onSelect} />
      <MobileCards dossiers={dossiers} onSelect={onSelect} />
    </>
  );
}
