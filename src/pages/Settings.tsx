import { useState, useEffect } from 'react';
import {
  Bell,
  Shield,
  Save,
  Mail,
  MessageSquare,
  Smartphone,
  Lock,
  ShieldCheck,
  X,
  Camera,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const Settings = () => {
  const { isAuthenticated, user } = useAuth();
  const isRestricted = !isAuthenticated;

  // Notification state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    orderUpdates: true,    // always on
    securityAlerts: true    // always on
  });

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    dataSharing: false
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true
  });

  // User data
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

  // Avatar modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load profile
  useEffect(() => {
    if (isAuthenticated) {
      const loadProfile = async () => {
        try {
          const response = await apiFetch('/auth/profile');
          const u = response.user;
          setUserData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            birthDate: u.birth_date ? u.birth_date.split('T')[0] : '',
            address: u.address || '',
            city: u.city || '',
            country: u.country || 'Angola',
            company: u.company || '',
            position: u.position || '',
            avatar: u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          });
        } catch (err) {
          console.error('Erro ao carregar perfil:', err);
        }
      };
      loadProfile();
      checkPushSupport();
    }
  }, [isAuthenticated]);

  // ===== PUSH NOTIFICATIONS =====
  const checkPushSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    if (supported) {
      setPushSubscribed(Notification.permission === 'granted');
      setPushStatus(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'idle');
    }
  };

  const requestPushNotifications = async () => {
    if (!pushSupported) return;
    setPushStatus('requesting');
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushSubscribed(true);
        setPushStatus('granted');
        setNotifications(prev => ({ ...prev, push: true }));
      } else {
        setPushSubscribed(false);
        setPushStatus('denied');
        setNotifications(prev => ({ ...prev, push: false }));
      }
    } catch {
      setPushStatus('error');
    }
  };

  const revokePushNotifications = () => {
    // Cannot programmatically revoke, user must do it in browser settings
    setPushStatus('idle');
    setPushSubscribed(false);
    setNotifications(prev => ({ ...prev, push: false }));
  };

  // ===== TOGGLE HANDLERS =====
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
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  // ===== SAVE =====
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

  // ===== AVATAR UPLOAD =====
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

  // ===== TOGGLE COMPONENT =====
  const Toggle = ({ enabled, disabled, onChange }: { enabled: boolean; disabled?: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // ===== LOCKED TOGGLE (always on, visual only) =====
  const LockedToggle = () => (
    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 opacity-70 cursor-not-allowed">
      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
      <Lock className="h-3 w-3 text-white absolute -left-5 top-1/2 -translate-y-1/2" />
    </div>
  );

  return (
    <div className="min-h-screen page-content bg-gray-50">

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* ===== CANAIS DE NOTIFICAÇÃO ===== */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Canais de Notificação</h2>
                  <p className="text-gray-600">Escolha como deseja receber comunicações</p>
                </div>
              </div>

              <div className="space-y-4">

                {/* EMAIL (non-editable, info) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">E-mail</h3>
                      <p className="text-sm text-gray-500">
                        Cotações, avisos de segurança e notificações importantes do sistema são enviadas por e-mail.
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{userData.email || '—'}</p>
                    </div>
                  </div>
                  <Toggle enabled={notifications.email} disabled onChange={() => {}} />
                </div>

                {/* SMS */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">SMS</h3>
                      <p className="text-sm text-gray-500">Receber notificações por SMS no seu telemóvel.</p>
                    </div>
                  </div>
                  <Toggle
                    enabled={notifications.sms}
                    disabled={isRestricted}
                    onChange={() => handleNotificationChange('sms')}
                  />
                </div>

                {/* PUSH */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Smartphone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Notificações Push</h3>
                      {pushStatus === 'granted' ? (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Ativas — receberá notificações do navegador
                        </p>
                      ) : pushStatus === 'denied' ? (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Bloqueadas — autorize nas configurações do navegador
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Ative para receber notificações diretamente no navegador.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {pushStatus === 'granted' ? (
                      <button
                        onClick={revokePushNotifications}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                      >
                        Desativar
                      </button>
                    ) : pushStatus === 'denied' ? (
                      <span className="text-xs text-gray-400">Bloqueado</span>
                    ) : (
                      <button
                        onClick={requestPushNotifications}
                        disabled={!pushSupported || isRestricted}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >
                        Ativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== TIPOS DE NOTIFICAÇÃO ===== */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                  <Bell className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tipos de Notificação</h2>
                  <p className="text-gray-600">Escolha quais tipos de notificação deseja receber</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Order Updates (always on) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Atualizações de Pedidos</h3>
                    <p className="text-sm text-gray-500">Estado dos seus pedidos e entregas.</p>
                  </div>
                  <LockedToggle />
                </div>

                {/* Security Alerts (always on) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Alertas de Segurança</h3>
                    <p className="text-sm text-gray-500">Avisos críticos sobre a segurança da sua conta.</p>
                  </div>
                  <LockedToggle />
                </div>

                {/* Marketing / Newsletter */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing & Newsletter</h3>
                    <p className="text-sm text-gray-500">
                      {userData.email
                        ? `Assinar newsletter com ${userData.email}`
                        : 'Assinar newsletter com o e-mail da sua conta'}
                    </p>
                  </div>
                  <Toggle
                    enabled={notifications.marketing}
                    disabled={isRestricted}
                    onChange={() => handleNotificationChange('marketing')}
                  />
                </div>
              </div>
            </div>

            {/* ===== PRIVACIDADE ===== */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Privacidade</h2>
                  <p className="text-gray-600">Controle sua visibilidade e compartilhamento de dados</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {key === 'profileVisibility' && 'Perfil Público'}
                        {key === 'showEmail' && 'Mostrar E-mail'}
                        {key === 'showPhone' && 'Mostrar Telefone'}
                        {key === 'allowMessages' && 'Permitir Mensagens'}
                        {key === 'dataSharing' && 'Compartilhar Dados'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {key === 'profileVisibility' && 'Tornar perfil visível para outros usuários'}
                        {key === 'showEmail' && 'Exibir e-mail no perfil público'}
                        {key === 'showPhone' && 'Exibir telefone no perfil público'}
                        {key === 'allowMessages' && 'Permitir que outros usuários enviem mensagens'}
                        {key === 'dataSharing' && 'Compartilhar dados para melhorar o serviço'}
                      </p>
                    </div>
                    <Toggle
                      enabled={value}
                      disabled={isRestricted}
                      onChange={() => handlePrivacyChange(key)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ===== SEGURANÇA ===== */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 ${isRestricted ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 rounded-xl mr-4">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
                  <p className="text-gray-600">Proteja a sua conta</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Two Factor */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Autenticação de Dois Fatores</h3>
                    <p className="text-sm text-gray-500">Adicione uma camada extra de segurança à sua conta.</p>
                  </div>
                  <Toggle
                    enabled={security.twoFactor}
                    disabled={isRestricted}
                    onChange={() => handleSecurityChange('twoFactor')}
                  />
                </div>

                {/* Login Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Alertas de Login</h3>
                    <p className="text-sm text-gray-500">Receber alertas quando alguém fizer login na sua conta.</p>
                  </div>
                  <Toggle
                    enabled={security.loginAlerts}
                    disabled={isRestricted}
                    onChange={() => handleSecurityChange('loginAlerts')}
                  />
                </div>
              </div>
            </div>

            {/* ===== ACTION BUTTONS ===== */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
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

      {/* ===== AVATAR MODAL ===== */}
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
