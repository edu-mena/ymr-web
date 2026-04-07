// src/components/ProductMiniSlider/index.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ProductSlide, Product } from "../../types";
import { useAutoSlide } from "../../hooks/useAutoSlide";
import { apiFetch } from "../../services/api";

import { ArrowRight, TrendingUp } from 'lucide-react';

type Props = { 
  slides?: ProductSlide[]; 
  delay?: number;
  useApi?: boolean;
  limit?: number;
};

export default function ProductMiniSlider({ 
  slides, 
  delay = 4000, 
  useApi = false, 
  limit = 3 
}: Props) {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos da API se useApi for true
  useEffect(() => {
    if (!useApi) return;
    
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/products?limit=${limit}&isActive=true`, { noAuth: true });
        const data = response?.data || response;
        const products = Array.isArray(data) ? data : data?.products || [];
        
        const mappedProducts: Product[] = products.map((p: any) => ({
          id: p.id || p._id || String(p.code || p.name),
          name: p.name,
          description: p.description || '',
          category: p?.subcategory?.category?.name || p?.category?.name || 'Categoria',
          subcategory_name: p?.subcategory?.name,
          brand: p?.brand?.name,
          model: p?.model,
          cod: p?.code,
          availability: p?.isActive ? 'Em Estoque' : 'Indisponível',
          image: p?.images?.[0] || p?.thumbnail || 'https://via.placeholder.com/300x300?text=Produto',
          images: p?.images || (p?.thumbnail ? [p.thumbnail] : undefined),
          features: p?.features,
          price: p?.price,
        }));
        
        setApiProducts(mappedProducts);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Erro ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [useApi, limit]);

  // Usar produtos da API ou slides estáticos
  const displayProducts = useApi ? apiProducts : (slides || []);
  
  const { index, pause, resume } = useAutoSlide(displayProducts.length, delay, false);

  return (<>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-[#e6e6e6] p-4">
        <h3 className="font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Featured Products
        </h3>
        <div className="relative h-48 w-full" onMouseEnter={pause} onMouseLeave={resume}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-sm">Loading products...</div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-red-300 text-sm">{error}</div>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-300 text-sm">No products found</div>
            </div>
          ) : (
            displayProducts.map((p, i) => (
            <div key={p.id} className={`absolute inset-0 p-2 transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <Link 
                to={`/product/${p.id}`}
                className="block h-full group cursor-pointer"
                title={`Ver detalhes de ${p.name}`}
              >
                <div className="relative h-full">
                  {('badge' in p) && p.badge && (
                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-1 py-1 rounded">
                      {p.badge}
                    </span>
                  )}
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-[11rem] object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy" 
                  />
                  <div className="px-1">
                    <h4 className="font-semibold text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {p.name}
                    </h4>
                  </div>
                </div>
              </Link>
            </div>
            ))
          )}
        </div>
        <div className="flex justify-center py-3 gap-2">
          <div className="p-4 py-1 pt-0">
            <Link 
              to="/products"
              className="w-full mt-[2rem] bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              See More Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>   
      </div> 
    </div>
      </>
  );
}