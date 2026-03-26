import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Upload, X, FileText, CheckCircle,
  AlertCircle, Info, Clock
} from 'lucide-react';
import DebtorLayout, { useIsMobile } from './components/DebtorLayout';

const ease = [0.22, 1, 0.36, 1];

const MOTIFS = [
  'Montant incorrect',
  'Service non conforme',
  'Facture déjà réglée',
  'Erreur de facturation',
  'Autre',
];

const MAX_FILES = 3;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXT = '.pdf, .jpg, .jpeg, .png';
const MAX_CHARS = 500;

function MiniConfetti() {
  const colors = ['#22C55E', '#8B5CF6', '#3B82F6', '#F59E0B', '#06B6D4'];
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 240,
    y: -(Math.random() * 220 + 80),
    rotate: Math.random() * 360,
    color: colors[i % colors.length],
    size: Math.random() * 7 + 3,
    delay: Math.random() * 0.35,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: '50vw', y: '40vh', scale: 0, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], x: `calc(50vw + ${p.x}px)`, y: `calc(40vh + ${p.y}px)`, scale: [0, 1.2, 0.5], rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 ${p.size}px ${p.color}` }}
        />
      ))}
    </div>
  );
}

function FileItem({ file, onRemove }) {
  const isImg = file.type.startsWith('image/');
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.04] rounded-xl border border-white/[0.08]"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
        {isImg ? (
          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileText className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
      </div>
      <button
        onClick={() => onRemove(file)}
        className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
        aria-label={`Retirer ${file.name}`}
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  );
}

function SuccessState({ id }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const recNum = `REC-${id.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase().padEnd(6, '0')}`;

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const infoItems = [
    { icon: Clock, color: 'text-cyan-400', text: 'Délai de traitement : 5 à 10 jours ouvrés' },
    { icon: Info, color: 'text-blue-400', text: "Sans retour de justificatif, l'impayé sera considéré comme dû." },
  ];

  return (
    <>
      {showConfetti && <MiniConfetti />}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center py-10 gap-5"
      >
        {/* Checkmark avec étoiles orbitantes */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative w-24 h-24"
        >
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/20"
            animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/10"
            animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
          />
          {/* Orbiting stars */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-green-400"
              style={{ top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
              animate={{
                x: Math.cos((i * 90 * Math.PI) / 180) * 52,
                y: Math.sin((i * 90 * Math.PI) / 180) * 52,
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
          {/* Circle */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
            <CheckCircle className="w-11 h-11 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">Réclamation reçue</h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
            Notre équipe l&apos;examinera sous 5 jours ouvrés.
          </p>
          <p className="text-gray-500 text-sm mt-1.5">Vous recevrez une réponse par email.</p>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-xs font-mono text-gray-600 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5 inline-block"
          >
            {recNum}
          </motion.p>
        </div>

        {/* Info encart */}
        <div className="w-full bg-white/[0.02] border-l-2 border-cyan-500/30 border border-white/[0.06] rounded-xl p-4 text-left space-y-3">
          {infoItems.map(({ icon: Icon, color, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12, ease }}
              className="flex items-start gap-2.5"
            >
              <Icon className={`w-4 h-4 ${color} shrink-0 mt-0.5`} />
              <p className="text-xs text-gray-400">{text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

export default function ContestationPage() {
  const [params] = useSearchParams();
  const id = params.get('id') || 'F-DEMO-001';
  const ref = params.get('ref') || 'FAC-2024-1234';
  const nom = params.get('nom') || '';
  const entreprise = params.get('entreprise') || '';
  const montant = params.get('montant') || '';
  const isMobile = useIsMobile();

  const [motif, setMotif] = useState('');
  const [precisions, setPrecisions] = useState('');
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  function addFiles(newFiles) {
    setFileError('');
    const valid = [];
    for (const f of newFiles) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setFileError('Format non accepté. Utilisez PDF, JPG ou PNG.');
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setFileError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
        continue;
      }
      valid.push(f);
    }
    setFiles(prev => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_FILES) {
        setFileError(`Maximum ${MAX_FILES} fichiers.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }

  function removeFile(file) {
    setFiles(prev => prev.filter(f => f !== file));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!motif) return;
    setLoading(true);
    setError('');

    try {
      let filesPayload = [];
      if (files.length > 0) {
        filesPayload = await Promise.all(files.map(f => fileToBase64(f)));
      }

      const payload = {
        id,
        ref,
        motif,
        precisions,
        email,
        date: new Date().toISOString(),
        files: filesPayload,
      };

      const WEBAPP_URL = import.meta.env.VITE_CONTESTATION_WEBHOOK_URL
        || 'https://script.google.com/macros/s/DEPLOY_ID_ICI/exec';

      const res = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === 'ok') {
        setSubmitted(true);
      } else {
        setError(data.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Contestation submit error:', err);
      setError("Impossible d'envoyer votre réclamation. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DebtorLayout>
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            {!isMobile && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-violet-500/30 blur-lg"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <motion.div
              className="relative w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
              animate={isMobile ? {} : { y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="w-5 h-5 text-violet-400" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Espace réclamation</h1>
            <p className="text-sm text-gray-500">{entreprise ? `Réclamation concernant une facture de ${entreprise}` : 'Votre demande sera traitée avec attention.'}</p>
          </div>
        </div>

        {/* Badges dossier/ref */}
        <div className="flex flex-wrap gap-2 mt-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 font-mono"
          >
            Dossier : {id}
          </motion.span>
          {ref && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400"
            >
              Réf. facture : {ref}
            </motion.span>
          )}
          {entreprise && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400"
            >
              Émise par : {entreprise}
            </motion.span>
          )}
          {nom && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400"
            >
              Débiteur : {nom}
            </motion.span>
          )}
          {montant && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold"
            >
              Montant : {montant} €
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 overflow-hidden"
      >
        {/* Reflet lumineux */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-2xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessState key="success" id={id} />
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Motif */}
              <div>
                <label htmlFor="motif" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Motif de la contestation <span className="text-red-400">*</span>
                </label>
                <select
                  id="motif"
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm appearance-none focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                >
                  <option value="" disabled className="bg-[#0f172a]">Sélectionner un motif...</option>
                  {MOTIFS.map(m => (
                    <option key={m} value={m} className="bg-[#0f172a]">{m}</option>
                  ))}
                </select>
              </div>

              {/* Précisions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="precisions" className="text-sm font-medium text-gray-300">
                    Précisions <span className="text-gray-600 font-normal">(optionnel)</span>
                  </label>
                  <span className={`text-xs ${precisions.length > MAX_CHARS * 0.9 ? 'text-orange-400' : 'text-gray-600'}`}>
                    {precisions.length}/{MAX_CHARS}
                  </span>
                </div>
                <textarea
                  id="precisions"
                  value={precisions}
                  onChange={e => setPrecisions(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Décrivez votre situation..."
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 resize-none focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* Upload zone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Justificatifs <span className="text-gray-600 font-normal">(optionnel — max {MAX_FILES} × {MAX_SIZE_MB} Mo)</span>
                </label>

                {files.length < MAX_FILES && (
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    animate={dragOver ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`w-full border-2 border-dashed rounded-xl py-8 px-4 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
                      dragOver
                        ? 'border-violet-500/70 bg-violet-500/[0.08]'
                        : 'border-white/[0.12] hover:border-violet-500/40 hover:bg-violet-500/[0.03] bg-white/[0.02]'
                    }`}
                    aria-label="Zone de dépôt de fichiers"
                  >
                    <motion.div
                      className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center"
                      animate={dragOver ? { scale: 1.15, rotate: 5 } : { y: [0, -4, 0] }}
                      transition={dragOver ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Upload className={`w-5 h-5 ${dragOver ? 'text-violet-400' : 'text-gray-400'}`} />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300">
                        {isMobile ? 'Appuyer pour ajouter' : (dragOver ? 'Relâchez pour déposer' : 'Déposer vos fichiers ici')}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{ACCEPTED_EXT}</p>
                    </div>
                  </motion.button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXT}
                  multiple
                  onChange={e => addFiles(Array.from(e.target.files))}
                  className="hidden"
                  aria-label="Sélectionner des fichiers"
                />

                {fileError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-red-400 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fileError}
                  </motion.p>
                )}

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <AnimatePresence>
                      {files.map(f => (
                        <FileItem key={f.name + f.size} file={f} onRemove={removeFile} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Votre email <span className="text-gray-600 font-normal">(pour la réponse)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* Infos box */}
              <div className="bg-white/[0.02] border-l-2 border-cyan-500/30 border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">Délai de traitement : 5 à 10 jours ouvrés</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    Sans retour de justificatif, l&apos;impayé sera considéré comme dû.
                  </p>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Submit */}
              <div className="relative">
                {!isMobile && motif && (
                  <motion.div
                    className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-400 opacity-40 blur-lg"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.button
                  type="submit"
                  disabled={!motif || loading}
                  whileHover={isMobile || !motif || loading ? {} : { scale: 1.02 }}
                  whileTap={!motif || loading ? {} : { scale: 0.98 }}
                  className={`relative overflow-hidden w-full py-4 rounded-xl font-bold text-base transition-all ${
                    motif && !loading
                      ? 'bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 text-white'
                      : motif && loading
                      ? 'bg-gradient-to-r from-violet-600/70 via-purple-500/70 to-violet-600/70 text-white/80 cursor-wait'
                      : 'bg-white/[0.05] text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Envoyer ma réclamation"
                >
                  {motif && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ['-150%', '150%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {files.length > 0 ? 'Envoi des fichiers...' : 'Envoi en cours...'}
                      </>
                    ) : (
                      'Envoyer ma réclamation'
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back to invoice */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center text-xs text-gray-600 mt-6"
      >
        Souhaitez-vous régler cet impayé ?{' '}
        <a
          href={`/facture?id=${id}${ref ? `&ref=${ref}` : ''}${nom ? `&nom=${encodeURIComponent(nom)}` : ''}${entreprise ? `&entreprise=${encodeURIComponent(entreprise)}` : ''}${montant ? `&montant=${encodeURIComponent(montant)}` : ''}`}
          className="text-gray-400 underline hover:text-white transition-colors"
        >
          Accéder au paiement
        </a>
      </motion.p>
    </DebtorLayout>
  );
}
