// pages/UserProfile/features/MessagesTab/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, MessageCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import {
  RfqMessage, RfqThreadMessage, ContactThread, ThreadDetails,
} from '../types';
import RfqPanel from './features/RfqPanel';
import ContactPanel from './features/ContactPanel';

type MessagesView = 'rfq' | 'contact';

export default function MessagesTab() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [view, setView] = useState<MessagesView>('rfq');

  // ── RFQ messages ───────────────────────────────────────────────────────────
  const [rfqMessages, setRfqMessages] = useState<RfqMessage[]>([]);
  const [rfqMessagesLoading, setRfqMessagesLoading] = useState(false);
  const [selectedRfqMessage, setSelectedRfqMessage] = useState<RfqMessage | null>(null);
  const [rfqThreadLoading, setRfqThreadLoading] = useState(false);

  // ── Contact threads ────────────────────────────────────────────────────────
  const [userMessages, setUserMessages] = useState<ContactThread[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadDetails, setThreadDetails] = useState<ThreadDetails | null>(null);

  // ── Contadores ─────────────────────────────────────────────────────────────
  // FIX Bug 1: contar por rfq_id único — uma RFQ com múltiplas msgs admin
  // não lidas deve contar como 1, não como N.
  const unreadRfqIds = new Set(
    rfqMessages
      .filter(m => !m.is_read && m.sender_type === 'admin')
      .map(m => m.rfq_id)
  );
  const unreadRfqCount = unreadRfqIds.size;

  // FIX Bug 2: unread_count vem do backend — garantir que é número
  const unreadContactCount = userMessages.reduce(
    (sum, t) => sum + (Number(t.unread_count) || 0), 0
  );

  // ── URL: abertura automática de RFQ ───────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rfqId = params.get('rfq');
    if (rfqId) {
      setView('rfq');
      sessionStorage.setItem('open_rfq_thread', rfqId);
    }
  }, [location.search]);

  // ── Carregar RFQ messages ──────────────────────────────────────────────────
  const loadRfqMessages = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setRfqMessagesLoading(true);
    try {
      const res = await apiFetch('/user/rfq-messages');
      const messages: RfqMessage[] = res.data || [];
      setRfqMessages(messages);

      const pendingRfqId = sessionStorage.getItem('open_rfq_thread');
      if (pendingRfqId) {
        const target = messages.find(m => m.rfq_id === pendingRfqId);
        if (target) {
          handleSelectRfqMessage(target);
          sessionStorage.removeItem('open_rfq_thread');
        }
      }
    } catch (e) {
      console.error('Erro ao carregar mensagens de RFQ:', e);
    } finally {
      setRfqMessagesLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // ── Carregar thread de uma RFQ ────────────────────────────────────────────
  const loadRfqThread = useCallback(async (rfqId: string) => {
    setRfqThreadLoading(true);
    try {
      const res = await apiFetch(`/rfqs/${rfqId}/messages`);
      const replies: RfqThreadMessage[] = res.data || [];
      setSelectedRfqMessage(prev => prev ? { ...prev, replies } : prev);
    } catch (e) {
      console.error('Erro ao carregar thread RFQ:', e);
    } finally {
      setRfqThreadLoading(false);
    }
  }, []);

  // ── Marcar TODAS as msgs admin de uma RFQ como lidas ─────────────────────
  // FIX Bug 1: o backend (GET /rfqs/:id/messages) já faz UPDATE is_read = 1
  // para todas as mensagens admin da RFQ quando o utilizador carrega a thread.
  // Aqui actualizamos o estado local para reflectir isso imediatamente,
  // marcando TODAS as mensagens da mesma rfq_id como lidas.
  const markRfqAsRead = useCallback((rfqId: string) => {
    setRfqMessages(prev =>
      prev.map(m =>
        m.rfq_id === rfqId ? { ...m, is_read: true } : m
      )
    );
  }, []);

  // ── Seleccionar mensagem RFQ ───────────────────────────────────────────────
  const handleSelectRfqMessage = useCallback((msg: RfqMessage) => {
    setSelectedRfqMessage(msg);
    // Carregar thread — o backend marca todas as msgs admin como lidas
    loadRfqThread(msg.rfq_id);
    // Actualizar estado local imediatamente (sem esperar reload)
    markRfqAsRead(msg.rfq_id);
  }, [loadRfqThread, markRfqAsRead]);

  // ── Contact messages ───────────────────────────────────────────────────────
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
      console.error('Erro ao carregar thread:', e);
    }
  }, []);

  const markContactAsRead = useCallback(async (threadId: string) => {
    try {
      await apiFetch(`/user/messages/${threadId}/read`, { method: 'PUT' });
      // FIX Bug 2: actualizar estado local imediatamente em vez de recarregar tudo
      setUserMessages(prev =>
        prev.map(t =>
          t.id === threadId ? { ...t, unread_count: 0 } : t
        )
      );
    } catch { /* silencioso */ }
  }, []);

  const handleSelectThread = useCallback((threadId: string) => {
    loadThreadDetails(threadId);
    markContactAsRead(threadId);
  }, [loadThreadDetails, markContactAsRead]);

  // ── Carregar ao montar ─────────────────────────────────────────────────────
  useEffect(() => {
    loadRfqMessages();
    loadUserMessages();
  }, [loadRfqMessages, loadUserMessages]);

  const totalUnread = unreadRfqCount + unreadContactCount;

  return (
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
          <p className="text-gray-500 text-sm mt-1">
            RFQs respondidas, cotações e mensagens de suporte.
          </p>
        </div>
        <button
          onClick={() => { loadRfqMessages(); loadUserMessages(); }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200
            rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700 self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setView('rfq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${view === 'rfq' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
          onClick={() => setView('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${view === 'contact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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

      {/* Painéis */}
      {view === 'rfq' && (
        <RfqPanel
          rfqMessages={rfqMessages}
          rfqMessagesLoading={rfqMessagesLoading}
          rfqThreadLoading={rfqThreadLoading}
          selectedRfqMessage={selectedRfqMessage}
          onSelectMessage={handleSelectRfqMessage}
          onBack={() => setSelectedRfqMessage(null)}
        />
      )}

      {view === 'contact' && (
        <ContactPanel
          userMessages={userMessages}
          messagesLoading={messagesLoading}
          selectedThread={selectedThread}
          threadDetails={threadDetails}
          onSelectThread={handleSelectThread}
          onBack={() => { setSelectedThread(null); setThreadDetails(null); }}
          onRefresh={loadUserMessages}
        />
      )}
    </div>
  );
}

export type { MessagesView };