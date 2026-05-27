import { CalendarCheck } from 'lucide-react';
import ServicePageTemplate from './ServicePageTemplate';

export default function ConfirmationRdv() {
  return (
    <ServicePageTemplate
      service={{
        id: 'rdv',
        icon: CalendarCheck,
        color: 'blue',
        badge: 'Appels sortants',
        title: 'Confirmation de RDV. Fini les lapins.',
        subtitle: 'L\'IA appelle la veille de chaque rendez-vous pour confirmer. Le client confirme, reporte ou annule — votre planning est fiable à 92%.',
        stats: [
          { value: '92%', label: 'Taux de présence' },
          { value: '−35%', label: 'De lapins' },
          { value: 'J−1', label: 'Appel automatique' },
          { value: '0 min', label: 'De votre temps' },
        ],
        howItWorks: [
          { title: 'Vous synchronisez votre agenda', desc: 'Google Calendar, Outlook ou import CSV — l\'IA voit tous vos RDV à venir.' },
          { title: 'L\'IA appelle J−1', desc: 'La veille du RDV, l\'IA contacte chaque client pour confirmer, reporter ou annuler.' },
          { title: 'Votre planning se met à jour seul', desc: 'Les annulations libèrent automatiquement le créneau. Les reports sont reprogrammés.' },
        ],
        benefits: [
          '92% de taux de présence vs 57% sans confirmation (étude interne).',
          'L\'IA reporte les RDV automatiquement si le client ne peut pas venir.',
          'Notifications SMS pour les clients qui ne décrochent pas le téléphone.',
          'Synchro temps réel avec Google Calendar, Outlook, et plus de 30 agendas.',
          'Vos créneaux annulés sont libérés automatiquement pour de nouveaux clients.',
          'CA protégé : moins de no-show = plus de chiffre d\'affaires réel.',
          'Vous gagnez 1 heure par jour vs faire les confirmations à la main.',
          'Configuration en 5 minutes — l\'IA fait le reste sans intervention.',
        ],
        otherServices: [
          { id: 'reception', title: 'Réception 24/7' },
          { id: 'renouvellement', title: 'Renouvellement de dossiers' },
          { id: 'impact-avis', title: 'Impact Avis Google' },
        ],
      }}
    />
  );
}
