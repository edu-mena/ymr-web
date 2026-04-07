import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, X, ArrowRight, Menu, Settings, Home, Mail, Info, Wrench, BookOpen, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../services/api';

// ===== GLOBAL TYPE DECLARATION =====
declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: unknown;
        getElement?: (id: string) => unknown;
      };
    };
  }
}

// ===== HELPER: ACIONAR O GOOGLE TRANSLATE =====
function triggerGoogleTranslate(targetLang: string, attempts = 0) {
  const MAX_ATTEMPTS = 20;

  const googleSelect = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  const isApiReady =
    typeof window.google !== 'undefined' &&
    typeof window.google.translate !== 'undefined' &&
    typeof window.google.translate.TranslateElement !== 'undefined';

  if (googleSelect && isApiReady) {
    if (targetLang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;

      googleSelect.value = '';
      googleSelect.dispatchEvent(new Event('change'));

      localStorage.setItem('ymr_language', 'en');
      sessionStorage.setItem('googtrans_disabled', 'true');
      setTimeout(() => window.location.reload(), 100);
    } else {
      const cookieValue = `/en/${targetLang}`;
      document.cookie = `googtrans=${cookieValue}; path=/`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;

      googleSelect.value = targetLang;
      googleSelect.dispatchEvent(new Event('change'));
    }
  } else if (attempts < MAX_ATTEMPTS) {
    setTimeout(() => triggerGoogleTranslate(targetLang, attempts + 1), 300);
  } else {
    console.warn('[i18n] Google Translate widget not ready after maximum attempts.');
  }
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState<number>(-1);
  const searchItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const [cartBump, setCartBump] = useState(false);
  const [isDrawerReady, setIsDrawerReady] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };
    const googtrans = getCookie('googtrans');
    if (googtrans && googtrans.includes('/pt')) {
      setLanguage('pt');
    } else {
      setLanguage('en');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setShowSearchDropdown(false);
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const res = await apiFetch('/categories?isActive=true&limit=100', { noAuth: true });
        const categoriesData = res?.data || res || [];

        const categoriesList = (categoriesData || []).map((cat: any) => ({
          id: String(cat.id || cat.category_id || cat._id || cat.value || ''),
          name: cat.name || cat.category_name || 'Categoria sem nome',
        })).filter((cat: any) => cat.id && cat.name);

        if (categoriesList.length > 0) {
          setCategories(categoriesList);
        } else {
          throw new Error('Não foram encontradas categorias válidas');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Erro ao carregar categorias:', message);
        setCategories([
          { id: '1', name: 'Adesivos, Selantes e Fitas' },
          { id: '2', name: 'Equipamentos de Pintura' },
          { id: '3', name: 'EPIs' },
          { id: '4', name: 'Ferramentas' },
          { id: '5', name: 'Instrumentos de teste' },
          { id: '6', name: 'Lubrificantes' }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        setHasSearched(true);
        try {
          const url = new URL('/products', 'http://local');
          url.searchParams.set('search', searchTerm.trim());
          url.searchParams.set('limit', '2');

          const selectedCatObj = categories.find((c) => c.name === selectedCategory);
          if (selectedCatObj && selectedCategory !== 'All') {
            url.searchParams.set('categoryId', selectedCatObj.id);
          }

          const data = await apiFetch(url.pathname + '?' + url.searchParams.toString());
          const list: any[] = data?.data || [];

          const mapped = list.map((p: any) => ({
            id: p.id || p._id || String(p.code || p.name),
            name: p.name,
            description: p.description || '',
            category: p.subcategory?.category?.name || p.category?.name || 'Categoria',
            image: p.images?.[0] || p.thumbnail || 'https://via.placeholder.com/60x60?text=Produto',
            brand: p.brand?.name,
            price: p.price,
          }));

          setSearchResults(mapped);
          setShowSearchDropdown(true);
        } catch (e: any) {
          console.error('Erro na busca:', e.message);
          setSearchResults([]);
          setShowSearchDropdown(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, categories]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems = [
    { to: '/', label: 'Home' },
    { to: '/contact', label: 'Contact' },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/blog', label: 'Blog' },
  ];

  const authenticatedNavItems = [
    { to: '/settings', label: 'Settings' },
  ];

  const languages = [
    { code: 'en', flagUrl: 'https://flagcdn.com/w40/gb.png', alt: 'English' },
    { code: 'pt', flagUrl: 'https://flagcdn.com/w40/pt.png', alt: 'Português' },
  ];

  function applyLanguage(code: string) {
    setLanguage(code as 'en' | 'pt');
    triggerGoogleTranslate(code);
  }

  function toggleLanguageMenu() {
    const next = currentLanguage === 'en' ? 'pt' : 'en';
    applyLanguage(next);
  }

  function selectLanguage(code: string) {
    if (code === currentLanguage) return;
    applyLanguage(code);
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSearchExpanded = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  useEffect(() => {
    setActiveResultIndex(-1);
  }, [searchTerm, showSearchDropdown]);

  useEffect(() => {
    if (cartCount && cartCount > 0) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 300);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessagesCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const res = await apiFetch('/user/messages/unread-count');
        setUnreadMessagesCount(res.unread_count || 0);
      } catch (e) {
        console.error('Erro ao carregar mensagens não lidas:', e);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !showMessagesDropdown) return;

    const loadRecentMessages = async () => {
      try {
        const res = await apiFetch('/user/messages');
        setRecentMessages(res.data?.slice(0, 5) || []);
      } catch (e) {
        console.error('Erro ao carregar mensagens recentes:', e);
      }
    };

    loadRecentMessages();
  }, [isAuthenticated, showMessagesDropdown]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsDrawerReady(false);
      const id = requestAnimationFrame(() => setIsDrawerReady(true));
      return () => cancelAnimationFrame(id);
    } else {
      setIsDrawerReady(false);
    }
  }, [isMobileMenuOpen]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown) return;
    const max = searchResults.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(activeResultIndex + 1, max);
      setActiveResultIndex(next);
      const el = searchItemRefs.current[next];
      if (el) el.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(activeResultIndex - 1, 0);
      setActiveResultIndex(prev);
      const el = searchItemRefs.current[prev];
      if (el) el.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (activeResultIndex >= 0 && activeResultIndex <= max) {
        const product = searchResults[activeResultIndex];
        navigate(`/product/${product.id}`);
        setShowSearchDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || searchResults.length === 0) return;

    const searchParams = new URLSearchParams();
    searchParams.set('search', searchTerm.trim());
    if (selectedCategory && selectedCategory !== 'All') {
      searchParams.set('category', selectedCategory);
    }

    navigate(`/products?${searchParams.toString()}`);
    setShowSearchDropdown(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setHasSearched(false);
  };

  const handleViewMore = () => {
    const searchParams = new URLSearchParams();
    searchParams.set('search', searchTerm.trim());
    if (selectedCategory && selectedCategory !== 'All') {
      searchParams.set('category', selectedCategory);
    }
    navigate(`/products?${searchParams.toString()}`);
    setShowSearchDropdown(false);
  };

  const handleMessagesClick = () => {
    setShowMessagesDropdown(!showMessagesDropdown);
    if (!showMessagesDropdown) {
      setUnreadMessagesCount(0);
    }
  };

  const handleViewAllMessages = () => {
    setShowMessagesDropdown(false);
    navigate('/userprofile?tab=messages');
  };

  const currentLangData = languages.find(l => l.code === currentLanguage) ?? languages[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ===== PRIMEIRA NAVBAR - NAVEGAÇÃO PRINCIPAL ===== */}
      <div className="bg-gray-900 text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="relative flex items-center space-x-6">
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative text-sm font-medium transition-colors hover:text-blue-200 ${isActive ? 'text-blue-100' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-500 after:rounded-full after:transition-all after:duration-300 ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/catalog"
                className={`relative text-sm font-medium transition-colors hover:text-blue-200 ${location.pathname === '/catalog' ? 'text-blue-100' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-500 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/catalog' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
              >
                Catalog
              </Link>

              <Link
                to="/company-profile"
                className={`relative text-sm font-medium transition-colors hover:text-blue-200 ${location.pathname === '/company-profile' ? 'text-blue-100' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-500 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/company-profile' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
              >
                Company Profile
              </Link>

              <div className="flex items-center gap-3">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className={`relative text-sm font-medium transition-colors hover:text-blue-200 ${location.pathname === '/login' ? 'text-blue-100' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-500 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/login' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
                  >
                    Login
                  </Link>
                ) : (
                  <></>
                )}
                {isAuthenticated && (
                  <Link
                    to="/UserProfile"
                    className={`relative px-2 flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-200 ${location.pathname === '/UserProfile' ? 'text-blue-100' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-500 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/UserProfile' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="lg:hidden">{user?.name?.split(' ')[0] || 'Conta'}</span>
                  </Link>
                )}
              </div>

              {authenticatedNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-2 text-sm font-medium transition-colors hover:text-blue-200 ${isActive ? 'text-blue-100' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-blue-300 after:to-blue-500 after:rounded-full after:transition-all after:duration-300 ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'} flex items-center`}
                    title={item.label}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="lg:hidden">{item.label}</span>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={handleMessagesClick}
                    className="relative p-2 text-gray-300 hover:text-white transition-colors"
                    aria-label="Mensagens"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  {showMessagesDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMessagesDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Mensagens</h3>
                            {unreadMessagesCount > 0 && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                {unreadMessagesCount} nova{unreadMessagesCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {recentMessages.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                              <svg className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <p>Sem mensagens</p>
                            </div>
                          ) : (
                            recentMessages.map((thread) => (
                              <button
                                key={thread.id}
                                onClick={() => {
                                  setShowMessagesDropdown(false);
                                  navigate(`/userprofile?tab=messages&thread=${thread.id}`);
                                }}
                                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${thread.unread_count > 0 ? 'bg-blue-50' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${thread.unread_count > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-gray-900 text-sm truncate">{thread.from_user}</span>
                                      <span className="text-xs text-gray-500">{thread.last_message_time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{thread.subject}</p>
                                    {thread.last_message && (
                                      <p className="text-xs text-gray-500 truncate mt-1">
                                        {thread.last_message.substring(0, 50)}...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>

                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <button
                            onClick={handleViewAllMessages}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Ver todas as mensagens →
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={toggleLanguageMenu}
                className="flex items-center gap-1 px-2 py-1 text-sm font-medium hover:text-blue-300 transition-colors"
                title={currentLanguage === 'en' ? 'Switch to Portuguese' : 'Switch to English'}
              >
                <span className="inline-block w-6 h-4 overflow-hidden rounded-sm">
                  <img
                    src={currentLangData.flagUrl}
                    alt={currentLangData.alt}
                    className="w-full h-auto object-cover"
                    draggable={false}
                  />
                </span>
                <span className="ml-1 text-xs uppercase">{currentLanguage}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEGUNDA NAVBAR - LOGO, BUSCA E PRODUTOS ===== */}
      <div className={`bg-[#e6e6e6] shadow-md transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-white/70 transition-colors"
                aria-label="Abrir menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" aria-label="Ir para a página inicial">
                <img src="https://ymrindustrial.com/assets/ymrlogo.png" alt="YMR Industrial" className="h-7 md:h-8" />
              </Link>
            </div>

            {/* Busca Desktop */}
            <div className="hidden md:block flex-1 max-w-3xl mx-8">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch} className="flex items-center h-10 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="relative flex-1 h-full min-w-0">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Search for equipment, tools, PPE..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full h-full pl-12 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-full px-3 bg-white text-gray-700 focus:outline-none focus:ring-0 border-0 min-w-[140px] max-w-[160px] text-sm"
                    disabled={isLoadingCategories}
                  >
                    <option value="All">Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name} title={category.name}>
                        {category.name.length > 15 ? category.name.substring(0, 15) + '...' : category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!searchTerm.trim() || searchResults.length === 0}
                    className="h-full px-3 bg-blue-900 text-white transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>

                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {isSearching ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-gray-500">Buscando produtos...</p>
                      </div>
                    ) : hasSearched && searchResults.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="text-gray-400 mb-3">
                          <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pesquisa sem resultados</h3>
                        <p className="text-gray-500 text-sm">Pesquise por categorias ou tente outros termos</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div ref={dropdownListRef} className="max-h-80 overflow-y-auto">
                        {searchResults.map((product, idx) => (
                          <div
                            key={product.id}
                            ref={(el) => (searchItemRefs.current[idx] = el)}
                            className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${activeResultIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => {
                              navigate(`/product/${product.id}`);
                              setShowSearchDropdown(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{product.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {product.category}
                                  </span>
                                  {product.brand && (
                                    <span className="text-xs text-gray-400">{product.brand}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="p-4 border-t border-gray-100">
                          <button
                            onClick={handleViewMore}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium"
                          >
                            <span>Ver mais resultados</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Produtos e Carrinho */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                type="button"
                onClick={toggleSearchExpanded}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-white/70 transition-colors"
                aria-label="Abrir busca"
                aria-expanded={isSearchExpanded}
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                to="/products"
                className="hidden md:inline-block relative text-sm p-1 font-medium hover:text-blue-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-blue-900"
              >
                Products
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/cart"
                  className={`relative p-2 bg-blue-900 text-white rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg group ${cartBump ? 'animate-[cart-bump_300ms_ease-out]' : ''}`}
                  aria-label="Ir para o carrinho"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold group-hover:bg-red-600 transition-colors">
                      {cartCount > 99 ? '99+' : cartCount}
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="relative p-3 bg-blue-900 text-white rounded-md cursor-not-allowed"
                  aria-label="Faça login para acessar o carrinho"
                  title="Faça login para acessar o carrinho"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Barra de busca Mobile expandida */}
          {isSearchExpanded && (
            <div className="md:hidden pb-3">
              <div ref={searchRef} className="relative mt-2">
                <form onSubmit={handleSearch} className="flex items-center h-11 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                  <div className="relative flex-1 h-full min-w-0">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full h-full pl-9 pr-10 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Limpar busca"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="h-8 w-px bg-gray-300" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="hidden sm:block h-full px-3 bg-white text-gray-700 focus:outline-none focus:ring-0 border-0 min-w-[120px] max-w-[140px] text-sm"
                    disabled={isLoadingCategories}
                  >
                    <option value="All">Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name} title={category.name}>
                        {category.name.length > 15 ? category.name.substring(0, 15) + '...' : category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!searchTerm.trim() || searchResults.length === 0}
                    className="relative p-2 mr-1 bg-blue-900 text-white rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    aria-label="Pesquisar"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-hidden">
                    {isSearching ? (
                      <div className="p-5 text-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-blue-500 border-t-transparent mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Buscando produtos...</p>
                      </div>
                    ) : hasSearched && searchResults.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="text-gray-400 mb-3">
                          <Search className="h-10 w-10 mx-auto" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-700 mb-1">Pesquisa sem resultados</h3>
                        <p className="text-gray-500 text-sm">Pesquise por categorias ou tente outros termos</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div ref={dropdownListRef} className="max-h-72 overflow-y-auto">
                        {searchResults.map((product, idx) => (
                          <div
                            key={product.id}
                            ref={(el) => (searchItemRefs.current[idx] = el)}
                            className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${activeResultIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => {
                              navigate(`/product/${product.id}`);
                              setShowSearchDropdown(false);
                              setIsSearchExpanded(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate text-sm">{product.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{product.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {product.category}
                                  </span>
                                  {product.brand && (
                                    <span className="text-[10px] text-gray-400">{product.brand}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="p-3 border-t border-gray-100">
                          <button
                            onClick={handleViewMore}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium text-sm"
                          >
                            <span>Ver mais resultados</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== DRAWER MOBILE ===== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isDrawerReady ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMobileMenu}
          />
          <div className={`absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-2xl p-6 overflow-y-auto transform transition-transform duration-200 ${isDrawerReady ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600' : ''} after:content-[''] after:absolute after:left-3 after:bottom-2 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 ${isActive ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]'}`}
                  >
                    {item.to === '/' && <Home className="h-4 w-4" />}
                    {item.to === '/contact' && <Mail className="h-4 w-4" />}
                    {item.to === '/about' && <Info className="h-4 w-4" />}
                    {item.to === '/services' && <Wrench className="h-4 w-4" />}
                    {item.to === '/blog' && <BookOpen className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {authenticatedNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`relative flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 ${isActive ? 'bg-blue-50 text-blue-600' : ''} after:content-[''] after:absolute after:left-3 after:bottom-2 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 ${isActive ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]'}`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <Link
                to="/catalog"
                onClick={closeMobileMenu}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 ${location.pathname === '/catalog' ? 'bg-blue-50 text-blue-600' : ''} after:content-[''] after:absolute after:left-3 after:bottom-2 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/catalog' ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]'}`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Catalog</span>
              </Link>

              <Link
                to="/company-profile"
                onClick={closeMobileMenu}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 ${location.pathname === '/company-profile' ? 'bg-blue-50 text-blue-600' : ''} after:content-[''] after:absolute after:left-3 after:bottom-2 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/company-profile' ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]'}`}
              >
                <Building2 className="h-4 w-4" />
                <span>Company Profile</span>
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 ${location.pathname === '/login' ? 'bg-blue-50 text-blue-600' : ''} after:content-[''] after:absolute after:left-3 after:bottom-2 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/login' ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]'}`}
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              ) : (
                <Link
                  to="/UserProfile"
                  onClick={closeMobileMenu}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 ${location.pathname === '/UserProfile' ? 'bg-blue-50 text-blue-600' : ''} after:content-[''] after:absolute after:left-3 after:bottom-2 after:h-[2px] after:bg-gradient-to-r after:from-blue-400 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 ${location.pathname === '/UserProfile' ? 'after:w-[calc(100%-1.5rem)]' : 'after:w-0 hover:after:w-[calc(100%-1.5rem)]'}`}
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name?.split(' ')[0] || 'Conta'}</span>
                </Link>
              )}
            </nav>

            {/* ===== SELETOR DE IDIOMA MOBILE ===== */}
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Language</div>
              <div className="flex items-center gap-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => selectLanguage(language.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                      currentLanguage === language.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="inline-block w-6 h-4 overflow-hidden rounded-sm">
                      <img
                        src={language.flagUrl}
                        alt={language.alt}
                        className="w-full h-auto object-cover"
                        draggable={false}
                      />
                    </span>
                    <span className="text-sm text-gray-700">{language.alt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;