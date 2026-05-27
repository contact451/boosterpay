import { Bot } from 'lucide-react';
import ServicePageTemplate from './ServicePageTemplate';

export default function RobotMesure() {
  return (
    <ServicePageTemplate
      service={{
        id: 'robot',
        icon: Bot,
        color: 'violet',
        badge: 'Sur mesure',
        title: 'Robot IA sur mesure. 100% adapté à vous.',
        subtitle: 'Un besoin spécifique ? On crée votre robot sur mesure : script personnalisé, voix naturelle, scénarios complexes, intégration CRM — une IA vocale taillée exactement pour vos processus.',
        stats: [
          { value: '100%', label: 'Personnalisé' },
          { value: '24h', label: 'Setup' },
          { value: '∞', label: 'Scénarios' },
          { value: 'Tout', label: 'CRM compatible' },
        ],
        howItWorks: [
          { title: 'Vous décrivez votre besoin', desc: 'Appel de cadrage 30 min — on identifie ensemble vos scénarios spécifiques, votre vocabulaire métier, vos intégrations.' },
          { title: 'On entraîne votre robot', desc: 'En 24 à 72h, votre IA est calibrée : voix, ton, script, scénarios conditionnels, intégration CRM. Tout est validé par vous avant déploiement.' },
          { title: 'Vous lancez votre IA dédiée', desc: 'Votre robot IA traite les appels selon VOS règles exactes. Ajustements illimités tant que vous êtes abonné.' },
        ],
        benefits: [
          'Script 100% personnalisé selon votre métier et votre marque.',
          'Choix entre 4 voix françaises naturelles (féminin/masculin).',
          'Scénarios multi-branches conditionnels (si A alors B, sinon C).',
          'Intégration directe avec votre CRM, agenda, Sheets, ou API custom.',
          'Vocabulaire métier maîtrisé — l\'IA parle comme vous.',
          'Validation de chaque conversation avant mise en production.',
          'Ajustements illimités tant que vous êtes abonné.',
          'Setup en 24-72h, formation incluse.',
        ],
        otherServices: [
          { id: 'reception', title: 'Réception 24/7' },
          { id: 'rdv', title: 'Confirmation de RDV' },
          { id: 'renouvellement', title: 'Renouvellement de dossiers' },
        ],
      }}
    />
  );
}
