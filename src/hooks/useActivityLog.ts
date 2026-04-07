// src/hooks/useActivityLog.ts
import { useCallback } from 'react';
import { apiFetch } from '../services/api';

type ActivityType =
  | 'login'
  | 'logout'
  | 'profile_updated'
  | 'avatar_updated'
  | 'cart_updated'
  | 'rfq_created'
  | 'rfq_updated'
  | 'rfq_submitted'  // ✅ Adicionado
  | 'order_created'
  | 'document_downloaded'
  | 'message_sent'
  | 'product_viewed';

interface LogActivityParams {
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export function useActivityLog() {
  const logActivity = useCallback(async ({
    activityType,
    title,
    description,
    metadata
  }: LogActivityParams) => {
    try {
      await apiFetch('/user/activities', {
        method: 'POST',
        silent: true, // falha silenciosamente — nunca dispara refresh nem throw
        body: JSON.stringify({
          activity_type: activityType,
          title,
          description,
          metadata
        })
      });
    } catch {
      // Nunca chega aqui com silent:true, mas mantém-se por segurança
    }
  }, []);

  return { logActivity };
}