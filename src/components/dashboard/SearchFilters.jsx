import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const STATUSES = [
  { key: 'all', label: 'Tous' },
  { key: 'En attente', label: 'En attente' },
  { key: 'En cours', label: 'En cours' },
  { key: 'PROMESSE', label: 'Promesse' },
  { key: 'INJOIGNABLE', label: 'Injoignable' },
  { key: 'LITIGE', label: 'Litige' },
  { key: 'REFUS', label: 'Refus' },
  { key: 'PAYÉ', label: 'Payé' },
  { key: 'Contentieux', label: 'Contentieux' },
];

const SORTS = [
  { key: 'dateAjout', label: 'Date d\'ajout' },
  { key: 'montant', label: 'Montant' },
  { key: 'joursRetard', label: 'Jours de retard' },
];

export default function SearchFilters({ search, onSearchChange, statusFilter, onStatusChange, sortBy, onSortChange }) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un débiteur, n° facture, montant..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
        />
      </div>

      {/* Status filters + Sort */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => onStatusChange(s.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s.key
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trier</span>
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => { onSortChange(s.key); setShowSort(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      sortBy === s.key ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
