import { useState, useEffect } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Target, Eye, Cog } from 'lucide-react';
import { localServices, aboudServices, aboudStats } from '../data/servicesData';

const Services = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ===== DADOS DOS SERVIÇOS LOCAIS =====
  // Os dados agora vêm do arquivo servicesData.ts

  // ===== DADOS DETALHADOS DA ABOUD CONSULTORIA =====
  // Os dados agora vêm do arquivo servicesData.ts

  // ===== AUTO SLIDER LOGIC =====
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % localServices.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, localServices.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % localServices.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + localServices.length) % localServices.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">
      {/* ===== SEÇÃO SLIDER DE SERVIÇOS LOCAIS ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Serviços Locais</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Aluguer de equipamentos industriais pesados com tecnologia de ponta, suporte técnico especializado e manutenção completa incluída.
            </p>
          </div>
          
          {/* SLIDER CONTAINER */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {localServices.map((service, index) => (
                  <div key={index} className="w-full flex-shrink-0 relative">
                    <div
                      className="h-96 md:h-[500px] bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${service.backgroundImage})` }}
                    >
                      {/* SUBTLE OVERLAY */}
                      <div className="absolute inset-0 bg-black/20"></div>
                      
                      {/* WHITE CARD OVERLAY (desktop e acima) */}
                      <div className="hidden md:flex absolute inset-0 items-center justify-end">
                        <div className="mx-8 md:mx-16 max-w-lg">
                          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm bg-white/95 transform transition-all duration-500 hover:scale-105 text-center max-w-sm">
                            {/* ICON */}
                            <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                              <service.icon className="h-8 w-8 text-blue-600" />
                            </div>
                            
                            {/* TITLE */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title.split(' ').slice(0, 2).join(' ')}</h3>
                            
                            {/* DESCRIPTION */}
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                              {service.title.includes('Tanques') && 'Aluguer de tanques especializados para armazenamento seguro de óleos pesados com diferentes capacidades.'}
                              {service.title.includes('Geradores') && 'Aluguer de geradores industriais de alta potência para garantir energia contínua em seus projetos.'}
                              {service.title.includes('Compressores') && 'Equipamentos de compressão industrial para diversas aplicações em projetos de grande escala.'}
                            </p>
                            
                            {/* FEATURES - SIMPLIFIED */}
                            <ul className="space-y-2 mb-6 text-left">
                              {service.title.includes('Tanques') && (
                                <>
                                   <li className="flex items-center text-sm text-gray-600">
                                     <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                     Diferentes capacidades
                                   </li>
                                   <li className="flex items-center text-sm text-gray-600">
                                     <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                     Sistemas de segurança
                                   </li>
                                   <li className="flex items-center text-sm text-gray-600">
                                     <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                     Manutenção incluída
                                   </li>
                                </>
                              )}
                              {service.title.includes('Geradores') && (
                                <>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Alta potência
                                  </li>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Operação contínua
                                  </li>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Suporte técnico 24/7
                                  </li>
                                </>
                              )}
                              {service.title.includes('Compressores') && (
                                <>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Tecnologia avançada
                                  </li>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Baixa manutenção
                                  </li>
                                  <li className="flex items-center text-sm text-gray-600">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Eficiência energética
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD (mobile) abaixo da imagem */}
                    <div className="md:hidden mt-4 px-4">
                      <div className="bg-white rounded-2xl shadow-xl p-5 backdrop-blur-sm bg-white/95 text-center max-w-md mx-auto animate-fade-in-up">
                        <div className="bg-blue-50 p-3 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                          <service.icon className="h-7 w-7 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{service.title.split(' ').slice(0, 2).join(' ')}</h3>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                          {service.title.includes('Tanques') && 'Aluguer de tanques especializados para armazenamento seguro de óleos pesados com diferentes capacidades.'}
                          {service.title.includes('Geradores') && 'Aluguer de geradores industriais de alta potência para garantir energia contínua em seus projetos.'}
                          {service.title.includes('Compressores') && 'Equipamentos de compressão industrial para diversas aplicações em projetos de grande escala.'}
                        </p>
                        <ul className="space-y-2 text-left">
                          {service.title.includes('Tanques') && (
                            <>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Diferentes capacidades
                              </li>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Sistemas de segurança
                              </li>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Manutenção incluída
                              </li>
                            </>
                          )}
                          {service.title.includes('Geradores') && (
                            <>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Alta potência
                              </li>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Operação contínua
                              </li>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Suporte técnico 24/7
                              </li>
                            </>
                          )}
                          {service.title.includes('Compressores') && (
                            <>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Tecnologia avançada
                              </li>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Baixa manutenção
                              </li>
                              <li className="flex items-center text-sm text-gray-600">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                Eficiência energética
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* NAVIGATION ARROWS */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* DOTS INDICATOR */}
            <div className="flex justify-center mt-8 space-x-3">
              {localServices.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO PARCERIA ABOUD - INTRODUÇÃO ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
              <Eye className="h-5 w-5 text-blue-900" />
              <span className="text-sm font-medium text-blue-900">Strategic Partnership</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Parceria Estratégica de Excelência</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Temos o <strong>imenso prazer e orgulho</strong> de anunciar nossa <strong>parceria estratégica bem consolidada</strong> 
                com a renomada <strong className="text-blue-900">Aboud Consultoria</strong>, uma empresa líder especializada em diferentes 
                áreas da indústria de hidrocarbonetos e geotérmica.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Esta aliança estratégica nos permite oferecer ao mercado angolano as mais avançadas soluções em engenharia de poços, 
                representações comerciais de marcas internacionais e programas de treinamento técnico de classe mundial.
              </p>
            </div>
            
            {/* VISUAL CONNECTION - Interactive and Responsive */}
            <div className="mb-12">
              <div className="relative max-w-3xl mx-auto">
                {/* Horizontal connector (md+) */}
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-12 w-full max-w-[520px] h-[3px] flowing-line rounded-full" aria-hidden="true" />

                {/* Vertical connector (mobile) */}
                <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-20 h-20 w-[3px] flowing-line-vert rounded-full" aria-hidden="true" />

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                  {/* Left brand */}
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

                  {/* Middle badge with interactive pulsate */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" aria-hidden="true"></div>
                        <div className="relative bg-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-full font-semibold shadow-lg select-none transform bottom-5">
                          PARCEIRO
                        </div>
                    </div>
              </div>
              
                  {/* Right brand */}
                  <div className="flex md:block items-center justify-center">
                    <div className="group text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                      <div className="relative inline-block">
                <img 
                  src="./src/assets/logo/aboudlogo.png" 
                  alt="Aboud Consultoria"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-100 mx-auto object-cover shadow-lg group-hover:scale-105 transition-transform"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-blue-700 text-[10px] px-2 py-0.5 rounded-full shadow md:hidden">Aboud</span>
                      </div>
                      <p className="hidden md:block font-semibold text-gray-900 mt-3">Aboud Consultoria</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* APRESENTAÇÃO DA ABOUD */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Sobre a Aboud Consultoria</h3>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  A Aboud Consultoria é formada por <strong>profissionais altamente especializados</strong> com 
                  <strong className="text-blue-900"> muitos anos de experiência internacional</strong> em diferentes 
                  áreas da indústria de hidrocarbonetos e geotérmica.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Target className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Missão</p>
                      <p className="text-gray-600 text-sm">Oferecer assessoria em engenharia de poços com ética, transparência e alto valor agregado</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Visão</p>
                      <p className="text-gray-600 text-sm">Ser reconhecida pela qualidade, valor agregado, ética e segurança de suas soluções</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://i.ytimg.com/vi/QUfiVbXX0R4/maxresdefault.jpg" 
                  alt="Equipe Aboud Consultoria"
                  className="rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
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
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
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
    </div>
  );
};

export default Services;