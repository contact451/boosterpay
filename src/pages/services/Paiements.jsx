import { Zap } from 'lucide-react';
import ServicePageTemplate from './ServicePageTemplate';

export default function Paiements() {
  return (
    <ServicePageTemplate
      service={{
        id: 'paiements',
        icon: Zap,
        color: 'rose',
        badge: 'Trésorerie',
        title: 'Accélération de paiements. Vos délais raccourcissent.',
        subtitle: 'L\'IA appelle vos clients dont la facture est due, au bon moment, avec le bon ton. Pas de menace, pas de relance brutale — un rappel humain et professionnel qui change tout.',
        stats: [
          { value: '−40%', label: 'Délais de paiement' },
          { value: '+62%', label: 'Factures à J+0' },
          { value: '0 min', label: 'De votre temps' },
          { value: '24/7', label: 'Tentatives intelligentes' },
        ],
        howItWorks: [
          { title: 'Vous importez vos factures dues', desc: 'Liste Excel ou intégration directe avec votre logiciel comptable.' },
          { title: 'L\'IA relance au bon timing', desc: 'J+0, J+7, J+15, J+30 — l\'IA adapte son ton et son message selon le retard.' },
          { title: 'Vos paiements arrivent plus vite', desc: 'Tableau de bord temps réel : qui a payé, qui a promis, qui doit être escaladé.' },
        ],
        benefits: [
          'Délais de paiement réduits de 40% en moyenne (28 → 17 jours).',
          'Ton humain et professionnel — pas de menace, pas de pression.',
          'Multi-tentatives intelligentes : l\'IA s\'adapte au comportement du débiteur.',
          'Vous gardez la main : escaladez quand vous voulez.',
          'Suivi de promesses de paiement avec rappels automatiques.',
          'Trésorerie sécurisée sans embaucher de chargé de recouvrement.',
          'Compatible avec tous les logiciels de facturation courants.',
          'Conforme aux règles de recouvrement amiable françaises.',
        ],
        otherServices: [
          { id: 'renouvellement', title: 'Renouvellement de dossiers' },
          { id: 'reception', title: 'Réception 24/7' },
          { id: 'impact-avis', title: 'Impact Avis Google' },
        ],
      }}
    />
  );
}
