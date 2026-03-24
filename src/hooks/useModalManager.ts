// hooks/useModalManager.ts
import { useState, useCallback, useEffect } from 'react';

export const useModalManager = () => {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const openModal = useCallback((modalId: string) => {
    setOpenModals(prev => new Set(prev).add(modalId));
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modalId);
      if (next.size === 0) {
        document.body.style.overflow = 'auto';
      }
      return next;
    });
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
    document.body.style.overflow = 'auto';
  }, []);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModals.size > 0) {
        closeAll();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [openModals, closeAll]);

  return { openModal, closeModal, closeAll, isOpen: (id: string) => openModals.has(id) };
};
