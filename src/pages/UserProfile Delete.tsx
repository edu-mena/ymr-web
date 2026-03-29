// src/pages/UserProfile.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, MessageCircle,
  Edit3, Save, Download, Filter,
  Shield, UserCheck,
  Camera, X, AlertCircle, FileText, Eye, ShoppingCart, Activity,
  Bell, Paperclip, RefreshCw, CheckCheck, Clock, CheckCircle,
  ChevronLeft, Mail, ExternalLink, MailOpen
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

// ── Mensagens de RFQ ──────────────────────────────────────────────────────

type RfqAttachment = {
  id: string;
  filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
};

type RfqMessage = {
  id: string;
  rfq_id: string;
  rfq_name: string;
  rfq_status: string; // 'active' | 'submitted' | 'completed' | 'cancelled'
  message: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  is_read: boolean;
  created_at: string;
  attachments?: RfqAttachment[];
  // thread messages
  replies?: RfqThreadMessage[];
};

type RfqThreadMessage = {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  created_at: string;
  attachments?: RfqAttachment[];
};

// ── Thread de mensagens de contacto ──────────────────────────────────────

type ContactThread = {
  id: string;
  subject: string;
  from_user: string;
  last_message_time: string;
  last_message?: string;
  unread_count: number;
};

type ThreadDetails = {
  thread: { subject: string; from_user: string };
  messages: Array<{
    id: string;
    content: string;
    sender_type: 'user' | 'admin';
    sender_name: string;
    created_at: string;
  }>;
};

// ===== HELPERS =====

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)}h`;
  if (diff < 7 * 86_400_000) return date.toLocaleDateString('pt-AO', { weekday: 'short' });
  return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ===== COMPONENTE PRINCIPAL =====
const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const { logActivity } = useActivityLog();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'profile';
  });

  // ── Dados API ──────────────────────────────────────────────────────────────
  const [userData, setUserData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Messages tab state ────────────────────────────────────────────────────
  // Aba de mensagens tem dois painéis: RFQ replies + Contact threads
  type MessagesView = 'rfq' | 'contact';
  const [messagesView, setMessagesView] = useState<MessagesView>('rfq');

  // Contact threads (sistema de mensagens genérico)
  const [userMessages, setUserMessages] = useState<ContactThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadDetails, setThreadDetails] = useState<ThreadDetails | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // RFQ messages
  const [rfqMessages, setRfqMessages] = useState<RfqMessage[]>([]);
  const [rfqMessagesLoading, setRfqMessagesLoading] = useState(false);
  const [selectedRfqMessage, setSelectedRfqMessage] = useState<RfqMessage | null>(null);
  const [rfqThreadLoading, setRfqThreadLoading] = useState(false);

  // ── Carregar perfil ────────────────────────────────────────────────────────
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
          avatar: p.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
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
    const loadActivities = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await apiFetch('/user/activities?limit=10');
        setRecentActivities(res.data);
      } catch { /* silencioso */ }
    };
    loadActivities();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await apiFetch('/orders');
        setOrderHistory(res.data || []);
      } catch { /* silencioso */ }
    };
    loadOrders();
  }, [isAuthenticated]);

  // ── Sincronizar URL com tab ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [activeTab]);

  // ── Ler URL para abrir thread de RFQ directamente ─────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rfqId = params.get('rfq');
    if (rfqId && activeTab === 'messages') {
      // Abrir automaticamente a thread da RFQ indicada
      setMessagesView('rfq');
      // O selectedRfqMessage será definido depois de rfqMessages carregar
      // guardamos o ID para depois
      sessionStorage.setItem('open_rfq_thread', rfqId);
    }
  }, [location.search, activeTab]);

  // ── Carregar mensagens contact ─────────────────────────────────────────────
  const loadUserMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    setMessagesLoading(true);
    try {
      const res = await apiFetch('/user/messages');
      setUserMessages(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar mensagens:', e);
    } finally {
      setMessagesLoading(false);
    }
  }, [isAuthenticated]);

  const loadThreadDetails = useCallback(async (threadId: string) => {
    try {
      const res = await apiFetch(`/user/messages/${threadId}`);
      setThreadDetails(res.data);
      setSelectedThread(threadId);
    } catch (e) {
      console.error('Erro ao carregar detalhes da thread:', e);
    }
  }, []);

  const markContactAsRead = useCallback(async (threadId: string) => {
    try {
      await apiFetch(`/user/messages/${threadId}/read`, { method: 'PUT' });
      await loadUserMessages();
    } catch { /* silencioso */ }
  }, [loadUserMessages]);

  // ── Carregar mensagens de RFQ ─────────────────────────────────────────────
  const loadRfqMessages = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setRfqMessagesLoading(true);
    try {
      // Endpoint dedicado que retorna todas as mensagens de RFQs do utilizador
      // ordenadas por data decrescente, incluindo anexos
      const res = await apiFetch('/user/rfq-messages');
      const messages: RfqMessage[] = res.data || [];
      setRfqMessages(messages);

      // Se existe um rfq_id pendente de abertura automática, abri-lo
      const pendingRfqId = sessionStorage.getItem('open_rfq_thread');
      if (pendingRfqId) {
        const target = messages.find(m => m.rfq_id === pendingRfqId);
        if (target) {
          setSelectedRfqMessage(target);
          sessionStorage.removeItem('open_rfq_thread');
          // Marcar como lida
          if (!target.is_read) markRfqMessageRead(target.id);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar mensagens de RFQ:', e);
    } finally {
      setRfqMessagesLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Carregar thread completa de uma RFQ (com todos os replies)
  const loadRfqThread = useCallback(async (rfqId: string) => {
    setRfqThreadLoading(true);
    try {
      const res = await apiFetch(`/rfqs/${rfqId}/messages`);
      const replies: RfqThreadMessage[] = res.data || [];
      setSelectedRfqMessage(prev =>
        prev ? { ...prev, replies } : prev
      );
    } catch (e) {
      console.error('Erro ao carregar thread RFQ:', e);
    } finally {
      setRfqThreadLoading(false);
    }
  }, []);

  const markRfqMessageRead = useCallback(async (messageId: string) => {
    try {
      await apiFetch(`/user/rfq-messages/${messageId}/read`, { method: 'PUT' });
      setRfqMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
      );
    } catch { /* silencioso */ }
  }, []);

  // Carregar ao entrar na aba messages
  useEffect(() => {
    if (activeTab === 'messages') {
      loadRfqMessages();
      loadUserMessages();
    }
  }, [activeTab, loadRfqMessages, loadUserMessages]);

  // ── Avatar / Perfil ────────────────────────────────────────────────────────
  const handleAvatarClick = () => setShowAvatarModal(true);

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
    setUserData((prev: any) => ({ ...prev, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }));
    setShowAvatarModal(false);
  };

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
      await logActivity({ activityType: 'profile_updated', title: 'Perfil atualizado', description: 'Usuário atualizou suas informações pessoais' });
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + (err.message || 'Tente novamente'));
    }
  };

  // ── Icon map ───────────────────────────────────────────────────────────────
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

  // Contadores para badge na aba mensagens
  const unreadRfqCount    = rfqMessages.filter(m => !m.is_read && m.sender_type === 'admin').length;
  const unreadContactCount = userMessages.reduce((sum, t) => sum + (t.unread_count || 0), 0);
  const totalUnread       = unreadRfqCount + unreadContactCount;

  // ===== RENDER =====
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
          <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
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
        unreadCount={totalUnread}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">

        {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
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
                  className="flex items-center gap-2 px-2 py-2 text-xs rounded-xl transition-all duration-300 transform hover:scale-105 bg-gray-900 text-white"
                >
                  {isEditing ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                  {isEditing ? 'Salvar' : 'Editar'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gapy-2 px-3 md:gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Nome Completo</label>
                  {isEditing ? (
                    <input type="text" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.name}</div>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                  <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.email}</div>
                </div>
                {/* Telefone */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Telefone</label>
                  {isEditing ? (
                    <input type="tel" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.phone}</div>
                  )}
                </div>
                {/* Data de nascimento */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Data de Nascimento</label>
                  {isEditing ? (
                    <input type="date" value={userData.birthDate} onChange={e => setUserData({ ...userData, birthDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">
                      {userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('pt-BR') : '—'}
                    </div>
                  )}
                </div>
                {/* Empresa */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Empresa</label>
                  {isEditing ? (
                    <input type="text" value={userData.company} onChange={e => setUserData({ ...userData, company: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.company}</div>
                  )}
                </div>
                {/* Cargo */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Cargo</label>
                  {isEditing ? (
                    <input type="text" value={userData.position} onChange={e => setUserData({ ...userData, position: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="py-1 px-2 bg-gray-100 rounded-xl text-gray-900 border border-gray-200">{userData.position}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ─────────────────────────────────────────────────── */}
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
                  {recentActivities.map(activity => {
                    const IconComponent = iconMap[activity.icon] || Activity;
                    return (
                      <div key={activity.id} className="flex items-center gap-3 px-3 py-2 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                        <div className={`p-2.5 md:p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-300 ${activity.color}`}>
                          <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{activity.title}</p>
                          {activity.description && <p className="text-xs md:text-sm text-gray-500">{activity.description}</p>}
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

        {/* ── ORDERS TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Histórico de Pedidos</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 md:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm">
                    <Filter className="h-4 w-4" /> Filtrar
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 md:px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                    <Download className="h-4 w-4" /> Exportar
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
                      {orderHistory.map(order => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-mono text-sm text-gray-600">{order.id}</td>
                          <td className="py-4 px-4 font-medium text-gray-900">{order.service}</td>
                          <td className="py-4 px-4 text-gray-600">{order.date}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>{order.status}</span>
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

        {/* ── MESSAGES TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Mensagens
                  {totalUnread > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </h2>
                <p className="text-gray-500 text-sm mt-1">RFQs respondidas, cotações e mensagens de suporte.</p>
              </div>
              <button
                onClick={() => { loadRfqMessages(); loadUserMessages(); }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700 self-start sm:self-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>

            {/* Sub-tabs: RFQ / Contact */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
              <button
                onClick={() => setMessagesView('rfq')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  messagesView === 'rfq' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                Cotações
                {unreadRfqCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-indigo-500 text-white text-xs rounded-full">
                    {unreadRfqCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMessagesView('contact')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  messagesView === 'contact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Suporte
                {unreadContactCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-indigo-500 text-white text-xs rounded-full">
                    {unreadContactCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── PAINEL: COTAÇÕES (RFQ replies) ───────────────────────── */}
            {messagesView === 'rfq' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Lista de RFQ messages */}
                <div className={`lg:col-span-1 ${selectedRfqMessage ? 'hidden lg:block' : ''}`}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">Pedidos de Cotação</h3>
                      <span className="text-xs text-gray-400">{rfqMessages.length}</span>
                    </div>

                    <div className="max-h-[620px] overflow-y-auto divide-y divide-gray-50">
                      {rfqMessagesLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto" />
                        </div>
                      ) : rfqMessages.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Sem mensagens de cotação</p>
                          <p className="text-xs mt-1">As respostas às suas RFQs aparecerão aqui</p>
                        </div>
                      ) : (
                        rfqMessages.map(msg => (
                          <button
                            key={msg.id}
                            onClick={() => {
                              setSelectedRfqMessage(msg);
                              if (!msg.is_read && msg.sender_type === 'admin') markRfqMessageRead(msg.id);
                              loadRfqThread(msg.rfq_id);
                            }}
                            className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors relative ${
                              selectedRfqMessage?.id === msg.id ? 'bg-indigo-50' : ''
                            } ${!msg.is_read && msg.sender_type === 'admin' ? 'bg-indigo-50/60' : ''}`}
                          >
                            {/* Ponto de não lido */}
                            {!msg.is_read && msg.sender_type === 'admin' && (
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500" />
                            )}

                            <div className="flex items-start gap-3 pl-1">
                              {/* Ícone RFQ status */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                msg.rfq_status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                {msg.rfq_status === 'completed'
                                  ? <Mail className="h-4 w-4 text-blue-600" />
                                  : <Clock className="h-4 w-4 text-gray-500" />
                                }
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1 mb-0.5">
                                  <span className={`text-sm truncate ${!msg.is_read && msg.sender_type === 'admin' ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                                    {msg.rfq_name}
                                  </span>
                                  <span className="text-xs text-gray-400 flex-shrink-0">
                                    {formatRelativeDate(msg.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{msg.sender_name}</p>
                                <p className="text-xs text-gray-600 line-clamp-2">{msg.message}</p>

                                {/* Badges */}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    msg.rfq_status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    msg.rfq_status === 'submitted' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {msg.rfq_status === 'completed' ? 'Respondida' :
                                     msg.rfq_status === 'submitted' ? 'Em análise' : msg.rfq_status}
                                  </span>
                                  {msg.attachments && msg.attachments.length > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium flex items-center gap-1">
                                      <Paperclip className="h-3 w-3" />
                                      {msg.attachments.length} PDF{msg.attachments.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhe da RFQ message */}
                <div className={`lg:col-span-2 ${!selectedRfqMessage ? 'hidden lg:block' : ''}`}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
                    {selectedRfqMessage ? (
                      <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => setSelectedRfqMessage(null)}
                              className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5 text-gray-500" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{selectedRfqMessage.rfq_name}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  selectedRfqMessage.rfq_status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                  selectedRfqMessage.rfq_status === 'submitted' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {selectedRfqMessage.rfq_status === 'completed' ? '✓ Respondida' :
                                   selectedRfqMessage.rfq_status === 'submitted' ? '⏳ Em análise' : selectedRfqMessage.rfq_status}
                                </span>
                                <button
                                  onClick={() => navigate(`/cart`)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Ver no carrinho
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Corpo da conversa */}
                        <div className="p-4 max-h-[480px] overflow-y-auto space-y-4">

                          {/* Mensagem original */}
                          <RfqThreadBubble
                            message={selectedRfqMessage.message}
                            senderType={selectedRfqMessage.sender_type}
                            senderName={selectedRfqMessage.sender_name}
                            createdAt={selectedRfqMessage.created_at}
                            attachments={selectedRfqMessage.attachments}
                          />

                          {/* Thread de replies */}
                          {rfqThreadLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-400 border-t-transparent" />
                            </div>
                          ) : (
                            selectedRfqMessage.replies?.map(reply => (
                              <RfqThreadBubble
                                key={reply.id}
                                message={reply.message}
                                senderType={reply.sender_type}
                                senderName={reply.sender_name}
                                createdAt={reply.created_at}
                                attachments={reply.attachments}
                              />
                            ))
                          )}
                        </div>

                        {/* Secção de anexos da resposta principal */}
                        {selectedRfqMessage.rfq_status === 'completed' &&
                          selectedRfqMessage.attachments &&
                          selectedRfqMessage.attachments.length > 0 && (
                          <div className="border-t border-gray-100 p-4 bg-blue-50/40">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                              <Paperclip className="h-4 w-4 text-gray-500" />
                              Documentos de Cotação ({selectedRfqMessage.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedRfqMessage.attachments.map((att, idx) => (
                                <AttachmentCard key={idx} attachment={att} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nota de status */}
                        {selectedRfqMessage.rfq_status === 'submitted' && (
                          <div className="border-t border-gray-100 p-4 bg-amber-50">
                            <p className="text-sm text-amber-800 flex items-start gap-2">
                              <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              A sua cotação está em análise. Receberá uma notificação por email quando for respondida.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
                        <MailOpen className="h-16 w-16 mb-4 opacity-25" />
                        <p className="font-medium text-gray-500">Selecione uma cotação</p>
                        <p className="text-sm mt-1 opacity-70">Escolha uma mensagem da lista</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── PAINEL: SUPORTE (contact threads) ──────────────────────── */}
            {messagesView === 'contact' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Lista de threads */}
                <div className={`lg:col-span-1 ${selectedThread ? 'hidden lg:block' : ''}`}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">Conversas</h3>
                      <button onClick={loadUserMessages} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                      {messagesLoading ? (
                        <div className="p-6 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto" />
                        </div>
                      ) : userMessages.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Sem mensagens de suporte</p>
                        </div>
                      ) : (
                        userMessages.map(thread => (
                          <button
                            key={thread.id}
                            onClick={() => { loadThreadDetails(thread.id); markContactAsRead(thread.id); }}
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              selectedThread === thread.id ? 'bg-indigo-50' : ''
                            } ${thread.unread_count > 0 ? 'bg-blue-50/60' : ''}`}
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
                                  <p className="text-xs text-gray-400 truncate mt-0.5">{thread.last_message.substring(0, 60)}…</p>
                                )}
                                {thread.unread_count > 0 && (
                                  <span className="inline-block mt-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                    {thread.unread_count} nova{thread.unread_count > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhe da thread */}
                <div className={`lg:col-span-2 ${!selectedThread ? 'hidden lg:block' : ''}`}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {selectedThread && threadDetails ? (
                      <>
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { setSelectedThread(null); setThreadDetails(null); }}
                              className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5 text-gray-500" />
                            </button>
                            <div>
                              <h3 className="font-semibold text-gray-900">{threadDetails.thread.subject}</h3>
                              <p className="text-sm text-gray-500">{threadDetails.thread.from_user}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 max-h-[500px] overflow-y-auto space-y-4 bg-gray-50">
                          {threadDetails.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl p-4 ${
                                msg.sender_type === 'user'
                                  ? 'bg-indigo-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 rounded-bl-none shadow'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-2 ${msg.sender_type === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                                  {msg.sender_name} • {msg.created_at}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-12 text-center text-gray-400">
                        <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">Selecione uma conversa</p>
                        <p className="text-sm mt-2">Escolha uma mensagem da lista para ver os detalhes</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL DE AVATAR ────────────────────────────────────────────────── */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-2 px-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Alterar Foto de Perfil</h2>
                <button onClick={() => setShowAvatarModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={userData.avatar} alt="Avatar atual" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Foto atual</p>
              </div>
              <div className="space-y-4">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors">
                  <Camera className="h-5 w-5" />
                  {isUploading ? 'Enviando...' : 'Escolher Nova Foto'}
                </button>
                <button onClick={handleRemoveAvatar} disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors">
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

// ===== COMPONENTE: BOLHA DE MENSAGEM RFQ =====
function RfqThreadBubble({
  message,
  senderType,
  senderName,
  createdAt,
  attachments,
}: {
  message: string;
  senderType: 'user' | 'admin';
  senderName: string;
  createdAt: string;
  attachments?: RfqAttachment[];
}) {
  const isAdmin = senderType === 'admin';

  return (
    <div className={`flex gap-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-start ${
        isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
      }`}>
        {isAdmin ? 'YMR' : senderName.charAt(0).toUpperCase()}
      </div>

      {/* Conteúdo */}
      <div className={`max-w-[85%] space-y-1 ${isAdmin ? '' : 'items-end'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">{isAdmin ? 'Equipa Comercial' : 'Você'}</span>
          <span className="text-xs text-gray-400">{formatRelativeDate(createdAt)}</span>
        </div>

        <div className={`rounded-2xl p-4 ${
          isAdmin
            ? 'bg-white border border-gray-200 shadow-sm rounded-tl-none text-gray-900'
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>

        {/* Anexos */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {attachments.map((att, idx) => (
              <AttachmentCard key={idx} attachment={att} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== COMPONENTE: CARTÃO DE ANEXO =====
function AttachmentCard({ attachment, compact = false }: { attachment: RfqAttachment; compact?: boolean }) {
  const isPdf = attachment.mime_type === 'application/pdf' || attachment.filename.toLowerCase().endsWith('.pdf');

  return (
    <a
      href={attachment.file_path}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-xl border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 transition-all duration-200 shadow-sm ${
        compact ? 'px-3 py-2' : 'p-3'
      }`}
    >
      {/* Ícone PDF */}
      <div className={`flex items-center justify-center rounded-lg flex-shrink-0 bg-red-100 group-hover:bg-red-200 transition-colors ${
        compact ? 'w-8 h-8' : 'w-10 h-10'
      }`}>
        <FileText className={`text-red-600 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
      </div>

      {/* Nome e tamanho */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-800 group-hover:text-red-700 truncate transition-colors ${compact ? 'text-xs' : 'text-sm'}`}>
          {attachment.filename}
        </p>
        {attachment.file_size && !compact && (
          <p className="text-xs text-gray-400">{formatFileSize(attachment.file_size)}</p>
        )}
      </div>

      {/* Ícone de download */}
      <Download className={`text-gray-400 group-hover:text-red-600 flex-shrink-0 transition-colors ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
    </a>
  );
}

// ===== COMPONENTE: ITEM DE MENSAGEM DE RFQ (lista legacy — mantido por compatibilidade) =====
function RfqMessageItem({ msg }: { msg: any }) {
  return (
    <div className={`py-2 px-3 md:p-6 rounded-xl border-l-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group ${
      msg.is_read
        ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100'
        : 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-100'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.is_read ? 'bg-gray-200' : 'bg-indigo-200'}`}>
              <FileText className={`h-4 w-4 md:h-5 md:w-5 ${msg.is_read ? 'text-gray-600' : 'text-indigo-600'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{msg.rfq_name}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-sm text-gray-700 truncate">{msg.sender_name}</span>
                {!msg.is_read && msg.sender_type === 'admin' && (
                  <span className="ml-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-700 mb-2 font-medium line-clamp-2">{msg.message}</p>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.attachments.map((att: any, idx: number) => (
                    <a key={idx} href={att.file_path} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-gray-200 text-xs text-gray-700 hover:border-indigo-300 transition-colors"
                      onClick={e => e.stopPropagation()}>
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{att.filename}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{formatRelativeDate(msg.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;