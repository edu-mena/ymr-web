// pages/UserProfile/features/MessagesTab/components/AttachmentCard.tsx
import { FileText, Download } from 'lucide-react';
import { RfqAttachment, formatFileSize } from '../../types';

interface Props {
  attachment: RfqAttachment;
  compact?: boolean;
}

export default function AttachmentCard({ attachment, compact = false }: Props) {
  return (
    <a
      href={attachment.file_path}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-xl border border-gray-200 bg-white
        hover:border-red-300 hover:bg-red-50 transition-all duration-200 shadow-sm
        ${compact ? 'px-3 py-2' : 'p-3'}`}
    >
      <div className={`flex items-center justify-center rounded-lg flex-shrink-0
        bg-red-100 group-hover:bg-red-200 transition-colors
        ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
      >
        <FileText className={`text-red-600 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-800 group-hover:text-red-700 truncate transition-colors
          ${compact ? 'text-xs' : 'text-sm'}`}>
          {attachment.filename}
        </p>
        {attachment.file_size && !compact && (
          <p className="text-xs text-gray-400">{formatFileSize(attachment.file_size)}</p>
        )}
      </div>

      <Download className={`text-gray-400 group-hover:text-red-600 flex-shrink-0 transition-colors
        ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
      />
    </a>
  );
}