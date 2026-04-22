import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hqtdmeuqunrtrfenjpwy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdGRtZXVxdW5ydHJmZW5qcHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTA5ODgsImV4cCI6MjA5MjE2Njk4OH0.5wf2kTqd0PnOvfvXE5UQjsxXfBYpT_3PAtzCVFXZQZw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ LEADS AVIS ============

export async function insertLeadAvis({ email, telephone, note, feedback, consentement, partenaireId }) {
  const { data, error } = await supabase
    .from('leads_avis')
    .insert({
      email: email || null,
      telephone: telephone || null,
      note,
      feedback: feedback || null,
      consentement,
      consentement_date: consentement ? new Date().toISOString() : null,
      participe_tirage: consentement,
      tirage_mois: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 7),
      partenaire_id: partenaireId || null,
      source: 'page_avis',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeadsAvis({ limit = 50, offset = 0, statut, partenaireId } = {}) {
  let query = supabase
    .from('leads_avis')
    .select('*, partenaires(nom, secteur)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (statut) query = query.eq('statut', statut);
  if (partenaireId) query = query.eq('partenaire_id', partenaireId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateLeadAvis(id, updates) {
  const { data, error } = await supabase
    .from('leads_avis')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ LEADS IA VOCALE ============

export async function insertLeadIAVocale(lead) {
  const { data, error } = await supabase
    .from('leads_ia_vocale')
    .insert({
      telephone: lead.telephone || lead.phone,
      prenom: lead.prenom || lead.first_name,
      nom: lead.nom || lead.last_name,
      email: lead.email || null,
      adresse: lead.adresse || lead.address || null,
      ville: lead.ville || lead.city || null,
      code_postal: lead.code_postal || lead.zipcode || null,
      transcription: lead.transcription || null,
      enregistrement_url: lead.enregistrement_url || lead.recording_url || null,
      resume_ia: lead.resume_ia || null,
      campagne_id: lead.campagne_id || null,
      partenaire_id: lead.partenaire_id || null,
      statut: lead.statut || 'appele',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeadsIAVocale({ limit = 50, offset = 0, statut, campagneId } = {}) {
  let query = supabase
    .from('leads_ia_vocale')
    .select('*, partenaires(nom, secteur)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (statut) query = query.eq('statut', statut);
  if (campagneId) query = query.eq('campagne_id', campagneId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateLeadIAVocale(id, updates) {
  const { data, error } = await supabase
    .from('leads_ia_vocale')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ KPIs ============

export async function getKPIAvis() {
  const { data, error } = await supabase.from('v_kpi_avis').select('*').single();
  if (error) throw error;
  return data;
}

export async function getKPIIAVocale() {
  const { data, error } = await supabase.from('v_kpi_ia_vocale').select('*').single();
  if (error) throw error;
  return data;
}

// ============ PARTENAIRES ============

export async function getPartenaire(id) {
  const { data, error } = await supabase
    .from('partenaires')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getPartenaires() {
  const { data, error } = await supabase
    .from('partenaires')
    .select('*')
    .order('nom');

  if (error) throw error;
  return data;
}

// ============ REALTIME ============

export function subscribeLeadsAvis(callback) {
  return supabase
    .channel('leads_avis_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads_avis' }, callback)
    .subscribe();
}

export function subscribeLeadsIAVocale(callback) {
  return supabase
    .channel('leads_ia_vocale_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads_ia_vocale' }, callback)
    .subscribe();
}
