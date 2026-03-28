// src/pages/CartPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, ExternalLink, Package, AlertCircle, Plus, Info,
  CheckSquare, Square, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronRight, Trash2, ShoppingCart, X,
  Mail, Lock, FileText, Bell, Download, Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartProduct } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useActivityLog } from '../hooks/useActivityLog';
import { apiFetch } from '../services/api';

// ===== TIPOS =====
type Rfq = {
  id: string;
  name: string;
  date: string;
  itemCount: number;
  status?: 'active' | 'submitted' | 'completed' | 'cancelled';
};

type StatusInfo = {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

type ToastNotification = {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
};

// ===== TIPOS: RFQ RESPONSE =====
type RfqResponse = {
  rfq_id: string;
  rfq_name: string;
  message: string;
  admin_name: string;
  replied_at: string;
  attachments?: Array<{ filename: string; file_path: string; file_size?: number }>;
};

// ===== COMPONENTE TOAST =====
function Toast({ notification, onClose }: { notification: ToastNotification; onClose: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = notification.duration || 5000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
      if (remaining === 0) { clearInterval(timer); onClose(); }
    }, 50);

    return () => clearInterval(timer);
  }, [notification.duration, onClose]);

  const bgColors   = { success: 'bg-green-50 border-green-200', info: 'bg-blue-50 border-blue-200', warning: 'bg-yellow-50 border-yellow-200', error: 'bg-red-50 border-red-200' };
  const iconColors = { success: 'text-green-600', info: 'text-blue-600', warning: 'text-yellow-600', error: 'text-red-600' };
  const progressColors = { success: 'bg-green-500', info: 'bg-blue-500', warning: 'bg-yellow-500', error: 'bg-red-500' };
  const Icons = { success: CheckCircle, info: Info, warning: AlertCircle, error: XCircle };
  const Icon = Icons[notification.type];

  return (
    <div className="fixed top-4 right-4 z-[100] animate-[slideIn_0.3s_ease-out]">
      <div className={`rounded-xl shadow-2xl border p-4 min-w-[320px] max-w-md ${bgColors[notification.type]}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/50">
              <Icon className={`h-5 w-5 ${iconColors[notification.type]}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
              <p className="text-xs text-gray-600">{notification.message}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {notification.action && (
          <button
            onClick={() => { notification.action?.onClick(); onClose(); }}
            className="w-full text-left text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
          >
            {notification.action.label} →
          </button>
        )}

        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-50 ease-linear ${progressColors[notification.type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ===== BANNER: RFQ RESPONDIDA =====
// Aparece no topo da CartPage quando existe uma RFQ com status 'completed'
// e que tenha mensagens admin não lidas.
function RfqResponseBanner({
  responses,
  onDismiss,
  onViewMessages,
}: {
  responses: RfqResponse[];
  onDismiss: (rfqId: string) => void;
  onViewMessages: () => void;
}) {
  if (responses.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 mb-4 space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <Bell className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-indigo-900 text-sm">
            {responses.length === 1
              ? 'O seu pedido de cotação foi respondido!'
              : `${responses.length} pedidos de cotação foram respondidos!`}
          </p>
          <p className="text-xs text-indigo-600">Verifique as mensagens e os PDFs de cotação.</p>
        </div>
        <button
          onClick={onViewMessages}
          className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Ver Mensagens
        </button>
      </div>

      {responses.map((r) => (
        <div
          key={r.rfq_id}
          className="flex items-start justify-between gap-3 bg-white rounded-xl p-3 border border-indigo-100 shadow-sm"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <span className="font-medium text-gray-800 text-sm truncate">{r.rfq_name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">{formatRelativeDate(r.replied_at)}</span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{r.message}</p>

            {/* Anexos (PDFs) */}
            {r.attachments && r.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {r.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 hover:bg-red-100 transition-colors font-medium"
                  >
                    <Download className="h-3 w-3" />
                    {att.filename}
                  </a>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onDismiss(r.rfq_id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Dispensar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ===== HELPER =====
function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)}h`;
  return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' });
}

// ===== COMPONENTE PRINCIPAL =====
const CartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logActivity } = useActivityLog();

  const {
    cartItems, loading, error,
    addToRfq, removeFromRfq, createRfq,
    reloadCart, rfqList: contextRfqList, loadRfqs
  } = useCart();

  const [rfqList, setRfqList] = useState<Rfq[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<{ open: boolean; rfqId: string | null }>({ open: false, rfqId: null });
  const [collapsedRfqIds, setCollapsedRfqIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // ── Novas respostas de RFQ (status = completed com mensagens admin não lidas)
  const [rfqResponses, setRfqResponses] = useState<RfqResponse[]>([]);
  // IDs de banners já dispensados nesta sessão
  const [dismissedBanners, setDismissedBanners] = useState<string[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissed_rfq_banners') || '[]'); }
    catch { return []; }
  });

  // Sincroniza rfqList local com o contexto
  useEffect(() => {
    setRfqList(contextRfqList as Rfq[]);
  }, [contextRfqList]);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Carregar notificações de RFQs respondidas (completed) ──
  useEffect(() => {
    const loadRfqResponses = async () => {
      if (!user?.id) return;
      try {
        // Endpoint retorna array de mensagens admin não lidas
        // em RFQs com status 'completed'
        const res = await apiFetch('/rfqs/responses/unread');
        const data: RfqResponse[] = res.data || [];

        // Filtra banners já dispensados nesta sessão
        const visible = data.filter(r => !dismissedBanners.includes(r.rfq_id));
        setRfqResponses(visible);

        // Mostra toast para a primeira resposta nova, se existir
        if (visible.length > 0 && visible.some(r => r.attachments && r.attachments.length > 0)) {
          showTemporaryNotification(
            'info',
            '📄 Cotação disponível!',
            `O PDF da sua cotação "${visible[0].rfq_name}" já está disponível.`,
            { label: 'Ver nas Mensagens', onClick: () => navigate('/userprofile?tab=messages') },
            10_000
          );
        } else if (visible.length > 0) {
          showTemporaryNotification(
            'info',
            '💬 RFQ Respondida',
            `"${visible[0].rfq_name}" recebeu uma resposta. Verifique as mensagens.`,
            { label: 'Ver nas Mensagens', onClick: () => navigate('/userprofile?tab=messages') },
            8_000
          );
        }
      } catch {
        // Silencioso — não é crítico
      }
    };
    loadRfqResponses();
    // Verificar a cada 2 minutos
    const interval = setInterval(loadRfqResponses, 120_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ===== NOTIFICAÇÃO =====
  const showTemporaryNotification = useCallback((
    type: ToastNotification['type'],
    title: string,
    message: string,
    action?: { label: string; onClick: () => void },
    duration?: number
  ) => {
    setToast({ id: crypto.randomUUID(), type, title, message, action, duration });
  }, []);

  const handleDismissBanner = useCallback((rfqId: string) => {
    const updated = [...dismissedBanners, rfqId];
    setDismissedBanners(updated);
    sessionStorage.setItem('dismissed_rfq_banners', JSON.stringify(updated));
    setRfqResponses(prev => prev.filter(r => r.rfq_id !== rfqId));
  }, [dismissedBanners]);

  // ===== SELEÇÃO =====
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const selectAllUnassigned = useCallback(() => {
    setSelectedItems(cartItems.filter(item => !item.rfqId).map(item => item.id));
  }, [cartItems]);

  const clearSelection = useCallback(() => setSelectedItems([]), []);

  // ===== CRIAR RFQ =====
  const handleCreateRfq = useCallback(async (rfqName: string) => {
    if (!rfqName.trim() || selectedItems.length === 0) return;
    try {
      const result = await createRfq(rfqName, selectedItems);
      setSelectedItems([]);
      setShowRfqModal(false);
      showTemporaryNotification('success', 'RFQ criada', `${selectedItems.length} itens adicionados à RFQ "${result.name}"`);
      await logActivity({
        activityType: 'rfq_created',
        title: 'RFQ criada',
        description: `RFQ "${rfqName}" criada com ${selectedItems.length} itens`,
        metadata: { rfqName, rfqId: result.rfq_id, itemCount: selectedItems.length }
      });
    } catch (e: any) {
      showTemporaryNotification('error', 'Erro', e.message || 'Não foi possível criar a RFQ');
    }
  }, [selectedItems, createRfq, showTemporaryNotification, logActivity]);

  // ===== ADICIONAR A RFQ EXISTENTE =====
  const handleAddToExistingRfq = useCallback(async (rfqId: string) => {
    if (selectedItems.length === 0) return;
    try {
      await addToRfq(selectedItems, rfqId);
      setSelectedItems([]);
      setShowRfqModal(false);
      showTemporaryNotification('success', 'Itens adicionados', `${selectedItems.length} itens adicionados à RFQ`);
      await logActivity({
        activityType: 'rfq_updated',
        title: 'Itens adicionados à RFQ',
        description: `${selectedItems.length} itens adicionados a uma RFQ existente`,
        metadata: { rfqId, itemCount: selectedItems.length }
      });
    } catch (e: any) {
      showTemporaryNotification('error', 'Erro', e.message || 'Não foi possível adicionar à RFQ');
    }
  }, [selectedItems, addToRfq, showTemporaryNotification, logActivity]);

  // ===== SUBMETER RFQ =====
  const handleSubmitRfq = useCallback(async (rfqId: string) => {
    if (!user?.id) return;
    try {
      // 1. Submete RFQ
      await apiFetch(`/rfqs/${rfqId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // 2. Notificação automática ao utilizador (e-mail)
      await apiFetch(`/rfqs/${rfqId}/notify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {
        console.warn('Falha ao enviar notificação ao usuário');
      });

      // Actualiza estado local
      setRfqList(prev => prev.map(rfq =>
        rfq.id === rfqId ? { ...rfq, status: 'submitted' } : rfq
      ));

      // Sincroniza com o contexto
      await loadRfqs();

      const rfq = rfqList.find(r => r.id === rfqId);
      await logActivity({
        activityType: 'rfq_submitted',
        title: 'Pedido de cotação enviado',
        description: `RFQ "${rfq?.name}" submetida para análise comercial`,
        metadata: { rfqId, rfqName: rfq?.name }
      });

      showTemporaryNotification(
        'success',
        'Pedido enviado!',
        'Recebemos o seu pedido. Verifique as mensagens do perfil para atualizações.',
        { label: 'Ver mensagens', onClick: () => navigate('/userprofile?tab=messages') },
        8000
      );
    } catch (e: any) {
      showTemporaryNotification('error', 'Erro ao enviar', e.message || 'Tente novamente mais tarde');
    }
  }, [user?.id, rfqList, navigate, loadRfqs, showTemporaryNotification, logActivity]);

  // ===== REMOVER DA RFQ =====
  const handleRemoveFromRfq = useCallback(async (itemId: string, rfqId: string) => {
    const rfq = rfqList.find(r => r.id === rfqId);
    if (rfq?.status === 'submitted') {
      showTemporaryNotification('warning', 'Não permitido', 'Não é possível modificar RFQs já enviadas');
      return;
    }
    try {
      await removeFromRfq(itemId);
      if (selectedProduct?.id === itemId) {
        setSelectedProduct(prev => prev ? { ...prev, rfqId: null, status: 'Pendente' } : prev);
      }
      showTemporaryNotification('success', 'Item removido', 'Produto removido da RFQ com sucesso');
    } catch (e: any) {
      showTemporaryNotification('error', 'Erro', 'Não foi possível remover o item');
    }
  }, [rfqList, selectedProduct, removeFromRfq, showTemporaryNotification]);

  // ===== UTILITÁRIOS =====
  const getStatusInfo = useCallback((status: string | null, rfqStatus?: string): StatusInfo => {
    if (rfqStatus === 'submitted')  return { color: 'text-green-600 bg-green-100',  icon: CheckCircle, label: 'Enviado'   };
    if (rfqStatus === 'completed')  return { color: 'text-blue-600 bg-blue-100',    icon: CheckCircle, label: 'Respondido' };
    if (rfqStatus === 'cancelled')  return { color: 'text-red-600 bg-red-100',      icon: XCircle,     label: 'Cancelado' };
    switch (status) {
      case 'awaiting':
      case 'Em Espera':   return { color: 'text-yellow-600 bg-yellow-100', icon: Clock,        label: 'Em Espera'  };
      case 'completed':
      case 'Concluído':   return { color: 'text-green-600 bg-green-100',   icon: CheckCircle,  label: 'Concluído'  };
      case 'submitted':   return { color: 'text-green-600 bg-green-100',   icon: CheckCircle,  label: 'Enviado'    };
      case 'cancelled':
      case 'Cancelado':   return { color: 'text-red-600 bg-red-100',       icon: XCircle,      label: 'Cancelado'  };
      default:            return { color: 'text-gray-600 bg-gray-100',     icon: AlertCircle,  label: 'Pendente'   };
    }
  }, []);

  const getAvailabilityColor = useCallback((availability: string) => {
    switch (availability) {
      case 'Em Estoque':    return 'text-green-600 bg-green-100';
      case 'Sob Encomenda': return 'text-blue-600 bg-blue-100';
      case 'Indisponível':  return 'text-red-600 bg-red-100';
      default:              return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const toggleRfqCollapse = useCallback((rfqId: string) => {
    setCollapsedRfqIds(prev => ({ ...prev, [rfqId]: !prev[rfqId] }));
  }, []);

  const handleRfqClick = useCallback((rfqId: string) => {
    setSelectedRfqId(rfqId);
    setSelectedProduct(null);
    setCollapsedRfqIds(prev => ({ ...prev, [rfqId]: false }));
  }, []);

  const handleProductClick = useCallback((product: CartProduct) => {
    if (isMobile) { setSelectedProduct(product); setShowProductModal(true); }
    else { setSelectedProduct(product); setSelectedRfqId(null); }
  }, [isMobile]);

  // Agrupar por RFQ
  const groupedItems = cartItems.reduce<Record<string, CartProduct[]>>((groups, item) => {
    const key = item.rfqId || 'unassigned';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  const unassignedCount    = cartItems.filter(item => !item.rfqId).length;
  const draftRfqCount      = rfqList.filter(rfq => rfq.status === 'active' || !rfq.status).length;
  const pendingOrdersCount = rfqList.filter(rfq => rfq.status === 'submitted').length;
  const completedCount     = rfqList.filter(rfq => rfq.status === 'completed').length;

  // ===== LOADING / ERROR =====
  if (loading) {
    return (
      <div className="min-h-screen page-content bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen page-content bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => reloadCart()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-content bg-gray-50">
      {toast && <Toast notification={toast} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">{cartItems.length} produtos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">
                <span className="font-medium text-yellow-700">{pendingOrdersCount}</span> Em Análise
              </span>
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">
                  <span className="font-medium text-blue-700">{completedCount}</span> Respondidas
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">
                <span className="font-medium text-blue-700">{draftRfqCount}</span> Rascunhos de RFQ
              </span>
            </div>
            {unassignedCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-gray-600">
                  <span className="font-medium text-orange-700">{unassignedCount}</span> Não atribuídos
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {unassignedCount > 0 && (
              <button onClick={selectAllUnassigned} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                <CheckSquare className="h-4 w-4" /> Selecionar Todos
              </button>
            )}
            {selectedItems.length > 0 && (
              <>
                <button onClick={clearSelection} className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                  Limpar Seleção
                </button>
                <button onClick={() => setShowRfqModal(true)} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Adicionar à RFQ ({selectedItems.length})
                </button>
              </>
            )}
            <button onClick={() => setShowRfqModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1">
              <Plus className="h-4 w-4" /> Criar RFQ
            </button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── BANNER DE RESPOSTAS DE RFQ ── */}
          <RfqResponseBanner
            responses={rfqResponses}
            onDismiss={handleDismissBanner}
            onViewMessages={() => navigate('/userprofile?tab=messages')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LISTA */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">O seu carrinho está vazio.</p>
                  <a href="/products" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Produtos
                  </a>
                </div>
              )}

              {unassignedCount > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Produtos Não Atribuídos ({unassignedCount})
                  </h3>
                  <div className="space-y-3">
                    {cartItems.filter(item => !item.rfqId).map(item => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        onToggleSelect={toggleItemSelection}
                        onViewDetails={handleProductClick}
                        showSelection={true}
                        selectedProductId={selectedProduct?.id}
                        getStatusInfo={getStatusInfo}
                        getAvailabilityColor={getAvailabilityColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(Object.entries(groupedItems) as [string, CartProduct[]][]).map(([rfqId, items]) => {
                if (rfqId === 'unassigned') return null;
                const rfq = rfqList.find(r => r.id === rfqId);
                const isSubmitted  = rfq?.status === 'submitted';
                const isCompleted  = rfq?.status === 'completed';
                const hasResponse  = rfqResponses.some(r => r.rfq_id === rfqId);

                return (
                  <div
                    key={rfqId}
                    className={`bg-white rounded-2xl shadow-lg border transition-all duration-300 ${
                      isCompleted  ? 'border-blue-200 bg-blue-50/10'  :
                      isSubmitted  ? 'border-green-200 bg-green-50/20' :
                                     'border-gray-100 hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => handleRfqClick(rfqId)}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={e => { e.stopPropagation(); toggleRfqCollapse(rfqId); }}
                          className="p-2 rounded-xl hover:bg-blue-50 transition-colors flex-shrink-0"
                        >
                          {collapsedRfqIds[rfqId]
                            ? <ChevronRight className="h-5 w-5 text-blue-600" />
                            : <ChevronDown className="h-5 w-5 text-blue-600" />
                          }
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800 truncate">{rfq?.name || '…'}</h3>
                            {/* Ponto de notificação quando existe resposta não lida */}
                            {hasResponse && (
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" title="Nova resposta disponível" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{rfq?.date} • {items.length} itens</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(isSubmitted || isCompleted) && (
                          <button
                            onClick={e => { e.stopPropagation(); setShowInfoModal({ open: true, rfqId }); }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="Informações do pedido"
                          >
                            <Info className="h-5 w-5" />
                          </button>
                        )}

                        {rfq?.status && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rfq.status === 'completed' ? 'bg-blue-100 text-blue-800'  :
                            rfq.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                                         'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusInfo(null, rfq.status).label}
                          </span>
                        )}

                        {!isSubmitted && !isCompleted && (
                          <button
                            onClick={e => { e.stopPropagation(); handleSubmitRfq(rfqId); }}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Fechar Pedido
                          </button>
                        )}

                        {/* Botão Ver Resposta em RFQs completed */}
                        {isCompleted && (
                          <button
                            onClick={e => { e.stopPropagation(); navigate('/userprofile?tab=messages'); }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Mail className="h-4 w-4" />
                            Ver Resposta
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Faixa de resposta disponível */}
                    {isCompleted && hasResponse && (
                      <div className="mx-4 mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-sm text-blue-800">
                        <Bell className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span>A equipa comercial respondeu à sua cotação.</span>
                        <button
                          onClick={() => navigate('/userprofile?tab=messages')}
                          className="ml-auto text-xs font-semibold text-blue-700 underline hover:no-underline"
                        >
                          Ver Mensagens
                        </button>
                      </div>
                    )}

                    {!collapsedRfqIds[rfqId] && (
                      <div className="px-4 pb-4 space-y-3">
                        {items.map(item => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            onViewDetails={handleProductClick}
                            showSelection={false}
                            onRemoveFromRfq={isSubmitted || isCompleted ? undefined : () => handleRemoveFromRfq(item.id, rfqId)}
                            selectedProductId={selectedProduct?.id}
                            getStatusInfo={getStatusInfo}
                            getAvailabilityColor={getAvailabilityColor}
                            isRfqSubmitted={isSubmitted || isCompleted}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAINEL LATERAL */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {selectedRfqId ? 'Detalhes da RFQ' : selectedProduct ? 'Detalhes do Produto' : 'Selecione um item'}
                </h2>
                {selectedRfqId ? (
                  <RfqDetails rfqId={selectedRfqId} items={groupedItems[selectedRfqId] || []} rfqList={rfqList} rfqResponses={rfqResponses} getStatusInfo={getStatusInfo} onViewMessages={() => navigate('/userprofile?tab=messages')} />
                ) : selectedProduct ? (
                  <ProductDetails product={selectedProduct} getStatusInfo={getStatusInfo} getAvailabilityColor={getAvailabilityColor} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Clique em um produto ou RFQ para ver os detalhes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL PRODUTO (Mobile) */}
      {showProductModal && selectedProduct && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Detalhes do Produto</h2>
              <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <ProductDetails product={selectedProduct} getStatusInfo={getStatusInfo} getAvailabilityColor={getAvailabilityColor} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL RFQ */}
      {showRfqModal && (
        <RfqModal
          selectedCount={selectedItems.length}
          rfqList={rfqList.filter(r => r.status === 'active' || !r.status)}
          onCreateNew={handleCreateRfq}
          onAddToExisting={handleAddToExistingRfq}
          onClose={() => setShowRfqModal(false)}
        />
      )}

      {/* MODAL INFORMAÇÃO RFQ */}
      {showInfoModal.open && showInfoModal.rfqId && (() => {
        const rfq = rfqList.find(r => r.id === showInfoModal.rfqId);
        const response = rfqResponses.find(r => r.rfq_id === showInfoModal.rfqId);
        const isCompleted = rfq?.status === 'completed';

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isCompleted ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {isCompleted
                      ? <Mail className="h-8 w-8 text-blue-600" />
                      : <CheckCircle className="h-8 w-8 text-green-600" />
                    }
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {isCompleted ? 'Cotação Respondida' : 'Pedido Recebido'}
                  </h3>
                  <p className="text-gray-600">
                    {isCompleted
                      ? `A sua cotação "${rfq?.name}" foi respondida pela equipa comercial.`
                      : `Recebemos o pedido "${rfq?.name}". Estamos a analisar.`
                    }
                  </p>
                </div>

                {/* Detalhes da resposta */}
                {isCompleted && response && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-2">
                    <p className="text-sm text-blue-800 line-clamp-3">{response.message}</p>
                    {response.attachments && response.attachments.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                          <Paperclip className="h-3 w-3" /> Anexos ({response.attachments.length})
                        </p>
                        {response.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 underline"
                          >
                            <Download className="h-3 w-3" />
                            {att.filename}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800">
                      📧 A nossa equipa comercial analisará a sua solicitação e enviará uma cotação completa.
                      <br /><br />
                      🔔 Poderá acompanhar o estado na aba <strong>"Mensagens"</strong> do seu perfil.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInfoModal({ open: false, rfqId: null })}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => { navigate('/userprofile?tab=messages'); setShowInfoModal({ open: false, rfqId: null }); }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Mensagens
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// ===== PRODUCT CARD =====
interface ProductCardProps {
  item: CartProduct;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onViewDetails: (item: CartProduct) => void;
  showSelection: boolean;
  onRemoveFromRfq?: () => void;
  selectedProductId?: string;
  getStatusInfo: (s: string | null, rfqStatus?: string) => StatusInfo;
  getAvailabilityColor: (a: string) => string;
  isRfqSubmitted?: boolean;
}

function ProductCard({
  item, isSelected = false, onToggleSelect = () => {}, onViewDetails,
  showSelection, onRemoveFromRfq, selectedProductId,
  getStatusInfo, getAvailabilityColor, isRfqSubmitted = false
}: ProductCardProps) {
  const statusInfo = getStatusInfo(item.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
        selectedProductId === item.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
      } ${isRfqSubmitted ? 'opacity-80' : ''}`}
      onClick={() => onViewDetails(item)}
    >
      <div className="flex items-start gap-4">
        {showSelection && (
          <div
            className="mt-1 cursor-pointer flex items-center min-w-[28px] self-stretch"
            onClick={e => { e.stopPropagation(); onToggleSelect(item.id); }}
          >
            {isSelected
              ? <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0" />
              : <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
            }
          </div>
        )}

        <div className="flex-shrink-0">
          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
          <p className="text-sm text-gray-600">{item.brand} • {item.model}</p>
          <p className="text-xs text-gray-500 mt-1">COD: {item.cod}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getAvailabilityColor(item.availability)}`}>
              {item.availability}
            </span>
            {item.status && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onViewDetails(item); }}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Ver Detalhes"
          >
            <Eye className="h-5 w-5" />
          </button>
          {onRemoveFromRfq && !isRfqSubmitted && (
            <button
              onClick={e => { e.stopPropagation(); onRemoveFromRfq(); }}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Remover da RFQ"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          {isRfqSubmitted && (
            <div className="p-2 text-gray-400" title="RFQ enviada — não pode ser modificada">
              <Lock className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== PRODUCT DETAILS =====
function ProductDetails({
  product, getStatusInfo, getAvailabilityColor
}: {
  product: CartProduct;
  getStatusInfo: (s: string | null, rfqStatus?: string) => StatusInfo;
  getAvailabilityColor: (a: string) => string;
}) {
  const statusInfo = getStatusInfo(product.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <img src={product.image} alt={product.name} className="w-full max-w-48 h-48 object-cover rounded-lg shadow-lg mx-auto" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.brand} • {product.model}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Código:</span>
            <span className="font-medium">{product.cod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Categoria:</span>
            <span className="font-medium">{product.category}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getAvailabilityColor(product.availability)}`}>
            {product.availability}
          </span>
          {product.status && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${statusInfo.color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusInfo.label}
            </span>
          )}
        </div>
      </div>

      {product.description && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Descrição</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
        </div>
      )}

      {product.features && product.features.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Características</h4>
          <ul className="space-y-1">
            {product.features.map((feature: string, index: number) => (
              <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.rfqId && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Informações da RFQ</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">RFQ ID:</span>
              <span className="font-medium font-mono text-xs">{product.rfqId.substring(0, 8)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Adicionado em:</span>
              <span className="font-medium">{product.addedDate}</span>
            </div>
          </div>
        </div>
      )}

      <a
        href={`/products/${product.productId}`}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="h-4 w-4" />
        Ver Página do Produto
      </a>
    </div>
  );
}

// ===== RFQ DETAILS (painel lateral) =====
function RfqDetails({
  rfqId, items, rfqList, rfqResponses, getStatusInfo, onViewMessages
}: {
  rfqId: string;
  items: CartProduct[];
  rfqList: Rfq[];
  rfqResponses: RfqResponse[];
  getStatusInfo: (s: string | null, rfqStatus?: string) => StatusInfo;
  onViewMessages: () => void;
}) {
  const rfq = rfqList.find(r => r.id === rfqId);
  const response = rfqResponses.find(r => r.rfq_id === rfqId);
  const firstImage = items[0]?.image;
  const isCompleted = rfq?.status === 'completed';

  const statusCounts = items.reduce<Record<string, number>>((acc, it) => {
    const key = it.status || 'Sem Status';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {firstImage && (
        <div className="text-center">
          <img src={firstImage} alt="Produto da RFQ" className="w-full max-w-48 h-48 object-cover rounded-lg shadow-lg mx-auto" />
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{rfq?.name || '…'}</h3>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="px-3 py-1 rounded-full bg-gray-100 font-medium text-gray-700">{items.length} produtos</span>
          {rfq?.status && (
            <span className={`px-3 py-1 rounded-full font-medium text-sm ${getStatusInfo(null, rfq.status).color}`}>
              {getStatusInfo(null, rfq.status).label}
            </span>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Estado dos Produtos</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const info = getStatusInfo(status === 'Sem Status' ? null : status);
            return (
              <span key={status} className={`px-3 py-1 text-sm rounded-full ${info.color}`}>
                {status}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Resposta do admin no painel lateral */}
      {isCompleted && response && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">Resposta da Equipa Comercial</p>
          </div>
          <p className="text-sm text-blue-700 line-clamp-4">{response.message}</p>

          {response.attachments && response.attachments.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-blue-200">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> {response.attachments.length} anexo(s)
              </p>
              {response.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-medium underline"
                >
                  <Download className="h-3 w-3" />
                  {att.filename}
                </a>
              ))}
            </div>
          )}

          <button
            onClick={onViewMessages}
            className="w-full text-center text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 border-t border-blue-200 pt-2"
          >
            Ver conversa completa →
          </button>
        </div>
      )}

      {rfq?.status === 'submitted' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Esta RFQ já foi enviada para análise comercial. Não é possível adicionar ou remover itens.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== RFQ MODAL =====
function RfqModal({
  selectedCount, rfqList, onCreateNew, onAddToExisting, onClose
}: {
  selectedCount: number;
  rfqList: Rfq[];
  onCreateNew: (name: string) => Promise<void>;
  onAddToExisting: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [rfqName, setRfqName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!rfqName.trim()) return;
    setCreating(true);
    try { await onCreateNew(rfqName); }
    finally { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {selectedCount > 0 ? `Adicionar ${selectedCount} produto(s) à RFQ` : 'Criar RFQ'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Criar Nova RFQ</h4>
            <input
              type="text"
              placeholder="Nome do projeto / RFQ"
              value={rfqName}
              onChange={e => setRfqName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleCreate}
              disabled={!rfqName.trim() || creating}
              className="w-full mt-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Criando…' : 'Criar Nova RFQ'}
            </button>
          </div>

          {rfqList.length > 0 && selectedCount > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Adicionar a RFQ Existente</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {rfqList.map(rfq => (
                  <button
                    key={rfq.id}
                    onClick={() => onAddToExisting(rfq.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{rfq.name}</div>
                    <div className="text-sm text-gray-500">{rfq.date} • {rfq.itemCount} itens</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;