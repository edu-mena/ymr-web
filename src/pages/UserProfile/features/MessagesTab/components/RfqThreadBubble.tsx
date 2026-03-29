// pages/UserProfile/features/MessagesTab/components/RfqThreadBubble.tsx
import { RfqAttachment, formatRelativeDate } from '../../types';
import AttachmentCard from './AttachmentCard';

interface Props {
  message: string;
  senderType: 'user' | 'admin';
  senderName: string;
  createdAt: string;
  attachments?: RfqAttachment[];
}

export default function RfqThreadBubble({
  message, senderType, senderName, createdAt, attachments,
}: Props) {
  const isAdmin = senderType === 'admin';

  return (
    <div className={`flex gap-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center
        text-xs font-bold flex-shrink-0 self-start
        ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}
      >
        {isAdmin ? 'YMR' : senderName.charAt(0).toUpperCase()}
      </div>

      {/* Conteúdo */}
      <div className={`max-w-[85%] space-y-1 ${isAdmin ? '' : 'items-end'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">
            {isAdmin ? 'Equipa Comercial' : 'Você'}
          </span>
          <span className="text-xs text-gray-400">{formatRelativeDate(createdAt)}</span>
        </div>

        <div className={`rounded-2xl p-4 ${
          isAdmin
            ? 'bg-white border border-gray-200 shadow-sm rounded-tl-none text-gray-900'
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>

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