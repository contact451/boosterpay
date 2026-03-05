import LegalPage from '../components/LegalPage';

const sections = [
  {
    id: 'preambule',
    number: 'Préambule',
    title: 'Préambule institutionnel',
    content: `Les présentes Conditions Générales de Vente (ci-après les « CGV ») régissent la fourniture, par SNS MARKETING (ci-après le « Prestataire »), d’un service logiciel accessible à distance (SaaS) commercialisé sous la dénomination « Booster-Pay » (ci-après la « Plateforme »), à destination exclusive de clients professionnels (B2B). La Plateforme est définie comme un orchestrateur de flux d’encaissement et de gestion du poste client, permettant au Client de configurer des parcours d’encaissement, d’agréger des événements et statuts, d’optimiser la visibilité de trésorerie, de structurer des opérations de facturation/relance transactionnelle, et d’intégrer techniquement des prestataires tiers intervenant, le cas échéant, dans l’exécution de paiements, la prévention de la fraude, la vérification d’identité, et/ou la proposition de facilités de paiement par des partenaires autonomes (ci-après les « Partenaires Tiers »). Le Prestataire agit exclusivement en qualité d’intermédiaire technologique et d’éditeur d’outils d’orchestration : il ne fournit pas de services de paiement au sens du Code monétaire et financier, ne détient pas de fonds, n’exécute pas d’opérations de paiement en son nom, n’octroie pas de crédit et ne décide pas de l’éligibilité ou de l’acceptation à une facilité de paiement, ces décisions relevant exclusivement des Partenaires Tiers. Le Client demeure seul responsable de sa relation contractuelle avec ses propres clients/débiteurs, de la conformité de ses conditions générales de vente, de ses obligations d’information, de ses politiques de remboursement et de gestion des litiges, ainsi que de la base légale de toute communication et de tout traitement de données personnelles qu’il initie via la Plateforme.`,
  },
  {
    id: 'article-1',
    number: 'Article 1',
    title: 'Définitions, structure contractuelle, hiérarchie',
    content: `1.1. Définitions : 1.1.1. Client : toute personne morale ou physique agissant dans le cadre de son activité professionnelle, souscrivant aux Services. 1.1.2. Utilisateur : toute personne physique habilitée par le Client à accéder à la Plateforme. 1.1.3. Plateforme : service SaaS Booster-Pay, incluant interfaces web, API, connecteurs, tableaux de bord, modules de configuration, journaux d’événements. 1.1.4. Services : fonctionnalités d’orchestration de flux d’encaissement, de gestion du poste client, de paramétrage de scénarios, de reporting et d’intégration avec Partenaires Tiers. 1.1.5. Partenaires Tiers : prestataires externes susceptibles d’intervenir dans un parcours d’encaissement (paiement, BNPL, anti-fraude, KYC/KYB, hébergement, messagerie transactionnelle, observabilité). 1.1.6. Données : informations transmises par le Client, informations générées par l’usage, métadonnées techniques et journaux de sécurité. 1.1.7. Documentation : guides, spécifications, politiques, annexes techniques mises à disposition.<br/><br/>1.2. Hiérarchie : 1.2.1. En cas de contradiction : (i) conditions particulières / devis / bon de commande, (ii) CGV, (iii) politiques et annexes techniques. 1.2.2. Les évolutions de la Plateforme peuvent conduire à des mises à jour documentaires publiées en ligne.`,
  },
  {
    id: 'article-2',
    number: 'Article 2',
    title: 'Objet, périmètre SaaS et positionnement « risque faible »',
    content: `2.1. Objet : Les CGV définissent les modalités d’accès, d’abonnement, d’utilisation des Services, ainsi que les obligations des parties. 2.2. Périmètre fonctionnel : 2.2.1. La Plateforme fournit des outils de configuration de parcours d’encaissement (échéances, statuts, événements, notifications transactionnelles), de pilotage du poste client, d’agrégation d’informations opérationnelles, et d’intégration technique. 2.2.2. Les outils de communication intégrés, lorsqu’ils existent, relèvent d’une logique d’orchestration communicationnelle et de délivrance transactionnelle, paramétrée par le Client, à des fins de continuité opérationnelle, de traçabilité et de performance d’encaissement, sans substitution du Prestataire à la relation commerciale du Client. 2.3. Statut du Prestataire : 2.3.1. Le Prestataire n’est ni établissement de crédit, ni établissement de paiement, ni établissement de monnaie électronique ; il n’exerce pas une activité réglementée de services de paiement au sens du Code monétaire et financier. 2.3.2. Le Prestataire ne détient pas de fonds, n’encaisse pas pour le compte du Client, et n’exécute pas d’opérations de paiement en son nom.`,
  },
  {
    id: 'article-3',
    number: 'Article 3',
    title: 'Souscription, compte, habilitations, exigences d’intégrité',
    content: `3.1. Souscription et informations : 3.1.1. Le Client fournit des informations exactes et à jour ; le Prestataire peut demander des éléments KYB/KYC raisonnablement nécessaires à la sécurité, à la conformité et à la prévention des abus. 3.1.2. En cas d’incohérence manifeste, le Prestataire peut refuser la souscription ou suspendre l’accès. 3.2. Habilitations : 3.2.1. Accès personnels ; interdiction de partage d’identifiants. 3.2.2. Le Client administre les droits selon le principe du moindre privilège. 3.3. Intégrité et sécurité côté Client : 3.3.1. Le Client met en œuvre des mesures minimales (MFA lorsque disponible, gestion des postes, rotation des secrets API). 3.3.2. Le Client demeure responsable de la sécurité de ses environnements d’intégration.`,
  },
  {
    id: 'article-4',
    number: 'Article 4',
    title: 'Description avancée des Services et modules techniques',
    content: `4.1. Orchestration des flux : 4.1.1. Paramétrage d’événements (création, validation, tentative, réussite, échec), échéanciers, règles de routage, et scénarios. 4.1.2. Interfaces et API : webhooks, endpoints, exports, mécanismes de reprise et de file d’attente lorsque disponibles. 4.2. Moteurs d’orchestration communicationnelle et algorithmes de traitement phonétique : 4.2.1. La Plateforme peut intégrer des moteurs d’orchestration communicationnelle destinés à optimiser la cohérence, la traçabilité, la priorisation et la délivrabilité des interactions transactionnelles, et, selon les configurations, des algorithmes de traitement phonétique et sémantique appliqués à des signaux opérationnels, dans une logique d’optimisation de flux et de sécurité. 4.2.2. Les détails d’implémentation, règles internes, modèles, paramètres, et mécanismes de détection constituent des informations confidentielles relevant du secret des affaires et de la sécurité, non communicables hors obligations légales ou accord écrit. 4.3. Reporting et pilotage trésorerie : 4.3.1. Tableaux de bord : suivi des statuts, délais, taux d’échec, performance des canaux, indicateurs de trésorerie. 4.3.2. Les indicateurs sont des aides à la décision ; aucune promesse de performance financière n’est accordée.`,
  },
  {
    id: 'article-5',
    number: 'Article 5',
    title: 'Partenaires Tiers, BNPL, autonomie de décision et absence de garantie',
    content: `5.1. Principe : 5.1.1. L’accès à des facilités de paiement ou options analogues est soumis à l’acceptation exclusive des Partenaires Tiers, lesquels appliquent leurs propres critères (risque, conformité, fraude, limites). 5.1.2. Le Prestataire n’intervient pas dans la décision d’acceptation, n’exerce aucun contrôle sur les grilles internes, et ne garantit pas l’activation ni la continuité d’une option proposée par un tiers. 5.2. Clause d’irresponsabilité « refus / suspension » (API tierces) : 5.2.1. Le Client reconnaît expressément que tout refus, suspension, limitation, résiliation, dégradation de service, modification de conditions, ou changement technique imposé par un Partenaire Tiers ne constitue pas un manquement du Prestataire. 5.2.2. La responsabilité du Prestataire est exclue pour tout impact commercial ou financier résultant d’une décision ou indisponibilité d’un Partenaire Tiers (dont latence, erreurs, rejets, modifications d’API, dépréciation d’endpoints). 5.2.3. Le Prestataire peut, sans obligation, proposer des contournements techniques raisonnables (mise en file, reprise, bascule), sans garantie de résultat.`,
  },
  {
    id: 'article-6',
    number: 'Article 6',
    title: 'Conditions financières, facturation, taxes',
    content: `6.1. Prix : 6.1.1. Les prix sont ceux de l’offre acceptée (abonnement, options, volumes). 6.1.2. Les taxes applicables sont facturées selon la réglementation en vigueur. 6.2. Paiement et retard : 6.2.1. Paiement à échéance selon facture. 6.2.2. Retard : pénalités au taux légal majoré et indemnité forfaitaire de recouvrement conformément à l’article L.441-10 du Code de commerce, sans préjudice de la suspension. 6.3. Frais des Partenaires Tiers : 6.3.1. Les frais des Partenaires Tiers (commissions, antifraude, vérification, rejets) sont indépendants et à la charge du Client.`,
  },
  {
    id: 'article-7',
    number: 'Article 7',
    title: 'Obligations du Client (conformité, contenu, données)',
    content: `7.1. Conformité générale : 7.1.1. Le Client garantit la licéité de ses flux et la conformité de ses conditions contractuelles. 7.1.2. Le Client garantit disposer d’une base légale pour toute communication émise via la Plateforme et informer les personnes concernées conformément aux exigences applicables. 7.2. Paramétrages et contenu : 7.2.1. Le Client est seul responsable des paramétrages, du calendrier, du contenu des messages et des conséquences sur sa relation client. 7.2.2. Le Client s’interdit tout usage abusif, trompeur, ou visant à contourner des contrôles anti-fraude.`,
  },
  {
    id: 'article-8',
    number: 'Article 8',
    title: 'Cybersécurité, SOC/SIEM, supervision et gestion des incidents',
    content: `8.1. Mesures techniques et organisationnelles : 8.1.1. Le Prestataire met en œuvre des mesures de sécurité adaptées au risque : contrôle d’accès, segmentation logique, chiffrement en transit, gestion des secrets, sauvegardes, surveillance, durcissement, et procédures de gestion des vulnérabilités. 8.1.2. Les accès administratifs et les opérations sensibles peuvent être journalisés et soumis à des contrôles renforcés. 8.2. Supervision SOC/SIEM : 8.2.1. La Plateforme peut s’appuyer sur une chaîne de supervision de type SOC/SIEM, incluant collecte et corrélation de journaux (authentification, appels API, erreurs, anomalies), détection en temps réel de comportements atypiques, et mécanismes d’alerting. 8.2.2. Les journaux peuvent être conservés sur une durée proportionnée aux finalités de sécurité, d’investigation et de preuve. 8.3. Gestion des incidents : 8.3.1. En cas d’incident, le Prestataire applique un processus : qualification, confinement, remédiation, restauration, et retour d’expérience, pouvant inclure des mesures conservatoires. 8.3.2. Le Client coopère raisonnablement. 8.4. Notification : 8.4.1. Le Prestataire s’efforce d’informer le Client par voie électronique en cas d’incident significatif, sous réserve des contraintes d’enquête, de sécurité et d’instructions d’autorités.`,
  },
  {
    id: 'article-9',
    number: 'Article 9',
    title: 'Vigilance orientée risque, LCB-FT et prévention des abus',
    content: `9.1. Cadre de vigilance : 9.1.1. Sans se substituer aux obligations propres des entités financières, le Prestataire déploie une vigilance orientée risque visant à réduire l’exposition à des usages frauduleux ou abusifs pouvant impacter la sécurité et la conformité des flux, notamment au regard des exigences des Partenaires Tiers soumis à des dispositifs LCB-FT et de sanctions. 9.1.2. Cette vigilance est proportionnée, fondée sur des signaux techniques et opérationnels, et n’emporte pas qualification d’activité réglementée du Prestataire. 9.2. Mesures possibles : 9.2.1. Demande d’informations KYB. 9.2.2. Contrôles de cohérence sur volumes, taux d’échec, anomalies techniques. 9.2.3. Suspension préventive ou limitation d’accès en cas de risque élevé, sans indemnité.`,
  },
  {
    id: 'article-10',
    number: 'Article 10',
    title: 'Propriété intellectuelle, secret des affaires, restrictions',
    content: `10.1. Titularité : 10.1.1. La Plateforme, ses modules, connecteurs, documentations, et évolutions sont la propriété du Prestataire ou de ses concédants. 10.2. Licence : 10.2.1. Licence non exclusive, non transférable, limitée à l’usage interne du Client, pendant la durée du contrat. 10.3. Interdictions : 10.3.1. Interdiction de rétro-ingénierie, décompilation, extraction substantielle de base de données, reproduction de fonctionnalités, ou usage concurrent. 10.4. Secret des affaires : 10.4.1. Les mécanismes internes, y compris moteurs d’orchestration communicationnelle et algorithmes de traitement phonétique et sémantique, demeurent confidentiels.`,
  },
  {
    id: 'article-11',
    number: 'Article 11',
    title: 'Confidentialité',
    content: `11.1. Obligation de confidentialité : 11.1.1. Chaque partie protège les informations non publiques de l’autre, sans divulgation à des tiers non autorisés. 11.1.2. Survie : cinq (5) ans minimum, sans préjudice des secrets d’affaires.`,
  },
  {
    id: 'article-12',
    number: 'Article 12',
    title: 'Responsabilité, exclusions, plafonnement',
    content: `12.1. Obligation de moyens : 12.1.1. Le Prestataire est tenu à une obligation de moyens. 12.2. Exclusions : 12.2.1. Exclusion de toute responsabilité pour dommages indirects : perte d’exploitation, perte de chiffre d’affaires, perte de chance, atteinte à l’image, perte de données non imputable. 12.2.2. Exclusion pour décisions, indisponibilités, modifications ou refus des Partenaires Tiers. 12.3. Plafond : 12.3.1. Sauf faute lourde ou dol, la responsabilité totale du Prestataire est plafonnée au montant effectivement payé par le Client au titre des Services sur les trois (3) derniers mois précédant le fait générateur.`,
  },
  {
    id: 'article-13',
    number: 'Article 13',
    title: 'Audit et contrôle',
    content: `13.1. Contrôles internes : 13.1.1. Le Prestataire peut effectuer des contrôles d’intégrité, des revues d’usage et des audits de sécurité. 13.1.2. Ces contrôles peuvent inclure l’analyse de journaux techniques, schémas d’appels API, signatures, et indicateurs de risque. 13.2. Audit documentaire du Client : 13.2.1. Le Client peut solliciter un audit documentaire raisonnable, sous réserve de confidentialité. 13.2.2. Toute action intrusive est soumise à accord écrit préalable.`,
  },
  {
    id: 'article-14',
    number: 'Article 14',
    title: 'Suspension, résiliation, réversibilité',
    content: `14.1. Suspension : 14.1.1. Le Prestataire peut suspendre en cas de non-paiement, risque sécurité, usage non conforme, risque élevé au titre de la vigilance orientée risque. 14.2. Résiliation : 14.2.1. Résiliation pour manquement grave non réparé dans les quinze (15) jours suivant mise en demeure. 14.3. Réversibilité : 14.3.1. À l’issue, export des données dans un format standard.`,
  },
  {
    id: 'article-15',
    number: 'Article 15',
    title: 'Force majeure',
    content: `15.1. Force majeure au sens de l’article 1218 du Code civil : pannes majeures, incidents réseaux, attaques, actes d’autorités, etc. 15.2. Suspension des obligations ; possibilité de résiliation si l’empêchement excède trente (30) jours.`,
  },
  {
    id: 'article-16',
    number: 'Article 16',
    title: 'Droit applicable et juridiction',
    content: `16.1. Droit français. 16.2. Juridictions compétentes du ressort de la Cour d’appel de Paris, sauf règles impératives.`,
  },
];

const CGV = () => (
  <LegalPage
    title="Conditions Générales de Vente"
    lastUpdated="5 mars 2026"
    sections={sections}
    metaDescription="Conditions Générales de Vente (CGV) de Booster-Pay — Service SaaS d’orchestration de flux d’encaissement."
  />
);

export default CGV;
