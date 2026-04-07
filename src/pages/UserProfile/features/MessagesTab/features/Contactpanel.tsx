// pages/UserProfile/features/MessagesTab/features/ContactPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, RefreshCw, ChevronLeft, Send } from 'lucide-react';
import { ContactThread, ThreadDetails } from '../../types';
import { apiFetch } from '../../../../../services/api';

interface Props {
  userMessages: ContactThread[];
  messagesLoading: boolean;
  selectedThread: string | null;
  threadDetails: ThreadDetails | null;
  onSelectThread: (threadId: string) => void;
  onBack: () => void;
  onRefresh: () => void;
}

export default function ContactPanel({
  userMessages,
  messagesLoading,
  selectedThread,
  threadDetails,
  onSelectThread,
  onBack,
  onRefresh,
}: Props) {
  const [replyText, setReplyText]     = useState('');
  const [sending, setSending]         = useState(false);
  const [localMessages, setLocalMessages] = useState(threadDetails?.messages ?? []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincroniza mensagens locais quando a thread muda
  useEffect(() => {
    setLocalMessages(threadDetails?.messages ?? []);
    setReplyText('');
  }, [threadDetails]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSendReply = async () => {
    const content = replyText.trim();
    if (!content || !selectedThread || sending) return;

    setSending(true);
    try {
      await apiFetch(`/user/messages/${selectedThread}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      // Adiciona a mensagem localmente sem recarregar tudo
      const newMsg = {
        id:          crypto.randomUUID(),
        content,
        sender_type: 'user' as const,
        sender_name: 'Você',
        created_at:  new Date().toLocaleString('pt-PT'),
      };
      setLocalMessages(prev => [...prev, newMsg]);
      setReplyText('');
    } catch (e) {
      console.error('Erro ao enviar resposta:', e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ── Lista de threads ── */}
      <div className={`lg:col-span-1 ${selectedThread ? 'hidden lg:block' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Conversas</h3>
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              title="Actualizar"
            >
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
                  onClick={() => onSelectThread(thread.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
                    ${selectedThread === thread.id ? 'bg-indigo-50' : ''}
                    ${thread.unread_count > 0 ? 'bg-blue-50/60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${thread.unread_count > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {thread.from_user}
                        </span>
                        <span className="text-xs text-gray-500">{thread.last_message_time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{thread.subject}</p>
                      {thread.last_message && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {thread.last_message.substring(0, 60)}…
                        </p>
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

      {/* ── Detalhe da thread ── */}
      <div className={`lg:col-span-2 ${!selectedThread ? 'hidden lg:block' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          {selectedThread && threadDetails ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onBack}
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

              {/* Mensagens */}
              <div className="flex-1 p-4 max-h-[420px] overflow-y-auto space-y-4 bg-gray-50">
                {localMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.sender_type === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-2 ${
                        msg.sender_type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {msg.sender_name} • {msg.created_at}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Campo de resposta */}
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva a sua resposta… (Enter para enviar, Shift+Enter para nova linha)"
                    rows={3}
                    className="flex-1 resize-none px-4 py-3 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      bg-gray-50 text-gray-900 placeholder-gray-400 transition-all"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-indigo-600
                      hover:bg-indigo-700 text-white text-sm font-medium rounded-xl
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar
                  </button>
                </div>
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
  );
}