// pages/UserProfile/features/OrdersTab.tsx
// Aba "Cotações" — mostra RFQs fechadas (submitted/completed/cancelled)
// com a resposta do admin e ficheiro de cotação quando disponível.
import { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { apiFetch } from '../../../services/api';

type AdminReply = {
  message: string;
  replied_at: string;
  filename?: string;
  file_path?: string;
};

type RfqOrder = {
  id: string;
  service: string;
  date: string;
  status: string;
  statusColor: string;
  items_count: number;
  value: string;
  admin_reply: AdminReply | null;
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'Respondida') return <CheckCircle className="h-4 w-4 text-blue-500" />;
  if (status === 'Cancelada')  return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-yellow-500" />;
}

function RfqRow({ rfq }: { rfq: RfqOrder }) {
  const [expanded, setExpanded] = useState(false);
  const hasReply = !!rfq.admin_reply;

  return (
    <>
      <tr
        className={`border-b border-gray-100 transition-colors ${hasReply ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-gray-50'}`}
        onClick={() => hasReply && setExpanded(e => !e)}
      >
        <td className="py-4 px-4 font-mono text-xs text-gray-500">
          #{rfq.id.slice(0, 8).toUpperCase()}
        </td>
        <td className="py-4 px-4 font-medium text-gray-900">{rfq.service}</td>
        <td className="py-4 px-4 text-gray-500 text-sm">{rfq.date}</td>
        <td className="py-4 px-4 text-gray-500 text-sm text-center">{rfq.items_count} produto{rfq.items_count !== 1 ? 's' : ''}</td>
        <td className="py-4 px-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${rfq.statusColor}`}>
            <StatusIcon status={rfq.status} />
            {rfq.status}
          </span>
        </td>
        <td className="py-4 px-4 text-right">
          {hasReply ? (
            <div className="flex items-center justify-end gap-2">
              {rfq.admin_reply?.file_path && (
                <a
                  href={rfq.admin_reply.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 hover:bg-red-100 transition-colors font-medium"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </a>
              )}
              <button className="p-1 text-gray-400 hover:text-gray-600">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Aguardando</span>
          )}
        </td>
      </tr>

      {/* Linha expandida com a resposta do admin */}
      {expanded && hasReply && rfq.admin_reply && (
        <tr className="bg-blue-50/30 border-b border-blue-100">
          <td colSpan={6} className="px-6 py-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-indigo-700">YMR</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">Equipa Comercial</span>
                <span className="text-xs text-gray-400">
                  {new Date(rfq.admin_reply.replied_at).toLocaleDateString('pt-AO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-blue-200 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
                {rfq.admin_reply.message}
              </div>

              {rfq.admin_reply.file_path && rfq.admin_reply.filename && (
                <a
                  href={rfq.admin_reply.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium truncate max-w-[200px]">{rfq.admin_reply.filename}</span>
                  <Download className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                </a>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface Props {
  // mantido por compatibilidade mas dados são carregados internamente
  orders?: any[];
}

export default function OrdersTab(_props: Props) {
  const [rfqs, setRfqs] = useState<RfqOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/user/rfqs');
        setRfqs(res.data || []);
      } catch (e: any) {
        setError(e.message || 'Erro ao carregar cotações');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Cotações</h3>
            <p className="text-sm text-gray-500 mt-1">
              Pedidos de cotação enviados e respectivas respostas.
            </p>
          </div>
          {rfqs.some(r => r.admin_reply?.file_path) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Paperclip className="h-3.5 w-3.5" />
              Clique numa linha para ver a resposta
            </div>
          )}
        </div>

        {error && (
          <div className="text-center py-6 text-red-500 text-sm">{error}</div>
        )}

        {!error && rfqs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma cotação enviada</p>
            <p className="text-sm text-gray-400 mt-1">
              Os seus pedidos de cotação aparecerão aqui após serem submetidos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">ID</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nome</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Data</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide text-center">Produtos</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Estado</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">Cotação</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map(rfq => (
                  <RfqRow key={rfq.id} rfq={rfq} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}