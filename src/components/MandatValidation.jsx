import { useState, useEffect, useCallback } from "react";

// ============================================================
// MandatValidation — Composant de validation obligatoire
// Mandat d'Intermédiation et de Gestion de Créances
// ============================================================

const DOCUMENT_VERSION = "1.0.0";

// Hash SHA-256 simplifié du document (version déterministe)
const DOCUMENT_HASH = "bp-mandat-v1-sha256-a3f7c9e2d1b8";

const LEGAL_TEXT = `Les présentes Conditions Générales d'Utilisation et de Mandat de Recouvrement, ci-après indifféremment dénommées les « Conditions », les « CGU/M » ou le « Contrat », ont pour objet, ab initio, de définir, dans toute leur étendue matérielle, fonctionnelle, juridique, économique et technique, les termes, charges, obligations, limitations, garanties, exclusions, tolérances, renonciations partielles et stipulations essentielles gouvernant l'accès, l'inscription, l'utilisation, l'exploitation et l'intermédiation fournie par la plateforme BoosterPay, exploitée par la société SNS MARKETING, société par actions simplifiée au capital de 300 euros, ayant son siège social 60 rue François Ier, 75008 Paris, immatriculée sous le numéro SIREN 927 971 960, ci-après « SNS Marketing », « la Société », « le Mandataire » ou « la Plateforme », au bénéfice de tout professionnel, personne physique ou morale, agissant dans le cadre de son activité économique, commerciale, artisanale, libérale ou industrielle, qui y souscrit afin d'organiser, centraliser, automatiser, faciliter, tracer, sécuriser, fluidifier, optimiser ou déléguer tout ou partie des opérations de relance, d'encaissement, de facilitation de règlement, de recouvrement amiable, de proposition de moyens de paiement, de redirection de flux, de qualification d'impayés, d'intermédiation dans la perception de sommes dues, de constitution de dossiers de financement, de suivi d'exécution et de pilotage comptable et opérationnel y afférents, ce professionnel étant ci-après dénommé le « Client », le « Mandant », le « Partenaire » ou le « Créancier ». L'acceptation des présentes, matérialisée par tout clic, signature, validation électronique, usage continu, intégration API, injection de données, émission d'un ordre, dépôt de fichier, configuration d'un scénario ou recours à l'un quelconque des modules, emporte reconnaissance expresse, irrévocable et non équivoque de ce que le Client a pris connaissance de l'intégralité des présentes, les a comprises, les accepte sans réserve, les reconnaît opposables dans toutes leurs composantes, y compris celles pouvant être stipulées par renvoi vers des annexes, politiques, protocoles techniques, grilles tarifaires, formulaires de souscription, bons de commande, conditions particulières, avenants, tableaux d'abonnement, documents de conformité, chartes de sécurité, standards d'intégration, parcours de paiement ou notices de traitement de données, lesquelles feront corps avec le présent Contrat mutatis mutandis. Il est expressément convenu que BoosterPay constitue une infrastructure d'intermédiation contractuelle, technique et opérationnelle destinée à permettre au Client de mettre en œuvre, pour son propre compte et sous sa seule responsabilité économique, la gestion de ses créances, règlements, échéanciers, relances et encaissements, sans que la Société n'ait vocation à se substituer à lui dans la titularité de la créance, dans l'appréciation de son exigibilité, dans la vérification de sa licéité substantielle, dans la qualification juridique de la relation sous-jacente ni dans la validité intrinsèque des obligations du débiteur.

Par l'effet même de la souscription, de l'ouverture du compte et de l'utilisation, même partielle, des Services, le Client confère à SNS Marketing, qui l'accepte sous réserve du respect par le Client de l'ensemble de ses obligations contractuelles et réglementaires, un mandat exclusif d'intermédiation pour le recouvrement amiable des sommes que le Client entend faire relancer, percevoir, faire régler, fractionner, pré-encaisser, suivre, rapprocher ou sécuriser au moyen de la Plateforme, étant précisé que ce mandat, qui constitue un élément déterminant du consentement de la Société, est accordé intuitu personae, pour la durée de la relation contractuelle et pour tout dossier, facture, échéance, créance, lot de créances, encours, échéancier, campagne de relance ou demande de règlement intégrée, importée, transmise ou générée dans l'environnement BoosterPay. En conséquence, le Client s'interdit, pendant la durée du Contrat et pendant toute période de traitement actif d'un dossier introduit sur la Plateforme, de contourner directement ou indirectement l'écosystème technique, opérationnel, financier ou contractuel mis à sa disposition, de capter hors Plateforme un règlement initié, relancé, structuré, négocié, facilité ou rendu possible grâce aux Services, de dupliquer les workflows, d'utiliser les résultats, les scripts, les tunnels, les parcours de paiement, les mécanismes de scoring, les méthodes d'optimisation, les interfaces ou les prestataires de la Société dans une logique de désintermédiation, de substitution, de dérivation ou de concurrence parasitaire, et ce sous peine de voir appliquer, sans préjudice de tous autres dommages-intérêts, l'intégralité des commissions, frais et accessoires qui auraient été dus si l'opération avait été conduite à son terme sur la Plateforme, sans que le Client puisse utilement opposer une prétendue résiliation, une interruption unilatérale, un changement de prestataire, une internalisation ad nutum ou une prétendue indépendance de la relation avec le débiteur dès lors que la mise en relation, la sollicitation, la structuration de l'encaissement ou l'impulsion du paiement aurait trouvé sa cause efficiente dans l'usage antérieur ou concomitant des Services.

Les Services proposés par BoosterPay comprennent notamment, sans que cette énumération soit limitative ni créatrice d'une obligation exhaustive de fourniture, des modules de création de liens ou parcours de paiement, des outils d'envoi de demandes de règlement, des interfaces de relance multicanale, des systèmes de réception ou de redirection des fonds, des outils de justification et de traçabilité, des mécanismes d'assistance au recouvrement amiable, des solutions de présentation d'options de règlement immédiat ou échelonné, des passerelles avec des prestataires de paiement, ainsi que, le cas échéant, des solutions de financement tiers communément désignées BNPL ou équivalentes. Il est à cet égard expressément stipulé, de manière essentielle et déterminante, que toute transaction exécutée par carte bancaire dans le cadre d'un flux initié, structuré, facilité, présenté, rendu possible, sécurisé ou techniquement orchestré via BoosterPay donnera lieu, au profit de SNS Marketing, à une rémunération forfaitaire de service de huit pour cent hors taxes du montant nominal de la transaction, ladite rémunération étant convenue comme contrepartie indivisible des frais d'intermédiation technique, de mise à disposition de l'infrastructure, de sécurisation des parcours, de gestion des risques opérationnels, de garantie de flux, de consolidation des traces, de support transactionnel, d'acheminement et de supervision, sans que le Client puisse prétendre la requalifier en frais bancaires, en pénalité, en retenue illicite ou en accessoire facultatif. Cette commission de huit pour cent hors taxes est due de plein droit dès la réalisation du paiement, ou, plus largement, dès que la transaction a été valablement autorisée, capturée, payée, créditée, promise, compensée ou réputée acquise au profit du Client, même si le règlement transite par un prestataire tiers, un acquéreur, un établissement de paiement, un partenaire financier ou un système délégué, et même si la ventilation financière n'est opérée qu'ultérieurement. En présence d'une solution de financement tiers ou d'une facilité de paiement de type BNPL, il est convenu, en sus de la commission de huit pour cent hors taxes due par le Mandant, qu'une majoration spécifique de sept pour cent hors taxes du montant nominal financé, correspondant aux frais de constitution, de montage, d'analyse, de transmission, de qualification et de gestion du dossier de facilité de paiement, sera appliquée au débiteur, ou répercutée dans les conditions légalement et contractuellement admissibles au regard de la structuration de l'offre, des parcours et du partenaire financeur, sans que cela ne réduise, compense ni neutralise la commission principale due par le Client. Pour les règlements reçus par virement direct, qu'ils soient spontanés ou consécutifs à une relance, à un lien de paiement, à une négociation amiable, à une transmission d'IBAN ou à toute action issue des Services, il sera en outre dû à SNS Marketing des frais de gestion à la performance, calculés sur les flux encaissés, selon un taux variable compris entre zéro virgule trois pour cent et un pour cent hors taxes, ce taux étant déterminé par la formule d'abonnement, le niveau de service souscrit, le volume traité, le degré d'automatisation, la typologie des créances, le niveau d'assistance et, plus généralement, les conditions particulières applicables au Client. Il est entendu que toute somme due à la Société pourra être prélevée par compensation, retenue sur flux, appel de facture, débit du moyen de paiement enregistré, facturation périodique ou tout mécanisme licite convenu entre les parties, et que tout retard de paiement du Client, quelle qu'en soit la cause alléguée, produira de plein droit intérêts, sans mise en demeure préalable, au taux maximal légalement admissible entre professionnels, majoré d'une indemnité forfaitaire de recouvrement et de tous frais raisonnablement exposés.

Le Client reconnaît que les Services fournis par SNS Marketing relèvent exclusivement d'une obligation de moyens renforcée au plan technique et organisationnel, et nullement d'une obligation de résultat quant au paiement effectif, intégral ou ponctuel des créances, à la solvabilité des débiteurs, à l'acceptation d'un dossier par un établissement de paiement ou un partenaire BNPL, à la validité économique de l'opération sous-jacente, au maintien de l'autorisation bancaire, à l'absence de contestation, de rétrofacturation, de chargeback, d'impayé, de fraude, d'usurpation, de rejet, d'annulation, de refus de financement, de résolution contractuelle, de compensation, d'insolvabilité, de procédure collective, d'exécution partielle, de litige commercial ou de force majeure. En conséquence, le Client admet irrévocablement que la Société n'offre ni assurance-crédit, ni garantie de recouvrabilité, ni garantie de disponibilité permanente et absolue, ni garantie d'acceptation universelle des moyens de paiement, ni garantie de conformité de la créance aux conditions d'éligibilité d'un tiers financeur, ni garantie d'absence de contestation par le débiteur, ni garantie de rendement, de taux de conversion, d'encaissement minimum, de délai de paiement ou de succès économique. Toute action, réclamation, demande indemnitaire, exception d'inexécution, compensation ou retenue unilatérale dirigée contre SNS Marketing au motif que le débiteur n'a pas payé, a payé tardivement, a contesté, a obtenu un remboursement, a initié un chargeback, a refusé un financement ou a fait l'objet d'une procédure collective sera, sauf faute lourde prouvée de la Société, réputée irrecevable ou mal fondée. En toute hypothèse, et sous réserve des dispositions impératives d'ordre public auxquelles il ne pourrait être valablement dérogé, la responsabilité globale, cumulée et totale de SNS Marketing, toutes causes confondues, qu'elle soit contractuelle, délictuelle, quasi-délictuelle, fondée sur une garantie, un manquement, une négligence, une déclaration, un défaut de sécurité ou un autre fait générateur, est expressément plafonnée au montant effectivement payé par le Client au titre de son abonnement annuel en cours à la date du fait dommageable, à l'exclusion de toute réparation des pertes indirectes, pertes de chance, pertes d'exploitation, pertes de marge, pertes de clientèle, pertes d'image, pertes de données reconstruites, pertes financières consécutives à un refus de financement, à un litige avec un débiteur, à une décision d'un prestataire tiers, à une sanction administrative, à une interruption de service ou à une atteinte à la réputation.

Le Client déclare, garantit, certifie et s'engage de manière essentielle et déterminante, pendant toute la durée de la relation contractuelle et tant que des données, traces, historiques, journaux, coordonnées, échanges, enregistrements, pièces, éléments d'identité, informations de facturation ou données relatives à des débiteurs, clients finaux, coobligés, représentants, cautions, payeurs ou utilisateurs finaux sont injectés, importés, synchronisés, transmis, collectés, exploités ou traités au travers de la Plateforme, qu'il agit en qualité de responsable de traitement, au sens du Règlement (UE) 2016/679 et de l'ensemble de la réglementation applicable à la protection des données, pour toutes les opérations de traitement dont il détermine seul les finalités et les moyens essentiels, notamment s'agissant de la constitution du fichier débiteurs, de la qualification des créances, de la décision de mise en recouvrement amiable, de la détermination des bases légales, de la conservation primaire des données, de l'exactitude des informations injectées, de la licéité du transfert vers BoosterPay et du respect des droits des personnes concernées. Corrélativement, SNS Marketing intervient exclusivement, sauf stipulation écrite expresse contraire, en qualité de sous-traitant au sens de l'article 28 du RGPD, pour traiter certaines données pour le compte, selon les instructions et dans les limites déterminées par le Client, ce que celui-ci reconnaît expressément. Le Client garantit ainsi qu'il dispose, pour chaque donnée à caractère personnel transmise, d'une base légale valide, opposable, documentée et maintenue, incluant, selon les cas, le consentement valable de la personne concernée ou, lorsque le traitement ne repose pas sur le consentement, l'existence d'un intérêt légitime réel, sérieux, proportionné, actualisé et correctement mis en balance, autorisant la collecte, la conservation, la transmission et l'utilisation des données aux fins de relance, de demande de règlement, de traitement de la créance, d'organisation d'un parcours d'encaissement, de communication transactionnelle et de suivi, ce qui inclut expressément, sans que cette précision soit limitative, les adresses électroniques, numéros de téléphone, adresses postales, identifiants de connexion, logs, journaux d'utilisation, historiques de communication, métadonnées de paiement, éléments de preuve, pièces justificatives, références contractuelles, données comptables et traces d'interaction. Le Client garantit en outre avoir satisfait à ses obligations d'information, de transparence, de minimisation, d'exactitude, de limitation de conservation, de sécurité, de tenue de registre, d'encadrement des sous-traitants ultérieurs, de gestion des demandes de droits et, plus généralement, de conformité au RGPD, à la loi Informatique et Libertés et à toute réglementation sectorielle applicable. À ce titre, toute réclamation, mise en demeure, plainte, demande d'accès, opposition, contestation, injonction, contrôle, procédure, sanction, transaction, demande indemnitaire ou contentieux initié par un débiteur, un client final, une autorité de contrôle, une juridiction, un prestataire de paiement, un partenaire financier ou tout tiers, et trouvant sa cause, même partielle, dans l'illégalité, l'inexactitude, l'absence de base légale, l'insuffisance d'information, l'absence de consentement lorsqu'il est requis, le défaut de mise en balance, l'absence d'intérêt légitime valable, l'excès de conservation, l'illicéité du transfert ou la non-conformité du fichier ou des instructions transmises par le Client, sera supporté exclusivement par ce dernier, qui garantit et relève indemne SNS Marketing de l'intégralité des conséquences financières, juridiques, réputationnelles et opérationnelles pouvant en résulter, y compris les frais d'avocat, de conseil, d'expertise, d'audit, de remédiation et de défense. Le Client renonce en conséquence, sauf faute lourde autonome et exclusivement imputable à la Société, à rechercher la responsabilité de SNS Marketing au titre d'une plainte d'un débiteur relative à la protection des données lorsque cette plainte trouve son origine dans les données, les finalités, les bases légales, les instructions ou les choix opérés par le Client.

Il est par ailleurs expressément stipulé que le Client demeure seul responsable de la licéité des créances confiées, de l'absence de prescription, du caractère exigible des sommes, du respect des obligations d'information précontractuelle et contractuelle envers le débiteur, de l'absence de pratiques trompeuses, agressives ou abusives dans la relation commerciale initiale, de la conformité des biens ou services fournis, de la réalité de la dette, de l'absence de nullité, de résolution ou d'exception opposable, ainsi que de la sincérité des montants, frais, pénalités, intérêts, taxes et accessoires réclamés. SNS Marketing n'exerce aucun contrôle juridique de fond systématique sur la créance et n'a pas à vérifier, sauf engagement exprès contraire, la réalité matérielle de la prestation sous-jacente, l'identité définitive du débiteur, le bien-fondé économique de la facturation, la régularité comptable du dossier, l'absence de vice du consentement ou de litige latent. Le Client s'engage à n'utiliser BoosterPay ni pour tenter de recouvrer des sommes non dues, contestées de mauvaise foi, prescrites, illicites, disproportionnées ou obtenues dans des conditions contraires à l'ordre public, ni pour mettre en œuvre des relances susceptibles d'être qualifiées de harcèlement, de pression abusive, de pratique commerciale déloyale ou d'atteinte aux droits fondamentaux. Toute utilisation non conforme autorisera la Société, sans préavis ni indemnité, à suspendre ou résilier le compte, bloquer les flux, refuser certains dossiers, exiger toute justification utile, signaler les faits aux partenaires concernés, voire aux autorités compétentes lorsque la loi l'impose ou l'autorise.

Le Client reconnaît encore que l'intégrité économique, technique, informationnelle et concurrentielle de la Plateforme constitue une condition substantielle du Contrat. À ce titre, il s'interdit de porter atteinte, directement ou indirectement, à l'architecture fonctionnelle, aux logiques d'automatisation, aux tunnels de conversion, aux méthodes de scoring, aux scripts de relance, aux parcours de financement, aux modèles tarifaires, aux règles de distribution de flux, aux interfaces utilisateurs, aux gabarits, aux connecteurs, aux paramétrages, aux éléments graphiques, aux contenus juridiques, aux dénominations, à la marque, à la documentation, au savoir-faire, aux séquences, aux journaux, aux données d'usage, aux résultats d'optimisation et, plus généralement, à tout actif matériel ou immatériel de SNS Marketing, notamment en procédant à des extractions massives, à de l'ingénierie inverse, à des reproductions, à des contournements, à des duplications, à des tests de charge non autorisés, à des actes de concurrence déloyale, à des actes de parasitisme, à des sollicitations du personnel, des sous-traitants ou des partenaires de la Société dans le but d'évincer cette dernière, ni à mettre en place, pendant la durée du Contrat et durant une période de vingt-quatre mois suivant sa cessation pour quelque cause que ce soit, une solution substantiellement identique exploitant de manière directe ou dérivée les méthodes, processus, documentations, circuits financiers, argumentaires, structures contractuelles, données d'apprentissage opérationnelles ou choix d'architecture révélés ou accessibles à l'occasion de l'exécution du présent Contrat. Cette obligation, justifiée par la protection des intérêts légitimes de la Société, par le caractère confidentiel et stratégiquement sensible de son écosystème et par la nécessité de préserver l'investissement consenti, s'appliquera dans toute la mesure permise par le droit positif et fera l'objet, en cas de violation, d'une réparation intégrale, indépendamment de l'application de toute clause pénale ou de toute mesure conservatoire ou d'interdiction judiciaire.

Le présent Contrat est conclu pour la durée mentionnée dans les conditions particulières ou, à défaut, pour une durée initiale correspondant à la période d'abonnement souscrite, puis renouvelable par tacite reconduction pour des périodes successives de même durée, sauf dénonciation dans les conditions ci-après. La Société pourra résilier ou suspendre tout ou partie des Services de plein droit, sans préjudice des sommes déjà dues ni des recours indemnitaires, en cas de manquement du Client à l'une quelconque de ses obligations essentielles, notamment en cas de défaut de paiement, de transmission de données illicites, de contestation abusive des commissions, de tentative de contournement de la Plateforme, d'atteinte à la sécurité, d'usage contraire à la réglementation, d'atteinte à l'image de BoosterPay, de fraude, de risque de fraude, de hausse anormale du risque opérationnel ou réputationnel, d'exigence d'un partenaire de paiement ou d'un tiers financier, ou d'ouverture d'une procédure collective affectant le Client. Le Client, quant à lui, ne pourra résilier le Contrat que sous réserve du respect d'un préavis écrit, de l'apurement intégral de toutes les sommes dues, du règlement des commissions nées, acquises ou simplement générées par des flux initiés avant l'effet de la résiliation, et du respect des obligations post-contractuelles de confidentialité, de non-contournement, de non-concurrence, de restitution ou de destruction des éléments protégés. La résiliation, pour quelque cause que ce soit, n'affectera ni les droits nés antérieurement, ni la perception par SNS Marketing des commissions relatives aux transactions, règlements, financements ou virements directs dont la cause génératrice est antérieure à la cessation du Contrat, ni l'applicabilité des clauses qui, par leur nature, ont vocation à survivre, en ce compris celles relatives à la responsabilité, à la confidentialité, à la propriété intellectuelle, au RGPD, au non-contournement, au non-dénigrement, à la non-concurrence, au droit applicable et à la juridiction compétente.

Les présentes Conditions expriment l'intégralité de l'accord entre les parties et prévalent, sauf acceptation écrite expresse de la Société, sur tout document contradictoire émanant du Client, notamment ses conditions générales d'achat, politiques internes, bons de commande, clauses de conformité, échanges informels, mentions au verso de documents ou réserves unilatérales. Le fait pour SNS Marketing de ne pas se prévaloir, à un moment donné, d'une stipulation quelconque des présentes ne saurait être interprété comme valant renonciation définitive à s'en prévaloir ultérieurement. Si l'une des stipulations des présentes venait à être déclarée nulle, réputée non écrite, inapplicable ou privée d'effet, en tout ou partie, par une juridiction compétente ou en application d'une règle impérative, les autres stipulations demeureront en vigueur et conserveront tous leurs effets, les parties convenant alors de substituer à la stipulation affectée une stipulation valide se rapprochant autant que possible de l'économie générale du Contrat et de l'intention initiale des parties. Le Contrat est soumis au droit français. Tout litige relatif à sa formation, sa validité, son interprétation, son exécution, sa cessation, ses suites ou ses conséquences, y compris en référé, en pluralité de défendeurs, en appel en garantie ou en mesures conservatoires, relèvera de la compétence exclusive des juridictions matériellement compétentes du ressort de la Cour d'appel de Paris, nonobstant pluralité de parties ou appel en garantie, et ce même en cas de procédure d'urgence ou de requête.`;

export default function MandatValidation({ userId, onValidate }) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);

  // Anti-copie : bloquer clic droit + Ctrl/Cmd+C sur le composant
  const handleContextMenu = useCallback((e) => e.preventDefault(), []);
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById("mandat-container");
    if (!el) return;
    el.addEventListener("contextmenu", handleContextMenu);
    el.addEventListener("keydown", handleKeyDown);
    return () => {
      el.removeEventListener("contextmenu", handleContextMenu);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleContextMenu, handleKeyDown]);

  const handleValidate = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);

    const signature_metadata = {
      timestamp: new Date().toISOString(),
      ip_placeholder: "COLLECT_SERVER_SIDE",
      user_id: userId || "unknown",
      document_version: DOCUMENT_VERSION,
      document_version_hash: DOCUMENT_HASH,
      user_agent: navigator.userAgent,
      accepted_at: Date.now(),
    };

    try {
      // Envoyer vers la base de données Acceptations
      // Remplacer l'URL par votre endpoint API
      await fetch("/api/acceptations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signature_metadata),
      }).catch(() => {
        // Si l'API n'est pas encore configurée, on continue quand même
        console.log("Signature metadata:", signature_metadata);
      });

      setValidated(true);
      if (onValidate) onValidate(signature_metadata);
    } catch (err) {
      console.error("Erreur validation:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (validated) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white">Mandat accepté</p>
          <p className="text-sm text-slate-400 mt-1">Vous pouvez maintenant procéder à l'import.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="mandat-container"
      className="w-full max-w-2xl mx-auto rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden"
      tabIndex={-1}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Mandat d'Intermédiation et de Gestion de Créances
            </h2>
            <span className="hidden">{DOCUMENT_VERSION}</span>
          </div>
        </div>
      </div>

      {/* Texte juridique — consultable, pas obligatoire de lire */}
      <div className="px-6 py-3">
        <details className="group">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            Consulter le texte intégral du mandat
          </summary>
          <div
            className="mt-2 h-[200px] overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-950/50 p-4 text-xs leading-relaxed text-slate-400"
            style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}
          >
            {LEGAL_TEXT.split("\n\n").map((paragraph, i) => (
              <p key={i} className={i > 0 ? "mt-3" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </details>
      </div>

      {/* Checkbox + Bouton */}
      <div className="px-6 pb-6 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-2 cursor-pointer shrink-0"
          />
          <span className="text-sm text-slate-300 leading-snug group-hover:text-slate-200 transition-colors">
            J'accepte sans réserve les termes du Mandat, notamment les conditions tarifaires et les responsabilités RGPD.
          </span>
        </label>

        <button
          onClick={handleValidate}
          disabled={!accepted || submitting}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
            accepted && !submitting
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99]"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Validation en cours...
            </span>
          ) : (
            "Valider et Importer"
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-700/30 bg-slate-800/30">
        <p className="text-[10px] text-slate-500 text-center">
          En validant, vous consentez électroniquement au mandat ci-dessus. Cette acceptation a valeur de signature électronique conformément à l'article 1367 du Code civil.
        </p>
      </div>
    </div>
  );
}
