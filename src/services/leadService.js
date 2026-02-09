/**
 * Service pour envoyer les leads vers Google Sheets via Google Apps Script
 */

const GOOGLE_SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL || '';

/**
 * Envoie un lead vers Google Sheets
 * @param {Object} leadData - Données du lead
 * @returns {Promise<Object>} Réponse
 */
export const submitLead = async (leadData) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const urlParams = new URLSearchParams(window.location.search);

  const payload = {
    email: leadData.email,
    telephone: leadData.phone || leadData.telephone,
    source: leadData.source || 'website',
    estimation: leadData.estimation || 0,
    factures_mois: leadData.factures_mois || 0,
    montant_moyen: leadData.montant_moyen || 0,
    appareil: isMobile ? 'mobile' : 'desktop',
    utm_source: urlParams.get('utm_source') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Envoi du lead vers Google Sheets:', payload);

  if (!GOOGLE_SHEET_API_URL) {
    console.warn('⚠️ VITE_GOOGLE_SHEET_API_URL non configurée — lead non envoyé');
    return { success: true, warning: 'URL non configurée' };
  }

  await fetch(GOOGLE_SHEET_API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  console.log('✅ Lead envoyé avec succès');
  return { success: true };
};

/**
 * Envoie un lead avec les données du simulateur
 * @param {Object} simulatorData - Données du simulateur
 * @returns {Promise<Object>}
 */
export const submitSimulatorLead = async (simulatorData) => {
  return submitLead({
    ...simulatorData,
    source: 'simulateur'
  });
};
