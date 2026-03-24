import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// ===== TIPOS =====
export type ModalIcon = 'alert' | 'success' | 'info' | 'help' | 'custom' | null;

export type ModalAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'link';
  external?: boolean;
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Conteúdo
  title: string;
  description: string | React.ReactNode;
  
  // Ícone (opcional)
  icon?: ModalIcon;
  iconColor?: string;        // ex: 'yellow-600'
  iconBackground?: string;   // ex: 'yellow-100'
  
  // Ações (botões/links)
  actions?: ModalAction[];
  
  // Customização
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Acessibilidade
  ariaLabel?: string;
}

// ===== MAPEAMENTO DE ÍCONES =====
const ICON_MAP: Record<NonNullable<ModalIcon>, React.ElementType> = {
  alert: AlertCircle,
  success: CheckCircle,
  info: Info,
  help: HelpCircle,
};

// ===== COMPONENTE =====
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon = 'info',
  iconColor = 'blue-600',
  iconBackground = 'blue-100',
  actions = [],
  showCloseButton = true,
  closeOnOverlayClick = true,
  maxWidth = 'md',
  ariaLabel,
}) => {
  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mapeamento de larguras
  const widthClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  // Renderizar ícone
  const renderIcon = () => {
    if (!icon) return null;
    
    const IconComponent = icon === 'custom' ? null : ICON_MAP[icon];
    
    if (icon === 'custom') return null;
    
    return (
      <div className={`bg-${iconBackground} w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6`}>
        <IconComponent className={`h-8 w-8 text-${iconColor}`} />
      </div>
    );
  };

  // Renderizar ação
  const renderAction = (action: ModalAction, index: number) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`,
      secondary: `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`,
      link: `${baseClasses} text-blue-600 hover:text-blue-800 underline bg-transparent p-0`,
    };

    if (action.href) {
      if (action.external) {
        return (
          <a
            key={index}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={variants[action.variant || 'primary']}
            onClick={action.onClick || onClose}
          >
            {action.label}
          </a>
        );
      }
      return (
        <Link
          key={index}
          to={action.href}
          className={variants[action.variant || 'primary']}
          onClick={action.onClick || onClose}
        >
          {action.label}
        </Link>
      );
    }

    return (
      <button
        key={index}
        onClick={action.onClick || onClose}
        className={variants[action.variant || 'primary']}
      >
        {action.label}
      </button>
    );
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Conteúdo */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ${widthClasses[maxWidth]} w-full mx-auto p-8 z-10 animate-[fadeIn_0.2s_ease-out]`}>
        
        {/* Botão Fechar */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="text-center">
          {/* Ícone */}
          {renderIcon()}

          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h3>

          {/* Descrição */}
          <div className="text-gray-600 mb-6">
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>

          {/* Ações */}
          {actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {actions.map((action, index) => renderAction(action, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;