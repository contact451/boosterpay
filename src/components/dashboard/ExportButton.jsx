import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { getEffectiveStatus, formatMontant, formatDate } from '../../services/dashboardService';

function exportCSV(dossiers, partnerName) {
  const headers = ['Client Débiteur', 'N° Facture', 'Montant', 'Date Ajout', 'Jours Retard', 'Statut', 'Nb Relances', 'Montant Récupéré', 'Dernier Statut Relance', 'Date Dernier Appel'];
  const rows = dossiers.map((d) => {
    const status = getEffectiveStatus(d);
    const lastRelance = d.relances?.[d.relances.length - 1];
    return [
      d.clientDebiteur,
      d.numeroFacture || '',
      d.montant,
      d.dateAjout,
      d.joursRetard,
      status,
      d.relances?.length || 0,
      d.paiement?.montantPaye || d.montantRecupere || 0,
      lastRelance?.statutRelance || '',
      lastRelance?.date || '',
    ];
  });

  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boosterpay-${partnerName}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(dossiers, partnerName) {
  const XLSX = await import('xlsx');
  const data = dossiers.map((d) => {
    const status = getEffectiveStatus(d);
    const lastRelance = d.relances?.[d.relances.length - 1];
    return {
      'Client Débiteur': d.clientDebiteur,
      'N° Facture': d.numeroFacture || '—',
      'Montant (€)': d.montant,
      'Date Ajout': d.dateAjout,
      'Jours Retard': d.joursRetard,
      'Statut': status,
      'Nb Relances': d.relances?.length || 0,
      'Montant Récupéré (€)': d.paiement?.montantPaye || d.montantRecupere || 0,
      'Dernier Statut': lastRelance?.statutRelance || '—',
      'Date Dernier Appel': lastRelance?.date ? formatDate(lastRelance.date) : '—',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dossiers');
  XLSX.writeFile(wb, `boosterpay-${partnerName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportPDF(dossiers, partnerName, kpis) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rows = dossiers.map((d) => {
    const status = getEffectiveStatus(d);
    return `<tr>
      <td>${d.clientDebiteur}</td>
      <td>${d.numeroFacture || '—'}</td>
      <td style="text-align:right">${d.montant?.toLocaleString('fr-FR')} €</td>
      <td>${formatDate(d.dateAjout)}</td>
      <td style="text-align:center">${d.joursRetard}j</td>
      <td>${status}</td>
      <td style="text-align:center">${d.relances?.length || 0}</td>
    </tr>`;
  }).join('');

  printWindow.document.write(`<!DOCTYPE html><html><head><title>Rapport BoosterPay - ${partnerName}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 900px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3B82F6; padding-bottom: 16px; margin-bottom: 24px; }
      .logo { font-size: 24px; font-weight: 800; } .logo span { color: #3B82F6; }
      .date { color: #666; font-size: 13px; }
      .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
      .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
      .kpi-value { font-size: 20px; font-weight: 700; color: #1e293b; }
      .kpi-label { font-size: 11px; color: #64748b; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #3B82F6; color: white; padding: 8px 6px; text-align: left; }
      td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      .footer { margin-top: 32px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    </style></head><body>
    <div class="header"><div class="logo">Booster<span>Pay</span></div><div><strong>${partnerName}</strong><br><span class="date">Rapport du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div></div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-value">${kpis.totalDossiers}</div><div class="kpi-label">Dossiers déposés</div></div>
      <div class="kpi"><div class="kpi-value">${kpis.montantTotal?.toLocaleString('fr-FR')} €</div><div class="kpi-label">Montant total</div></div>
      <div class="kpi"><div class="kpi-value">${kpis.montantRecupere?.toLocaleString('fr-FR')} €</div><div class="kpi-label">Montant récupéré</div></div>
      <div class="kpi"><div class="kpi-value">${Math.round(kpis.tauxRecup)}%</div><div class="kpi-label">Taux récupération</div></div>
      <div class="kpi"><div class="kpi-value">${kpis.dossiersActifs}</div><div class="kpi-label">Dossiers actifs</div></div>
      <div class="kpi"><div class="kpi-value">${kpis.appelsIA}</div><div class="kpi-label">Appels IA</div></div>
    </div>
    <table><thead><tr><th>Client Débiteur</th><th>N° Facture</th><th>Montant</th><th>Ajouté le</th><th>Retard</th><th>Statut</th><th>Relances</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Généré par BoosterPay — www.booster-pay.com</div>
    </body></html>`);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}

export default function ExportButton({ dossiers, partnerName, kpis }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Exporter</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
            <button
              onClick={() => { exportCSV(dossiers, partnerName); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              <FileText className="w-4 h-4 text-green-400" /> Exporter CSV
            </button>
            <button
              onClick={() => { exportExcel(dossiers, partnerName); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" /> Exporter Excel
            </button>
            <button
              onClick={() => { exportPDF(dossiers, partnerName, kpis); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
            >
              <Printer className="w-4 h-4 text-orange-400" /> Imprimer / PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
