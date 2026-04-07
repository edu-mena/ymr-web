import { useEffect, useRef, useState } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  category?: string;
}

export default function PartnersCarousel() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch('/partners')
      .then((res) => {
        setPartners(res?.data || res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar parceiros:', err);
        setLoading(false);
      });
  }, []);

  // Infinite scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || partners.length === 0) return;

    let animationId: number;
    let position = 0;
    const speed = 0.3;
    const itemWidth = 140;
    const gap = 32;
    const totalWidth = (itemWidth + gap) * partners.length;

    const animate = () => {
      position -= speed;
      if (Math.abs(position) >= totalWidth) position = 0;
      carousel.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => { if (animationId) cancelAnimationFrame(animationId); };
  }, [partners]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-3 text-sm text-gray-500">A carregar parceiros...</p>
      </div>
    );
  }

  if (partners.length === 0) return null;

  const items = [...partners, ...partners];

  return (
    <>
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Parceiros</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Nossos Parceiros de Confiança
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Trabalhamos com as melhores marcas do mercado para oferecer produtos de alta qualidade e confiabilidade.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          ref={carouselRef}
          className="flex items-center"
          style={{ width: 'max-content' }}
        >
          {items.map((partner, index) => (
            <a
              key={`${partner.id}-${index}`}
              href={partner.website || '#'}
              target={partner.website ? '_blank' : undefined}
              rel={partner.website ? 'noopener noreferrer' : undefined}
              className="flex flex-col items-center gap-3 mx-4 w-[108px] flex-shrink-0 group cursor-pointer"
            >
              {/* Logo */}
              <div className="w-24 h-14 bg-white rounded-xl flex items-center justify-center border-2 border-gray-100 hover:border-blue-400 transition-all duration-300 hover:shadow-lg group-hover:scale-105 overflow-hidden p-2">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              {/* Name */}
              <span className="text-xs font-medium text-gray-700 text-center leading-tight group-hover:text-blue-600 transition-colors">
                {partner.name}
              </span>
            </a>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
      </div>
    </>
  );
}
