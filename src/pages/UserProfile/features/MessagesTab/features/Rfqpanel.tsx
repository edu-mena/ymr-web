// pages/UserProfile/features/MessagesTab/features/RfqPanel.tsx
import { FileText, Clock, Mail, Paperclip, ChevronLeft, MailOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RfqMessage, formatRelativeDate } from '../../types';
import RfqThreadBubble from '../components/RfqThreadBubble';
import AttachmentCard from '../components/AttachmentCard';

interface Props {
  rfqMessages: RfqMessage[];
  rfqMessagesLoading: boolean;
  rfqThreadLoading: boolean;
  selectedRfqMessage: RfqMessage | null;
  onSelectMessage: (msg: RfqMessage) => void;
  onBack: () => void;
}

export default function RfqPanel({
  rfqMessages,
  rfqMessagesLoading,
  rfqThreadLoading,
  selectedRfqMessage,
  onSelectMessage,
  onBack,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ── Lista de RFQ messages ── */}
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
                  onClick={() => onSelectMessage(msg)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors relative
                    ${selectedRfqMessage?.id === msg.id ? 'bg-indigo-50' : ''}
                    ${!msg.is_read && msg.sender_type === 'admin' ? 'bg-indigo-50/60' : ''}`}
                >
                  {!msg.is_read && msg.sender_type === 'admin' && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500" />
                  )}

                  <div className="flex items-start gap-3 pl-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                      ${msg.rfq_status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'}`}
                    >
                      {msg.rfq_status === 'completed'
                        ? <Mail className="h-4 w-4 text-blue-600" />
                        : <Clock className="h-4 w-4 text-gray-500" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <span className={`text-sm truncate
                          ${!msg.is_read && msg.sender_type === 'admin'
                            ? 'font-bold text-gray-900'
                            : 'font-medium text-gray-800'}`}
                        >
                          {msg.rfq_name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatRelativeDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{msg.sender_name}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{msg.message}</p>

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

      {/* ── Detalhe da RFQ message ── */}
      <div className={`lg:col-span-2 ${!selectedRfqMessage ? 'hidden lg:block' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
          {selectedRfqMessage ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-start gap-3">
                  <button
                    onClick={onBack}
                    className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {selectedRfqMessage.rfq_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedRfqMessage.rfq_status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        selectedRfqMessage.rfq_status === 'submitted' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedRfqMessage.rfq_status === 'completed' ? '✓ Respondida' :
                         selectedRfqMessage.rfq_status === 'submitted' ? '⏳ Em análise' :
                         selectedRfqMessage.rfq_status}
                      </span>
                      <button
                        onClick={() => navigate('/cart')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver no carrinho
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversa */}
              <div className="p-4 max-h-[480px] overflow-y-auto space-y-4">
                <RfqThreadBubble
                  message={selectedRfqMessage.message}
                  senderType={selectedRfqMessage.sender_type}
                  senderName={selectedRfqMessage.sender_name}
                  createdAt={selectedRfqMessage.created_at}
                  attachments={selectedRfqMessage.attachments}
                />

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

              {/* Secção de anexos da resposta */}
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

              {/* Nota de status pendente */}
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
  );
}