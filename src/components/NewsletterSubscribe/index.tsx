import { useState, type FormEvent } from 'react';
import { apiFetch } from '../../services/api';
import { CheckCircle2, Loader2, Send, AlertCircle, Sparkles } from 'lucide-react';

type Variant = 'compact' | 'inline' | 'card' | 'banner';

interface Props {
  variant?: Variant;
  className?: string;
  interests?: string[];
  name?: string;
}

export default function NewsletterSubscribe({ variant = 'compact', className = '', interests, name }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg(null);
    try {
      await apiFetch('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, name, interests }),
      });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  // ────────────────────── COMACT (aside / sidebar) ──────────────────────
  if (variant === 'compact') {
    if (status === 'success') {
      return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-md">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Subscribed successfully!</p>
              <p className="text-xs text-gray-500 mt-0.5">New products and offers are arriving soon.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h3 className="font-bold text-gray-900 text-sm">Newsletter YMR</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">Exclusive offers and industry news</p>

          {status === 'error' && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-1.5 mb-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Error subscribing. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="O seu e-mail"
              required
              disabled={status === 'loading'}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {status === 'loading' ? 'A subscrever...' : 'Subscrever'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────── INLINE (blog / page section) ──────────────────────
  if (variant === 'inline') {
    if (status === 'success') {
      return (
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-white mx-auto mb-3" />
          <p className="text-xl font-bold text-white mb-1">Subscribed successfully!</p>
          <p className="text-sm text-white/80">New products and offers are arriving soon.</p>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Decorative bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl" />
        <div className="absolute inset-0 opacity-10 rounded-3xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative px-6 py-12 sm:px-10 sm:py-14 text-center">
          <Sparkles className="h-5 w-5 text-white/80 mx-auto mb-2" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
            Stay in the loop
          </h2>
          <p className="text-blue-100/90 mb-7 text-base max-w-md mx-auto">
            Get the latest articles, industry insights, and product news delivered to your inbox.
          </p>

          {status === 'error' && (
            <p className="text-sm text-white bg-white/10 rounded-lg px-4 py-2 mb-4 inline-block">
              Failed to subscribe. Please try again.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className="w-full sm:flex-1 px-4 py-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white shadow-lg disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 disabled:bg-indigo-100 font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 shrink-0 shadow-lg"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
          <p className="text-indigo-200/70 text-xs mt-4">No spam, ever. Unsubscribe at any time.</p>
        </div>
      </div>
    );
  }

  // ────────────────────── CARD (catalog standalone) ──────────────────────
  if (variant === 'card') {
    if (status === 'success') {
      return (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Subscription confirmed!</p>
            <p className="text-sm text-green-600">We'll notify you as soon as the catalog is available.</p>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="O seu endereço de e-mail"
            required
            disabled={status === 'loading'}
            className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {status === 'loading' ? 'A subscrever...' : 'Notifique-me'}
        </button>
      </form>
    );
  }

  // ────────────────────── BANNER (footer large) ──────────────────────
  if (variant === 'banner') {
    if (status === 'success') {
      return (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Subscribed successfully!</span>
        </div>
      );
    }

    return (
      <div>
        {status === 'error' && (
          <p className="text-xs text-red-400 mb-2">Failed to subscribe. Please try again.</p>
        )}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            disabled={status === 'loading'}
            className="flex-1 px-3 py-2 bg-gray-700/60 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 disabled:opacity-50 shrink-0"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    );
  }

  return null;
}
