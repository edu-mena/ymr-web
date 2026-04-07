import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useActivityLog } from '../hooks/useActivityLog';
import { apiFetch } from '../services/api';

const GOOGLE_CLIENT_ID = '335550693842-530q17122dqlhqpfjtatrms5hr6mqb17.apps.googleusercontent.com';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { logActivity } = useActivityLog();
  const { syncCartAfterLogin } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    setError(null);

    try {
      // Envia o ID token do Google para o backend
      const response = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const { user } = response;

      login({
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
      });

      await logActivity({
        activityType: 'login',
        title: 'Login com Google',
        description: `Usuário ${user.email} iniciou sessão com Google`,
        metadata: { email: user.email, userId: user.id, method: 'google' },
      });

      await syncCartAfterLogin(user.id);

      const locationState = location.state as { from?: { pathname?: string } } | null;
      const from = locationState?.from?.pathname || '/userprofile';
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Falha ao autenticar com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleError() {
    setError('Falha ao autenticar com Google. Tente novamente.');
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-100 pt-20 overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'0.04\\'%3E%3Ccircle cx=\\'30\\' cy=\\'30\\' r=\\'2\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      />

      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 border border-gray-200 text-gray-700 backdrop-blur hover:bg-white shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Auth Card ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col items-center justify-center">

            {/* Logo */}
            <img
              src="https://ymrindustrial.com/assets/ymrlogo.png"
              alt="YMR Industrial"
              className="h-12 w-auto object-contain mb-6"
            />

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to YMR Industrial
            </h1>
            <p className="text-gray-500 text-sm text-center mb-8 max-w-xs">
              Sign in with your Google account to access your profile, orders, and more.
            </p>

            {/* Google Login Button */}
            <div className="w-full max-w-xs">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-3 text-gray-500 text-sm">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                  Authenticating...
                </div>
              ) : (
                <GoogleLogin
                  width="100%"
                  type="standard"
                  size="large"
                  theme="outline"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  locale="en"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-2 flex items-center gap-2 text-center w-full max-w-xs">
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-6 text-center">
              Your account will be created automatically the first time you log in.
            </p>
          </div>

          {/* ── Benefits Card ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why create an account?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Faster and safer orders</div>
                  <div className="text-gray-500 text-sm">Save your information and speed up your purchases .</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Favorites and comparisons</div>
                  <div className="text-gray-500 text-sm">Organize products to decide with confidence.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Order tracking</div>
                  <div className="text-gray-500 text-sm">Check the status and history of all your orders.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Synchronized cart</div>
                  <div className="text-gray-500 text-sm">Products added before logging in are saved automatically.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Direct contact with sales team</div>
                  <div className="text-gray-500 text-sm">Communicate directly with our team for your project.</div>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Login;
