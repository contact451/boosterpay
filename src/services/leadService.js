/**
 * Service pour envoyer les leads vers Google Sheets via Google Apps Script
 */

const GOOGLE_SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL || '';
const B2B_SHEET_API_URL = import.meta.env.VITE_B2B_SHEET_API_URL || '';

/**
 * Envoie un lead vers Google Sheets
 * @param {Object} leadData - Données du lead
 * @returns {Promise<Object>} Réponse
 */
export const submitLead = async (leadData) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const urlParams = new URLSearchParams(window.location.search);

  const payload = {
    ref: urlParams.get('ref') || '',
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

  try {
    const response = await fetch(GOOGLE_SHEET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('✅ Lead envoyé avec succès:', result);

    // Notifier Sheet 1 (B2B) pour stopper la séquence SMS/Email — fire & forget
    if (B2B_SHEET_API_URL && payload.ref) {
      fetch(B2B_SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          ref: payload.ref,
          email: payload.email,
          action: 'converted',
          timestamp: payload.timestamp,
        }),
      }).catch(() => {});
    }

    return result;
  } catch (error) {
    // Fallback silencieux — la capture ne doit JAMAIS bloquer l'UX
    console.warn('⚠️ Erreur envoi lead (non bloquant):', error.message);
    return { success: true, warning: 'Envoi échoué silencieusement' };
  }
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

/**
 * Envoie les données de l'onboarding Step 2.
 * Le Apps Script RETROUVE le lead par email et le met à jour (statut → "Converti").
 */
export const submitOnboarding = async (payload) => {
  const GAS_URL = GOOGLE_SHEET_API_URL;

  if (!GAS_URL) {
    console.warn('⚠️ VITE_GOOGLE_SHEET_API_URL non configurée — onboarding non envoyé');
    return { success: false, error: 'URL backend non configurée' };
  }

  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('✅ Onboarding envoyé:', result);

      // Notifier Sheet 1 (B2B) pour stopper la séquence — fire & forget
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || '';
      if (B2B_SHEET_API_URL && ref) {
        fetch(B2B_SHEET_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            ref: ref,
            email: payload.email,
            action: 'converted',
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      }

      return result;

    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ submitOnboarding failed:', error);
        return { success: false, error: error.message };
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};
