import { useState } from 'react';
import { FileText, Clock, Bell, CheckCircle, Award, Send } from 'lucide-react';

const Catalog = () => {

  // ===== NEWSLETTER STATE =====
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Replace with your real newsletter API call
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
    } catch (error) {
      console.error('Newsletter error:', error);
      // Still show success to user (graceful degradation)
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-content">

      {/* ===== MAIN SECTION ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: Info ── */}
            <div>
              {/* Unavailable badge */}
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                <Clock className="h-4 w-4" />
                Em Preparação
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Catálogo YMR Industrial<br />
                <span className="text-blue-600">2024</span>
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                O nosso catálogo completo de produtos está a ser finalizado e estará disponível em breve.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Assine a nossa newsletter e seja o primeiro a saber quando o catálogo estiver disponível para download.
              </p>

              {/* Newsletter form */}
              {subscribed ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Subscrição confirmada!</p>
                    <p className="text-sm text-green-600">Iremos notificá-lo assim que o catálogo estiver disponível.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="O seu endereço de e-mail"
                      required
                      className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'A subscrever...' : 'Notifique-me'}
                  </button>
                </form>
              )}
            </div>

            {/* ── Right: Document card (greyed out / unavailable) ── */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 opacity-60 select-none">

                {/* Document header */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-5">
                    <div className="bg-gray-400 p-3 rounded-xl mr-4 shrink-0">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Catálogo YMR Industrial 2024</h3>
                      <p className="text-gray-500 font-medium">Guia Completo de Produtos</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Tamanho</span>
                      <div className="font-semibold text-gray-400">— —</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Páginas</span>
                      <div className="font-semibold text-gray-400">— —</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Formato</span>
                      <div className="font-semibold text-gray-400">PDF</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <span className="text-gray-500 text-xs">Disponível</span>
                      <div className="font-semibold text-gray-400">Em breve</div>
                    </div>
                  </div>
                </div>

                {/* Section previews */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-400">Seção Escadas</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-gray-400">Equipamentos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay "coming soon" badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white border-2 border-amber-300 shadow-xl rounded-2xl px-6 py-4 text-center rotate-[-2deg]">
                  <Clock className="h-7 w-7 text-amber-500 mx-auto mb-1" />
                  <p className="font-bold text-gray-900 text-lg">Em Preparação</p>
                  <p className="text-gray-500 text-sm">Disponível em breve</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Catalog;