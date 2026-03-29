// pages/UserProfile/features/types.ts
// Tipos partilhados por todas as features do UserProfile

export type UserActivity = {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  time: string;
};

export type Order = {
  id: string;
  service: string;
  date: string;
  status: string;
  statusColor: string;
  value: string;
};

export type RfqAttachment = {
  id: string;
  filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
};

export type RfqMessage = {
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
  replies?: RfqThreadMessage[];
};

export type RfqThreadMessage = {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  created_at: string;
  attachments?: RfqAttachment[];
};

export type ContactThread = {
  id: string;
  subject: string;
  from_user: string;
  last_message_time: string;
  last_message?: string;
  unread_count: number;
};

export type ThreadDetails = {
  thread: { subject: string; from_user: string };
  messages: Array<{
    id: string;
    content: string;
    sender_type: 'user' | 'admin';
    sender_name: string;
    created_at: string;
  }>;
};

// ── Helpers de formatação ──────────────────────────────────────────────────

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)}h`;
  if (diff < 7 * 86_400_000) return date.toLocaleDateString('pt-AO', { weekday: 'short' });
  return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}