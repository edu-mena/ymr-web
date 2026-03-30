import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: [
      '(+244) 222 719 152',
      '(+244) 924 170 909',
      '(+244) 933 170 909'
    ],
    description: 'Mon-Fri from 8am to 5pm'
  },
  {
    icon: Mail,
    title: 'Email',
    details: 'comercial@ymrindustrial.com',
    description: 'We respond within 24 hours'
  },
  {
    icon: MapPin,
    title: 'Address',
    details: 'Centralidade do Kilamba, Bloco X, Edifício nº 34, Apto nº 31, Luanda/Angola.',
    description: 'Luanda, Angola'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: 'Monday - Friday',
    description: '8:00 AM - 5:00 PM'
  }
];
