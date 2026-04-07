// src/services/api.ts
const DEFAULT_BASE_URL = 'https://violet-moose-215968.hostingersite.com/backend';

export function getApiBaseUrl(): string {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  return (envBase || DEFAULT_BASE_URL).replace(/\/$/, '');
}

// ─── FETCH CENTRALIZADO ───────────────────────────────────────────────────────
// credentials:'include' envia o cookie httpOnly automaticamente.
// noAuth: para rotas verdadeiramente públicas (produtos, blog, etc.)
// silent: para rotas de registo/telemetria que nunca devem disparar refresh
//         nem mostrar erros ao utilizador (ex: user/activities)

let isRefreshing    = false;
let refreshPromise: Promise<boolean> | null = null; // partilhado entre pedidos concorrentes

async function tryRefresh(base: string): Promise<boolean> {
  // Se já há um refresh em curso, aguarda o mesmo resultado
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${base}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'User-Agent': 'YMR-React-App/1.0' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Liberta sempre — mesmo em excepção — para não ficar preso
      refreshPromise = null;
      isRefreshing   = false;
    }
  })();

  isRefreshing = true;
  return refreshPromise;
}

function dispatchSessionExpired(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ymr_auth_user');
  window.dispatchEvent(new Event('ymr:session-expired'));
}

export async function apiFetch(
  path: string,
  init: RequestInit & { noAuth?: boolean; _retry?: boolean; silent?: boolean } = {}
): Promise<any> {
  const base           = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url            = `${base}${normalizedPath}`;

  const headers: Record<string, string> = {
    'User-Agent': 'YMR-React-App/1.0',
  };

  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const { noAuth, _retry, silent, ...fetchInit } = init;

  const res = await fetch(url, {
    ...fetchInit,
    headers: {
      ...headers,
      ...(fetchInit.headers as Record<string, string> | undefined),
    },
    credentials: noAuth ? 'omit' : 'include',
  });

  // ── Auto-refresh em 401 ───────────────────────────────────────────────────
  if (res.status === 401 && !_retry && !noAuth) {
    // Rotas silenciosas (telemetria, actividade): não tentam refresh,
    // não mostram erros — apenas falham silenciosamente.
    if (silent) return null;

    const refreshed = await tryRefresh(base);

    if (refreshed) {
      // Repete o pedido original com o novo cookie
      return apiFetch(path, { ...init, _retry: true });
    }

    // Refresh falhou → sessão expirada
    dispatchSessionExpired();
    // Propaga o erro para quem chamou possa reagir (ex: redirecionar)
    throw new Error('Sessão expirada. Por favor inicie sessão novamente.');
  }

  if (!res.ok) {
    // Rotas silenciosas falham sem lançar excepção
    if (silent) return null;

    let errorMessage: string;
    try {
      const json = await res.json();
      errorMessage = json?.error || json?.message || res.statusText;
    } catch {
      errorMessage = (await res.text().catch(() => '')) || res.statusText;
    }
    throw new Error(`Erro ${res.status}: ${errorMessage}`);
  }

  return res.json();
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function apiLogout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch { /* silencioso */ }
  dispatchSessionExpired();
}