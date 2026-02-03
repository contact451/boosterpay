import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  FileText, Upload, Plus, Trash2, Phone, Calendar,
  Euro, ChevronDown, ChevronUp, Headphones, Rocket,
  CheckCircle, AlertCircle, X, HelpCircle, ArrowLeft
} from 'lucide-react';
import Papa from 'papaparse';
import DeferredLeadCapture from './components/DeferredLeadCapture';

// === ANIMATIONS ===
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 }
};

// === HOOK : COMPTEUR ANIMÉ ===
function useCountUp(target, duration = 600) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, target, { duration: duration / 1000, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target, duration, motionVal, rounded]);

  return display;
}

// === HOOK : DÉTECTION MOBILE ===
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

// === MASQUER TÉLÉPHONE ===
function maskPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return digits.slice(0, 2) + ' ** ** ' + digits.slice(-2);
}

// === CONFETTI SIMPLE ===
function ConfettiEffect({ trigger }) {
  if (!trigger) return null;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: -(Math.random() * 150 + 50),
    color: ['#06B6D4', '#7C3AED', '#22C55E', '#F59E0B', '#EC4899'][i % 5],
    size: Math.random() * 6 + 4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0, rotate: Math.random() * 360 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// === BARRE DE PROGRESSION ===
function ProgressBar() {
  const steps = ['Inscription', 'Import factures', 'Lancement IA'];
  return (
    <div className="flex items-center gap-2 w-full max-w-md mx-auto mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className={`h-full rounded-full ${
                i < 1 ? 'bg-green-500' : i === 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-white/10'
              }`}
              initial={{ width: 0 }}
              animate={{ width: i <= 1 ? '100%' : '0%' }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            />
          </div>
          <span className={`text-xs ${i <= 1 ? 'text-cyan-400' : 'text-gray-500'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// === PANNEAU AIDE EXPORT ===
function ExportHelpPanel({ isOpen, onToggle }) {
  const guides = [
    { name: 'Pennylane', steps: 'Ventes > Factures > Tout sélectionner > Exporter CSV' },
    { name: 'QuickBooks', steps: 'Ventes > Toutes les ventes > Icône Export > Excel' },
    { name: 'Sage / Cegid', steps: 'Journal des ventes > Actions > Exportation > CSV/Excel' },
    { name: 'Excel / Sheets', steps: 'Fichier > Enregistrer sous > Format .csv (Colonnes : Nom, Tel, Montant, Échéance)' },
  ];

  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-4 h-4" />
        <span>Besoin d&apos;aide pour exporter ?</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {guides.map((g) => (
                <div key={g.name} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <p className="text-sm font-semibold text-white mb-1">{g.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{g.steps}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === MODAL EXPERT ===
function ExpertModal({ isOpen, onClose }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/90"
          />

          {isMobile ? (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 z-[301] bg-[#0f172a] rounded-t-3xl border-t border-x border-violet-500/30"
              style={{ maxHeight: '85vh' }}
            >
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-pink-600/20 rounded-t-3xl">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-violet-400" />
                      <span>Import assisté par un expert</span>
                    </h2>
                    <p className="text-gray-300 text-xs mt-1">15 min pour configurer vos imports</p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full bg-white/10" aria-label="Fermer">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3" style={{ height: '55vh' }}>
                <div className="rounded-xl overflow-hidden bg-white h-full">
                  <iframe
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1a3ileaN1Jry5bswWVf9kB1YVlLPzjwXAbgOAgEJTCdva3yvBaTde-Wdt01MYcJNF3dYAAn-FP?gv=true"
                    className="w-full h-full border-0"
                    title="Réserver un appel expert"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[301] flex items-center justify-center p-8"
            >
              <div className="bg-[#0f172a] rounded-3xl border border-violet-500/30 w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(124,58,237,0.3)]">
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-pink-600/20 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-violet-400" />
                      Import assisté par un expert
                    </h2>
                    <p className="text-gray-300 text-sm mt-1">15 min pour configurer vos imports</p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Fermer">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="p-4" style={{ height: '500px' }}>
                  <div className="rounded-xl overflow-hidden bg-white h-full">
                    <iframe
                      src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1a3ileaN1Jry5bswWVf9kB1YVlLPzjwXAbgOAgEJTCdva3yvBaTde-Wdt01MYcJNF3dYAAn-FP?gv=true"
                      className="w-full h-full border-0"
                      title="Réserver un appel expert"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// === CARD FACTURE ===
function InvoiceCard({ invoice, onDelete, index }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      layout
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 flex items-center justify-between gap-4"
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{invoice.name}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {maskPhone(invoice.phone)}
          </span>
          <span className="flex items-center gap-1">
            <Euro className="w-3 h-3" />
            {parseFloat(invoice.amount).toLocaleString('fr-FR')} €
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      {confirmDelete ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDelete(index)}
            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1 rounded-lg bg-white/10 text-gray-400 text-xs hover:bg-white/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors shrink-0"
          aria-label={`Supprimer la facture de ${invoice.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// === COMPOSANT PRINCIPAL ===
export default function OnboardingStep2() {
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', amount: '', dueDate: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [formError, setFormError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [uploadState, setUploadState] = useState('default'); // default | uploading | success | error
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const isMobile = useIsMobile();

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const canLaunch = invoices.length > 0;
  const animatedCount = useCountUp(invoices.length);
  const animatedTotal = useCountUp(totalAmount);

  // Validation et ajout d'une facture
  const handleAddInvoice = useCallback((e) => {
    e.preventDefault();
    const { name, phone, amount, dueDate } = formData;

    if (!name.trim() || !phone.trim() || !amount || !dueDate) {
      setFormError(true);
      setTimeout(() => setFormError(false), 500);
      return;
    }

    setInvoices((prev) => [...prev, { ...formData, id: Date.now() }]);
    setFormData({ name: '', phone: '', amount: '', dueDate: '' });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  }, [formData]);

  // Suppression d'une facture
  const handleDeleteInvoice = useCallback((index) => {
    setInvoices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Parse CSV
  const processFile = useCallback((file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setUploadState('error');
      setUploadMessage('Format non supporté. Utilisez .csv, .xlsx ou .xls');
      setTimeout(() => setUploadState('default'), 3000);
      return;
    }

    if (ext === 'xlsx' || ext === 'xls') {
      setUploadState('error');
      setUploadMessage('Pour les fichiers Excel, exportez d\'abord en CSV depuis votre logiciel');
      setTimeout(() => setUploadState('default'), 4000);
      return;
    }

    setUploadState('uploading');
    setUploadMessage('Analyse du fichier en cours...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported = [];
        for (const row of results.data) {
          const name = row.Nom || row.nom || row.Client || row.client || row.Name || row.name || '';
          const phone = row.Tel || row.tel || row.Téléphone || row.téléphone || row.Phone || row.phone || '';
          const amount = row.Montant || row.montant || row.Amount || row.amount || '';
          const dueDate = row.Échéance || row.échéance || row.Echeance || row.echeance || row.Date || row.date || row.DueDate || '';

          if (name && phone && amount) {
            imported.push({ name: name.trim(), phone: phone.trim(), amount: String(amount).trim(), dueDate: dueDate.trim(), id: Date.now() + Math.random() });
          }
        }

        if (imported.length > 0) {
          setInvoices((prev) => [...prev, ...imported]);
          setUploadState('success');
          setUploadMessage(`${imported.length} facture(s) importée(s) avec succès`);
        } else {
          setUploadState('error');
          setUploadMessage('Aucune facture valide trouvée. Vérifiez les colonnes : Nom, Tel, Montant, Échéance');
        }
        setTimeout(() => setUploadState('default'), 3000);
      },
      error: () => {
        setUploadState('error');
        setUploadMessage('Erreur lors de la lecture du fichier');
        setTimeout(() => setUploadState('default'), 3000);
      }
    });
  }, []);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = '';
  }, [processFile]);

  // Lancement IA
  const handleLaunch = useCallback(() => {
    console.log('Lancement des appels IA avec', invoices.length, 'factures pour un total de', totalAmount, '€');
    console.log('Factures :', invoices);
  }, [invoices, totalAmount]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Fond décoratif */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-32">
        {/* Navigation retour */}
        <motion.a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </motion.a>

        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-10"
        >
          <ProgressBar />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Importez vos{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              factures impayées
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Notre IA va contacter vos clients pour récupérer vos paiements
          </p>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="flex -space-x-2">
            {['👨‍💼', '👩‍💻', '👨‍🔧', '👩‍💼'].map((emoji, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 border-2 border-[#0a0f1a] flex items-center justify-center text-sm"
              >
                {emoji}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-400 text-sm">
              <span className="text-green-400 font-semibold">127 entreprises</span> utilisent BoosterPay ce mois
            </span>
          </div>
        </motion.div>

        {/* Compteur dynamique */}
        {invoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-6 py-3">
              <span className="text-2xl">🎯</span>
              <span className="text-white font-semibold">
                {animatedCount} facture{invoices.length > 1 ? 's' : ''} ajoutée{invoices.length > 1 ? 's' : ''}
              </span>
              <span className="text-gray-500">—</span>
              <span className="text-cyan-400 font-bold">
                Total à récupérer : {animatedTotal.toLocaleString('fr-FR')} €
              </span>
            </div>
          </motion.div>
        )}

        {/* Sections principales */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Formulaire ajout manuel */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <ConfettiEffect trigger={showConfetti} />
            <motion.div
              animate={formError ? shake : {}}
              ref={formRef}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Ajout manuel</h2>
                  <p className="text-xs text-gray-400">Ajoutez une facture à la fois</p>
                </div>
              </div>

              {/* Progress indicator */}
              {(() => {
                const fieldsCompleted = [formData.name, formData.phone, formData.amount, formData.dueDate].filter(Boolean).length;
                const progressPercent = (fieldsCompleted / 4) * 100;
                return (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Progression</span>
                      <span className="text-xs text-cyan-400 font-medium">{fieldsCompleted}/4 champs</span>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })()}

              <form onSubmit={handleAddInvoice} className="space-y-4">
                <div>
                  <label htmlFor="client-name" className="block text-sm text-gray-300 mb-1">
                    Nom du client
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    placeholder="Ex : Société Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="client-phone" className="block text-sm text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    id="client-phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="invoice-amount" className="block text-sm text-gray-300 mb-1">
                      Montant €
                    </label>
                    <input
                      id="invoice-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="1 500"
                      value={formData.amount}
                      onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="invoice-due-date" className="block text-sm text-gray-300 mb-1">
                      Échéance
                    </label>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => document.getElementById('invoice-due-date')?.showPicker?.()}
                    >
                      <input
                        id="invoice-due-date"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {(() => {
                  const isFormValid = formData.name && formData.phone && formData.amount && formData.dueDate;
                  return (
                    <motion.button
                      type="submit"
                      disabled={!isFormValid}
                      animate={isFormValid ? { scale: [1, 1.02, 1] } : {}}
                      transition={isFormValid ? { duration: 2, repeat: Infinity } : {}}
                      className={`
                        w-full py-3 rounded-xl font-semibold text-white transition-all
                        ${isFormValid
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                          : 'bg-gray-700 cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter à ma liste de relance ✨
                      </span>
                    </motion.button>
                  );
                })()}
              </form>
            </motion.div>
          </motion.div>

          {/* Import CSV */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 h-full flex flex-col hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Import CSV</h2>
                  <p className="text-xs text-gray-400">Importez plusieurs factures d&apos;un coup</p>
                </div>
              </div>

              {/* Zone Drag & Drop avec bordure animée */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Zone de dépôt de fichier CSV"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                className={`
                  flex-1 min-h-[180px] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all relative
                  ${isDragging
                    ? 'bg-violet-500/20 shadow-[0_0_40px_rgba(124,58,237,0.4)] border-2 border-violet-400'
                    : uploadState === 'success'
                      ? 'border-2 border-green-500/50 bg-green-500/5'
                      : uploadState === 'error'
                        ? 'border-2 border-red-500/50 bg-red-500/5'
                        : 'animated-border-dashed hover:bg-violet-500/5'
                  }
                `}
              >
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  aria-hidden="true"
                />

                {uploadState === 'uploading' ? (
                  <>
                    <motion.div
                      className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-sm text-gray-300">{uploadMessage}</p>
                  </>
                ) : uploadState === 'success' ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <p className="text-sm text-green-400 font-semibold">{uploadMessage}</p>
                  </>
                ) : uploadState === 'error' ? (
                  <>
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="text-sm text-red-400 text-center px-4">{uploadMessage}</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <FileText className="w-7 h-7 text-violet-400" />
                    </motion.div>
                    <div className="text-center relative z-10">
                      <p className="text-sm text-gray-300">Plusieurs factures ?</p>
                      <p className="text-sm text-violet-400 font-semibold">Glissez votre fichier ici</p>
                      <p className="text-xs text-gray-500 mt-1">.csv, .xlsx, .xls</p>
                    </div>
                  </>
                )}
              </div>

              {/* Panneau aide export */}
              <ExportHelpPanel isOpen={isHelpOpen} onToggle={() => setIsHelpOpen((o) => !o)} />
            </div>
          </motion.div>
        </div>

        {/* Capture lead différée */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <DeferredLeadCapture variant="default" />
        </motion.div>

        {/* Liste des factures */}
        <AnimatePresence>
          {invoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-violet-400" />
                Factures prêtes pour l&apos;IA
              </h3>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {invoices.map((inv, i) => (
                    <InvoiceCard
                      key={inv.id}
                      invoice={inv}
                      onDelete={handleDeleteInvoice}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Final */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleLaunch}
            disabled={!canLaunch}
            className={`
              inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all
              ${canLaunch
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] animate-pulse'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Rocket className="w-5 h-5" />
            Lancer les appels IA maintenant 🚀
          </button>
          {!canLaunch && (
            <p className="text-gray-500 text-sm mt-3">Ajoutez au moins une facture pour continuer</p>
          )}
        </motion.div>
      </div>

      {/* Bouton flottant expert */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={() => setIsExpertModalOpen(true)}
        className={`
          fixed z-50 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all
          ${isMobile
            ? 'bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 text-sm'
            : 'bottom-6 right-6 px-6 py-3'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Faire l'import avec un expert"
      >
        <Headphones className="w-5 h-5" />
        <span className={isMobile ? 'text-sm' : ''}>Faire l&apos;import avec un expert (15 min)</span>
      </motion.button>

      {/* Modal expert */}
      <ExpertModal isOpen={isExpertModalOpen} onClose={() => setIsExpertModalOpen(false)} />
    </div>
  );
}
