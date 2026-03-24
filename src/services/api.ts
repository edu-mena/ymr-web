// src/services/api.ts
const DEFAULT_BASE_URL = 'https://violet-moose-215968.hostingersite.com/backend';

// ─── VERIFICAÇÃO DE TOKEN ────────────────────────────────────────────────────

/**
 * Verifica se o token JWT está expirado.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Token inválido → considerar expirado
  }
}

// ─── CONFIGURAÇÃO DA BASE URL ────────────────────────────────────────────────

/**
 * Obtém a URL base da API.
 * Prioridade: variável de ambiente VITE > localStorage > valor padrão.
 */
export function getApiBaseUrl(): string {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  const storedBase =
    typeof window !== 'undefined'
      ? localStorage.getItem('apiBaseUrl') || undefined
      : undefined;
  return (envBase || storedBase || DEFAULT_BASE_URL).replace(/\/$/, ''); // remove barra final
}

// ─── OBTENÇÃO DO TOKEN ───────────────────────────────────────────────────────

/**
 * Obtém o token de autenticação válido (não expirado).
 * Limpa o token do localStorage caso esteja expirado.
 */
export function getAuthToken(): string | undefined {
  const envToken = (import.meta as any)?.env?.VITE_API_TOKEN as string | undefined;
  if (envToken) return envToken;

  if (typeof window !== 'undefined') {
    // Suporta ambas as chaves usadas no projecto
    const storedToken =
      localStorage.getItem('ymr_access_token') ||
      localStorage.getItem('accessToken');

    if (storedToken && !isTokenExpired(storedToken)) {
      return storedToken;
    }

    // Token expirado → limpa tudo
    localStorage.removeItem('ymr_access_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('ymr_auth_user');
  }

  return undefined;
}

// ─── FETCH CENTRALIZADO ──────────────────────────────────────────────────────

/**
 * Função centralizada para todas as requisições à API REST.
 *
 * @param path   - Caminho relativo, ex: '/auth/login'
 * @param init   - Opções do fetch (method, body, headers…)
 *                 + campo extra `noAuth` para ignorar o token JWT
 */
export async function apiFetch(
  path: string,
  init: RequestInit & { noAuth?: boolean } = {}
) {
  const base = getApiBaseUrl();
  const token = init.noAuth ? undefined : getAuthToken();

  // Garante que o path começa sempre com '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  const headers: Record<string, string> = {
    // Obrigatório: o Hostinger bloqueia requisições sem User-Agent
    'User-Agent': 'YMR-React-App/1.0',
  };

  // Só define Content-Type se NÃO for FormData (multipart é gerido pelo browser)
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Injeta token JWT se existir e não for uma rota pública
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Headers do chamador têm prioridade sobre os defaults
  const mergedHeaders: Record<string, string> = {
    ...headers,
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, {
    ...init,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    // Tenta extrair mensagem de erro do corpo JSON
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