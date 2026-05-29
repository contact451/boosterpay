import { PhoneCall } from 'lucide-react';
import ServicePageTemplate from './ServicePageTemplate';

export default function Reception247() {
  return (
    <ServicePageTemplate
      service={{
        id: 'reception',
        icon: PhoneCall,
        color: 'amber',
        badge: 'Appels entrants',
        title: 'L\'IA décroche en 2 secondes, à votre place.',
        subtitle: 'Un appel manqué, c\'est un client perdu. Plus jamais. L\'IA qualifie le prospect et vous envoie le RDV par SMS — même la nuit, même le week-end.',
        stats: [
          { value: '24/7', label: 'Disponibilité' },
          { value: '2s', label: 'Décrochage' },
          { value: '97%', label: 'Appels pris' },
          { value: '×3', label: 'Leads qualifiés' },
        ],
        howItWorks: [
          { title: 'Vous configurez le renvoi', desc: 'En 5 minutes : votre mobile renvoie vers votre numéro BoosterPay quand vous ne pouvez pas répondre.' },
          { title: 'L\'IA décroche pour vous', desc: 'L\'IA répond au nom de votre entreprise, comprend le besoin du client et qualifie naturellement la demande.' },
          { title: 'Vous recevez le lead par SMS', desc: 'Récap immédiat : qui a appelé, pour quoi, et le RDV si l\'IA en a pris un dans votre agenda.' },
        ],
        benefits: [
          'Zéro appel manqué — chaque prospect devient un lead qualifié.',
          'L\'IA prend les RDV directement dans votre agenda Google ou Outlook.',
          'Disponible 24h/24, 7j/7, y compris la nuit et les week-ends.',
          'Voix française naturelle indiscernable d\'un humain pour 94% des appelés.',
          'Récap SMS instantané : vous savez tout sur le client avant de le rappeler.',
          'Pas de bot rigide — l\'IA s\'adapte à chaque conversation.',
          'Transcription écrite de chaque appel, archivée dans votre espace.',
          'Activation en 5 minutes — aucune installation logicielle.',
        ],
        otherServices: [
          { id: 'rdv', title: 'Confirmation de RDV' },
          { id: 'renouvellement', title: 'Renouvellement de dossiers' },
          { id: 'impact-avis', title: 'Impact Avis Google' },
        ],
      }}
    />
  );
}
