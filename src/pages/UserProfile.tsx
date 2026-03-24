// src/pages/UserProfile.tsx
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, MessageCircle,
  Edit3, Save, Download, Filter,
  Shield, UserCheck,
  Camera, X, AlertCircle, FileText, Eye, ShoppingCart, Activity
} from 'lucide-react';
import UserHeader from '../components/UserHeader';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { useActivityLog } from '../hooks/useActivityLog';

// ===== TIPOS =====

type UserActivity = {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
};

type Order = {
  id: string;
  service: string;
  date: string;
  status: string;
  statusColor: string;
  value: string;
};

type Message = {
  from: string;
  subject: string;
  time: string;
  unread: boolean;
};

// ===== COMPONENTE PRINCIPAL =====
const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const { logActivity } = useActivityLog();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'profile';
  });

  // ===== DADOS DINÂMICOS DA API =====
  const [userData, setUserData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== CARREGAR DADOS DO PERFIL =====
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await apiFetch('/auth/profile');
        const userProfile = response.user;
        
        setUserData({
          id: userProfile.id,
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          birthDate: userProfile.birth_date ? userProfile.birth_date.split('T')[0] : '',
          address: userProfile.address || '',
          city: userProfile.city || '',
          country: userProfile.country || 'Angola',
          company: userProfile.company || '',
          position: userProfile.position || '',
          avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, navigate]);

  // ===== CARREGAR ATIVIDADES RECENTES =====
  useEffect(() => {
    const loadActivities = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await apiFetch('/user/activities?limit=10');
        setRecentActivities(res.data);
      } catch (err) {
        console.error('Erro ao carregar atividades:', err);
      }
    };
    
    loadActivities();
  }, [isAuthenticated]);

  // ===== CARREGAR PEDIDOS =====
  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await apiFetch('/orders');
        setOrderHistory(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
      }
    };
    
    loadOrders();
  }, [isAuthenticated]);

  // ===== CARREGAR MENSAGENS =====
  useEffect(() => {
    const loadMessages = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await apiFetch('/messages');
        setRecentMessages(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
      }
    };
    
    loadMessages();
  }, [isAuthenticated]);

  // ===== ATUALIZAR URL COM TAB =====
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const current = params.get('tab');
    if (current !== activeTab) {
      params.set('tab', activeTab);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeTab]);

  // ===== FUNÇÕES DE UPLOAD DE AVATAR =====
  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      setIsUploading(true);
      const response = await apiFetch('/upload/avatar', {
        method: 'POST',
        body: formData
      });
      
      setUserData((prev: any) => ({ ...prev, avatar: response.avatar_url }));
      setShowAvatarModal(false);
      
      // Registra atividade
      await logActivity({
        activityType: 'avatar_updated',
        title: 'Foto de perfil atualizada',
        description: 'Usuário alterou sua foto de perfil'
      });
      
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
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }));
    setShowAvatarModal(false);
  };

  // ===== SALVAR PERFIL =====
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
          position: userData.position
        })
      });
      
      setIsEditing(false);
      
      // Registra atividade
      await logActivity({
        activityType: 'profile_updated',
        title: 'Perfil atualizado',
        description: 'Usuário atualizou suas informações pessoais'
      });
      
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + (err.message || 'Tente novamente'));
    }
  };

  // ===== MAPEAMENTO DE ÍCONES DINÂMICOS =====
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'ShoppingBag': ShoppingBag,
    'FileText': FileText,
    'UserCheck': UserCheck,
    'Download': Download,
    'MessageCircle': MessageCircle,
    'Eye': Eye,
    'ShoppingCart': ShoppingCart,
    'Activity': Activity,
    'Shield': Shield,
  };

  // ===== RENDERIZAÇÃO =====
  if (loading) {
    return (
      <div className="min-h-screen page-content bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
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
        onAvatarClick={handleAvatarClick}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gapy-2 px-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-1 rounded-xl">
                    <UserCheck className="h-6 w-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Detalhes Pessoais</h3>
                </div>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`flex items-center gap-2 px-2 py-2 text-xs rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isEditing
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-900 text-white'
                  }`}
                >
                  {isEditing ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                  {isEditing ? 'Salvar' : 'Editar'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gapy-2 px-3 md:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Nome Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="w-full p-2 md:py-1 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                  {(
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.email}</div>
                  )} {/* Email não editável */}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Telefone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full p-2 md:py-1 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.phone}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Data de Nascimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={userData.birthDate}
                      onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                      className="w-full p-2 md:py-1 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">
                      {new Date(userData.birthDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Empresa</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.company}
                      onChange={(e) => setUserData({...userData, company: e.target.value})}
                      className="w-full p-2 md:py-1 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.company}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Cargo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.position}
                      onChange={(e) => setUserData({...userData, position: e.target.value})}
                      className="w-full p-2 md:py-1 px-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.position}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Atividades Recentes</h3>
              
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {recentActivities.map((activity) => {
                    const IconComponent = iconMap[activity.icon] || Activity;
                    return (
                      <div key={activity.id} className="flex items-center gap-3 md:gapy-2 px-3 py-2 px-3 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                        <div className={`p-2.5 md:p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-300 ${activity.color}`}>
                          <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs md:text-sm text-gray-500">{activity.description}</p>
                          )}
                          <p className="text-xs md:text-sm text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Histórico de Pedidos</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 md:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm">
                    <Filter className="h-4 w-4" />
                    Filtrar
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 md:px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                </div>
              </div>
              
              {orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Serviço</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-mono text-sm text-gray-600">{order.id}</td>
                          <td className="py-4 px-4 font-medium text-gray-900">{order.service}</td>
                          <td className="py-4 px-4 text-gray-600">{order.date}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900">{order.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Mensagens Recentes</h3>
              
              {recentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma mensagem</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message, index) => (
                    <div key={index} className={`py-2 px-3 md:p-6 rounded-xl border-l-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group ${
                      message.unread ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100' : 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                              message.unread ? 'bg-red-200' : 'bg-gray-200'
                            }`}>
                              <MessageCircle className={`h-4 w-4 md:h-5 md:w-5 ${message.unread ? 'text-red-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{message.from}</span>
                              {message.unread && (
                                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2 font-medium">{message.subject}</p>
                          <p className="text-xs md:text-sm text-gray-500">{message.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL DE AVATAR ===== */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-2 px-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Alterar Foto de Perfil</h2>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={userData.avatar}
                    alt="Avatar atual"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Foto atual</p>
              </div>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  {isUploading ? 'Enviando...' : 'Escolher Nova Foto'}
                </button>
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                >
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