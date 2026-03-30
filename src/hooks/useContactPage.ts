import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, LucideIcon } from 'lucide-react';
import { apiFetch } from '../services/api';

const iconMap: Record<string, LucideIcon> = { Phone, Mail, MapPin, Clock };

export type ContactInfo = {
  slug: string;
  title: string;
  details: string[] | string;
  description: string;
  icon: LucideIcon;
};

export type ContactFaq = {
  question: string;
  answer: string;
};

export type ContactMap = {
  title: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  directionsUrl: string;
};

export function useContactPage() {
  const [info, setInfo]     = useState<ContactInfo[]>([]);
  const [faqs, setFaqs]     = useState<ContactFaq[]>([]);
  const [map, setMap]       = useState<ContactMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/contact')
      .then(data => {
        const infoCards: ContactInfo[] = data.info
          .filter((i: any) => i.slug !== 'map')
          .map((i: any) => ({
            slug:        i.slug,
            title:       i.title,
            details:     i.details,
            description: i.description,
            icon:        iconMap[i.icon] ?? Phone,
          }));
        setInfo(infoCards);

        setFaqs(data.faqs);

        const mapRow = data.info.find((i: any) => i.slug === 'map');
        if (mapRow && mapRow.details && typeof mapRow.details === 'object') {
          setMap({
            title:         mapRow.title,
            lat:           mapRow.details.lat,
            lng:           mapRow.details.lng,
            address:       mapRow.details.address,
            city:          mapRow.details.city,
            directionsUrl: mapRow.description,
          });
        }
      })
      .catch(err => console.error('useContactPage:', err))
      .finally(() => setLoading(false));
  }, []);

  return { info, faqs, map, loading };
}