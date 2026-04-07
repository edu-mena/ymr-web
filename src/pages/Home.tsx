import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider'; 
//import AdSlider from '../components/AdSlider';
import ProductMiniSlider from '../components/ProductMiniSlider';
import NewsCarousel from '../components/NewsCarousel';
import AsideVerticalSlider from '../components/AsideVerticalSlider';
import PromoPopup from "../components/PromoPopup";
import AsideNewsletter from "../components/AsideNewsletter";
import AsideGif from "../components/AsideGif";
import { usePromoPopup } from "../hooks/usePromoPopup";
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Wrench, Shield, Cog } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { heroSlides } from '../data/heroSlides';
//import { adSlides } from "../data/adSlides";
import { apiFetch } from '../services/api';
import { features } from "../data/features";
import { gif } from "../data/gif";

const Home = () => {
  // ===== SLIDER STATE =====
  const [currentSlide, setCurrentSlide] = useState(0);
  const { open, close } = usePromoPopup(8000);
  const [categories, setCategories] = useState<{ id: string; name: string; image?: string }[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  // ===== SLIDER CONTROL FUNCTIONS =====
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // ===== SLIDER AUTO-PLAY =====
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCats(true);
      setCatsError(null);
      try {
        // Calls the new /categories route from the PHP API
        const res = await apiFetch('/categories', { noAuth: true });
        const categoriesData = res?.data || [];
        
        // Maps to the format expected by the component
        const formattedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          image: cat.image_url || undefined,
        }));
        
        setCategories(formattedCategories);
      } catch (e: any) {
        console.error('Error loading categories:', e);
        setCatsError(e.message || 'Failed to load categories');
      } finally {
        setIsLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen page-content bg-white">
      {/* ===== POPUP PROMOCIONAL ===== */}
      <PromoPopup open={open} onClose={close} />

      {/* ===== SEÇÃO HERO - SLIDER MODERNO ===== */}
      <HeroSlider slides={heroSlides as any} heightClass="h-[60vh] md:h-[70vh]" />

      {/* ===== SEÇÃO PRODUTOS E ASIDE ===== */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Layout Flex para Desktop e Stack para Mobile */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            <div className="flex-1 min-w-0">
              {/* ===== SEÇÃO "POR QUE ESCOLHER A YMR" ===== */}
              <section className="py-8 md:py-10 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                      Why Choose YMR Industrial?
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                      We combine quality products with exceptional service to support your industrial needs.
                    </p>
                  </div>
                  
                  <div className="grid justify-center grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4 md:gap-[30px]">
                    {features.map((feature, index) => (
                      <div 
                        key={feature.title} 
                        className="text-center animate-fade-in-up h-full"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md card-hover h-full flex flex-col">
                          <div className="bg-gray-100 p-4 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center flex-shrink-0">
                            <feature.icon className="h-8 w-8 text-blue-900" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                          <p className="text-gray-600 flex-grow">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </section>

              {/* ===== BANNER SERVIÇOS ===== */}
              <Link
                to="/services"
                className="block group bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 my-8"
              >
                <div className="px-6 py-8 md:px-8 md:py-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-1">
                        Our Services
                      </h3>
                      <p className="text-gray-900 text-sm md:text-base">
                        Complete maintenance, technical support and equipment rental solutions.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-blue-400 group-hover:text-blue-300 text-sm font-semibold flex-shrink-0">
                      Learn more
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                      <div className="bg-blue-600/20 rounded-lg p-2.5 flex-shrink-0">
                        <Wrench className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Maintenance</p>
                        <p className="text-xs">Preventive and corrective maintenance</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                      <div className="bg-green-600/20 rounded-lg p-2.5 flex-shrink-0">
                        <Shield className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Technical Support</p>
                        <p className="text-xs">Certified team available 24/7</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                      <div className="bg-orange-600/20 rounded-lg p-2.5 flex-shrink-0">
                        <Cog className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Equipment Rental</p>
                        <p className="text-xs">Compressors, generators and more</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* ==== título ==== */}
              <div className="text-left mb-10 md:mb-16">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mt-6 md:mt-10">
                  Categories
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                { /*Discover our most popular industrial solutions trusted by professionals.*/ }
                </p>
              </div>
              {/* Produtos - Principal */}
              <div className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[30px]">
                  {isLoadingCats && (
                    <div className="text-gray-600">Loading categories...</div>
                  )}
                  {catsError && (
                    <div className="text-red-600">{catsError}</div>
                  )}
                  {!isLoadingCats && !catsError && categories.map((category, index) => (
                    <div 
                      key={category.name}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard 
                        name={category.name}
                        image={category.image || `https://via.placeholder.com/300x300?text=${encodeURIComponent(category.name)}`}
                        category={category.name}
                        to={`/products?category=${encodeURIComponent(category.name)}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8 md:mt-12">
                  <Link to="/products" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                    View All Products
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Aside Publicitário - Desktop */}
            <aside className="hidden lg:block min-w-[320px] max-w-xs lg:flex-shrink-0 space-y-6">
              
              {/* 5. NEWSLETTER SIGNUP */}
              <AsideNewsletter/>
              
              {/* 1. PRODUTOS EM SLIDE */}
              <ProductMiniSlider useApi={true} limit={3} />

              {/* 1.2. BANNER ANIMADO COM GIF */}
              <AsideGif img={gif.img} title={gif.title}/>

              {/* 2. NOTÍCIAS SLIDE */}
              <NewsCarousel />
              
              {/* 6 SLIDER VERTICAL DE IMAGENS */}
              <AsideVerticalSlider images={[
                'https://ymrindustrial.com/assets/aside/wtl.png',
                'https://ymrindustrial.com/assets/aside/04.png',
                'https://ymrindustrial.com/assets/aside/jetlubes.png'
                ]} 
              />
              
              {/*<AdSlider slides={adSlides} />*/}
            </aside>
          </div>
        </div>
      </section>

      {/* Bloco do Aside abaixo do conteúdo em Mobile/Tablet */}
      <section className="py-8 bg-white lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Notícias, Newsletter e Produtos em Destaque */}
            <AsideNewsletter />
            <ProductMiniSlider useApi={true} limit={3} />
            <NewsCarousel />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;