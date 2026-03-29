import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Package,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { apiFetch } from '../services/api';
import { useLocation } from 'react-router-dom';

import { productSlides } from "../data/productSlides";
import { gif } from "../data/gif";
import AsideGif from "../components/AsideGif";
import ProductMiniSlider from '../components/ProductMiniSlider';
import AsideVerticalSlider from '../components/AsideVerticalSlider';

const Products = () => {
  // ===== ESTADOS PRINCIPAIS =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubcategoriesExpanded, setIsSubcategoriesExpanded] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const location = useLocation();

  // Atualiza estado com base na URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const search = params.get('search');
    
    if (cat) {
      setSelectedCategory(cat);
      setSelectedSubcategory('');
    }
    
    if (search) {
      setSearchTerm(search);
    }
  }, [location.search]);

  // ===== CARREGAR PRODUTOS (ÚNICA REQUISIÇÃO) =====
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        // ÚNICA REQUISIÇÃO À API
        const res = await apiFetch('/products?limit=100', { noAuth: true });
        const list: any[] = res?.data || [];
        
        // Mapeia diretamente os dados da API
        const mapped: Product[] = list.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category_name || 'Categoria',
          subcategory_name: p.subcategory_name || 'Subcategoria',
          brand: p.brand?.name,
          model: p.model,
          cod: p.code,
          availability: p.is_active ? 'Em Estoque' : 'Indisponível',
          image: p.images?.[0] || 'https://via.placeholder.com/300x300?text=Produto',
          images: p.images || [],
          features: p.features,
          price: p.price,
        }));
        
        setItems(mapped);
        setIsDataReady(true);
      } catch (e: any) {
        setError(e.message || 'Falha ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // ===== CÁLCULO DE CATEGORIAS ÚNICAS =====
  const uniqueCategories = useMemo(() => {
    const cats = new Set(items.map(p => p.category));
    cats.delete('Categoria');
    return ['All', ...Array.from(cats).sort()];
  }, [items]);

  // ===== SUBCATEGORIAS DA CATEGORIA SELECIONADA =====
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const subs = new Set(
      items
        .filter(p => p.category === selectedCategory && p.subcategory_name !== 'Subcategoria')
        .map(p => p.subcategory_name)
    );
    return Array.from(subs).sort();
  }, [items, selectedCategory]);

  // ===== FILTRAGEM FINAL =====
  const filteredProducts = useMemo(() => {
    if (!isDataReady) return [];
    
    return items.filter(product => {
      // Busca
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Categoria
      const matchesCategory = selectedCategory === 'All' || 
        product.category === selectedCategory;

      // Subcategoria
      const matchesSubcategory = !selectedSubcategory || 
        product.subcategory_name === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [items, searchTerm, selectedCategory, selectedSubcategory, isDataReady]);

  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">
      
      {/* ===== SECÇÃO GRADE DE PRODUTOS ===== */}
      <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="w-full px-2 md:px-4 flex flex-col lg:flex-row gap-6 md:gap-8">
            <div className="flex-1 min-w-0 lg:max-w-[1000px]">

              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
                  <Package className="h-5 w-5 text-blue-900" />
                  <span className="text-sm font-medium text-blue-900">Resultados da Busca</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 md:p-6 max-w-2xl mx-auto">
                  <p className="text-base md:text-lg font-semibold text-gray-900">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </p>
                  {selectedCategory !== 'All' && (
                    <p className="text-gray-600 mt-1 text-sm md:text-base">na categoria <span className="font-medium text-blue-600">{selectedCategory}</span></p>
                  )}
                  {searchTerm && (
                    <p className="text-gray-600 mt-1 text-sm md:text-base">correspondendo a <span className="font-medium text-blue-600">"{searchTerm}"</span></p>
                  )}
                </div>
              </div>

              {!isDataReady ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center space-x-3 bg-blue-50 rounded-2xl px-8 py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-xl text-blue-600 font-medium">Carregando catálogo...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-red-600 mb-4">
                      <Package className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-xl text-red-600 font-medium">{error}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-xl text-gray-600 font-medium mb-2">
                      Nenhum produto encontrado
                    </p>
                    <p className="text-gray-500">
                      Tente ajustar seus critérios de busca
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard 
                        id={product.id} 
                        name={product.name} 
                        image={product.image} 
                        category={product.category} 
                        to={`/product/${product.id}`} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aside Publicitário - Desktop */}
            <aside className="hidden lg:block min-w-[320px] max-w-xs lg:flex-shrink-0 space-y-6">
              
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* ===== HEADER ===== */}
                <div className="bg-[#e6e6e6] dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 p-4 border-b dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Filtros
                  </h3>
                  {/* ===== CONTEÚDO DOS FILTROS ===== */}
                  <div className="pt-5 space-y-4">
                    
                    {/* Campo de Busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                  placeholder-gray-400 dark:placeholder-gray-500
                                  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                  transition-all duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filtro por Categoria */}
                    <div className="space-y-2">
                      <select
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                  transition-all duration-200 cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcategory('');
                        }}
                      >
                        <option value="">Todas as categorias</option>
                        {uniqueCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Lista de Subcategorias */}
                    {filteredSubcategories.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Subcategorias
                          </label>
                          <button
                            onClick={() => setIsSubcategoriesExpanded(!isSubcategoriesExpanded)}
                            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            {isSubcategoriesExpanded ? 'Recolher' : 'Expandir'}
                            {isSubcategoriesExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {/* Pills de Subcategorias com animação */}
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isSubcategoriesExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {filteredSubcategories.map((subcategory, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  setSelectedSubcategory(
                                    selectedSubcategory === subcategory ? '' : (subcategory ?? '')
                                  )
                                }
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 
                                          hover:scale-[1.02] active:scale-[0.98]
                                          ${
                                            selectedSubcategory === subcategory
                                              ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-700'
                                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                          }`}
                              >
                                {subcategory}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botão Limpar Filtros (aparece quando há filtros ativos) */}
                    {(searchTerm || selectedCategory || selectedSubcategory) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('');
                          setSelectedSubcategory('');
                        }}
                        className="bg-blue-900 w-full py-2 text-sm text-white flex items-center justify-center gap-2 duration-200 rounded-lg hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* 1. PRODUTOS EM SLIDE */}
              <ProductMiniSlider useApi={true} limit={3} />

              {/* 1.2. BANNER ANIMADO COM GIF */}
              <AsideGif img={gif.img} title={gif.title}/>
              
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

      {/* Produtos em Destaque abaixo (mobile/tablet) */}
      <section className="lg:hidden py-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Produtos em Destaque</h3>
            <ProductMiniSlider slides={productSlides} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;