import { useState, useEffect } from 'react';
import PartnersCarousel from '../components/PartnersCarousel';
import {
  Target, Eye, Heart,
  Star, TrendingUp,
  Loader2, AlertCircle,
  Shield, Users, Award, Zap, CheckCircle,
  Trophy, BarChart, Building, Clock, MapPin, ThumbsUp
} from 'lucide-react';
import { apiFetch } from '../services/api';

// ─── MAP ICON NAMES (backend returns strings like "Shield", "Users", etc.) ───
const LUCIDE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, Eye, Heart, Star, TrendingUp,
  Shield, Users, Award, Zap, CheckCircle,
  Trophy, BarChart, Building, Clock, MapPin,
  ThumbsUp,
};

interface AboutData {
  mission: { title: string; subtitle: string; description: string } | null;
  vision: { title: string; subtitle: string; description: string } | null;
  values: { title: string; description: string; items: Array<{ icon: string; title: string; description: string }> };
  stats: { title: string; description: string; items: Array<{ number: string; label: string; icon: string }> };
  testimonial: { quote: string; meta: { authorName?: string; authorRole?: string; avatar?: string } };
}

const DEFAULT_VALUES: AboutData['values']['items'] = [
  { icon: 'Shield', title: 'Quality', description: 'We deliver high-quality products and services that exceed expectations.' },
  { icon: 'Heart', title: 'Integrity', description: 'We operate with honesty, transparency, and trust in every relationship.' },
  { icon: 'Star', title: 'Excellence', description: 'We strive for excellence in everything we do to ensure customer satisfaction.' },
  { icon: 'Zap', title: 'Innovation', description: 'We embrace new technologies and methods to stay ahead in the industry.' },
];

const DEFAULT_STATS: AboutData['stats']['items'] = [
  { icon: 'Users', number: '500+', label: 'Happy Clients' },
  { icon: 'Clock', number: '10+', label: 'Years Experience' },
  { icon: 'Building', number: '50+', label: 'Projects Completed' },
  { icon: 'Trophy', number: '15+', label: 'Awards Won' },
];

const DEFAULT_VALUES_TITLE = 'Values That Drive Us';
const DEFAULT_VALUES_DESC = 'These principles guide every decision we make';
const DEFAULT_STATS_TITLE = 'Our Impact in Numbers';
const DEFAULT_STATS_DESC = 'Real results that reflect our commitment';

const About = () => {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/about')
      .then((res) => {
        setData(res?.data);
        setError(null);
      })
      .catch((err: Error) => {
        console.error('Error loading About:', err);
        setError(err.message || 'Error loading data');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen page-content bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen page-content bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const d = data;
  const mission = d?.mission;
  const vision = d?.vision;
  const hasRealData = !!(mission || vision || d?.values?.items?.length || d?.stats?.items?.length || d?.testimonial?.quote);

  // Fallback when backend is empty or has no data
  if (!hasRealData) {
    return (
      <div className="min-h-screen page-content bg-white">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">No data available yet.</p>
          </div>
        </section>
      </div>
    );
  }

  const valuesItems = d?.values?.items?.length ? d.values.items : DEFAULT_VALUES;
  const statsItems = d?.stats?.items?.length ? d.stats.items : DEFAULT_STATS;
  const valuesTitle = d?.values?.title || DEFAULT_VALUES_TITLE;
  const valuesDesc = d?.values?.description || DEFAULT_VALUES_DESC;
  const statsTitle = d?.stats?.title || DEFAULT_STATS_TITLE;
  const statsDesc = d?.stats?.description || DEFAULT_STATS_DESC;

  return (
    <div className="min-h-screen page-content bg-white">
      {/* ===== SEÇÃO MISSÃO E VISÃO ===== */}
      {mission || vision ? (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                {mission && (
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-blue-100 rounded-xl mr-4">
                        <Target className="h-8 w-8 text-blue-900" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{mission.title}</h2>
                        {mission.subtitle && (
                          <p className="text-gray-600 mt-1">{mission.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>
                )}

                {vision && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-green-100 rounded-xl mr-4">
                        <Eye className="h-8 w-8 text-blue-900" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{vision.title}</h2>
                        {vision.subtitle && (
                          <p className="text-gray-600 mt-1">{vision.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {vision.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://ymrindustrial.com/assets/about/3.jpg"
                    alt="Industrial facility"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Modern Industrial Solutions</h3>
                    <p className="text-sm opacity-90">State-of-the-art facilities and equipment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== SEÇÃO VALORES DA EMPRESA ===== */}
      {hasRealData && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
                <Heart className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Our Values</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{valuesTitle}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {valuesDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valuesItems.map((v: { icon?: string; title: string; description: string }) => {
                const Icon = (v.icon && LUCIDE_ICONS[v.icon]) || Heart;
                return (
                  <div
                    key={v.title}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group"
                  >
                    <div className="bg-gray-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-blue-900" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{v.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SEÇÃO ESTATÍSTICAS ===== */}
      {hasRealData && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <TrendingUp className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">Statistics</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{statsTitle}</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                {statsDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsItems.map((stat: { icon?: string; number: string; label: string }) => {
                const Icon = (stat.icon && LUCIDE_ICONS[stat.icon]) || Star;
                return (
                  <div
                    key={stat.label}
                    className="text-center rounded-2xl p-8 transition-all duration-300"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-blue-100 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== SEÇÃO PARCEIROS ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PartnersCarousel />
        </div>
      </section>

      {/* ===== SEÇÃO DEPOIMENTO ===== */}
      {d?.testimonial?.quote && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gray-50 rounded-3xl p-12 shadow-lg">
              <div className="flex justify-center mb-8">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">
                "{d.testimonial.quote}"
              </blockquote>
              <div className="flex items-center justify-center">
                {d.testimonial.meta?.avatar ? (
                  <img
                    src={d.testimonial.meta.avatar}
                    alt="Client"
                    className="w-16 h-16 rounded-full mr-4 border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full mr-4 border-4 border-white shadow-lg bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {(d.testimonial.meta?.authorName || '')[0] || '?'}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{d.testimonial.meta?.authorName || 'Cliente'}</div>
                  <div className="text-gray-600">{d.testimonial.meta?.authorRole || ''}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
