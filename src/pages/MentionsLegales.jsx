import LegalPage from '../components/LegalPage';

const sections = [
  {
    id: 'article-1-1',
    number: 'Article 1.1',
    title: 'Objet et champ d’application',
    content: `Les présentes mentions légales ont pour objet de satisfaire aux obligations d’information prévues par la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l’Économie Numérique (LCEN) et, plus généralement, d’encadrer l’accès et l’utilisation du site Booster-Pay.com (ci-après le « Site »), sans préjudice des Conditions Générales de Vente (CGV) et de la Politique de Confidentialité applicables aux services SaaS édités sous la dénomination « Booster-Pay » (ci-après la « Plateforme »).`,
  },
  {
    id: 'article-1-2',
    number: 'Article 1.2',
    title: 'Éditeur du Site',
    content: `Le Site est édité par SNS MARKETING, société par actions simplifiée (SAS) dont le siège social est établi 60 rue François Ier, 75008 Paris, France, immatriculée sous le numéro SIREN 927 971 960, identifiée à la TVA intracommunautaire sous le numéro FR81 927 971 960, et enregistrée auprès des registres compétents (RNE) conformément aux dispositions applicables, la société disposant, dans le cadre de son organisation juridique, d’un capital social de 300,00 €, étant précisé que l’ensemble de ces informations est communiqué au titre des obligations légales de transparence et d’identification de la personne morale éditrice. Contact (email uniquement) : contact@booster-pay.com. Responsable de publication : la Direction de la Publication / le Représentant Légal de SNS MARKETING.`,
  },
  {
    id: 'article-1-3',
    number: 'Article 1.3',
    title: 'Hébergeur',
    content: `Le Site est hébergé par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France, immatriculée au RCS Lille Métropole sous le numéro 424 761 419 (ci-après l’« Hébergeur »).`,
  },
  {
    id: 'article-1-4',
    number: 'Article 1.4',
    title: 'Accès, disponibilité, maintenance',
    content: `Le Site est accessible en principe 24h/24 et 7j/7, sauf interruption, suspension, limitation, ou indisponibilité, notamment en raison d’opérations de maintenance corrective ou évolutive, de mises à jour, d’actions de sécurité, de contraintes techniques, d’incidents affectant les réseaux, ou d’événements hors contrôle raisonnable de l’Éditeur. L’Éditeur n’est tenu qu’à une obligation de moyens quant à la disponibilité du Site et ne garantit pas l’absence d’erreurs, d’interruptions ou de latences.`,
  },
  {
    id: 'article-1-5',
    number: 'Article 1.5',
    title: 'Propriété intellectuelle',
    content: `La structure, l’architecture informationnelle, les contenus, interfaces, signes distinctifs, dénominations, logiciels, bases de données, codes, documentations et plus largement tout élément composant le Site sont protégés par le droit de la propriété intellectuelle et/ou par le régime du secret des affaires. Toute reproduction, représentation, extraction, adaptation, décompilation, réutilisation, publication, ou exploitation, totale ou partielle, par quelque procédé que ce soit, sans autorisation écrite préalable de l’Éditeur, est interdite.`,
  },
  {
    id: 'article-1-6',
    number: 'Article 1.6',
    title: 'Responsabilité',
    content: `L’Éditeur met en œuvre des moyens raisonnables afin d’assurer l’exactitude des informations diffusées ; toutefois, il ne garantit ni l’exhaustivité, ni la mise à jour en temps réel. L’utilisateur reconnaît utiliser le Site sous sa seule responsabilité. En aucun cas l’Éditeur ne pourra être tenu responsable de dommages indirects ou immatériels, notamment pertes d’exploitation, pertes de données, pertes d’opportunité, préjudice commercial ou d’image, résultant de l’accès, de l’utilisation ou de l’impossibilité d’utilisation du Site.`,
  },
  {
    id: 'article-1-7',
    number: 'Article 1.7',
    title: 'Données personnelles, cookies et traceurs',
    content: `Les modalités de traitement des données personnelles, ainsi que les règles relatives aux cookies/traceurs, figurent dans la Politique de Confidentialité publiée sur le Site.`,
  },
  {
    id: 'article-1-8',
    number: 'Article 1.8',
    title: 'Droit applicable et juridiction',
    content: `Les présentes mentions légales sont régies par le droit français. Sauf disposition impérative contraire, tout litige relatif au Site relève des juridictions compétentes du ressort de la Cour d’appel de Paris.`,
  },
];

const MentionsLegales = () => (
  <LegalPage
    title="Mentions Légales"
    lastUpdated="5 mars 2026"
    sections={sections}
    metaDescription="Mentions légales du site Booster-Pay.com — Éditeur, hébergeur, propriété intellectuelle, responsabilité."
  />
);

export default MentionsLegales;
