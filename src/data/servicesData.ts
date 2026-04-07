// ===== TIPOS =====
import { LucideIcon } from 'lucide-react';
import { Wrench, Zap, Database, Briefcase, Cog, GraduationCap } from 'lucide-react';

export interface LocalService {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  image: string;
  backgroundImage?: string;
  specs?: string;
  price: string;
  duration: string;
  availability: string;
}

export interface AboudService {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  services: string[];
  benefits: string[];
  brands?: string[];
  specialties?: string[];
  certifications?: string[];
  targetAudience: string;
  duration: string;
  certification: string;
}

export interface ServiceStat {
  number: string;
  label: string;
}

// ===== LOCAL SERVICES DATA =====
export const localServices: LocalService[] = [
  {
    icon: Database,
    title: 'Heavy Oil Storage Tanks',
    description: 'Rental of specialized tanks for safe storage of heavy oils with different capacities and advanced monitoring systems.',
    features: ['Capacities from 50m³ to 500m³', 'Integrated safety systems', '24/7 monitoring', 'Preventive maintenance included', 'International certification'],
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800',
    backgroundImage: 'https://ymrindustrial.com/assets/produtos/us.jpg',
    specs: 'Ideal for refineries, petrochemical and distribution companies',
    price: 'From Kz 150,000/month',
    duration: '6-24 month contracts',
    availability: 'Available immediately'
  },
  {
    icon: Zap,
    title: 'Heavy Industrial Generators',
    description: 'Rental of high-power industrial generators (100kW to 2000kW) to ensure continuous and reliable power for your most demanding projects.',
    features: ['100kW to 2000kW power output', 'Optimized fuel consumption', 'Quiet operation', '24/7 technical support', 'Installation and configuration included'],
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800',
    backgroundImage: 'https://ymrindustrial.com/assets/produtos/gerador.jpg',
    specs: 'Perfect for construction, mining and industrial events',
    price: 'From Kz 200,000/month',
    duration: 'Flexible contracts',
    availability: 'Stock available'
  },
  {
    icon: Wrench,
    title: 'Heavy Industrial Compressors',
    description: 'State-of-the-art industrial compression equipment for large-scale project applications, with advanced technology and superior efficiency.',
    features: ['Pressure up to 350 bar', 'Cutting-edge German technology', 'Ultra-low maintenance', 'Superior energy efficiency', 'Remote control available'],
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800',
    backgroundImage: 'https://ymrindustrial.com/assets/produtos/elgi.jpg',
    specs: 'Essential for oil, gas and chemical industries',
    price: 'Upon request',
    duration: '3-18 month projects',
    availability: 'Scheduling required'
  }
];

// ===== ABOUD CONSULTING DETAILED SERVICES =====
export const aboudServices: AboudService[] = [
  {
    icon: Briefcase,
    title: 'Commercial Representations',
    description: 'Exclusive representation of leading international technology brands for the oil and gas industry.',
    image: 'https://mobilit.com.br/wp-content/uploads/2021/11/executivos-c-level.jpg',
    services: [
      'Well completion and stimulation',
      'High-quality casing accessories',
      'Drilling analysis and optimization',
      'Downhole sensors',
      'Artificial lift systems (ESP, BCS)',
      'Specialized fishing equipment',
      'Multiphase flow meters',
      'Jet-pump systems'
    ],
    brands: ['Fishbones', 'Vulcan', 'Adaga', 'BBM', 'ABBON', 'Novomet'],
    benefits: [
      'Access to cutting-edge international technology',
      'Specialized technical support',
      'Competitive market pricing',
      'Certified quality guarantee',
      'Fast and reliable delivery',
      'Technical training included'
    ],
    targetAudience: 'Oil and gas operators, service companies',
    duration: 'Long-term contracts',
    certification: 'ISO 9001, API, DNV'
  },
  {
    icon: Cog,
    title: 'Well Engineering',
    description: 'Complete well engineering solutions with PhD professionals and decades of international experience.',
    image: 'https://hidrocon.com/wp-content/uploads/2023/06/11122018_Hidrocon_%C2%A9tarsofigueira_0166-1.jpg',
    services: [
      'Directional and horizontal drilling',
      'Drilling string sizing',
      'Well stability analysis',
      'Sand control and containment',
      'Stimulation and fracturing',
      'Specialized cementing',
      'Well intervention',
      'Flow assurance'
    ],
    specialties: ['Offshore Drilling', 'Multilateral Wells', 'Geomechanical Analysis'],
    benefits: [
      'Team with PhD in Petroleum Engineering',
      'Proven international experience',
      'Advanced simulation software',
      'Detailed technical reports',
      'Support during execution',
      'Post-project consulting'
    ],
    targetAudience: 'Operators, E&P companies, consultancies',
    duration: '3-12 month projects',
    certification: 'SPE, IADC, API'
  },
  {
    icon: GraduationCap,
    title: 'Technical and Operational Training',
    description: 'Technical capacity building programs developed by specialists with proven international experience.',
    image: 'https://img.freepik.com/fotos-gratis/equipa-de-engenharia-profissional-que-utiliza-software-da-industria-40-numa-fabrica-inteligente_482257-126300.jpg?semt=ais_hybrid&w=740&q=80',
    services: [
      'Advanced directional drilling',
      'Complex offshore operations',
      'Specialized cementing',
      'Intervention and workover',
      'Operational safety',
      'Drilling data analysis',
      'Applied geomechanics',
      'Reservoir stimulation'
    ],
    certifications: ['International Certification', 'Customized Modules', 'In-Company Training'],
    benefits: [
      'Instructors with international experience',
      'Updated educational materials',
      'Practical simulations',
      'Recognized certification',
      'Post-training support',
      'Customized courses'
    ],
    targetAudience: 'Engineers, technicians, E&P managers',
    duration: '1-5 day courses',
    certification: 'IADC, SPE, Proprietary certification'
  }
];

// ===== ABOUD STATISTICS =====
export const aboudStats: ServiceStat[] = [
  { number: '25+', label: 'Years of Experience' },
  { number: '10+', label: 'Represented Brands' },
  { number: '200+', label: 'Projects Completed' },
  { number: '50+', label: 'Trained Professionals' }
];

// ===== FUNÇÕES UTILITÁRIAS =====
export const getServiceById = (id: number): LocalService | undefined => {
  return localServices.find(service => service === localServices[id]);
};

export const getAboudServiceById = (id: number): AboudService | undefined => {
  return aboudServices.find(service => service === aboudServices[id]);
};

export const getServicesByCategory = (category: string): LocalService[] => {
  return localServices.filter(service => 
    service.title.toLowerCase().includes(category.toLowerCase()) ||
    service.description.toLowerCase().includes(category.toLowerCase())
  );
};
