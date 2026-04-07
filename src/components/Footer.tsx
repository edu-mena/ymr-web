import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Linkedin, Instagram, Facebook, ChevronUp, Mail,
  ArrowRight, Users, Award,
  Heart, User, Activity, ShoppingBag, MessageCircle, Settings as SettingsIcon, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContactPage } from '../hooks/useContactPage';
import NewsletterSubscribe from '../components/NewsletterSubscribe';

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
};

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { info: contactInfo, loading: contactLoading } = useContactPage();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserMenuClick = (tab: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => navigate(`/userprofile?tab=${tab}`), 80);
  };

  const phoneInfo = contactInfo.find(i => i.slug === 'phone');
  const emailInfo = contactInfo.find(i => i.slug === 'email');
  const addressInfo = contactInfo.find(i => i.slug === 'address');
  const hoursInfo = contactInfo.find(i => i.slug === 'hours') || contactInfo.find(i => i.slug === 'business_hours') || contactInfo.find(i => i.slug === 'clock');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/catalog' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'About Us', path: '/about' },
    { name: 'Company Profile', path: '/company-profile' },
    { name: 'Contact', path: '/contact' },
  ];

  const userMenuLinks = [
    { name: 'Perfil', tab: 'profile', icon: User },
    { name: 'Atividades', tab: 'activity', icon: Activity },
    { name: 'Pedidos', tab: 'orders', icon: ShoppingBag },
    { name: 'Mensagens', tab: 'messages', icon: MessageCircle },
    { name: 'Configurações', tab: 'settings', icon: SettingsIcon, route: '/settings' },
  ];

  return (
    <>
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-600"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <footer className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-3">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* — Company Info (col-span 4) — */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-3 mb-5">
                <img
                  src="https://ymrindustrial.com/assets/ymrlogo.png"
                  alt="YMR Industrial"
                  className="h-10"
                />
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering industrial progress with reliable tools, equipment, and solutions.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-xl font-bold text-white">500+</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Happy Clients</p>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-xl font-bold text-white">10+</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Years Experience</p>
                </div>
              </div>

              {/* Contact info from backend */}
              <div className="space-y-3">
                {contactLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading contact info…</span>
                  </div>
                ) : (
                  <>
                    {phoneInfo && (
                      <div className="text-sm text-gray-300">
                        {!Array.isArray(phoneInfo.details)
                          ? <div>{phoneInfo.details}</div>
                          : phoneInfo.details.map((d, i) => <div key={i}>{d}</div>)}
                        {phoneInfo.description && (
                          <p className="text-xs text-gray-500 mt-1">{phoneInfo.description}</p>
                        )}
                      </div>
                    )}
                    {emailInfo && (
                      <a
                        href={`mailto:${Array.isArray(emailInfo.details) ? emailInfo.details[0] : emailInfo.details}`}
                        className="text-sm text-gray-300 hover:text-white transition-colors block"
                      >
                        {!Array.isArray(emailInfo.details) ? emailInfo.details : emailInfo.details[0]}
                      </a>
                    )}
                    {addressInfo && (
                      <div className="text-xs text-gray-400 leading-relaxed">
                        {!Array.isArray(addressInfo.details) ? addressInfo.details : addressInfo.details[0]}
                        {addressInfo.description && <div>{addressInfo.description}</div>}
                      </div>
                    )}
                    {hoursInfo && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{!Array.isArray(hoursInfo.details) ? hoursInfo.details : hoursInfo.details[0]}</span>
                        {hoursInfo.description && <span>— {hoursInfo.description}</span>}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* — Quick Links (col-span 3) — */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-bold mb-5 text-white">Quick Links</h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* — User Menu (col-span 2) — */}
            {isAuthenticated ? (
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-5 text-white">User Menu</h3>
                <ul className="space-y-2.5">
                  {userMenuLinks.map((link) => (
                    <li key={link.tab}>
                      {link.route ? (
                        <Link
                          to={link.route}
                          className="w-full flex items-center space-x-3 text-left text-gray-300 hover:text-white transition-colors duration-200 text-sm group"
                        >
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                          <span>{link.name}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleUserMenuClick(link.tab)}
                          className="w-full flex items-center space-x-3 text-left text-gray-300 hover:text-white transition-colors duration-200 text-sm group"
                        >
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                          <span>{link.name}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-5 text-white">Account</h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      to="/login"
                      className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                      <span>Sign In</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                      <span>Create Account</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cart"
                      className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                      <span>Cart</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* — Connect & Newsletter (col-span 3) — */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-bold mb-5 text-white">Connect With Us</h3>

              {/* Social Links */}
              <div className="flex space-x-3 mb-6">
                {[
                  { name: 'LinkedIn', key: 'linkedin' },
                  { name: 'Instagram', key: 'instagram' },
                  { name: 'Facebook', key: 'facebook' },
                ].map((s) => {
                  const Icon = socialIcons[s.key];
                  return (
                    <a
                      key={s.name}
                      href="#"
                      className="p-2.5 bg-gray-800/60 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                      aria-label={s.name}
                    >
                      <Icon className="h-5 w-5 text-gray-400" />
                    </a>
                  );
                })}
              </div>

              {/* Newsletter */}
              <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700/50">
                <h4 className="font-semibold mb-2 text-sm flex items-center space-x-2 text-white">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>Stay Updated</span>
                </h4>
                <p className="text-xs text-gray-400 mb-3">Get the latest news and offers</p>
                <NewsletterSubscribe variant="banner" />
              </div>
              
              {/* SADC Badge */}
              <div className="relative flex justify-center pb-6 pt-2">
                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-gray-800/40 border border-gray-700/40 backdrop-blur-sm"
                  style={{ animation: 'sadcFloat 4s ease-in-out infinite' }}>
                  <div style={{ animation: 'sadcPulse 4s ease-in-out infinite' }}>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Seal_of_the_SADC.svg/960px-Seal_of_the_SADC.svg.png"
                      alt="SADC Seal"
                      className="h-10 w-10 object-contain drop-shadow-sm"
                      style={{ animation: 'sadcSpin 15s linear infinite' }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-200 leading-tight">Member of the SADC Region</span>
                    <span className="text-[10px] text-blue-400/90 uppercase tracking-wider">#Licença SADC à caminho</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        

        {/* Bottom Bar */}
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} YMR Industrial. All rights reserved.
                </p>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <span>Made with</span>
                  <Heart className="h-3.5 w-3.5 text-gray-500" />
                  <span>in Angola</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes sadcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes sadcPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.3)); }
          50% { filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.6)); }
        }
        @keyframes sadcSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Footer;
