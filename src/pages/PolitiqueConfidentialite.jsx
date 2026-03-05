import LegalPage from '../components/LegalPage';

const sections = [
  {
    id: 'article-1',
    number: 'Article 1',
    title: 'Objet, périmètre, responsable de traitement, contact',
    content: `1.1. La présente politique décrit les modalités de collecte, d’utilisation, de conservation, de transmission et de sécurisation des données à caractère personnel traitées dans le cadre du Site et de la Plateforme Booster-Pay, conçue comme un orchestrateur de flux d’encaissement et de gestion du poste client. 1.2. Responsable de traitement : SNS MARKETING, SAS, siège 60 rue François Ier, 75008 Paris, France, SIREN 927 971 960. 1.3. Contact (email uniquement) : contact@booster-pay.com (ou, si publié, privacy@booster-pay.com). Aucune gestion téléphonique n’est assurée.`,
  },
  {
    id: 'article-2',
    number: 'Article 2',
    title: 'Principes RGPD et gouvernance',
    content: `2.1. SNS MARKETING applique les principes de licéité, loyauté, transparence, minimisation, exactitude, limitation des finalités, limitation de conservation, intégrité, confidentialité et responsabilité (accountability). 2.2. Mesures de conformité proportionnées : registre de traitement, gestion des habilitations, politiques internes, documentation de sécurité. Approche « security &amp; privacy by design » : limitation des données, segmentation, journalisation, et protections adaptées au risque.`,
  },
  {
    id: 'article-3',
    number: 'Article 3',
    title: 'Catégories de données traitées',
    content: `3.1. Données d’identification et de compte (utilisateurs professionnels) : nom, prénom, email professionnel, rôle/fonction, identifiants, habilitations, historiques d’accès et d’actions, paramètres de sécurité. 3.2. Données contractuelles et administratives (Client) : raison sociale, coordonnées, informations de facturation, historique de souscription, échanges support, éléments KYB/KYC éventuellement requis. 3.3. Données relatives aux flux d’encaissement : références de dossier, montants, échéances, statuts, événements, identifiants techniques de transaction ; selon le paramétrage du Client, des données de contact minimales peuvent transiter lorsque nécessaires à l’exécution du scénario. 3.4. Métadonnées et journaux techniques (SOC/SIEM) : logs d’authentification, adresses IP, user-agent, horodatages, identifiants de session, traces d’API, webhooks, erreurs, latences, événements d’intégrité, métriques, alertes, corrélations d’événements, indicateurs de performance. Ces éléments peuvent être corrélés au sein d’un dispositif SOC/SIEM afin de détecter en temps réel des anomalies et comportements atypiques. 3.5. Données d’orchestration communicationnelle : selon configuration, des éléments transactionnels peuvent être traités. La Plateforme peut mettre en œuvre des moteurs d’orchestration communicationnelle et des algorithmes de traitement phonétique et sémantique, appliqués à des signaux opérationnels et techniques, sans divulguer les détails d’implémentation. 3.6. Données de navigation (Site) : cookies/traceurs, pages consultées, paramètres de session, selon les préférences exprimées.`,
  },
  {
    id: 'article-4',
    number: 'Article 4',
    title: 'Finalités des traitements',
    content: `4.1. Fourniture du service SaaS. 4.2. Pilotage du poste client et visibilité trésorerie. 4.3. Sécurité, intégrité, prévention de fraude et abus. 4.4. Interopérabilité avec Partenaires Tiers. 4.5. Obligations légales et défense.`,
  },
  {
    id: 'article-5',
    number: 'Article 5',
    title: 'Bases légales (article 6 RGPD)',
    content: `5.1. Exécution du contrat. 5.2. Intérêt légitime. 5.3. Obligation légale. 5.4. Consentement lorsque requis.`,
  },
  {
    id: 'article-6',
    number: 'Article 6',
    title: 'Répartition des rôles (Responsable / Sous-traitant)',
    content: `6.1. Données « compte Client » : SNS MARKETING agit en qualité de responsable de traitement. 6.2. Données « poste client » du Client : lorsque le Client transmet des données relatives à ses propres clients/débiteurs, SNS MARKETING agit en principe en qualité de sous-traitant ; le Client demeure responsable de traitement et garantit l’information des personnes et la base légale des traitements. 6.3. Un DPA peut encadrer les obligations réciproques.`,
  },
  {
    id: 'article-7',
    number: 'Article 7',
    title: 'Destinataires, sous-traitants et Partenaires Tiers',
    content: `7.1. Accès interne strictement limité aux personnes habilitées, journalisé et contrôlé. 7.2. Sous-traitants techniques : hébergement, infogérance, supervision, messagerie transactionnelle, outils de ticketing. 7.3. Partenaires de paiement/anti-fraude/BNPL : 7.3.1. Certaines données et métadonnées strictement nécessaires peuvent être transmises aux Partenaires Tiers. 7.3.2. Ces transmissions sont réalisées via des canaux chiffrés (TLS, jetons, clés) avec journalisation des échanges. 7.3.3. Les Partenaires Tiers demeurent autonomes dans leurs décisions.`,
  },
  {
    id: 'article-8',
    number: 'Article 8',
    title: 'Sécurité avancée, SOC/SIEM, gestion des incidents et violations',
    content: `8.1. Mesures de sécurité : contrôle d’accès, segmentation, chiffrement en transit, gestion des secrets, sauvegardes, supervision. 8.2. SOC/SIEM : collecte centralisée de logs, corrélation d’événements, détection d’anomalies en temps réel, alerting. 8.3. Gestion des incidents : qualification, confinement, remédiation, restauration, retour d’expérience, mesures conservatoires. 8.4. Violations de données : évaluation du risque et, le cas échéant, notification à l’autorité de contrôle et/ou information des personnes concernées conformément au RGPD. 8.5. Les détails techniques ne sont pas intégralement divulgués afin de préserver la robustesse de sécurité.`,
  },
  {
    id: 'article-9',
    number: 'Article 9',
    title: 'Vigilance orientée risque, LCB-FT et sanctions',
    content: `9.1. Dans une logique de prévention des abus et de protection des flux, SNS MARKETING applique une vigilance orientée risque, cohérente avec les attentes de partenaires soumis à des régimes LCB-FT, de sanctions, et de lutte contre la fraude. 9.2. Mesures possibles : collecte d’éléments KYB, contrôles de cohérence, suspension/limitation en cas de risque élevé. 9.3. Cette vigilance ne constitue pas un service d’investigation financière et ne se substitue pas aux obligations propres des entités réglementées.`,
  },
  {
    id: 'article-10',
    number: 'Article 10',
    title: 'Durées de conservation',
    content: `10.1. Données de compte : durée de la relation contractuelle + archivage probatoire limité. 10.2. Données de facturation : durées légales applicables. 10.3. Logs de sécurité : conservation proportionnée, avec rotation/purge. 10.4. Données de flux : selon instructions du Client et nécessité d’exécution.`,
  },
  {
    id: 'article-11',
    number: 'Article 11',
    title: 'Droits des personnes',
    content: `11.1. Droits : accès, rectification, effacement, limitation, opposition, portabilité, retrait du consentement. 11.2. Exercice : demande par email ; preuve d’identité en cas de doute raisonnable. 11.3. Données traitées pour le compte du Client : demandes à adresser au Client.`,
  },
  {
    id: 'article-12',
    number: 'Article 12',
    title: 'Transferts hors EEE',
    content: `12.1. Certains sous-traitants peuvent être situés hors EEE. 12.2. Garanties : clauses contractuelles types, mesures complémentaires.`,
  },
  {
    id: 'article-13',
    number: 'Article 13',
    title: 'Cookies et traceurs',
    content: `13.1. Catégories : nécessaires, performance, audience. 13.2. Consentement : recueil et retrait via module dédié lorsque requis.`,
  },
  {
    id: 'article-14',
    number: 'Article 14',
    title: 'Audit, contrôle, demandes externes',
    content: `14.1. Audits internes. 14.2. Audits documentaires Client sur demande. 14.3. Coopération avec autorités lorsque requis.`,
  },
  {
    id: 'article-15',
    number: 'Article 15',
    title: 'Mise à jour',
    content: `La Politique peut évoluer ; la version applicable est celle publiée sur le Site, assortie de sa date de mise à jour.`,
  },
];

const PolitiqueConfidentialite = () => (
  <LegalPage
    title="Politique de Confidentialité et Protection des Données Personnelles"
    lastUpdated="5 mars 2026"
    sections={sections}
    metaDescription="Politique de confidentialité et protection des données personnelles de Booster-Pay — RGPD, cookies, droits des personnes."
  />
);

export default PolitiqueConfidentialite;
