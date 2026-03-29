// pages/UserProfile/index.tsx
// Orquestrador principal — gere perfil, avatar, tabs e delega o resto às features.
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, MessageCircle, Download, 
  Shield, UserCheck, Camera, X, AlertCircle,
  FileText, Eye, ShoppingCart, Activity,
} from 'lucide-react';
import UserHeader from '../../components/UserHeader';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { useActivityLog } from '../../hooks/useActivityLog';
import { UserActivity, Order } from './features/types';
import ProfileTab from './features/ProfileTab';
import ActivityTab from './features/ActivityTab';
import OrdersTab from './features/OrdersTab';
import MessagesTab from './features/MessagesTab';

// ── Icon map para ActivityTab ──────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag, FileText, UserCheck, Download, MessageCircle,
  Eye, ShoppingCart, Activity, Shield,
};

// ── Componente principal ────────────────────────────────────────────────────
const UserProfile = () => {
  const { isAuthenticated } = useAuth();
  const { logActivity } = useActivityLog();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Tab activa — lida da URL ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'profile';
  });

  // ── Avatar modal ──────────────────────────────────────────────────────────
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Dados de perfil ───────────────────────────────────────────────────────
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Dados de outras tabs ──────────────────────────────────────────────────
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // ── Sincronizar URL com tab activa ────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [activeTab]);

  // ── Redirigir para messages se URL tiver ?tab=messages ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  // ── Carregar perfil ───────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) { navigate('/login'); return; }
      try {
        const response = await apiFetch('/auth/profile');
        const p = response.user;
        setUserData({
          id: p.id,
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          birthDate: p.birth_date ? p.birth_date.split('T')[0] : '',
          address: p.address || '',
          city: p.city || '',
          country: p.country || 'Angola',
          company: p.company || '',
          position: p.position || '',
          avatar: p.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await apiFetch('/user/activities?limit=10');
        setRecentActivities(res.data);
      } catch { /* silencioso */ }
    };
    load();
  }, [isAuthenticated]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await apiFetch('/orders');
        setOrderHistory(res.data || []);
      } catch { /* silencioso */ }
    };
    load();
  }, [isAuthenticated]);

  // ── Guardar perfil ────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          birth_date: userData.birthDate,
          address: userData.address,
          city: userData.city,
          country: userData.country,
          company: userData.company,
          position: userData.position,
        }),
      });
      setIsEditing(false);
      await logActivity({
        activityType: 'profile_updated',
        title: 'Perfil atualizado',
        description: 'Usuário atualizou suas informações pessoais',
      });
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + (err.message || 'Tente novamente'));
    }
  };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Por favor, selecione apenas arquivos de imagem.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('A imagem deve ter no máximo 5MB.'); return; }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setIsUploading(true);
      const response = await apiFetch('/upload/avatar', { method: 'POST', body: formData });
      setUserData((prev: any) => ({ ...prev, avatar: response.avatar_url }));
      setShowAvatarModal(false);
      await logActivity({ activityType: 'avatar_updated', title: 'Foto de perfil atualizada', description: 'Usuário alterou sua foto de perfil' });
      alert('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      alert('Erro ao enviar avatar: ' + (err.message || 'Tente novamente'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setUserData((prev: any) => ({
      ...prev,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }));
    setShowAvatarModal(false);
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen page-content bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen page-content bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen page-content bg-gray-50">
      <UserHeader
        userData={userData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAvatarClick={() => setShowAvatarModal(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">

        {activeTab === 'profile' && (
          <ProfileTab
            userData={userData}
            setUserData={setUserData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSave={handleSave}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab recentActivities={recentActivities} iconMap={iconMap} />
        )}

        {activeTab === 'orders' && (
          <OrdersTab orderHistory={orderHistory} />
        )}

        {activeTab === 'messages' && (
          <MessagesTab />
        )}

      </div>

      {/* ── Modal de Avatar ────────────────────────────────────────────────── */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-2 px-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Alterar Foto de Perfil</h2>
                <button onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={userData.avatar} alt="Avatar atual"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Foto atual</p>
              </div>
              <div className="space-y-4">
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3
                    bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors">
                  <Camera className="h-5 w-5" />
                  {isUploading ? 'Enviando...' : 'Escolher Nova Foto'}
                </button>
                <button onClick={handleRemoveAvatar} disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3
                    bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                  Usar Foto Padrão
                </button>
              </div>
              <div className="mt-6 py-2 px-3 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Requisitos da foto:</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Formatos aceitos: JPG, PNG, GIF</li>
                  <li>• Tamanho máximo: 5MB</li>
                  <li>• Resolução recomendada: 400x400px ou superior</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;