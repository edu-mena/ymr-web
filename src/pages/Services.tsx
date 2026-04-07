import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wrench, Eye, Clock, Cog, Shield, Zap, CheckCircle,
  AlertTriangle, ArrowRight, Phone, ChevronRight,
  Database, Settings2, Loader2, ChevronDown, Mail, MessageSquare
} from 'lucide-react';
import { aboudServices, aboudStats } from '../data/servicesData';
import RentalQuoteModal from '../components/RentalQuoteModal';
import { apiFetch } from '../services/api';
import type { RentalCategory, RentalCategoriesResponse } from '../components/RentalQuoteModal/quoteData';

// ─── Sales contact data ──────────────────────────────────────────────────────
const SALES_CONTACT = {
  name: 'Mariam Silla',
  phone: '+244921400650',
  email: 'comercial@ymrindustrial.com',
  whatsapp: 'https://wa.me/244921400650',
};

const categoryIcons: Record<string, typeof Settings2> = {
  compressores: Settings2,
  geradores: Zap,
  tanques: Database,
};

const SLA_PLANS = [
  {
    name: 'Basic',
    response: '48h',
    onSite: false,
    onSiteLabel: '—',
    support: 'Email',
    priority: 'Low',
    accent: 'blue',
  },
  {
    name: 'Standard',
    response: '24h',
    onSite: true,
    onSiteLabel: 'Scheduled',
    support: 'Email + WhatsApp',
    priority: 'Medium',
    popular: true,
    accent: 'green',
  },
  {
    name: 'Premium',
    response: '12h',
    onSite: true,
    onSiteLabel: 'Fast',
    support: '24/7',
    priority: 'High',
    accent: 'orange',
  },
  {
    name: 'Critical',
    response: '4h',
    onSite: true,
    onSiteLabel: 'Urgent',
    support: '24/7 Dedicated',
    priority: 'Maximum',
    accent: 'red',
  },
];

const priorityColor: Record<string, string> = {
  Low: 'text-gray-400',
  Medium: 'text-blue-600',
  High: 'text-orange-600',
  Maximum: 'text-red-600 font-bold',
};

// ===========================================================
// MAIN COMPONENT
// ===========================================================
const Services = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteInitialCat, setQuoteInitialCat] = useState('compressores');

  // Rental categories from API
  const [rentalCats, setRentalCats] = useState<RentalCategory[]>([]);
  const [rentalLoading, setRentalLoading] = useState(true);

  // Slider state
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollArrows = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollArrows();
    window.addEventListener('resize', updateScrollArrows);
    return () => window.removeEventListener('resize', updateScrollArrows);
  }, [updateScrollArrows, rentalCats]);

  const slide = useCallback((dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -320 : 320;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res: RentalCategoriesResponse = await apiFetch('/rental/categories', { noAuth: true });
        if (res.success && res.data) {
          setRentalCats(
            Object.values(res.data)
              .filter(c => c.type === 'equipment')
          );
        }
      } catch (err) {
        console.error('Failed to load rental categories:', err);
      } finally {
        setRentalLoading(false);
      }
    })();
  }, []);

  const openQuote = (slug: string) => {
    setQuoteInitialCat(slug);
    setQuoteOpen(true);
  };

  return (
    <div className="min-h-screen page-content bg-white">

      {/* ───────── 1. TECHNICAL ASSISTANCE (dark background) ───────── */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 rounded-2xl p-3">
                <Phone className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Specialized Technical Assistance
                </h1>
                <p className="text-gray-400 mt-1">
                  Qualified technicians available for maintenance, installation, and repair.
                </p>
              </div>
            </div>
            <ContactDropdown darkBg />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechStatDk icon={Clock} value="< 24h" label="Response time" />
            <TechStatDk icon={Wrench} value="" label="Preventive maintenance" />
            <TechStatDk icon={Shield} value="24/7" label="Critical support" />
            <TechStatDk icon={CheckCircle} value="100%" label="Certified technicians" />
          </div>
        </div>
      </section>

      {/* ───────── 2. EQUIPMENT RENTAL ───────── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-100 rounded-xl p-2.5">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Equipment Rental</h2>
              <p className="text-gray-500">Industrial equipment available for immediate rental with specialized technical support.</p>
            </div>
          </div>

          {/* Equipment cards from API — horizontal slider */}
          <div className="relative">
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => slide('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-lg rounded-full p-2 transition-all hover:shadow-xl -ml-3"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
            )}

            {/* Scrollable track */}
            <div
              ref={sliderRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={updateScrollArrows}
            >
              {rentalLoading ? (
                <div className="flex items-center justify-center w-full py-16">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-500 text-sm">Loading equipment...</span>
                </div>
              ) : rentalCats.length > 0 ? rentalCats.map((cat) => {
                const CatIcon = categoryIcons[cat.id] ?? Settings2;
                const imageSrc = cat.specs.length > 0 ? (cat.specs[0] as any).image || cat.categoryImage : cat.categoryImage;
                const specLabels = cat.specs.map((s: any) => s.spec_value || s.capacity || s.powerRange || s.type || '').slice(0, 3);

                return (
                  <div
                    key={cat.id}
                    className="flex-shrink-0 w-72 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group snap-start"
                  >
                    {/* Image */}
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <CatIcon className="h-4 w-4 text-blue-300" />
                        <span className="text-white text-sm font-semibold">{cat.label}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {specLabels.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {specLabels.map((spec: string, si: number) => (
                            <div key={si} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              <span className="text-gray-600">{spec}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        onClick={() => openQuote(cat.id)}
                        className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-4 py-2 rounded-xl text-sm font-medium transition-all group/btn"
                      >
                        Request Equipment
                        <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full text-center py-12">
                  <Wrench className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No equipment available for rental at the moment.</p>
                </div>
              )}
            </div>

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => slide('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-lg rounded-full p-2 transition-all hover:shadow-xl -mr-3"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ───────── 3. SERVIÇOS DE MANUTENÇÃO (mini hero) ───────── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specialized maintenance for your equipment
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our team of qualified technicians ensures the continuity of your operations with preventive and corrective maintenance.
            </p>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="group relative rounded-2xl overflow-hidden h-56 shadow-md">
              <img
                src="https://ymrindustrial.com/assets/produtos/gerador.jpg"
                alt="Generator maintenance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Maintenance</span>
                </div>
                <h3 className="text-lg font-bold text-white">Generators</h3>
                <p className="text-sm text-gray-300 mt-1">Oil change, filters, load testing and complete repair of industrial generators.</p>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden h-56 shadow-md">
              <img
                src="https://ymrindustrial.com/assets/produtos/elgi.jpg"
                alt="Compressor maintenance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center gap-2 mb-1">
                  <Settings2 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Maintenance</span>
                </div>
                <h3 className="text-lg font-bold text-white">Compressors</h3>
                <p className="text-sm text-gray-300 mt-1">Overhaul, parts replacement, calibration and complete diagnostics of industrial compressors.</p>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden h-56 shadow-md">
              <img
                src="https://ymrindustrial.com/assets/produtos/us.jpg"
                alt="Tank and pump maintenance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Maintenance</span>
                </div>
                <h3 className="text-lg font-bold text-white">Tanks & Pumps</h3>
                <p className="text-sm text-gray-300 mt-1">Inspection, cleaning, weld repair and maintenance of pumping systems.</p>
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">Need urgent maintenance?</h3>
              <p className="text-sm text-gray-500">Our team is available 24/7 for technical assistance.</p>
            </div>
            <ContactDropdown />
          </div>
        </div>
      </section>

      {/* ───────── 4. PLANOS DE SUPORTE / SLA (cards modernos) ───────── */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Technical Support Plans — SLA</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Choose the ideal support level for your equipment or project.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SLA_PLANS.map((plan) => {
              const accentBorder: Record<string, string> = {
                blue: 'border-blue-200',
                green: 'border-green-200',
                orange: 'border-orange-200',
                red: 'border-red-200',
              };
              const accentBg: Record<string, string> = {
                blue: 'bg-blue-50 text-blue-700',
                green: 'bg-green-50 text-green-700',
                orange: 'bg-orange-50 text-orange-700',
                red: 'bg-red-50 text-red-700',
              };
              const accentRing: Record<string, string> = {
                blue: 'ring-blue-600/20 ring-2',
                green: 'ring-green-600/20 ring-2',
                orange: 'ring-orange-600/20 ring-2',
                red: 'ring-red-600/20 ring-2',
              };

              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300 flex flex-col ${
                    plan.popular
                      ? 'border-transparent ring-2 ring-blue-600 shadow-md order-1'
                      : `border-gray-200 ${accentBorder[plan.accent]}`
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 flex-1">
                    {/* Name */}
                    <div className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-4 ${accentBg[plan.accent]}`}>
                      {plan.name}
                    </div>

                    {/* Feature list */}
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Response Time</p>
                        <p className="text-lg font-bold text-gray-900">{plan.response}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">On-Site Technician</p>
                        <div className="flex items-center gap-1.5">
                          {plan.onSite ? (
                            <><CheckCircle className="h-4 w-4 text-green-500" /> <span className="text-sm text-gray-700">{plan.onSiteLabel}</span></>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">Support</p>
                        <p className="text-sm font-medium text-gray-900">{plan.support}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">Priority</p>
                        <p className={`text-sm font-semibold ${priorityColor[plan.priority]}`}>{plan.priority}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning */}
          <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3 max-w-3xl mx-auto">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 text-sm">Attention</h4>
              <p className="text-sm text-amber-700 mt-1">
                Rented equipment without an active SLA plan will be subject to high additional costs
                in case of technical failure or on-site support needs. We recommend purchasing a
                support plan at the time of rental.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 5. PARCERIA ABOUD ───────── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
              <Eye className="h-5 w-5 text-blue-900" />
              <span className="text-sm font-medium text-blue-900">Strategic Partnership</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Strategic Partnership of Excellence</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                We are <strong>immensely pleased and proud</strong> to announce our <strong>well-established strategic partnership</strong>
                with the renowned <strong className="text-blue-900">Aboud Consultancy</strong>, a leading company specialized in different
                areas of the hydrocarbon and geothermal industry.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                This strategic alliance allows us to offer the Angolan market the most advanced solutions in well engineering,
                commercial representation of international brands, and world-class technical training programs.
              </p>
            </div>

            {/* VISUAL CONNECTION */}
            <div className="mb-12">
              <div className="relative max-w-3xl mx-auto">
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-12 w-full max-w-[520px] h-[3px] flowing-line rounded-full" aria-hidden="true" />
                <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-20 h-20 w-[3px] flowing-line-vert rounded-full" aria-hidden="true" />

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                  <div className="flex md:block items-center justify-center">
                    <div className="group text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                      <div className="relative inline-block">
                        <img
                          src="./src/assets/logo/ymrlogo.png"
                          alt="YMR Industrial"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-100 mx-auto object-cover shadow-lg group-hover:scale-105 transition-transform"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-blue-700 text-[10px] px-2 py-0.5 rounded-full shadow md:hidden">YMR</span>
                      </div>
                      <p className="hidden md:block font-semibold text-gray-900 mt-3">YMR Industrial</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" aria-hidden="true"></div>
                      <div className="relative bg-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-full font-semibold shadow-lg select-none transform bottom-5">
                        PARTNER
                      </div>
                    </div>
                  </div>

                  <div className="flex md:block items-center justify-center">
                    <div className="group text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                      <div className="relative inline-block">
                        <img
                          src="./src/assets/logo/aboudlogo.png"
                          alt="Aboud Consultancy"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-100 mx-auto object-cover shadow-lg group-hover:scale-105 transition-transform"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-blue-700 text-[10px] px-2 py-0.5 rounded-full shadow md:hidden">Aboud</span>
                      </div>
                      <p className="hidden md:block font-semibold text-gray-900 mt-3">Aboud Consultancy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ESTATÍSTICAS DA ABOUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {aboudStats.map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVIÇOS DETALHADOS DA ABOUD ===== */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Cog className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Specialized Areas</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Áreas de Especialização</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Três pilares fundamentais que sustentam nossa parceria e garantem soluções completas para a indústria de petróleo e gás.
            </p>
          </div>

          <div className="space-y-16">
            {aboudServices.map((service, index) => (
              <div
                key={service.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="bg-gray-100 p-3 rounded-full mr-4">
                      <service.icon className="h-8 w-8 text-blue-900" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{service.title}</h3>
                  </div>

                  <p className="text-lg text-gray-700 mb-8 leading-relaxed">{service.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {service.services.map((item, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>

                  {service.brands && (
                    <div className="mb-6">
                      <p className="font-semibold text-gray-900 mb-3">Marcas Representadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {service.brands.map((brand, idx) => (
                          <span key={idx} className="bg-gray-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.specialties && (
                    <div className="mb-6">
                      <p className="font-semibold text-gray-900 mb-3">Especialidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {service.specialties.map((specialty, idx) => (
                          <span key={idx} className="bg-gray-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.certifications && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-3">Certificações:</p>
                      <div className="flex flex-wrap gap-2">
                        {service.certifications.map((cert, idx) => (
                          <span key={idx} className="bg-gray-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`relative group ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="rounded-xl shadow-xl transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RentalQuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} initialCategory={quoteInitialCat} />
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

// Contact dropdown with phone, email, whatsapp
const ContactDropdown: React.FC<{ variant?: 'dark' | 'light'; darkBg?: boolean }> = ({ darkBg, variant = 'light' }) => {
  const [open, setOpen] = useState(false);

  const btnBase = darkBg
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-sm transition-colors ${btnBase}`}
      >
        {darkBg ? 'Need an Engineer? Get in Touch' : 'Contactar agora'}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="p-3 space-y-2">
              <a
                href={`tel:${SALES_CONTACT.phone}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Telefone</p>
                  <p className="text-sm font-medium text-gray-800">{SALES_CONTACT.phone}</p>
                </div>
              </a>
              <a
                href={`mailto:${SALES_CONTACT.email}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{SALES_CONTACT.email}</p>
                </div>
              </a>
              <a
                href={SALES_CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-800">{SALES_CONTACT.name}</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TechStat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100">
      <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
      <div>
        {value && <div className="text-xl font-bold text-gray-900">{value}</div>}
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function TechStatDk({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3 border border-gray-700">
      <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
      <div>
        {value && <div className="text-xl font-bold text-white">{value}</div>}
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  );
}

export default Services;
