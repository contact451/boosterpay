import { useState, useEffect, useMemo, useCallback, Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { AnimatedBackground } from '../components/DebtorLayout';
import KPICards from '../components/dashboard/KPICards';
import SearchFilters from '../components/dashboard/SearchFilters';
import DossierTable from '../components/dashboard/DossierTable';
import DossierDetail from '../components/dashboard/DossierDetail';
import ExportButton from '../components/dashboard/ExportButton';
import { fetchPartnerDashboard, getEffectiveStatus } from '../services/dashboardService';

class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Dashboard error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen text-white flex items-center justify-center px-4" style={{ background: '#0a0f1a' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">Erreur d'affichage</h2>
            <p className="text-sm text-gray-400 mb-4">{this.state.error?.message || 'Une erreur est survenue'}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 min-w-[150px] lg:min-w-0 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] mb-3" />
      <div className="h-7 w-16 bg-white/[0.06] rounded mb-2" />
      <div className="h-3 w-24 bg-white/[0.06] rounded" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="glass-card rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-white/[0.06] rounded mb-1" />
          <div className="h-3 w-20 bg-white/[0.06] rounded" />
        </div>
        <div className="h-5 w-16 bg-white/[0.06] rounded" />
      </div>
    </div>
  );
}

function DashboardPartenaireInner() {
  const { partnerId } = useParams();
  const isMobile = useIsMobile();
  const scrolled = useScrolled();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateAjout');
  const [selectedDossier, setSelectedDossier] = useState(null);

  const handleSearchChange = useCallback((v) => setSearch(v), []);
  const handleStatusChange = useCallback((v) => setStatusFilter(v), []);
  const handleSortChange = useCallback((v) => setSortBy(v), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPartnerDashboard(partnerId);
      setData(result);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredDossiers = useMemo(() => {
    if (!data?.dossiers) return [];
    let result = data.dossiers;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d.clientDebiteur?.toLowerCase().includes(q) ||
        d.numeroFacture?.toLowerCase().includes(q) ||
        String(d.montant).includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((d) => getEffectiveStatus(d) === statusFilter);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'montant') return (b.montant || 0) - (a.montant || 0);
      if (sortBy === 'joursRetard') return (b.joursRetard || 0) - (a.joursRetard || 0);
      return new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0);
    });

    return result;
  }, [data, search, statusFilter, sortBy]);

  const kpis = useMemo(() => {
    const dossiers = filteredDossiers;
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
  }, [filteredDossiers]);

  // Error state
  if (!loading && error) {
    return (
      <div className="min-h-screen text-white">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Ce tableau de bord n'existe pas</h2>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Réessayer
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />

      {/* Header */}
      <header className={`sticky top-0 z-20 px-4 md:px-8 py-3 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/[0.06]' : 'border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/" className="text-lg font-bold tracking-tight shrink-0">
              Booster<span className="text-blue-500">Pay</span>
            </Link>
            {data?.partner?.name && (
              <>
                <div className="w-px h-6 bg-white/10 hidden sm:block" />
                <span className="text-sm text-gray-400 truncate hidden sm:block">{data.partner.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExportButton dossiers={filteredDossiers} partnerName={data?.partner?.name || 'export'} kpis={kpis} />
            <Link
              to={`/onboarding/step2?ref=${partnerId}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter un impayé</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Partner name mobile */}
        {data?.partner?.name && (
          <div className="sm:hidden">
            <h1 className="text-xl font-bold text-white">{data.partner.name}</h1>
          </div>
        )}

        {/* KPIs */}
        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <KPICards dossiers={data?.dossiers || []} />
        )}

        {/* Filters */}
        <SearchFilters
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filteredDossiers.length} dossier{filteredDossiers.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' ? ` · Filtre : ${statusFilter}` : ''}
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <DossierTable dossiers={filteredDossiers} onSelect={setSelectedDossier} />
        )}
      </main>

      {/* Detail panel */}
      <DossierDetail
        dossier={selectedDossier}
        onClose={() => setSelectedDossier(null)}
        isMobile={isMobile}
      />

      {/* Footer */}
      <footer className="relative z-10 mt-8 border-t border-white/[0.06] px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} BoosterPay</span>
          <Link to="/mentions-legales" className="hover:text-gray-400 transition-colors">Mentions légales</Link>
          <Link to="/politique-confidentialite" className="hover:text-gray-400 transition-colors">Confidentialité</Link>
          <Link to="/cgv" className="hover:text-gray-400 transition-colors">CGV</Link>
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPartenaire() {
  return (
    <DashboardErrorBoundary>
      <DashboardPartenaireInner />
    </DashboardErrorBoundary>
  );
}
