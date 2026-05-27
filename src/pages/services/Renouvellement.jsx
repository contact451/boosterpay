import { RefreshCw } from 'lucide-react';
import ServicePageTemplate from './ServicePageTemplate';

export default function Renouvellement() {
  return (
    <ServicePageTemplate
      service={{
        id: 'renouvellement',
        icon: RefreshCw,
        color: 'emerald',
        badge: 'Appels sortants',
        title: 'Renouvellement de dossiers. Zéro oubli.',
        subtitle: 'L\'IA appelle chaque client dont le dossier arrive à échéance — contrôles techniques, assurances, bilans, abonnements. Tout est couvert, rien ne passe entre les mailles.',
        stats: [
          { value: '80%', label: 'Taux de renouvellement' },
          { value: '0', label: 'Dossier oublié' },
          { value: '2 min', label: 'Par relance' },
          { value: '100%', label: 'Automatisé' },
        ],
        howItWorks: [
          { title: 'Vous importez vos clients', desc: 'Liste Excel ou Google Sheets : nom, téléphone, date d\'échéance du dossier à renouveler.' },
          { title: 'L\'IA appelle au bon moment', desc: 'X jours avant l\'échéance, l\'IA contacte le client, présente le renouvellement et prend le RDV.' },
          { title: 'Vous voyez les résultats', desc: 'Tableau de bord en temps réel : qui a confirmé, qui a refusé, qui doit être rappelé.' },
        ],
        benefits: [
          'Contrôles techniques renouvelés automatiquement (garages, contrôles auto…).',
          'Contrats d\'assurance reconduits sans relance manuelle.',
          'Entretiens annuels (chaudières, plomberie, jardinage) confirmés en amont.',
          'Bilans médicaux et rappels de check-up automatisés.',
          'Abonnements à durée déterminée renouvelés sans friction.',
          'L\'IA propose plusieurs créneaux RDV — le client choisit.',
          'Si le client refuse, vous êtes notifié pour relance personnalisée.',
          'CA récurrent sécurisé sans 1 minute de votre temps.',
        ],
        otherServices: [
          { id: 'rdv', title: 'Confirmation de RDV' },
          { id: 'reception', title: 'Réception 24/7' },
          { id: 'paiements', title: 'Accélération de paiements' },
        ],
      }}
    />
  );
}
