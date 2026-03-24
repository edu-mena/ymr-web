// src/context/CartContext.tsx
//
// LÓGICA DO CARRINHO:
// ─ Utilizador NÃO autenticado → carrinho guardado em localStorage
// ─ Utilizador autenticado      → carrinho na API (BD)
// ─ No login / registo          → chama syncCartAfterLogin() que migra
//   localStorage para a BD e limpa o cache local

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../services/api';

// ─── TIPOS ───────────────────────────────────────────────────────────────────
export type CartProduct = {
  id: string;          // cart item id (da BD) ou produto id (localStorage)
  productId: string;   // id real do produto
  name: string;
  description: string;
  brand: string;
  model: string;
  cod: string;
  category: string;
  availability: string;
  image: string;
  features: string[];
  rfqId: string | null;
  status: string | null;
  addedDate: string;
  quantity: number;
  price: number;
};

export type Rfq = {
  id: string;
  name: string;
  date: string;
  itemCount: number;
  status?: 'active' | 'submitted' | 'completed' | 'cancelled';
};

// ✅ createRfq agora retorna { rfq_id, name } para o CartPage usar o ID real
type CartContextValue = {
  cartItems: CartProduct[];
  rfqList: Rfq[];
  cartCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (product: Omit<CartProduct, 'id' | 'rfqId' | 'status' | 'addedDate'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  syncCartAfterLogin: (userId: string) => Promise<void>;
  reloadCart: () => Promise<void>;
  loadRfqs: () => Promise<void>;
  addToRfq: (itemIds: string[], rfqId: string) => Promise<void>;
  removeFromRfq: (itemId: string) => Promise<void>;
  createRfq: (name: string, itemIds: string[]) => Promise<{ rfq_id: string; name: string }>;
};

// ─── CHAVES ──────────────────────────────────────────────────────────────────
const LOCAL_CART_KEY = 'ymr_guest_cart';
const SESSION_KEY = 'cart_session';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function loadLocalCart(): CartProduct[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartProduct[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

function clearLocalCart() {
  localStorage.removeItem(LOCAL_CART_KEY);
}

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/** Traduz campos da resposta da API para CartProduct */
function mapApiItem(raw: any): CartProduct {
  const images: string[] = Array.isArray(raw.images) ? raw.images : [];
  const features: string[] = Array.isArray(raw.features) ? raw.features : [];

  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    awaiting: 'Em Espera',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  return {
    id: raw.id ?? '',
    productId: raw.product_id ?? raw.id ?? '',
    name: raw.product_name ?? raw.name ?? '',
    description: raw.description ?? '',
    brand: raw.brand_name ?? raw.brand_id ?? '',
    model: raw.model ?? '',
    cod: raw.product_code ?? raw.code ?? '',
    category: raw.category_name ?? raw.subcategory_name ?? '',
    availability: raw.availability ?? 'Indisponível',
    image: images[0] ?? '',
    features,
    rfqId: raw.rfq_id ?? null,
    status: statusMap[raw.status ?? ''] ?? raw.status ?? null,
    addedDate: raw.created_at ? raw.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    quantity: raw.quantity ?? 1,
    price: raw.price ?? 0,
  };
}

/** Traduz campos da resposta da API para Rfq
 *
 * FIX: O backend devolve `created_at` e `item_count` (snake_case).
 * Antes o `date` ficava undefined porque se tentava ler `raw.date`.
 * Agora lê `raw.date` (se o backend mapear) OU faz fallback para `raw.created_at`.
 */
function mapApiRfq(raw: any): Rfq {
  return {
    id: raw.id ?? '',
    name: raw.name ?? '',
    // ✅ aceita tanto `date` (se o backend já mapear) como `created_at`
    date: raw.date ?? (raw.created_at ? raw.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    // ✅ aceita tanto `itemCount` (camelCase) como `item_count` (snake_case do backend)
    itemCount: raw.itemCount ?? raw.item_count ?? 0,
    status: raw.status ?? 'active',
  };
}

// ─── CONTEXTO ────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children, userId }: { children: React.ReactNode; userId?: string | null }) {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [rfqList, setRfqList] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita chamadas duplas ao trocar userId
  const loadingRef = useRef(false);

  // Usa ref para userId sempre actualizado (evita closure stale)
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // ─── CARREGAR CARRINHO ────────────────────────────────────────────────────
  const reloadCart = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        setCartItems(loadLocalCart());
        return;
      }

      const sessionId = getSessionId();
      const params = new URLSearchParams();
      params.append('user_id', userId);
      params.append('session_id', sessionId);

      const res = await apiFetch(`/shopping-carts?${params.toString()}`);
      const mapped: CartProduct[] = (res.data ?? []).map(mapApiItem);
      setCartItems(mapped);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar carrinho');
      const local = loadLocalCart();
      if (local.length > 0) setCartItems(local);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId]);

  // ─── CARREGAR RFQS ────────────────────────────────────────────────────────
  const loadRfqs = useCallback(async () => {
    if (!userId) {
      setRfqList([]);
      return;
    }

    try {
      const res = await apiFetch(`/rfqs?user_id=${userId}`);
      const mapped: Rfq[] = (res.data ?? []).map(mapApiRfq);
      setRfqList(mapped);
    } catch (e: any) {
      console.error('Erro ao carregar RFQs:', e);
    }
  }, [userId]);

  // Recarrega sempre que userId muda (login / logout)
  useEffect(() => {
    reloadCart();
    loadRfqs();
  }, [reloadCart, loadRfqs]);

  // ─── ADICIONAR AO CARRINHO ────────────────────────────────────────────────
  const addToCart = useCallback(async (
    product: Omit<CartProduct, 'id' | 'rfqId' | 'status' | 'addedDate'>
  ) => {
    if (!userId) {
      const local = loadLocalCart();
      const existing = local.find(i => i.productId === product.productId);
      let updated: CartProduct[];

      if (existing) {
        updated = local.map(i =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + product.quantity }
            : i
        );
      } else {
        const newItem: CartProduct = {
          ...product,
          id: `local_${product.productId}`,
          rfqId: null,
          status: null,
          addedDate: new Date().toISOString().split('T')[0],
        };
        updated = [...local, newItem];
      }

      saveLocalCart(updated);
      setCartItems(updated);
      return;
    }

    const sessionId = getSessionId();
    await apiFetch('/shopping-carts', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        product_id: product.productId,
        quantity: product.quantity,
      }),
    });

    await reloadCart();
  }, [userId, reloadCart]);

  // ─── REMOVER DO CARRINHO ──────────────────────────────────────────────────
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!userId) {
      const updated = loadLocalCart().filter(i => i.id !== itemId);
      saveLocalCart(updated);
      setCartItems(updated);
      return;
    }

    await apiFetch(`/shopping-carts/${itemId}`, { method: 'DELETE' });
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  }, [userId]);

  // ─── ACTUALIZAR QUANTIDADE ────────────────────────────────────────────────
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    if (!userId) {
      const updated = loadLocalCart().map(i =>
        i.id === itemId ? { ...i, quantity } : i
      );
      saveLocalCart(updated);
      setCartItems(updated);
      return;
    }

    await apiFetch(`/shopping-carts/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });

    setCartItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
    );
  }, [userId]);

  // ─── ADICIONAR À RFQ ──────────────────────────────────────────────────────
  const addToRfq = useCallback(async (itemIds: string[], rfqId: string) => {
    if (!userId || itemIds.length === 0) return;

    const results = await Promise.allSettled(
      itemIds.map(itemId =>
        apiFetch(`/shopping-carts/${itemId}`, {
          method: 'PUT',
          // ✅ usa 'awaiting' (valor que o backend espera) em vez de 'Em Espera'
          body: JSON.stringify({ rfq_id: rfqId, status: 'awaiting' }),
        })
      )
    );

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`${failures.length} item(s) falharam ao adicionar à RFQ`);
    }

    // ✅ Actualiza estado local independentemente de falhas parciais
    setCartItems(prev =>
      prev.map(item =>
        itemIds.includes(item.id)
          ? { ...item, rfqId, status: 'Em Espera' }
          : item
      )
    );

    // ✅ Recarrega RFQs para actualizar itemCount
    await loadRfqs();
  }, [userId, loadRfqs]);

  // ─── REMOVER DA RFQ ───────────────────────────────────────────────────────
  const removeFromRfq = useCallback(async (itemId: string) => {
    if (!userId) return;

    await apiFetch(`/shopping-carts/${itemId}`, {
      method: 'PUT',
      // ✅ usa 'pending' (valor que o backend espera) em vez de 'Pendente'
      body: JSON.stringify({ rfq_id: null, status: 'pending' }),
    });

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, rfqId: null, status: 'Pendente' } : item
      )
    );
    await loadRfqs();
  }, [userId, loadRfqs]);

  // ─── CRIAR RFQ ────────────────────────────────────────────────────────────
  /**
   * FIX PRINCIPAL: antes retornava apenas `res.rfq_id` (string).
   * O CartPage criava um UUID local diferente do ID real da API,
   * fazendo com que o rfqList nunca encontrasse a RFQ pelo ID
   * e mostrasse o ID em vez do nome.
   *
   * Agora:
   * 1. Retorna o objecto completo { rfq_id, name } da resposta da API
   * 2. Já adiciona a nova RFQ ao rfqList local com o ID REAL antes de
   *    chamar loadRfqs(), para que o nome apareça imediatamente sem delay
   */
  const createRfq = useCallback(async (
    name: string,
    itemIds: string[]
  ): Promise<{ rfq_id: string; name: string }> => {
    const currentUserId = userIdRef.current;

    if (!currentUserId || !name.trim() || itemIds.length === 0) {
      throw new Error('Dados inválidos para criar RFQ');
    }

    const res = await apiFetch('/rfqs', {
      method: 'POST',
      body: JSON.stringify({
        name,
        item_ids: itemIds,
        user_id: currentUserId,
      }),
    });

    // ✅ Adiciona a RFQ ao estado local imediatamente com o ID real da API
    // para evitar o delay entre criação e aparecimento do nome
    const newRfq: Rfq = {
      id: res.rfq_id,
      name: res.name ?? name,
      date: new Date().toISOString().split('T')[0],
      itemCount: itemIds.length,
      status: 'active',
    };
    setRfqList(prev => [newRfq, ...prev]);

    // ✅ Actualiza os itens do carrinho localmente com o rfq_id real
    setCartItems(prev =>
      prev.map(item =>
        itemIds.includes(item.id)
          ? { ...item, rfqId: res.rfq_id, status: 'Em Espera' }
          : item
      )
    );

    // Sincroniza com a API em background (não bloqueia o UI)
    loadRfqs().catch(console.error);
    reloadCart().catch(console.error);

    return { rfq_id: res.rfq_id, name: res.name ?? name };
  }, [loadRfqs, reloadCart]);

  // ─── LIMPAR CARRINHO ──────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    clearLocalCart();
    setCartItems([]);
  }, []);

  // ─── SINCRONIZAR APÓS LOGIN ───────────────────────────────────────────────
  const syncCartAfterLogin = useCallback(async (loggedUserId: string) => {
    const local = loadLocalCart();
    if (local.length > 0) {
      const sessionId = getSessionId();
      const promises = local.map(item =>
        apiFetch('/shopping-carts', {
          method: 'POST',
          body: JSON.stringify({
            user_id: loggedUserId,
            session_id: sessionId,
            product_id: item.productId,
            quantity: item.quantity,
          }),
        }).catch(() => null)
      );

      await Promise.allSettled(promises);
      clearLocalCart();
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/shopping-carts?user_id=${loggedUserId}`);
      const mapped: CartProduct[] = (res.data ?? []).map(mapApiItem);
      setCartItems(mapped);
    } catch (e: any) {
      setError(e.message || 'Erro ao sincronizar carrinho');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── VALOR EXPOSTO ────────────────────────────────────────────────────────
  // cartCount = produtos nao atribuidos + RFQs submetidas
  const unassignedCount = cartItems.filter(i => !i.rfqId).length;
  const submittedRfqCount = rfqList.filter(r => r.status === 'submitted').length;
  const cartCount = unassignedCount + submittedRfqCount;

  return (
    <CartContext.Provider value={{
      cartItems,
      rfqList,
      cartCount,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCartAfterLogin,
      reloadCart,
      loadRfqs,
      addToRfq,
      removeFromRfq,
      createRfq,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}