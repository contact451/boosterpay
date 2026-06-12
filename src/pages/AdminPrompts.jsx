// ─────────────────────────────────────────────────────────────────
//  AdminPrompts — Vue temps réel BP-PROMPTS dans le CRM BoosterPay
//
//  URL : /admin/prompts?token=BP-ADM-XXXX
//
//  Affiche tous les commerçants avec leur numero_virtuel + le prompt
//  IA local (longueur, qa_pairs, précisions). Permet de fetcher live
//  depuis le webhook n8n CallPilot pour comparer.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Database, RefreshCw, Eye, X, Phone, AlertCircle, Check,
  Search, MessageSquare, Sparkles,
} from 'lucide-react';

// Apps Script du CRM interne BoosterPay (gère leads, impayés, essais…)
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL || '';

export default function AdminPrompts() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [search, setSearch] = useState('');
  const [openRow, setOpenRow] = useState(null); // { phone, ... } pour le modal preview

  const load = useCallback(async () => {
    if (!token) {
      setError('Token manquant dans l\'URL. Ajoute ?token=… à l\'URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'adminListPrompts', token }),
      });
      const json = await res.json();
      if (json && json.success) {
        setRows(json.rows || []);
        setGeneratedAt(json.generated_at || '');
      } else {
        setError(
          json && json.error === 'unauthorized'
            ? 'Token invalide ou Apps Script pas encore redéployé.'
            : (json && json.error) || 'Erreur inconnue.'
        );
      }
    } catch (e) {
      setError(e.message || 'Réseau indisponible.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    if (!token) return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load, token]);

  const filtered = search.trim()
    ? rows.filter((r) => {
        const q = search.trim().toLowerCase();
        return (
          (r.phone || '').toLowerCase().includes(q) ||
          (r.nom_commerce || '').toLowerCase().includes(q) ||
          (r.commercant_id || '').toLowerCase().includes(q) ||
          (r.metier || '').toLowerCase().includes(q) ||
          (r.ville || '').toLowerCase().includes(q)
        );
      })
    : rows;

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* ════ Header ════ */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-8 py-4"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 6px 14px rgba(16,185,129,0.30)',
            }}
          >
            <Database className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-bold text-gray-900 leading-tight">
              BP-PROMPTS · admin
            </h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {loading
                ? 'Chargement…'
                : `${rows.length} entrée${rows.length > 1 ? 's' : ''} · maj ${generatedAt ? new Date(generatedAt).toLocaleTimeString('fr-FR') : '—'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Rafraîchir (auto toutes les 30s)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2.4} />
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* ════ Recherche ════ */}
        <div className="mb-5 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2.2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, nom, ID, métier, ville…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* ════ Erreur ════ */}
        {error && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3 mb-5"
            style={{
              background: '#FEF2F2',
              border: '1.5px solid rgba(220,38,38,0.25)',
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
            <div className="flex-1 text-[13px] text-red-900">{error}</div>
          </div>
        )}

        {/* ════ Tableau ════ */}
        {loading && rows.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
            {/* Header colonnes — desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
              <div className="col-span-3">Numéro · source</div>
              <div className="col-span-3">Commerçant</div>
              <div className="col-span-2">Métier · ville</div>
              <div className="col-span-2">Prompt local</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {filtered.length === 0 && !loading ? (
              <div className="py-12 text-center text-[14px] text-gray-500">
                Aucune entrée pour cette recherche.
              </div>
            ) : (
              filtered.map((r, i) => (
                <PromptRow
                  key={r.phone + '_' + i}
                  row={r}
                  isLast={i === filtered.length - 1}
                  onOpen={() => setOpenRow(r)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ════ Modal preview ════ */}
      {openRow && (
        <PreviewModal
          row={openRow}
          token={token}
          onClose={() => setOpenRow(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PromptRow — une ligne du tableau
// ─────────────────────────────────────────────────────────────────
function PromptRow({ row, isLast, onOpen }) {
  const isBoosterPay = row.metier === 'boosterpay' || row.phone === 'default';
  return (
    <div
      className="grid md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
      style={{ borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}
    >
      {/* Numéro */}
      <div className="md:col-span-3 flex items-center gap-2 min-w-0">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: isBoosterPay ? '#ECFDF5' : '#F0F9FF',
          }}
        >
          <Phone
            className={isBoosterPay ? 'w-3.5 h-3.5 text-emerald-700' : 'w-3.5 h-3.5 text-sky-700'}
            strokeWidth={2.4}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-gray-900 tabular-nums truncate">
            {row.phone_normalized}
          </p>
          {row.phone !== row.phone_normalized && (
            <p className="text-[10.5px] text-gray-400 truncate">{row.phone}</p>
          )}
        </div>
      </div>

      {/* Commerçant */}
      <div className="md:col-span-3 flex items-center min-w-0">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 truncate">
            {row.nom_commerce || '—'}
          </p>
          {row.commercant_id && (
            <p className="text-[10.5px] text-gray-400 truncate">{row.commercant_id}</p>
          )}
        </div>
      </div>

      {/* Métier + ville */}
      <div className="md:col-span-2 flex items-center min-w-0">
        <div className="min-w-0">
          <p className="text-[12.5px] text-gray-700 truncate">{row.metier || '—'}</p>
          {row.ville && <p className="text-[10.5px] text-gray-400 truncate">{row.ville}</p>}
        </div>
      </div>

      {/* Stats prompt local */}
      <div className="md:col-span-2 flex items-center gap-2 min-w-0 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold tabular-nums"
          style={{
            background: row.prompt_local_len > 0 ? '#ECFDF5' : '#FEF3C7',
            color: row.prompt_local_len > 0 ? '#047857' : '#92400E',
          }}
          title="Longueur du prompt local généré"
        >
          {row.prompt_local_len.toLocaleString('fr-FR')} chars
        </span>
        {row.has_qa_pairs > 0 && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold"
            style={{ background: '#EFF6FF', color: '#1D4ED8' }}
            title="Q/R personnalisées"
          >
            <MessageSquare className="w-2.5 h-2.5" strokeWidth={3} />
            {row.has_qa_pairs}
          </span>
        )}
        {row.has_precisions && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold"
            style={{ background: '#FDF4FF', color: '#A21CAF' }}
            title="Précisions générales saisies"
          >
            <Sparkles className="w-2.5 h-2.5" strokeWidth={3} />
            préc.
          </span>
        )}
      </div>

      {/* Action */}
      <div className="md:col-span-2 flex md:justify-end items-center">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-white border border-emerald-200 text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <Eye className="w-3 h-3" strokeWidth={2.6} />
          Voir
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PreviewModal — affiche le prompt distant (webhook) pour comparer
// ─────────────────────────────────────────────────────────────────
function PreviewModal({ row, token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'adminFetchWebhookPrompt',
            token,
            phone: row.phone,
          }),
        });
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        if (!json.success && json.error) setError(json.error);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Réseau indisponible.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [row.phone, token]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Extrait le prompt distant si présent dans la réponse webhook
  const remotePrompt =
    (data && data.parsed && (data.parsed.prompt || data.parsed.system || data.parsed.text)) ||
    (data && typeof data.raw === 'string' && data.raw.length > 0 ? data.raw : '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col"
        style={{ maxHeight: '85svh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
          <Phone className="w-5 h-5 text-emerald-600" strokeWidth={2.4} />
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400">
              {row.nom_commerce || 'BoosterPay'}
            </p>
            <h3 className="text-[18px] font-bold text-gray-900 tabular-nums truncate">
              {row.phone_normalized}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-600" strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="py-12 text-center text-[14px] text-gray-500">
              <RefreshCw className="w-6 h-6 text-emerald-600 mx-auto mb-3 animate-spin" strokeWidth={2.4} />
              Récupération depuis le webhook n8n…
            </div>
          ) : error ? (
            <div
              className="rounded-xl p-4 text-[13px] text-red-900"
              style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.20)' }}
            >
              <AlertCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" strokeWidth={2.4} />
              {error}
            </div>
          ) : (
            <>
              {/* Métadonnées */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Stat label="HTTP" value={data?.status || '—'} />
                <Stat label="Distant chars" value={(remotePrompt || '').length.toLocaleString('fr-FR')} />
                <Stat label="Local chars" value={row.prompt_local_len.toLocaleString('fr-FR')} />
              </div>

              {/* Comparaison local vs distant */}
              <div
                className="rounded-xl p-3 mb-3 flex items-center gap-2"
                style={{
                  background:
                    remotePrompt && remotePrompt.length > 0
                      ? '#ECFDF5'
                      : '#FEF3C7',
                  border:
                    remotePrompt && remotePrompt.length > 0
                      ? '1px solid rgba(16,185,129,0.30)'
                      : '1px solid rgba(245,158,11,0.30)',
                }}
              >
                {remotePrompt && remotePrompt.length > 0 ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" strokeWidth={3} />
                    <span className="text-[12.5px] font-semibold text-emerald-900">
                      Prompt présent côté n8n CallPilot.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-700" strokeWidth={2.4} />
                    <span className="text-[12.5px] font-semibold text-amber-900">
                      Le webhook renvoie une réponse vide. Possible : le mode fetch n'expose pas le prompt, ou aucun prompt n'est stocké pour ce numéro.
                    </span>
                  </>
                )}
              </div>

              {/* Prompt distant (si présent) */}
              {remotePrompt && remotePrompt.length > 0 && (
                <details open className="mb-3">
                  <summary className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500 cursor-pointer mb-2">
                    Prompt distant (webhook)
                  </summary>
                  <pre
                    className="rounded-xl p-3 text-[11.5px] text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', maxHeight: '40vh', overflowY: 'auto' }}
                  >
                    {remotePrompt}
                  </pre>
                </details>
              )}

              {/* Raw response */}
              <details>
                <summary className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 cursor-pointer">
                  Réponse brute du webhook
                </summary>
                <pre
                  className="mt-2 rounded-xl p-3 text-[11px] text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', maxHeight: '30vh', overflowY: 'auto' }}
                >
                  {(data && data.raw) || '(vide)'}
                </pre>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl px-3 py-2 text-center"
      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
    >
      <p className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-gray-400">{label}</p>
      <p className="text-[15px] font-bold text-gray-900 tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
