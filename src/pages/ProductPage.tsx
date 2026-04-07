// src/pages/ProductPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useActivityLog } from '../hooks/useActivityLog';
import {
  ShoppingCart, Shield,
  ChevronLeft, ChevronRight, Download, FileText,
  AlertCircle, Info, Zap, Settings, X, CheckCircle,
  PlayCircle, Phone, Mail, MessageSquare
} from 'lucide-react';

// ─── Dados de contacto comercial (hardcoded por agora) ────────────────────────
const SALES_CONTACT = {
  name: 'Mariam Silla',
  phone: '+244921400650',
  email: 'comercial@ymrindustrial.com',
  whatsapp: 'https://wa.me/244921400650',
};

// ===== TIPOS =====
interface ProductDocument {
  label: string;   // ex: "Manual PDF", "Vídeo"
  url: string;
  type: 'pdf' | 'video' | 'other';
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory_name?: string;
  brand?: string;
  model?: string;
  cod?: string;
  // ✅ availability vem directamente da BD — nunca inferido de is_active
  availability: string;
  image: string;
  images: string[];
  features: string[];
  // ✅ specificationsHtml: campo html da BD (formato {"html": "..."})
  specificationsHtml?: string;
  // ✅ documents normalizado para array internamente
  documents: ProductDocument[];
  price?: number;
}

// ===== HELPERS =====

/**
 * Normaliza o campo `documents` da BD para um array de ProductDocument.
 *
 * A BD guarda como objecto: { "file": "url.pdf", "video_url": "url" }
 * O componente precisa de um array uniforme para fazer .map().
 */
function normalizeDocuments(raw: any): ProductDocument[] {
  if (!raw) return [];

  // Se já for array (formato futuro), usa directamente
  if (Array.isArray(raw)) {
    return raw.map((d: any) => ({
      label: d.name || d.label || 'Documento',
      url: d.url || d.file || '',
      type: detectDocType(d.url || d.file || ''),
    }));
  }

  // Formato actual da BD: { file: "...", video_url: "..." }
  if (typeof raw === 'object') {
    const docs: ProductDocument[] = [];
    if (raw.file) {
      docs.push({ label: 'Manual / Ficha Técnica', url: raw.file, type: 'pdf' });
    }
    if (raw.video_url) {
      docs.push({ label: 'Vídeo do Produto', url: raw.video_url, type: 'video' });
    }
    return docs;
  }

  return [];
}

function detectDocType(url: string): 'pdf' | 'video' | 'other' {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  if (lower.includes('youtube') || lower.includes('youtu.be') || lower.endsWith('.mp4')) return 'video';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'other';
}

/**
 * Extrai o HTML de especificações do campo da BD.
 * Formato: { "html": "<ul>...</ul>" }  ou null
 */
function extractSpecificationsHtml(raw: any): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { return undefined; }
  }
  if (raw?.html) return raw.html as string;
  return undefined;
}

// ===== COMPONENTE TOAST =====
interface CartToastProps {
  isVisible: boolean;
  onClose: () => void;
  productName: string;
}

function CartToast({ isVisible, onClose, productName }: CartToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) return;
    setProgress(100);
    const startTime = Date.now();
    const duration = 3000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
      if (remaining === 0) { clearInterval(timer); onClose(); }
    }, 50);

    return () => clearInterval(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-[slideIn_0.3s_ease-out]">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Product added!</h4>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{productName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Link
          to="/cart"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-3"
        >
          View Cart →
        </Link>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-50 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
const ProductPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCartToast, setShowCartToast] = useState(false);
  const [productName, setProductName] = useState('');
  const [showContactModal, setShowContactModal] = useState<null | 'phone' | 'email' | 'whatsapp'>(null);
  const [contactRedirecting, setContactRedirecting] = useState(false);
  const [contactRedirectMsg, setContactRedirectMsg] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const { isAuthenticated } = useAuth();
  const { logActivity } = useActivityLog();

  // ===== CARREGAR PRODUTO =====
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/products/${id}`);
        const p = data?.data || data;

        const mapped: Product = {
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category_name || '',
          subcategory_name: p.subcategory_name || undefined,
          brand: p.brand_name || undefined,
          model: p.model || undefined,
          cod: p.code || undefined,
          // ✅ FIX: usa o campo real da BD, nunca infere de is_active
          availability: p.availability || 'Sob Encomenda',
          image: p.images?.[0] || '',
          images: Array.isArray(p.images) ? p.images : [],
          features: Array.isArray(p.features) ? p.features : [],
          // ✅ FIX: extrai HTML de especificações do formato {"html": "..."}
          specificationsHtml: extractSpecificationsHtml(p.specifications),
          // ✅ FIX: normaliza documents de objecto para array
          documents: normalizeDocuments(p.documents),
          price: p.price ?? undefined,
        };

        if (isMounted) {
          setProduct(mapped);
          setSelectedImage(0);
          setProductName(mapped.name);

          if (isAuthenticated) {
            await logActivity({
              activityType: 'product_viewed',
              title: `Visualizou ${mapped.name}`,
              description: `Usuário visualizou o produto ${mapped.name}`,
              metadata: { productId: mapped.id, productName: mapped.name }
            });
          }
        }
      } catch (e: any) {
        if (isMounted) { setError(e.message || 'Erro ao carregar produto'); setProduct(null); }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [id, isAuthenticated, logActivity]);

  // ===== ADICIONAR AO CARRINHO =====
  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      await addToCartContext({
        productId: product.id,
        quantity,
        name: product.name,
        category: product.category,
        // ✅ FIX: sem fallbacks hardcoded — se não existir na BD é undefined
        brand: product.brand,
        model: product.model,
        cod: product.cod,
        availability: product.availability,
        image: product.image,
        description: product.description,
        features: product.features,
        price: product.price ?? 0,
      });

      setProductName(product.name);
      setShowCartToast(true);

      if (isAuthenticated) {
        await logActivity({
          activityType: 'cart_updated',
          title: 'Produto adicionado ao carrinho',
          description: `${product.name} foi adicionado ao carrinho`,
          metadata: { productId: product.id, productName: product.name, quantity }
        });
      }
    } catch (e: any) {
      console.error('Erro ao adicionar ao carrinho:', e.message);
    }
  }, [product, quantity, addToCartContext, isAuthenticated, logActivity]);

  // ===== GALERIA =====
  const gallery = product?.images?.length ? product.images : product ? [product.image] : [''];
  const nextImage = () => setSelectedImage(prev => (prev + 1) % gallery.length);
  const prevImage = () => setSelectedImage(prev => (prev - 1 + gallery.length) % gallery.length);

  // ===== DOWNLOAD / ABRIR DOCUMENTO =====
  const handleOpenDocument = async (doc: ProductDocument) => {
    if (!product) return;
    window.open(doc.url, '_blank');
    if (isAuthenticated) {
      await logActivity({
        activityType: 'document_downloaded',
        title: 'Documento acedido',
        description: `Acedeu ao documento "${doc.label}" do produto ${product.name}`,
        metadata: { productId: product.id, documentUrl: doc.url }
      }).catch(console.error);
    }
  };

  // ===== CONTACT HANDLER =====
  const handleContact = async (type: 'phone' | 'email' | 'whatsapp') => {
    setShowContactModal(null);
    setContactRedirecting(true);
    const labels = { phone: 'Telefone', email: 'E-mail', whatsapp: 'WhatsApp' };
    setContactRedirectMsg(`Encaminhando para ${labels[type]} da nossa Assistente Comercial ${SALES_CONTACT.name}...`);

    // 3s delay para mostrar a mensagem
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (type === 'phone') {
      window.location.href = `tel:${SALES_CONTACT.phone}`;
    } else if (type === 'email') {
      window.location.href = `mailto:${SALES_CONTACT.email}`;
    } else {
      window.open(SALES_CONTACT.whatsapp, '_blank');
    }
    setContactRedirecting(false);
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen page-content bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // ===== ERRO =====
  if (error || !product) {
    return (
      <div className="min-h-screen page-content bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error || 'Produto não encontrado'}</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const availabilityColor =
    product.availability === 'Em Estoque'    ? 'bg-green-100 text-green-700' :
    product.availability === 'Sob Encomenda' ? 'bg-blue-100 text-blue-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="min-h-screen page-content bg-white">
      <CartToast isVisible={showCartToast} onClose={() => setShowCartToast(false)} productName={productName} />

      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-gray-700 transition-colors">Products</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-700 transition-colors">
                  {product.category}
                </Link>
              </>
            )}
            {product.subcategory_name && (
              <>
                <span>/</span>
                <Link to={`/products?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory_name)}`} className="hover:text-gray-700 transition-colors">
                  {product.subcategory_name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[40vw] sm:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* GALERIA */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {gallery[selectedImage] ? (
                <img src={gallery[selectedImage]} alt={product.name} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100 text-gray-400">
                  Image not available
                </div>
              )}
              {gallery.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all">
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {gallery.map((_, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)} className={`w-2 h-2 rounded-full transition-all ${selectedImage === i ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.map((image, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={image} alt={`${product.name} ${i + 1}`} className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO DO PRODUTO */}
          <div className="space-y-6">
            <div>
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                {product.category && <span>{product.category}</span>}
                {product.cod && <><span>•</span><span>Cód: {product.cod}</span></>}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-sm px-2 py-1 rounded-full font-medium ${availabilityColor}`}>
                  {product.availability}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Quantidade + Botões */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors">-</button>
                    <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors">+</button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.availability === 'Indisponível'}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.availability === 'Indisponível' ? 'Indisponível' : 'Adicionar ao Carrinho'}
                  </button>
                  <button
                    onClick={() => setShowContactModal('phone')}
                    className="p-3 rounded-lg border border-gray-300 text-green-600 hover:bg-gray-50 transition-colors"
                    title="Ligar à Assistente Comercial"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowContactModal('email')}
                    className="p-3 rounded-lg border border-gray-300 text-blue-600 hover:bg-gray-50 transition-colors"
                    title="Enviar e-mail"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowContactModal('whatsapp')}
                    className="p-3 rounded-lg border border-gray-300 text-emerald-600 hover:bg-gray-50 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info de entrega — só renderiza se houver dados reais do produto */}
            {(product.brand || product.model) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {product.brand && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Shield className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Manufacturer: <strong>{product.brand}</strong></span>
                  </div>
                )}
                {product.model && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Settings className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Model: <strong>{product.model}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ABAS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: 'overview',        label: 'Overview' },
                { id: 'specifications',  label: 'Specifications' },
                { id: 'documents',       label: 'Documentations' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">

            {/* ABA VISÃO GERAL */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Product</h2>
                  <div className="text-gray-600 space-y-2">
                    <p>{product.description}</p>
                    {product.brand && <p><strong className="text-gray-700">Manufacturer:</strong> {product.brand}</p>}
                    {product.model && <p><strong className="text-gray-700">Model:</strong> {product.model}</p>}
                  </div>
                </div>

                {/* Features como cards */}
                {product.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {product.features.slice(0, 6).map((feature, i) => (
                        <div key={i} className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                          <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA ESPECIFICAÇÕES */}
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Technical Specifications</h2>

                {/* Informações gerais (sempre presentes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">General Information</h3>
                    <div className="space-y-3">
                      {product.cod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Code:</span>
                          <span className="font-medium text-gray-900">{product.cod}</span>
                        </div>
                      )}
                      {product.model && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium text-gray-900">{product.model}</span>
                        </div>
                      )}
                      {product.brand && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Manufacturer:</span>
                          <span className="font-medium text-gray-900">{product.brand}</span>
                        </div>
                      )}
                      {product.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900">{product.category}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Availability:</span>
                        <span className={`font-medium ${
                          product.availability === 'Em Estoque' ? 'text-green-600' :
                          product.availability === 'Sob Encomenda' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {product.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ✅ FIX: renderiza HTML das especificações directamente da BD */}
                  {product.specificationsHtml ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-4">Technical Details</h3>
                      <div
                        className="prose prose-sm max-w-none text-gray-700
                          [&_ul]:space-y-1 [&_li]:text-sm [&_strong]:text-gray-900"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.specificationsHtml) }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center text-center text-gray-500">
                      <div>
                        <Settings className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Technical details not available</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
                      <p className="text-sm text-yellow-700">
                        The specifications may vary depending on the requested configuration.
                        Please contact our technical team for specific customization options for your project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA DOCUMENTAÇÕES */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Documentations</h2>
                  <p className="text-gray-600">
                    Access all technical documents, manuals and resources for the product.
                  </p>
                </div>

                {product.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.documents.map((doc, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                              {doc.type === 'video'
                                ? <PlayCircle className="h-5 w-5 text-red-600" />
                                : <FileText className="h-5 w-5 text-gray-600" />
                              }
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 text-sm">{doc.label}</h3>
                              <p className="text-xs text-gray-500 uppercase">{doc.type}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenDocument(doc)}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {doc.type === 'video' ? <><PlayCircle className="h-4 w-4" />View</> : <><Download className="h-4 w-4" />Download</>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No documents available for this product</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Need more information?</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Our technical team can provide additional customized documentation for your specific project.
                      </p>
                      <button
                        onClick={() => setShowContactModal('phone')}
                        className="text-blue-700 hover:text-blue-800 font-medium text-sm underline"
                      >
                        Contact Sales
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CONTACTO */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowContactModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Contact Commercial Assistant
            </h3>
            <p className="text-gray-600 mb-6">
              Do you want to contact our commercial assistant?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleContact(showContactModal as 'phone' | 'email' | 'whatsapp')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowContactModal(null)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE REDIRECT */}
      {contactRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-900 font-medium">{contactRedirectMsg}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ProductPage;