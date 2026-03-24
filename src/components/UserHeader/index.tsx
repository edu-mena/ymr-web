import { useEffect, useRef, useState } from "react";
import { 
  User, Settings, Activity, ShoppingBag, MessageCircle, MapPin, Mail, Camera, LogOut,
  Clock, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type UserHeaderProps = {
  userData: {
    avatar: string;
    name: string;
    position?: string;
    company?: string;
    email?: string;
    city?: string;
    country?: string;
  };
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  onAvatarClick?: () => void;
};

export default function UserHeader({ userData, activeTab, setActiveTab, onAvatarClick }: UserHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [headerOffsetPx, setHeaderOffsetPx] = useState<number>(112);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProcessingLogout, setIsProcessingLogout] = useState(false);
  const [previousTab, setPreviousTab] = useState<string>('profile');
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 1);
      if (currentY > lastScrollYRef.current && currentY > 120) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollYRef.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Medir dinamicamente a altura do header global e ajustar o offset do sticky
  useEffect(() => {
    function computeOffset() {
      const appHeader = document.querySelector('header');
      const measured = (appHeader as HTMLElement | null)?.offsetHeight;
      // Fallback por breakpoint caso não consiga medir
      if (typeof measured === 'number' && measured > 0) {
        setHeaderOffsetPx(measured);
      } else {
        setHeaderOffsetPx(window.innerWidth < 768 ? 64 : 112);
      }
    }
    computeOffset();
    window.addEventListener('resize', computeOffset);
    // Re-medida pequena após layout estabilizar
    const id = window.setTimeout(computeOffset, 300);
    return () => {
      window.removeEventListener('resize', computeOffset);
      window.clearTimeout(id);
    };
  }, []);

  // Quando a aba ativa muda, guardar a anterior e abrir confirmação ao entrar em 'logout'
  useEffect(() => {
    if (activeTab === 'logout') {
      setShowLogoutConfirm(true);
      return;
    }
    setPreviousTab(activeTab);
  }, [activeTab]);

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    setIsProcessingLogout(true);
    setTimeout(() => {
      logout();
      navigate('/');
    }, 3000);
  }

  function handleCancelLogout() {
    setShowLogoutConfirm(false);
    setActiveTab(previousTab);
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'activity', label: 'Atividades', icon: Activity },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle },
    { id: 'logout', label: 'Sair', icon: LogOut },
  ];
  return (
    <>
      {/* ===== HEADER DO PERFIL ===== */}
      <div
        className={`bg-gray-900 text-white sticky z-10 relative overflow-hidden transform-gpu transition-all duration-500 ease-in-out ${isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        style={{ top: headerOffsetPx }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-blue-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          {/* Seção Principal */}
          <div className="flex flex-col xl:flex-row items-center xl:items-center gap-6 md:gap-8 text-center md:text-left">
            
            {/* Avatar e Informações Principais */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 flex-1 w-full justify-center">
              {/* Avatar */}
              <div className="relative transition-all duration-300 self-center">
                <div className="relative">
                  <img
                    src={userData.avatar}
                    alt="Avatar do usuário"
                    className={`rounded-full border-4 border-white/30 shadow-xl object-cover transition-[width,height] duration-500 ease-in-out ${isScrolled ? "w-12 h-12 md:w-12 md:h-12" : "w-20 h-20 md:w-16 md:h-16"}`}
                  />
                  {!isScrolled && (
                    <button 
                      onClick={onAvatarClick}
                      className={`absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                      title="Alterar foto de perfil"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                  {/* Status Online */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              </div>

              {/* Informações do Usuário */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-1">
                  <h1 className="text-lg font-bold text-white truncate">{userData.name}</h1>
                  <div className="hidden md:flex items-center gap-2">
                  </div>
                </div>
                
                <p className="text-gray-300 text-xs font-medium mb-2">{userData.position}</p>
                
                {!isScrolled && (
                  <div className={`transition-opacity duration-500 ease-in-out ${isScrolled ? "opacity-0" : "opacity-100"}`}>
                    <div className="hidden md:flex items-center gap-4 text-sm text-gray-300 w-full">
                      <div className="flex items-center gap-2 rounded-lg">
                        <span className="truncate">{userData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-400" />
                        <span>{userData.city} {userData.country}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas e Status */}
            <div className="flex flex-col sm:flex-row xl:flex-col gap-4 w-full xl:w-auto">

              {/* Status e Atividade */}
              <div className="hidden md:flex gap-3">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/20">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-sm text-gray-300">Última atividade</div>
                    <div className="text-xs text-gray-400">há 2 horas</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-sm text-gray-300">Status</div>
                    <div className="text-xs text-green-400">Online</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        {/* ===== NAVEGAÇÃO POR TABS ===== */}
        <div className="bg-white shadow-xl border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Fades nas bordas para indicar scroll */}
            <nav className="flex space-x-1 overflow-x-auto scrollbar-thin">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 md:py-4 px-4 md:px-6 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 relative group ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 mx-auto w-8 h-1 bg-blue-900 rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmação de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancelLogout} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Tem a certeza que deseja sair?</h3>
            <p className="mt-2 text-sm text-gray-600">A sua sessão será terminada.</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Não
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de processamento de logout */}
      {isProcessingLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xs mx-4 p-6 flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-700">A terminar sessão...</p>
          </div>
        </div>
      )}

    </>
  );
}
