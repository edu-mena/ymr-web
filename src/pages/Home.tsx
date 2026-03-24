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
import { ArrowRight, Download } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { heroSlides } from '../data/heroSlides';
//import { adSlides } from "../data/adSlides";
import { apiFetch } from '../services/api';
import { features } from "../data/features";
import { gif } from "../data/gif";

const Home = () => {
  // ===== ESTADO DO SLIDER =====
  const [currentSlide, setCurrentSlide] = useState(0);
  const { open, close } = usePromoPopup(8000);
  const [categories, setCategories] = useState<{ id: string; name: string; image?: string }[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  // ===== FUNÇÕES DE CONTROLE DO SLIDER =====
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // ===== AUTO-PLAY DOS SLIDERS =====
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
        // Chama a nova rota /categories da API PHP
        const res = await apiFetch('/categories', { noAuth: true });
        const categoriesData = res?.data || [];
        
        // Mapeia para o formato esperado pelo componente
        const formattedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          image: cat.image_url || undefined,
        }));
        
        setCategories(formattedCategories);
      } catch (e: any) {
        console.error('Erro ao carregar categorias:', e);
        setCatsError(e.message || 'Falha ao carregar categorias');
      } finally {
        setIsLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">
      {/* ===== POPUP PROMOCIONAL ===== */}
      <PromoPopup open={open} onClose={close} />

      {/* ===== SEÇÃO HERO - SLIDER MODERNO ===== */}
      <HeroSlider slides={heroSlides as any} heightClass="h-[60vh] md:h-[70vh]" />

      {/* ===== SEÇÃO PRODUTOS E ASIDE ===== */}
      <section className="py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Layout Flex para Desktop e Stack para Mobile */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            <div className="flex-1 min-w-0">
              {/* ===== SEÇÃO "POR QUE ESCOLHER A YMR" ===== */}
              <section className="py-8 md:py-10 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      Why Choose YMR Industrial?
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
                    <div className="text-gray-600">Carregando categorias...</div>
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
      <section className="py-8 bg-white dark:bg-gray-900 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Notícias, Newsletter e Produtos em Destaque */}
            <AsideNewsletter />
            <ProductMiniSlider useApi={true} limit={3} />
            <NewsCarousel />
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO CALL-TO-ACTION ===== */}
      <section className="section-padding py-10 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Download our comprehensive product catalog with specifications, certifications, and technical sheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog" className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2">
              <Download className="h-5 w-5" />
              Download PDF Catalog
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors duration-200">
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;