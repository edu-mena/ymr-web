import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../services/api';
import { useActivityLog } from '../hooks/useActivityLog';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { logActivity } = useActivityLog();
  const { syncCartAfterLogin } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const validateEmail = (value: string) => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailValid(ok);
  };

  const evaluatePasswordStrength = (value: string) => {
    let score = 0;
    if (value.length >= 6) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setPasswordStrength(score);
  };

  const strengthLabel = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][passwordStrength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setFormError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      let response;
      if (mode === 'login') {
        response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          noAuth: true,
        });
      } else {
        response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: fullName, email, password }),
          noAuth: true,
        });
      }

      const { access_token, user } = response;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('ymr_access_token', access_token);
      login(
        { name: user.name, email: user.email, id: user.id, role: user.role },
        access_token
      );

      await logActivity({
        activityType: mode === 'login' ? 'login' : 'profile_updated',
        title: mode === 'login' ? 'Login successful' : 'Account created',
        description: mode === 'login'
          ? `User ${user.email} logged in`
          : `New account created: ${user.email}`,
        metadata: { email: user.email, userId: user.id, mode }
      });

      await syncCartAfterLogin(user.id);

      const locationState = location.state as { from?: { pathname?: string } } | null;
      const from = locationState?.from?.pathname || '/userprofile';
      navigate(from, { replace: true });

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 overflow-hidden">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Form Card ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">

            {/* Logo centrada */}
            <div className="flex justify-center mb-6">
              <img
                src="https://ymrindustrial.com/assets/ymrlogo.png"
                alt="YMR Industrial"
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Toggle Login / Sign Up — centrado */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setFormError(null); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setFormError(null); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full name (sign up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                  <div className="rounded-lg border border-gray-200 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-3 rounded-lg focus:outline-none bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className={`relative rounded-lg border transition-all ${
                  emailValid === false
                    ? 'border-red-300 focus-within:border-red-500/60 focus-within:ring-2 focus-within:ring-red-500/20'
                    : emailValid
                    ? 'border-green-300 focus-within:border-green-500/60 focus-within:ring-2 focus-within:ring-green-500/20'
                    : 'border-gray-200 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20'
                }`}>
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]"
                  />
                  {emailValid === false && <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />}
                  {emailValid && <CheckCircle2 className="w-4 h-4 text-green-600 absolute right-3 top-1/2 -translate-y-1/2" />}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative rounded-lg border border-gray-200 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); evaluatePasswordStrength(e.target.value); }}
                    onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => setIsCapsLock(e.getModifierState('CapsLock'))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength (sign up only) */}
                {mode === 'signup' && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 1 ? 'bg-red-500'
                          : passwordStrength === 2 ? 'bg-yellow-500'
                          : passwordStrength === 3 ? 'bg-indigo-500'
                          : 'bg-green-600'
                        }`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 min-w-[80px] text-right">
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {/* Caps Lock warning */}
                {isCapsLock && (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1">
                    <AlertCircle className="w-3 h-3" /> Caps Lock is on
                  </div>
                )}

                {/* Remember me + Forgot password */}
                {mode === 'login' && (
                  <div className="mt-3 flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(v => !v)} className="sr-only" />
                      <span className={`w-9 h-5 rounded-full relative transition-colors ${rememberMe ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${rememberMe ? 'translate-x-4' : ''}`} />
                      </span>
                      <span className="text-sm text-gray-600">Keep me signed in</span>
                    </label>
                    <a href="#" className="text-sm text-indigo-900 hover:underline">Forgot password?</a>
                  </div>
                )}
              </div>

              {/* Confirm password (sign up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <div className="rounded-lg border border-gray-200 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-3 rounded-lg focus:outline-none bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]"
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              {/* Submit button — sem efeitos sheen */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-6">
              By continuing, you agree to our{' '}
              <a className="text-indigo-900 hover:underline" href="#">Terms</a> and{' '}
              <a className="text-indigo-900 hover:underline" href="#">Privacy Policy</a>.
            </p>
          </div>

          {/* ── Benefits Card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why create an account?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Faster, secure orders</div>
                  <div className="text-gray-500 text-sm">Save your details securely and speed up future purchases.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Favourites & comparisons</div>
                  <div className="text-gray-500 text-sm">Organise products so you can decide with confidence.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Order tracking</div>
                  <div className="text-gray-500 text-sm">View the status and history of all your orders.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Synced cart</div>
                  <div className="text-gray-500 text-sm">Products added before signing in are saved automatically.</div>
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