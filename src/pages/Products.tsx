import { useEffect, useState, useCallback } from 'react';
import {
  Search, Filter, Package,
  ChevronDown, ChevronUp, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { apiFetch } from '../services/api';
import { useLocation } from 'react-router-dom';

import { gif } from "../data/gif";
import { productSlides } from "../data/productSlides";
import AsideGif from "../components/AsideGif";
import ProductMiniSlider from '../components/ProductMiniSlider';
import AsideVerticalSlider from '../components/AsideVerticalSlider';

const LIMIT = 42;

// ─── Componente de Paginação ──────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      {/* Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>

      {/* Números */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 border ${
              p === currentPage
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Próximo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        Próximo
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
const Products = () => {
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [isSubcategoriesExpanded, setIsSubcategoriesExpanded] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Produtos
  const [items, setItems]       = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Paginação
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalItems, setTotalItems]     = useState(0);

  // Categorias (carregadas separadamente)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);

  const location = useLocation();

  // ── Ler URL params na entrada ──────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) setSearchTerm(search);
  }, [location.search]);

  // Aplica categoria da URL assim que a lista de categorias estiver carregada
  useEffect(() => {
    if (categories.length === 0) return; // aguarda carregar
    const params = new URLSearchParams(location.search);
    const categoryName = params.get('category');
    if (!categoryName) return;
    const found = categories.find(
      c => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (found) setSelectedCategory(found);
  }, [categories, location.search]);


  // ── Carregar categorias uma vez ────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/categories', { noAuth: true })
      .then(res => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // ── Carregar subcategorias quando muda categoria ───────────────────────────
  useEffect(() => {
    if (!selectedCategory) { setSubcategories([]); return; }
    apiFetch(`/subcategories?category_id=${selectedCategory.id}`, { noAuth: true })
      .then(res => setSubcategories(res.data || []))
      .catch(() => setSubcategories([]));
    setSelectedSubcategory('');
  }, [selectedCategory]);

  // ── Carregar produtos ──────────────────────────────────────────────────────
  const loadProducts = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    const offset = (page - 1) * LIMIT;

    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
    if (searchTerm)              params.append('search',        searchTerm);
    if (selectedCategory)        params.append('categoryId',    selectedCategory.id);
    if (selectedSubcategory)     params.append('subcategoryId', selectedSubcategory);

    try {
      const res = await apiFetch(`/products?${params.toString()}`, { noAuth: true });
      const list: any[] = res?.data || [];

      const mapped: Product[] = list.map(p => ({
        id:               p.id,
        name:             p.name,
        description:      p.description || '',
        category:         p.category_name || 'Categoria',
        subcategory_name: p.subcategory_name || '',
        brand:            p.brand_name,
        model:            p.model,
        cod:              p.code,
        availability:     p.is_active ? 'Em Estoque' : 'Indisponível',
        image:            p.images?.[0] || 'https://via.placeholder.com/300x300?text=Produto',
        images:           p.images || [],
        features:         p.features,
        price:            p.price,
      }));

      setItems(mapped);
      setTotalPages(res.pagination?.total_pages  ?? 1);
      setTotalItems(res.pagination?.total        ?? mapped.length);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedSubcategory]);

  // Recarrega sempre que filtros mudam (volta à pág. 1)
    useEffect(() => {
    // Só carrega produtos depois de saber se há categoria na URL para aplicar
    const params = new URLSearchParams(location.search);
    const categoryName = params.get('category');
    // Se a URL tem categoria mas as categorias ainda não carregaram, aguarda
    if (categoryName && categories.length === 0) return;
    loadProducts(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, categories.length]);

  const handlePageChange = (page: number) => loadProducts(page);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSubcategory('');
  };

  const hasActiveFilters = !!(searchTerm || selectedCategory || selectedSubcategory);

  return (
    <div className="min-h-screen page-content bg-white dark:bg-gray-900">

      <section className="py-8 md:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full px-2 md:px-4 flex flex-col lg:flex-row gap-6 md:gap-8">

            {/* ── Área de produtos ── */}
            <div className="flex-1 min-w-0 lg:max-w-[1000px]">

              {/* ── Mobile: Filtros toggle bar ── */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsMobileFiltersOpen(v => !v)}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
                >
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {[searchTerm, selectedCategory, selectedSubcategory].filter(Boolean).length}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 ml-auto text-gray-400 transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Mobile filter panel */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isMobileFiltersOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-4 space-y-4">

                    {/* Busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Categorias */}
                    <select
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                      value={selectedCategory?.id ?? ''}
                      onChange={e => {
                        const found = categories.find(c => c.id === e.target.value) ?? null;
                        setSelectedCategory(found);
                      }}
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>

                    {/* Subcategorias */}
                    {subcategories.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Subcategorias
                        </label>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {subcategories.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubcategory(selectedSubcategory === sub.id ? '' : sub.id)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                selectedSubcategory === sub.id
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Limpar */}
                    {hasActiveFilters && (
                      <button
                        onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                        className="w-full py-2 text-sm text-white bg-blue-900 flex items-center justify-center gap-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contador */}
              <div className="flex items-center justify-between mb-6 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-900" />
                  <span className="font-medium text-gray-900">
                    {isLoading ? '...' : `${totalItems} ${totalItems === 1 ? 'produto' : 'produtos'}`}
                  </span>
                  {selectedCategory && <span className="text-gray-500">• {selectedCategory.name}</span>}
                  {searchTerm       && <span className="text-gray-500">• "{searchTerm}"</span>}
                </div>
                {totalPages > 1 && (
                  <span className="text-gray-400 text-xs">
                    Página {currentPage} de {totalPages}
                  </span>
                )}
              </div>

              {/* Estados */}
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center space-x-3 bg-blue-50 rounded-2xl px-8 py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <p className="text-xl text-blue-600 font-medium">Carregando catálogo...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
                    <Package className="h-12 w-12 mx-auto text-red-400 mb-4" />
                    <p className="text-xl text-red-600 font-medium">{error}</p>
                    <button
                      onClick={() => loadProducts(currentPage)}
                      className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                    <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-600 font-medium mb-2">Nenhum produto encontrado</p>
                    <p className="text-gray-500">Tente ajustar os critérios de busca</p>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline text-sm">
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {items.map((product, index) => (
                      <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.03}s` }}>
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

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>

            {/* ── Aside ── */}
            <aside className="hidden lg:block min-w-[320px] max-w-xs lg:flex-shrink-0 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[#e6e6e6] dark:bg-gray-800 p-4 border-b dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filtros
                  </h3>

                  <div className="pt-5 space-y-4">

                    {/* Busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Categorias */}
                    <div>
                      <select
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        value={selectedCategory?.id ?? ''}
                        onChange={e => {
                          const found = categories.find(c => c.id === e.target.value) ?? null;
                          setSelectedCategory(found);
                        }}
                      >
                        <option value="">Todas as categorias</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategorias */}
                    {subcategories.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Subcategorias
                          </label>
                          <button
                            onClick={() => setIsSubcategoriesExpanded(v => !v)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {isSubcategoriesExpanded ? 'Recolher' : 'Expandir'}
                            {isSubcategoriesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${isSubcategoriesExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {subcategories.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedSubcategory(selectedSubcategory === sub.id ? '' : sub.id)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                  selectedSubcategory === sub.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Limpar */}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="bg-blue-900 w-full py-2 text-sm text-white flex items-center justify-center gap-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <ProductMiniSlider useApi={true} limit={3} />
              <AsideGif img={gif.img} title={gif.title} />
              <AsideVerticalSlider images={[
                'https://ymrindustrial.com/assets/aside/wtl.png',
                'https://ymrindustrial.com/assets/aside/04.png',
                'https://ymrindustrial.com/assets/aside/jetlubes.png'
              ]} />
            </aside>

          </div>
        </div>
      </section>

      {/* Mobile destaque */}
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