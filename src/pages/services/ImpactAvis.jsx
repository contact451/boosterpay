import { Star } from 'lucide-react';
import ServicePageTemplate from './ServicePageTemplate';

export default function ImpactAvis() {
  return (
    <ServicePageTemplate
      service={{
        id: 'impact-avis',
        icon: Star,
        color: 'yellow',
        badge: 'Réputation',
        title: 'Impact Avis. Plus d\'étoiles, sans risque.',
        subtitle: 'L\'IA appelle vos clients après chaque prestation. Si c\'est positif, elle envoie le lien Google. Si c\'est négatif, le retour reste en interne — vous corrigez avant qu\'il devienne public.',
        stats: [
          { value: '4★+', label: '→ Google' },
          { value: '<4★', label: '→ interne' },
          { value: '+38', label: 'Avis / 2 mois' },
          { value: '4,7', label: 'Note moyenne' },
        ],
        howItWorks: [
          { title: 'L\'IA appelle après chaque prestation', desc: 'Quelques heures après le service rendu, l\'IA contacte le client pour recueillir son ressenti.' },
          { title: 'Filtrage intelligent', desc: 'Si le client est satisfait (4★+), l\'IA envoie le lien Google par SMS. Si insatisfait, le retour reste en interne.' },
          { title: 'Vous corrigez les mécontents', desc: 'Vous êtes notifié des retours négatifs avant qu\'ils n\'aillent sur Google — vous pouvez rappeler et résoudre.' },
        ],
        benefits: [
          '+38 avis Google en moyenne sur les 2 premiers mois.',
          'Note Google qui passe de 3,8 à 4,7 étoiles en moyenne.',
          'Aucun avis négatif sur Google — les mécontents sont interceptés.',
          'Lien direct Google Avis envoyé par SMS — 0 friction client.',
          '94% des clients pensent parler à un humain au téléphone.',
          'Visibilité Google améliorée — 2× plus d\'appels entrants en moyenne.',
          'Vous récupérez la confiance des clients mécontents avant qu\'ils ne nuisent.',
          'Conforme RGPD : consentement explicite avant chaque appel.',
        ],
        otherServices: [
          { id: 'reception', title: 'Réception 24/7' },
          { id: 'rdv', title: 'Confirmation de RDV' },
          { id: 'robot', title: 'Robot IA sur mesure' },
        ],
      }}
    />
  );
}
