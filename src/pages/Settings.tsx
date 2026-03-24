import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Shield, 
  Eye,
  Save,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const isRestricted = !isAuthenticated;

  // Estados para configurações
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    orderUpdates: true,
    promotions: false,
    securityAlerts: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    dataSharing: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordExpiry: '90'
  });

  const [language, setLanguage] = useState('pt');
  const [currency, setCurrency] = useState('AOA');
  const [timezone, setTimezone] = useState('Africa/Luanda');

  // Estados para upload de avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Estado para dados do usuário
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    country: 'Angola',
    company: '',
    position: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  // Carregar perfil ao montar
  useEffect(() => {
    if (isAuthenticated) {
      const loadProfile = async () => {
        try {
          const response = await apiFetch('/auth/profile');
          const user = response.user;
          setUserData({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            birthDate: user.birth_date ? user.birth_date.split('T')[0] : '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || 'Angola',
            company: user.company || '',
            position: user.position || '',
            avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          });
        } catch (err) {
          console.error('Erro ao carregar perfil:', err);
        }
      };
      loadProfile();
    }
  }, [isAuthenticated]);

  // Funções de manipulação
  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handlePrivacyChange = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSecurityChange = (key: string) => {
    if (key === 'twoFactor' || key === 'loginAlerts') {
      setSecurity(prev => ({
        ...prev,
        [key]: !prev[key as keyof typeof prev]
      }));
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          birth_date: userData.birthDate,
          address: userData.address,
          city: userData.city,
          country: userData.country,
          company: userData.company,
          position: userData.position
        })
      });

      alert('Configurações salvas com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar configurações: ' + (err.message || 'Tente novamente'));
    }
  };

  const handleReset = () => {
    // Resetar para configurações padrão
    setNotifications({
      email: true,
      sms: false,
      push: true,
      marketing: false,
      orderUpdates: true,
      promotions: false,
      securityAlerts: true
    });
    setPrivacy({
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      dataSharing: false
    });
    setSecurity({
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: '30',
      passwordExpiry: '90'
    });
    setLanguage('pt');
    setCurrency('AOA');
    setTimezone('Africa/Luanda');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploading(true);
      const response = await apiFetch('/upload/avatar', {
        method: 'POST',
        body: formData,
        noAuth: false
      });

      setUserData(prev => ({ ...prev, avatar: response.avatar_url }));
      setShowAvatarModal(false);
      alert('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      alert('Erro ao enviar avatar: ' + (err.message || 'Tente novamente'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen page-content bg-gray-50 dark:bg-gray-900">
      {/* ===== HEADER ===== */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <SettingsIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Configurações</span>
            </div>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              Gerencie suas preferências, notificações e configurações de segurança
            </p>
          </div>
        </div>
      </section>

      {/* ===== CONFIGURAÇÕES ===== */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* ===== NOTIFICAÇÕES ===== */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}
            aria-disabled={isRestricted}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl mr-4">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notificações</h2>
                  <p className="text-gray-600 dark:text-gray-300">Configure como você deseja receber notificações</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'email' && 'Receber notificações por email'}
                        {key === 'sms' && 'Receber notificações por SMS'}
                        {key === 'push' && 'Receber notificações push no navegador'}
                        {key === 'marketing' && 'Receber ofertas e promoções'}
                        {key === 'orderUpdates' && 'Atualizações sobre pedidos'}
                        {key === 'promotions' && 'Promoções especiais'}
                        {key === 'securityAlerts' && 'Alertas de segurança'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      disabled={isRestricted}
                      aria-disabled={isRestricted}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== APARÊNCIA ===== */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl mr-4">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aparência</h2>
                  <p className="text-gray-600 dark:text-gray-300">Personalize a aparência da aplicação</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</label>
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moeda</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="AOA">Kwanza (AOA)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuso Horário</label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Africa/Luanda">Luanda (GMT+1)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ===== PRIVACIDADE ===== */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}
            aria-disabled={isRestricted}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl mr-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacidade</h2>
                  <p className="text-gray-600 dark:text-gray-300">Controle sua privacidade e visibilidade</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {key === 'profileVisibility' && 'Perfil Público'}
                        {key === 'showEmail' && 'Mostrar Email'}
                        {key === 'showPhone' && 'Mostrar Telefone'}
                        {key === 'allowMessages' && 'Permitir Mensagens'}
                        {key === 'dataSharing' && 'Compartilhar Dados'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'profileVisibility' && 'Tornar perfil visível para outros usuários'}
                        {key === 'showEmail' && 'Exibir email no perfil público'}
                        {key === 'showPhone' && 'Exibir telefone no perfil público'}
                        {key === 'allowMessages' && 'Permitir que outros usuários enviem mensagens'}
                        {key === 'dataSharing' && 'Compartilhar dados para melhorar o serviço'}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange(key)}
                      disabled={isRestricted}
                      aria-disabled={isRestricted}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== SEGURANÇA ===== */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}
            aria-disabled={isRestricted}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl mr-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Segurança</h2>
                  <p className="text-gray-600 dark:text-gray-300">Configure as opções de segurança da sua conta</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(security).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {key === 'twoFactor' && 'Autenticação de Dois Fatores'}
                        {key === 'loginAlerts' && 'Alertas de Login'}
                        {key === 'sessionTimeout' && 'Timeout de Sessão'}
                        {key === 'passwordExpiry' && 'Expiração de Senha'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'twoFactor' && 'Adicionar camada extra de segurança'}
                        {key === 'loginAlerts' && 'Receber alertas quando alguém fizer login'}
                        {key === 'sessionTimeout' && `${value} minutos de inatividade`}
                        {key === 'passwordExpiry' && `Senha expira a cada ${value} dias`}
                      </p>
                    </div>
                    {key === 'sessionTimeout' || key === 'passwordExpiry' ? (
                      <select 
                        value={String(value)}
                        onChange={(e) => setSecurity(prev => ({ ...prev, [key]: e.target.value }))}
                        disabled={isRestricted}
                        aria-disabled={isRestricted}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {key === 'sessionTimeout' && (
                          <>
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="60">1 hora</option>
                            <option value="120">2 horas</option>
                          </>
                        )}
                        {key === 'passwordExpiry' && (
                          <>
                            <option value="30">30 dias</option>
                            <option value="60">60 dias</option>
                            <option value="90">90 dias</option>
                            <option value="180">180 dias</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <button
                        onClick={() => handleSecurityChange(key)}
                        disabled={isRestricted}
                        aria-disabled={isRestricted}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ===== BOTÕES DE AÇÃO ===== */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrões
              </button>
              <button
                onClick={handleSave}
                disabled={isRestricted}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MODAL DE UPLOAD DE AVATAR ===== */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Alterar Foto de Perfil</h2>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={userData.avatar}
                    alt="Avatar atual"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Foto atual</p>
              </div>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                />
                <button
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploading || isRestricted}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  {isUploading ? 'Enviando...' : 'Escolher Nova Foto'}
                </button>
                <button
                  onClick={() => {
                    setUserData(prev => ({ 
                      ...prev, 
                      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' 
                    }));
                    setShowAvatarModal(false);
                  }}
                  disabled={isUploading || isRestricted}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                  Usar Foto Padrão
                </button>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Requisitos da foto:</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Formatos aceitos: JPG, PNG, GIF</li>
                  <li>• Tamanho máximo: 5MB</li>
                  <li>• Resolução recomendada: 400x400px ou superior</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;